const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/CouponController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public routes (require authentication)
router.post('/validate', verifyToken, CouponController.validateCoupon);
router.post('/use', verifyToken, CouponController.useCoupon);

// Admin routes
router.get('/', verifyToken, requireRole(['admin']), CouponController.getAllCoupons);
router.post('/', verifyToken, requireRole(['admin']), CouponController.createCoupon);
router.put('/:id', verifyToken, requireRole(['admin']), CouponController.updateCoupon);
router.delete('/:id', verifyToken, requireRole(['admin']), CouponController.deleteCoupon);

module.exports = router;
