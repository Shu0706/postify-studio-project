const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super-admin']
  },
  avatar: {
    type: String,
    default: null
  },
  permissions: [{
    type: String,
    enum: [
      'manage-users',
      'manage-employees', 
      'manage-services',
      'manage-assignments',
      'view-analytics',
      'manage-notifications',
      'manage-files',
      'system-settings'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: null },
    lockedUntil: { type: Date, default: null }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    dashboard: {
      layout: { type: String, default: 'default' },
      widgets: [{ type: String }]
    },
    timezone: { type: String, default: 'UTC' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set default permissions
adminSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  
  if (this.isSuperAdmin) {
    this.permissions = [
      'manage-users',
      'manage-employees', 
      'manage-services',
      'manage-assignments',
      'view-analytics',
      'manage-notifications',
      'manage-files',
      'system-settings'
    ];
  } else if (this.permissions.length === 0) {
    this.permissions = [
      'manage-users',
      'manage-employees', 
      'manage-services',
      'manage-assignments',
      'view-analytics'
    ];
  }
  
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
  return this.isSuperAdmin || this.permissions.includes(permission);
};

// Method to increment login attempts
adminSchema.methods.incrementLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes
  
  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = new Date();
  
  if (this.loginAttempts.count >= maxAttempts) {
    this.loginAttempts.lockedUntil = new Date(Date.now() + lockTime);
  }
  
  return this.save();
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts.count = 0;
  this.loginAttempts.lastAttempt = null;
  this.loginAttempts.lockedUntil = null;
  return this.save();
};

// Method to check if account is locked
adminSchema.methods.isLocked = function() {
  return this.loginAttempts.lockedUntil && this.loginAttempts.lockedUntil > new Date();
};

// Method to get public profile
adminSchema.methods.getPublicProfile = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  delete adminObject.loginAttempts;
  return adminObject;
};

// Static method to find by email
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('Admin', adminSchema);
