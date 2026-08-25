const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth, authorize } = require('../middlewares/auth');
const { upload, uploadMultiple } = require('../utils/fileUpload');

// All routes require authentication
router.use(auth);

// Upload single file
router.post('/single', upload.single('file'), uploadController.uploadFile);

// Upload multiple files
router.post('/multiple', uploadMultiple, uploadController.uploadMultipleFiles);

// Get user's files
router.get('/my-files', uploadController.getUserFiles);

// Get file by ID
router.get('/:id', uploadController.getFile);

// Delete file
router.delete('/:id', uploadController.deleteFile);

// Admin only routes
router.get('/admin/stats', authorize(['admin']), uploadController.getFileStats);

// Serve static files (for local storage)
router.get('/serve/:filename', uploadController.serveFile);

module.exports = router;
