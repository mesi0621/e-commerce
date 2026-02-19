/**
 * SortService - Algorithm #4: Sorting Algorithms
 * Handles product sorting by various criteria with stable ordering
 */
class SortService {
    /**
     * Build MongoDB sort object from criteria
     * @param {Object} criteria - Sort criteria { field, order }
     * @returns {Object} MongoDB sort object
     */
    buildSortQuery(criteria = {}) {
        const { field = 'id', order = 'asc' } = criteria;
        const sortOrder = order === 'desc' ? -1 : 1;

        const sortQuery = {};

        switch (field) {
            case 'price':
                sortQuery.new_price = sortOrder;
                sortQuery.id = 1; // Stable sort by ID
                break;

            case 'discount':
                // Sort by discount percentage (calculated field)
                // We'll handle this in the service layer
                sortQuery._discountPercent = sortOrder;
                sortQuery.id = 1;
                break;

            case 'popularity':
                sortQuery.popularity = sortOrder;
                sortQuery.id = 1;
                break;

            case 'rating':
                sortQuery.rating = sortOrder;
                sortQuery.id = 1;
                break;

            case 'name':
                sortQuery.name = sortOrder;
                sortQuery.id = 1;
                break;

            case 'newest':
                sortQuery.createdAt = -1;
                sortQuery.id = 1;
                break;

            default:
                sortQuery.id = sortOrder;
        }

        return sortQuery;
    }

    /**
     * Sort products array (client-side sorting)
     * @param {Array} products - Array of products
     * @param {Object} criteria - Sort criteria { field, order }
     * @returns {Array} Sorted products
     */
    sort(products, criteria = {}) {
        const { field = 'id', order = 'asc' } = criteria;
        const sortedProducts = [...products];

        sortedProducts.sort((a, b) => {
            let comparison = 0;

            switch (field) {
                case 'price':
                    comparison = this.compareByPrice(a, b);
                    break;

                case 'discount':
                    comparison = this.compareByDiscount(a, b);
                    break;

                case 'popularity':
                    comparison = this.compareByPopularity(a, b);
                    break;

                case 'rating':
                    comparison = this.compareByRating(a, b);
                    break;

                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;

                case 'newest':
                    comparison = new Date(b.createdAt) - new Date(a.createdAt);
                    break;

                default:
                    comparison = a.id - b.id;
            }

            // Apply sort order
            if (order === 'desc') {
                comparison = -comparison;
            }

            // Stable sort: if equal, sort by ID
            if (comparison === 0) {
                comparison = a.id - b.id;
            }

            return comparison;
        });

        return sortedProducts;
    }

    /**
     * Compare products by price
     * @param {Object} a - Product A
     * @param {Object} b - Product B
     * @returns {Number} Comparison result
     */
    compareByPrice(a, b) {
        return a.new_price - b.new_price;
    }

    /**
     * Compare products by discount percentage
     * Algorithm #5: Price Discount Calculation
     * @param {Object} a - Product A
     * @param {Object} b - Product B
     * @returns {Number} Comparison result
     */
    compareByDiscount(a, b) {
        const discountA = this.calculateDiscountPercent(a.old_price, a.new_price);
        const discountB = this.calculateDiscountPercent(b.old_price, b.new_price);
        return discountA - discountB;
    }

    /**
     * Compare products by popularity
     * @param {Object} a - Product A
     * @param {Object} b - Product B
     * @returns {Number} Comparison result
     */
    compareByPopularity(a, b) {
        return (a.popularity || 0) - (b.popularity || 0);
    }

    /**
     * Compare products by rating
     * @param {Object} a - Product A
     * @param {Object} b - Product B
     * @returns {Number} Comparison result
     */
    compareByRating(a, b) {
        return (a.rating || 0) - (b.rating || 0);
    }

    /**
     * Calculate discount percentage
     * @param {Number} oldPrice - Original price
     * @param {Number} newPrice - Current price
     * @returns {Number} Discount percentage
     */
    calculateDiscountPercent(oldPrice, newPrice) {
        if (oldPrice <= newPrice) return 0;
        return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    }

    /**
     * Sort products with discount calculation
     * @param {Array} products - Array of products
     * @param {String} order - Sort order ('asc' or 'desc')
     * @returns {Array} Sorted products with discount field
     */
    sortByDiscount(products, order = 'desc') {
        const productsWithDiscount = products.map(product => ({
            ...product,
            _discountPercent: this.calculateDiscountPercent(product.old_price, product.new_price)
        }));

        return this.sort(productsWithDiscount, { field: 'discount', order });
    }
}

module.exports = new SortService();
