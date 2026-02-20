const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI;

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const Role = require('../models/Role');

async function populateDatabase() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // 0. Initialize Roles if needed
        console.log('\n🔧 Checking system roles...');
        const roleCount = await Role.countDocuments();
        if (roleCount === 0) {
            console.log('Creating system roles...');
            const RoleInitService = require('../services/RoleInitService');
            await RoleInitService.initializeRoles();
        }
        console.log(`✅ System has ${await Role.countDocuments()} roles`);

        // 1. Create Admin User
        console.log('\n📝 Creating admin user...');

        // Find Administrator role
        const roles = await Role.find({});
        console.log('Available roles:', roles.map(r => r.name));

        let adminRole = await Role.findOne({ name: 'Administrator' });
        if (!adminRole) {
            console.error('❌ Administrator role not found!');
            console.log('Trying alternative role names...');
            adminRole = await Role.findOne({ $or: [{ name: /admin/i }, { name: 'Admin' }] });
            if (!adminRole) {
                console.error('❌ No admin role found at all!');
                return;
            }
            console.log(`✅ Found role: ${adminRole.name}`);
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@modo.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
        } else {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            const userId = 'admin_' + Date.now();
            const adminUser = new User({
                userId: userId,
                name: 'Modo Admin',
                email: 'admin@modo.com',
                password: hashedPassword,
                role: adminRole._id,
                isEmailVerified: true
            });
            await adminUser.save();
            console.log('✅ Admin user created');
            console.log('   Email: admin@modo.com');
            console.log('   Password: Admin@123');
        }

        // 2. Create Sample Products
        console.log('\n📦 Creating sample products...');

        const sampleProducts = [
            {
                id: 1,
                name: 'Classic White T-Shirt',
                category: 'men',
                new_price: 29.99,
                old_price: 39.99,
                description: 'Comfortable cotton t-shirt perfect for everyday wear',
                image: 'https://via.placeholder.com/300x400?text=White+T-Shirt',
                stock: 100,
                isApproved: true
            },
            {
                id: 2,
                name: 'Blue Denim Jeans',
                category: 'men',
                new_price: 59.99,
                old_price: 79.99,
                description: 'Classic fit denim jeans with modern styling',
                image: 'https://via.placeholder.com/300x400?text=Denim+Jeans',
                stock: 75,
                isApproved: true
            },
            {
                id: 3,
                name: 'Summer Floral Dress',
                category: 'women',
                new_price: 49.99,
                old_price: 69.99,
                description: 'Beautiful floral print dress perfect for summer',
                image: 'https://via.placeholder.com/300x400?text=Floral+Dress',
                stock: 50,
                isApproved: true
            },
            {
                id: 4,
                name: 'Elegant Black Heels',
                category: 'women',
                new_price: 79.99,
                old_price: 99.99,
                description: 'Stylish black heels for any occasion',
                image: 'https://via.placeholder.com/300x400?text=Black+Heels',
                stock: 40,
                isApproved: true
            },
            {
                id: 5,
                name: 'Kids Colorful Sneakers',
                category: 'kid',
                new_price: 39.99,
                old_price: 49.99,
                description: 'Fun and comfortable sneakers for active kids',
                image: 'https://via.placeholder.com/300x400?text=Kids+Sneakers',
                stock: 60,
                isApproved: true
            },
            {
                id: 6,
                name: 'Kids Cartoon T-Shirt',
                category: 'kid',
                new_price: 19.99,
                old_price: 24.99,
                description: 'Cute cartoon print t-shirt for kids',
                image: 'https://via.placeholder.com/300x400?text=Kids+T-Shirt',
                stock: 80,
                isApproved: true
            },
            {
                id: 7,
                name: 'Leather Jacket',
                category: 'men',
                new_price: 149.99,
                old_price: 199.99,
                description: 'Premium leather jacket with modern fit',
                image: 'https://via.placeholder.com/300x400?text=Leather+Jacket',
                stock: 30,
                isApproved: true
            },
            {
                id: 8,
                name: 'Casual Handbag',
                category: 'women',
                new_price: 89.99,
                old_price: 119.99,
                description: 'Stylish handbag perfect for daily use',
                image: 'https://via.placeholder.com/300x400?text=Handbag',
                stock: 45,
                isApproved: true
            }
        ];

        const existingProducts = await Product.countDocuments();
        if (existingProducts > 0) {
            console.log(`⚠️  ${existingProducts} products already exist`);
        } else {
            await Product.insertMany(sampleProducts);
            console.log(`✅ Created ${sampleProducts.length} sample products`);
        }

        console.log('\n🎉 Database population complete!');
        console.log('\n📋 Summary:');
        console.log(`   Users: ${await User.countDocuments()}`);
        console.log(`   Products: ${await Product.countDocuments()}`);
        console.log(`   Roles: ${await Role.countDocuments()}`);

        console.log('\n🔐 Admin Login:');
        console.log('   URL: https://modooo-e-commerce.vercel.app/login');
        console.log('   Email: admin@modo.com');
        console.log('   Password: Admin@123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

populateDatabase();
