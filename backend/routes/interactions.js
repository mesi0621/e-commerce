                                                                                                        const express = require('express');
const router = express.Router();
const InteractionController = require('../controllers/InteractionController');

// Interaction routes
router.post('/', InteractionController.trackInteraction);
router.post('/bulk', InteractionController.bulkTrackInteractions);
router.get('/user/:userId', InteractionController.getUserInteractions);
router.get('/product/:productId/stats', InteractionController.getProductStats);

module.exports = router;
