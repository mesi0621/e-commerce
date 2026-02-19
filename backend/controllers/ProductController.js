const ProductService = require('../services/ProductService');
const SearchService = require('../services/SearchService');
const RecommendationService = require('../services/RecommendationService');
const InventoryService = require('../services/InventoryService');
const InteractionService = require('../services/InteractionService');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const PermissionService = require('../services/PermissionService');

class ProductController {
    /**
     * Get all products with optional filters
     * GET /api/products?category=men&minPrice=50&maxPrice=200&inStock=true&search=shirt&sort=price_asc&page=1&limit=20
     */
    async getAll(req, res) {
        try {
            const filters = {
                category: req.query.category,
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice,
                inStock: req.query.inStock,
                minRating: req.query.minRating,
                search: req.query.search,
                sort: req.query.sort,
                page: req.query.page,
                limit: req.query.limit
            };

            const result = await ProductService.getAllProducts(filters);

            res.json({
                success: true,
                count: result.products.length,
                data: result.products,
                pagination: result.pagination,
                filters: {
                    search: filters.search,
                    category: filters.category,
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                    sort: filters.sort
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
     * Get single product by ID
     * GET /api/products/:id
     */
    async getById(req, res) {
        try {
            const productId = parseInt(req.params.id);
            const product = await ProductService.getProductById(productId);

            // Track view interaction if userId provided
            if (req.query.userId) {
                await InteractionService.trackInteraction(
                    productId,
                    req.query.userId,
                    'view',
                    {
                        category: product.category,
                        price: product.new_price
                    }
                );
            }

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Search products
     * GET /api/products/search?q=jacket&category=men&minPrice=50
     */
    async search(req, res) {
        try {
            const query = req.query.q || '';
            const filters = {
                category: req.query.category,
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice
            };

            const results = await SearchService.search(query, filters);

            // If no results, suggest corrections and popular products
            if (results.length === 0 && query) {
                const corrections = SearchService.suggestCorrections(query);
                const popularProducts = await SearchService.getPopularFallback(10);

                return res.json({
                    success: true,
                    count: 0,
                    data: [],
                    suggestions: {
                        corrections,
                        popularProducts
                    }
                });
            }

            res.json({
                success: true,
                count: results.length,
                query,
                data: results
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get product recommendations (similar products)
     * GET /api/products/:id/recommendations
     */
    async getRecommendations(req, res) {
        try {
            const productId = parseInt(req.params.id);
            const limit = parseInt(req.query.limit) || 4;

            const recommendations = await RecommendationService.getSimilarProducts(productId, limit);

            res.json({
                success: true,
                productId,
                count: recommendations.length,
                data: recommendations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get popular products (best sellers)
     * GET /api/products/popular?limit=10
     */
    async getPopular(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const products = await InventoryService.getPopularProducts(limit);

            res.json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get trending products
     * GET /api/products/trending?limit=10&days=7
     */
    async getTrending(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const days = parseInt(req.query.days) || 7;

            const products = await InventoryService.getTrendingProducts(limit, days);

            res.json({
                success: true,
                count: products.length,
                period: `Last ${days} days`,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get personalized recommendations for user
     * GET /api/products/personalized/:userId
     */
    async getPersonalized(req, res) {
        try {
            const userId = req.params.userId;
            const limit = parseInt(req.query.limit) || 10;

            const recommendations = await RecommendationService.getPersonalizedRecommendations(userId, limit);

            res.json({
                success: true,
                userId,
                count: recommendations.length,
                data: recommendations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create new product (Seller or Admin)
     * POST /api/products
     * Requires 'products.create' permission
     */
    async create(req, res) {
        try {
            // Get seller profile if user is a seller
            let sellerId = null;
            if (req.user.role === 'seller') {
                const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

                if (!sellerProfile) {
                    return res.status(400).json({
                        success: false,
                        error: 'Seller profile not found. Please create a seller profile first.'
                    });
                }

                if (!sellerProfile.isApproved) {
                    return res.status(403).json({
                        success: false,
                        error: 'Your seller account is not approved yet.'
                    });
                }

                if (!sellerProfile.isActive) {
                    return res.status(403).json({
                        success: false,
                        error: 'Your seller account is inactive.'
                    });
                }

                sellerId = sellerProfile._id;
            }

            // Add sellerId to product data
            const productData = {
                ...req.body,
                sellerId,
                isApproved: req.user.role === 'admin' // Auto-approve admin products
            };

            const product = await ProductService.createProduct(productData);

            // Send email notification to admin if seller created the product
            if (req.user.role === 'seller') {
                const ProductNotificationService = require('../services/ProductNotificationService');
                await ProductNotificationService.notifyAdminOfNewProduct(product, req.user.userId);
            }

            res.status(201).json({
                success: true,
                message: req.user.role === 'seller' ? 'Product created and pending approval' : 'Product created successfully',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update product (Seller owns or Admin)
     * PUT /api/products/:id
     * Requires 'products.update.own' or 'products.update.all' permission
     */
    async update(req, res) {
        try {
            const productId = parseInt(req.params.id);

            // Get existing product
            const existingProduct = await Product.findOne({ id: productId });

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            // Check ownership for sellers
            if (req.user.role === 'seller') {
                const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

                if (!sellerProfile || existingProduct.sellerId.toString() !== sellerProfile._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        error: 'You can only update your own products'
                    });
                }
            }

            const product = await ProductService.updateProduct(productId, req.body);

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete product (Seller owns or Admin)
     * DELETE /api/products/:id
     * Requires 'products.delete.own' or 'products.delete.all' permission
     */
    async delete(req, res) {
        try {
            const productId = parseInt(req.params.id);

            // Get existing product
            const existingProduct = await Product.findOne({ id: productId });

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            // Check ownership for sellers
            if (req.user.role === 'seller') {
                const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

                if (!sellerProfile || existingProduct.sellerId.toString() !== sellerProfile._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        error: 'You can only delete your own products'
                    });
                }
            }

            const product = await ProductService.deleteProduct(productId);

            res.json({
                success: true,
                message: 'Product deleted successfully',
                data: product
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get product statistics
     * GET /api/products/:id/stats
     */
    async getStats(req, res) {
        try {
            const productId = parseInt(req.params.id);
            const days = parseInt(req.query.days) || 30;

            const stats = await InteractionService.getProductStats(productId, days);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get seller's own products
     * GET /api/products/seller/my-products
     * Requires seller role
     */
    async getSellerProducts(req, res) {
        try {
            const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            const { page = 1, limit = 50, isApproved } = req.query;
            const query = { sellerId: sellerProfile._id };

            if (isApproved !== undefined) {
                query.isApproved = isApproved === 'true';
            }

            const skip = (page - 1) * limit;

            const products = await Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Product.countDocuments(query);

            res.json({
                success: true,
                data: products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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
     * Approve product (Admin only)
     * POST /api/products/:id/approve
     * Requires admin role
     */
    async approveProduct(req, res) {
        try {
            const productId = parseInt(req.params.id);

            const product = await Product.findOne({ id: productId }).populate('sellerId');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            product.isApproved = true;
            product.approvedBy = req.user.userId;
            product.approvedAt = Date.now();

            await product.save();

            // Send notification to seller
            const NotificationService = require('../services/NotificationService');
            if (product.sellerId) {
                await NotificationService.notifyProductApproved(productId, product.sellerId._id);
            }

            // Send email notification to seller
            const ProductNotificationService = require('../services/ProductNotificationService');
            if (product.sellerId) {
                await ProductNotificationService.notifySellerOfApproval(product, product.sellerId._id);
            }

            res.json({
                success: true,
                message: 'Product approved successfully',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get pending products (Admin only)
     * GET /api/products/admin/pending
     * Requires admin role
     */
    async getPendingProducts(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;

            const products = await Product.find({ isApproved: false })
                .populate('sellerId', 'businessName userId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Product.countDocuments({ isApproved: false });

            res.json({
                success: true,
                data: products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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
     * Reject product (Admin only)
     * PUT /api/products/:id/reject
     * Requires 'products.approve' permission
     */
    async rejectProduct(req, res) {
        try {
            const productId = parseInt(req.params.id);
            const { reason } = req.body;

            const product = await Product.findOne({ id: productId }).populate('sellerId');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            product.isApproved = false;
            product.rejectedBy = req.user.userId;
            product.rejectedAt = Date.now();
            product.rejectionReason = reason || 'Product does not meet our quality standards';

            await product.save();

            // Send notification to seller
            const NotificationService = require('../services/NotificationService');
            if (product.sellerId) {
                await NotificationService.notifyProductRejected(productId, product.sellerId._id, product.rejectionReason);
            }

            // Send email notification to seller
            const ProductNotificationService = require('../services/ProductNotificationService');
            if (product.sellerId) {
                await ProductNotificationService.notifySellerOfRejection(product, product.sellerId._id, product.rejectionReason);
            }

            res.json({
                success: true,
                message: 'Product rejected successfully',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new ProductController();