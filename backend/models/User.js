const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    viewedProducts: [{
        type: Number,
        ref: 'Product'
    }],
    viewedCategories: {
        type: Map,
        of: Number,
        default: new Map()
    },
    priceRange: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 1000
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Update lastActive before saving
userSchema.pre('save', function () {
    this.lastActive = Date.now();
});

// Method to add viewed product
userSchema.methods.addViewedProduct = function (productId, category, price) {
    // Add to viewed products (keep last 50)
    if (!this.viewedProducts.includes(productId)) {
        this.viewedProducts.push(productId);
        if (this.viewedProducts.length > 50) {
            this.viewedProducts.shift();
        }
    }

    // Update viewed categories count
    const currentCount = this.viewedCategories.get(category) || 0;
    this.viewedCategories.set(category, currentCount + 1);

    // Update price range
    if (price < this.priceRange.min || this.priceRange.min === 0) {
        this.priceRange.min = price;
    }
    if (price > this.priceRange.max) {
        this.priceRange.max = price;
    }

    return this.save();
};

// Method to get most viewed categories
userSchema.methods.getMostViewedCategories = function (limit = 3) {
    const categories = Array.from(this.viewedCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0]);
    return categories;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
