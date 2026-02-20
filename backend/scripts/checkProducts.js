const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const products = await Product.find({}).select('id name category image');

        console.log(`Found ${products.length} products:\n`);
        products.forEach(p => {
            console.log(`ID: ${p.id} | ${p.name} | Category: ${p.category}`);
            console.log(`   Image: ${p.image}\n`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkProducts();
