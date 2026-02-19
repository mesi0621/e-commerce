const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    reason: {
        type: String,
        enum: ['logout', 'password_change', 'security', 'admin_action'],
        default: 'logout'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Auto-delete after 24 hours (same as JWT expiration)
    }
});

// Index for efficient queries
tokenBlacklistSchema.index({ token: 1, expiresAt: 1 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;
