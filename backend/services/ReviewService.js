const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * ReviewService - Algorithm #12: Review & Rating Algorithm
 * Manages product reviews with weighted ratings and helpfulness sorting
 */
class ReviewService {
    /**
     * Add a review for a product
     * @param {Object} reviewData - Review data
     * @returns {Promise<Object>} Created review
     */
    async addReview(reviewData) {
        try {
            const { productId, userId, rating, comment } = reviewData;

            // Validate rating
            if (rating < 0 || rating > 5) {
                throw new Error('Rating must be between 0 and 5');
            }

            // Create review
            const review = new Review({
                productId,
                userId,
                rating,
                comment,
                upvotes: 0,
                downvotes: 0
            });

            await review.save();

            // Update product rating
            await this.updateProductRating(productId);

            return review.toObject();
        } catch (error) {
            throw new Error(`Error adding review: ${error.message}`);
        }
    }

    /**
     * Get reviews for a product
     * @param {Number} productId - Product ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Product reviews
     */
    async getReviews(productId, options = {}) {
        try {
            const {
                sortBy = 'helpfulness', // 'helpfulness', 'newest', 'rating'
                limit = 50,
                skip = 0
            } = options;

            let sortQuery = {};

            switch (sortBy) {
                case 'helpfulness':
                    // Sort by helpfulness (upvotes - downvotes), then by newest
                    sortQuery = { createdAt: -1 }; // We'll sort by helpfulness in code
                    break;
                case 'newest':
                    sortQuery = { createdAt: -1 };
                    break;
                case 'rating':
                    sortQuery = { rating: -1, createdAt: -1 };
                    break;
                default:
                    sortQuery = { createdAt: -1 };
            }

            let reviews = await Review.find({ productId })
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean();

            // Sort by helpfulness if requested
            if (sortBy === 'helpfulness') {
                reviews = this.sortReviewsByHelpfulness(reviews);
            }

            return reviews;
        } catch (error) {
            throw new Error(`Error getting reviews: ${error.message}`);
        }
    }

    /**
     * Sort reviews by helpfulness score
     * Algorithm #12: Review & Rating - Helpfulness Sorting
     * Formula: helpfulness = upvotes - downvotes
     * @param {Array} reviews - Array of reviews
     * @returns {Array} Sorted reviews
     */
    sortReviewsByHelpfulness(reviews) {
        return reviews.sort((a, b) => {
            const helpfulnessA = (a.upvotes || 0) - (a.downvotes || 0);
            const helpfulnessB = (b.upvotes || 0) - (b.downvotes || 0);

            // Sort by helpfulness descending, then by date descending
            if (helpfulnessB !== helpfulnessA) {
                return helpfulnessB - helpfulnessA;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    /**
     * Vote on a review (upvote or downvote)
     * @param {String} reviewId - Review ID
     * @param {String} voteType - 'upvote' or 'downvote'
     * @returns {Promise<Object>} Updated review
     */
    async voteReview(reviewId, voteType) {
        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            if (voteType === 'upvote') {
                review.upvotes += 1;
            } else if (voteType === 'downvote') {
                review.downvotes += 1;
            } else {
                throw new Error('Invalid vote type');
            }

            await review.save();
            return review.toObject();
        } catch (error) {
            throw new Error(`Error voting on review: ${error.message}`);
        }
    }

    /**
     * Calculate weighted average rating for a product
     * Algorithm #12: Review & Rating - Weighted Average
     * Recent reviews are weighted more heavily (10% decay per week)
     * @param {Array} reviews - Array of reviews
     * @returns {Number} Weighted average rating
     */
    calculateWeightedRating(reviews) {
        if (!reviews || reviews.length === 0) {
            return 0;
        }

        let totalWeightedRating = 0;
        let totalWeight = 0;
        const now = new Date();

        reviews.forEach(review => {
            // Calculate weeks since review
            const diffTime = Math.abs(now - new Date(review.createdAt));
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            // Apply time-based weight (10% decay per week)
            const weight = Math.pow(0.9, diffWeeks);

            totalWeightedRating += review.rating * weight;
            totalWeight += weight;
        });

        const weightedAverage = totalWeight > 0 ? totalWeightedRating / totalWeight : 0;
        return Math.round(weightedAverage * 10) / 10; // Round to 1 decimal place
    }

    /**
     * Update product's average rating
     * @param {Number} productId - Product ID
     * @returns {Promise<Object>} Updated product
     */
    async updateProductRating(productId) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) {
                throw new Error('Product not found');
            }

            // Get all reviews for the product
            const reviews = await Review.find({ productId }).lean();

            // Calculate weighted average rating
            const weightedRating = this.calculateWeightedRating(reviews);

            // Update product
            product.rating = weightedRating;
            product.reviewCount = reviews.length;
            product.updatedAt = Date.now();
            await product.save();

            return product.toObject();
        } catch (error) {
            throw new Error(`Error updating product rating: ${error.message}`);
        }
    }

    /**
     * Get review statistics for a product
     * @param {Number} productId - Product ID
     * @returns {Promise<Object>} Review statistics
     */
    async getReviewStats(productId) {
        try {
            const reviews = await Review.find({ productId }).lean();

            if (reviews.length === 0) {
                return {
                    productId,
                    totalReviews: 0,
                    averageRating: 0,
                    weightedRating: 0,
                    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                };
            }

            // Calculate simple average
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            // Calculate weighted average
            const weightedRating = this.calculateWeightedRating(reviews);

            // Calculate rating distribution
            const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach(review => {
                const roundedRating = Math.round(review.rating);
                if (ratingDistribution[roundedRating] !== undefined) {
                    ratingDistribution[roundedRating]++;
                }
            });

            return {
                productId,
                totalReviews: reviews.length,
                averageRating: Math.round(averageRating * 10) / 10,
                weightedRating: Math.round(weightedRating * 10) / 10,
                ratingDistribution
            };
        } catch (error) {
            throw new Error(`Error getting review stats: ${error.message}`);
        }
    }

    /**
     * Delete a review
     * @param {String} reviewId - Review ID
     * @param {String} userId - User ID (for authorization)
     * @returns {Promise<Object>} Deleted review
     */
    async deleteReview(reviewId, userId) {
        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            // Check if user owns the review
            if (review.userId !== userId) {
                throw new Error('Unauthorized to delete this review');
            }

            const productId = review.productId;
            await review.deleteOne();

            // Update product rating
            await this.updateProductRating(productId);

            return review.toObject();
        } catch (error) {
            throw new Error(`Error deleting review: ${error.message}`);
        }
    }
}

module.exports = new ReviewService();
