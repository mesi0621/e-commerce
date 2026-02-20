const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function updateWithRealImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Using completely different image URLs from different sources
        const updates = [
            {
                id: 1,
                name: 'Classic White T-Shirt',
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop'
            },
            {
                id: 2,
                name: 'Blue Denim Jeans',
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop'
            },
            {
                id: 3,
                name: 'Summer Floral Dress',
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop'
            },
            {
                id: 4,
                name: 'Elegant Black Heels',
                image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop'
            },
            {
                id: 5,
                name: 'Kids Colorful Sneakers',
                image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=300&h=400&fit=crop'
            },
            {
                id: 6,
                name: 'Kids Cartoon T-Shirt',
                image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&h=400&fit=crop'
            },
            {
                id: 7,
                name: 'Leather Jacket',
                image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop'
            },
            {
                id: 8,
                name: 'Casual Handbag',
                image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=400&fit=crop'
            }
        ];

        console.log('Updating with REAL product images from Unsplash...\n');

        for (const update of updates) {
            await Product.updateOne(
                { id: update.id },
                { image: update.image }
            );
            console.log(`✅ ${update.name}`);
            console.log(`   ${update.image}\n`);
        }

        console.log('🎉 All products now have REAL, DIFFERENT images!');
        console.log('\n📱 Refresh your website now: https://modooo-e-commerce.vercel.app');
        console.log('   Do a hard refresh: Ctrl+Shift+R');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateWithRealImages();
