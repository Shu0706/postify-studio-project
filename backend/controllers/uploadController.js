const { File } = require('../models');
const { formatResponse } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/fileUpload');
const path = require('path');
const fs = require('fs').promises;

class UploadController {
  // Upload single file
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('No file provided', 400);
      }

      const { purpose, relatedId, relatedModel } = req.body;
      let fileUrl = '';
      let publicId = '';

      // Upload to Cloudinary if configured, otherwise use local storage
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const uploadResult = await uploadToCloudinary(req.file.path, {
            folder: `postify-studio/${purpose || 'general'}`,
            resource_type: 'auto'
          });
          
          fileUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
          
          // Delete local file after successful upload
          await fs.unlink(req.file.path);
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed:', cloudinaryError);
          // Fall back to local storage
          fileUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        // Use local storage
        fileUrl = `/uploads/${req.file.filename}`;
      }

      // Save file metadata to database
      const fileDoc = new File({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        publicId,
        uploadedBy: req.user._id,
        purpose: purpose || 'general',
        relatedId: relatedId || null,
        relatedModel: relatedModel || null
      });

      await fileDoc.save();

      res.status(201).json(formatResponse({
        file: fileDoc,
        url: fileUrl
      }, 'File uploaded successfully'));
    } catch (error) {
      // Clean up local file if upload fails
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete local file:', unlinkError);
        }
      }
      next(error);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new AppError('No files provided', 400);
      }

      const { purpose, relatedId, relatedModel } = req.body;
      const uploadedFiles = [];
      const failedUploads = [];

      for (const file of req.files) {
        try {
          let fileUrl = '';
          let publicId = '';

          // Upload to Cloudinary if configured
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            try {
              const uploadResult = await uploadToCloudinary(file.path, {
                folder: `postify-studio/${purpose || 'general'}`,
                resource_type: 'auto'
              });
              
              fileUrl = uploadResult.secure_url;
              publicId = uploadResult.public_id;
              
              // Delete local file after successful upload
              await fs.unlink(file.path);
            } catch (cloudinaryError) {
              console.error('Cloudinary upload failed for file:', file.filename, cloudinaryError);
              fileUrl = `/uploads/${file.filename}`;
            }
          } else {
            fileUrl = `/uploads/${file.filename}`;
          }

          // Save file metadata
          const fileDoc = new File({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: fileUrl,
            publicId,
            uploadedBy: req.user._id,
            purpose: purpose || 'general',
            relatedId: relatedId || null,
            relatedModel: relatedModel || null
          });

          await fileDoc.save();
          uploadedFiles.push({
            file: fileDoc,
            url: fileUrl
          });
        } catch (fileError) {
          failedUploads.push({
            filename: file.originalname,
            error: fileError.message
          });
          
          // Clean up local file
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete local file:', unlinkError);
          }
        }
      }

      res.status(201).json(formatResponse({
        uploadedFiles,
        failedUploads,
        totalUploaded: uploadedFiles.length,
        totalFailed: failedUploads.length
      }, `${uploadedFiles.length} files uploaded successfully`));
    } catch (error) {
      // Clean up all local files if batch upload fails
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Failed to delete local file:', unlinkError);
          }
        }
      }
      next(error);
    }
  }

  // Get file by ID
  async getFile(req, res, next) {
    try {
      const { id } = req.params;
      
      const file = await File.findById(id)
        .populate('uploadedBy', 'name email');
      
      if (!file) {
        throw new AppError('File not found', 404);
      }

      // Check if user has permission to view this file
      const canView = req.user._id.equals(file.uploadedBy._id) || 
                     req.user.role === 'admin' ||
                     (file.purpose === 'public');
      
      if (!canView) {
        throw new AppError('Access denied', 403);
      }

      res.json(formatResponse(file, 'File retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get user's files
  async getUserFiles(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        purpose, 
        mimetype, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;
      
      const query = { uploadedBy: req.user._id };
      
      if (purpose) {
        query.purpose = purpose;
      }
      
      if (mimetype) {
        query.mimetype = { $regex: mimetype, $options: 'i' };
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const files = await File.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('uploadedBy', 'name email')
        .exec();

      const total = await File.countDocuments(query);

      res.json(formatResponse({
        files,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Files retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Delete file
  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      
      const file = await File.findById(id);
      if (!file) {
        throw new AppError('File not found', 404);
      }

      // Check permissions
      const canDelete = req.user._id.equals(file.uploadedBy) || 
                       req.user.role === 'admin';
      
      if (!canDelete) {
        throw new AppError('Access denied', 403);
      }

      // Delete from Cloudinary if it was uploaded there
      if (file.publicId) {
        try {
          await deleteFromCloudinary(file.publicId);
        } catch (cloudinaryError) {
          console.error('Failed to delete from Cloudinary:', cloudinaryError);
        }
      } else {
        // Delete local file
        const filePath = path.join(process.cwd(), 'uploads', file.filename);
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Failed to delete local file:', unlinkError);
        }
      }

      // Remove from database
      await File.findByIdAndDelete(id);

      res.json(formatResponse(null, 'File deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get file stats (admin only)
  async getFileStats(req, res, next) {
    try {
      const totalFiles = await File.countDocuments();
      const totalSize = await File.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]);

      const filesByType = await File.aggregate([
        {
          $group: {
            _id: '$mimetype',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const filesByPurpose = await File.aggregate([
        {
          $group: {
            _id: '$purpose',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const recentUploads = await File.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('uploadedBy', 'name email');

      const stats = {
        totalFiles,
        totalSize: totalSize[0]?.totalSize || 0,
        filesByType,
        filesByPurpose,
        recentUploads
      };

      res.json(formatResponse(stats, 'File statistics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Serve static files (for local storage)
  async serveFile(req, res, next) {
    try {
      const { filename } = req.params;
      
      // Find file in database to check permissions
      const file = await File.findOne({ filename });
      if (!file) {
        throw new AppError('File not found', 404);
      }

      // Check if file is public or user has permission
      const canAccess = file.purpose === 'public' ||
                       req.user._id.equals(file.uploadedBy) ||
                       req.user.role === 'admin';
      
      if (!canAccess) {
        throw new AppError('Access denied', 403);
      }

      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new AppError('File not found on disk', 404);
      }

      // Set appropriate headers
      res.setHeader('Content-Type', file.mimetype);
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
