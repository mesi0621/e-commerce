const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: [{
        productId: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    coupon: {
        code: {
            type: String,
            trim: true
        },
        discountPercent: {
            type: Number,
            min: 0,
            max: 100
        },
        minPurchase: {
            type: Number,
            min: 0,
            default: 0
        },
        expiryDate: {
            type: Date
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
cartSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Method to calculate subtotal
cartSchema.methods.calculateSubtotal = function () {
    return this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

// Method to add item to cart
cartSchema.methods.addItem = function (productId, price, quantity = 1) {
    const existingItem = this.items.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ productId, price, quantity });
    }

    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
    const item = this.items.find(item => item.productId === productId);

    if (item) {
        if (quantity <= 0) {
            return this.removeItem(productId);
        }
        item.quantity = quantity;
    }

    return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
    this.items = [];
    this.coupon = {};
    return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
