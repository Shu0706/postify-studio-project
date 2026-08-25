import { toast } from 'react-toastify';

/**
 * Error handling utilities for Postify Studio
 * 
 * This file provides centralized error handling functions to ensure consistent
 * error management and reporting throughout the application.
 */

/**
 * Custom Error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Custom Error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Custom Error class for authentication errors
 */
export class AuthError extends Error {
  constructor(message, code = 'auth_error') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/**
 * Handles API errors consistently
 * @param {Error} error - The error object to handle
 * @param {boolean} showToast - Whether to show a toast notification
 * @param {Function} callback - Optional callback to execute after handling
 * @returns {Object} Error details object
 */
export const handleApiError = (error, showToast = true, callback = null) => {
  console.error('API Error:', error);
  
  let errorMessage = 'An unexpected error occurred. Please try again.';
  let errorDetails = {};
  let errorStatus = 500;
  
  // Handle different types of errors
  if (error instanceof ApiError) {
    errorMessage = error.message;
    errorDetails = error.data || {};
    errorStatus = error.status;
  } else if (error instanceof ValidationError) {
    errorMessage = error.message;
    errorDetails = error.errors;
  } else if (error instanceof AuthError) {
    errorMessage = error.message;
    // Handle auth errors specially (e.g., redirect to login)
    if (error.code === 'token_expired' || error.code === 'not_authenticated') {
      // Force logout or redirect to login page
      if (typeof window !== 'undefined') {
        // Clear auth data from local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login?session=expired';
        }, 1500);
      }
    }
  } else if (error.response) {
    // Axios or similar HTTP client error
    errorStatus = error.response.status;
    errorMessage = error.response.data?.message || errorMessage;
    errorDetails = error.response.data || {};
    
    // Special handling for common HTTP status codes
    switch (errorStatus) {
      case 400:
        errorMessage = error.response.data?.message || 'Invalid request. Please check your data.';
        break;
      case 401:
        errorMessage = 'Authentication required. Please log in again.';
        // Force logout or redirect to login page
        if (typeof window !== 'undefined') {
          // Clear auth data from local storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login?session=expired';
          }, 1500);
        }
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 422:
        errorMessage = error.response.data?.message || 'Validation error. Please check your data.';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = error.response.data?.message || errorMessage;
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = 'No response from server. Please check your connection.';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
  
  // Execute callback if provided
  if (callback && typeof callback === 'function') {
    callback(errorMessage, errorStatus, errorDetails);
  }
  
  return {
    message: errorMessage,
    status: errorStatus,
    details: errorDetails
  };
};

/**
 * Handles form validation errors consistently
 * @param {Object} errors - Object containing field-specific errors
 * @param {Function} setErrors - Function to set errors in form state
 * @param {boolean} showToast - Whether to show a toast notification
 * @returns {Object} Error details object
 */
export const handleFormErrors = (errors, setErrors = null, showToast = true) => {
  console.error('Form Validation Errors:', errors);
  
  // Show toast with summary of errors if enabled
  if (showToast) {
    const errorFields = Object.keys(errors);
    const errorMessage = errorFields.length > 1
      ? `Please correct the following fields: ${errorFields.join(', ')}`
      : `Please correct the ${errorFields[0]} field`;
    
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
  
  // Update form state with errors if setErrors function is provided
  if (setErrors && typeof setErrors === 'function') {
    setErrors(errors);
  }
  
  return errors;
};

/**
 * Validates form data against a schema
 * @param {Object} data - Form data to validate
 * @param {Object} schema - Validation schema rules
 * @returns {Object} Validation result with errors and isValid properties
 */
export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;
  
  // Simple validation example - replace with a robust validation library in production
  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];
    
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      isValid = false;
      continue;
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must be at most ${rules.maxLength} characters`;
      isValid = false;
      continue;
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} is invalid`;
      isValid = false;
      continue;
    }
    
    if (value && rules.match && data[rules.match] !== value) {
      errors[field] = `${field} does not match ${rules.match}`;
      isValid = false;
      continue;
    }
    
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value, data);
      if (customResult !== true) {
        errors[field] = customResult;
        isValid = false;
        continue;
      }
    }
  }
  
  return { isValid, errors };
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  login: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8
    }
  },
  signup: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
    },
    confirmPassword: {
      required: true,
      match: 'password',
      message: 'Passwords do not match'
    }
  },
  profile: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: 'Please enter a valid phone number'
    }
  },
  passwordUpdate: {
    currentPassword: {
      required: true
    },
    newPassword: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
    },
    confirmPassword: {
      required: true,
      match: 'newPassword',
      message: 'Passwords do not match'
    }
  }
};

export default {
  handleApiError,
  handleFormErrors,
  validateForm,
  validationSchemas,
  ApiError,
  ValidationError,
  AuthError
};
