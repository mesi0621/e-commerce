const express = require('express');
const router = express.Router();
const DeliveryController = require('../controllers/DeliveryController');
const { verifyToken, requireAdmin, requireRole } = require('../middleware/auth');

// All delivery routes require authentication
router.use(verifyToken);

// Admin routes - Delivery management
router.post('/assign', requireAdmin, DeliveryController.assignDelivery);
router.post('/:orderId/unassign', requireAdmin, DeliveryController.unassignDelivery);
router.get('/admin/all', requireAdmin, DeliveryController.getAllDeliveries);
router.get('/staff/available', requireAdmin, DeliveryController.getAvailableDeliveryStaff);

// Delivery staff routes
router.get('/my-deliveries', requireRole('delivery'), DeliveryController.getMyDeliveries);
router.get('/:orderId', requireRole('delivery'), DeliveryController.getDeliveryById);
router.put('/:orderId/status', requireRole('delivery'), DeliveryController.updateDeliveryStatus);

module.exports = router;
