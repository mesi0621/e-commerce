require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const AuthUser = require('../models/AuthUser');

async function checkUserCart() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users and their carts
        const users = await AuthUser.find({});
        console.log('\n📋 Checking all users and their carts:');

        for (const user of users) {
            const cart = await Cart.findOne({ userId: user._id });
            console.log(`\n👤 User: ${user.username} (${user.email}) - ID: ${user._id}`);
            console.log(`   Role: ${user.role}`);

            if (cart && cart.items.length > 0) {
                console.log(`   🛒 Cart: ${cart.items.length} items`);
                cart.items.forEach((item, index) => {
                    console.log(`      ${index + 1}. Product ID: ${item.productId}, Quantity: ${item.quantity}, Price: ${item.price}`);
                });
            } else {
                console.log(`   🛒 Cart: Empty`);
            }
        }

        // Check for any orphaned carts
        const allCarts = await Cart.find({});
        console.log(`\n📊 Total carts in database: ${allCarts.length}`);

        for (const cart of allCarts) {
            const user = await AuthUser.findById(cart.userId);
            if (!user) {
                console.log(`⚠️ Orphaned cart found: ${cart._id} for user ID: ${cart.userId}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUserCart();