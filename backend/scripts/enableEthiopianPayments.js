const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');
require('dotenv').config();

/**
 * Enable Ethiopian Payment Gateways
 * This script enables Chapa, Telebirr, and CBE Birr payment methods in the database
 */

const ethiopianPaymentMethods = [
    {
        name: 'chapa',
        displayName: 'Chapa',
        description: 'Pay with cards, mobile money, or bank transfer via Chapa',
        type: 'gateway',
        isActive: true,
        supportedCurrencies: ['ETB'],
        configuration: {
            apiUrl: process.env.CHAPA_API_URL || 'https://api.chapa.co/v1',
            publicKey: process.env.CHAPA_PUBLIC_KEY,
            // Note: secretKey is not stored in database for security
            webhookSecret: process.env.CHAPA_WEBHOOK_SECRET,
            supportedMethods: ['card', 'mobile_money', 'bank_transfer']
        },
        fees: {
            type: 'percentage',
            value: 2.5, // 2.5% transaction fee
            minimumFee: 5, // 5 ETB minimum
            maximumFee: 1000 // 1000 ETB maximum
        },
        limits: {
            minimum: 10, // 10 ETB minimum transaction
            maximum: 100000, // 100,000 ETB maximum transaction
            daily: 500000 // 500,000 ETB daily limit
        },
        processingTime: {
            average: '2-5 minutes',
            maximum: '30 minutes'
        },
        icon: 'chapa-icon.png',
        order: 2
    },
    {
        name: 'telebirr',
        displayName: 'Telebirr',
        description: 'Pay with Telebirr mobile money',
        type: 'mobile_money',
        isActive: true,
        supportedCurrencies: ['ETB'],
        configuration: {
            apiUrl: process.env.TELEBIRR_API_URL,
            appId: process.env.TELEBIRR_APP_ID,
            // Note: appKey is not stored in database for security
            supportedMethods: ['mobile_money', 'qr_code', 'ussd']
        },
        fees: {
            type: 'percentage',
            value: 1.5, // 1.5% transaction fee
            minimumFee: 2, // 2 ETB minimum
            maximumFee: 500 // 500 ETB maximum
        },
        limits: {
            minimum: 5, // 5 ETB minimum transaction
            maximum: 50000, // 50,000 ETB maximum transaction
            daily: 200000 // 200,000 ETB daily limit
        },
        processingTime: {
            average: '1-3 minutes',
            maximum: '15 minutes'
        },
        icon: 'telebirr-icon.png',
        order: 3
    },
    {
        name: 'cbe',
        displayName: 'CBE Birr',
        description: 'Pay with CBE Birr digital wallet',
        type: 'digital_wallet',
        isActive: true,
        supportedCurrencies: ['ETB'],
        configuration: {
            apiUrl: process.env.CBE_API_URL,
            merchantId: process.env.CBE_MERCHANT_ID,
            // Note: apiKey is not stored in database for security
            supportedMethods: ['digital_wallet', 'bank_account', 'mobile_banking']
        },
        fees: {
            type: 'percentage',
            value: 2.0, // 2.0% transaction fee
            minimumFee: 3, // 3 ETB minimum
            maximumFee: 750 // 750 ETB maximum
        },
        limits: {
            minimum: 10, // 10 ETB minimum transaction
            maximum: 75000, // 75,000 ETB maximum transaction
            daily: 300000 // 300,000 ETB daily limit
        },
        processingTime: {
            average: '2-5 minutes',
            maximum: '20 minutes'
        },
        icon: 'cbe-icon.png',
        order: 4
    }
];

async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function enablePaymentMethod(methodData) {
    try {
        // Check if payment method already exists
        const existing = await PaymentMethod.findOne({ name: methodData.name });

        if (existing) {
            // Update existing payment method
            const updated = await PaymentMethod.findOneAndUpdate(
                { name: methodData.name },
                methodData,
                { new: true, upsert: true }
            );
            console.log(`✅ Updated ${methodData.displayName} payment method`);
            return updated;
        } else {
            // Create new payment method
            const paymentMethod = new PaymentMethod(methodData);
            await paymentMethod.save();
            console.log(`✅ Created ${methodData.displayName} payment method`);
            return paymentMethod;
        }
    } catch (error) {
        console.error(`❌ Error enabling ${methodData.displayName}:`, error.message);
        return null;
    }
}

