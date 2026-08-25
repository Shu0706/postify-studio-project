const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');

const { auth, authorize, checkAdminPermission } = require('../middlewares/auth');
const {
  validateUserRegistration,
  validateLogin,
  validateEmployeeCreation,
  validateProfileUpdate,
  validatePasswordChange
} = require('../middlewares/validation');

// Public routes
router.post('/signup', validateUserRegistration, registerClient);
router.post('/login', validateLogin, login);

// Protected routes - require authentication
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validateProfileUpdate, updateProfile);
router.put('/password', auth, validatePasswordChange, changePassword);
router.post('/refresh', auth, refreshToken);
router.post('/logout', auth, logout);
router.get('/verify', auth, verifyToken);
router.delete('/deactivate', auth, deactivateAccount);

// Admin only routes
router.post('/admin/create-employee', 
  auth, 
  authorize('admin'), 
  checkAdminPermission('manage-employees'),
  validateEmployeeCreation, 
  createEmployee
);

module.exports = router;
