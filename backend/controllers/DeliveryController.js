const Order = require('../models/Order');
const AuthUser = require('../models/AuthUser');
const NotificationService = require('../services/NotificationService');

class DeliveryController {
    /**
     * Assign delivery to delivery staff (Admin only)
     * POST /api/deliveries/assign
     * Requires admin role
     * 
     * Body: {
     *   orderId: string,
     *   deliveryStaffId: string,
     *   estimatedDeliveryDate: date (optional)
     * }
     */
    async assignDelivery(req, res) {
        try {
            const { orderId, deliveryStaffId, estimatedDeliveryDate } = req.body;

            // Validate required fields
            if (!orderId || !deliveryStaffId) {
                return res.status(400).json({
                    success: false,
                    error: 'Order ID and Delivery Staff ID are required'
                });
            }

            // Find order
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            // Check if order is in a valid state for delivery assignment
            const validStatuses = ['confirmed', 'processing', 'shipped'];
            if (!validStatuses.includes(order.orderStatus)) {
                return res.status(400).json({
                    success: false,
                    error: `Order must be in one of these statuses: ${validStatuses.join(', ')}`
                });
            }

            // Verify delivery staff exists and has delivery role
            const deliveryStaff = await AuthUser.findById(deliveryStaffId);
            if (!deliveryStaff) {
                return res.status(404).json({
                    success: false,
                    error: 'Delivery staff not found'
                });
            }

            if (deliveryStaff.role !== 'delivery') {
                return res.status(400).json({
                    success: false,
                    error: 'User is not a delivery staff member'
                });
            }

            // Assign delivery
            order.deliveryStaffId = deliveryStaffId;
            order.deliveryStatus = 'assigned';
            order.deliveryAssignedAt = Date.now();
            order.deliveryAssignedBy = req.user.userId;

            if (estimatedDeliveryDate) {
                order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
            }

            // Add to status history
            order.statusHistory.push({
                status: 'delivery_assigned',
                timestamp: Date.now(),
                note: `Delivery assigned to ${deliveryStaff.username}`,
                updatedBy: req.user.userId
            });

            await order.save();

            // Send notification to delivery staff
            await NotificationService.createNotification(
                deliveryStaffId,
                'delivery',
                'New Delivery Assignment',
                `You have been assigned to deliver order ${order.orderNumber}`,
                { orderId: order._id, orderNumber: order.orderNumber },
                `/delivery/orders/${order._id}`
            );

            res.json({
                success: true,
                message: 'Delivery assigned successfully',
                data: order
            });
        } catch (error) {
            console.error('Assign delivery error:', error);
            res.status(500).json({
                success: false,
                error: 'Error assigning delivery',
                message: error.message
            });
        }
    }

    /**
     * Get assigned deliveries for delivery staff
     * GET /api/deliveries/my-deliveries
     * Requires delivery role
     */
    async getMyDeliveries(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const query = { deliveryStaffId: req.user.userId };

            if (status) {
                query.deliveryStatus = status;
            }

            const skip = (page - 1) * limit;

            const deliveries = await Order.find(query)
                .populate('userId', 'username email phone')
                .sort({ deliveryAssignedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Order.countDocuments(query);

            res.json({
                success: true,
                data: deliveries,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get my deliveries error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching deliveries',
                message: error.message
            });
        }
    }

    /**
     * Get delivery details by order ID
     * GET /api/deliveries/:orderId
     * Requires delivery role
     */
    async getDeliveryById(req, res) {
        try {
            const { orderId } = req.params;

            const order = await Order.findById(orderId)
                .populate('userId', 'username email phone')
                .populate('deliveryStaffId', 'username email phone');

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            // Verify delivery staff is assigned to this order
            if (order.deliveryStaffId.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - delivery not assigned to you'
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Get delivery by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching delivery',
                message: error.message
            });
        }
    }

