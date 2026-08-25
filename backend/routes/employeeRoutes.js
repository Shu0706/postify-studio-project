const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { auth, authorize } = require('../middlewares/auth');
const { validateAssignmentSubmission, validateProfileUpdate } = require('../middlewares/validation');

// All routes require authentication and employee role
router.use(auth);
router.use(authorize(['employee']));

// Dashboard
router.get('/dashboard', employeeController.getDashboard);

// Tasks
router.get('/tasks', employeeController.getTasks);
router.get('/tasks/:id', employeeController.getTask);

// Submissions
router.post('/submissions', validateAssignmentSubmission, employeeController.submitWork);
router.get('/submissions', employeeController.getSubmissions);
router.get('/submissions/:id', employeeController.getSubmissionById);
router.put('/submissions/:id', validateAssignmentSubmission, employeeController.updateSubmission);

// Profile
router.get('/profile', employeeController.getProfile);
router.put('/profile', validateProfileUpdate, employeeController.updateProfile);

// Notifications
router.get('/notifications', employeeController.getNotifications);
router.put('/notifications/:id/read', employeeController.markNotificationRead);

// Performance
router.get('/performance', employeeController.getPerformanceStats);

// Chat
router.get('/chat/conversations', employeeController.getChatConversations);
router.get('/chat/messages/:conversationId', employeeController.getChatMessages);

module.exports = router;
