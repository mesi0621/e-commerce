const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { verifyToken, requirePermission, requireAdmin, requireRole } = require('../middleware/auth');

// All order routes require authentication
router.use(verifyToken);

// Customer order routes
router.post('/', requirePermission('orders.create'), OrderController.createOrder);

// GET /api/orders - Role-based filtering (customers see own, sellers see their products, admin sees all)
router.get('/', OrderController.getUserOrders);

// GET /api/orders/:orderId - Role-based access control
router.get('/:orderId', OrderController.getOrderById);

// Cancel order (customers can cancel their own orders)
router.post('/:orderId/cancel', requirePermission('orders.cancel.own'), OrderController.cancelOrder);

// Payment confirmation (webhook - special handling)
router.post('/:orderId/confirm-payment', OrderController.confirmPayment);

// Admin order routes
router.get('/admin/all', requireAdmin, OrderController.getAllOrders);

// Update order status (admin, seller, or delivery staff)
router.put('/:orderId/status', requireRole(['admin', 'seller', 'delivery']), OrderController.updateOrderStatus);

// Seller order routes
router.get('/seller/my-orders', requireRole('seller'), OrderController.getSellerOrders);

module.exports = router;
