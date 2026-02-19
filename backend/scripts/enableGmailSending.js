const mongoose = require('mongoose');
const EmailService = require('../services/EmailService');
const AuthUser = require('../models/AuthUser');
require('dotenv').config();

async function enableGmailSending() {
    try {
        console.log('🔧 Gmail Email Configuration Test\n');

        // Check environment variables
        console.log('📋 Current Configuration:');
        console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'not set');
        console.log('EMAIL_USER:', process.env.EMAIL_USER || 'not set');
        console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'not set');
        console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'not set');

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('\n❌ Gmail configuration incomplete!');
            console.log('\n📝 To enable Gmail sending:');
            console.log('1. Enable 2-factor authentication on your Gmail account');
            console.log('2. Generate an App Password (16 characters)');
            console.log('3. Update backend/.env file:');
            console.log('   EMAIL_SERVICE=gmail');
            console.log('   EMAIL_USER=bitaaaa2004@gmail.com');
            console.log('   EMAIL_PASSWORD=your_app_password_here');
            console.log('   EMAIL_FROM=Modo <bitaaaa2004@gmail.com>');
            console.log('4. Restart the backend server');
            console.log('5. Run this script again');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('\n✅ Connected to MongoDB');

        // Get admin and seller users
        const admin = await AuthUser.findOne({ role: 'admin' });
        const seller = await AuthUser.findOne({ role: 'seller' });

        if (!admin || !seller) {
            console.log('❌ Admin or seller user not found!');
            return;
        }

        console.log('\n📧 Testing Real Gmail Sending...\n');

        // Test 1: Send test email to admin
        console.log('1. Sending test email to admin...');
        try {
            await EmailService.sendEmail(
                admin.email,
                'Email Notifications Enabled - Modo',
                `Hi ${admin.username},\n\nEmail notifications have been successfully configured for your Modo admin account.\n\nYou will now receive email alerts for:\n- New seller registrations\n- Product submissions\n- Refund requests\n- System updates\n\nBest regards,\nThe Modo Team`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #ff4141;">Email Notifications Enabled! ✅</h2>
                    <p>Hi ${admin.username},</p>
                    <p>Email notifications have been successfully configured for your Modo admin account.</p>
                    
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e40af;">You will now receive email alerts for:</h3>
                        <ul style="color: #374151;">
                            <li>New seller registrations</li>
                            <li>Product submissions</li>
                            <li>Refund requests</li>
                            <li>System updates</li>
                        </ul>
                    </div>

                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-v2" 
                       style="display: inline-block; padding: 12px 24px; background: #ff4141; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        Go to Admin Dashboard
                    </a>

                    <p style="color: #666; font-size: 14px;">Best regards,<br>The Modo Team</p>
                </div>
                `
            );
            console.log('✅ Admin email sent successfully!');
        } catch (error) {
            console.log('❌ Failed to send admin email:', error.message);
        }

        // Test 2: Send test email to seller
        console.log('2. Sending test email to seller...');
        try {
            await EmailService.sendEmail(
                seller.email,
                'Email Notifications Enabled - Modo Seller',
                `Hi ${seller.username},\n\nEmail notifications have been successfully configured for your Modo seller account.\n\nYou will now receive email alerts for:\n- Product approvals/rejections\n- New orders\n- Payment notifications\n- Earnings updates\n\nBest regards,\nThe Modo Team`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">Email Notifications Enabled! ✅</h2>
                    <p>Hi ${seller.username},</p>
                    <p>Email notifications have been successfully configured for your Modo seller account.</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #166534;">You will now receive email alerts for:</h3>
                        <ul style="color: #374151;">
                            <li>Product approvals/rejections</li>
                            <li>New orders</li>
                            <li>Payment notifications</li>
                            <li>Earnings updates</li>
                        </ul>
                    </div>

                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller" 
                       style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        Go to Seller Dashboard
                    </a>

                    <p style="color: #666; font-size: 14px;">Best regards,<br>The Modo Team</p>
                </div>
                `
            );
            console.log('✅ Seller email sent successfully!');
        } catch (error) {
            console.log('❌ Failed to send seller email:', error.message);
        }

        console.log('\n🎉 Gmail email sending test completed!');
        console.log('\n📧 Email Summary:');
        console.log('Admin Email:', admin.email);
        console.log('Seller Email:', seller.email);
        console.log('From Address:', process.env.EMAIL_FROM);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\nDatabase connection closed');
        }
    }
}

enableGmailSending();