const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB\n');

        // Find admin user
        const admin = await AuthUser.findOne({ email: 'admin@ecommerce.com' });

        if (admin) {
            console.log('✅ Admin user found:');
            console.log('Email:', admin.email);
            console.log('Username:', admin.username);
            console.log('Role:', admin.role);
            console.log('Is Active:', admin.isActive);
            console.log('Created At:', admin.createdAt);

            // Test password
            const testPassword = 'admin123';
            const isValid = await bcrypt.compare(testPassword, admin.password);
            console.log('\nPassword "admin123" is valid:', isValid);

            if (!isValid) {
                console.log('\n⚠️  Password does not match! Resetting to admin123...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                admin.password = hashedPassword;
                await admin.save();
                console.log('✅ Password reset successfully!');
            }
        } else {
            console.log('❌ Admin user not found!');
            console.log('Creating admin user...');

            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = new AuthUser({
                username: 'admin',
                email: 'admin@ecommerce.com',
                password: hashedPassword,
                role: 'admin',
                permissions: ['*.*'],
                isActive: true
            });

            await newAdmin.save();
            console.log('✅ Admin user created!');
            console.log('Email: admin@ecommerce.com');
            console.log('Password: admin123');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

checkAdmin();
