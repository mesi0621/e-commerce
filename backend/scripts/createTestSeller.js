const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const SellerProfile = require('../models/SellerProfile');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createTestSeller() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB\n');

        // Check if seller already exists
        const existingSeller = await AuthUser.findOne({ email: 'seller@ecommerce.com' });

        if (existingSeller) {
            console.log('✅ Seller user already exists:');
            console.log('Email:', existingSeller.email);
            console.log('Username:', existingSeller.username);
            console.log('Role:', existingSeller.role);
            console.log('Password: seller123');

            // Check if seller profile exists
            const sellerProfile = await SellerProfile.findOne({ userId: existingSeller._id });
            if (sellerProfile) {
                console.log('\n✅ Seller profile exists:');
                console.log('Business Name:', sellerProfile.businessName);
                console.log('Business Email:', sellerProfile.businessEmail);
                console.log('Is Approved:', sellerProfile.isApproved);
                console.log('Commission:', sellerProfile.commission + '%');
            } else {
                console.log('\n⚠️  Seller profile not found. Creating...');
                await createSellerProfile(existingSeller._id);
            }
        } else {
            console.log('Creating test seller user...');

            // Create seller user
            const hashedPassword = await bcrypt.hash('seller123', 10);
            const newSeller = new AuthUser({
                username: 'testseller',
                email: 'seller@ecommerce.com',
                password: hashedPassword,
                role: 'seller',
                permissions: ['products.create', 'products.update.own', 'products.read'],
                isActive: true
            });

            await newSeller.save();
            console.log('✅ Seller user created!');
            console.log('Email: seller@ecommerce.com');
            console.log('Password: seller123');
            console.log('Username: testseller');

            // Create seller profile
            await createSellerProfile(newSeller._id);

            // Update user with sellerId reference
            const sellerProfile = await SellerProfile.findOne({ userId: newSeller._id });
            newSeller.sellerId = sellerProfile._id;
            await newSeller.save();
        }

        console.log('\n=================================');
        console.log('SELLER CREDENTIALS:');
        console.log('Email: seller@ecommerce.com');
        console.log('Password: seller123');
        console.log('=================================\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

async function createSellerProfile(userId) {
    const sellerProfile = new SellerProfile({
        userId: userId,
        businessName: 'Test Seller Store',
        businessEmail: 'seller@ecommerce.com',
        businessPhone: '+1234567890',
        address: {
            street: '123 Business St',
            city: 'Commerce City',
            state: 'CA',
            country: 'USA',
            zipCode: '12345'
        },
        taxId: 'TAX123456',
        bankAccount: {
            accountNumber: '1234567890',
            bankName: 'Test Bank',
            accountHolderName: 'Test Seller',
            routingNumber: '987654321'
        },
        isApproved: true, // Pre-approved for testing
        approvedAt: Date.now(),
        rating: 4.5,
        totalSales: 0,
        commission: 10
    });

    await sellerProfile.save();
    console.log('✅ Seller profile created!');
    console.log('Business Name: Test Seller Store');
    console.log('Commission: 10%');
    console.log('Status: Approved');
}

createTestSeller();
