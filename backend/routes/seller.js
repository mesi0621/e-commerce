const express = require('express');
const router = express.Router();
const SellerController = require('../controllers/SellerController');
const { verifyToken, requireSeller, requireAdmin } = require('../middleware/auth');

// All seller routes require authentication and seller role
router.use(verifyToken);

// Seller profile management
router.post('/profile', requireSeller, SellerController.createProfile);
router.get('/profile', requireSeller, SellerController.getOwnProfile);
router.put('/profile', requireSeller, SellerController.updateProfile);

// Seller earnings
router.get('/earnings', requireSeller, SellerController.getMyEarnings);

// Admin seller management
router.get('/admin/sellers', requireAdmin, SellerController.getAllSellers);
router.get('/admin/sellers/:sellerId', requireAdmin, SellerController.getSellerById);
router.post('/admin/sellers/:sellerId/approve', requireAdmin, SellerController.approveSeller);
router.post('/admin/sellers/:sellerId/deactivate', requireAdmin, SellerController.deactivateSeller);

module.exports = router;
