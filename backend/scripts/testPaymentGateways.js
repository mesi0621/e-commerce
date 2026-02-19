const ChapaService = require('../services/ChapaService');
const TelebirrService = require('../services/TelebirrService');
const CBEBirrService = require('../services/CBEBirrService');

/**
 * Test Ethiopian Payment Gateways Configuration
 * This script tests the configuration and basic connectivity of all payment gateways
 */

async function testChapaConfiguration() {
    console.log('\n🔍 Testing Chapa Configuration...');

    try {
        // Test with minimal payment data
        const testPayment = {
            amount: 100,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+251911123456',
            txRef: `TEST-${Date.now()}`,
            callbackUrl: 'http://localhost:5000/api/payments/chapa/callback',
            returnUrl: 'http://localhost:3000/payment/success'
        };

        const result = await ChapaService.initializePayment(testPayment);

        if (result.success) {
            console.log('✅ Chapa: Configuration appears valid');
            console.log('   Payment URL generated successfully');
        } else {
            console.log('❌ Chapa: Configuration issue');
            console.log('   Error:', result.error);
        }
    } catch (error) {
        console.log('❌ Chapa: Connection error');
        console.log('   Error:', error.message);
    }
}

async function testTelebirrConfiguration() {
    console.log('\n🔍 Testing Telebirr Configuration...');

    try {
        const testPayment = {
            amount: 100,
            orderId: `TEST-${Date.now()}`,
            phoneNumber: '+251911123456',
            notifyUrl: 'http://localhost:5000/api/payments/telebirr/notify',
            returnUrl: 'http://localhost:3000/payment/success'
        };

        const result = await TelebirrService.initializePayment(testPayment);

        if (result.success) {
            console.log('✅ Telebirr: Configuration appears valid');
            console.log('   Payment URL generated successfully');
        } else {
            console.log('❌ Telebirr: Configuration issue');
            console.log('   Error:', result.error);
        }
    } catch (error) {
        console.log('❌ Telebirr: Connection error');
        console.log('   Error:', error.message);
    }
}

async function testCBEConfiguration() {
    console.log('\n🔍 Testing CBE Birr Configuration...');

    try {
        const testPayment = {
            amount: 100,
            orderId: `TEST-${Date.now()}`,
            customerName: 'Test User',
            customerPhone: '+251911123456',
            callbackUrl: 'http://localhost:5000/api/payments/cbe/callback',
            returnUrl: 'http://localhost:3000/payment/success'
        };

        const result = await CBEBirrService.initializePayment(testPayment);

        if (result.success) {
            console.log('✅ CBE Birr: Configuration appears valid');
            console.log('   Payment URL generated successfully');
        } else {
            console.log('❌ CBE Birr: Configuration issue');
            console.log('   Error:', result.error);
        }
    } catch (error) {
        console.log('❌ CBE Birr: Connection error');
        console.log('   Error:', error.message);
    }
}

function checkEnvironmentVariables() {
    console.log('\n🔧 Checking Environment Variables...');

    const requiredVars = {
        'Chapa': ['CHAPA_SECRET_KEY', 'CHAPA_PUBLIC_KEY'],
        'Telebirr': ['TELEBIRR_APP_ID', 'TELEBIRR_APP_KEY'],
        'CBE Birr': ['CBE_MERCHANT_ID', 'CBE_API_KEY']
    };

    let allConfigured = true;

    Object.entries(requiredVars).forEach(([gateway, vars]) => {
        const missing = vars.filter(varName =>
            !process.env[varName] || process.env[varName].includes('your_') || process.env[varName].includes('_here')
        );

        if (missing.length === 0) {
            console.log(`✅ ${gateway}: All environment variables configured`);
        } else {
            console.log(`❌ ${gateway}: Missing or placeholder values for: ${missing.join(', ')}`);
            allConfigured = false;
        }
    });

    return allConfigured;
}

function printSetupInstructions() {
    console.log('\n📋 SETUP INSTRUCTIONS FOR ETHIOPIAN PAYMENT GATEWAYS');
    console.log('='.repeat(60));

    console.log('\n1. CHAPA PAYMENT GATEWAY');
    console.log('   • Visit: https://dashboard.chapa.co/');
    console.log('   • Create account and get API keys');
    console.log('   • Update .env file:');
    console.log('     CHAPA_SECRET_KEY=chaseck_test_...');
    console.log('     CHAPA_PUBLIC_KEY=CHAPUBK_TEST_...');

    console.log('\n2. TELEBIRR PAYMENT GATEWAY');
    console.log('   • Contact Ethio Telecom for merchant account');
    console.log('   • Get APP_ID and APP_KEY from Telebirr');
    console.log('   • Update .env file:');
    console.log('     TELEBIRR_APP_ID=your_app_id');
    console.log('     TELEBIRR_APP_KEY=your_app_key');

    console.log('\n3. CBE BIRR PAYMENT GATEWAY');
    console.log('   • Contact Commercial Bank of Ethiopia');
    console.log('   • Apply for merchant account and API access');
    console.log('   • Update .env file:');
    console.log('     CBE_MERCHANT_ID=your_merchant_id');
    console.log('     CBE_API_KEY=your_api_key');

    console.log('\n4. TESTING');
    console.log('   • Use sandbox/test credentials first');
    console.log('   • Test with small amounts (1-10 ETB)');
    console.log('   • Verify webhook endpoints are accessible');

    console.log('\n5. PRODUCTION DEPLOYMENT');
    console.log('   • Switch to production API keys');
    console.log('   • Update API URLs to production endpoints');
    console.log('   • Ensure HTTPS for webhook callbacks');
    console.log('   • Test thoroughly before going live');
}

async function main() {
    console.log('🚀 ETHIOPIAN PAYMENT GATEWAYS TEST SUITE');
    console.log('='.repeat(50));

    // Check environment variables first
    const envConfigured = checkEnvironmentVariables();

    if (!envConfigured) {
        console.log('\n⚠️  Some payment gateways are not configured.');
        console.log('   Tests will show configuration errors for unconfigured gateways.');
    }

    // Test each gateway
    await testChapaConfiguration();
    await testTelebirrConfiguration();
    await testCBEConfiguration();

    // Print setup instructions
    printSetupInstructions();

    console.log('\n✨ Test completed! Check the results above.');
    console.log('   Configure missing gateways and re-run this script.');
}

// Run the test if this script is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testChapaConfiguration,
    testTelebirrConfiguration,
    testCBEConfiguration,
    checkEnvironmentVariables
};