const InventoryService = require('../services/InventoryService');

class InventoryController {
    /**
     * Update product stock
     * PATCH /api/inventory/:productId/stock
     * Body: { quantity }
     */
    async updateStock(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            const { quantity } = req.body;

            if (quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'quantity is required'
                });
            }

            const product = await InventoryService.updateStock(productId, quantity);

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
     * Get reorder point calculation
     * GET /api/inventory/:productId/reorder?leadTime=7
     */
    async getReorderPoint(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            const leadTimeDays = parseInt(req.query.leadTime) || 7;

            const reorderInfo = await InventoryService.calculateReorderPoint(productId, leadTimeDays);

            res.json({
                success: true,
                data: reorderInfo
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get all reorder alerts
     * GET /api/inventory/alerts
     */
    async getReorderAlerts(req, res) {
        try {
            const alerts = await InventoryService.getReorderAlerts();

            res.json({
                success: true,
                count: alerts.length,
                data: alerts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update product popularity
     * POST /api/inventory/:productId/popularity
     */
    async updatePopularity(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            const product = await InventoryService.updatePopularity(productId);

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
     * Get demand forecast
     * GET /api/inventory/:productId/forecast?days=30
     */
    async getForecast(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            const days = parseInt(req.query.days) || 30;

            const forecast = await InventoryService.forecastDemand(productId, days);

            res.json({
                success: true,
                data: forecast
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
     * GET /api/inventory/trending?limit=10&days=7
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
}

module.exports = new InventoryController();
