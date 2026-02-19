const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { verifyToken } = require('../middleware/auth');

// Validate cart before checkout
router.get('/validate', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });

        const validation = {
            hasItems: cart && cart.items.length > 0,
            itemCount: cart ? cart.items.length : 0,
            items: cart ? cart.items : [],
            isEmpty: !cart || cart.items.length === 0
        };

        res.json({
            success: true,
            data: validation
        });
    } catch (error) {
        console.error('Cart validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Error validating cart'
        });
    }
});

module.exports = router;