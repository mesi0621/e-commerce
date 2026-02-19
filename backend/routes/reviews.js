const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');

// Review routes
router.get('/:productId', ReviewController.getReviews);
router.get('/:productId/stats', ReviewController.getReviewStats);
router.post('/', ReviewController.addReview);
router.post('/:reviewId/vote', ReviewController.voteReview);
router.delete('/:reviewId', ReviewController.deleteReview);

module.exports = router;
