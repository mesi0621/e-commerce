const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function fixImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Using picsum.photos - generates truly random images
        const updates = [
            {
                id: 1,
                name: 'Classic White T-Shirt',
                image: 'https://picsum.photos/seed/tshirt1/300/400'
            },
            {
                id: 2,
                name: 'Blue Denim Jeans',
                image: 'https://picsum.photos/seed/jeans2/300/400'
            },
            {
                id: 3,
                name: 'Summer Floral Dress',
                image: 'https://picsum.photos/seed/dress3/300/400'
            },
            {
                id: 4,
                name: 'Elegant Black Heels',
                image: 'https://picsum.photos/seed/heels4/300/400'
            },
            {
                id: 5,
                name: 'Kids Colorful Sneakers',
                image: 'https://picsum.photos/seed/sneakers5/300/400'
            },
            {
                id: 6,
                name: 'Kids Cartoon T-Shirt',
                image: 'https://picsum.photos/seed/kidstshirt6/300/400'
            },
            {
                id: 7,
                name: 'Leather Jacket',
                image: 'https://picsum.photos/seed/jacket7/300/400'
            },
            {
                id: 8,
                name: 'Casual Handbag',
                image: 'https://picsum.photos/seed/handbag8/300/400'
            }
        ];

        console.log('Updating product images with unique URLs...\n');

        for (const update of updates) {
            const result = await Product.updateOne(
                { id: update.id },
                { image: update.image }
            );
            console.log(`✅ Updated: ${update.name}`);
            console.log(`   New image: ${update.image}\n`);
        }

        console.log('🎉 All product images updated with UNIQUE images!');
        console.log('\n⚠️  IMPORTANT: Clear your browser cache or do a hard refresh (Ctrl+Shift+R)');
        console.log('   Then visit: https://modooo-e-commerce.vercel.app');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixImages();
