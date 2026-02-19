const Interaction = require('../models/Interaction');
const InventoryService = require('./InventoryService');
const RecommendationService = require('./RecommendationService');

/**
 * InteractionService
 * Tracks user interactions for popularity and personalization
 */
class InteractionService {
    /**
     * Track user interaction with a product
     * @param {Number} productId - Product ID
     * @param {String} userId - User ID
     * @param {String} type - Interaction type ('view', 'cart_add', 'purchase')
     * @param {Object} metadata - Additional metadata (category, price)
     * @returns {Promise<Object>} Created interaction
     */
    async trackInteraction(productId, userId, type, metadata = {}) {
        try {
            // Validate interaction type
            const validTypes = ['view', 'cart_add', 'purchase'];
            if (!validTypes.includes(type)) {
                throw new Error(`Invalid interaction type: ${type}`);
            }

            // Create interaction
            const interaction = new Interaction({
                productId,
                userId,
                type,
                timestamp: new Date()
            });

            await interaction.save();

            // Update popularity asynchronously (don't wait)
            this.updatePopularityAsync(productId);

            // Update user profile for personalization (if metadata provided)
            if (type === 'view' && metadata.category && metadata.price) {
                this.updateUserProfileAsync(userId, {
                    productId,
                    category: metadata.category,
                    price: metadata.price
                });
            }

            return interaction.toObject();
        } catch (error) {
            throw new Error(`Error tracking interaction: ${error.message}`);
        }
    }

    /**
     * Update popularity asynchronously (fire and forget)
     * @param {Number} productId - Product ID
     */
    updatePopularityAsync(productId) {
        // Fire and forget - don't await
        InventoryService.updatePopularity(productId).catch(error => {
            console.error(`Error updating popularity for product ${productId}:`, error.message);
        });
    }

    /**
     * Update user profile asynchronously (fire and forget)
     * @param {String} userId - User ID
     * @param {Object} interaction - Interaction data
     */
    updateUserProfileAsync(userId, interaction) {
        // Fire and forget - don't await
        RecommendationService.updateUserProfile(userId, interaction).catch(error => {
            console.error(`Error updating user profile for ${userId}:`, error.message);
        });
    }

    /**
     * Get user's interaction history
     * @param {String} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} User interactions
     */
    async getUserInteractions(userId, options = {}) {
        try {
            const {
                type = null,
                limit = 50,
                startDate = null,
                endDate = null
            } = options;

            const query = { userId };

            if (type) {
                query.type = type;
            }

            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            const interactions = await Interaction.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean();

            return interactions;
        } catch (error) {
            throw new Error(`Error getting user interactions: ${error.message}`);
        }
    }

    /**
     * Get product's interaction statistics
     * @param {Number} productId - Product ID
     * @param {Number} days - Days to look back (default 30)
     * @returns {Promise<Object>} Interaction statistics
     */
    async getProductStats(productId, days = 30) {
        try {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - days);

            const interactions = await Interaction.find({
                productId,
                timestamp: { $gte: daysAgo }
            }).lean();

            const stats = {
                productId,
                period: `Last ${days} days`,
                views: 0,
                cartAdds: 0,
                purchases: 0,
                total: interactions.length,
                conversionRate: 0
            };

            interactions.forEach(interaction => {
                switch (interaction.type) {
                    case 'view':
                        stats.views++;
                        break;
                    case 'cart_add':
                        stats.cartAdds++;
                        break;
                    case 'purchase':
                        stats.purchases++;
                        break;
                }
            });

            // Calculate conversion rate (purchases / views)
            if (stats.views > 0) {
                stats.conversionRate = Math.round((stats.purchases / stats.views) * 10000) / 100;
            }

            return stats;
        } catch (error) {
            throw new Error(`Error getting product stats: ${error.message}`);
        }
    }

    /**
     * Bulk track interactions (for batch processing)
     * @param {Array} interactions - Array of interaction objects
     * @returns {Promise<Array>} Created interactions
     */
    async bulkTrackInteractions(interactions) {
        try {
            const created = await Interaction.insertMany(interactions);

            // Update popularity for affected products
            const productIds = [...new Set(interactions.map(i => i.productId))];
            productIds.forEach(productId => {
                this.updatePopularityAsync(productId);
            });

            return created;
        } catch (error) {
            throw new Error(`Error bulk tracking interactions: ${error.message}`);
        }
    }
}

module.exports = new InteractionService();
