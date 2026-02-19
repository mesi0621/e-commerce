const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🔄 Attempting to connect to MongoDB Atlas...');
        console.log('Connection string:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Successfully connected to MongoDB Atlas!');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);

        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        await mongoose.connection.close();
        console.log('✅ Connection test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('\n💡 Common issues:');
        console.error('   1. Check username and password are correct');
        console.error('   2. Ensure IP address is whitelisted (0.0.0.0/0 for all)');
        console.error('   3. Verify connection string format');
        console.error('   4. Check if cluster is still deploying (wait 5-10 minutes)');
        process.exit(1);
    }
}

testConnection();
