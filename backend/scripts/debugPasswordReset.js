const mongoose = require('mongoose');
const PasswordResetService = require('../services/PasswordResetService');
const AuthUser = require('../models/AuthUser');
const EmailService = require('../services/EmailService');
require('dotenv').config();

async function debugPasswordReset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB\n');

        console.log('🔍 Debugging Password Reset Issue\n');

        // Check if admin user exists
        console.log('1. Checking if admin user exists...');
        const admin = await AuthUser.findOne({ email: 'bitaaaa2004@gmail.com' });

        if (admin) {
            console.log('✅ Admin user found:');
            console.log('   Email:', admin.email);
            console.log('   Username:', admin.username);
            console.log('   Active:', admin.isActive);
            console.log('   Role:', admin.role);
        } else {
            console.log('❌ Admin user NOT found with email: bitaaaa2004@gmail.com');

            // Check what users exist
            const allUsers = await AuthUser.find({}, 'email username role');
            console.log('\n📋 All users in database:');
            allUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.username}) - ${user.role}`);
            });
        }

        // Test email service directly
        console.log('\n2. Testing email service directly...');
        try {
            await EmailService.sendEmail(
                'bitaaaa2004@gmail.com',
                'Test Email - Modo',
                'This is a test email to verify email service is working.',
                '<h1>Test Email</h1><p>This is a test email to verify email service is working.</p>'
            );
            console.log('✅ Email service test successful');
        } catch (emailError) {
            console.log('❌ Email service test failed:', emailError.message);
        }

        // Test password reset service with proper error handling
        console.log('\n3. Testing password reset service...');
        try {
            const result = await PasswordResetService.createResetRequest(
                'bitaaaa2004@gmail.com',
                '127.0.0.1',
                'Debug Test'
            );

            console.log('✅ Password reset service result:');
            console.log('   Success:', result.success);
            console.log('   Message:', result.message);
            if (result.token) {
                console.log('   Token:', result.token);
                console.log('   Reset URL:', result.resetUrl);
            }
            if (result.error) {
                console.log('   Error:', result.error);
            }

        } catch (resetError) {
            console.log('❌ Password reset service failed:');
            console.log('   Error:', resetError.message);
            console.log('   Stack:', resetError.stack);
        }

        // Check email configuration
        console.log('\n4. Checking email configuration...');
        console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'not set');
        console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'not set');
        console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ?
            (process.env.EMAIL_PASSWORD === 'your_app_password_here' ? 'PLACEHOLDER (not configured)' : 'configured')
            : 'not set');
        console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'not set');
        console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');

        console.log('\n' + '='.repeat(60));
        console.log('📊 DIAGNOSIS');
        console.log('='.repeat(60));

        if (!admin) {
            console.log('❌ ISSUE FOUND: Admin user does not exist with email bitaaaa2004@gmail.com');
            console.log('🔧 SOLUTION: Update admin email or create user with correct email');
        } else if (!admin.isActive) {
            console.log('❌ ISSUE FOUND: Admin user exists but is inactive');
            console.log('🔧 SOLUTION: Activate the admin user account');
        } else if (process.env.EMAIL_PASSWORD === 'your_app_password_here') {
            console.log('❌ ISSUE FOUND: Email password is still placeholder');
            console.log('🔧 SOLUTION: Configure Gmail App Password in .env file');
        } else {
            console.log('✅ All checks passed - password reset should work');
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

debugPasswordReset();