require('dotenv').config();
const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

async function testAddToCartFlow() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find test user
        const user = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!user) {
            console.log('❌ Test user not found');
            return;
        }
        console.log('✅ Found test user:', user.email);

        // Find a test product
        const product = await Product.findOne({ isApproved: true });
        if (!product) {
            console.log('❌ No approved products found');
            return;
        }
        console.log('✅ Found test product:', product.name, 'ID:', product.id);

        // Clear existing cart
        await Cart.deleteOne({ userId: user._id });
        console.log('🧹 Cleared existing cart');

        // Create new cart and add item
        let cart = new Cart({ userId: user._id, items: [] });
        await cart.addItem(product.id, product.new_price, 1);
        console.log('✅ Added item to cart');

        // Fetch cart with populated products
        cart = await Cart.findOne({ userId: user._id });
        console.log('📦 Cart items:', cart.items.length);

        // Test the same flow as the API
        const itemsWithProducts = await Promise.all(
            cart.items.map(async (item) => {
                const prod = await Product.findOne({ id: item.productId });
                return {
                    ...item.toObject(),
                    product: prod ? {
                        id: prod.id,
                        name: prod.name,
                        image: prod.image,
                        new_price: prod.new_price,
                        old_price: prod.old_price,
                        category: prod.category,
                        available: prod.stock > 0
                    } : null
                };
            })
        );

        console.log('✅ Cart with populated products:');
        itemsWithProducts.forEach(item => {
            if (item.product) {
                console.log(`  - ${item.product.name} (${item.quantity}x) - $${item.product.new_price}`);
            }
        });

        console.log('\n🎉 Add to cart flow working correctly!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAddToCartFlow();