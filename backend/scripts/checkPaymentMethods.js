const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function checkPaymentMethods() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB');

        const methods = await PaymentMethod.find({});

        console.log('\n📋 Payment Methods in Database:');
        console.log('================================');

        methods.forEach((method, index) => {
            console.log(`\n${index + 1}. ${method.displayName}`);
            console.log(`   Name: ${method.name}`);
            console.log(`   Active: ${method.isActive}`);
            console.log(`   Description: ${method.description}`);
        });

        console.log('\n================================');
        console.log(`Total: ${methods.length} payment methods`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPaymentMethods();
