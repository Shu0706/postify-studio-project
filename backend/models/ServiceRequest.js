const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Request description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: [1000, 'Requirements cannot exceed 1000 characters']
  },
  budget: {
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'package'],
      default: 'fixed'
    }
  },
  timeline: {
    preferredStartDate: {
      type: Date,
      required: [true, 'Preferred start date is required']
    },
    expectedDeliveryDate: {
      type: Date,
      required: [true, 'Expected delivery date is required']
    },
    isUrgent: {
      type: Boolean,
      default: false
    }
  },
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: [
      'pending',      // Just submitted
      'reviewing',    // Admin is reviewing
      'quoted',       // Admin provided quote
      'approved',     // Client approved quote
      'assigned',     // Assigned to employee
      'in-progress',  // Work in progress
      'review',       // Submitted for review
      'revision',     // Needs revision
      'completed',    // Work completed
      'delivered',    // Delivered to client
      'cancelled',    // Cancelled
      'on-hold'       // Temporarily paused
    ],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  quote: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    breakdown: [{
      item: String,
      cost: Number,
      description: String
    }],
    validUntil: Date,
    quotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    quotedAt: Date,
    clientResponse: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'negotiating'],
      default: 'pending'
    },
    clientNotes: String
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'communication.fromModel',
      required: true
    },
    fromModel: {
      type: String,
      enum: ['User', 'Admin', 'Employee'],
      required: true
    },
    message: { type: String, required: true },
    attachments: [String],
    timestamp: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    source: { type: String, default: 'website' }, // website, referral, etc.
    clientIP: String,
    userAgent: String,
    utm: {
      source: String,
      medium: String,
      campaign: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for assignment
serviceRequestSchema.virtual('assignment', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'serviceRequest',
  justOne: true
});

// Index for better performance
serviceRequestSchema.index({ client: 1 });
serviceRequestSchema.index({ service: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ priority: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ 'timeline.expectedDeliveryDate': 1 });

// Pre-save middleware to update service metadata
serviceRequestSchema.post('save', async function() {
  if (this.isNew) {
    try {
      await mongoose.model('Service').findByIdAndUpdate(
        this.service,
        { $inc: { 'metadata.orders': 1 } }
      );
    } catch (error) {
      console.error('Error updating service metadata:', error);
    }
  }
});

// Method to add communication
serviceRequestSchema.methods.addCommunication = function(from, fromModel, message, attachments = [], isInternal = false) {
  this.communication.push({
    from,
    fromModel,
    message,
    attachments,
    isInternal
  });
  return this.save();
};

// Method to update status with optional note
serviceRequestSchema.methods.updateStatus = function(newStatus, note = '', updatedBy) {
  this.status = newStatus;
  
  if (note) {
    this.communication.push({
      from: updatedBy,
      fromModel: 'Admin', // Assuming status updates are typically by admin
      message: `Status updated to ${newStatus}. ${note}`,
      isInternal: true
    });
  }
  
  return this.save();
};

// Static method to find requests by status
serviceRequestSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find urgent requests
serviceRequestSchema.statics.findUrgent = function() {
  return this.find({
    $or: [
      { priority: 'urgent' },
      { 'timeline.isUrgent': true }
    ],
    status: { $nin: ['completed', 'delivered', 'cancelled'] }
  }).sort({ createdAt: -1 });
};

// Static method to get requests dashboard data
serviceRequestSchema.statics.getDashboardData = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$budget.amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
