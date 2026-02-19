require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const AuthUser = require('../models/AuthUser');

async function debugCartIssue() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🔍 CART DEBUGGING REPORT');
        console.log('========================');

        // Get all users and their cart status
        const users = await AuthUser.find({}).sort({ createdAt: -1 }).limit(10);
        console.log(`\n📊 Recent Users (last 10):`);

        for (const user of users) {
            const cart = await Cart.findOne({ userId: user._id });
            const cartStatus = cart && cart.items.length > 0 ?
                `${cart.items.length} items` : 'Empty';

            console.log(`   ${user.username} (${user.email})`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Cart: ${cartStatus}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('   ---');
        }

        // Check for recent cart activities
        const recentCarts = await Cart.find({}).sort({ updatedAt: -1 }).limit(5);
        console.log(`\n🛒 Recent Cart Activities (last 5):`);

        for (const cart of recentCarts) {
            const user = await AuthUser.findById(cart.userId);
            console.log(`   User: ${user ? user.username : 'Unknown'} (${cart.userId})`);
            console.log(`   Items: ${cart.items.length}`);
            console.log(`   Last Updated: ${cart.updatedAt}`);
            if (cart.items.length > 0) {
                cart.items.forEach((item, index) => {
                    console.log(`      ${index + 1}. Product ${item.productId}: ${item.quantity} × ${item.price}`);
                });
            }
            console.log('   ---');
        }

        // Summary
        const totalUsers = await AuthUser.countDocuments();
        const totalCarts = await Cart.countDocuments();
        const nonEmptyCarts = await Cart.countDocuments({ 'items.0': { $exists: true } });

        console.log(`\n📈 SUMMARY:`);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   Total Carts: ${totalCarts}`);
        console.log(`   Non-Empty Carts: ${nonEmptyCarts}`);
        console.log(`   Empty Carts: ${totalCarts - nonEmptyCarts}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugCartIssue();