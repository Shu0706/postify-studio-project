const bcrypt = require('bcryptjs');
const { User, Employee, Admin } = require('../models');
const { generateToken, formatUserResponse, createSuccessResponse, createErrorResponse } = require('../utils/helpers');
const { sendWelcomeEmail, sendEmployeeCreatedEmail, sendClientRegistrationEmail } = require('../utils/mailer');

// Register new client
const registerClient = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json(createErrorResponse('User already exists with this email'));
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      company,
      metadata: {
        registrationIP: req.ip,
        userAgent: req.get('User-Agent'),
        referralSource: req.body.referralSource || 'direct'
      }
    });

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: 'client'
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
      
      // Send notification to admin about new client registration
      const admin = await Admin.findOne();
      if (admin && admin.email) {
        await sendClientRegistrationEmail(user, admin.email);
      }
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json(createSuccessResponse({
      token,
      user: formatUserResponse(user, 'client')
    }, 'Registration successful'));

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Registration failed'));
  }
};

// Login for all user types
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user in all collections
    let user = null;
    let role = null;

    // Check in User collection (clients)
    user = await User.findByEmail(email).select('+password');
    if (user) {
      role = 'client';
    }

    // Check in Employee collection if not found in User
    if (!user) {
      user = await Employee.findByEmail(email).select('+password');
      if (user) {
        role = 'employee';
      }
    }

    // Check in Admin collection if not found in Employee
    if (!user) {
      user = await Admin.findByEmail(email).select('+password');
      if (user) {
        role = 'admin';
      }
    }

    if (!user) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json(createErrorResponse('Account is deactivated'));
    }

    // For admin, check if account is locked
    if (role === 'admin' && user.isLocked()) {
      return res.status(423).json(createErrorResponse('Account is temporarily locked', 423, {
        lockedUntil: user.loginAttempts.lockedUntil
      }));
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed login attempts for admin
      if (role === 'admin') {
        await user.incrementLoginAttempts();
      }
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Reset login attempts for admin on successful login
    if (role === 'admin' && user.loginAttempts.count > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: role
    });

    res.json(createSuccessResponse({
      token,
      user: formatUserResponse(user, role)
    }, 'Login successful'));

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Login failed'));
  }
};

// Create employee account (Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      department,
      position,
      skills,
      phone,
      salary
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json(createErrorResponse('Employee already exists with this email'));
    }

    // Check if email exists in other collections
    const existingUser = await User.findByEmail(email);
    const existingAdmin = await Admin.findByEmail(email);
    
    if (existingUser || existingAdmin) {
      return res.status(400).json(createErrorResponse('Email already exists in the system'));
    }

    // Create new employee
    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      password,
      department,
      position,
      skills: skills || [],
      phone,
      salary: salary || { amount: 0, currency: 'USD' },
      createdBy: req.user._id
    });

    // Send employee creation email with credentials
    try {
      await sendEmployeeCreatedEmail(employee, password);
    } catch (emailError) {
      console.error('Employee creation email failed:', emailError);
      // Don't fail creation if email fails
    }

    res.status(201).json(createSuccessResponse({
      employee: formatUserResponse(employee, 'employee')
    }, 'Employee created successfully'));

  } catch (error) {
    console.error('Employee creation error:', error);
    res.status(500).json(createErrorResponse('Employee creation failed'));
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json(createSuccessResponse({
      user: formatUserResponse(req.user, req.userRole)
    }, 'Profile retrieved successfully'));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createErrorResponse('Failed to get profile'));
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'company', 'avatar'];
    
    // Filter allowed updates
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Determine the model based on user role
    let Model;
    switch (req.userRole) {
      case 'client':
        Model = User;
        break;
      case 'employee':
        Model = Employee;
        // Add employee-specific fields
        const employeeFields = ['department', 'position', 'skills'];
        employeeFields.forEach(field => {
          if (updates[field] !== undefined) {
            filteredUpdates[field] = updates[field];
          }
        });
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        return res.status(400).json(createErrorResponse('Invalid user role'));
    }

    const updatedUser = await Model.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json(createSuccessResponse({
      user: formatUserResponse(updatedUser, req.userRole)
    }, 'Profile updated successfully'));

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(createErrorResponse('Failed to update profile'));
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    let user;
    switch (req.userRole) {
      case 'client':
        user = await User.findById(req.user._id).select('+password');
        break;
      case 'employee':
        user = await Employee.findById(req.user._id).select('+password');
        break;
      case 'admin':
        user = await Admin.findById(req.user._id).select('+password');
        break;
    }

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(createErrorResponse('Current password is incorrect'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json(createSuccessResponse(null, 'Password changed successfully'));

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createErrorResponse('Failed to change password'));
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    // Since we're using the auth middleware, req.user is already available
    const newToken = generateToken({
      id: req.user._id,
      email: req.user.email,
      role: req.userRole
    });

    res.json(createSuccessResponse({
      token: newToken
    }, 'Token refreshed successfully'));

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json(createErrorResponse('Failed to refresh token'));
  }
};

// Logout (mainly for tracking purposes)
const logout = async (req, res) => {
  try {
    // In a JWT system, logout is mainly handled on the client side
    // Here we can log the logout event or update user's last activity
    
    res.json(createSuccessResponse(null, 'Logged out successfully'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(createErrorResponse('Logout failed'));
  }
};

// Verify token (for frontend token validation)
const verifyToken = async (req, res) => {
  try {
    // If we reach here, it means the token is valid (auth middleware passed)
    res.json(createSuccessResponse({
      valid: true,
      user: formatUserResponse(req.user, req.userRole)
    }, 'Token is valid'));
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json(createErrorResponse('Token verification failed'));
  }
};

// Deactivate account
const deactivateAccount = async (req, res) => {
  try {
    let Model;
    switch (req.userRole) {
      case 'client':
        Model = User;
        break;
      case 'employee':
        Model = Employee;
        break;
      case 'admin':
        Model = Admin;
        break;
    }

    await Model.findByIdAndUpdate(req.user._id, { isActive: false });

    res.json(createSuccessResponse(null, 'Account deactivated successfully'));

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json(createErrorResponse('Failed to deactivate account'));
  }
};

module.exports = {
  registerClient,
  login,
  createEmployee,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  verifyToken,
  deactivateAccount
};
