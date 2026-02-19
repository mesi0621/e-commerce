const mongoose = require('mongoose');
require('dotenv').config();

const PaymentMethod = require('../models/PaymentMethod');

async function testBankTransfer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if bank_transfer payment method exists
        const bankTransfer = await PaymentMethod.findOne({ name: 'bank_transfer' });

        if (bankTransfer) {
            console.log('✅ Bank Transfer payment method found:');
            console.log('   Name:', bankTransfer.name);
            console.log('   Display Name:', bankTransfer.displayName);
            console.log('   Active:', bankTransfer.isActive);
            console.log('   Description:', bankTransfer.description);
        } else {
            console.log('❌ Bank Transfer payment method not found');
            console.log('Creating bank transfer payment method...');

            const newBankTransfer = new PaymentMethod({
                name: 'bank_transfer',
                displayName: 'Bank Transfer',
                type: 'bank_transfer',
                description: 'Transfer money directly to our bank account',
                isActive: true,
                icon: '🏦',
                fees: {
                    fixed: 0,
                    percentage: 0
                },
                config: {
                    bankName: process.env.BANK_NAME || 'Commercial Bank of Ethiopia',
                    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1000123456789',
                    accountName: process.env.BANK_ACCOUNT_NAME || 'Modo E-Commerce'
                }
            });

            await newBankTransfer.save();
            console.log('✅ Bank Transfer payment method created successfully');
        }

        console.log('\n📋 Bank Transfer Configuration:');
        console.log('   Bank Name:', process.env.BANK_NAME || 'Commercial Bank of Ethiopia');
        console.log('   Account Number:', process.env.BANK_ACCOUNT_NUMBER || '1000123456789');
        console.log('   Account Name:', process.env.BANK_ACCOUNT_NAME || 'Modo E-Commerce');

        console.log('\n✅ Bank Transfer setup complete!');
        console.log('\nNext steps:');
        console.log('1. Restart the backend server');
        console.log('2. Go to checkout page');
        console.log('3. Select "Bank Transfer" as payment method');
        console.log('4. Upload a receipt image');
        console.log('5. Admin can verify the payment in Admin Dashboard > Bank Transfers tab');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testBankTransfer();
