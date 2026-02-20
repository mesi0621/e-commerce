const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Role = require('../models/Role');

async function createRealAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Find admin role
        const adminRole = await Role.findOne({ name: /admin/i });
        if (!adminRole) {
            console.error('❌ Admin role not found!');
            return;
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'bitaaaa2004@gmail.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin with this email already exists');
            console.log('   Updating to admin role...');
            existingAdmin.role = adminRole._id;
            await existingAdmin.save();
            console.log('✅ User promoted to admin!');
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            const userId = 'admin_' + Date.now();
            const adminUser = new User({
                userId: userId,
                name: 'Admin',
                email: 'bitaaaa2004@gmail.com',
                password: hashedPassword,
                role: adminRole._id,
                isEmailVerified: true
            });
            await adminUser.save();
            console.log('✅ Admin user created!');
        }

        console.log('\n🔐 Admin Login Credentials:');
        console.log('   URL: https://modooo-e-commerce.vercel.app/login');
        console.log('   Email: bitaaaa2004@gmail.com');
        console.log('   Password: Admin@123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createRealAdmin();
