const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Analytics routes
router.get('/', AnalyticsController.getAnalytics);
router.get('/inventory/alerts', AnalyticsController.getInventoryAlerts);
router.get('/products/export', AnalyticsController.exportProducts);

module.exports = router;
