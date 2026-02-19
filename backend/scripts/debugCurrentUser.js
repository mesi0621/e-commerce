require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const AuthUser = require('../models/AuthUser');

async function debugCurrentUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Simulate the token that would be in localStorage
        // You'll need to provide the actual token from the browser
        console.log('\n🔍 To debug the current user issue:');
        console.log('1. Open browser developer tools');
        console.log('2. Go to Application/Storage > Local Storage');
        console.log('3. Find "auth-token" and copy its value');
        console.log('4. Paste it below and run this script again\n');

        // Example of how to decode a token (replace with actual token)
        const exampleToken = 'your_token_here';

        if (exampleToken !== 'your_token_here') {
            try {
                const decoded = jwt.verify(exampleToken, process.env.JWT_SECRET);
                console.log('🔓 Decoded token:', decoded);

                const user = await AuthUser.findById(decoded.userId);
                if (user) {
                    console.log(`👤 User found: ${user.username} (${user.email})`);

                    const cart = await Cart.findOne({ userId: decoded.userId });
                    if (cart && cart.items.length > 0) {
                        console.log(`🛒 Cart: ${cart.items.length} items`);
                        cart.items.forEach((item, index) => {
                            console.log(`   ${index + 1}. Product ID: ${item.productId}, Quantity: ${item.quantity}, Price: ${item.price}`);
                        });
                    } else {
                        console.log('🛒 Cart: Empty');
                    }
                } else {
                    console.log('❌ User not found in database');
                }
            } catch (error) {
                console.error('❌ Token verification failed:', error.message);
            }
        }

        // Show all users with non-empty carts for reference
        console.log('\n📋 Users with items in cart:');
        const cartsWithItems = await Cart.find({ 'items.0': { $exists: true } });

        for (const cart of cartsWithItems) {
            const user = await AuthUser.findById(cart.userId);
            if (user) {
                console.log(`👤 ${user.username} (${user.email}) - ${cart.items.length} items`);
                console.log(`   User ID: ${user._id}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugCurrentUser();