const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minPurchaseAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        default: null
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    perUserLimit: {
        type: Number,
        default: 1
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: {
        type: [String],
        default: []
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === null || this.usageCount < this.usageLimit)
    );
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (subtotal, shippingFee = 0) {
    if (!this.isValid()) {
        throw new Error('Coupon is not valid');
    }

    if (subtotal < this.minPurchaseAmount) {
        throw new Error(`Minimum purchase amount of ${this.minPurchaseAmount} required`);
    }

    let discount = 0;

    switch (this.discountType) {
        case 'percentage':
            discount = (subtotal * this.discountValue) / 100;
            if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
                discount = this.maxDiscountAmount;
            }
            break;
        case 'fixed':
            discount = this.discountValue;
            break;
        case 'free_shipping':
            discount = shippingFee;
            break;
    }

    return Math.min(discount, subtotal + shippingFee);
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
