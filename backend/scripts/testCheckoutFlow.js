require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const AuthUser = require('../models/AuthUser');
const Product = require('../models/Product');

async function testCheckoutFlow() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find users with items in cart
        const cartsWithItems = await Cart.find({ 'items.0': { $exists: true } });

        console.log('\n🧪 Testing checkout flow for users with cart items:\n');

        for (const cart of cartsWithItems) {
            const user = await AuthUser.findById(cart.userId);
            if (!user) {
                console.log(`❌ User not found for cart: ${cart._id}`);
                continue;
            }

            console.log(`👤 Testing user: ${user.username} (${user.email})`);
            console.log(`   User ID: ${user._id}`);
            console.log(`   Cart ID: ${cart._id}`);
            console.log(`   Items in cart: ${cart.items.length}`);

            // Validate each cart item
            let validItems = 0;
            let totalValue = 0;

            for (const item of cart.items) {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    console.log(`   ✅ Product ${item.productId}: ${product.name} - Qty: ${item.quantity}, Price: ${item.price}`);
                    console.log(`      Stock available: ${product.stock}`);

                    if (product.stock >= item.quantity) {
                        validItems++;
                        totalValue += item.price * item.quantity;
                    } else {
                        console.log(`      ⚠️ Insufficient stock! Need: ${item.quantity}, Available: ${product.stock}`);
                    }
                } else {
                    console.log(`   ❌ Product ${item.productId}: NOT FOUND`);
                }
            }

            console.log(`   📊 Summary: ${validItems}/${cart.items.length} valid items, Total value: $${totalValue}`);

            // Simulate order creation validation
            if (cart.items.length === 0) {
                console.log('   ❌ CHECKOUT WOULD FAIL: Cart is empty');
            } else if (validItems === 0) {
                console.log('   ❌ CHECKOUT WOULD FAIL: No valid items');
            } else {
                console.log('   ✅ CHECKOUT SHOULD SUCCEED');
            }

            console.log(''); // Empty line for readability
        }

        // Test specific user scenarios
        console.log('\n🔍 Testing specific scenarios:\n');

        // Test user with email mezgebemessi@gmail.com (from error logs)
        const testUser = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (testUser) {
            console.log(`🎯 Testing specific user: ${testUser.username} (${testUser.email})`);
            console.log(`   User ID: ${testUser._id}`);

            const testCart = await Cart.findOne({ userId: testUser._id });
            if (testCart && testCart.items.length > 0) {
                console.log(`   Cart found with ${testCart.items.length} items`);
                console.log('   ✅ This user should be able to checkout');
            } else {
                console.log('   ❌ No cart or empty cart - this explains the error!');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testCheckoutFlow();