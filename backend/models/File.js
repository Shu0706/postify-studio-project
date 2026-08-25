const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  url: {
    type: String,
    trim: true
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  category: {
    type: String,
    enum: [
      'document',    // PDFs, DOCs, etc.
      'image',       // JPG, PNG, etc.
      'video',       // MP4, AVI, etc.
      'audio',       // MP3, WAV, etc.
      'archive',     // ZIP, RAR, etc.
      'code',        // JS, HTML, CSS, etc.
      'design',      // PSD, AI, etc.
      'other'
    ],
    required: [true, 'File category is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'uploaderModel',
    required: [true, 'Uploader is required']
  },
  uploaderModel: {
    type: String,
    enum: ['User', 'Employee', 'Admin'],
    required: [true, 'Uploader model is required']
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['ServiceRequest', 'Assignment', 'Submission', 'Message', 'User', 'Employee']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemporary: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: {
    type: Date,
    default: null
  },
  downloadHistory: [{
    downloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'downloadHistory.downloaderModel'
    },
    downloaderModel: {
      type: String,
      enum: ['User', 'Employee', 'Admin', 'Anonymous']
    },
    downloadedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }],
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // For audio/video files
    pages: Number,    // For PDF files
    encoding: String,
    compression: String,
    checksum: String,
    virusScanStatus: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'error'],
      default: 'pending'
    },
    virusScanDate: Date
  },
  cloudStorage: {
    provider: {
      type: String,
      enum: ['local', 'cloudinary', 'aws-s3', 'google-cloud'],
      default: 'local'
    },
    publicId: String,    // For Cloudinary
    bucket: String,      // For AWS S3/Google Cloud
    region: String,      // For AWS S3
    etag: String,        // For AWS S3
    versionId: String    // For versioned storage
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  access: {
    permissions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'access.permissions.userModel'
      },
      userModel: {
        type: String,
        enum: ['User', 'Employee', 'Admin']
      },
      permission: {
        type: String,
        enum: ['read', 'download', 'edit', 'delete'],
        default: 'read'
      },
      grantedAt: { type: Date, default: Date.now },
      grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'access.permissions.granterModel'
      },
      granterModel: {
        type: String,
        enum: ['Admin', 'System']
      }
    }],
    public: {
      canView: { type: Boolean, default: false },
      canDownload: { type: Boolean, default: false },
      passwordProtected: { type: Boolean, default: false },
      password: String,
      expiryDate: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for formatted size
fileSchema.virtual('sizeFormatted').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for file type icon
fileSchema.virtual('iconType').get(function() {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  const codeTypes = ['js', 'html', 'css', 'php', 'py', 'java', 'cpp'];
  
  const ext = this.extension;
  
  if (imageTypes.includes(ext)) return 'image';
  if (documentTypes.includes(ext)) return 'document';
  if (videoTypes.includes(ext)) return 'video';
  if (audioTypes.includes(ext)) return 'audio';
  if (archiveTypes.includes(ext)) return 'archive';
  if (codeTypes.includes(ext)) return 'code';
  return 'file';
});

// Index for better performance
fileSchema.index({ uploadedBy: 1, uploaderModel: 1 });
fileSchema.index({ relatedTo: 1, relatedModel: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ isArchived: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ downloadCount: -1 });
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
fileSchema.index({ tags: 1 });

// Text index for search
fileSchema.index({
  originalName: 'text',
  description: 'text',
  tags: 'text'
});

// Pre-save middleware to set category based on mimetype
fileSchema.pre('save', function(next) {
  if (this.isNew && !this.category) {
    const mimetype = this.mimetype.toLowerCase();
    
    if (mimetype.startsWith('image/')) {
      this.category = 'image';
    } else if (mimetype.startsWith('video/')) {
      this.category = 'video';
    } else if (mimetype.startsWith('audio/')) {
      this.category = 'audio';
    } else if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) {
      this.category = 'document';
    } else if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive')) {
      this.category = 'archive';
    } else if (mimetype.includes('javascript') || mimetype.includes('css') || mimetype.includes('html')) {
      this.category = 'code';
    } else {
      this.category = 'other';
    }
  }
  next();
});

