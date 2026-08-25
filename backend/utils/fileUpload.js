const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sanitizeFilename, getFileExtension, isAllowedFileType } = require('./helpers');

// Ensure upload directory exists
const ensureUploadDir = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Create subdirectories based on file type
    let subDir = 'others';
    if (file.mimetype.startsWith('image/')) subDir = 'images';
    else if (file.mimetype.startsWith('video/')) subDir = 'videos';
    else if (file.mimetype.startsWith('audio/')) subDir = 'audio';
    else if (file.mimetype === 'application/pdf') subDir = 'documents';
    else if (file.mimetype.includes('zip') || file.mimetype.includes('rar')) subDir = 'archives';
    
    const fullPath = path.join(uploadPath, subDir);
    ensureUploadDir(fullPath);
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const extension = getFileExtension(file.originalname);
    const sanitizedName = sanitizeFilename(file.originalname.replace(/\.[^/.]+$/, ''));
    const filename = `${sanitizedName}_${uniqueId}.${extension}`;
    
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  try {
    // Check if file type is allowed
    const allowedTypes = req.allowedFileTypes || [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      // Documents
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      // Archives
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      // Media
      'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg',
      // Code files
      'text/javascript', 'text/css', 'text/html',
      'application/json', 'application/xml'
    ];

    if (!isAllowedFileType(file.mimetype, allowedTypes)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }

    // Additional validation based on file extension
    const extension = getFileExtension(file.originalname);
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'];
    
    if (dangerousExtensions.includes(extension)) {
      return cb(new Error(`File extension .${extension} is not allowed for security reasons`), false);
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Single file upload
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Mixed file upload (different field names)
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Handle file upload with error handling
const handleFileUpload = (uploadType) => {
  return (req, res, next) => {
    uploadType(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size allowed is 10MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Process uploaded files and save to database
const processUploadedFiles = async (files, uploadedBy, uploaderModel, relatedTo = null, relatedModel = null) => {
  const File = require('../models/File');
  const processedFiles = [];

  // Handle both single file and array of files
  const fileArray = Array.isArray(files) ? files : [files];

  for (const file of fileArray) {
    try {
      console.log('Processing file:', file.originalname);
      
      // Extract metadata (optional, with error handling)
      let metadata = {};
      try {
        metadata = await extractFileMetadata(file);
      } catch (metadataError) {
        console.warn('Failed to extract metadata for file:', file.originalname, metadataError.message);
        // Continue without metadata
      }

      // Create file record in database
      const fileRecord = await File.create({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy,
        uploaderModel,
        relatedTo,
        relatedModel,
        metadata
      });

      processedFiles.push(fileRecord);
      console.log('File processed successfully:', fileRecord._id);
    } catch (error) {
      console.error('Error processing file:', file.originalname, error);
      // Clean up file if database save fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error; // Re-throw to stop the request
    }
  }

  return processedFiles;
};

// Extract metadata from uploaded file
const extractFileMetadata = async (file) => {
  const metadata = {};

  try {
    // For images, extract dimensions
    if (file.mimetype.startsWith('image/')) {
      try {
        const sharp = require('sharp');
        const imageMetadata = await sharp(file.path).metadata();
        metadata.dimensions = {
          width: imageMetadata.width,
          height: imageMetadata.height
        };
      } catch (sharpError) {
        console.warn('Sharp not available or failed to extract image metadata:', sharpError.message);
        // Continue without image metadata
      }
    }

    // Generate checksum
    try {
      const crypto = require('crypto');
      const fileBuffer = fs.readFileSync(file.path);
      metadata.checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');
    } catch (cryptoError) {
      console.warn('Failed to generate checksum:', cryptoError.message);
    }

  } catch (error) {
    console.error('Error extracting file metadata:', error);
    // Return empty metadata instead of throwing
  }

  return metadata;
};

// Upload to cloud storage
const uploadToCloud = async (filePath, options = {}) => {
  try {
    const cloudResult = await uploadToCloudinary(filePath, options.folder);
    
    // Delete local file after successful cloud upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return cloudResult;
  } catch (error) {
    console.error('Cloud upload failed:', error);
    throw error;
  }
};

// Delete file from storage
const deleteFile = async (filePath, isCloudFile = false) => {
  try {
    if (isCloudFile) {
      const { deleteFromCloudinary } = require('../config/cloudinary');
      await deleteFromCloudinary(filePath); // filePath is publicId for cloud files
    } else {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file URL
const getFileUrl = (file) => {
  if (file.url) {
    // Cloud storage URL
    return file.url;
  } else {
    // Local storage URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${path.basename(file.path)}`;
  }
};

// Validate file before upload
const validateFile = (file, options = {}) => {
  const errors = [];

  // Check file size
  const maxSize = options.maxSize || parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }

  // Check filename
  if (file.originalname.length > 255) {
    errors.push('Filename is too long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Clean up temporary files
const cleanupTempFiles = (files) => {
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  });
};

// Generate thumbnail for images
const generateThumbnail = async (imagePath, thumbnailPath, size = { width: 200, height: 200 }) => {
  try {
    const sharp = require('sharp');
    await sharp(imagePath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

// Virus scan placeholder (integrate with actual antivirus API)
const scanForVirus = async (filePath) => {
  try {
    // Placeholder for virus scanning
    // You can integrate with services like ClamAV, VirusTotal API, etc.
    
    // For now, return clean status
    return {
      isClean: true,
      scanDate: new Date(),
      details: 'File is clean'
    };
  } catch (error) {
    console.error('Virus scan error:', error);
    return {
      isClean: false,
      scanDate: new Date(),
      details: 'Scan failed',
      error: error.message
    };
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleFileUpload,
  processUploadedFiles,
  extractFileMetadata,
  uploadToCloud,
  deleteFile,
  getFileUrl,
  validateFile,
  cleanupTempFiles,
  generateThumbnail,
  scanForVirus,
  ensureUploadDir
};
