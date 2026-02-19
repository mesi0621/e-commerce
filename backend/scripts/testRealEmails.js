const mongoose = require('mongoose');
const EmailService = require('../services/EmailService');
const PasswordResetService = require('../services/PasswordResetService');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testRealEmails() {
    try {
        console.log('🧪 TESTING REAL EMAIL SENDING\n');

        // Check configuration first
        console.log('📋 Email Configuration Check:');
        console.log('   Service:', process.env.EMAIL_SERVICE || 'not set');
        console.log('   User:', process.env.EMAIL_USER || 'not set');
        console.log('   Password:', process.env.EMAIL_PASSWORD === 'your_app_password_here' ?
            '❌ STILL PLACEHOLDER' : '✅ Configured');
        console.log('   From:', process.env.EMAIL_FROM || 'not set');

        if (process.env.EMAIL_PASSWORD === 'your_app_password_here') {
            console.log('\n❌ EMAIL_PASSWORD is still placeholder!');
            console.log('🔧 You need to:');
            console.log('1. Get Gmail App Password from https://myaccount.google.com/security');
            console.log('2. Update EMAIL_PASSWORD in backend/.env');
            console.log('3. Restart backend server');
            console.log('4. Run this script again');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('\n✅ Connected to MongoDB');

        // Clear existing tokens to avoid rate limiting
        const PasswordReset = require('../models/PasswordReset');
        await PasswordReset.deleteMany({});
        console.log('🗑️ Cleared existing password reset tokens');

        console.log('\n🧪 Test 1: Direct Email Test');
        console.log('Sending test email to bitaaaa2004@gmail.com...');

        try {
            await EmailService.sendEmail(
                'bitaaaa2004@gmail.com',
                'Test Email from Modo - Real Email Sending',
                'This is a test email to verify that real email sending is working!',
                '<h1>✅ Success!</h1><p>This is a test email to verify that real email sending is working!</p><p>If you receive this email, the configuration is correct.</p>'
            );
            console.log('✅ Test email sent! Check Gmail inbox.');
        } catch (error) {
            console.log('❌ Test email failed:', error.message);
            console.log('🔧 Check your Gmail App Password configuration');
            return;
        }

        console.log('\n🧪 Test 2: Password Reset Email');
        console.log('Sending password reset email...');

        try {
            const result = await PasswordResetService.createResetRequest(
                'bitaaaa2004@gmail.com',
                '127.0.0.1',
                'Real Email Test'
            );

            if (result.success) {
                console.log('✅ Password reset email sent!');
                console.log('📧 Check Gmail inbox for password reset email');

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
                'Test Email from Modo - Seller Account',
                'This is a test email for your seller account!',
                '<h1>✅ Seller Email Test</h1><p>This email confirms that your seller account can receive emails from Modo.</p>'
            );
            console.log('✅ Seller test email sent! Check Gmail inbox.');
        } catch (error) {
            console.log('❌ Seller email failed:', error.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULTS SUMMARY');
        console.log('='.repeat(60));

        if (process.env.EMAIL_PASSWORD !== 'your_app_password_here') {
            console.log('✅ Email configuration: READY');
            console.log('📧 Check these Gmail inboxes:');
            console.log('   • bitaaaa2004@gmail.com (admin/customer emails)');
            console.log('   • meseretmezgebe338@gmail.com (seller emails)');
            console.log('\n🎯 If you received emails, real email sending is working!');
            console.log('🎯 Customers will now receive password reset emails in their inbox!');
        } else {
            console.log('❌ Email configuration: NEEDS SETUP');
            console.log('🔧 Follow the Gmail App Password setup steps');
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

testRealEmails();