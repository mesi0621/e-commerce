const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
require('dotenv').config();

async function updateAdminEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB\n');

        // Find current admin user
        const admin = await AuthUser.findOne({ role: 'admin' });

        if (admin) {
            console.log('✅ Current admin found:');
            console.log('Current Email:', admin.email);
            console.log('Username:', admin.username);

            // Update email
            const newEmail = 'bitaaaa2004@gmail.com';
            admin.email = newEmail;
            admin.updatedAt = new Date();

            await admin.save();

            console.log('\n✅ Admin email updated successfully!');
            console.log('New Email:', newEmail);
            console.log('Password remains: admin123');
        } else {
            console.log('❌ Admin user not found!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

updateAdminEmail();