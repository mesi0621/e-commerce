const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function enableTelebirr() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update Telebirr payment method
        const telebirr = await PaymentMethod.findOne({ name: 'telebirr' });

        if (telebirr) {
            telebirr.isActive = true;
            telebirr.displayName = 'Telebirr';
            telebirr.description = 'Pay with Telebirr mobile wallet';
            telebirr.type = 'mobile_money';
            telebirr.icon = '📱';

            await telebirr.save();

            console.log('✅ Telebirr payment method enabled successfully!');
            console.log('\nUpdated details:');
            console.log('   Name:', telebirr.name);
            console.log('   Display Name:', telebirr.displayName);
            console.log('   Active:', telebirr.isActive);
            console.log('   Type:', telebirr.type);
            console.log('   Description:', telebirr.description);
        } else {
            console.log('❌ Telebirr payment method not found');
            console.log('Creating new Telebirr payment method...');

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
            console.log('✅ Telebirr payment method created and enabled!');
        }

        console.log('\n⚠️  Important Notes:');
        console.log('   1. Telebirr requires valid merchant credentials from Ethio Telecom');
        console.log('   2. Update TELEBIRR_APP_ID, TELEBIRR_APP_KEY, and TELEBIRR_PUBLIC_KEY in .env');
        console.log('   3. Restart backend server after configuration');
        console.log('   4. Test with sandbox credentials first');
        console.log('   5. Ensure notification URL is publicly accessible');
        console.log('\n   Without valid credentials, payments will fail gracefully');
        console.log('   with message: "Telebirr payment gateway is not configured"');

        console.log('\n📱 Customer Experience:');
        console.log('   1. Customer enters phone number at checkout');
        console.log('   2. Receives payment request on phone');
        console.log('   3. Opens Telebirr app');
        console.log('   4. Enters PIN to confirm');
        console.log('   5. Payment processed instantly');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

enableTelebirr();
