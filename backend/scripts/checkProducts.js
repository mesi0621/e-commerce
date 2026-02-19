const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({ isApproved: true });

        console.log(`\n📦 Total Products Found: ${products.length}`);

        const byCategory = {
            women: products.filter(p => p.category === 'women').length,
            men: products.filter(p => p.category === 'men').length,
            kid: products.filter(p => p.category === 'kid').length
        };

        console.log('\n📊 Products by Category:');
        console.log(`   👗 Women: ${byCategory.women}`);
        console.log(`   👔 Men: ${byCategory.men}`);
        console.log(`   👶 Kids: ${byCategory.kid}`);

        console.log('\n✅ Sample Products:');
        products.slice(0, 5).forEach(p => {
            console.log(`   ${p.id}. ${p.name.substring(0, 40)}... - $${p.new_price} (${p.category})`);
        });

        console.log('\n✅ All products are available and ready!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkProducts();
