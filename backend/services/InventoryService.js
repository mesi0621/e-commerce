const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

/**
 * InventoryService - Algorithms #8 & #9
 * - Algorithm #8: Popularity Algorithm
 * - Algorithm #9: Inventory Management Algorithm
 */
class InventoryService {
    /**
     * Update product stock
     * @param {Number} productId - Product ID
     * @param {Number} quantity - Quantity to add/subtract
     * @returns {Promise<Object>} Updated product
     */
    async updateStock(productId, quantity) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) {
                throw new Error('Product not found');
            }

            product.stock += quantity;
            if (product.stock < 0) product.stock = 0;

            product.updatedAt = Date.now();
            await product.save();

            return product.toObject();
        } catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }

    /**
     * Calculate reorder point for a product
     * Algorithm #9: Inventory Management - Reorder Point
     * Formula: (averageDailySales * leadTimeDays) + safetyStock
     * safetyStock = averageDailySales * 7 (1 week buffer)
     * @param {Number} productId - Product ID
     * @param {Number} leadTimeDays - Lead time in days (default 7)
     * @returns {Promise<Object>} Reorder point calculation
     */
    async calculateReorderPoint(productId, leadTimeDays = 7) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) {
                throw new Error('Product not found');
            }

            // Get purchase interactions for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const purchases = await Interaction.find({
                productId,
                type: 'purchase',
                timestamp: { $gte: thirtyDaysAgo }
            });

            // Calculate average daily sales
            const totalSales = purchases.length;
            const averageDailySales = totalSales / 30;

            // Calculate safety stock (1 week buffer)
            const safetyStock = averageDailySales * 7;

            // Calculate reorder point
            const reorderPoint = (averageDailySales * leadTimeDays) + safetyStock;

            return {
                productId,
                currentStock: product.stock,
                averageDailySales: Math.round(averageDailySales * 100) / 100,
                safetyStock: Math.round(safetyStock * 100) / 100,
                reorderPoint: Math.ceil(reorderPoint),
                leadTimeDays,
                shouldReorder: product.stock < reorderPoint
            };
        } catch (error) {
            throw new Error(`Error calculating reorder point: ${error.message}`);
        }
    }

    /**
     * Check if product needs reordering
     * @param {Number} productId - Product ID
     * @returns {Promise<Boolean>} True if reorder needed
     */
    async checkReorderPoint(productId) {
        try {
            const result = await this.calculateReorderPoint(productId);
            return result.shouldReorder;
        } catch (error) {
            throw new Error(`Error checking reorder point: ${error.message}`);
        }
    }

    /**
     * Get all products that need reordering
     * @returns {Promise<Array>} Products needing reorder
     */
    async getReorderAlerts() {
        try {
            const products = await Product.find({}).lean();
            const alerts = [];

            for (const product of products) {
                const reorderInfo = await this.calculateReorderPoint(product.id);
                if (reorderInfo.shouldReorder) {
                    alerts.push({
                        ...product,
                        reorderInfo
                    });
                }
            }

            return alerts;
        } catch (error) {
            throw new Error(`Error getting reorder alerts: ${error.message}`);
        }
    }

    /**
     * Update popularity score for a product
     * Algorithm #8: Popularity Algorithm
     * Formula: (views * 1) + (cartAdds * 5) + (purchases * 10)
     * With time decay: score *= Math.pow(0.9, weeksSinceInteraction)
     * @param {Number} productId - Product ID
     * @returns {Promise<Object>} Updated product with new popularity
     */
    async updatePopularity(productId) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) {
                throw new Error('Product not found');
            }

            // Get all interactions for this product
            const interactions = await Interaction.find({ productId }).lean();

            if (interactions.length === 0) {
                // Default popularity for products with no interactions
                product.popularity = 1;
                await product.save();
                return product.toObject();
            }

            // Calculate popularity with time decay
            let totalScore = 0;
            const now = new Date();

            for (const interaction of interactions) {
                // Base score by interaction type
                let baseScore = 0;
                switch (interaction.type) {
                    case 'view':
                        baseScore = 1;
                        break;
                    case 'cart_add':
                        baseScore = 5;
                        break;
                    case 'purchase':
                        baseScore = 10;
                        break;
                }

                // Calculate weeks since interaction
                const diffTime = Math.abs(now - new Date(interaction.timestamp));
                const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

                // Apply time decay: score *= 0.9^weeks
                const decayedScore = baseScore * Math.pow(0.9, diffWeeks);
                totalScore += decayedScore;
            }

            // Round to nearest integer
            product.popularity = Math.max(1, Math.round(totalScore));
            product.updatedAt = Date.now();
            await product.save();

            return product.toObject();
        } catch (error) {
            throw new Error(`Error updating popularity: ${error.message}`);
        }
    }

    /**
     * Get popular products (best sellers)
     * Algorithm #8: Popularity Algorithm - Best Sellers
     * @param {Number} limit - Number of products to return (default 10)
     * @returns {Promise<Array>} Top products by popularity
     */
    async getPopularProducts(limit = 10) {
        try {
            const products = await Product.find({})
                .sort({ popularity: -1, rating: -1 })
                .limit(limit)
                .lean();

            return products;
        } catch (error) {
            throw new Error(`Error getting popular products: ${error.message}`);
        }
    }

    /**
     * Forecast demand using 30-day moving average
     * Algorithm #9: Inventory Management - Demand Forecasting
     * @param {Number} productId - Product ID
     * @param {Number} days - Number of days to forecast (default 30)
     * @returns {Promise<Object>} Demand forecast
     */
    async forecastDemand(productId, days = 30) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) {
                throw new Error('Product not found');
            }

            // Get purchase interactions for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const purchases = await Interaction.find({
                productId,
                type: 'purchase',
                timestamp: { $gte: thirtyDaysAgo }
            });

            // Calculate 30-day moving average
            const totalPurchases = purchases.length;
            const averageDailySales = totalPurchases / 30;

            // Forecast for specified days
            const forecastedDemand = averageDailySales * days;

            return {
                productId,
                productName: product.name,
                currentStock: product.stock,
                averageDailySales: Math.round(averageDailySales * 100) / 100,
                forecastPeriodDays: days,
                forecastedDemand: Math.ceil(forecastedDemand),
                stockSufficient: product.stock >= forecastedDemand,
                daysUntilStockout: averageDailySales > 0
                    ? Math.floor(product.stock / averageDailySales)
                    : Infinity
            };
        } catch (error) {
            throw new Error(`Error forecasting demand: ${error.message}`);
        }
    }

    /**
     * Get trending products (high recent activity)
     * @param {Number} limit - Number of products
     * @param {Number} days - Days to look back (default 7)
     * @returns {Promise<Array>} Trending products
     */
    async getTrendingProducts(limit = 10, days = 7) {
        try {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - days);

            // Get recent interactions
            const recentInteractions = await Interaction.find({
                timestamp: { $gte: daysAgo }
            });

            // Count interactions per product
            const productScores = {};
            recentInteractions.forEach(interaction => {
                if (!productScores[interaction.productId]) {
                    productScores[interaction.productId] = 0;
                }

                // Weight by interaction type
                const weight = interaction.type === 'purchase' ? 10
                    : interaction.type === 'cart_add' ? 5
                        : 1;
                productScores[interaction.productId] += weight;
            });

            // Sort by score
            const sortedProductIds = Object.entries(productScores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(entry => parseInt(entry[0]));

            // Get products
            const products = await Product.find({
                id: { $in: sortedProductIds }
            }).lean();

            // Sort products by score order
            const sortedProducts = sortedProductIds
                .map(id => products.find(p => p.id === id))
                .filter(p => p !== undefined);

            return sortedProducts;
        } catch (error) {
            throw new Error(`Error getting trending products: ${error.message}`);
        }
    }
}

module.exports = new InventoryService();
