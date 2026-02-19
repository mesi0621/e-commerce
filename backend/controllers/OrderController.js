const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AuthUser = require('../models/AuthUser');
const EmailService = require('../services/EmailService');
const NotificationService = require('../services/NotificationService');

class OrderController {
    /**
     * Create new order from cart - Step 1-3 of Payment Flow
     * POST /api/orders
     * Requires authentication
     * 
     * Flow:
     * 1. Validate cart
     * 2. Validate shipping address
     * 3. Create Order with status "pending"
     * 4. DO NOT reduce stock yet (wait for payment confirmation)
     * 5. Return order for payment processing
     */
    async createOrder(req, res) {
        try {
            const { shippingAddress, paymentMethod, notes } = req.body;

            console.log('📝 Step 1: Creating order for user:', req.user.userId);
            console.log('📝 User details from token:', req.user);

            // Step 1: Validate shipping address
            if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
                !shippingAddress.address || !shippingAddress.city || !shippingAddress.region) {
                return res.status(400).json({
                    success: false,
                    error: 'Complete shipping address is required'
                });
            }

            // Step 2: Validate cart
            const cart = await Cart.findOne({ userId: req.user.userId });

            console.log('🔍 Cart lookup result:', cart ? `Found cart with ${cart.items.length} items` : 'No cart found');
            console.log('🔍 Cart details:', cart);

            if (!cart || cart.items.length === 0) {
                console.log('❌ Cart validation failed - cart is empty or not found');
                return res.status(400).json({
                    success: false,
                    error: 'Cart is empty'
                });
            }

            console.log('✅ Step 2: Cart validated with', cart.items.length, 'items');

            // Step 2.1: Validate stock availability for all items
            for (const item of cart.items) {
                const product = await Product.findOne({ id: item.productId });
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        error: `Product ${item.productId} not found`
                    });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        error: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
                    });
                }
            }

            console.log('✅ Step 2.2: Stock validated for all items');

            // Step 2.2: Enrich cart items with product details
            const enrichedItems = await Promise.all(cart.items.map(async (item) => {
                const product = await Product.findOne({ id: item.productId });
                return {
                    productId: item.productId,
                    name: product.name,
                    image: product.image,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity
                };
            }));

            // Calculate totals
            const subtotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = subtotal * 0.15; // 15% tax
            const shippingFee = subtotal > 1000 ? 0 : 50; // Free shipping over 1000 ETB
            const total = subtotal + tax + shippingFee;

            console.log('💰 Totals calculated:', { subtotal, tax, shippingFee, total });
            console.log('💳 Payment method for order:', paymentMethod);

            // Generate unique order number
            const orderCount = await Order.countDocuments();
            const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(5, '0')}`;
            console.log('🔢 Generated order number:', orderNumber);

            // Step 3: Create order with "pending" status
            const order = new Order({
                orderNumber,
                userId: req.user.userId,
                items: enrichedItems,
                subtotal,
                tax,
                shippingFee,
                total,
                paymentMethod,
                paymentStatus: 'pending', // Payment not yet processed
                shippingAddress,
                notes,
                orderStatus: 'pending', // Order pending payment
                statusHistory: [{
                    status: 'pending',
                    timestamp: Date.now(),
                    note: 'Order created, awaiting payment'
                }]
            });

            await order.save();

            console.log('✅ Step 3: Order created with ID:', order._id, 'Order Number:', order.orderNumber);

            // NOTE: DO NOT clear cart here - wait until payment is confirmed
            // If payment fails, user can retry without re-adding items
            console.log('⏳ Cart will be cleared after payment confirmation');

            // NOTE: Stock is NOT reduced here - it will be reduced after payment confirmation
            console.log('⏳ Stock will be reduced after payment confirmation');

            res.status(201).json({
                success: true,
                message: 'Order created successfully, proceed to payment',
                data: order
            });
        } catch (error) {
            console.error('❌ Create order error:', error);
            res.status(500).json({
                success: false,
                error: 'Error creating order',
                message: error.message
            });
        }
    }

    /**
     * Get user's orders (Role-based filtering)
     * GET /api/orders
     * Requires authentication
     * 
     * Role-based behavior:
     * - Customer: See only their own orders
     * - Seller: See orders containing their products
     * - Admin: See all orders
     * - Delivery: See assigned deliveries
     */
    async getUserOrders(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const userRole = req.user.role;
            let query = {};

            // Role-based filtering
            if (userRole === 'admin') {
                // Admin sees all orders
                if (status) query.orderStatus = status;
            } else if (userRole === 'seller') {
                // Seller sees orders containing their products
                const SellerProfile = require('../models/SellerProfile');
                const Product = require('../models/Product');

                const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });
                if (!sellerProfile) {
                    return res.status(404).json({
                        success: false,
                        error: 'Seller profile not found'
                    });
                }

                const sellerProducts = await Product.find({ sellerId: sellerProfile._id });
                const sellerProductIds = sellerProducts.map(p => p.id);

                query = { 'items.productId': { $in: sellerProductIds } };
                if (status) query.orderStatus = status;
            } else if (userRole === 'delivery') {
                // Delivery staff sees assigned deliveries
                query = {
                    deliveryStaffId: req.user.userId,
                    orderStatus: { $in: ['processing', 'shipped', 'delivered'] }
                };
                if (status) query.orderStatus = status;
            } else {
                // Customer sees only their own orders
                query = { userId: req.user.userId };
                if (status) query.orderStatus = status;
            }

            const skip = (page - 1) * limit;

            const orders = await Order.find(query)
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Order.countDocuments(query);

            res.json({
                success: true,
                data: orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get user orders error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching orders',
                message: error.message
            });
        }
    }

    /**
     * Get order by ID (Role-based access control)
     * GET /api/orders/:orderId
     * Requires authentication
     * 
     * Access control:
     * - Customer: Can only view their own orders
     * - Seller: Can view orders containing their products
     * - Admin: Can view any order
     * - Delivery: Can view assigned deliveries
     */
    async getOrderById(req, res) {
        try {
            const { orderId } = req.params;
            const userRole = req.user.role;

            const order = await Order.findById(orderId).populate('userId', 'username email');

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            // Role-based access control
            if (userRole === 'admin') {
                // Admin can view any order
                return res.json({
                    success: true,
                    data: order
                });
            } else if (userRole === 'seller') {
                // Seller can only view orders containing their products
                const SellerProfile = require('../models/SellerProfile');
                const Product = require('../models/Product');

                const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });
                if (!sellerProfile) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied'
                    });
                }

                const sellerProducts = await Product.find({ sellerId: sellerProfile._id });
                const sellerProductIds = sellerProducts.map(p => p.id);

                const hasSellerProduct = order.items.some(item =>
                    sellerProductIds.includes(item.productId)
                );

                if (!hasSellerProduct) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied - order does not contain your products'
                    });
                }

                return res.json({
                    success: true,
                    data: order
                });
            } else if (userRole === 'delivery') {
                // Delivery staff can only view assigned deliveries
                if (order.deliveryStaffId && order.deliveryStaffId.toString() === req.user.userId) {
                    return res.json({
                        success: true,
                        data: order
                    });
                } else {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied - delivery not assigned to you'
                    });
                }
            } else {
                // Customer can only view their own orders
                if (order.userId.toString() !== req.user.userId) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied - not your order'
                    });
                }

                return res.json({
                    success: true,
                    data: order
                });
            }
        } catch (error) {
            console.error('Get order by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching order',
                message: error.message
            });
        }
    }
                return res.status(404).json({
        success: false,
        error: 'Order not found'
    });
            }

// Check if user owns the order or is admin
if (order.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({
        success: false,
        error: 'Access denied'
    });
}

res.json({
    success: true,
    data: order
});
        } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
        success: false,
        error: 'Error fetching order',
        message: error.message
    });
}
    }

    /**
     * Cancel order
     * POST /api/orders/:orderId/cancel
     * Requires authentication
     */
    async cancelOrder(req, res) {
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

        // Check ownership
        if (order.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel order with status: ${order.orderStatus}`
            });
        }

        order.orderStatus = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: Date.now(),
            note: reason || 'Cancelled by customer',
            updatedBy: req.user.userId
        });

        await order.save();

        // Restore product stock if payment was completed
        if (order.paymentStatus === 'completed') {
            for (const item of order.items) {
                await Product.findOneAndUpdate(
                    { id: item.productId },
                    { $inc: { stock: item.quantity } }
                );
            }
            console.log('✅ Stock restored for cancelled order');
        }

        // Send cancellation email
        const user = await AuthUser.findById(order.userId);
        if (user && user.email) {
            EmailService.sendOrderCancelledEmail(user.email, order, reason)
                .catch(err => console.error('Error sending cancellation email:', err));
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            error: 'Error cancelling order',
            message: error.message
        });
    }
}

    /**
     * Confirm payment and complete order - Steps 6-9 of Payment Flow
     * POST /api/orders/:orderId/confirm-payment
     * Called by payment gateway webhook or after payment verification
     * 
     * Flow:
     * 6. Receive payment confirmation
     * 7. Update order status to "confirmed"
     * 8. Reduce product stock
     * 9. Send confirmation (email/notification)
     */
    async confirmPayment(req, res) {
    try {
        const { orderId } = req.params;
        const { transactionId, paymentGatewayResponse } = req.body;

        console.log('💳 Step 6: Payment confirmation received for order:', orderId);

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if already processed
        if (order.paymentStatus === 'completed') {
            return res.json({
                success: true,
                message: 'Payment already processed',
                data: order
            });
        }

        // Step 7: Update order status
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.paymentDetails = {
            transactionId: transactionId || `TXN-${Date.now()}`,
            paymentDate: Date.now(),
            paymentGatewayResponse
        };
        order.statusHistory.push({
            status: 'confirmed',
            timestamp: Date.now(),
            note: 'Payment confirmed, order processing'
        });

        await order.save();

        console.log('✅ Step 7: Order status updated to confirmed');

        // Step 8: Reduce product stock
        for (const item of order.items) {
            const product = await Product.findOne({ id: item.productId });

            if (product) {
                // Check if stock is still available
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    await product.save();
                    console.log(`📦 Reduced stock for product ${item.productId}: ${item.quantity} units`);
                } else {
                    console.warn(`⚠️ Warning: Insufficient stock for product ${item.productId}`);
                    // Log this for manual review but don't fail the order
                }
            }
        }

        console.log('✅ Step 8: Stock reduced for all items');

        // Step 8.1: Clear cart after successful payment
        const Cart = require('../models/Cart');
        const cart = await Cart.findOne({ userId: order.userId });
        if (cart) {
            cart.items = [];
            await cart.save();
            console.log('🗑️ Cart cleared after payment confirmation');
        }

        // Step 9: Send confirmation email
        console.log('📧 Step 9: Sending confirmation to user...');
        const user = await AuthUser.findById(order.userId);
        if (user && user.email) {
            // Send comprehensive notifications to all parties
            const admin = await AuthUser.findOne({ role: 'admin' });
            const sellers = await AuthUser.find({ role: 'seller' }); // Get all sellers for now

            if (admin && sellers.length > 0) {
                await EmailService.sendPurchaseNotifications(order, user, admin, sellers);
            } else {
                // Fallback to just customer confirmation if admin/sellers not found
                console.log('⚠️ Admin or sellers not found, skipping comprehensive notifications');
            }
        }

        // Send notification
        await NotificationService.notifyOrderConfirmed(order._id);

        res.json({
            success: true,
            message: 'Payment confirmed and order processed successfully',
            data: order
        });
    } catch (error) {
        console.error('❌ Confirm payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Error confirming payment',
            message: error.message
        });
    }
}

    /**
     * Get all orders (Admin only)
     * GET /api/orders/admin/all
     * Requires admin role
     */
    async getAllOrders(req, res) {
    try {
        const { page = 1, limit = 50, status, paymentStatus } = req.query;
        const query = {};

        if (status) query.orderStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching orders',
            message: error.message
        });
    }
}

    /**
     * Get seller orders
     * GET /api/orders/seller/my-orders
     * Requires seller role
     */
    async getSellerOrders(req, res) {
    try {
        const SellerProfile = require('../models/SellerProfile');
        const Product = require('../models/Product');

        // Get seller profile
        const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });

        if (!sellerProfile) {
            return res.status(404).json({
                success: false,
                error: 'Seller profile not found'
            });
        }

        // Get all products by this seller
        const sellerProducts = await Product.find({ sellerId: sellerProfile._id });
        const sellerProductIds = sellerProducts.map(p => p.id);

        // Find orders containing seller's products
        const orders = await Order.find({
            'items.productId': { $in: sellerProductIds }
        })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching seller orders',
            message: error.message
        });
    }
}

    /**
     * Update order status (Role-based access control)
     * PUT /api/orders/:orderId/status
     * Requires admin, seller, or delivery role
     * 
     * Permission rules:
     * - Admin: Can update any order to any status
     * - Seller: Can update orders containing their products (limited statuses)
     * - Delivery: Can update delivery status only for assigned orders
     */
    async updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status, note } = req.body;
        const userRole = req.user.role;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Role-based permission checks
        if (userRole === 'seller') {
            // Seller can only update orders containing their products
            const SellerProfile = require('../models/SellerProfile');
            const Product = require('../models/Product');

            const sellerProfile = await SellerProfile.findOne({ userId: req.user.userId });
            if (!sellerProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Seller profile not found'
                });
            }

            const sellerProducts = await Product.find({ sellerId: sellerProfile._id });
            const sellerProductIds = sellerProducts.map(p => p.id);

            const hasSellerProduct = order.items.some(item =>
                sellerProductIds.includes(item.productId)
            );

            if (!hasSellerProduct) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - order does not contain your products'
                });
            }

            // Sellers can only update to specific statuses
            const allowedStatuses = ['processing', 'shipped'];
            if (!allowedStatuses.includes(status)) {
                return res.status(403).json({
                    success: false,
                    error: `Sellers can only update status to: ${allowedStatuses.join(', ')}`
                });
            }
        } else if (userRole === 'delivery') {
            // Delivery staff can only update assigned deliveries
            if (!order.deliveryStaffId || order.deliveryStaffId.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied - delivery not assigned to you'
                });
            }

            // Delivery staff can only update to delivery-related statuses
            const allowedStatuses = ['shipped', 'delivered'];
            if (!allowedStatuses.includes(status)) {
                return res.status(403).json({
                    success: false,
                    error: `Delivery staff can only update status to: ${allowedStatuses.join(', ')}`
                });
            }
        }
        // Admin has no restrictions

        // Update order status
        order.orderStatus = status;
        order.statusHistory.push({
            status,
            timestamp: Date.now(),
            note: note || `Status updated to ${status}`,
            updatedBy: req.user.userId
        });

        if (status === 'delivered') {
            order.actualDeliveryDate = Date.now();
        }

        await order.save();

        // Send email notification based on status
        const user = await AuthUser.findById(order.userId);
        if (user && user.email) {
            if (status === 'shipped') {
                EmailService.sendOrderShippedEmail(user.email, order)
                    .catch(err => console.error('Error sending shipped email:', err));
                await NotificationService.notifyOrderShipped(order._id);
            } else if (status === 'delivered') {
                EmailService.sendOrderDeliveredEmail(user.email, order)
                    .catch(err => console.error('Error sending delivered email:', err));
                await NotificationService.notifyOrderDelivered(order._id);
            }
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating order status',
            message: error.message
        });
    }
}
}

module.exports = new OrderController();
