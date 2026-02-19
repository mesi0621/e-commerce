const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const products = [
    {
        id: 1,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_1.png",
        new_price: 50.0,
        old_price: 80.5,
        description: "Elegant striped blouse with flutter sleeves",
        stock: 50,
        isApproved: true
    },
    {
        id: 2,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_2.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Stylish women's blouse with peplum hem",
        stock: 50,
        isApproved: true
    },
    {
        id: 3,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_3.png",
        new_price: 60.0,
        old_price: 100.5,
        description: "Comfortable and fashionable blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 4,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_4.png",
        new_price: 100.0,
        old_price: 150.0,
        description: "Premium quality women's blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 5,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_5.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Trendy overlap collar blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 6,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_6.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Classic striped design blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 7,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_7.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Elegant flutter sleeve blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 8,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_8.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Modern peplum hem blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 9,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_9.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Chic women's fashion blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 10,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_10.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Sophisticated overlap collar blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 11,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_11.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Versatile striped blouse",
        stock: 50,
        isApproved: true
    },
    {
        id: 12,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_12.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Stylish flutter sleeve design",
        stock: 50,
        isApproved: true
    },
    {
        id: 13,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_13.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Trendy men's bomber jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 14,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_14.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Slim fit bomber jacket for men",
        stock: 50,
        isApproved: true
    },
    {
        id: 15,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_15.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Classic zippered bomber jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 16,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_16.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Stylish men's outerwear",
        stock: 50,
        isApproved: true
    },
    {
        id: 17,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_17.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Modern bomber jacket design",
        stock: 50,
        isApproved: true
    },
    {
        id: 18,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_18.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Comfortable slim fit jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 19,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_19.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Premium quality bomber jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 20,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_20.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Versatile men's jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 21,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_21.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Fashionable bomber jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 22,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_22.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Durable men's outerwear",
        stock: 50,
        isApproved: true
    },
    {
        id: 23,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_23.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Elegant bomber jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 24,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_24.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Contemporary men's jacket",
        stock: 50,
        isApproved: true
    },
    {
        id: 25,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_25.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Comfortable kids' sweatshirt",
        stock: 50,
        isApproved: true
    },
    {
        id: 26,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_26.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Colorful hooded sweatshirt for boys",
        stock: 50,
        isApproved: true
    },
    {
        id: 27,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_27.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Trendy kids' fashion",
        stock: 50,
        isApproved: true
    },
    {
        id: 28,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_28.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Stylish colourblocked design",
        stock: 50,
        isApproved: true
    },
    {
        id: 29,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_29.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Cozy hooded sweatshirt",
        stock: 50,
        isApproved: true
    },
    {
        id: 30,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_30.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Fun and comfortable kids' wear",
        stock: 50,
        isApproved: true
    },
    {
        id: 31,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_31.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Vibrant orange sweatshirt",
        stock: 50,
        isApproved: true
    },
    {
        id: 32,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_32.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Quality kids' clothing",
        stock: 50,
        isApproved: true
    },
    {
        id: 33,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_33.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Playful hooded design",
        stock: 50,
        isApproved: true
    },
    {
        id: 34,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_34.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Durable kids' sweatshirt",
        stock: 50,
        isApproved: true
    },
    {
        id: 35,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_35.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Modern kids' fashion",
        stock: 50,
        isApproved: true
    },
    {
        id: 36,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_36.png",
        new_price: 85.0,
        old_price: 120.5,
        description: "Comfortable and stylish",
        stock: 50,
        isApproved: true
    }
];

async function seedProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        const deleteResult = await Product.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`);

        // Insert all products
        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ Successfully seeded ${insertedProducts.length} products`);

        // Show summary by category
        const womenCount = products.filter(p => p.category === 'women').length;
        const menCount = products.filter(p => p.category === 'men').length;
        const kidCount = products.filter(p => p.category === 'kid').length;

        console.log('\n📊 Products by Category:');
        console.log(`   👗 Women: ${womenCount} products`);
        console.log(`   👔 Men: ${menCount} products`);
        console.log(`   👶 Kids: ${kidCount} products`);
        console.log(`   📦 Total: ${products.length} products`);

        console.log('\n✅ All products are now available in the database!');
        console.log('   - All products are approved and ready to display');
        console.log('   - Each product has 50 items in stock');
        console.log('   - Products are categorized: women, men, kid');

    } catch (error) {
        console.error('❌ Error seeding products:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

seedProducts();
