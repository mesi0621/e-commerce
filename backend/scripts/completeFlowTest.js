require('dotenv').config();
const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

async function completeFlowTest() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Check products
        const products = await Product.find({ isApproved: true }).limit(5);
        console.log(`✅ Found ${products.length} approved products`);
        products.forEach(p => {
            console.log(`  - ${p.name} (ID: ${p.id}) - Stock: ${p.stock} - Price: $${p.new_price}`);
        });

        // 2. Check test user
        const user = await AuthUser.findOne({ email: 'mezgebemessi@gmail.com' });
        if (!user) {
            console.log('❌ Test user not found');
            return;
        }
        console.log('✅ Found test user:', user.email, 'ID:', user._id);

        // 3. Test cart operations
        console.log('\n🛒 Testing Cart Operations:');

        // Clear cart
        await Cart.deleteOne({ userId: user._id });
        console.log('  - Cleared existing cart');

        // Add items to cart
        let cart = new Cart({ userId: user._id, items: [] });
        await cart.addItem(products[0].id, products[0].new_price, 2);
        await cart.addItem(products[1].id, products[1].new_price, 1);
        console.log('  - Added 2 different products to cart');

        // Fetch cart
        cart = await Cart.findOne({ userId: user._id });
        console.log(`  - Cart has ${cart.items.length} different items`);

        let totalQuantity = 0;
        let totalValue = 0;
        cart.items.forEach(item => {
            totalQuantity += item.quantity;
            totalValue += item.price * item.quantity;
            console.log(`    * Product ${item.productId}: ${item.quantity}x at $${item.price} = $${item.price * item.quantity}`);
        });
        console.log(`  - Total quantity: ${totalQuantity}, Total value: $${totalValue}`);

        // 4. Test order creation (without payment)
        console.log('\n📦 Testing Order Creation:');

        const orderData = {
            userId: user._id,
            items: cart.items,
            shippingAddress: {
                fullName: 'Test User',
                phone: '+251912345678',
                address: '123 Test Street',
                city: 'Addis Ababa',
                region: 'Addis Ababa',
                postalCode: '1000'
            },
            paymentMethod: 'cash_on_delivery',
            subtotal: totalValue,
            tax: totalValue * 0.15,
            shippingFee: totalValue > 1000 ? 0 : 50,
            total: totalValue + (totalValue * 0.15) + (totalValue > 1000 ? 0 : 50),
            orderStatus: 'pending',
            paymentStatus: 'pending'
        };

        // Generate order number
        const orderCount = await Order.countDocuments();
        orderData.orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(5, '0')}`;

        const order = new Order(orderData);
        await order.save();
        console.log(`  - Order created: ${order.orderNumber}`);
        console.log(`  - Order total: $${order.total}`);
        console.log(`  - Payment method: ${order.paymentMethod}`);

        console.log('\n🎉 Complete flow test successful!');
        console.log('\n📋 Summary:');
        console.log(`  - Products available: ${products.length}`);
        console.log(`  - Cart items: ${cart.items.length}`);
        console.log(`  - Order created: ${order.orderNumber}`);
        console.log(`  - Total amount: $${order.total}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

completeFlowTest();