const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Auto-delete expired tokens
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    usedAt: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
});

// Index for efficient cleanup and queries
passwordResetSchema.index({ email: 1, createdAt: -1 });
passwordResetSchema.index({ token: 1, isUsed: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);