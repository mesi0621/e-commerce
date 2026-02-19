const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');
const { verifyToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(verifyToken);

// Wishlist routes
router.get('/', WishlistController.getWishlist);
router.post('/items', WishlistController.addItem);
router.delete('/items/:productId', WishlistController.removeItem);
router.delete('/', WishlistController.clearWishlist);
router.post('/items/:productId/move-to-cart', WishlistController.moveToCart);

module.exports = router;
