const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');
require('dotenv').config();

const paymentMethods = [
    {
        name: 'paypal',
        displayName: 'PayPal',
        type: 'digital_wallet',
        isActive: true,
        icon: 'paypal-icon.png',
        description: 'Pay securely with your PayPal account',
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        processingFee: 2.9,
        processingFeeType: 'percentage',
        minAmount: 1,
        instructions: 'You will be redirected to PayPal to complete your payment'
    },
    {
        name: 'telebirr',
        displayName: 'Telebirr',
        type: 'mobile_money',
        isActive: true,
        icon: 'telebirr-icon.png',
        description: 'Pay with Telebirr mobile wallet',
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 10,
        maxAmount: 50000,
        instructions: 'Enter your Telebirr phone number to complete payment'
    },
    {
        name: 'cbe',
        displayName: 'CBE Birr',
        type: 'mobile_money',
        isActive: true,
        icon: 'cbe-icon.png',
        description: 'Pay with Commercial Bank of Ethiopia mobile banking',
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 10,
        maxAmount: 100000,
        instructions: 'Use CBE Birr app to scan QR code or enter merchant code'
    },
    {
        name: 'cash_on_delivery',
        displayName: 'Cash on Delivery',
        type: 'cash',
        isActive: true,
        icon: 'cash-icon.png',
        description: 'Pay with cash when your order is delivered',
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 0,
        maxAmount: 10000,
        instructions: 'Prepare exact amount for delivery. Payment is collected upon delivery.'
    },
    {
        name: 'bank_transfer',
        displayName: 'Bank Transfer',
        type: 'bank_transfer',
        isActive: true,
        icon: 'bank-icon.png',
        description: 'Transfer directly to our bank account',
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 100,
        instructions: 'Transfer to: Commercial Bank of Ethiopia\nAccount: 1000123456789\nAccount Name: E-Commerce Shop\nPlease use your order number as reference.'
    },
    {
        name: 'stripe',
        displayName: 'Credit/Debit Card',
        type: 'card',
        isActive: true,
        icon: 'card-icon.png',
        description: 'Pay with Visa, Mastercard, or American Express',
        supportedCurrencies: ['USD', 'EUR', 'ETB'],
        processingFee: 2.5,
        processingFeeType: 'percentage',
        minAmount: 1,
        instructions: 'Enter your card details securely. We accept all major credit and debit cards.'
    }
];

async function seedPaymentMethods() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB');

        console.log('Clearing existing payment methods...');
        await PaymentMethod.deleteMany({});

        console.log('Seeding payment methods...');
        const created = await PaymentMethod.insertMany(paymentMethods);
        console.log(`Created ${created.length} payment methods`);

        console.log('\n✅ Payment methods seeded successfully!');
        console.log('\nAvailable payment methods:');
        paymentMethods.forEach(method => {
            console.log(`  - ${method.displayName} (${method.name}): ${method.description}`);
        });

    } catch (error) {
        console.error('Error seeding payment methods:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

seedPaymentMethods();
