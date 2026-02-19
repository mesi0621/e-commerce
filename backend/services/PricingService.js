const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * PricingService - Algorithms #5, #10, #14
 * - Algorithm #5: Price Discount Calculation
 * - Algorithm #10: Cart & Checkout Calculation
 * - Algorithm #14: Dynamic Pricing
 */
class PricingService {
    /**
     * Calculate discount percentage
     * Algorithm #5: Price Discount Calculation
     * @param {Number} oldPrice - Original price
     * @param {Number} newPrice - Current price
     * @returns {Number} Discount percentage (0-100)
     */
    calculateDiscount(oldPrice, newPrice) {
        if (!oldPrice || !newPrice || oldPrice <= newPrice) {
            return 0;
        }
        return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    }

    /**
     * Format discount as string
     * @param {Number} percentage - Discount percentage
     * @returns {String} Formatted discount (e.g., "30% OFF")
     */
    formatDiscount(percentage) {
        if (percentage <= 0) return '';
        return `${percentage}% OFF`;
    }

    /**
     * Calculate cart total with coupon and tax
     * Algorithm #10: Cart & Checkout Algorithm
     * @param {String} userId - User ID
     * @param {Number} taxRate - Tax rate (default 0.1 = 10%)
     * @returns {Promise<Object>} Cart total breakdown
     */
    async calculateCartTotal(userId, taxRate = 0.1) {
        try {
            // Get user's cart
            const cart = await Cart.findOne({ userId });
            if (!cart || cart.items.length === 0) {
                return {
                    subtotal: 0,
                    discount: 0,
                    discountedSubtotal: 0,
                    tax: 0,
                    total: 0,
                    items: []
                };
            }

            // Calculate subtotal
            const subtotal = cart.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Apply coupon discount (before tax)
            let discountAmount = 0;
            let discountPercent = 0;

            if (cart.coupon && cart.coupon.code) {
                // Validate coupon
                const isValid = this.validateCoupon(cart.coupon, subtotal);

                if (isValid) {
                    discountPercent = cart.coupon.discountPercent || 0;
                    discountAmount = (subtotal * discountPercent) / 100;
                }
            }

            // Calculate discounted subtotal
            const discountedSubtotal = subtotal - discountAmount;

            // Calculate tax on discounted subtotal
            const taxAmount = discountedSubtotal * taxRate;

            // Calculate final total
            const total = discountedSubtotal + taxAmount;

            return {
                subtotal: Math.round(subtotal * 100) / 100,
                discount: Math.round(discountAmount * 100) / 100,
                discountPercent,
                discountedSubtotal: Math.round(discountedSubtotal * 100) / 100,
                tax: Math.round(taxAmount * 100) / 100,
                taxRate,
                total: Math.round(total * 100) / 100,
                items: cart.items,
                couponCode: cart.coupon?.code || null
            };
        } catch (error) {
            throw new Error(`Error calculating cart total: ${error.message}`);
        }
    }

    /**
     * Validate coupon
     * @param {Object} coupon - Coupon object
     * @param {Number} subtotal - Cart subtotal
     * @returns {Boolean} Is coupon valid
     */
    validateCoupon(coupon, subtotal) {
        if (!coupon || !coupon.code) return false;

        // Check expiry date
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return false;
        }

        // Check minimum purchase requirement
        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
            return false;
        }

        return true;
    }

    /**
     * Apply dynamic pricing based on demand and supply
     * Algorithm #14: Dynamic Pricing
     * @param {Number} productId - Product ID
     * @param {Object} options - Pricing options
     * @returns {Promise<Object>} Updated product with new price
     */
    async applyDynamicPricing(productId, options = {}) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) {
                throw new Error('Product not found');
            }

            const {
                averageStock = 100,
                competitorPrices = [],
                demandMultiplier = 1
            } = options;

            let newPrice = product.new_price;
            const costPrice = product.costPrice || product.new_price * 0.6;

            // Rule 1: High demand (stock < 20% of average) - increase by 10-20%
            if (product.stock < averageStock * 0.2) {
                const increasePercent = 0.1 + (demandMultiplier * 0.1); // 10-20%
                newPrice = product.new_price * (1 + increasePercent);
            }
            // Rule 2: Low demand (stock > 80% of average) - decrease by 10-30%
            else if (product.stock > averageStock * 0.8) {
                const decreasePercent = 0.1 + (0.2 * (product.stock / averageStock)); // 10-30%
                newPrice = product.new_price * (1 - decreasePercent);
            }

            // Rule 3: Competitor price adjustment (within ±5%)
            if (competitorPrices.length > 0) {
                const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
                const priceDiff = Math.abs(newPrice - avgCompetitorPrice);
                const maxDiff = avgCompetitorPrice * 0.05; // 5%

                if (priceDiff > maxDiff) {
                    // Adjust to be within 5% of competitor average
                    if (newPrice > avgCompetitorPrice) {
                        newPrice = avgCompetitorPrice * 1.05;
                    } else {
                        newPrice = avgCompetitorPrice * 0.95;
                    }
                }
            }

            // Rule 4: Never go below cost price
            if (newPrice < costPrice) {
                newPrice = costPrice;
            }

            // Round to 2 decimal places
            newPrice = Math.round(newPrice * 100) / 100;

            // Update product if price changed
            if (newPrice !== product.new_price) {
                product.new_price = newPrice;
                product.updatedAt = Date.now();
                await product.save();
            }

            return {
                productId,
                oldPrice: product.new_price,
                newPrice,
                priceChanged: newPrice !== product.new_price,
                reason: this.getPricingReason(product.stock, averageStock, competitorPrices)
            };
        } catch (error) {
            throw new Error(`Error applying dynamic pricing: ${error.message}`);
        }
    }

    /**
     * Get reason for price change
     * @param {Number} stock - Current stock
     * @param {Number} averageStock - Average stock level
     * @param {Array} competitorPrices - Competitor prices
     * @returns {String} Reason for price change
     */
    getPricingReason(stock, averageStock, competitorPrices) {
        if (stock < averageStock * 0.2) {
            return 'High demand - low stock';
        } else if (stock > averageStock * 0.8) {
            return 'Low demand - high stock';
        } else if (competitorPrices.length > 0) {
            return 'Competitive pricing adjustment';
        }
        return 'No change';
    }

    /**
     * Adjust price for competitors
     * @param {Number} productId - Product ID
     * @param {Array} competitorPrices - Array of competitor prices
     * @returns {Promise<Object>} Updated product
     */
    async adjustForCompetitors(productId, competitorPrices) {
        if (!competitorPrices || competitorPrices.length === 0) {
            throw new Error('No competitor prices provided');
        }

        return this.applyDynamicPricing(productId, { competitorPrices });
    }

    /**
     * Calculate tax amount
     * @param {Number} subtotal - Subtotal amount
     * @param {Number} taxRate - Tax rate (e.g., 0.1 for 10%)
     * @returns {Number} Tax amount
     */
    applyTax(subtotal, taxRate) {
        return Math.round(subtotal * taxRate * 100) / 100;
    }
}

module.exports = new PricingService();
