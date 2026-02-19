const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['digital_wallet', 'bank_transfer', 'cash', 'card', 'mobile_money']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    icon: String,
    description: String,
    configuration: {
        apiKey: String,
        merchantId: String,
        secretKey: String,
        webhookUrl: String,
        additionalSettings: mongoose.Schema.Types.Mixed
    },
    supportedCurrencies: [{
        type: String,
        default: ['ETB', 'USD']
    }],
    processingFee: {
        type: Number,
        default: 0
    },
    processingFeeType: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'percentage'
    },
    minAmount: {
        type: Number,
        default: 0
    },
    maxAmount: Number,
    instructions: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

paymentMethodSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
