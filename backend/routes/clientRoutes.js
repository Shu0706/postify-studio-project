const express = require('express');
const router = express.Router();
const {
  getDashboard,
  requestService,
  getServiceRequests,
  getServiceRequest,
  updateServiceRequest,
  cancelServiceRequest,
  getNotifications,
  markNotificationRead,
  getDownloads,
  downloadSubmissionFile,
  getChatMessages,
  sendChatMessage,
  getClientProjects
} = require('../controllers/clientController');

const { auth, authorize, checkOwnership } = require('../middlewares/auth');
const {
  validateServiceRequest,
  validateMessage,
  validateObjectId,
  validatePagination
} = require('../middlewares/validation');
const { handleFileUpload, uploadMultiple } = require('../utils/fileUpload');

// All routes require client authentication
router.use(auth);
router.use(authorize('client'));

// Dashboard
router.get('/dashboard', getDashboard);

// Service requests
router.post('/request-service', 
  handleFileUpload(uploadMultiple('attachments', 5)),
  validateServiceRequest,
  requestService
);

router.get('/requests', validatePagination, getServiceRequests);
router.get('/requests/:id', validateObjectId('id'), getServiceRequest);
router.put('/requests/:id', validateObjectId('id'), updateServiceRequest);
router.delete('/requests/:id', validateObjectId('id'), cancelServiceRequest);

// Compact projects list for client dashboard
router.get('/projects', validatePagination, getClientProjects);

// Notifications
router.get('/notifications', validatePagination, getNotifications);
router.put('/notifications/:id/read', validateObjectId('id'), markNotificationRead);

// Downloads
router.get('/downloads', validatePagination, getDownloads);
router.get('/downloads/:submissionId/:deliverableIndex/:fileIndex', 
  validateObjectId('submissionId'),
  downloadSubmissionFile
);

// Chat
router.get('/chat/:conversationId', getChatMessages);
router.post('/chat/send', validateMessage, sendChatMessage);

module.exports = router;
