const Cart = require('../models/Cart');
const PricingService = require('../services/PricingService');
const InteractionService = require('../services/InteractionService');

class CartController {
    /**
     * Get user's cart with populated product details
     * GET /api/cart/:userId
     */
    async getCart(req, res) {
        try {
            const userId = req.params.userId;
            let cart = await Cart.findOne({ userId });

            if (!cart) {
                // Create empty cart if doesn't exist
                cart = new Cart({ userId, items: [] });
                await cart.save();
            }

            // Populate product details for each cart item
            const Product = require('../models/Product');
            const itemsWithProducts = await Promise.all(
                cart.items.map(async (item) => {
                    const product = await Product.findOne({ id: item.productId });
                    return {
                        ...item.toObject(),
                        product: product ? {
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            new_price: product.new_price,
                            old_price: product.old_price,
                            category: product.category,
                            available: product.stock > 0
                        } : null
                    };
                })
            );

            // Filter out items where product no longer exists
            const validItems = itemsWithProducts.filter(item => item.product !== null);

            res.json({
                success: true,
                data: {
                    ...cart.toObject(),
                    items: validItems
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update cart (add/update/remove items)
     * POST /api/cart
     * Body: { userId, items: [{ productId, quantity, price }], coupon }
     */
    async updateCart(req, res) {
        try {
            const { userId, items, coupon } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'userId is required'
                });
            }

            let cart = await Cart.findOne({ userId });

            if (!cart) {
                cart = new Cart({ userId, items: [], coupon: {} });
            }

            // Update items
            if (items) {
                cart.items = items;
            }

            // Update coupon
            if (coupon !== undefined) {
                cart.coupon = coupon;
            }

            await cart.save();

            // Track cart_add interactions for new items
            if (items && items.length > 0) {
                for (const item of items) {
                    await InteractionService.trackInteraction(
                        item.productId,
                        userId,
                        'cart_add'
                    );
                }
            }

            res.json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Add item to cart
     * POST /api/cart/:userId/items
     * Body: { productId, quantity, price }
     */
    async addItem(req, res) {
        try {
            const userId = req.params.userId;
            const { productId, quantity, price } = req.body;

            console.log('Add item request:', { userId, productId, quantity, price });

            if (!productId || !price) {
                return res.status(400).json({
                    success: false,
                    error: 'productId and price are required'
                });
            }

            let cart = await Cart.findOne({ userId });

            if (!cart) {
                console.log('Creating new cart for user:', userId);
                cart = new Cart({ userId, items: [] });
            }

            await cart.addItem(productId, price, quantity || 1);
            console.log('Item added successfully:', cart);

            // Track interaction (fire and forget - don't block cart operation)
            InteractionService.trackInteraction(productId, userId, 'cart_add').catch(err => {
                console.error('Error tracking interaction (non-blocking):', err.message);
            });

            // Populate product details
            const Product = require('../models/Product');
            const itemsWithProducts = await Promise.all(
                cart.items.map(async (item) => {
                    const product = await Product.findOne({ id: item.productId });
                    return {
                        ...item.toObject(),
                        product: product ? {
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            new_price: product.new_price,
                            old_price: product.old_price,
                            category: product.category,
                            available: product.stock > 0
                        } : null
                    };
                })
            );

            res.json({
                success: true,
                data: {
                    ...cart.toObject(),
                    items: itemsWithProducts.filter(item => item.product !== null)
                }
            });
        } catch (error) {
            console.error('Add item error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/:userId/items/:productId
     */
    async removeItem(req, res) {
        try {
            const userId = req.params.userId;
            const productId = parseInt(req.params.productId);

            const cart = await Cart.findOne({ userId });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    error: 'Cart not found'
                });
            }

            await cart.removeItem(productId);

            res.json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update item quantity
     * PATCH /api/cart/:userId/items/:productId
     * Body: { quantity }
     */
    async updateItemQuantity(req, res) {
        try {
            const userId = req.params.userId;
            const productId = parseInt(req.params.productId);
            const { quantity } = req.body;

            if (quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'quantity is required'
                });
            }

            const cart = await Cart.findOne({ userId });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    error: 'Cart not found'
                });
            }

            await cart.updateItemQuantity(productId, quantity);

            res.json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Apply coupon to cart
     * POST /api/cart/:userId/coupon
     * Body: { code, discountPercent, minPurchase, expiryDate }
     */
    async applyCoupon(req, res) {
        try {
            const userId = req.params.userId;
            const coupon = req.body;

            const cart = await Cart.findOne({ userId });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    error: 'Cart not found'
                });
            }

            cart.coupon = coupon;
            await cart.save();

            res.json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Calculate checkout total
     * POST /api/cart/checkout
     * Body: { userId, taxRate }
     */
    async calculateCheckout(req, res) {
        try {
            const { userId, taxRate } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'userId is required'
                });
            }

            const total = await PricingService.calculateCartTotal(
                userId,
                taxRate || 0.1
            );

            res.json({
                success: true,
                data: total
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Clear cart
     * DELETE /api/cart/:userId
     */
    async clearCart(req, res) {
        try {
            const userId = req.params.userId;

            const cart = await Cart.findOne({ userId });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    error: 'Cart not found'
                });
            }

            await cart.clearCart();

            res.json({
                success: true,
                message: 'Cart cleared successfully',
                data: cart
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Sync cart with frontend state
     * POST /api/cart/:userId/sync
     * Body: { frontendCart: { productId: quantity, ... } }
     */
    async syncCart(req, res) {
        try {
            const userId = req.params.userId;
            const { frontendCart } = req.body;

            console.log('🔄 Syncing cart for user:', userId);
            console.log('🔄 Frontend cart state:', frontendCart);

            let cart = await Cart.findOne({ userId });

            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }

            console.log('🔄 Backend cart before sync:', cart.items);

            // Clear existing cart and rebuild from frontend state
            cart.items = [];

            if (frontendCart) {
                const Product = require('../models/Product');

                for (const [productId, quantity] of Object.entries(frontendCart)) {
                    if (quantity > 0) {
                        const product = await Product.findOne({ id: parseInt(productId) });
                        if (product) {
                            cart.items.push({
                                productId: parseInt(productId),
                                quantity: parseInt(quantity),
                                price: product.new_price
                            });
                        }
                    }
                }
            }

            await cart.save();

            console.log('✅ Cart synced successfully:', cart.items);

            // Return populated cart
            const Product = require('../models/Product');
            const itemsWithProducts = await Promise.all(
                cart.items.map(async (item) => {
                    const product = await Product.findOne({ id: item.productId });
                    return {
                        ...item.toObject(),
                        product: product ? {
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            new_price: product.new_price,
                            old_price: product.old_price,
                            category: product.category,
                            available: product.stock > 0
                        } : null
                    };
                })
            );

            res.json({
                success: true,
                message: 'Cart synchronized successfully',
                data: {
                    ...cart.toObject(),
                    items: itemsWithProducts.filter(item => item.product !== null)
                }
            });
        } catch (error) {
            console.error('Sync cart error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new CartController();