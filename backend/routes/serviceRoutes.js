const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth, authorize } = require('../middlewares/auth');
const { validateServiceCreation, validateServiceUpdate } = require('../middlewares/validation');

// Public routes (no authentication required)
router.get('/', serviceController.getAllServices);
router.get('/categories', serviceController.getCategories);
router.get('/featured', serviceController.getFeaturedServices);
router.get('/popular', serviceController.getPopularServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (authentication required)
router.use(auth);

// Admin only routes
router.post('/', authorize(['admin']), validateServiceCreation, serviceController.createService);
router.put('/:id', authorize(['admin']), validateServiceUpdate, serviceController.updateService);
router.delete('/:id', authorize(['admin']), serviceController.deleteService);

module.exports = router;
