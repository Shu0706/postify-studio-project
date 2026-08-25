const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth, authorize } = require('../middlewares/auth');
const { validateMessage } = require('../middlewares/validation');

// All routes require authentication
router.use(auth);

// Get conversations
router.get('/conversations', messageController.getConversations);

// Get messages with specific user
router.get('/conversation/:otherUserId', messageController.getMessages);

// Send message
router.post('/send', validateMessage, messageController.sendMessage);

// Mark message as read
router.put('/:messageId/read', messageController.markAsRead);

// Mark conversation as read
router.put('/conversation/:otherUserId/read', messageController.markConversationAsRead);

// Get unread count
router.get('/unread-count', messageController.getUnreadCount);

// Search messages
router.get('/search', messageController.searchMessages);

// Delete message
router.delete('/:messageId', messageController.deleteMessage);

// Admin only routes
router.get('/admin/stats', authorize(['admin']), messageController.getChatStats);

module.exports = router;
