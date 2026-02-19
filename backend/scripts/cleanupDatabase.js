const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function cleanupDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('📁 Available Collections:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        for (let i = 0; i < collections.length; i++) {
            const collection = collections[i];
            const count = await db.collection(collection.name).countDocuments();
            const stats = await db.collection(collection.name).stats();
            console.log(`${i + 1}. ${collection.name}`);
            console.log(`   - Documents: ${count.toLocaleString()}`);
            console.log(`   - Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
        }

        console.log('\n🗑️  Cleanup Options:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Delete specific collection');
        console.log('2. Delete old audit logs (older than 30 days)');
        console.log('3. Delete test/demo data');
        console.log('4. Clear all data (keep structure)');
        console.log('5. Exit');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const choice = await question('Choose an option (1-5): ');

        switch (choice.trim()) {
            case '1':
                const collName = await question('Enter collection name to delete: ');
                const confirm1 = await question(`⚠️  Delete "${collName}"? (yes/no): `);
                if (confirm1.toLowerCase() === 'yes') {
                    await db.collection(collName).drop();
                    console.log(`✅ Deleted collection: ${collName}`);
                }
                break;

            case '2':
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                if (collections.find(c => c.name === 'auditlogs')) {
                    const result = await db.collection('auditlogs').deleteMany({
                        createdAt: { $lt: thirtyDaysAgo }
                    });
                    console.log(`✅ Deleted ${result.deletedCount} old audit logs`);
                } else {
                    console.log('ℹ️  No auditlogs collection found');
                }
                break;

            case '3':
                console.log('\n🔍 Looking for test data...');
                // Delete users with test emails
                if (collections.find(c => c.name === 'users')) {
                    const testUsers = await db.collection('users').deleteMany({
                        email: { $regex: /test|demo|example/i }
                    });
                    console.log(`✅ Deleted ${testUsers.deletedCount} test users`);
                }

                // Delete products with test names
                if (collections.find(c => c.name === 'products')) {
                    const testProducts = await db.collection('products').deleteMany({
                        name: { $regex: /test|demo|sample/i }
                    });
                    console.log(`✅ Deleted ${testProducts.deletedCount} test products`);
                }
                break;

            case '4':
                const confirm4 = await question('⚠️  Clear ALL data? This cannot be undone! (yes/no): ');
                if (confirm4.toLowerCase() === 'yes') {
                    for (const collection of collections) {
                        await db.collection(collection.name).deleteMany({});
                        console.log(`✅ Cleared: ${collection.name}`);
                    }
                    console.log('\n✅ All data cleared!');
                }
                break;

            case '5':
                console.log('👋 Exiting...');
                break;

            default:
                console.log('❌ Invalid option');
        }

        // Show new stats
        console.log('\n📊 Updated Database Size:');
        const stats = await db.stats();
        console.log(`Storage: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Usage: ${(((stats.storageSize + stats.indexSize) / 1024 / 1024 / 512) * 100).toFixed(1)}%`);

        rl.close();
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

cleanupDatabase();
