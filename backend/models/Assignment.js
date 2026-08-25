const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service request is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee assignment is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Assigning admin is required']
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: [
      'assigned',     // Just assigned
      'accepted',     // Employee accepted
      'declined',     // Employee declined
      'in-progress',  // Work in progress
      'paused',       // Temporarily paused
      'submitted',    // Submitted for review
      'revision',     // Needs revision
      'approved',     // Approved by admin
      'completed',    // Fully completed
      'cancelled'     // Cancelled
    ],
    default: 'assigned'
  },
  timeline: {
    assignedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    startedAt: Date,
    submittedAt: Date,
    completedAt: Date,
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    estimatedHours: {
      type: Number,
      min: [0.5, 'Estimated hours must be at least 0.5'],
      max: [200, 'Estimated hours cannot exceed 200']
    }
  },
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%']
    },
    milestones: [{
      title: { type: String, required: true },
      description: String,
      completed: { type: Boolean, default: false },
      completedAt: Date,
      dueDate: Date
    }],
    hoursWorked: {
      type: Number,
      default: 0,
      min: [0, 'Hours worked cannot be negative']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  deliverables: [{
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ['file', 'url', 'text', 'code'],
      default: 'file'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    content: String, // For text deliverables
    url: String,     // For URL deliverables
    completedAt: Date
  }],
  feedback: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'feedback.fromModel',
      required: true
    },
    fromModel: {
      type: String,
      enum: ['Admin', 'User'], // Admin or Client
      required: true
    },
    message: { type: String, required: true },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    timestamp: { type: Date, default: Date.now },
    attachments: [String]
  }],
  revisions: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    isResolved: { type: Boolean, default: false }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium'
    },
    clientVisible: {
      type: Boolean,
      default: false // Whether client can see this assignment
    },
    billable: {
      type: Boolean,
      default: true
    },
    department: String,
    tools: [String] // Tools/software required
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
assignmentSchema.virtual('isOverdue').get(function() {
  return this.timeline.dueDate < new Date() && !['completed', 'cancelled'].includes(this.status);
});

// Virtual for days remaining
assignmentSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const dueDate = new Date(this.timeline.dueDate);
  const diffTime = dueDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for better performance
assignmentSchema.index({ assignedTo: 1 });
assignmentSchema.index({ serviceRequest: 1 });
assignmentSchema.index({ assignedBy: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ priority: 1 });
assignmentSchema.index({ 'timeline.dueDate': 1 });
assignmentSchema.index({ 'timeline.assignedAt': -1 });

// Pre-save middleware to update employee workload
assignmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      await mongoose.model('Employee').findByIdAndUpdate(
        this.assignedTo,
        { $inc: { 'workload.current': 1 } }
      );
    } catch (error) {
      console.error('Error updating employee workload:', error);
    }
  }
  next();
});

// Post-save middleware to update progress timestamp
assignmentSchema.pre('save', function(next) {
  if (this.isModified('progress.percentage') || this.isModified('progress.milestones')) {
    this.progress.lastUpdated = new Date();
  }
  next();
});

// Method to update progress
assignmentSchema.methods.updateProgress = function(percentage, hoursWorked = 0) {
  this.progress.percentage = Math.min(100, Math.max(0, percentage));
  this.progress.hoursWorked += hoursWorked;
  this.progress.lastUpdated = new Date();
  
  // Auto-update status based on progress
  if (percentage === 100 && this.status === 'in-progress') {
    this.status = 'submitted';
    this.timeline.submittedAt = new Date();
  }
  
  return this.save();
};

// Method to add feedback
assignmentSchema.methods.addFeedback = function(from, fromModel, message, rating = null, attachments = []) {
  this.feedback.push({
    from,
    fromModel,
    message,
    rating,
    attachments
  });
  return this.save();
};

// Method to request revision
assignmentSchema.methods.requestRevision = function(requestedBy, reason, description) {
  this.revisions.push({
    requestedBy,
    reason,
    description
  });
  this.status = 'revision';
  return this.save();
};

// Method to complete milestone
assignmentSchema.methods.completeMilestone = function(milestoneIndex) {
  if (this.progress.milestones[milestoneIndex]) {
    this.progress.milestones[milestoneIndex].completed = true;
    this.progress.milestones[milestoneIndex].completedAt = new Date();
    
    // Update overall progress based on completed milestones
    const totalMilestones = this.progress.milestones.length;
    const completedMilestones = this.progress.milestones.filter(m => m.completed).length;
    this.progress.percentage = Math.round((completedMilestones / totalMilestones) * 100);
    this.progress.lastUpdated = new Date();
  }
  
  return this.save();
};

// Static method to find assignments by employee
assignmentSchema.statics.findByEmployee = function(employeeId, status = null) {
  const query = { assignedTo: employeeId };
  if (status) query.status = status;
  return this.find(query).populate('serviceRequest').sort({ 'timeline.dueDate': 1 });
};

// Static method to find overdue assignments
assignmentSchema.statics.findOverdue = function() {
  return this.find({
    'timeline.dueDate': { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  }).populate('assignedTo serviceRequest');
};

// Static method to get assignment statistics
assignmentSchema.statics.getStatistics = function(employeeId = null) {
  const matchQuery = employeeId ? { assignedTo: mongoose.Types.ObjectId(employeeId) } : {};
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgHours: { $avg: '$progress.hoursWorked' },
        avgProgress: { $avg: '$progress.percentage' }
      }
    }
  ]);
};

module.exports = mongoose.model('Assignment', assignmentSchema);
