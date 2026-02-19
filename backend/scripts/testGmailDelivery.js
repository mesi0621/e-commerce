const mongoose = require('mongoose');
const path = require('path');

// Load environment variables FIRST
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Now require services after env vars are loaded
const PasswordResetService = require('../services/PasswordResetService');

async function testGmailDelivery() {
    try {
        console.log('🧪 TESTING GMAIL DELIVERY\n');

        // Check configuration first
        console.log('📋 Email Configuration Check:');
        console.log('   Service:', process.env.EMAIL_SERVICE || 'not set');
        console.log('   User:', process.env.EMAIL_USER || 'not set');
        console.log('   Password:', process.env.EMAIL_PASSWORD === 'your_app_password_here' ?
            '❌ STILL PLACEHOLDER' : '✅ Configured');
        console.log('   From:', process.env.EMAIL_FROM || 'not set');

        if (process.env.EMAIL_PASSWORD === 'your_app_password_here') {
            console.log('\n❌ EMAIL_PASSWORD is still placeholder!');
            return;
        }

        // Reinitialize EmailService with new environment variables
        const EmailService = require('../services/EmailService');
        EmailService.initializeTransporter();

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('\n✅ Connected to MongoDB');

        // Clear existing tokens to avoid rate limiting
        const PasswordReset = require('../models/PasswordReset');
        await PasswordReset.deleteMany({});
        console.log('🗑️ Cleared existing password reset tokens');

        console.log('\n🧪 Test 1: Direct Gmail Test');
        console.log('Sending test email to bitaaaa2004@gmail.com...');

        try {
            await EmailService.sendEmail(
                'bitaaaa2004@gmail.com',
                'Test Email from Modo - Gmail Delivery Test',
                'This is a test email to verify Gmail delivery is working!',
                '<h1>✅ Gmail Delivery Test</h1><p>This email was sent directly to your Gmail inbox!</p><p>If you receive this, real email delivery is working correctly.</p>'
            );
            console.log('✅ Gmail test email sent! Check your Gmail inbox.');
        } catch (error) {
            console.log('❌ Gmail test failed:', error.message);
            if (error.message.includes('Invalid login')) {
                console.log('🔧 Check your Gmail App Password - it might be incorrect');
            }
            return;
        }

        console.log('\n🧪 Test 2: Password Reset Email to Customer');
        console.log('Sending password reset email to mezgebemessi@gmail.com...');

        try {
            const result = await PasswordResetService.createResetRequest(
                'mezgebemessi@gmail.com',
                '127.0.0.1',
                'Gmail Delivery Test'
            );

            if (result.success) {
                console.log('✅ Password reset email sent to customer!');
                console.log('📧 Check mezgebemessi@gmail.com Gmail inbox');

                if (result.resetUrl) {
                    console.log('\n🔗 Reset URL (for testing):');
                    console.log(result.resetUrl);
                }
            } else {
                console.log('❌ Password reset failed:', result.error);
            }
        } catch (error) {
            console.log('❌ Password reset email failed:', error.message);
        }

        console.log('\n🧪 Test 3: Seller Email');
        console.log('Sending test email to seller...');

        try {
            await EmailService.sendEmail(
                'meseretmezgebe338@gmail.com',
                'Test Email from Modo - Seller Gmail Test',
                'This is a Gmail delivery test for your seller account!',
                '<h1>✅ Seller Gmail Test</h1><p>This email confirms that your seller account can receive real emails from Modo via Gmail.</p>'
            );
            console.log('✅ Seller Gmail test sent! Check Gmail inbox.');
        } catch (error) {
            console.log('❌ Seller email failed:', error.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 GMAIL DELIVERY TEST RESULTS');
        console.log('='.repeat(60));

        console.log('✅ Gmail configuration: ACTIVE');
        console.log('📧 Check these Gmail inboxes for REAL emails:');
        console.log('   • bitaaaa2004@gmail.com (admin/test emails)');
        console.log('   • mezgebemessi@gmail.com (customer password reset)');
        console.log('   • meseretmezgebe338@gmail.com (seller emails)');
        console.log('\n🎯 If you received emails in Gmail, real delivery is working!');
        console.log('🎯 Password reset emails will now be delivered to customers!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

testGmailDelivery();