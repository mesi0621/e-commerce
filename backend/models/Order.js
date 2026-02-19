const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        index: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    shippingFee: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['paypal', 'chapa', 'telebirr', 'cbe', 'cash_on_delivery', 'bank_transfer', 'stripe'],
        index: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        paymentGatewayResponse: mongoose.Schema.Types.Mixed,
        // Bank transfer specific fields
        receiptPath: String,
        receiptFilename: String,
        referenceCode: String,
        uploadedAt: Date
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        region: {
            type: String,
            required: true
        },
        postalCode: String
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
        index: true
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AuthUser'
        }
    }],
    deliveryStaffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'assigned', 'in_transit', 'delivered', 'failed'],
        default: 'pending',
        index: true
    },
    deliveryAssignedAt: Date,
    deliveryAssignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    deliveryStartedAt: Date,
    deliveryNotes: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    notes: String,
    refundStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
        default: 'none',
        index: true
    },
    refundReason: String,
    refundAmount: Number,
    refundRequestedAt: Date,
    refundApprovedAt: Date,
    refundApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    refundRejectedAt: Date,
    refundRejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    refundRejectionReason: String,
    refundProcessedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
