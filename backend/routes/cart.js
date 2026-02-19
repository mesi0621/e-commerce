const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

// Cart routes
router.get('/:userId', CartController.getCart);
router.post('/', CartController.updateCart);
router.post('/:userId/items', CartController.addItem);
router.delete('/:userId/items/:productId', CartController.removeItem);
router.patch('/:userId/items/:productId', CartController.updateItemQuantity);
router.post('/:userId/coupon', CartController.applyCoupon);
router.post('/checkout', CartController.calculateCheckout);
router.delete('/:userId', CartController.clearCart);
router.post('/:userId/sync', CartController.syncCart);

module.exports = router;
