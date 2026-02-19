const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    payoutNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProfile',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'ETB'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank_transfer', 'paypal', 'stripe', 'mobile_money']
    },
    bankAccount: {
        accountNumber: String,
        bankName: String,
        accountHolderName: String,
        routingNumber: String
    },
    transactionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    processedAt: {
        type: Date
    },
    failureReason: {
        type: String
    },
    notes: {
        type: String
    },
    metadata: {
        transactionReference: String,
        receiptUrl: String,
        gatewayResponse: mongoose.Schema.Types.Mixed
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
payoutSchema.index({ sellerId: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ processedBy: 1 });

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
