const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function addTimestamp() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Add timestamp to force cache refresh
        const timestamp = Date.now();

        const updates = [
            {
                id: 1,
                name: 'Classic White T-Shirt',
                image: `https://picsum.photos/seed/tshirt${timestamp}1/300/400`
            },
            {
                id: 2,
                name: 'Blue Denim Jeans',
                image: `https://picsum.photos/seed/jeans${timestamp}2/300/400`
            },
            {
                id: 3,
                name: 'Summer Floral Dress',
                image: `https://picsum.photos/seed/dress${timestamp}3/300/400`
            },
            {
                id: 4,
                name: 'Elegant Black Heels',
                image: `https://picsum.photos/seed/heels${timestamp}4/300/400`
            },
            {
                id: 5,
                name: 'Kids Colorful Sneakers',
                image: `https://picsum.photos/seed/sneakers${timestamp}5/300/400`
            },
            {
                id: 6,
                name: 'Kids Cartoon T-Shirt',
                image: `https://picsum.photos/seed/kidstshirt${timestamp}6/300/400`
            },
            {
                id: 7,
                name: 'Leather Jacket',
                image: `https://picsum.photos/seed/jacket${timestamp}7/300/400`
            },
            {
                id: 8,
                name: 'Casual Handbag',
                image: `https://picsum.photos/seed/handbag${timestamp}8/300/400`
            }
        ];

        console.log('Updating with cache-busting timestamps...\n');

        for (const update of updates) {
            await Product.updateOne(
                { id: update.id },
                { image: update.image }
            );
            console.log(`✅ ${update.name}`);
        }

        console.log('\n🎉 Done! Images updated with unique URLs');
        console.log('\n📱 Now refresh your website (may need to wait 30 seconds for changes to propagate)');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

addTimestamp();
