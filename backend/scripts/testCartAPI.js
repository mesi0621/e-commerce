const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const AuthUser = require('../models/AuthUser');

async function testCartAPI() {
    try {
        console.log('🧪 TESTING CART API ENDPOINT\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB');

        // Find test user
        const testUser = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!testUser) {
            console.log('❌ Test user not found');
            return;
        }
        console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser._id})`);

        // Test the cart API endpoint
        const { default: fetch } = await import('node-fetch');
        const baseURL = 'http://localhost:5000';

        console.log('\n📡 Testing GET /api/cart/:userId');
        console.log(`URL: ${baseURL}/api/cart/${testUser._id}`);

        try {
            const response = await fetch(`${baseURL}/api/cart/${testUser._id}`);
            const data = await response.json();

            console.log('✅ API Response Status:', response.status);
            console.log('✅ API Response:', JSON.stringify(data, null, 2));

            if (data.success && data.data.items) {
                console.log(`\n📦 Cart contains ${data.data.items.length} items:`);
                data.data.items.forEach((item, index) => {
                    console.log(`\n${index + 1}. ${item.product ? item.product.name : 'Unknown Product'}`);
                    console.log(`   Product ID: ${item.productId}`);
                    console.log(`   Quantity: ${item.quantity}`);
                    console.log(`   Price: $${item.price}`);
                    if (item.product) {
                        console.log(`   Category: ${item.product.category}`);
                        console.log(`   Image: ${item.product.image}`);
                        console.log(`   Available: ${item.product.available}`);
                    }
                });
            }

        } catch (apiError) {
            console.log('❌ API Error:', apiError.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

testCartAPI();