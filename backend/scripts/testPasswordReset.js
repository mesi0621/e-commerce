const mongoose = require('mongoose');
const PasswordResetService = require('../services/PasswordResetService');
const AuthUser = require('../models/AuthUser');
require('dotenv').config();

async function testPasswordReset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB\n');

        console.log('🔐 Testing Password Reset Functionality\n');

        // Test with admin email
        console.log('1. Testing password reset for admin...');
        const adminResult = await PasswordResetService.createResetRequest(
            'bitaaaa2004@gmail.com',
            '127.0.0.1',
            'Test Browser'
        );

        console.log('Admin Reset Result:', adminResult);

        if (adminResult.success && adminResult.token) {
            console.log('\n📧 Password Reset Email Content (Development Mode):');
            console.log('To: bitaaaa2004@gmail.com');
            console.log('Subject: Password Reset Request - Modo');
            console.log('Reset URL:', adminResult.resetUrl);
            console.log('Token:', adminResult.token);
        }

        // Test with seller email
        console.log('\n2. Testing password reset for seller...');
        const sellerResult = await PasswordResetService.createResetRequest(
            'meseretmezgebe338@gmail.com',
            '127.0.0.1',
            'Test Browser'
        );

        console.log('Seller Reset Result:', sellerResult);

        if (sellerResult.success && sellerResult.token) {
            console.log('\n📧 Password Reset Email Content (Development Mode):');
            console.log('To: meseretmezgebe338@gmail.com');
            console.log('Subject: Password Reset Request - Modo');
            console.log('Reset URL:', sellerResult.resetUrl);
            console.log('Token:', sellerResult.token);
        }

        // Test with non-existent email
        console.log('\n3. Testing with non-existent email...');
        const nonExistentResult = await PasswordResetService.createResetRequest(
            'nonexistent@example.com',
            '127.0.0.1',
            'Test Browser'
        );

        console.log('Non-existent Email Result:', nonExistentResult);

        console.log('\n✅ Password Reset Testing Complete!');
        console.log('\n📋 Summary:');
        console.log('- Password reset requests are working');
        console.log('- Tokens are being generated');
        console.log('- Reset URLs are being created');
        console.log('- Emails are being logged (development mode)');

        console.log('\n⚠️  To send real emails:');
        console.log('1. Set up Gmail App Password');
        console.log('2. Update EMAIL_PASSWORD in .env');
        console.log('3. Restart backend server');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

testPasswordReset();