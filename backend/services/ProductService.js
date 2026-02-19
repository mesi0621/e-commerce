const Product = require('../models/Product');

class ProductService {
    /**
     * Get all products with optional filters
     * @param {Object} filters - { category, minPrice, maxPrice, inStock, minRating, search, sort, page, limit }
     * @returns {Promise<Object>} Products with pagination
     */
    async getAllProducts(filters = {}) {
        try {
            const query = {};

            // Only show approved products (unless explicitly requesting unapproved)
            if (filters.includeUnapproved !== true) {
                query.isApproved = true;
            }

            // Search filter
            if (filters.search) {
                query.$or = [
                    { name: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } },
                    { tags: { $in: [new RegExp(filters.search, 'i')] } }
                ];
            }

            // Category filter
            if (filters.category && filters.category !== 'all') {
                if (Array.isArray(filters.category)) {
                    query.category = { $in: filters.category };
                } else {
                    query.category = filters.category;
                }
            }

            // Price range filter
            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                query.new_price = {};
                if (filters.minPrice !== undefined) {
                    query.new_price.$gte = parseFloat(filters.minPrice);
                }
                if (filters.maxPrice !== undefined) {
                    query.new_price.$lte = parseFloat(filters.maxPrice);
                }
            }

            // Stock filter
            if (filters.inStock === true || filters.inStock === 'true') {
                query.stock = { $gt: 0 };
            }

            // Rating filter
            if (filters.minRating !== undefined) {
                query.rating = { $gte: parseFloat(filters.minRating) };
            }

            // Sorting
            let sortOption = {};
            switch (filters.sort) {
                case 'price_asc':
                    sortOption = { new_price: 1 };
                    break;
                case 'price_desc':
                    sortOption = { new_price: -1 };
                    break;
                case 'name_asc':
                    sortOption = { name: 1 };
                    break;
                case 'name_desc':
                    sortOption = { name: -1 };
                    break;
                case 'rating':
                    sortOption = { rating: -1 };
                    break;
                case 'newest':
                default:
                    sortOption = { id: -1 };
                    break;
            }

            // Pagination
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 20;
            const skip = (page - 1) * limit;

            // Execute query
            const products = await Product.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Product.countDocuments(query);

            return {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching products: ${error.message}`);
        }
    }

    /**
     * Get product by ID
     * @param {Number} id - Product ID
     * @returns {Promise<Object>} Product object
     */
    async getProductById(id) {
        try {
            const product = await Product.findOne({ id }).lean();
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            throw new Error(`Error fetching product: ${error.message}`);
        }
    }

    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
        try {
            // Get the highest ID and increment
            const lastProduct = await Product.findOne().sort({ id: -1 }).limit(1);
            const newId = lastProduct ? lastProduct.id + 1 : 1;

            const product = new Product({
                ...productData,
                id: newId
            });

            await product.save();
            return product.toObject();
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    /**
     * Update product
     * @param {Number} id - Product ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(id, updates) {
        try {
            const product = await Product.findOneAndUpdate(
                { id },
                { ...updates, updatedAt: Date.now() },
                { new: true, runValidators: true }
            );

            if (!product) {
                throw new Error('Product not found');
            }

            return product.toObject();
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    /**
     * Delete product
     * @param {Number} id - Product ID
     * @returns {Promise<Object>} Deleted product
     */
    async deleteProduct(id) {
        try {
            const product = await Product.findOneAndDelete({ id });
            if (!product) {
                throw new Error('Product not found');
            }
            return product.toObject();
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }

    /**
     * Get products by category
     * @param {String|Array} categories - Category or array of categories
     * @returns {Promise<Array>} Array of products
     */
    async getProductsByCategory(categories) {
        try {
            const query = Array.isArray(categories)
                ? { category: { $in: categories } }
                : { category: categories };

            const products = await Product.find(query).lean();
            return products;
        } catch (error) {
            throw new Error(`Error fetching products by category: ${error.message}`);
        }
    }

    /**
     * Get products by price range
     * @param {Number} min - Minimum price
     * @param {Number} max - Maximum price
     * @returns {Promise<Array>} Array of products
     */
    async getProductsByPriceRange(min, max) {
        try {
            const products = await Product.find({
                new_price: { $gte: min, $lte: max }
            }).lean();
            return products;
        } catch (error) {
            throw new Error(`Error fetching products by price range: ${error.message}`);
        }
    }
}

module.exports = new ProductService();
