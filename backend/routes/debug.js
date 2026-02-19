const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const AuthUser = require('../models/AuthUser');

/**
 * Debug current user's cart
 * GET /api/debug/my-cart
 * Requires authentication
 */
router.get('/my-cart', auth, async (req, res) => {
    try {
        console.log('🔍 Debug request from user:', req.user);

        const user = await AuthUser.findById(req.user.userId);
        const cart = await Cart.findOne({ userId: req.user.userId });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                cart: cart ? {
                    id: cart._id,
                    userId: cart.userId,
                    itemCount: cart.items.length,
                    items: cart.items
                } : null,
                tokenUserId: req.user.userId
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Validate cart before checkout
 * GET /api/debug/validate-cart
 * Requires authentication
 */
router.get('/validate-cart', auth, async (req, res) => {
    try {
        const user = await AuthUser.findById(req.user.userId);
        const cart = await Cart.findOne({ userId: req.user.userId });

        const validation = {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            cart: {
                exists: !!cart,
                itemCount: cart ? cart.items.length : 0,
                isEmpty: !cart || cart.items.length === 0
            },
            canCheckout: cart && cart.items.length > 0
        };

        if (cart && cart.items.length > 0) {
            // Validate each item
            const Product = require('../models/Product');
            const itemValidation = [];

            for (const item of cart.items) {
                const product = await Product.findOne({ id: item.productId });
                itemValidation.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    productExists: !!product,
                    productName: product ? product.name : 'NOT FOUND',
                    stockAvailable: product ? product.stock : 0,
                    hasEnoughStock: product ? product.stock >= item.quantity : false
                });
            }

            validation.items = itemValidation;
            validation.allItemsValid = itemValidation.every(item =>
                item.productExists && item.hasEnoughStock
            );
        }

        res.json({
            success: true,
            data: validation
        });
    } catch (error) {
        console.error('Cart validation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;