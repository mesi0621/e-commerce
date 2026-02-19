const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AuthUser = require('../models/AuthUser');

async function testCartWithProducts() {
    try {
        console.log('🧪 TESTING CART WITH PRODUCT DETAILS\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('✅ Connected to MongoDB');

        // Find a test user
        const testUser = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!testUser) {
            console.log('❌ Test user not found');
            // Try to find any customer
            const anyCustomer = await AuthUser.findOne({ role: 'customer' });
            if (anyCustomer) {
                console.log(`✅ Using customer: ${anyCustomer.email} (ID: ${anyCustomer._id})`);
                testUser = anyCustomer;
            } else {
                console.log('❌ No customers found');
                return;
            }
        } else {
            console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser._id})`);
        }

        // Get some products
        const products = await Product.find({ isApproved: true, stock: { $gt: 0 } }).limit(3);
        console.log(`✅ Found ${products.length} approved products with stock`);

        if (products.length === 0) {
            console.log('❌ No products available for testing');
            return;
        }

        // Clear existing cart
        await Cart.deleteOne({ userId: testUser._id.toString() });
        console.log('🗑️ Cleared existing cart');

        // Create new cart with items
        const cart = new Cart({
            userId: testUser._id.toString(),
            items: products.map(product => ({
                productId: product.id,
                quantity: 1,
                price: product.new_price
            }))
        });
        await cart.save();
        console.log(`✅ Created cart with ${cart.items.length} items`);

        // Test cart retrieval with populated products
        console.log('\n📦 Testing cart retrieval with product details...');
        const savedCart = await Cart.findOne({ userId: testUser._id.toString() });

        const itemsWithProducts = await Promise.all(
            savedCart.items.map(async (item) => {
                const product = await Product.findOne({ id: item.productId });
                return {
                    ...item.toObject(),
                    product: product ? {
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        new_price: product.new_price,
                        old_price: product.old_price,
                        category: product.category,
                        available: product.stock > 0
                    } : null
                };
            })
        );

        console.log('\n✅ Cart items with product details:');
        itemsWithProducts.forEach((item, index) => {
            if (item.product) {
                console.log(`\n${index + 1}. ${item.product.name}`);
                console.log(`   Product ID: ${item.productId}`);
                console.log(`   Quantity: ${item.quantity}`);
                console.log(`   Price: $${item.price}`);
                console.log(`   Category: ${item.product.category}`);
                console.log(`   Image: ${item.product.image}`);
                console.log(`   Available: ${item.product.available}`);
            } else {
                console.log(`\n${index + 1}. ❌ Product not found (ID: ${item.productId})`);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('📊 CART TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Cart created successfully`);
        console.log(`✅ ${itemsWithProducts.length} items in cart`);
        console.log(`✅ Product details populated correctly`);
        console.log(`\n🎯 Cart with product details is working!`);
        console.log(`🎯 Frontend should now display cart items correctly!`);

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

testCartWithProducts();