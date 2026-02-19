const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: true,
        index: true,
        enum: ['men', 'women', 'kid']
    },
    image: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true,
        min: 0,
        index: true
    },
    old_price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    popularity: {
        type: Number,
        default: 1,
        min: 0,
        index: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProfile',
        index: true
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    approvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

// Compound index for category + price queries
productSchema.index({ category: 1, new_price: 1 });

// Update the updatedAt timestamp before saving
productSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
    if (this.old_price <= this.new_price) return 0;
    return Math.round(((this.old_price - this.new_price) / this.old_price) * 100);
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
