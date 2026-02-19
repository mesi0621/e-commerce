const Order = require('../models/Order');
const AuditService = require('../services/AuditService');

/**
 * Request refund for an order
 * POST /api/refunds/request
 * Requires authentication
 */
async function requestRefund(req, res) {
    try {
        const { orderId, reason, amount } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to request refund for this order'
            });
        }

        if (order.refundStatus && order.refundStatus !== 'none') {
            return res.status(400).json({
                success: false,
                error: 'Refund already requested for this order'
            });
        }

        order.refundStatus = 'requested';
        order.refundReason = reason;
        order.refundAmount = amount || order.total;
        order.refundRequestedAt = Date.now();

        await order.save();

        res.json({
            success: true,
            message: 'Refund requested successfully',
            data: order
        });
    } catch (error) {
        console.error('Request refund error:', error);
        res.status(500).json({
            success: false,
            error: 'Error requesting refund',
            message: error.message
        });
    }
}

/**
 * Get all refund requests (admin only)
 * GET /api/refunds/admin/all
 * Requires admin role
 */
async function getAllRefunds(req, res) {
    try {
        const { status, page = 1, limit = 50 } = req.query;

        const query = { refundStatus: { $ne: 'none' } };
        if (status) query.refundStatus = status;

        const skip = (page - 1) * limit;

        const refunds = await Order.find(query)
            .populate('userId', 'username email')
            .sort({ refundRequestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: refunds,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get refunds error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching refunds',
            message: error.message
        });
    }
}

/**
 * Approve refund (admin only)
 * POST /api/refunds/:orderId/approve
 * Requires admin role
 */
async function approveRefund(req, res) {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.refundStatus !== 'requested') {
            return res.status(400).json({
                success: false,
                error: 'No refund request found for this order'
            });
        }

        order.refundStatus = 'approved';
        order.refundApprovedAt = Date.now();
        order.refundApprovedBy = req.user.userId;

        await order.save();

        await AuditService.logAdminAction(
            req.user.userId,
            req.user.username,
            'approve_refund',
            'order',
            orderId,
            req,
            {
                orderNumber: order.orderNumber,
                refundAmount: order.refundAmount
            }
        );

        res.json({
            success: true,
            message: 'Refund approved successfully',
            data: order
        });
    } catch (error) {
        console.error('Approve refund error:', error);
        res.status(500).json({
            success: false,
            error: 'Error approving refund',
            message: error.message
        });
    }
}

/**
 * Reject refund (admin only)
 * POST /api/refunds/:orderId/reject
 * Requires admin role
 */
async function rejectRefund(req, res) {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.refundStatus !== 'requested') {
            return res.status(400).json({
                success: false,
                error: 'No refund request found for this order'
            });
        }

        order.refundStatus = 'rejected';
        order.refundRejectedAt = Date.now();
        order.refundRejectedBy = req.user.userId;
        order.refundRejectionReason = reason;

        await order.save();

        await AuditService.logAdminAction(
            req.user.userId,
            req.user.username,
            'reject_refund',
            'order',
            orderId,
            req,
            {
                orderNumber: order.orderNumber,
                reason: reason || 'Not specified'
            }
        );

        res.json({
            success: true,
            message: 'Refund rejected successfully',
            data: order
        });
    } catch (error) {
        console.error('Reject refund error:', error);
        res.status(500).json({
            success: false,
            error: 'Error rejecting refund',
            message: error.message
        });
    }
}

module.exports = {
    requestRefund,
    getAllRefunds,
    approveRefund,
    rejectRefund
};
