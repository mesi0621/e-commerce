const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Load environment variables
dotenv.config();

// Product data from frontend
const products = [
    {
        id: 1,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_1.png",
        new_price: 50.0,
        old_price: 80.5,
    },
    {
        id: 2,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_2.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 3,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_3.png",
        new_price: 60.0,
        old_price: 100.5,
    },
    {
        id: 4,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_4.png",
        new_price: 100.0,
        old_price: 150.0,
    },
    {
        id: 5,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_5.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 6,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_6.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 7,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_7.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 8,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_8.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 9,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_9.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 10,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_10.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 11,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_11.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 12,
        name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
        category: "women",
        image: "product_12.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 13,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_13.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 14,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_14.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 15,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_15.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 16,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_16.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 17,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_17.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 18,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_18.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 19,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_19.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 20,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_20.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 21,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_21.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 22,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_22.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 23,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_23.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 24,
        name: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
        category: "men",
        image: "product_24.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 25,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_25.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 26,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_26.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 27,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_27.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 28,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_28.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 29,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_29.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 30,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_30.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 31,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_31.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 32,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_32.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 33,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_33.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 34,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_34.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 35,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_35.png",
        new_price: 85.0,
        old_price: 120.5,
    },
    {
        id: 36,
        name: "Boys Orange Colourblocked Hooded Sweatshirt",
        category: "kid",
        image: "product_36.png",
        new_price: 85.0,
        old_price: 120.5,
    },
];

// Enhance products with additional fields
const enhancedProducts = products.map(product => ({
    ...product,
    description: `High quality ${product.category}'s clothing. ${product.name}`,
    costPrice: product.new_price * 0.6, // 40% markup
    stock: Math.floor(Math.random() * 100) + 50, // Random stock between 50-150
    rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
    reviewCount: Math.floor(Math.random() * 50), // Random review count 0-50
    popularity: Math.floor(Math.random() * 1000) + 100, // Random popularity 100-1100
    tags: [product.category, product.name.split(' ')[0].toLowerCase()],
    isApproved: true, // Auto-approve seeded products
    sellerId: null // No seller for seeded products (platform products)
}));

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        await Product.insertMany(enhancedProducts);
        console.log(`Inserted ${enhancedProducts.length} products`);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
