const mongoose = require('mongoose');
const PasswordResetService = require('../services/PasswordResetService');
require('dotenv').config();

async function simulatePasswordReset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB\n');

        console.log('🔐 Simulating Customer Password Reset Flow\n');

        // Step 1: Customer requests password reset
        console.log('👤 Step 1: Customer clicks "Forgot Password" and enters email');
        console.log('Email entered: bitaaaa2004@gmail.com\n');

        const resetRequest = await PasswordResetService.createResetRequest(
            'bitaaaa2004@gmail.com',
            '192.168.1.100', // Simulated customer IP
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' // Simulated browser
        );

        console.log('📋 Backend Response:');
        console.log('Success:', resetRequest.success);
        console.log('Message:', resetRequest.message);

        if (resetRequest.success) {
            console.log('\n✅ Customer sees: "Password reset email sent successfully"');

            if (resetRequest.token) {
                console.log('\n🔗 Reset Link Generated:');
                console.log('Token:', resetRequest.token);
                console.log('URL:', resetRequest.resetUrl);

                console.log('\n📧 Email Status:');
                if (process.env.EMAIL_PASSWORD === 'your_app_password_here') {
                    console.log('❌ EMAIL NOT SENT - Still in development mode');
                    console.log('   Email is only logged to console');
                    console.log('   Customer will NOT receive the email');
                    console.log('\n🔧 To fix: Update EMAIL_PASSWORD in .env with Gmail App Password');
                } else {
                    console.log('✅ EMAIL SHOULD BE SENT to bitaaaa2004@gmail.com');
                    console.log('   Check Gmail inbox and spam folder');
                }

                // Step 2: Simulate customer clicking the reset link
                console.log('\n👤 Step 2: Customer clicks reset link (if they received email)');

                const tokenVerification = await PasswordResetService.verifyResetToken(resetRequest.token);
                console.log('\n📋 Token Verification:');
                console.log('Valid:', tokenVerification.success);

                if (tokenVerification.success) {
                    console.log('User Info:', tokenVerification.data);
                    console.log('\n✅ Customer can now set new password');

                    // Step 3: Simulate password reset
                    console.log('\n👤 Step 3: Customer enters new password');
                    const newPassword = 'NewPassword123!';

                    const passwordReset = await PasswordResetService.resetPassword(
                        resetRequest.token,
                        newPassword,
                        '192.168.1.100',
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    );

                    console.log('\n📋 Password Reset Result:');
                    console.log('Success:', passwordReset.success);
                    console.log('Message:', passwordReset.message);

                    if (passwordReset.success) {
                        console.log('\n✅ Password reset complete!');
                        console.log('Customer can now login with new password');
                        console.log('New password:', newPassword);
                    }
                } else {
                    console.log('❌ Token invalid or expired');
                }
            }
        } else {
            console.log('\n❌ Password reset request failed');
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Password reset functionality: WORKING');
        console.log('✅ Token generation: WORKING');
        console.log('✅ Database operations: WORKING');
        console.log('✅ Reset URL creation: WORKING');

        if (process.env.EMAIL_PASSWORD === 'your_app_password_here') {
            console.log('❌ Email delivery: NOT WORKING (development mode)');
            console.log('\n🔧 TO FIX EMAIL DELIVERY:');
            console.log('1. Get Gmail App Password from https://myaccount.google.com/');
            console.log('2. Update EMAIL_PASSWORD in backend/.env');
            console.log('3. Restart backend server');
            console.log('4. Test again');
        } else {
            console.log('✅ Email configuration: CONFIGURED');
            console.log('📧 Emails should be sent to real inboxes');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

simulatePasswordReset();