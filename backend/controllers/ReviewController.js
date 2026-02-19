const ReviewService = require('../services/ReviewService');

class ReviewController {
    /**
     * Get reviews for a product
     * GET /api/reviews/:productId?sortBy=helpfulness&limit=50
     */
    async getReviews(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            const options = {
                sortBy: req.query.sortBy || 'helpfulness',
                limit: parseInt(req.query.limit) || 50,
                skip: parseInt(req.query.skip) || 0
            };

            const reviews = await ReviewService.getReviews(productId, options);

            res.json({
                success: true,
                productId,
                count: reviews.length,
                data: reviews
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Add a review
     * POST /api/reviews
     * Body: { productId, userId, rating, comment }
     */
    async addReview(req, res) {
        try {
            const { productId, userId, rating, comment } = req.body;

            if (!productId || !userId || rating === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'productId, userId, and rating are required'
                });
            }

            const review = await ReviewService.addReview({
                productId,
                userId,
                rating,
                comment
            });

            res.status(201).json({
                success: true,
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Vote on a review
     * POST /api/reviews/:reviewId/vote
     * Body: { voteType: 'upvote' | 'downvote' }
     */
    async voteReview(req, res) {
        try {
            const reviewId = req.params.reviewId;
            const { voteType } = req.body;

            if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
                return res.status(400).json({
                    success: false,
                    error: 'voteType must be "upvote" or "downvote"'
                });
            }

            const review = await ReviewService.voteReview(reviewId, voteType);

            res.json({
                success: true,
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get review statistics for a product
     * GET /api/reviews/:productId/stats
     */
    async getReviewStats(req, res) {
        try {
            const productId = parseInt(req.params.productId);
            const stats = await ReviewService.getReviewStats(productId);

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
     * Delete a review
     * DELETE /api/reviews/:reviewId
     * Body: { userId }
     */
    async deleteReview(req, res) {
        try {
            const reviewId = req.params.reviewId;
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'userId is required'
                });
            }

            const review = await ReviewService.deleteReview(reviewId, userId);

            res.json({
                success: true,
                message: 'Review deleted successfully',
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new ReviewController();
