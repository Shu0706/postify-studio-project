const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: [true, 'Recipient is required']
  },
  recipientModel: {
    type: String,
    enum: ['User', 'Employee', 'Admin'],
    required: [true, 'Recipient model is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Employee', 'Admin', 'System']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: [
      'info',           // General information
      'success',        // Success message
      'warning',        // Warning message
      'error',          // Error message
      'task-assigned',  // New task assigned
      'task-completed', // Task completed
      'task-overdue',   // Task is overdue
      'submission-received', // Work submitted
      'submission-approved', // Work approved
      'submission-rejected', // Work rejected
      'payment-received',    // Payment processed
      'service-inquiry',     // New service inquiry
      'message-received',    // New chat message
      'system-update',       // System update
      'deadline-reminder',   // Deadline approaching
      'welcome',            // Welcome message
      'account-update'      // Account settings updated
    ],
    required: [true, 'Notification type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityModel'
  },
  relatedEntityModel: {
    type: String,
    enum: ['ServiceRequest', 'Assignment', 'Submission', 'User', 'Employee']
  },
  metadata: {
    channel: {
      type: String,
      enum: ['in-app', 'email', 'sms', 'push'],
      default: 'in-app'
    },
    emailSent: { type: Boolean, default: false },
    emailSentAt: Date,
    smsSent: { type: Boolean, default: false },
    smsSentAt: Date,
    pushSent: { type: Boolean, default: false },
    pushSentAt: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    readAt: Date,
    clickedAt: Date,
    archivedAt: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  isGlobal: {
    type: Boolean,
    default: false // Whether this notification is for all users of a role
  },
  globalRoles: [{
    type: String,
    enum: ['client', 'employee', 'admin']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for formatted age
notificationSchema.virtual('ageFormatted').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Index for better performance
notificationSchema.index({ recipient: 1, recipientModel: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ isGlobal: 1, globalRoles: 1 });

// Pre-save middleware to set read timestamp
notificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.metadata.readAt) {
    this.metadata.readAt = new Date();
  }
  if (this.isModified('status') && this.status === 'archived' && !this.metadata.archivedAt) {
    this.metadata.archivedAt = new Date();
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.metadata.readAt = new Date();
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function() {
  this.metadata.clickedAt = new Date();
  if (this.status === 'unread') {
    this.status = 'read';
    this.metadata.readAt = new Date();
  }
  return this.save();
};

// Method to archive
notificationSchema.methods.archive = function() {
  this.status = 'archived';
  this.metadata.archivedAt = new Date();
  return this.save();
};

// Method to mark delivery status
notificationSchema.methods.markDelivered = function(channel, status = 'delivered') {
  this.metadata.deliveryStatus = status;
  
  switch (channel) {
    case 'email':
      this.metadata.emailSent = status === 'delivered';
      this.metadata.emailSentAt = new Date();
      break;
    case 'sms':
      this.metadata.smsSent = status === 'delivered';
      this.metadata.smsSentAt = new Date();
      break;
    case 'push':
      this.metadata.pushSent = status === 'delivered';
      this.metadata.pushSentAt = new Date();
      break;
  }
  
  return this.save();
};

// Static method to find by recipient
notificationSchema.statics.findByRecipient = function(recipientId, recipientModel, status = null) {
  const query = { 
    $or: [
      { recipient: recipientId, recipientModel },
      { isGlobal: true, globalRoles: recipientModel.toLowerCase() }
    ]
  };
  
  if (status) query.status = status;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(recipientId, recipientModel) {
  return this.find({
    $or: [
      { recipient: recipientId, recipientModel, status: 'unread' },
      { isGlobal: true, globalRoles: recipientModel.toLowerCase(), status: 'unread' }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to count unread notifications
notificationSchema.statics.countUnread = function(recipientId, recipientModel) {
  return this.countDocuments({
    $or: [
      { recipient: recipientId, recipientModel, status: 'unread' },
      { isGlobal: true, globalRoles: recipientModel.toLowerCase(), status: 'unread' }
    ]
  });
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create({
    recipient: data.recipient,
    recipientModel: data.recipientModel,
    sender: data.sender,
    senderModel: data.senderModel,
    title: data.title,
    message: data.message,
    type: data.type,
    priority: data.priority || 'medium',
    actionRequired: data.actionRequired || false,
    actionUrl: data.actionUrl,
    actionText: data.actionText,
    relatedEntity: data.relatedEntity,
    relatedEntityModel: data.relatedEntityModel,
    metadata: data.metadata || {}
  });
};

// Static method to create global notification
notificationSchema.statics.createGlobalNotification = function(roles, data) {
  return this.create({
    isGlobal: true,
    globalRoles: roles,
    sender: data.sender,
    senderModel: data.senderModel,
    title: data.title,
    message: data.message,
    type: data.type,
    priority: data.priority || 'medium',
    actionRequired: data.actionRequired || false,
    actionUrl: data.actionUrl,
    actionText: data.actionText,
    metadata: data.metadata || {}
  });
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
