const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { verifyToken, optionalAuth, requirePermission, requireRole, requireAdmin } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/', ProductController.getAll);
router.get('/search', ProductController.search);
router.get('/popular', ProductController.getPopular);
router.get('/trending', ProductController.getTrending);
router.get('/personalized/:userId', ProductController.getPersonalized);

// Admin routes
router.get('/admin/pending', verifyToken, requireAdmin, ProductController.getPendingProducts);
router.post('/:id/approve', verifyToken, requireAdmin, ProductController.approveProduct);
router.put('/:id/reject', verifyToken, requireAdmin, ProductController.rejectProduct);

// Seller routes
router.get('/seller/my-products', verifyToken, requireRole('seller'), ProductController.getSellerProducts);

// Product details (optional auth for tracking)
router.get('/:id', optionalAuth, ProductController.getById);
router.get('/:id/recommendations', ProductController.getRecommendations);
router.get('/:id/stats', ProductController.getStats);

// Protected routes (seller or admin)
router.post('/', verifyToken, requirePermission('products.create'), ProductController.create);
router.put('/:id', verifyToken, requirePermission('products.update.own'), ProductController.update);
router.delete('/:id', verifyToken, requirePermission('products.delete.own'), ProductController.delete);

module.exports = router;
