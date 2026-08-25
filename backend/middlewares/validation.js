const { body, param, query, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('🚫 VALIDATION FAILED - Detailed error report:');
    console.log('📋 Request body received:', JSON.stringify(req.body, null, 2));
    console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('� Request headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer token present' : 'No auth token'
    });
    console.log('🌐 Request URL:', req.originalUrl);
    console.log('📊 Request method:', req.method);
    
    // Enhanced error details
    errors.array().forEach((error, index) => {
      console.log(`🔴 Error ${index + 1}:`, {
        field: error.path || error.param,
        message: error.msg,
        receivedValue: error.value,
        location: error.location
      });
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      debug: {
        receivedFields: Object.keys(req.body),
        bodySize: JSON.stringify(req.body).length
      }
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Employee creation validation
const validateEmployeeCreation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('department')
    .isIn(['content-writing', 'social-media', 'web-development', 'design', 'seo', 'marketing'])
    .withMessage('Please provide a valid department'),
  
  body('position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Service request validation
const validateServiceRequest = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('service')
    .isMongoId()
    .withMessage('Please provide a valid service ID'),
  
  body('budget.amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Budget amount must be a positive number'),
  
  body('budget.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR'])
    .withMessage('Currency must be USD, EUR, GBP, or INR'),
  
  body('timeline.preferredStartDate')
    .isISO8601()
    .withMessage('Please provide a valid preferred start date'),
  
  body('timeline.expectedDeliveryDate')
    .isISO8601()
    .withMessage('Please provide a valid expected delivery date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.timeline.preferredStartDate);
      const deliveryDate = new Date(value);
      // Allow delivery date to be the same as or after start date
      if (deliveryDate < startDate) {
        throw new Error('Delivery date must be on or after start date');
      }
      return true;
    }),
  
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Requirements cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Assignment creation validation
const validateAssignmentCreation = [
  body('serviceRequestId')
    .isMongoId()
    .withMessage('Valid service request ID is required'),
  
  body('employeeId')
    .isMongoId()
    .withMessage('Valid employee ID is required'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Assignment submission validation (for employees submitting work)
const validateAssignmentSubmission = [
  body('assignmentId')
    .isMongoId()
    .withMessage('Valid assignment ID is required'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('deliverables')
    .optional()
    .isArray()
    .withMessage('Deliverables must be an array'),
  
  body('deliverables.*')
    .if(body('deliverables').exists())
    .isMongoId()
    .withMessage('Each deliverable must be a valid file ID'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// General submission validation
const validateSubmission = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('files')
    .optional()
    .isArray()
    .withMessage('Files must be an array'),
  
  body('files.*')
    .if(body('files').exists())
    .isMongoId()
    .withMessage('Each file must be a valid file ID'),
  
  handleValidationErrors
];

// Submission review validation
const validateSubmissionReview = [
  body('status')
    .isIn(['approved', 'rejected', 'needs_revision'])
    .withMessage('Status must be one of: approved, rejected, needs_revision'),
  
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
  
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Bulk notification validation
const validateBulkNotification = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message is required and cannot exceed 1000 characters'),
  
  body('type')
    .optional()
    .isIn(['announcement', 'reminder', 'update', 'warning'])
    .withMessage('Type must be one of: announcement, reminder, update, warning'),
  
  body('recipients')
    .isObject()
    .withMessage('Recipients object is required'),
  
  body('recipients.type')
    .isIn(['all', 'role', 'specific'])
    .withMessage('Recipients type must be one of: all, role, specific'),
  
  body('recipients.role')
    .if(body('recipients.type').equals('role'))
    .isIn(['admin', 'client', 'employee'])
    .withMessage('Role must be one of: admin, client, employee'),
  
  body('recipients.userIds')
    .if(body('recipients.type').equals('specific'))
    .isArray({ min: 1 })
    .withMessage('User IDs array is required for specific recipients'),
  
  body('recipients.userIds.*')
    .if(body('recipients.type').equals('specific'))
    .isMongoId()
    .withMessage('All user IDs must be valid'),
  
  body('sendEmail')
    .optional()
    .isBoolean()
    .withMessage('Send email must be a boolean'),
  
  handleValidationErrors
];

// Service creation validation
const validateServiceCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  
  body('deliveryTime')
    .isInt({ min: 1 })
    .withMessage('Delivery time must be a positive integer'),
  
  body('deliveryTimeUnit')
    .isIn(['hours', 'days', 'weeks'])
    .withMessage('Delivery time unit must be hours, days, or weeks'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('features.*')
    .if(body('features').exists())
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each feature must be between 1 and 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .if(body('tags').exists())
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Requirements cannot exceed 500 characters'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  
  handleValidationErrors
];

// Service update validation
const validateServiceUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  
  body('deliveryTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Delivery time must be a positive integer'),
  
  body('deliveryTimeUnit')
    .optional()
    .isIn(['hours', 'days', 'weeks'])
    .withMessage('Delivery time unit must be hours, days, or weeks'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('features.*')
    .if(body('features').exists())
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each feature must be between 1 and 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .if(body('tags').exists())
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Requirements cannot exceed 500 characters'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  
  handleValidationErrors
];

// Message validation
const validateMessage = [
  body('receiverId')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'audio', 'video'])
    .withMessage('Message type must be one of: text, image, file, audio, video'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  
  body('attachments.*')
    .if(body('attachments').exists())
    .isObject()
    .withMessage('Each attachment must be an object'),
  
  handleValidationErrors
];

// Notification validation
const validateNotification = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('type')
    .isIn([
      'info', 'success', 'warning', 'error', 'task-assigned', 'task-completed',
      'task-overdue', 'submission-received', 'submission-approved', 'submission-rejected',
      'payment-received', 'service-inquiry', 'message-received', 'system-update',
      'deadline-reminder', 'welcome', 'account-update'
    ])
    .withMessage('Invalid notification type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  body('actionUrl')
    .optional()
    .isURL()
    .withMessage('Action URL must be a valid URL'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (field) => [
  param(field)
    .isMongoId()
    .withMessage(`${field} must be a valid MongoDB ObjectId`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name'])
    .withMessage('Invalid sort field'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateEmployeeCreation,
  validateServiceRequest,
  validateAssignmentCreation,
  validateAssignmentSubmission,
  validateSubmission,
  validateSubmissionReview,
  validateBulkNotification,
  validateServiceCreation,
  validateServiceUpdate,
  validateMessage,
  validateNotification,
  validateProfileUpdate,
  validatePasswordChange,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};
