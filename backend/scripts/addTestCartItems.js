const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AuthUser = require('../models/AuthUser');

async function addTestCartItems() {
    try {
        console.log('🛒 ADDING TEST ITEMS TO CART\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB');

        // Find test user
        const testUser = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!testUser) {
            console.log('❌ Test user not found');
            return;
        }
        console.log(`✅ Found test user: ${testUser.email}`);

        // Get some approved products
        const products = await Product.find({ isApproved: true, stock: { $gt: 0 } }).limit(3);
        console.log(`✅ Found ${products.length} approved products`);

        // Clear existing cart
        await Cart.deleteOne({ userId: testUser._id.toString() });
        console.log('🗑️ Cleared existing cart');

        // Add items to cart one by one (simulating user actions)
        for (const product of products) {
            const cart = await Cart.findOne({ userId: testUser._id.toString() }) ||
                new Cart({ userId: testUser._id.toString(), items: [] });

            await cart.addItem(product.id, product.new_price, 1);
            console.log(`✅ Added ${product.name} to cart (ID: ${product.id}, Price: $${product.new_price})`);
        }

        // Verify cart contents
        const finalCart = await Cart.findOne({ userId: testUser._id.toString() });
        console.log(`\n📦 Final cart has ${finalCart.items.length} items:`);

        finalCart.items.forEach((item, index) => {
            console.log(`${index + 1}. Product ID: ${item.productId}, Quantity: ${item.quantity}, Price: $${item.price}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('🎯 TEST CART READY!');
        console.log('='.repeat(60));
        console.log('✅ Cart populated with test items');
        console.log('✅ User: mezgebemessi@gmail.com');
        console.log('✅ Ready to test frontend cart display');
        console.log('\n🌐 Go to: http://localhost:3000/cart');
        console.log('🔑 Login with: mezgebemessi@gmail.com');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

addTestCartItems();