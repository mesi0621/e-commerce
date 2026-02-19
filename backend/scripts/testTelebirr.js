const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function testTelebirr() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if Telebirr payment method exists
        const telebirr = await PaymentMethod.findOne({ name: 'telebirr' });

        if (telebirr) {
            console.log('\n✅ Telebirr payment method found:');
            console.log('   Name:', telebirr.name);
            console.log('   Display Name:', telebirr.displayName);
            console.log('   Active:', telebirr.isActive);
            console.log('   Description:', telebirr.description);
            console.log('   Type:', telebirr.type);
        } else {
            console.log('\n❌ Telebirr payment method not found');
            console.log('Creating Telebirr payment method...');

            const newTelebirr = new PaymentMethod({
                name: 'telebirr',
                displayName: 'Telebirr',
                type: 'mobile_money',
                description: 'Pay with Telebirr mobile wallet',
                isActive: true,
                icon: '📱',
                fees: {
                    fixed: 0,
                    percentage: 0
                },
                config: {
                    appId: process.env.TELEBIRR_APP_ID,
                    apiUrl: process.env.TELEBIRR_API_URL
                }
            });

            await newTelebirr.save();
            console.log('✅ Telebirr payment method created successfully');
        }

        console.log('\n📋 Telebirr Configuration:');
        console.log('   App ID:', process.env.TELEBIRR_APP_ID || '❌ Not configured');
        console.log('   App Key:', process.env.TELEBIRR_APP_KEY ? '✅ Configured' : '❌ Not configured');
        console.log('   Public Key:', process.env.TELEBIRR_PUBLIC_KEY ? '✅ Configured' : '❌ Not configured');
        console.log('   API URL:', process.env.TELEBIRR_API_URL || 'https://196.188.120.3:38443/ammapi/payment/service-openup/toTradeWebPay');

        console.log('\n📊 Configuration Status:');
        const isConfigured =
            process.env.TELEBIRR_APP_ID &&
            process.env.TELEBIRR_APP_ID !== 'your_telebirr_app_id_here' &&
            process.env.TELEBIRR_APP_KEY &&
            process.env.TELEBIRR_APP_KEY !== 'your_telebirr_app_key_here' &&
            process.env.TELEBIRR_PUBLIC_KEY &&
            process.env.TELEBIRR_PUBLIC_KEY !== 'your_telebirr_public_key_here';

        if (isConfigured) {
            console.log('   ✅ Telebirr is fully configured and ready to use');
        } else {
            console.log('   ⚠️  Telebirr requires configuration');
            console.log('\n   To configure Telebirr:');
            console.log('   1. Obtain merchant credentials from Ethio Telecom');
            console.log('   2. Update backend/.env file:');
            console.log('      TELEBIRR_APP_ID=your_app_id');
            console.log('      TELEBIRR_APP_KEY=your_app_key');
            console.log('      TELEBIRR_PUBLIC_KEY=your_public_key');
            console.log('      TELEBIRR_API_URL=https://196.188.120.3:38443/ammapi/payment/service-openup/toTradeWebPay');
            console.log('   3. Restart the backend server');
        }

        console.log('\n🔄 Payment Workflow:');
        console.log('   1. Customer selects "Telebirr" at checkout');
        console.log('   2. Customer enters phone number (+251912345678)');
        console.log('   3. Backend generates transaction ID');
        console.log('   4. Backend sends request to Telebirr API');
        console.log('   5. Telebirr sends payment request to customer\'s phone');
        console.log('   6. Customer enters PIN on phone');
        console.log('   7. Telebirr sends notification to: /api/payments/telebirr/notify');
        console.log('   8. Backend verifies signature and updates order');
        console.log('   9. Customer receives confirmation');

        console.log('\n📝 API Endpoints:');
        console.log('   POST /api/payments/process (paymentMethod: "telebirr")');
        console.log('   POST /api/payments/telebirr/notify (webhook)');
        console.log('   GET  /api/payments/telebirr/return (return URL)');
        console.log('   GET  /api/payments/:orderId/status');

        console.log('\n📱 Phone Number Format:');
        console.log('   Valid formats:');
        console.log('   - +251912345678 (International)');
        console.log('   - 0912345678 (Local)');
        console.log('   - 251912345678 (Without +)');

        console.log('\n✅ Telebirr setup check complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testTelebirr();
