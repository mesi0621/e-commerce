const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function enablePayPal() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update PayPal payment method
        const paypal = await PaymentMethod.findOne({ name: 'paypal' });

        if (paypal) {
            paypal.isActive = true;
            paypal.displayName = 'PayPal';
            paypal.description = 'Pay securely with PayPal';
            paypal.type = 'digital_wallet';
            paypal.icon = '💳';

            await paypal.save();

            console.log('✅ PayPal payment method enabled successfully!');
            console.log('\nUpdated details:');
            console.log('   Name:', paypal.name);
            console.log('   Display Name:', paypal.displayName);
            console.log('   Active:', paypal.isActive);
            console.log('   Type:', paypal.type);
            console.log('   Description:', paypal.description);
        } else {
            console.log('❌ PayPal payment method not found');
            console.log('Creating new PayPal payment method...');

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
                    mode: process.env.PAYPAL_MODE || 'sandbox'
                }
            });

            await newPayPal.save();
            console.log('✅ PayPal payment method created and enabled!');
        }

        console.log('\n⚠️  Important Notes:');
        console.log('   1. PayPal requires valid business account credentials');
        console.log('   2. Update PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env');
        console.log('   3. Use sandbox mode for testing');
        console.log('   4. Switch to live mode for production');
        console.log('   5. Restart backend server after configuration');
        console.log('\n   Without valid credentials, payments will fail gracefully');
        console.log('   with message: "PayPal payment gateway is not configured"');

        console.log('\n💳 Customer Experience:');
        console.log('   1. Customer selects PayPal at checkout');
        console.log('   2. Redirected to PayPal login page');
        console.log('   3. Logs in with PayPal account');
        console.log('   4. Reviews and approves payment');
        console.log('   5. Redirected back to success page');
        console.log('   6. Payment captured automatically');

        console.log('\n🌍 International Payments:');
        console.log('   PayPal supports:');
        console.log('   - Multiple currencies');
        console.log('   - International transactions');
        console.log('   - Credit/debit card payments');
        console.log('   - PayPal balance payments');

        console.log('\n📊 Transaction Fees:');
        console.log('   Standard rates:');
        console.log('   - 2.9% + $0.30 per transaction (US)');
        console.log('   - Rates vary by country and volume');
        console.log('   - Check PayPal dashboard for exact rates');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

enablePayPal();
