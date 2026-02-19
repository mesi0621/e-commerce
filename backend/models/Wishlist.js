const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        unique: true,
        index: true
    },
    items: [{
        productId: {
            type: Number,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
wishlistSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function (productId) {
    const existingItem = this.items.find(item => item.productId === productId);

    if (!existingItem) {
        this.items.push({ productId, addedAt: Date.now() });
    }

    return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    return this.save();
};

// Method to check if item is in wishlist
wishlistSchema.methods.hasItem = function (productId) {
    return this.items.some(item => item.productId === productId);
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function () {
    this.items = [];
    return this.save();
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
