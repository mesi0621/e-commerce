require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const EmailService = require('../services/EmailService');
const AuthUser = require('../models/AuthUser');
const Order = require('../models/Order');

async function testPurchaseNotifications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get test users
        const admin = await AuthUser.findOne({ role: 'admin' });
        const seller = await AuthUser.findOne({ role: 'seller' });
        const customer = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });

        if (!admin || !seller || !customer) {
            console.log('❌ Missing required users');
            console.log('Admin:', admin?.email || 'Not found');
            console.log('Seller:', seller?.email || 'Not found');
            console.log('Customer:', customer?.email || 'Not found');
            return;
        }

        console.log('✅ Found all required users:');
        console.log('Admin:', admin.email);
        console.log('Seller:', seller.email);
        console.log('Customer:', customer.email);

        // Create a mock order for testing
        const mockOrder = {
            orderNumber: `TEST-${Date.now()}`,
            total: 125.50,
            paymentMethod: 'cash_on_delivery',
            createdAt: new Date(),
            shippingAddress: {
                fullName: 'Test Customer',
                address: '123 Test Street',
                city: 'Addis Ababa',
                region: 'Addis Ababa',
                phone: '+251912345678'
            },
            items: [
                {
                    name: 'Test Product 1',
                    quantity: 2,
                    price: 50.00,
                    subtotal: 100.00
                },
                {
                    name: 'Test Product 2',
                    quantity: 1,
                    price: 25.50,
                    subtotal: 25.50
                }
            ]
        };

        console.log('\n📧 Testing comprehensive purchase notifications...');

        // Test the comprehensive notification system
        await EmailService.sendPurchaseNotifications(
            mockOrder,
            customer,
            admin,
            [seller]
        );

        console.log('\n🎉 Test completed! Check the following email addresses:');
        console.log(`📧 Customer (${customer.email}): Order confirmation`);
        console.log(`📧 Admin (${admin.email}): New order notification`);
        console.log(`📧 Seller (${seller.email}): New sale notification`);

        console.log('\n💡 All emails should be delivered to real Gmail addresses!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testPurchaseNotifications();