const mongoose = require('mongoose');
const PasswordReset = require('../models/PasswordReset');
require('dotenv').config();

async function clearPasswordResetTokens() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB\n');

        console.log('🗑️ Clearing all password reset tokens...');

        // Delete all password reset tokens
        const result = await PasswordReset.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} password reset tokens`);
        console.log('🔄 Rate limiting cleared - customers can now request password reset again');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

clearPasswordResetTokens();