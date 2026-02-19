/**
 * FilterService - Algorithm #3: Category Filtering
 * Handles product filtering by various criteria
 */
class FilterService {
    /**
     * Build MongoDB query from filter criteria
     * @param {Object} criteria - Filter criteria
     * @returns {Object} MongoDB query object
     */
    buildFilterQuery(criteria = {}) {
        const query = {};

        // Category filter (single or multiple)
        if (criteria.categories) {
            if (Array.isArray(criteria.categories) && criteria.categories.length > 0) {
                query.category = { $in: criteria.categories };
            } else if (typeof criteria.categories === 'string') {
                query.category = criteria.categories;
            }
        }

        // Price range filter
        if (criteria.priceRange) {
            query.new_price = {};
            if (criteria.priceRange.min !== undefined) {
                query.new_price.$gte = parseFloat(criteria.priceRange.min);
            }
            if (criteria.priceRange.max !== undefined) {
                query.new_price.$lte = parseFloat(criteria.priceRange.max);
            }
        }

        // Stock availability filter
        if (criteria.inStock !== undefined) {
            if (criteria.inStock === true || criteria.inStock === 'true') {
                query.stock = { $gt: 0 };
            } else if (criteria.inStock === false || criteria.inStock === 'false') {
                query.stock = { $lte: 0 };
            }
        }

        // Rating filter
        if (criteria.minRating !== undefined) {
            query.rating = { $gte: parseFloat(criteria.minRating) };
        }

        // Discount filter (products with discount)
        if (criteria.hasDiscount === true || criteria.hasDiscount === 'true') {
            query.$expr = { $lt: ['$new_price', '$old_price'] };
        }

        return query;
    }

    /**
     * Apply filters to existing query
     * @param {Object} baseQuery - Base MongoDB query
     * @param {Object} filters - Additional filters
     * @returns {Object} Combined query
     */
    applyFilters(baseQuery, filters) {
        const filterQuery = this.buildFilterQuery(filters);
        return { ...baseQuery, ...filterQuery };
    }

    /**
     * Filter products array by category (client-side filtering)
     * @param {Array} products - Array of products
     * @param {String|Array} categories - Category or categories
     * @returns {Array} Filtered products
     */
    filterByCategory(products, categories) {
        if (!categories) return products;

        const categoryArray = Array.isArray(categories) ? categories : [categories];
        return products.filter(product => categoryArray.includes(product.category));
    }

    /**
     * Filter products array by price range (client-side filtering)
     * @param {Array} products - Array of products
     * @param {Number} min - Minimum price
     * @param {Number} max - Maximum price
     * @returns {Array} Filtered products
     */
    filterByPriceRange(products, min, max) {
        return products.filter(product => {
            const price = product.new_price;
            const meetsMin = min === undefined || price >= min;
            const meetsMax = max === undefined || price <= max;
            return meetsMin && meetsMax;
        });
    }

    /**
     * Filter products by availability (client-side filtering)
     * @param {Array} products - Array of products
     * @param {Boolean} inStock - Filter for in-stock products
     * @returns {Array} Filtered products
     */
    filterByAvailability(products, inStock) {
        if (inStock === undefined) return products;

        return products.filter(product => {
            return inStock ? product.stock > 0 : product.stock <= 0;
        });
    }

    /**
     * Filter products by rating (client-side filtering)
     * @param {Array} products - Array of products
     * @param {Number} minRating - Minimum rating
     * @returns {Array} Filtered products
     */
    filterByRating(products, minRating) {
        if (minRating === undefined) return products;

        return products.filter(product => product.rating >= minRating);
    }
}

module.exports = new FilterService();
