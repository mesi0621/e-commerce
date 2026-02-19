const mongoose = require('mongoose');
const Role = require('../models/Role');
const AuthUser = require('../models/AuthUser');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Define roles with their permissions
const roles = [
    {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access and control',
        isSystem: true,
        permissions: ['*.*']
    },
    {
        name: 'seller',
        displayName: 'Seller/Vendor',
        description: 'Sell products on the platform',
        isSystem: true,
        permissions: [
            'products.create',
            'products.read',
            'products.update.own',
            'products.delete.own',
            'orders.read.own',
            'orders.update.own'
        ]
    },
    {
        name: 'customer',
        displayName: 'Customer',
        description: 'Purchase products',
        isSystem: true,
        permissions: [
            'products.read',
            'orders.create',
            'orders.read.own',
            'orders.cancel.own',
            'cart.manage.own',
            'reviews.create',
            'reviews.read',
            'reviews.update.own',
            'reviews.delete.own'
        ]
    },
    {
        name: 'delivery',
        displayName: 'Delivery Staff',
        description: 'Handle product delivery',
        isSystem: true,
        permissions: [
            'deliveries.read.assigned',
            'deliveries.update.assigned'
        ]
    },
    {
        name: 'support',
        displayName: 'Customer Support',
        description: 'Help customers and maintain quality',
        isSystem: true,
        permissions: [
            'support.read',
            'support.update',
            'reviews.moderate',
            'orders.read.all'
        ]
    },
    {
        name: 'finance',
        displayName: 'Finance Staff',
        description: 'Manage financial operations',
        isSystem: true,
        permissions: [
            'finance.read',
            'finance.reports',
            'finance.payouts',
            'orders.read.all'
        ]
    },
    {
        name: 'guest',
        displayName: 'Guest',
        description: 'Unregistered visitor',
        isSystem: true,
        permissions: [
            'products.read',
            'reviews.read'
        ]
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB');

        // Clear existing roles
        console.log('Clearing existing roles...');
        await Role.deleteMany({});

        // Seed roles
        console.log('Seeding roles...');
        const createdRoles = await Role.insertMany(roles);
        console.log(`Created ${createdRoles.length} roles`);

        // Create default admin user if not exists
        const adminExists = await AuthUser.findOne({ email: 'admin@ecommerce.com' });

        if (!adminExists) {
            console.log('Creating default admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            const adminUser = new AuthUser({
                username: 'admin',
                email: 'admin@ecommerce.com',
                password: hashedPassword,
                role: 'admin',
                permissions: ['*.*'],
                isActive: true
            });

            await adminUser.save();
            console.log('\n✅ Default admin user created');
            console.log('Email: admin@ecommerce.com');
            console.log('Password: admin123');
            console.log('⚠️  IMPORTANT: Change this password in production!');
        } else {
            console.log('Admin user already exists');
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\nRoles created:');
        roles.forEach(role => {
            console.log(`  - ${role.displayName} (${role.name}): ${role.permissions.length} permissions`);
        });

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the seed function
seedDatabase();
