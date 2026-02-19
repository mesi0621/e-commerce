require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');

async function testPaymentMethods() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all payment methods
        const allMethods = await PaymentMethod.find().sort({ displayName: 1 });
        console.log('\n📋 All Payment Methods:');
        allMethods.forEach((method, index) => {
            console.log(`${index + 1}. ${method.displayName} (${method.name}) - Active: ${method.isActive}`);
        });

        // Get active payment methods (what frontend sees)
        const activeMethods = await PaymentMethod.find({ isActive: true }).sort({ displayName: 1 });
        console.log('\n✅ Active Payment Methods (Frontend sees):');
        activeMethods.forEach((method, index) => {
            console.log(`${index + 1}. ${method.displayName} (${method.name})`);
        });

        // Check if Cash on Delivery is active
        const codMethod = activeMethods.find(m => m.name === 'cash_on_delivery');
        if (codMethod) {
            console.log('\n💰 Cash on Delivery is available and should be default');
        } else {
            console.log('\n❌ Cash on Delivery is NOT available');
        }

        // Check disabled methods
        const disabledMethods = await PaymentMethod.find({ isActive: false });
        if (disabledMethods.length > 0) {
            console.log('\n❌ Disabled Payment Methods:');
            disabledMethods.forEach((method, index) => {
                console.log(`${index + 1}. ${method.displayName} (${method.name})`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testPaymentMethods();