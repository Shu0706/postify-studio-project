const jwt = require('jsonwebtoken');
const { User, Employee, Admin } = require('../models');

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Debugging: log decoded token for tracing auth issues (kept minimal)
    if (process.env.NODE_ENV !== 'production') {
      console.info('[AUTH DEBUG] Decoded token:', { id: decoded.id, role: decoded.role });
    }
    
    // Find user based on role
    let user;
    switch (decoded.role) {
      case 'client':
        user = await User.findById(decoded.id).select('-password');
        break;
      case 'employee':
        user = await Employee.findById(decoded.id).select('-password');
        break;
      case 'admin':
        user = await Admin.findById(decoded.id).select('-password');
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid token role.'
        });
    }

    if (!user) {
      // Extra debug info when user lookup fails
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AUTH DEBUG] User lookup failed for decoded token:', decoded);
      }
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // Flatten roles in case an array was passed (e.g. authorize(['admin']))
    const allowedRoles = roles.flat ? roles.flat() : roles.reduce((acc, r) => acc.concat(r), []);

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Admin permission check
const checkAdminPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required.'
        });
      }

      const admin = await Admin.findById(req.user._id);
      if (!admin.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: `Permission '${permission}' required.`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed.'
      });
    }
  };
};

// Optional authentication (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      req.userRole = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    switch (decoded.role) {
      case 'client':
        user = await User.findById(decoded.id).select('-password');
        break;
      case 'employee':
        user = await Employee.findById(decoded.id).select('-password');
        break;
      case 'admin':
        user = await Admin.findById(decoded.id).select('-password');
        break;
    }

    if (user && user.isActive) {
      req.user = user;
      req.userRole = decoded.role;
    } else {
      req.user = null;
      req.userRole = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    req.userRole = null;
    next();
  }
};

// Resource ownership check
const checkOwnership = (Model, idParam = 'id', userField = 'user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      // Admin can access any resource
      if (req.userRole === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = resource[userField];
      if (!resourceUserId || resourceUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Ownership check failed.'
      });
    }
  };
};

// Account lock check (for admins)
const checkAccountLock = async (req, res, next) => {
  try {
    if (req.userRole === 'admin') {
      const admin = await Admin.findById(req.user._id);
      if (admin.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts.',
          lockedUntil: admin.loginAttempts.lockedUntil
        });
      }
    }
    next();
  } catch (error) {
    console.error('Account lock check error:', error);
    res.status(500).json({
      success: false,
      message: 'Account lock check failed.'
    });
  }
};

// API key authentication (for external integrations)
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required.'
      });
    }

    // In a real application, you would validate this against a database
    // For now, we'll use environment variable
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }

    req.isApiRequest = true;
    next();
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({
      success: false,
      message: 'API key authentication failed.'
    });
  }
};

module.exports = {
  auth,
  authorize,
  checkAdminPermission,
  optionalAuth,
  checkOwnership,
  checkAccountLock,
  apiKeyAuth
};
