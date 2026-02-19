const mongoose = require('mongoose');
const PasswordResetService = require('../services/PasswordResetService');
const PasswordReset = require('../models/PasswordReset');
require('dotenv').config();

async function testSpecificEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB\n');

        const testEmail = 'mezgebemessi@gmail.com';
        console.log(`🔐 Testing Password Reset for: ${testEmail}\n`);

        // Clear any existing tokens for this email to avoid rate limiting
        console.log('🗑️ Clearing existing password reset tokens...');
        await PasswordReset.deleteMany({ email: testEmail });
        console.log('✅ Tokens cleared\n');

        // Test password reset request
        console.log('📧 Requesting password reset...');
        const result = await PasswordResetService.createResetRequest(
            testEmail,
            '127.0.0.1',
            'Test Browser'
        );

        console.log('📋 Password Reset Result:');
        console.log('   Success:', result.success);
        console.log('   Message:', result.message);

        if (result.success && result.token) {
            console.log('   Token:', result.token);
            console.log('   Reset URL:', result.resetUrl);

            console.log('\n✅ SUCCESS! Password reset email would be sent to:', testEmail);
            console.log('\n📧 Email Content:');
            console.log('═══════════════════════════════════════════════════');
            console.log(`To: ${testEmail}`);
            console.log('From: Modo <ge6qck7iadp7kl23@ethereal.email>');
            console.log('Subject: Password Reset Request - Modo');
            console.log('');
            console.log('Hi meseret,');
            console.log('');
            console.log('You requested to reset your password for your Modo account.');
            console.log('');
            console.log('Click the link below to reset your password:');
            console.log(result.resetUrl);
            console.log('');
            console.log('This link will expire in 1 hour for security reasons.');
            console.log('');
            console.log('If you didn\'t request this password reset, please ignore this email.');
            console.log('Your password will remain unchanged.');
            console.log('');
            console.log('Best regards,');
            console.log('The Modo Team');
            console.log('═══════════════════════════════════════════════════');

            console.log('\n🧪 MANUAL TEST:');
            console.log('1. Copy this URL and paste in browser:');
            console.log(`   ${result.resetUrl}`);
            console.log('2. Set a new password');
            console.log('3. Try logging in with the new password');

            console.log('\n📧 TO VIEW THE ACTUAL EMAIL:');
            console.log('1. Go to: https://ethereal.email/');
            console.log('2. Login with:');
            console.log('   Email: ge6qck7iadp7kl23@ethereal.email');
            console.log('   Password: q4JhBY3B9QezGdhvKJ');
            console.log('3. Look for the email sent to mezgebemessi@gmail.com');

        } else {
            console.log('\n❌ Password reset failed');
            if (result.error) {
                console.log('   Error:', result.error);
            }
        }

        console.log('\n💡 Current Login Credentials:');
        console.log('   Email: mezgebemessi@gmail.com');
        console.log('   Username: meseret');
        console.log('   Role: customer');
        console.log('   Password: (use reset link to set new password)');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

testSpecificEmail();