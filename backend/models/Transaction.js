const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProfile',
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['sale', 'refund', 'commission', 'payout'],
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    commission: {
        type: Number,
        default: 0
    },
    commissionRate: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    description: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Indexes
transactionSchema.index({ sellerId: 1, createdAt: -1 });
transactionSchema.index({ customerId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
