const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Submitter is required']
  },
  title: {
    type: String,
    required: [true, 'Submission title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Submission description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  workSummary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Work summary cannot exceed 1000 characters']
  },
  deliverables: [{
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ['file', 'url', 'text', 'code'],
      default: 'file'
    },
    files: [{
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
      downloadCount: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now }
    }],
    content: String, // For text deliverables
    url: String,     // For URL deliverables
    codeSnippet: {   // For code deliverables
      language: String,
      code: String,
      repository: String
    }
  }],
  status: {
    type: String,
    enum: [
      'submitted',    // Just submitted
      'under-review', // Being reviewed by admin
      'approved',     // Approved by admin
      'rejected',     // Rejected, needs revision
      'delivered',    // Delivered to client
      'client-approved', // Approved by client
      'revision-requested' // Client/Admin requested changes
    ],
    default: 'submitted'
  },
  hoursWorked: {
    type: Number,
    required: [true, 'Hours worked is required'],
    min: [0.1, 'Hours worked must be at least 0.1'],
    max: [500, 'Hours worked cannot exceed 500']
  },
  timeline: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    approvedAt: Date,
    deliveredAt: Date,
    clientApprovedAt: Date
  },
  reviews: [{
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reviews.reviewerModel',
      required: true
    },
    reviewerModel: {
      type: String,
      enum: ['Admin', 'User'], // Admin or Client
      required: true
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'needs-revision'],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: { type: String, required: true },
    suggestions: String,
    reviewedAt: { type: Date, default: Date.now },
    attachments: [String]
  }],
  revisions: [{
    version: { type: Number, required: true },
    reason: { type: String, required: true },
    changes: { type: String, required: true },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'revisions.requesterModel'
    },
    requesterModel: {
      type: String,
      enum: ['Admin', 'User']
    },
    requestedAt: { type: Date, default: Date.now },
    completedAt: Date,
    isCompleted: { type: Boolean, default: false }
  }],
  quality: {
    score: { type: Number, min: 0, max: 100 },
    checklist: [{
      item: { type: String, required: true },
      checked: { type: Boolean, default: false },
      notes: String
    }],
    codeQuality: {
      complexity: { type: String, enum: ['low', 'medium', 'high'] },
      maintainability: { type: Number, min: 0, max: 10 },
      documentation: { type: Number, min: 0, max: 10 },
      testCoverage: { type: Number, min: 0, max: 100 }
    }
  },
  clientDelivery: {
    deliveryMethod: {
      type: String,
      enum: ['download', 'email', 'cloud-link', 'repository'],
      default: 'download'
    },
    downloadLink: String,
    downloadExpiry: Date,
    cloudLink: String,
    emailSent: { type: Boolean, default: false },
    emailSentAt: Date,
    clientDownloaded: { type: Boolean, default: false },
    clientDownloadedAt: Date,
    accessCount: { type: Number, default: 0 }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    fileCount: { type: Number, default: 0 },
    totalFileSize: { type: Number, default: 0 },
    technologies: [String],
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex', 'advanced'],
      default: 'moderate'
    },
    isPublic: { type: Boolean, default: false }, // Can be used in portfolio
    portfolioNotes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current version
submissionSchema.virtual('currentVersion').get(function() {
  return this.revisions.length + 1;
});

// Virtual for approval status
submissionSchema.virtual('isApproved').get(function() {
  return ['approved', 'delivered', 'client-approved'].includes(this.status);
});

// Virtual for delivery status
submissionSchema.virtual('isDelivered').get(function() {
  return ['delivered', 'client-approved'].includes(this.status);
});

// Index for better performance
submissionSchema.index({ assignment: 1 });
submissionSchema.index({ submittedBy: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ 'timeline.submittedAt': -1 });
submissionSchema.index({ 'quality.score': -1 });

// Pre-save middleware to calculate metadata
submissionSchema.pre('save', function(next) {
  // Calculate file count and total size
  let fileCount = 0;
  let totalSize = 0;
  
  this.deliverables.forEach(deliverable => {
    if (deliverable.files && deliverable.files.length > 0) {
      fileCount += deliverable.files.length;
      deliverable.files.forEach(file => {
        totalSize += file.size || 0;
      });
    }
  });
  
  this.metadata.fileCount = fileCount;
  this.metadata.totalFileSize = totalSize;
  
  next();
});

// Method to add review
submissionSchema.methods.addReview = function(reviewedBy, reviewerModel, status, feedback, rating = null, suggestions = '', attachments = []) {
  this.reviews.push({
    reviewedBy,
    reviewerModel,
    status,
    rating,
    feedback,
    suggestions,
    attachments
  });
  
  // Update submission status based on review
  if (status === 'approved') {
    this.status = 'approved';
    this.timeline.approvedAt = new Date();
  } else if (status === 'rejected' || status === 'needs-revision') {
    this.status = 'revision-requested';
  }
  
  return this.save();
};

// Method to request revision
submissionSchema.methods.requestRevision = function(reason, changes, requestedBy, requesterModel) {
  const version = this.revisions.length + 1;
  this.revisions.push({
    version,
    reason,
    changes,
    requestedBy,
    requesterModel
  });
  this.status = 'revision-requested';
  return this.save();
};

// Method to approve for delivery
submissionSchema.methods.approveForDelivery = function() {
  this.status = 'approved';
  this.timeline.approvedAt = new Date();
  return this.save();
};

// Method to mark as delivered
submissionSchema.methods.markAsDelivered = function(deliveryMethod = 'download', additionalData = {}) {
  this.status = 'delivered';
  this.timeline.deliveredAt = new Date();
  this.clientDelivery.deliveryMethod = deliveryMethod;
  
  // Set additional delivery data
  Object.keys(additionalData).forEach(key => {
    if (this.clientDelivery[key] !== undefined) {
      this.clientDelivery[key] = additionalData[key];
    }
  });
  
  return this.save();
};

// Method to track client download
submissionSchema.methods.trackClientDownload = function() {
  this.clientDelivery.clientDownloaded = true;
  this.clientDelivery.clientDownloadedAt = new Date();
  this.clientDelivery.accessCount += 1;
  return this.save();
};

// Method to increment file download count
submissionSchema.methods.incrementDownloadCount = function(deliverableIndex, fileIndex) {
  if (this.deliverables[deliverableIndex] && this.deliverables[deliverableIndex].files[fileIndex]) {
    this.deliverables[deliverableIndex].files[fileIndex].downloadCount += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find by assignment
submissionSchema.statics.findByAssignment = function(assignmentId) {
  return this.find({ assignment: assignmentId }).sort({ 'timeline.submittedAt': -1 });
};

// Static method to find by employee
submissionSchema.statics.findByEmployee = function(employeeId, status = null) {
  const query = { submittedBy: employeeId };
  if (status) query.status = status;
  return this.find(query).populate('assignment').sort({ 'timeline.submittedAt': -1 });
};

// Static method to get submission statistics
submissionSchema.statics.getStatistics = function(employeeId = null) {
  const matchQuery = employeeId ? { submittedBy: mongoose.Types.ObjectId(employeeId) } : {};
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgHours: { $avg: '$hoursWorked' },
        avgQuality: { $avg: '$quality.score' },
        totalFiles: { $sum: '$metadata.fileCount' }
      }
    }
  ]);
};

// Static method to find submissions pending review
submissionSchema.statics.findPendingReview = function() {
  return this.find({
    status: { $in: ['submitted', 'under-review'] }
  }).populate('assignment submittedBy').sort({ 'timeline.submittedAt': 1 });
};

module.exports = mongoose.model('Submission', submissionSchema);
