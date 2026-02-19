const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        default: 'customer',
        enum: ['admin', 'seller', 'customer', 'delivery', 'support', 'finance', 'guest']
    },
    permissions: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProfile'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Indexes
authUserSchema.index({ email: 1 });
authUserSchema.index({ role: 1 });
authUserSchema.index({ isActive: 1 });

module.exports = mongoose.model('AuthUser', authUserSchema);
