const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: [true, 'Conversation ID is required'],
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: [true, 'Sender is required']
  },
  senderModel: {
    type: String,
    enum: ['User', 'Employee', 'Admin'],
    required: [true, 'Sender model is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    enum: ['User', 'Employee', 'Admin']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'audio', 'video', 'link', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    thumbnail: String, // For images/videos
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  originalContent: String, // Store original content if edited
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'deletedByModel'
  },
  deletedByModel: {
    type: String,
    enum: ['User', 'Employee', 'Admin']
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'readBy.userModel',
      required: true
    },
    userModel: {
      type: String,
      enum: ['User', 'Employee', 'Admin'],
      required: true
    },
    readAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reactions.userModel',
      required: true
    },
    userModel: {
      type: String,
      enum: ['User', 'Employee', 'Admin'],
      required: true
    },
    emoji: { type: String, required: true },
    reactedAt: { type: Date, default: Date.now }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'mentions.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Employee', 'Admin']
    },
    name: String
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    messageId: String, // For tracking external email/SMS
    threadId: String,  // For grouping related messages
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'system'],
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reply count
messageSchema.virtual('replyCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'replyTo',
  count: true
});

// Virtual for formatted timestamp
messageSchema.virtual('timeFormatted').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMinutes > 0) return `${diffMinutes}m`;
  return 'now';
});

// Index for better performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, senderModel: 1 });
messageSchema.index({ recipient: 1, recipientModel: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ 'metadata.threadId': 1 });

// Text index for search
messageSchema.index({
  content: 'text'
});

// Pre-save middleware to handle edits
messageSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
    if (!this.originalContent) {
      // Store original content on first edit
      this.originalContent = this.content;
    }
  }
  next();
});

// Method to mark as read by user
messageSchema.methods.markAsReadBy = function(userId, userModel) {
  const existingRead = this.readBy.find(r => 
    r.user.toString() === userId.toString() && r.userModel === userModel
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      userModel: userModel,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, userModel, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.userModel === userModel)
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    userModel: userModel,
    emoji: emoji,
    reactedAt: new Date()
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, userModel) {
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.userModel === userModel)
  );
  
  return this.save();
};

// Method to soft delete
messageSchema.methods.softDelete = function(deletedBy, deletedByModel) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deletedByModel = deletedByModel;
  return this.save();
};

// Method to edit content
messageSchema.methods.editContent = function(newContent) {
  if (!this.originalContent) {
    this.originalContent = this.content;
  }
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Static method to find conversation messages
messageSchema.statics.findByConversation = function(conversationId, options = {}) {
  const { limit = 50, skip = 0, includeDeleted = false } = options;
  
  const query = { conversationId };
  if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }
  
  return this.find(query)
    .populate('sender', 'firstName lastName avatar')
    .populate('replyTo', 'content sender createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to search messages
messageSchema.statics.searchMessages = function(conversationId, searchTerm, options = {}) {
  const { limit = 20 } = options;
  
  return this.find({
    conversationId,
    isDeleted: { $ne: true },
    $text: { $search: searchTerm }
  })
  .populate('sender', 'firstName lastName avatar')
  .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
  .limit(limit);
};

// Static method to get conversation statistics
messageSchema.statics.getConversationStats = function(conversationId) {
  return this.aggregate([
    { $match: { conversationId, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        totalAttachments: { $sum: { $size: '$attachments' } },
        participants: { $addToSet: { user: '$sender', model: '$senderModel' } },
        firstMessage: { $min: '$createdAt' },
        lastMessage: { $max: '$createdAt' },
        messageTypes: { $push: '$messageType' }
      }
    }
  ]);
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = function(userId, userModel) {
  return this.countDocuments({
    recipient: userId,
    recipientModel: userModel,
    isDeleted: { $ne: true },
    readBy: {
      $not: {
        $elemMatch: {
          user: userId,
          userModel: userModel
        }
      }
    }
  });
};

// Static method to mark conversation as read
messageSchema.statics.markConversationAsRead = function(conversationId, userId, userModel) {
  return this.updateMany(
    {
      conversationId,
      isDeleted: { $ne: true },
      readBy: {
        $not: {
          $elemMatch: {
            user: userId,
            userModel: userModel
          }
        }
      }
    },
    {
      $push: {
        readBy: {
          user: userId,
          userModel: userModel,
          readAt: new Date()
        }
      }
    }
  );
};

module.exports = mongoose.model('Message', messageSchema);
