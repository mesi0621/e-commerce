require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');

async function disableTelebirr() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Disable Telebirr payment method
        const result = await PaymentMethod.updateOne(
            { name: 'telebirr' },
            { isActive: false }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Telebirr payment method disabled successfully');
        } else {
            console.log('⚠️ Telebirr payment method not found or already disabled');
        }

        // Show updated payment methods
        const activeMethods = await PaymentMethod.find({ isActive: true });
        console.log('\n📋 Active Payment Methods:');
        activeMethods.forEach((method, index) => {
            console.log(`${index + 1}. ${method.displayName} (${method.name})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

disableTelebirr();