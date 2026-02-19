const Notification = require('../models/Notification');

class NotificationController {
    /**
     * Get user notifications
     * GET /api/notifications
     */
    async getNotifications(req, res) {
        try {
            const { page = 1, limit = 20, type, isRead } = req.query;
            const query = { userId: req.user.userId };

            if (type) query.type = type;
            if (isRead !== undefined) query.isRead = isRead === 'true';

            const skip = (page - 1) * limit;

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Notification.countDocuments(query);

            res.json({
                success: true,
                data: notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching notifications',
                message: error.message
            });
        }
    }

    /**
     * Get unread notification count
     * GET /api/notifications/unread-count
     */
    async getUnreadCount(req, res) {
        try {
            const count = await Notification.countDocuments({
                userId: req.user.userId,
                isRead: false
            });

            res.json({
                success: true,
                count
            });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching unread count',
                message: error.message
            });
        }
    }

    /**
     * Mark notification as read
     * POST /api/notifications/:id/read
     */
    async markAsRead(req, res) {
        try {
            const { id } = req.params;

            const notification = await Notification.findOne({
                _id: id,
                userId: req.user.userId
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }

            notification.isRead = true;
            await notification.save();

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Error marking notification as read',
                message: error.message
            });
        }
    }

    /**
     * Mark all notifications as read
     * POST /api/notifications/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const result = await Notification.updateMany(
                { userId: req.user.userId, isRead: false },
                { $set: { isRead: true } }
            );

            res.json({
                success: true,
                message: 'All notifications marked as read',
                count: result.modifiedCount
            });
        } catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Error marking all notifications as read',
                message: error.message
            });
        }
    }

    /**
     * Delete notification
     * DELETE /api/notifications/:id
     */
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;

            const notification = await Notification.findOneAndDelete({
                _id: id,
                userId: req.user.userId
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }

            res.json({
                success: true,
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({
                success: false,
                error: 'Error deleting notification',
                message: error.message
            });
        }
    }

    /**
     * Clear all notifications
     * DELETE /api/notifications/clear-all
     */
    async clearAll(req, res) {
        try {
            const result = await Notification.deleteMany({
                userId: req.user.userId
            });

            res.json({
                success: true,
                message: 'All notifications cleared',
                count: result.deletedCount
            });
        } catch (error) {
            console.error('Clear all notifications error:', error);
            res.status(500).json({
                success: false,
                error: 'Error clearing notifications',
                message: error.message
            });
        }
    }
}

module.exports = new NotificationController();
