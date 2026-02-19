const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function testCBEBirr() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if CBE Birr payment method exists
        const cbeBirr = await PaymentMethod.findOne({ name: 'cbe' });

        if (cbeBirr) {
            console.log('\n✅ CBE Birr payment method found:');
            console.log('   Name:', cbeBirr.name);
            console.log('   Display Name:', cbeBirr.displayName);
            console.log('   Active:', cbeBirr.isActive);
            console.log('   Description:', cbeBirr.description);
            console.log('   Type:', cbeBirr.type);
        } else {
            console.log('\n❌ CBE Birr payment method not found');
            console.log('Creating CBE Birr payment method...');

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
            console.log('✅ CBE Birr payment method created successfully');
        }

        console.log('\n📋 CBE Birr Configuration:');
        console.log('   Merchant ID:', process.env.CBE_MERCHANT_ID || '❌ Not configured');
        console.log('   API Key:', process.env.CBE_API_KEY ? '✅ Configured' : '❌ Not configured');
        console.log('   API URL:', process.env.CBE_API_URL || 'https://api.cbe.com.et/birr');

        console.log('\n📊 Configuration Status:');
        const isConfigured =
            process.env.CBE_MERCHANT_ID &&
            process.env.CBE_MERCHANT_ID !== 'your_cbe_merchant_id_here' &&
            process.env.CBE_API_KEY &&
            process.env.CBE_API_KEY !== 'your_cbe_api_key_here';

        if (isConfigured) {
            console.log('   ✅ CBE Birr is fully configured and ready to use');
        } else {
            console.log('   ⚠️  CBE Birr requires configuration');
            console.log('\n   To configure CBE Birr:');
            console.log('   1. Obtain merchant credentials from CBE');
            console.log('   2. Update backend/.env file:');
            console.log('      CBE_MERCHANT_ID=your_merchant_id');
            console.log('      CBE_API_KEY=your_api_key');
            console.log('      CBE_API_URL=https://api.cbe.com.et/birr');
            console.log('   3. Restart the backend server');
        }

        console.log('\n🔄 Payment Workflow:');
        console.log('   1. Customer selects "CBE Birr" at checkout');
        console.log('   2. Backend generates payment request');
        console.log('   3. Customer redirected to CBE Birr payment page');
        console.log('   4. Customer logs in and confirms payment');
        console.log('   5. CBE sends callback to: /api/payments/cbe/callback');
        console.log('   6. Backend verifies transaction');
        console.log('   7. Order status updated (paid/failed)');

        console.log('\n📝 API Endpoints:');
        console.log('   POST /api/payments/process (paymentMethod: "cbe")');
        console.log('   POST /api/payments/cbe/callback (webhook)');
        console.log('   GET  /api/payments/:orderId/status');

        console.log('\n✅ CBE Birr setup check complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testCBEBirr();
