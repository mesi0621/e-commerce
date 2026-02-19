const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');

class CouponController {
    /**
     * Validate and apply coupon
     * POST /api/coupons/validate
     * Body: { code, userId, subtotal, shippingFee }
     */
    async validateCoupon(req, res) {
        try {
            const { code, userId, subtotal, shippingFee = 0 } = req.body;

            if (!code || !userId || subtotal === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Code, userId, and subtotal are required'
                });
            }

            // Find coupon
            const coupon = await Coupon.findOne({
                code: code.toUpperCase(),
                isActive: true
            });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid coupon code'
                });
            }

            // Check if coupon is valid
            if (!coupon.isValid()) {
                return res.status(400).json({
                    success: false,
                    error: 'Coupon has expired or reached usage limit'
                });
            }

            // Check minimum purchase amount
            if (subtotal < coupon.minPurchaseAmount) {
                return res.status(400).json({
                    success: false,
                    error: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`
                });
            }

            // Check per-user limit
            const userUsageCount = await CouponUsage.countDocuments({
                couponId: coupon._id,
                userId
            });

            if (userUsageCount >= coupon.perUserLimit) {
                return res.status(400).json({
                    success: false,
                    error: 'You have already used this coupon'
                });
            }

            // Calculate discount
            const discount = coupon.calculateDiscount(subtotal, shippingFee);

            res.json({
                success: true,
                data: {
                    couponId: coupon._id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    discount,
                    minPurchaseAmount: coupon.minPurchaseAmount
                }
            });
        } catch (error) {
            console.error('Validate coupon error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Error validating coupon'
            });
        }
    }

    /**
     * Record coupon usage
     * POST /api/coupons/use
     * Body: { couponId, userId, orderId, discountAmount }
     */
    async useCoupon(req, res) {
        try {
            const { couponId, userId, orderId, discountAmount } = req.body;

            if (!couponId || !userId || !orderId || discountAmount === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'All fields are required'
                });
            }

            // Find coupon
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    error: 'Coupon not found'
                });
            }

            // Record usage
            const usage = new CouponUsage({
                couponId,
                userId,
                orderId,
                discountAmount
            });
            await usage.save();

            // Increment usage count
            coupon.usageCount += 1;
            await coupon.save();

            res.json({
                success: true,
                message: 'Coupon usage recorded',
                data: usage
            });
        } catch (error) {
            console.error('Use coupon error:', error);
            res.status(500).json({
                success: false,
                error: 'Error recording coupon usage'
            });
        }
    }

    /**
     * Get all coupons (Admin only)
     * GET /api/coupons
     */
    async getAllCoupons(req, res) {
        try {
            const { active, page = 1, limit = 50 } = req.query;
            const query = {};

            if (active !== undefined) {
                query.isActive = active === 'true';
            }

            const skip = (page - 1) * limit;

            const coupons = await Coupon.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Coupon.countDocuments(query);

            res.json({
                success: true,
                data: coupons,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get coupons error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching coupons'
            });
        }
    }

    /**
     * Create coupon (Admin only)
     * POST /api/coupons
     */
    async createCoupon(req, res) {
        try {
            const couponData = {
                ...req.body,
                createdBy: req.user.userId
            };

            const coupon = new Coupon(couponData);
            await coupon.save();

            res.status(201).json({
                success: true,
                message: 'Coupon created successfully',
                data: coupon
            });
        } catch (error) {
            console.error('Create coupon error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Error creating coupon'
            });
        }
    }

    /**
     * Update coupon (Admin only)
     * PUT /api/coupons/:id
     */
    async updateCoupon(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const coupon = await Coupon.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            );

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    error: 'Coupon not found'
                });
            }

            res.json({
                success: true,
                message: 'Coupon updated successfully',
                data: coupon
            });
        } catch (error) {
            console.error('Update coupon error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Error updating coupon'
            });
        }
    }

    /**
     * Delete coupon (Admin only)
     * DELETE /api/coupons/:id
     */
    async deleteCoupon(req, res) {
        try {
            const { id } = req.params;

            const coupon = await Coupon.findByIdAndDelete(id);

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    error: 'Coupon not found'
                });
            }

            res.json({
                success: true,
                message: 'Coupon deleted successfully'
            });
        } catch (error) {
            console.error('Delete coupon error:', error);
            res.status(500).json({
                success: false,
                error: 'Error deleting coupon'
            });
        }
    }
}

module.exports = new CouponController();
