const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get user notifications
router.get('/', NotificationController.getNotifications);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark notification as read
router.post('/:id/read', NotificationController.markAsRead);

// Mark all as read
router.post('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

// Clear all notifications
router.delete('/clear-all', NotificationController.clearAll);

module.exports = router;
