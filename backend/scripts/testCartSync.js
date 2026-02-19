require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const AuthUser = require('../models/AuthUser');

async function testCartSync() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a user with items in cart to test sync
        const testUser = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!testUser) {
            console.log('❌ Test user not found');
            process.exit(1);
        }

        console.log(`🧪 Testing cart sync for user: ${testUser.username} (${testUser.email})`);
        console.log(`   User ID: ${testUser._id}`);

        // Check current cart
        const currentCart = await Cart.findOne({ userId: testUser._id });
        console.log('\n📋 Current cart state:');
        if (currentCart && currentCart.items.length > 0) {
            console.log(`   Items: ${currentCart.items.length}`);
            currentCart.items.forEach((item, index) => {
                console.log(`   ${index + 1}. Product ID: ${item.productId}, Quantity: ${item.quantity}, Price: ${item.price}`);
            });
        } else {
            console.log('   Empty cart');
        }

        // Simulate frontend cart state (what would be sent from frontend)
        const frontendCartState = {
            1: 2,  // Product ID 1, quantity 2
            22: 1  // Product ID 22, quantity 1
        };

        console.log('\n🔄 Simulating cart sync with frontend state:', frontendCartState);

        // Simulate the sync process
        let cart = currentCart || new Cart({ userId: testUser._id, items: [] });

        // Clear existing cart and rebuild from frontend state
        cart.items = [];

        const Product = require('../models/Product');

        for (const [productId, quantity] of Object.entries(frontendCartState)) {
            if (quantity > 0) {
                const product = await Product.findOne({ id: parseInt(productId) });
                if (product) {
                    cart.items.push({
                        productId: parseInt(productId),
                        quantity: parseInt(quantity),
                        price: product.new_price
                    });
                    console.log(`   ✅ Added Product ${productId}: ${product.name} - Qty: ${quantity}, Price: ${product.new_price}`);
                } else {
                    console.log(`   ❌ Product ${productId} not found`);
                }
            }
        }

        await cart.save();

        console.log('\n✅ Cart sync completed successfully');
        console.log('📋 New cart state:');
        console.log(`   Items: ${cart.items.length}`);
        cart.items.forEach((item, index) => {
            console.log(`   ${index + 1}. Product ID: ${item.productId}, Quantity: ${item.quantity}, Price: ${item.price}`);
        });

        // Test if this cart would pass checkout validation
        console.log('\n🔍 Checkout validation test:');
        if (cart.items.length === 0) {
            console.log('   ❌ WOULD FAIL: Cart is empty');
        } else {
            console.log('   ✅ WOULD PASS: Cart has items');

            // Validate stock for each item
            let allValid = true;
            for (const item of cart.items) {
                const product = await Product.findOne({ id: item.productId });
                if (product && product.stock >= item.quantity) {
                    console.log(`   ✅ Product ${item.productId}: Stock OK (${product.stock} available)`);
                } else {
                    console.log(`   ❌ Product ${item.productId}: Insufficient stock (${product ? product.stock : 0} available, need ${item.quantity})`);
                    allValid = false;
                }
            }

            if (allValid) {
                console.log('   ✅ ALL ITEMS VALID - Checkout should succeed');
            } else {
                console.log('   ❌ SOME ITEMS INVALID - Checkout might fail');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testCartSync();