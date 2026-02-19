const Product = require('../models/Product');
const User = require('../models/User');

/**
 * RecommendationService - Algorithms #6 & #13
 * - Algorithm #6: Recommendation Algorithms (Content-Based Filtering)
 * - Algorithm #13: Personalization Algorithm
 */
class RecommendationService {
    /**
     * Get similar products using content-based filtering
     * Algorithm #6: Recommendation Algorithms
     * @param {Number} productId - Product ID
     * @param {Number} limit - Maximum number of recommendations
     * @returns {Promise<Array>} Similar products
     */
    async getSimilarProducts(productId, limit = 4) {
        try {
            // Get the source product
            const sourceProduct = await Product.findOne({ id: productId }).lean();
            if (!sourceProduct) {
                throw new Error('Product not found');
            }

            // Find products in the same category (excluding the source product)
            const candidates = await Product.find({
                category: sourceProduct.category,
                id: { $ne: productId }
            }).lean();

            // Calculate similarity scores
            const scoredProducts = candidates.map(product => ({
                ...product,
                similarityScore: this.calculateSimilarity(sourceProduct, product)
            }));

            // Filter by price range (within 30%)
            const priceMin = sourceProduct.new_price * 0.7;
            const priceMax = sourceProduct.new_price * 1.3;

            const similarProducts = scoredProducts.filter(product =>
                product.new_price >= priceMin && product.new_price <= priceMax
            );

            // Sort by similarity score (descending)
            similarProducts.sort((a, b) => b.similarityScore - a.similarityScore);

            // If we have enough similar products, return them
            if (similarProducts.length >= limit) {
                return similarProducts.slice(0, limit);
            }

            // Fill remaining slots with popular products from same category
            const needed = limit - similarProducts.length;
            const popularProducts = await Product.find({
                category: sourceProduct.category,
                id: {
                    $ne: productId,
                    $nin: similarProducts.map(p => p.id)
                }
            })
                .sort({ popularity: -1 })
                .limit(needed)
                .lean();

            return [...similarProducts, ...popularProducts].slice(0, limit);
        } catch (error) {
            throw new Error(`Error getting similar products: ${error.message}`);
        }
    }

    /**
     * Calculate similarity between two products
     * Formula: categorySimilarity * 0.6 + priceSimilarity * 0.4
     * @param {Object} product1 - First product
     * @param {Object} product2 - Second product
     * @returns {Number} Similarity score (0-1)
     */
    calculateSimilarity(product1, product2) {
        // Category similarity (1 if same, 0 otherwise)
        const categorySimilarity = product1.category === product2.category ? 1 : 0;

        // Price similarity (1 - normalized price difference)
        const maxPrice = Math.max(product1.new_price, product2.new_price);
        const priceDiff = Math.abs(product1.new_price - product2.new_price);
        const priceSimilarity = maxPrice > 0 ? 1 - (priceDiff / maxPrice) : 1;

        // Weighted formula
        const similarity = (categorySimilarity * 0.6) + (priceSimilarity * 0.4);

        return Math.round(similarity * 100) / 100;
    }

    /**
     * Get personalized recommendations based on user history
     * Algorithm #13: Personalization Algorithm
     * @param {String} userId - User ID
     * @param {Number} limit - Maximum number of recommendations
     * @returns {Promise<Array>} Personalized recommendations
     */
    async getPersonalizedRecommendations(userId, limit = 10) {
        try {
            // Get user profile
            let user = await User.findOne({ userId });

            // If no user profile, return popular products
            if (!user || user.viewedProducts.length === 0) {
                return this.getPopularProducts(limit);
            }

            // Get user's most viewed categories
            const topCategories = user.getMostViewedCategories(3);

            // Build query for user's preferred categories and price range
            const query = {
                category: { $in: topCategories },
                new_price: {
                    $gte: user.priceRange.min * 0.8, // 20% below min
                    $lte: user.priceRange.max * 1.2  // 20% above max
                },
                id: { $nin: user.viewedProducts } // Exclude already viewed
            };

            // Get products matching user preferences
            const recommendations = await Product.find(query)
                .sort({ popularity: -1, rating: -1 })
                .limit(limit)
                .lean();

            // If not enough recommendations, fill with popular products
            if (recommendations.length < limit) {
                const needed = limit - recommendations.length;
                const popularProducts = await Product.find({
                    id: {
                        $nin: [
                            ...user.viewedProducts,
                            ...recommendations.map(p => p.id)
                        ]
                    }
                })
                    .sort({ popularity: -1 })
                    .limit(needed)
                    .lean();

                return [...recommendations, ...popularProducts];
            }

            return recommendations;
        } catch (error) {
            throw new Error(`Error getting personalized recommendations: ${error.message}`);
        }
    }

    /**
     * Update user profile with interaction
     * @param {String} userId - User ID
     * @param {Object} interaction - Interaction data { productId, category, price }
     * @returns {Promise<Object>} Updated user profile
     */
    async updateUserProfile(userId, interaction) {
        try {
            let user = await User.findOne({ userId });

            if (!user) {
                // Create new user profile
                user = new User({
                    userId,
                    viewedProducts: [],
                    viewedCategories: new Map(),
                    priceRange: { min: 0, max: 1000 }
                });
            }

            // Add viewed product
            await user.addViewedProduct(
                interaction.productId,
                interaction.category,
                interaction.price
            );

            return user.toObject();
        } catch (error) {
            throw new Error(`Error updating user profile: ${error.message}`);
        }
    }

    /**
     * Get popular products as fallback
     * @param {Number} limit - Number of products
     * @returns {Promise<Array>} Popular products
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
     * Get recommendations for "You May Also Like" section
     * Combines similar products and personalized recommendations
     * @param {String} userId - User ID
     * @param {Number} productId - Current product ID
     * @param {Number} limit - Maximum recommendations
     * @returns {Promise<Array>} Mixed recommendations
     */
    async getMixedRecommendations(userId, productId, limit = 6) {
        try {
            // Get 50% similar products, 50% personalized
            const similarLimit = Math.ceil(limit / 2);
            const personalizedLimit = Math.floor(limit / 2);

            const [similar, personalized] = await Promise.all([
                this.getSimilarProducts(productId, similarLimit),
                this.getPersonalizedRecommendations(userId, personalizedLimit)
            ]);

            // Combine and deduplicate
            const combined = [...similar];
            const existingIds = new Set(similar.map(p => p.id));

            for (const product of personalized) {
                if (!existingIds.has(product.id) && combined.length < limit) {
                    combined.push(product);
                    existingIds.add(product.id);
                }
            }

            return combined;
        } catch (error) {
            throw new Error(`Error getting mixed recommendations: ${error.message}`);
        }
    }
}

module.exports = new RecommendationService();