    /**
     * Update delivery status
     * PUT /api/deliveries/:orderId/status
     * Requires delivery role
     */
    async updateDeliveryStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status, notes } = req.body;

            // Validate status
            const validStatuses = ['assigned', 'in_transit', 'delivered', 'failed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            // Verify delivery staff is assigned to this order
            if (!order.deliveryStaffId || order.deliveryStaffId.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - delivery not assigned to you'
                });
            }

            // Update delivery status
            order.deliveryStatus = status;

            if (notes) {
                order.deliveryNotes = notes;
            }

            // Update timestamps based on status
            if (status === 'in_transit' && !order.deliveryStartedAt) {
                order.deliveryStartedAt = Date.now();
                order.orderStatus = 'shipped';
            }

            if (status === 'delivered') {
                order.actualDeliveryDate = Date.now();
                order.orderStatus = 'delivered';
            }

            if (status === 'failed') {
                order.orderStatus = 'processing'; // Reset to processing for reassignment
            }

            // Add to status history
            order.statusHistory.push({
                status: `delivery_${status}`,
                timestamp: Date.now(),
                note: notes || `Delivery status updated to ${status}`,
                updatedBy: req.user.userId
            });

            await order.save();

            // Send notification to customer
            if (status === 'in_transit') {
                await NotificationService.createNotification(
                    order.userId,
                    'order',
                    'Order Out for Delivery',
                    `Your order ${order.orderNumber} is on its way!`,
                    { orderId: order._id, orderNumber: order.orderNumber },
                    `/orders/${order._id}`
                );
            } else if (status === 'delivered') {
                await NotificationService.notifyOrderDelivered(order._id);
            }

            res.json({
                success: true,
                message: 'Delivery status updated successfully',
                data: order
            });
        } catch (error) {
            console.error('Update delivery status error:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating delivery status',
                message: error.message
            });
        }
    }

    /**
     * Get all deliveries (Admin only)
     * GET /api/deliveries/admin/all
     * Requires admin role
     */
    async getAllDeliveries(req, res) {
        try {
            const { status, deliveryStaffId, page = 1, limit = 50 } = req.query;
            const query = { deliveryStaffId: { $exists: true } };

            if (status) {
                query.deliveryStatus = status;
            }

            if (deliveryStaffId) {
                query.deliveryStaffId = deliveryStaffId;
            }

            const skip = (page - 1) * limit;

            const deliveries = await Order.find(query)
                .populate('userId', 'username email phone')
                .populate('deliveryStaffId', 'username email phone')
                .sort({ deliveryAssignedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Order.countDocuments(query);

            res.json({
                success: true,
                data: deliveries,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get all deliveries error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching deliveries',
                message: error.message
            });
        }
    }

    /**
     * Unassign delivery (Admin only)
     * POST /api/deliveries/:orderId/unassign
     * Requires admin role
     */
    async unassignDelivery(req, res) {
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

            if (!order.deliveryStaffId) {
                return res.status(400).json({
                    success: false,
                    error: 'No delivery staff assigned to this order'
                });
            }

            const previousDeliveryStaffId = order.deliveryStaffId;

            // Unassign delivery
            order.deliveryStaffId = null;
            order.deliveryStatus = 'pending';
            order.deliveryNotes = reason || 'Delivery unassigned by admin';

            // Add to status history
            order.statusHistory.push({
                status: 'delivery_unassigned',
                timestamp: Date.now(),
                note: reason || 'Delivery unassigned by admin',
                updatedBy: req.user.userId
            });

            await order.save();

            // Notify previous delivery staff
            await NotificationService.createNotification(
                previousDeliveryStaffId,
                'delivery',
                'Delivery Unassigned',
                `Order ${order.orderNumber} has been unassigned from you`,
                { orderId: order._id, orderNumber: order.orderNumber, reason }
            );

            res.json({
                success: true,
                message: 'Delivery unassigned successfully',
                data: order
            });
        } catch (error) {
            console.error('Unassign delivery error:', error);
            res.status(500).json({
                success: false,
                error: 'Error unassigning delivery',
                message: error.message
            });
        }
    }

    /**
     * Get available delivery staff (Admin only)
     * GET /api/deliveries/staff/available
     * Requires admin role
     */
    async getAvailableDeliveryStaff(req, res) {
        try {
            // Get all delivery staff
            const deliveryStaff = await AuthUser.find({
                role: 'delivery',
                isActive: true
            }).select('username email phone');

            // Get active delivery counts for each staff
            const staffWithCounts = await Promise.all(
                deliveryStaff.map(async (staff) => {
                    const activeDeliveries = await Order.countDocuments({
                        deliveryStaffId: staff._id,
                        deliveryStatus: { $in: ['assigned', 'in_transit'] }
                    });

                    return {
                        _id: staff._id,
                        username: staff.username,
                        email: staff.email,
                        phone: staff.phone,
                        activeDeliveries
                    };
                })
            );

            // Sort by active deliveries (least busy first)
            staffWithCounts.sort((a, b) => a.activeDeliveries - b.activeDeliveries);

            res.json({
                success: true,
                data: staffWithCounts
            });
        } catch (error) {
            console.error('Get available delivery staff error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching delivery staff',
                message: error.message
            });
        }
    }
}

module.exports = new DeliveryController();
