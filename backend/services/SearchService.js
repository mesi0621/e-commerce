const Product = require('../models/Product');

class SearchService {
    constructor() {
        // Synonym dictionary for query expansion
        this.synonyms = {
            'shirt': ['blouse', 'top', 'tee'],
            'blouse': ['shirt', 'top'],
            'jacket': ['coat', 'blazer'],
            'coat': ['jacket'],
            'pants': ['trousers', 'jeans'],
            'trousers': ['pants'],
            'dress': ['gown', 'frock'],
            'shoes': ['footwear', 'sneakers'],
            'kids': ['children', 'kid', 'boys', 'girls'],
            'men': ['male', 'mens', 'man'],
            'women': ['female', 'womens', 'woman', 'ladies']
        };
    }

    /**
     * Search products with text search and relevance ranking
     * @param {String} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Ranked search results
     */
    async search(query, filters = {}) {
        try {
            // Handle empty query - return all products
            if (!query || query.trim() === '') {
                const products = await Product.find({}).lean();
                return products.map(product => ({
                    ...product,
                    relevanceScore: 0
                }));
            }

            // Normalize and expand query
            const normalizedQuery = this.normalizeQuery(query);
            const expandedQuery = this.expandQueryWithSynonyms(normalizedQuery);

            // Build MongoDB text search query
            const searchQuery = {
                $text: { $search: expandedQuery }
            };

            // Add additional filters
            if (filters.category) {
                searchQuery.category = Array.isArray(filters.category)
                    ? { $in: filters.category }
                    : filters.category;
            }

            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                searchQuery.new_price = {};
                if (filters.minPrice !== undefined) {
                    searchQuery.new_price.$gte = parseFloat(filters.minPrice);
                }
                if (filters.maxPrice !== undefined) {
                    searchQuery.new_price.$lte = parseFloat(filters.maxPrice);
                }
            }

            // Execute search with text score
            const products = await Product.find(
                searchQuery,
                { score: { $meta: 'textScore' } }
            ).lean();

            // Calculate relevance scores and rank
            const rankedResults = products.map(product => {
                const relevanceScore = this.calculateRelevance(
                    product,
                    product.score || 0,
                    normalizedQuery
                );
                return {
                    ...product,
                    relevanceScore,
                    matchedTerms: this.getMatchedTerms(product, normalizedQuery)
                };
            });

            // Sort by relevance score (descending)
            rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

            return rankedResults;
        } catch (error) {
            throw new Error(`Error searching products: ${error.message}`);
        }
    }

    /**
     * Calculate relevance score using weighted formula
     * Algorithm #7 - Ranking Algorithm
     * Formula: (textScore * 0.5) + (popularity * 0.3) + (rating * 0.2)
     * @param {Object} product - Product object
     * @param {Number} textScore - MongoDB text score
     * @param {String} query - Search query
     * @returns {Number} Relevance score (0-100)
     */
    calculateRelevance(product, textScore, query) {
        // Normalize text score (MongoDB text scores typically range 0-10)
        const normalizedTextScore = Math.min((textScore / 10) * 100, 100);

        // Normalize popularity (assume max popularity is 10000)
        const normalizedPopularity = Math.min((product.popularity / 10000) * 100, 100);

        // Normalize rating (0-5 to 0-100)
        const normalizedRating = (product.rating / 5) * 100;

        // Check for exact matches in name (boost score)
        const queryTerms = query.toLowerCase().split(/\s+/);
        const productName = product.name.toLowerCase();
        const exactMatches = queryTerms.filter(term => productName.includes(term)).length;
        const exactMatchBoost = (exactMatches / queryTerms.length) * 20; // Up to 20 point boost

        // Weighted formula: relevance(50%) + popularity(30%) + rating(20%)
        const baseScore = (normalizedTextScore * 0.5) +
            (normalizedPopularity * 0.3) +
            (normalizedRating * 0.2);

        // Add exact match boost
        const finalScore = Math.min(baseScore + exactMatchBoost, 100);

        return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Normalize search query
     * @param {String} query - Raw query
     * @returns {String} Normalized query
     */
    normalizeQuery(query) {
        return query
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    /**
     * Expand query with synonyms
     * Algorithm #14 - Search Optimization (Synonym Expansion)
     * @param {String} query - Normalized query
     * @returns {String} Expanded query
     */
    expandQueryWithSynonyms(query) {
        const terms = query.split(/\s+/);
        const expandedTerms = new Set(terms);

        terms.forEach(term => {
            if (this.synonyms[term]) {
                this.synonyms[term].forEach(synonym => expandedTerms.add(synonym));
            }
        });

        return Array.from(expandedTerms).join(' ');
    }

    /**
     * Suggest spelling corrections for query
     * Algorithm #14 - Search Optimization (Spell Correction)
     * @param {String} query - Search query
     * @returns {Array} Suggested corrections
     */
    suggestCorrections(query) {
        // Common misspellings dictionary
        const corrections = {
            'jaket': 'jacket',
            'shrt': 'shirt',
            'pant': 'pants',
            'shose': 'shoes',
            'womn': 'women',
            'mn': 'men',
            'kid': 'kids'
        };

        const terms = query.toLowerCase().split(/\s+/);
        const correctedTerms = terms.map(term => corrections[term] || term);

        if (correctedTerms.join(' ') !== query.toLowerCase()) {
            return [correctedTerms.join(' ')];
        }

        return [];
    }

    /**
     * Get matched terms from product
     * @param {Object} product - Product object
     * @param {String} query - Search query
     * @returns {Array} Matched terms
     */
    getMatchedTerms(product, query) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const productText = `${product.name} ${product.description || ''}`.toLowerCase();

        return queryTerms.filter(term => productText.includes(term));
    }

    /**
     * Get popular products as fallback for zero results
     * @param {Number} limit - Number of products to return
     * @returns {Promise<Array>} Popular products
     */
    async getPopularFallback(limit = 10) {
        try {
            const products = await Product.find({})
                .sort({ popularity: -1 })
                .limit(limit)
                .lean();

            return products;
        } catch (error) {
            throw new Error(`Error fetching popular products: ${error.message}`);
        }
    }
}

module.exports = new SearchService();
