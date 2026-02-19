const SellerProfile = require('../models/SellerProfile');
const AuthUser = require('../models/AuthUser');
const AuditService = require('../services/AuditService');

class SellerController {
    /**
     * Create seller profile
     * POST /api/seller/profile
     * Requires seller role
     */
    async createProfile(req, res) {
        try {
            const { businessName, businessAddress, phoneNumber, taxId, bankAccount, description } = req.body;

            // Check if seller already has a profile
            const existingProfile = await SellerProfile.findOne({ userId: req.user.userId });

            if (existingProfile) {
                return res.status(400).json({
                    success: false,
                    error: 'Seller profile already exists'
                });
            }

            // Create seller profile
            const sellerProfile = new SellerProfile({
                userId: req.user.userId,
                businessName,
                businessAddress,
                phoneNumber,
                taxId,
                bankAccount,
                description,
                isApproved: false,
                isActive: true
            });

            await sellerProfile.save();

            // Update user's sellerId reference
            await AuthUser.findByIdAndUpdate(req.user.userId, {
                sellerId: sellerProfile._id
            });

            res.status(201).json({
                success: true,
                message: 'Seller profile created successfully',
                data: sellerProfile
            });
        } catch (error) {
            console.error('Create seller profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Error creating seller profile',
                message: error.message
            });
        }
    }

    /**
     * Get own seller profile
     * GET /api/seller/profile
     * Requires seller role
     */
    async getOwnProfile(req, res) {
        try {
            const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            res.status(200).json({
                success: true,
                data: sellerProfile
            });
        } catch (error) {
            console.error('Get seller profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching seller profile',
                message: error.message
            });
        }
    }

    /**
     * Update seller profile
     * PUT /api/seller/profile
     * Requires seller role
     */
    async updateProfile(req, res) {
        try {
            const { businessName, businessAddress, phoneNumber, description } = req.body;

            const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            // Update fields
            if (businessName) sellerProfile.businessName = businessName;
            if (businessAddress) sellerProfile.businessAddress = businessAddress;
            if (phoneNumber) sellerProfile.phoneNumber = phoneNumber;
            if (description) sellerProfile.description = description;

            await sellerProfile.save();

            res.status(200).json({
                success: true,
                message: 'Seller profile updated successfully',
                data: sellerProfile
            });
        } catch (error) {
            console.error('Update seller profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating seller profile',
                message: error.message
            });
        }
    }

    /**
     * Get seller profile by ID (admin only)
     * GET /api/admin/sellers/:sellerId
     * Requires admin role
     */
    async getSellerById(req, res) {
        try {
            const { sellerId } = req.params;

            const sellerProfile = await SellerProfile.findById(sellerId)
                .populate('userId', 'username email createdAt');

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            res.status(200).json({
                success: true,
                data: sellerProfile
            });
        } catch (error) {
            console.error('Get seller by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching seller profile',
                message: error.message
            });
        }
    }

    /**
     * Get all sellers (admin only)
     * GET /api/admin/sellers
     * Requires admin role
     */
    async getAllSellers(req, res) {
        try {
            const { isApproved, isActive, page = 1, limit = 50 } = req.query;

            const query = {};
            if (isApproved !== undefined) query.isApproved = isApproved === 'true';
            if (isActive !== undefined) query.isActive = isActive === 'true';

            const skip = (page - 1) * limit;

            const sellers = await SellerProfile.find(query)
                .populate('userId', 'username email createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await SellerProfile.countDocuments(query);

            res.status(200).json({
                success: true,
                data: sellers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get all sellers error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching sellers',
                message: error.message
            });
        }
    }

    /**
     * Approve seller
     * POST /api/admin/sellers/:sellerId/approve
     * Requires admin role
     */
    async approveSeller(req, res) {
        try {
            const { sellerId } = req.params;

            const sellerProfile = await SellerProfile.findById(sellerId);

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            sellerProfile.isApproved = true;
            sellerProfile.approvedAt = Date.now();
            sellerProfile.approvedBy = req.user.userId;

            await sellerProfile.save();

            // Log admin action
            await AuditService.logAdminAction(
                req.user.userId,
                req.user.username,
                'approve_seller',
                'seller',
                sellerId,
                req,
                {
                    sellerUserId: sellerProfile.userId,
                    businessName: sellerProfile.businessName
                }
            );

            // Send notification to all admins about new seller registration
            const NotificationService = require('../services/NotificationService');
            await NotificationService.notifyNewSellerRegistration(sellerId);

            res.status(200).json({
                success: true,
                message: 'Seller approved successfully',
                data: sellerProfile
            });
        } catch (error) {
            console.error('Approve seller error:', error);
            res.status(500).json({
                success: false,
                error: 'Error approving seller',
                message: error.message
            });
        }
    }

    /**
     * Get my earnings (seller only)
     * GET /api/seller/earnings
     * Requires seller role
     */
    async getMyEarnings(req, res) {
        try {
            const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            // Calculate earnings (this is a simplified version)
            const totalSales = sellerProfile.totalSales || 0;
            const commission = sellerProfile.commission || 10;
            const platformFee = (totalSales * commission) / 100;
            const totalEarnings = totalSales - platformFee;

            res.status(200).json({
                success: true,
                data: {
                    totalSales,
                    totalEarnings,
                    pendingPayouts: totalEarnings, // Simplified
                    commission
                }
            });
        } catch (error) {
            console.error('Get earnings error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching earnings',
                message: error.message
            });
        }
    }

    /**
     * Reject/Deactivate seller
     * POST /api/admin/sellers/:sellerId/deactivate
     * Requires admin role
     */
    async deactivateSeller(req, res) {
        try {
            const { sellerId } = req.params;
            const { reason } = req.body;

            const sellerProfile = await SellerProfile.findById(sellerId);

            if (!sellerProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            sellerProfile.isActive = false;

            await sellerProfile.save();

            // Log admin action
            await AuditService.logAdminAction(
                req.user.userId,
                req.user.username,
                'deactivate_seller',
                'seller',
                sellerId,
                req,
                {
                    sellerUserId: sellerProfile.userId,
                    businessName: sellerProfile.businessName,
                    reason: reason || 'Not specified'
                }
            );

            res.status(200).json({
                success: true,
                message: 'Seller deactivated successfully',
                data: sellerProfile
            });
        } catch (error) {
            console.error('Deactivate seller error:', error);
            res.status(500).json({
                success: false,
                error: 'Error deactivating seller',
                message: error.message
            });
        }
    }
}

module.exports = new SellerController();
