const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');

// Inventory routes (Admin only - TODO: Add authentication)
router.get('/alerts', InventoryController.getReorderAlerts);
router.get('/trending', InventoryController.getTrending);
router.get('/:productId/reorder', InventoryController.getReorderPoint);
router.get('/:productId/forecast', InventoryController.getForecast);
router.patch('/:productId/stock', InventoryController.updateStock);
router.post('/:productId/popularity', InventoryController.updatePopularity);

module.exports = router;
