const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/methods', optionalAuth, PaymentController.getPaymentMethods);

// Webhook routes (no auth required - verified by signature)
router.post('/chapa/callback', PaymentController.chapaCallback);
router.post('/telebirr/notify', PaymentController.telebirrNotify);
router.post('/cbe/callback', PaymentController.cbeCallback);

// Payment verification routes
router.get('/chapa/verify/:txRef', PaymentController.verifyChapaPayment);
router.post('/paypal/capture/:orderId', PaymentController.capturePayPalPayment);

// Protected routes (require authentication)
router.post('/process', verifyToken, PaymentController.processPayment);
router.get('/:orderId/status', verifyToken, PaymentController.getPaymentStatus);

// Admin routes
router.post('/admin/methods', verifyToken, requireAdmin, PaymentController.createPaymentMethod);
router.put('/admin/methods/:methodId', verifyToken, requireAdmin, PaymentController.updatePaymentMethod);

module.exports = router;
