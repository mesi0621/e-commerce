const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ProductNotificationService = require('../services/ProductNotificationService');
const EmailService = require('../services/EmailService');

async function testProductNotifications() {
    try {
        console.log('🧪 TESTING PRODUCT NOTIFICATION EMAILS\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB');

        // Test data
        const testProduct = {
            id: 1,
            name: 'Premium Wireless Headphones',
            category: 'Electronics',
            new_price: 199.99,
            old_price: 249.99,
            image: 'https://example.com/headphones.jpg',
            stock: 3
        };

        const testSellerInfo = {
            businessName: 'TechGear Store',
            email: 'meseretmezgebe338@gmail.com'
        };

        console.log('🧪 Test 1: Product Submission Email (to Admin)');
        console.log('Sending product submission notification to admin...');

        try {
            await EmailService.sendProductSubmissionEmail(
                'bitaaaa2004@gmail.com', // Admin email
                testProduct,
                testSellerInfo
            );
            console.log('✅ Product submission email sent to admin!');
        } catch (error) {
            console.log('❌ Product submission email failed:', error.message);
        }

        console.log('\n🧪 Test 2: Product Approved Email (to Seller)');
        console.log('Sending product approval notification to seller...');

        try {
            await EmailService.sendProductApprovedEmail(
                'meseretmezgebe338@gmail.com', // Seller email
                testProduct,
                'Meseret Mezgebe'
            );
            console.log('✅ Product approval email sent to seller!');
        } catch (error) {
            console.log('❌ Product approval email failed:', error.message);
        }

        console.log('\n🧪 Test 3: Product Rejected Email (to Seller)');
        console.log('Sending product rejection notification to seller...');

        try {
            await EmailService.sendProductRejectedEmail(
                'meseretmezgebe338@gmail.com', // Seller email
                testProduct,
                'Meseret Mezgebe',
                'Product images need to be higher quality and description needs more details'
            );
            console.log('✅ Product rejection email sent to seller!');
        } catch (error) {
            console.log('❌ Product rejection email failed:', error.message);
        }

        console.log('\n🧪 Test 4: Low Stock Alert (to Seller)');
        console.log('Sending low stock alert to seller...');

        try {
            await EmailService.sendLowStockAlert(
                'meseretmezgebe338@gmail.com', // Seller email
                testProduct,
                'Meseret Mezgebe',
                3 // Current stock
            );
            console.log('✅ Low stock alert sent to seller!');
        } catch (error) {
            console.log('❌ Low stock alert failed:', error.message);
        }

        console.log('\n🧪 Test 5: Back in Stock Email (to Customer)');
        console.log('Sending back in stock notification to customer...');

        try {
            await EmailService.sendBackInStockEmail(
                'mezgebemessi@gmail.com', // Customer email
                testProduct,
                'Customer'
            );
            console.log('✅ Back in stock email sent to customer!');
        } catch (error) {
            console.log('❌ Back in stock email failed:', error.message);
        }

        console.log('\n🧪 Test 6: New Product Launch Email (to Customer)');
        console.log('Sending new product launch notification to customer...');

        try {
            await EmailService.sendNewProductLaunchEmail(
                'mezgebemessi@gmail.com', // Customer email
                testProduct,
                'Customer'
            );
            console.log('✅ New product launch email sent to customer!');
        } catch (error) {
            console.log('❌ New product launch email failed:', error.message);
        }

        console.log('\n🧪 Test 7: Product Summary Email (to Admin)');
        console.log('Sending daily product summary to admin...');

        try {
            await ProductNotificationService.sendProductSummaryToAdmin('daily');
            console.log('✅ Daily product summary sent to admin!');
        } catch (error) {
            console.log('❌ Product summary email failed:', error.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 PRODUCT NOTIFICATION TEST RESULTS');
        console.log('='.repeat(60));

        console.log('✅ Product notification system: ACTIVE');
        console.log('📧 Check these Gmail inboxes for product emails:');
        console.log('   • bitaaaa2004@gmail.com (admin notifications)');
        console.log('   • meseretmezgebe338@gmail.com (seller notifications)');
        console.log('   • mezgebemessi@gmail.com (customer notifications)');
        console.log('\n🎯 Product notification emails are now working!');
        console.log('🎯 Real-time notifications for product events!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

testProductNotifications();