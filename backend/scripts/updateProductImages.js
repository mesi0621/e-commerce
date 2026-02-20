const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function updateImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Better placeholder images with different colors
        const updates = [
            { id: 1, image: 'https://via.placeholder.com/300x400/FFFFFF/000000?text=White+T-Shirt' },
            { id: 2, image: 'https://via.placeholder.com/300x400/1E3A8A/FFFFFF?text=Denim+Jeans' },
            { id: 3, image: 'https://via.placeholder.com/300x400/FCA5A5/000000?text=Floral+Dress' },
            { id: 4, image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Black+Heels' },
            { id: 5, image: 'https://via.placeholder.com/300x400/FCD34D/000000?text=Kids+Sneakers' },
            { id: 6, image: 'https://via.placeholder.com/300x400/A78BFA/FFFFFF?text=Kids+T-Shirt' },
            { id: 7, image: 'https://via.placeholder.com/300x400/78350F/FFFFFF?text=Leather+Jacket' },
            { id: 8, image: 'https://via.placeholder.com/300x400/EC4899/FFFFFF?text=Handbag' }
        ];

        for (const update of updates) {
            await Product.updateOne({ id: update.id }, { image: update.image });
            console.log(`✅ Updated product ${update.id}`);
        }

        console.log('\n🎉 All product images updated!');
        console.log('Refresh your website to see the changes.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateImages();