// Method to increment download count
fileSchema.methods.incrementDownload = function(downloadedBy = null, downloaderModel = null, ipAddress = null, userAgent = null) {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  
  if (downloadedBy) {
    this.downloadHistory.push({
      downloadedBy,
      downloaderModel,
      ipAddress,
      userAgent
    });
  }
  
  return this.save();
};

// Method to check access permission
fileSchema.methods.hasPermission = function(userId, userModel, permission = 'read') {
  // If file is public and permission is read, allow access
  if (this.isPublic && permission === 'read') {
    return true;
  }
  
  // Check if user is the uploader
  if (this.uploadedBy.toString() === userId.toString() && this.uploaderModel === userModel) {
    return true;
  }
  
  // Check specific permissions
  const userPermission = this.access.permissions.find(p => 
    p.user && p.user.toString() === userId.toString() && 
    p.userModel === userModel
  );
  
  if (userPermission) {
    const permissionHierarchy = ['read', 'download', 'edit', 'delete'];
    const userPermissionLevel = permissionHierarchy.indexOf(userPermission.permission);
    const requiredPermissionLevel = permissionHierarchy.indexOf(permission);
    return userPermissionLevel >= requiredPermissionLevel;
  }
  
  return false;
};

// Method to grant permission
fileSchema.methods.grantPermission = function(userId, userModel, permission, grantedBy, granterModel) {
  // Remove existing permission for this user
  this.access.permissions = this.access.permissions.filter(p => 
    !(p.user && p.user.toString() === userId.toString() && p.userModel === userModel)
  );
  
  // Add new permission
  this.access.permissions.push({
    user: userId,
    userModel,
    permission,
    grantedBy,
    granterModel
  });
  
  return this.save();
};

// Method to archive file
fileSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Method to restore from archive
fileSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

// Static method to find by uploader
fileSchema.statics.findByUploader = function(uploaderId, uploaderModel, options = {}) {
  const { category, isArchived = false, limit = 50, skip = 0 } = options;
  
  const query = { 
    uploadedBy: uploaderId, 
    uploaderModel,
    isArchived 
  };
  
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find by related entity
fileSchema.statics.findByRelated = function(relatedId, relatedModel) {
  return this.find({ 
    relatedTo: relatedId, 
    relatedModel,
    isArchived: false 
  }).sort({ createdAt: -1 });
};

// Static method to search files
fileSchema.statics.searchFiles = function(searchTerm, options = {}) {
  const { category, uploadedBy, uploaderModel, limit = 20 } = options;
  
  const query = {
    isArchived: false,
    $text: { $search: searchTerm }
  };
  
  if (category) query.category = category;
  if (uploadedBy) {
    query.uploadedBy = uploadedBy;
    query.uploaderModel = uploaderModel;
  }
  
  return this.find(query)
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit);
};

// Static method to get storage statistics
fileSchema.statics.getStorageStats = function(uploaderId = null, uploaderModel = null) {
  const matchQuery = uploaderId ? { 
    uploadedBy: uploaderId, 
    uploaderModel,
    isArchived: false 
  } : { isArchived: false };
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgSize: { $avg: '$size' },
        totalDownloads: { $sum: '$downloadCount' }
      }
    },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: '$count' },
        totalStorage: { $sum: '$totalSize' },
        categories: {
          $push: {
            category: '$_id',
            count: '$count',
            totalSize: '$totalSize',
            avgSize: '$avgSize',
            totalDownloads: '$totalDownloads'
          }
        }
      }
    }
  ]);
};

// Static method to cleanup expired files
fileSchema.statics.cleanupExpired = function() {
  return this.find({
    isTemporary: true,
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('File', fileSchema);
