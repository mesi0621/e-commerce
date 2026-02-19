require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function addItemToUserCart() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // User ID that's trying to checkout (from server logs)
        const userId = '69960e89e0118f1c5e702aa9';

        // Get a product to add
        const product = await Product.findOne({ id: 24 });
        if (!product) {
            console.log('❌ Product not found');
            return;
        }

        console.log(`📦 Adding product to cart: ${product.name} (ID: ${product.id}, Price: ${product.new_price})`);

        // Find or create cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            console.log('🛒 Creating new cart for user');
            cart = new Cart({ userId, items: [] });
        }

        // Add item to cart
        await cart.addItem(product.id, product.new_price, 1);
        console.log('✅ Item added to cart successfully');

        // Check cart contents
        const updatedCart = await Cart.findOne({ userId });
        console.log('🛒 Updated cart contents:');
        updatedCart.items.forEach((item, index) => {
            console.log(`   ${index + 1}. Product ID: ${item.productId}, Quantity: ${item.quantity}, Price: ${item.price}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addItemToUserCart();