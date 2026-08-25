const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
    default: 'employee',
    enum: ['employee']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  workload: {
    current: { type: Number, default: 0 },
    maximum: { type: Number, default: 10 }
  },
  performance: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    completedTasks: { type: Number, default: 0 },
    onTimeDelivery: { type: Number, default: 0 }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    timezone: { type: String, default: 'UTC' }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for assigned tasks
employeeSchema.virtual('assignedTasks', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'assignedTo'
});

// Index for better performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate employee ID
employeeSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
employeeSchema.methods.getPublicProfile = function() {
  const employeeObject = this.toObject();
  delete employeeObject.password;
  delete employeeObject.salary;
  return employeeObject;
};

// Static method to find by email
employeeSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find available employees by department
employeeSchema.statics.findAvailableByDepartment = function(department) {
  return this.find({
    department,
    isActive: true,
    'workload.current': { $lt: this.workload.maximum }
  }).sort({ 'workload.current': 1 });
};

module.exports = mongoose.model('Employee', employeeSchema);
