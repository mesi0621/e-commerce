const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseSize() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const stats = await db.stats();

        console.log('📊 Database Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Database: ${stats.db}`);
        console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Total Size: ${((stats.storageSize + stats.indexSize) / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Free Tier Limit: 512 MB`);
        console.log(`Usage: ${(((stats.storageSize + stats.indexSize) / 1024 / 1024 / 512) * 100).toFixed(1)}%`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📁 Collections:');
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            const collStats = await db.collection(collection.name).stats();
            const count = await db.collection(collection.name).countDocuments();
            console.log(`\n   ${collection.name}:`);
            console.log(`   - Documents: ${count.toLocaleString()}`);
            console.log(`   - Size: ${(collStats.size / 1024).toFixed(2)} KB`);
            console.log(`   - Storage: ${(collStats.storageSize / 1024).toFixed(2)} KB`);
        }

        console.log('\n💡 Recommendations:');
        const totalMB = (stats.storageSize + stats.indexSize) / 1024 / 1024;
        if (totalMB > 400) {
            console.log('   ⚠️  Database is near capacity!');
            console.log('   - Consider deleting old/test data');
            console.log('   - Remove unused collections');
            console.log('   - Or create a new project in Atlas');
        } else if (totalMB > 256) {
            console.log('   ⚠️  Database is over 50% full');
            console.log('   - Monitor growth');
            console.log('   - Clean up test data if any');
        } else {
            console.log('   ✅ Database has plenty of space');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabaseSize();
