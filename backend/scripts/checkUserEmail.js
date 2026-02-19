const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
require('dotenv').config();

async function checkUserEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB\n');

        console.log('🔍 Checking for user: mezgebemessi@gmail.com\n');

        // Check if user exists
        const user = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });

        if (user) {
            console.log('✅ User found:');
            console.log('   Email:', user.email);
            console.log('   Username:', user.username);
            console.log('   Role:', user.role);
            console.log('   Active:', user.isActive);
            console.log('   Created:', user.createdAt);
        } else {
            console.log('❌ User NOT found with email: mezgebemessi@gmail.com');

            console.log('\n📋 All users in database:');
            const allUsers = await AuthUser.find({}, 'email username role isActive');
            allUsers.forEach((u, index) => {
                console.log(`   ${index + 1}. ${u.email} (${u.username}) - ${u.role} - Active: ${u.isActive}`);
            });

            console.log('\n🔧 Would you like to:');
            console.log('1. Create a new user with mezgebemessi@gmail.com');
            console.log('2. Update an existing user\'s email to mezgebemessi@gmail.com');
            console.log('3. Check if there\'s a similar email (typo)');
        }

        // Check for similar emails (in case of typo)
        console.log('\n🔍 Checking for similar emails...');
        const similarUsers = await AuthUser.find({
            email: { $regex: 'mezgebe', $options: 'i' }
        }, 'email username role');

        if (similarUsers.length > 0) {
            console.log('📧 Found similar emails:');
            similarUsers.forEach(u => {
                console.log(`   - ${u.email} (${u.username}) - ${u.role}`);
            });
        } else {
            console.log('📧 No similar emails found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

checkUserEmail();