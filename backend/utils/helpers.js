const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate reset token (for password reset)
const generateResetToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Generate API key
const generateApiKey = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Format user response (remove sensitive data)
const formatUserResponse = (user, role) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  
  if (role === 'admin') {
    delete userObj.loginAttempts;
  }
  
  return {
    ...userObj,
    role
  };
};

// Generate employee ID
const generateEmployeeId = async (Employee) => {
  const count = await Employee.countDocuments();
  return `EMP${String(count + 1).padStart(4, '0')}`;
};

// Generate conversation ID
const generateConversationId = (userId1, userId2, prefix = 'conv') => {
  const sortedIds = [userId1, userId2].sort();
  return `${prefix}_${sortedIds[0]}_${sortedIds[1]}`;
};

// Calculate time difference in readable format
const getTimeAgo = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Format file size
const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Generate random string
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    score: 0,
    feedback: []
  };
  
  if (password.length < minLength) {
    strength.feedback.push(`Password must be at least ${minLength} characters long`);
  } else {
    strength.score += 1;
  }
  
  if (!hasUpperCase) {
    strength.feedback.push('Password must contain at least one uppercase letter');
  } else {
    strength.score += 1;
  }
  
  if (!hasLowerCase) {
    strength.feedback.push('Password must contain at least one lowercase letter');
  } else {
    strength.score += 1;
  }
  
  if (!hasNumbers) {
    strength.feedback.push('Password must contain at least one number');
  } else {
    strength.score += 1;
  }
  
  if (hasSpecialChar) {
    strength.score += 1;
  }
  
  return strength;
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

// Get file extension
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Check if file type is allowed
const isAllowedFileType = (mimetype, allowedTypes = []) => {
  if (allowedTypes.length === 0) {
    // Default allowed types
    allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed',
      'video/mp4', 'video/avi', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/mp3'
    ];
  }
  
  return allowedTypes.includes(mimetype);
};

// Generate pagination metadata
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

// Create error response
const createErrorResponse = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    message,
    statusCode,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  };
};

// Create success response
const createSuccessResponse = (data, message = 'Success', meta = null) => {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString()
  };
};

// Backwards-compatible aliases used across controllers
const formatResponse = createSuccessResponse;

// Alias for existing error response creator
const formatError = createErrorResponse;

// Simple calculateAnalytics placeholder (controllers may import this)
const calculateAnalytics = (data = {}) => {
  // If an array of items is provided, return simple counts; otherwise return the input
  if (Array.isArray(data)) {
    return {
      total: data.length
    };
  }
  return data;
};

// Sleep function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

module.exports = {
  generateToken,
  verifyToken,
  generateResetToken,
  generateApiKey,
  formatUserResponse,
  generateEmployeeId,
  generateConversationId,
  getTimeAgo,
  formatFileSize,
  generateRandomString,
  isValidEmail,
  isValidPhone,
  validatePasswordStrength,
  sanitizeFilename,
  getFileExtension,
  isAllowedFileType,
  getPaginationMeta,
  createErrorResponse,
  createSuccessResponse,
  // legacy/compat exports
  formatResponse,
  formatError,
  calculateAnalytics,
  sleep,
  debounce,
  throttle,
  deepClone,
  isEmpty
};
