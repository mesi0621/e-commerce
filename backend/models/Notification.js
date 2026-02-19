const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['order', 'product', 'seller', 'admin', 'system', 'payment'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    link: {
        type: String,
        default: null
    },
    metadata: {
        orderId: String,
        productId: Number,
        sellerId: mongoose.Schema.Types.ObjectId,
        status: String,
        amount: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: null
    }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
