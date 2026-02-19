const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

class WishlistController {
    /**
     * Get user's wishlist
     * GET /api/wishlist
     */
    async getWishlist(req, res) {
        try {
            let wishlist = await Wishlist.findOne({ userId: req.user.userId });

            if (!wishlist) {
                wishlist = new Wishlist({ userId: req.user.userId, items: [] });
                await wishlist.save();
            }

            // Populate product details
            const productIds = wishlist.items.map(item => item.productId);
            const products = await Product.find({ id: { $in: productIds } });

            const wishlistWithProducts = wishlist.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    productId: item.productId,
                    addedAt: item.addedAt,
                    product: product || null
                };
            }).filter(item => item.product !== null);

            res.json({
                success: true,
                data: {
                    userId: wishlist.userId,
                    items: wishlistWithProducts,
                    totalItems: wishlistWithProducts.length
                }
            });
        } catch (error) {
            console.error('Get wishlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching wishlist',
                message: error.message
            });
        }
    }

    /**
     * Add item to wishlist
     * POST /api/wishlist/items
     */
    async addItem(req, res) {
        try {
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    error: 'productId is required'
                });
            }

            // Check if product exists
            const product = await Product.findOne({ id: productId });
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            let wishlist = await Wishlist.findOne({ userId: req.user.userId });

            if (!wishlist) {
                wishlist = new Wishlist({ userId: req.user.userId, items: [] });
            }

            // Check if already in wishlist
            if (wishlist.hasItem(productId)) {
                return res.json({
                    success: true,
                    message: 'Product already in wishlist',
                    data: wishlist
                });
            }

            await wishlist.addItem(productId);

            res.json({
                success: true,
                message: 'Product added to wishlist',
                data: wishlist
            });
        } catch (error) {
            console.error('Add to wishlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Error adding to wishlist',
                message: error.message
            });
        }
    }

    /**
     * Remove item from wishlist
     * DELETE /api/wishlist/items/:productId
     */
    async removeItem(req, res) {
        try {
            const { productId } = req.params;

            const wishlist = await Wishlist.findOne({ userId: req.user.userId });

            if (!wishlist) {
                return res.status(404).json({
                    success: false,
                    error: 'Wishlist not found'
                });
            }

            await wishlist.removeItem(parseInt(productId));

            res.json({
                success: true,
                message: 'Product removed from wishlist',
                data: wishlist
            });
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Error removing from wishlist',
                message: error.message
            });
        }
    }

    /**
     * Clear wishlist
     * DELETE /api/wishlist
     */
    async clearWishlist(req, res) {
        try {
            const wishlist = await Wishlist.findOne({ userId: req.user.userId });

            if (!wishlist) {
                return res.status(404).json({
                    success: false,
                    error: 'Wishlist not found'
                });
            }

            await wishlist.clearWishlist();

            res.json({
                success: true,
                message: 'Wishlist cleared',
                data: wishlist
            });
        } catch (error) {
            console.error('Clear wishlist error:', error);
            res.status(500).json({
                success: false,
                error: 'Error clearing wishlist',
                message: error.message
            });
        }
    }

    /**
     * Move item from wishlist to cart
     * POST /api/wishlist/items/:productId/move-to-cart
     */
    async moveToCart(req, res) {
        try {
            const { productId } = req.params;
            const Cart = require('../models/Cart');
            const product = await Product.findOne({ id: parseInt(productId) });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            // Add to cart
            let cart = await Cart.findOne({ userId: req.user.userId });
            if (!cart) {
                cart = new Cart({ userId: req.user.userId, items: [] });
            }

            await cart.addItem(parseInt(productId), product.new_price, 1);

            // Remove from wishlist
            const wishlist = await Wishlist.findOne({ userId: req.user.userId });
            if (wishlist) {
                await wishlist.removeItem(parseInt(productId));
            }

            res.json({
                success: true,
                message: 'Product moved to cart',
                data: {
                    cart,
                    wishlist
                }
            });
        } catch (error) {
            console.error('Move to cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Error moving to cart',
                message: error.message
            });
        }
    }
}

module.exports = new WishlistController();
