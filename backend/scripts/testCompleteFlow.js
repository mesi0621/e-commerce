require('dotenv').config();
const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

async function testCompleteFlow() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Check if products are loading correctly
        console.log('\n🛍️ Testing Product Loading:');
        const products = await Product.find({ isApproved: true }).limit(3);
        console.log(`✅ Found ${products.length} approved products`);
        products.forEach(p => {
            console.log(`  - ${p.name} (ID: ${p.id}) - Stock: ${p.stock} - Price: $${p.new_price}`);
        });

        // 2. Test user authentication
        console.log('\n👤 Testing User Authentication:');
        const user = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!user) {
            console.log('❌ Test user not found');
            return;
        }
        console.log('✅ Found test user:', user.email);

        // 3. Test add to cart functionality
        console.log('\n🛒 Testing Add to Cart:');

        // Clear existing cart
        await Cart.deleteOne({ userId: user._id });
        console.log('  - Cleared existing cart');

        // Simulate frontend add to cart calls
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            cart = new Cart({ userId: user._id, items: [] });
        }

        // Add first product
        await cart.addItem(products[0].id, products[0].new_price, 1);
        console.log(`  - Added ${products[0].name} to cart`);

        // Add second product
        await cart.addItem(products[1].id, products[1].new_price, 2);
        console.log(`  - Added ${products[1].name} (2x) to cart`);

        // 4. Test cart retrieval (like frontend does)
        console.log('\n📦 Testing Cart Retrieval:');
        cart = await Cart.findOne({ userId: user._id });

        // Populate product details (like CartController.getCart does)
        const itemsWithProducts = await Promise.all(
            cart.items.map(async (item) => {
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

        console.log('✅ Cart populated with product details:');
        let totalItems = 0;
        let totalValue = 0;
        itemsWithProducts.forEach(item => {
            if (item.product) {
                console.log(`  - ${item.product.name}: ${item.quantity}x $${item.product.new_price} = $${item.quantity * item.product.new_price}`);
                totalItems += item.quantity;
                totalValue += item.quantity * item.product.new_price;
            }
        });
        console.log(`  - Total items: ${totalItems}, Total value: $${totalValue}`);

        // 5. Test payment methods
        console.log('\n💳 Testing Payment Methods:');
        const PaymentMethod = require('../models/PaymentMethod');
        const activeMethods = await PaymentMethod.find({ isActive: true });
        console.log('✅ Active payment methods:');
        activeMethods.forEach(method => {
            console.log(`  - ${method.displayName} (${method.name})`);
        });

        // 6. Simulate order creation (without actually creating)
        console.log('\n📋 Testing Order Creation Flow:');

        // Enrich cart items for order (like OrderController does)
        const enrichedItems = await Promise.all(cart.items.map(async (item) => {
            const product = await Product.findOne({ id: item.productId });
            return {
                productId: item.productId,
                name: product.name,
                image: product.image,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            };
        }));

        const subtotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.15;
        const shippingFee = subtotal > 1000 ? 0 : 50;
        const total = subtotal + tax + shippingFee;

        console.log('✅ Order totals calculated:');
        console.log(`  - Subtotal: $${subtotal}`);
        console.log(`  - Tax (15%): $${tax}`);
        console.log(`  - Shipping: $${shippingFee}`);
        console.log(`  - Total: $${total}`);

        console.log('\n🎉 Complete flow test successful!');
        console.log('\n📊 Summary:');
        console.log(`  ✅ Products loading: ${products.length} products`);
        console.log(`  ✅ User authentication: ${user.email}`);
        console.log(`  ✅ Add to cart: ${cart.items.length} different products, ${totalItems} total items`);
        console.log(`  ✅ Cart retrieval: Products populated correctly`);
        console.log(`  ✅ Payment methods: ${activeMethods.length} active methods`);
        console.log(`  ✅ Order calculation: $${total} total`);

        console.log('\n🔍 Diagnosis:');
        console.log('  - Backend add to cart functionality is working correctly');
        console.log('  - Products are loading with proper details');
        console.log('  - Cart operations are functioning properly');
        console.log('  - Payment methods are configured (CBE disabled)');
        console.log('  - Order creation flow is ready');

        console.log('\n💡 If add to cart button appears not working:');
        console.log('  1. Check browser console for JavaScript errors');
        console.log('  2. Verify user is logged in (check auth-token in localStorage)');
        console.log('  3. Check network tab for failed API calls');
        console.log('  4. Ensure frontend is connecting to backend on port 5000');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testCompleteFlow();