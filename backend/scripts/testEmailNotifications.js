const mongoose = require('mongoose');
const EmailService = require('../services/EmailService');
const NotificationService = require('../services/NotificationService');
const AuthUser = require('../models/AuthUser');
require('dotenv').config();

async function testEmailNotifications() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB\n');

        // Get admin and seller users
        const admin = await AuthUser.findOne({ role: 'admin' });
        const seller = await AuthUser.findOne({ role: 'seller' });

        if (!admin) {
            console.log('❌ Admin user not found!');
            return;
        }

        if (!seller) {
            console.log('❌ Seller user not found!');
            return;
        }

        console.log('📧 Testing Email Notifications...\n');

        // Test 1: Send welcome email to admin
        console.log('1. Sending welcome email to admin...');
        await EmailService.sendWelcomeEmail(admin.email, admin.username);

        // Test 2: Send welcome email to seller
        console.log('2. Sending welcome email to seller...');
        await EmailService.sendWelcomeEmail(seller.email, seller.username);

        // Test 3: Create in-app notifications
        console.log('3. Creating in-app notifications...');

        // Admin notification
        await NotificationService.createNotification(
            admin._id,
            'system',
            'System Update',
            'Email notifications have been configured successfully. You will now receive email alerts for important events.',
            { source: 'system_config' },
            '/admin-v2'
        );

        // Seller notification
        await NotificationService.createNotification(
            seller._id,
            'system',
            'Email Notifications Enabled',
            'Your seller account is now configured to receive email notifications for orders, product approvals, and earnings updates.',
            { source: 'system_config' },
            '/seller'
        );

        // Test 4: Send test order confirmation (mock data)
        console.log('4. Sending test order confirmation...');
        const mockOrder = {
            orderNumber: 'TEST-' + Date.now(),
            items: [
                {
                    name: 'Test Product',
                    image: 'https://via.placeholder.com/60',
                    quantity: 2,
                    subtotal: 50.00
                }
            ],
            subtotal: 50.00,
            shippingFee: 5.00,
            tax: 4.50,
            total: 59.50
        };

        await EmailService.sendOrderConfirmationEmail(admin.email, mockOrder);

        // Test 5: Send password reset test
        console.log('5. Sending test password reset email...');
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=test-token`;
        await EmailService.sendPasswordResetEmail(seller.email, seller.username, resetUrl, 'test-token');

        console.log('\n✅ All email tests completed!');
        console.log('\n📧 Email Configuration:');
        console.log('Admin Email:', admin.email);
        console.log('Seller Email:', seller.email);
        console.log('Email Service:', process.env.EMAIL_SERVICE || 'development (console)');
        console.log('From Address:', process.env.EMAIL_FROM || 'Modo <noreply@modo.com>');

        if (process.env.EMAIL_SERVICE === 'gmail') {
            console.log('\n⚠️  IMPORTANT: For Gmail to work, you need to:');
            console.log('1. Enable 2-factor authentication on your Gmail account');
            console.log('2. Generate an App Password (not your regular password)');
            console.log('3. Update EMAIL_PASSWORD in .env with the App Password');
            console.log('4. Make sure EMAIL_USER is set to your Gmail address');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

testEmailNotifications();