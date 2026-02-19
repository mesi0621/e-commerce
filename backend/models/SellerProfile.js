const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    businessPhone: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    taxId: {
        type: String,
        trim: true
    },
    bankAccount: {
        accountNumber: String,
        bankName: String,
        accountHolderName: String,
        routingNumber: String
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    approvedAt: {
        type: Date
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalSales: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Indexes
sellerProfileSchema.index({ userId: 1 });
sellerProfileSchema.index({ isApproved: 1 });
sellerProfileSchema.index({ rating: -1 });

const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);

module.exports = SellerProfile;
