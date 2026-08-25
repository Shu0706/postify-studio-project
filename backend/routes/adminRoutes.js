const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middlewares/auth');
const { 
  validateAssignmentCreation, 
  validateSubmissionReview, 
  validateBulkNotification,
  validateProfileUpdate 
} = require('../middlewares/validation');

// All routes require authentication and admin role
router.use(auth);
router.use(authorize(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Employee Management
router.get('/employees', adminController.getEmployees);
router.post('/employees', adminController.createEmployee);
router.get('/employees/:id', adminController.getEmployeeById);
router.put('/employees/:id', validateProfileUpdate, adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);

// Client Management
router.get('/clients', adminController.getClients);
router.post('/clients', adminController.createClient);
router.get('/clients/:id', adminController.getClientById);

// Service Requests Management
router.get('/service-requests', adminController.getServiceRequests);
router.get('/service-requests/:id', adminController.getServiceRequestById);
router.put('/service-requests/:id/status', adminController.updateServiceRequestStatus);

// Task Assignment
router.post('/assignments', validateAssignmentCreation, adminController.assignTask);
router.get('/assignments', adminController.getAssignments);
router.put('/assignments/:id', adminController.updateAssignment);

// Submissions Management
router.get('/submissions', adminController.getSubmissions);
router.put('/submissions/:id/review', validateSubmissionReview, adminController.reviewSubmission);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationAsRead);
router.post('/notifications/bulk', validateBulkNotification, adminController.sendBulkNotification);

// Service Management
router.get('/services', adminController.getServices);
router.post('/services', adminController.createService);
router.get('/services/:id', adminController.getServiceById);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

module.exports = router;
