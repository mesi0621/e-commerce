const InteractionService = require('../services/InteractionService');

class InteractionController {
    /**
     * Track user interaction
     * POST /api/interactions
     * Body: { productId, userId, type, metadata }
     */
    async trackInteraction(req, res) {
        try {
            const { productId, userId, type, metadata } = req.body;

            if (!productId || !userId || !type) {
                return res.status(400).json({
                    success: false,
                    error: 'productId, userId, and type are required'
                });
            }

            const interaction = await InteractionService.trackInteraction(
                productId,
                userId,
                type,
                metadata || {}
            );

            res.status(201).json({
                success: true,
                data: interaction
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get user's interaction history
     * GET /api/interactions/user/:userId?type=view&limit=50
     */
    async getUserInteractions(req, res) {
        try {
            const userId = req.params.userId;
            const options = {
                type: req.query.type,
                limit: parseInt(req.query.limit) || 50,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            const interactions = await InteractionService.getUserInteractions(userId, options);

            res.json({
                success: true,
                userId,
                count: interactions.length,
                data: interactions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get product interaction statistics
     * GET /api/interactions/product/:productId/stats?days=30
     */
    async getProductStats(req, res) {
        try {
            const productId = parseInt(req.params.productId);
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
     * Bulk track interactions
     * POST /api/interactions/bulk
     * Body: { interactions: [{ productId, userId, type }] }
     */
    async bulkTrackInteractions(req, res) {
        try {
            const { interactions } = req.body;

            if (!interactions || !Array.isArray(interactions)) {
                return res.status(400).json({
                    success: false,
                    error: 'interactions array is required'
                });
            }

            const created = await InteractionService.bulkTrackInteractions(interactions);

            res.status(201).json({
                success: true,
                count: created.length,
                data: created
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new InteractionController();
