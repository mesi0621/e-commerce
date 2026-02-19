const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function enableCBEBirr() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update CBE Birr payment method
        const cbeBirr = await PaymentMethod.findOne({ name: 'cbe' });

        if (cbeBirr) {
            cbeBirr.isActive = true;
            cbeBirr.displayName = 'CBE Birr';
            cbeBirr.description = 'Pay with CBE Birr mobile wallet';
            cbeBirr.type = 'mobile_money';
            cbeBirr.icon = '🏦';

            await cbeBirr.save();

            console.log('✅ CBE Birr payment method enabled successfully!');
            console.log('\nUpdated details:');
            console.log('   Name:', cbeBirr.name);
            console.log('   Display Name:', cbeBirr.displayName);
            console.log('   Active:', cbeBirr.isActive);
            console.log('   Type:', cbeBirr.type);
            console.log('   Description:', cbeBirr.description);
        } else {
            console.log('❌ CBE Birr payment method not found');
            console.log('Creating new CBE Birr payment method...');

            const newCBEBirr = new PaymentMethod({
                name: 'cbe',
                displayName: 'CBE Birr',
                type: 'mobile_money',
                description: 'Pay with CBE Birr mobile wallet',
                isActive: true,
                icon: '🏦',
                fees: {
                    fixed: 0,
                    percentage: 0
                },
                config: {
                    merchantId: process.env.CBE_MERCHANT_ID,
                    apiUrl: process.env.CBE_API_URL
                }
            });

            await newCBEBirr.save();
            console.log('✅ CBE Birr payment method created and enabled!');
        }

        console.log('\n⚠️  Important Notes:');
        console.log('   1. CBE Birr requires valid merchant credentials');
        console.log('   2. Update CBE_MERCHANT_ID and CBE_API_KEY in .env');
        console.log('   3. Restart backend server after configuration');
        console.log('   4. Test with sandbox credentials first');
        console.log('\n   Without valid credentials, payments will fail gracefully');
        console.log('   with message: "CBE Birr payment gateway is not configured"');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

enableCBEBirr();
