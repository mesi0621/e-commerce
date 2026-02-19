const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuthUser = require('../models/AuthUser');

class NotificationService {
    /**
     * Create a notification
     */
    async createNotification(userId, type, title, message, metadata = {}, link = null) {
        try {
            const notification = new Notification({
                userId,
                type,
                title,
                message,
                metadata,
                link
            });

            await notification.save();
            console.log(`✅ Notification created for user ${userId}: ${title}`);
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Notify user when order is confirmed
     */
    async notifyOrderConfirmed(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            await this.createNotification(
                order.userId,
                'order',
                'Order Confirmed! 🎉',
                `Your order #${order.orderNumber} has been confirmed and is being processed.`,
                { orderId: order._id.toString(), status: 'confirmed' },
                `/orders/${order._id}`
            );
        } catch (error) {
            console.error('Error sending order confirmed notification:', error);
        }
    }

    /**
     * Notify user when order is shipped
     */
    async notifyOrderShipped(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            await this.createNotification(
                order.userId,
                'order',
                'Order Shipped! 📦',
                `Your order #${order.orderNumber} has been shipped and is on its way.`,
                { orderId: order._id.toString(), status: 'shipped' },
                `/orders/${order._id}`
            );
        } catch (error) {
            console.error('Error sending order shipped notification:', error);
        }
    }

    /**
     * Notify user when order is delivered
     */
    async notifyOrderDelivered(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            await this.createNotification(
                order.userId,
                'order',
                'Order Delivered! ✅',
                `Your order #${order.orderNumber} has been delivered. Enjoy your purchase!`,
                { orderId: order._id.toString(), status: 'delivered' },
                `/orders/${order._id}`
            );
        } catch (error) {
            console.error('Error sending order delivered notification:', error);
        }
    }

    /**
     * Notify user when order is cancelled
     */
    async notifyOrderCancelled(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            await this.createNotification(
                order.userId,
                'order',
                'Order Cancelled',
                `Your order #${order.orderNumber} has been cancelled.`,
                { orderId: order._id.toString(), status: 'cancelled' },
                `/orders/${order._id}`
            );
        } catch (error) {
            console.error('Error sending order cancelled notification:', error);
        }
    }

    /**
     * Notify seller when product is approved
     */
    async notifyProductApproved(productId, sellerId) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) return;

            const SellerProfile = require('../models/SellerProfile');
            const seller = await SellerProfile.findById(sellerId);
            if (!seller) return;

            await this.createNotification(
                seller.userId,
                'product',
                'Product Approved! ✅',
                `Your product "${product.name}" has been approved and is now live.`,
                { productId: product.id, status: 'approved' },
                `/seller`
            );
        } catch (error) {
            console.error('Error sending product approved notification:', error);
        }
    }

    /**
     * Notify seller when product is rejected
     */
    async notifyProductRejected(productId, sellerId, reason = 'Quality standards not met') {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) return;

            const SellerProfile = require('../models/SellerProfile');
            const seller = await SellerProfile.findById(sellerId);
            if (!seller) return;

            await this.createNotification(
                seller.userId,
                'product',
                'Product Rejected',
                `Your product "${product.name}" was rejected. Reason: ${reason}`,
                { productId: product.id, status: 'rejected' },
                `/seller`
            );
        } catch (error) {
            console.error('Error sending product rejected notification:', error);
        }
    }

    /**
     * Notify seller when they receive a new order
     */
    async notifyNewOrder(sellerId, orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            const SellerProfile = require('../models/SellerProfile');
            const seller = await SellerProfile.findById(sellerId);
            if (!seller) return;

            await this.createNotification(
                seller.userId,
                'order',
                'New Order Received! 🛒',
                `You have a new order #${order.orderNumber} containing your products.`,
                { orderId: order._id.toString(), sellerId: sellerId.toString() },
                `/seller`
            );
        } catch (error) {
            console.error('Error sending new order notification:', error);
        }
    }

    /**
     * Notify seller when payment is received
     */
    async notifyPaymentReceived(sellerId, orderId, amount) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            const SellerProfile = require('../models/SellerProfile');
            const seller = await SellerProfile.findById(sellerId);
            if (!seller) return;

            await this.createNotification(
                seller.userId,
                'payment',
                'Payment Received! 💰',
                `Payment of $${amount.toFixed(2)} received for order #${order.orderNumber}.`,
                { orderId: order._id.toString(), amount, sellerId: sellerId.toString() },
                `/seller`
            );
        } catch (error) {
            console.error('Error sending payment received notification:', error);
        }
    }

    /**
     * Notify all admins when new seller registers
     */
    async notifyNewSellerRegistration(sellerId) {
        try {
            const SellerProfile = require('../models/SellerProfile');
            const seller = await SellerProfile.findById(sellerId);
            if (!seller) return;

            // Get all admin users
            const admins = await AuthUser.find({ role: 'admin' });

            for (const admin of admins) {
                await this.createNotification(
                    admin._id,
                    'admin',
                    'New Seller Registration',
                    `${seller.businessName} has registered and is pending approval.`,
                    { sellerId: sellerId.toString() },
                    `/admin-v2`
                );
            }
        } catch (error) {
            console.error('Error sending new seller notification:', error);
        }
    }

    /**
     * Notify all admins when new product is submitted
     */
    async notifyNewProductSubmission(productId) {
        try {
            const product = await Product.findOne({ id: productId });
            if (!product) return;

            // Get all admin users
            const admins = await AuthUser.find({ role: 'admin' });

            for (const admin of admins) {
                await this.createNotification(
                    admin._id,
                    'admin',
                    'New Product Submission',
                    `Product "${product.name}" has been submitted and is pending approval.`,
                    { productId: product.id },
                    `/admin-v2`
                );
            }
        } catch (error) {
            console.error('Error sending new product notification:', error);
        }
    }

    /**
     * Notify admins about refund request
     */
    async notifyRefundRequest(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) return;

            // Get all admin users
            const admins = await AuthUser.find({ role: 'admin' });

            for (const admin of admins) {
                await this.createNotification(
                    admin._id,
                    'admin',
                    'Refund Request',
                    `Refund requested for order #${order.orderNumber}.`,
                    { orderId: order._id.toString() },
                    `/admin-v2`
                );
            }
        } catch (error) {
            console.error('Error sending refund request notification:', error);
        }
    }

    /**
     * Clean up old notifications (older than specified days)
     */
    async cleanupOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await Notification.deleteMany({
                createdAt: { $lt: cutoffDate }
            });

            console.log(`🗑️ Cleaned up ${result.deletedCount} old notifications`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up notifications:', error);
            throw error;
        }
    }

    /**
     * Limit notifications per user (keep only last N)
     */
    async limitUserNotifications(userId, maxNotifications = 50) {
        try {
            const notifications = await Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(maxNotifications);

            if (notifications.length > 0) {
                const idsToDelete = notifications.map(n => n._id);
                await Notification.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`🗑️ Deleted ${idsToDelete.length} excess notifications for user ${userId}`);
            }
        } catch (error) {
            console.error('Error limiting user notifications:', error);
        }
    }
}

module.exports = new NotificationService();
