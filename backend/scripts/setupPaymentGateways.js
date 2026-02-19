require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');

const paymentMethods = [
    {
        name: 'chapa',
        displayName: 'Chapa',
        type: 'digital_wallet',
        isActive: true,
        icon: '💳',
        description: 'Pay securely with Chapa - Ethiopian payment gateway',
        configuration: {
            apiKey: process.env.CHAPA_SECRET_KEY,
            webhookUrl: `${process.env.BASE_URL}/api/payments/chapa/callback`
        },
        supportedCurrencies: ['ETB'],
        processingFee: 2.5,
        processingFeeType: 'percentage',
        minAmount: 1,
        instructions: 'You will be redirected to Chapa to complete your payment securely.'
    },
    {
        name: 'paypal',
        displayName: 'PayPal',
        type: 'digital_wallet',
        isActive: true,
        icon: '🅿️',
        description: 'Pay with PayPal - Safe and secure international payments',
        configuration: {
            clientId: process.env.PAYPAL_CLIENT_ID,
            mode: process.env.PAYPAL_MODE || 'sandbox'
        },
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        processingFee: 3.5,
        processingFeeType: 'percentage',
        minAmount: 1,
        instructions: 'You will be redirected to PayPal to complete your payment.'
    },
    {
        name: 'telebirr',
        displayName: 'Telebirr',
        type: 'mobile_money',
        isActive: true,
        icon: '📱',
        description: 'Pay with Telebirr - Ethiopian mobile money',
        configuration: {
            appId: process.env.TELEBIRR_APP_ID,
            notifyUrl: `${process.env.BASE_URL}/api/payments/telebirr/notify`
        },
        supportedCurrencies: ['ETB'],
        processingFee: 1.5,
        processingFeeType: 'percentage',
        minAmount: 1,
        instructions: 'Enter your Telebirr phone number to complete payment.'
    },
    {
        name: 'cbe',
        displayName: 'CBE Birr',
        type: 'bank_transfer',
        isActive: true,
        icon: '🏦',
        description: 'Pay with CBE Birr - Commercial Bank of Ethiopia',
        configuration: {
            merchantId: process.env.CBE_MERCHANT_ID,
            callbackUrl: `${process.env.BASE_URL}/api/payments/cbe/callback`
        },
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 1,
        instructions: 'You will be redirected to CBE Birr to complete your payment.'
    },
    {
        name: 'cash_on_delivery',
        displayName: 'Cash on Delivery',
        type: 'cash',
        isActive: true,
        icon: '💵',
        description: 'Pay with cash when your order is delivered',
        configuration: {},
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 0,
        instructions: 'Pay with cash when your order arrives. Please have exact change ready.'
    },
    {
        name: 'bank_transfer',
        displayName: 'Bank Transfer',
        type: 'bank_transfer',
        isActive: true,
        icon: '🏧',
        description: 'Direct bank transfer',
        configuration: {
            accountName: process.env.BANK_ACCOUNT_NAME,
            accountNumber: process.env.BANK_ACCOUNT_NUMBER,
            bankName: process.env.BANK_NAME,
            branch: process.env.BANK_BRANCH
        },
        supportedCurrencies: ['ETB'],
        processingFee: 0,
        processingFeeType: 'fixed',
        minAmount: 0,
        instructions: `Transfer to:\nBank: ${process.env.BANK_NAME}\nAccount: ${process.env.BANK_ACCOUNT_NUMBER}\nName: ${process.env.BANK_ACCOUNT_NAME}\n\nPlease include your order number in the transfer reference.`
    }
];

async function setupPaymentGateways() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing payment methods
        await PaymentMethod.deleteMany({});
        console.log('Cleared existing payment methods');

        // Insert new payment methods using insertMany (bypasses pre-save hooks)
        await PaymentMethod.insertMany(paymentMethods);

        console.log('\n✅ Payment gateways setup completed successfully!');
        console.log('\nConfigured payment methods:');
        paymentMethods.forEach(method => {
            console.log(`  ✓ ${method.displayName} (${method.type})`);
        });

        console.log('\n⚠️  Important:');
        console.log('  1. Update your .env file with actual API keys');
        console.log('  2. Configure webhook URLs in payment gateway dashboards');
        console.log('  3. Test each payment method before going live');
        console.log('  4. Review PAYMENT_INTEGRATION_GUIDE.md for detailed setup');

        process.exit(0);
    } catch (error) {
        console.error('Error setting up payment gateways:', error);
        process.exit(1);
    }
}

setupPaymentGateways();
