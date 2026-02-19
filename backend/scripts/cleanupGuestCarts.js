require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

async function cleanupGuestCarts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all carts
        const allCarts = await Cart.find({});
        console.log(`📊 Total carts found: ${allCarts.length}`);

        let invalidCarts = 0;
        let validCarts = 0;

        for (const cart of allCarts) {
            // Check if userId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(cart.userId)) {
                console.log(`🗑️ Removing invalid guest cart: ${cart._id} (userId: ${cart.userId})`);
                await Cart.findByIdAndDelete(cart._id);
                invalidCarts++;
            } else {
                validCarts++;
            }
        }

        console.log(`✅ Cleanup completed:`);
        console.log(`   - Valid carts: ${validCarts}`);
        console.log(`   - Removed invalid carts: ${invalidCarts}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupGuestCarts();