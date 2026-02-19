const express = require('express');
const router = express.Router();
const RefundController = require('../controllers/RefundController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Customer routes
router.post('/request', verifyToken, RefundController.requestRefund);

// Admin routes
router.get('/admin/all', verifyToken, requireAdmin, RefundController.getAllRefunds);
router.post('/:orderId/approve', verifyToken, requireAdmin, RefundController.approveRefund);
router.post('/:orderId/reject', verifyToken, requireAdmin, RefundController.rejectRefund);

module.exports = router;
