const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function testPayPal() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if PayPal payment method exists
        const paypal = await PaymentMethod.findOne({ name: 'paypal' });

        if (paypal) {
            console.log('\n✅ PayPal payment method found:');
            console.log('   Name:', paypal.name);
            console.log('   Display Name:', paypal.displayName);
            console.log('   Active:', paypal.isActive);
            console.log('   Description:', paypal.description);
            console.log('   Type:', paypal.type);
        } else {
            console.log('\n❌ PayPal payment method not found');
            console.log('Creating PayPal payment method...');

            const newPayPal = new PaymentMethod({
                name: 'paypal',
                displayName: 'PayPal',
                type: 'digital_wallet',
                description: 'Pay securely with PayPal',
                isActive: true,
                icon: '💳',
                fees: {
                    fixed: 0.30,
                    percentage: 2.9
                },
                config: {
                    clientId: process.env.PAYPAL_CLIENT_ID,
                    mode: process.env.PAYPAL_MODE
                }
            });

            await newPayPal.save();
            console.log('✅ PayPal payment method created successfully');
        }

        console.log('\n📋 PayPal Configuration:');
        console.log('   Client ID:', process.env.PAYPAL_CLIENT_ID || '❌ Not configured');
        console.log('   Client Secret:', process.env.PAYPAL_CLIENT_SECRET ? '✅ Configured' : '❌ Not configured');
        console.log('   Mode:', process.env.PAYPAL_MODE || 'sandbox');
        console.log('   API URL:', process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com');

        console.log('\n📊 Configuration Status:');
        const isConfigured =
            process.env.PAYPAL_CLIENT_ID &&
            process.env.PAYPAL_CLIENT_ID !== 'your_paypal_client_id_here' &&
            process.env.PAYPAL_CLIENT_SECRET &&
            process.env.PAYPAL_CLIENT_SECRET !== 'your_paypal_client_secret_here';

        if (isConfigured) {
            console.log('   ✅ PayPal is fully configured and ready to use');
            console.log('   Mode:', process.env.PAYPAL_MODE === 'live' ? '🔴 PRODUCTION' : '🟡 SANDBOX');
        } else {
            console.log('   ⚠️  PayPal requires configuration');
            console.log('\n   To configure PayPal:');
            console.log('   1. Create PayPal business account at https://www.paypal.com');
            console.log('   2. Go to https://developer.paypal.com/dashboard');
            console.log('   3. Create an app to get credentials');
            console.log('   4. Update backend/.env file:');
            console.log('      PAYPAL_CLIENT_ID=your_client_id');
            console.log('      PAYPAL_CLIENT_SECRET=your_client_secret');
            console.log('      PAYPAL_MODE=sandbox (or live for production)');
            console.log('      PAYPAL_API_URL=https://api-m.sandbox.paypal.com');
            console.log('   5. Restart the backend server');
        }

        console.log('\n🔄 Payment Workflow:');
        console.log('   1. Customer selects "PayPal" at checkout');
        console.log('   2. Backend creates PayPal order via API');
        console.log('   3. Customer redirected to PayPal login page');
        console.log('   4. Customer logs in and approves payment');
        console.log('   5. PayPal redirects to success URL');
        console.log('   6. Backend captures payment using Order ID');
        console.log('   7. Backend verifies payment status');
        console.log('   8. IF status == COMPLETED → Order marked as PAID');
        console.log('   9. Customer receives confirmation');

        console.log('\n📝 API Endpoints:');
        console.log('   POST /api/payments/process (paymentMethod: "paypal")');
        console.log('   POST /api/payments/paypal/capture/:orderId');
        console.log('   GET  /api/payments/paypal/order/:orderId');
        console.log('   POST /api/payments/paypal/webhook (optional)');

        console.log('\n💰 Currency Support:');
        console.log('   PayPal supports multiple currencies:');
        console.log('   - USD (US Dollar)');
        console.log('   - EUR (Euro)');
        console.log('   - GBP (British Pound)');
        console.log('   - And many more...');

        console.log('\n🧪 Testing:');
        console.log('   Sandbox Mode:');
        console.log('   - Create test accounts at https://developer.paypal.com/dashboard/accounts');
        console.log('   - Use test buyer account to make payments');
        console.log('   - View transactions in sandbox dashboard');

        console.log('\n✅ PayPal setup check complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testPayPal();