async function checkConfiguration() {
    console.log('\n🔧 Checking Payment Gateway Configuration...');

    const configs = {
        'Chapa': {
            required: ['CHAPA_SECRET_KEY', 'CHAPA_PUBLIC_KEY'],
            optional: ['CHAPA_WEBHOOK_SECRET', 'CHAPA_API_URL']
        },
        'Telebirr': {
            required: ['TELEBIRR_APP_ID', 'TELEBIRR_APP_KEY'],
            optional: ['TELEBIRR_PUBLIC_KEY', 'TELEBIRR_API_URL']
        },
        'CBE Birr': {
            required: ['CBE_MERCHANT_ID', 'CBE_API_KEY'],
            optional: ['CBE_API_URL']
        }
    };

    let allConfigured = true;

    Object.entries(configs).forEach(([gateway, { required, optional }]) => {
        const missingRequired = required.filter(varName =>
            !process.env[varName] ||
            process.env[varName].includes('your_') ||
            process.env[varName].includes('_here')
        );

        if (missingRequired.length === 0) {
            console.log(`✅ ${gateway}: Required configuration complete`);

            const missingOptional = optional.filter(varName =>
                !process.env[varName] ||
                process.env[varName].includes('your_') ||
                process.env[varName].includes('_here')
            );

            if (missingOptional.length > 0) {
                console.log(`⚠️  ${gateway}: Optional config missing: ${missingOptional.join(', ')}`);
            }
        } else {
            console.log(`❌ ${gateway}: Missing required config: ${missingRequired.join(', ')}`);
            allConfigured = false;
        }
    });

    return allConfigured;
}

async function enableAllPaymentMethods() {
    console.log('\n🚀 Enabling Ethiopian Payment Methods...');

    const results = [];

    for (const methodData of ethiopianPaymentMethods) {
        const result = await enablePaymentMethod(methodData);
        results.push(result);
    }

    const successful = results.filter(r => r !== null);
    console.log(`\n✅ Successfully enabled ${successful.length}/${ethiopianPaymentMethods.length} payment methods`);

    return successful;
}

async function listPaymentMethods() {
    console.log('\n📋 Current Payment Methods:');

    try {
        const methods = await PaymentMethod.find({}).sort({ order: 1 });

        if (methods.length === 0) {
            console.log('   No payment methods found');
            return;
        }

        methods.forEach(method => {
            const status = method.isActive ? '✅ Active' : '❌ Inactive';
            console.log(`   ${method.displayName} (${method.name}) - ${status}`);
            console.log(`      Type: ${method.type}`);
            console.log(`      Currencies: ${method.supportedCurrencies.join(', ')}`);
            console.log(`      Fee: ${method.fees.value}% (min: ${method.fees.minimumFee} ETB)`);
            console.log(`      Limits: ${method.limits.minimum} - ${method.limits.maximum} ETB`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Error listing payment methods:', error.message);
    }
}

async function main() {
    console.log('🎯 ETHIOPIAN PAYMENT GATEWAYS SETUP');
    console.log('='.repeat(50));

    // Connect to database
    await connectDatabase();

    // Check configuration
    const configComplete = await checkConfiguration();

    if (!configComplete) {
        console.log('\n⚠️  Warning: Some payment gateways are not fully configured.');
        console.log('   They will be enabled but may not work until configured.');
        console.log('   See ETHIOPIAN_PAYMENT_INTEGRATION_GUIDE.md for setup instructions.');
    }

    // Enable payment methods
    await enableAllPaymentMethods();

    // List all payment methods
    await listPaymentMethods();

    console.log('\n🎉 Setup completed!');
    console.log('   • Payment methods have been enabled in the database');
    console.log('   • Configure missing API credentials in .env file');
    console.log('   • Run "node scripts/testPaymentGateways.js" to test connectivity');
    console.log('   • See ETHIOPIAN_PAYMENT_INTEGRATION_GUIDE.md for detailed instructions');

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('Ethiopian Payment Gateways Setup Script');
    console.log('');
    console.log('Usage: node enableEthiopianPayments.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --list, -l     List current payment methods only');
    console.log('  --check, -c    Check configuration only');
    console.log('');
    console.log('Examples:');
    console.log('  node enableEthiopianPayments.js           # Enable all payment methods');
    console.log('  node enableEthiopianPayments.js --list    # List current methods');
    console.log('  node enableEthiopianPayments.js --check   # Check configuration');
    process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
    // List only mode
    connectDatabase().then(async () => {
        await listPaymentMethods();
        await mongoose.connection.close();
    }).catch(console.error);
} else if (args.includes('--check') || args.includes('-c')) {
    // Check configuration only
    checkConfiguration().then(() => {
        console.log('\n✅ Configuration check completed');
    }).catch(console.error);
} else {
    // Run full setup
    main().catch(console.error);
}

module.exports = {
    enablePaymentMethod,
    enableAllPaymentMethods,
    checkConfiguration,
    listPaymentMethods
};