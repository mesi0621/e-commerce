require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');

async function checkDuplicateUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await AuthUser.find({});
        console.log(`\n📊 Total users: ${users.length}\n`);

        // Group by email to find duplicates
        const emailGroups = {};
        users.forEach(user => {
            if (!emailGroups[user.email]) {
                emailGroups[user.email] = [];
            }
            emailGroups[user.email].push(user);
        });

        // Check for duplicate emails
        console.log('🔍 Checking for duplicate emails:\n');
        let duplicatesFound = false;

        for (const [email, userList] of Object.entries(emailGroups)) {
            if (userList.length > 1) {
                duplicatesFound = true;
                console.log(`❌ DUPLICATE EMAIL: ${email}`);
                userList.forEach((user, index) => {
                    console.log(`   ${index + 1}. ID: ${user._id}, Username: ${user.username}, Role: ${user.role}`);
                });
                console.log('');
            }
        }

        if (!duplicatesFound) {
            console.log('✅ No duplicate emails found');
        }

        // Check for users with similar usernames
        console.log('\n🔍 Users with similar names:\n');
        const usernameGroups = {};
        users.forEach(user => {
            const normalizedUsername = user.username.toLowerCase().trim();
            if (!usernameGroups[normalizedUsername]) {
                usernameGroups[normalizedUsername] = [];
            }
            usernameGroups[normalizedUsername].push(user);
        });

        for (const [username, userList] of Object.entries(usernameGroups)) {
            if (userList.length > 1) {
                console.log(`⚠️ SIMILAR USERNAMES: "${username}"`);
                userList.forEach((user, index) => {
                    console.log(`   ${index + 1}. ID: ${user._id}, Email: ${user.email}, Role: ${user.role}`);
                });
                console.log('');
            }
        }

        // Show all users for reference
        console.log('\n📋 All users:\n');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email}) - ID: ${user._id} - Role: ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDuplicateUsers();