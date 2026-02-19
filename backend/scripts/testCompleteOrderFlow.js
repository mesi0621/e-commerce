require('dotenv').config({ path: './.env' });
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteOrderFlow() {
    try {
        console.log('🧪 Testing complete order flow with email notifications...');

        // Step 1: Login as customer
        console.log('\n1️⃣ Logging in as customer...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'bitaaaa2004@gmail.com',
            password: 'admin123'
        });

        const customerToken = loginResponse.data.token;
        const userId = loginResponse.data.data.id; // Get user ID from login response
        console.log('✅ Customer logged in successfully, User ID:', userId);

        // Step 2: Get product details first
        console.log('\n2️⃣ Getting product details...');
        const productResponse = await axios.get(`${BASE_URL}/products/24`);
        const product = productResponse.data.data;
        console.log('✅ Product found:', product.name, 'Price:', product.new_price);

        // Step 3: Add item to cart
        console.log('\n3️⃣ Adding item to cart...');
        await axios.post(`${BASE_URL}/cart/${userId}/items`, {
            productId: 24,
            quantity: 1,
            price: product.new_price
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        console.log('✅ Item added to cart');

        // Step 4: Create order
        console.log('\n3️⃣ Creating order...');
        const orderResponse = await axios.post(`${BASE_URL}/orders`, {
            shippingAddress: {
                fullName: 'Test Customer',
                address: '123 Test Street',
                city: 'Addis Ababa',
                region: 'Addis Ababa',
                phone: '+251912345678'
            },
            paymentMethod: 'cash_on_delivery',
            notes: 'Test order for email notifications'
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });

        const order = orderResponse.data.data;
        console.log('✅ Order created:', order.orderNumber);

        // Step 4: Process payment (Cash on Delivery)
        console.log('\n5️⃣ Processing payment...');
        const paymentResponse = await axios.post(`${BASE_URL}/payments/process`, {
            orderId: order._id,
            paymentMethod: 'cash_on_delivery',
            amount: order.total
        }, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });

        console.log('✅ Payment processed successfully');
        console.log('📧 Email notifications should have been sent to:');
        console.log('   - Customer: mezgebemessi@gmail.com (Order confirmation)');
        console.log('   - Admin: bitaaaa2004@gmail.com (New order notification)');
        console.log('   - Seller: meseretmezgebe338@gmail.com (New sale notification)');

        console.log('\n🎉 Complete order flow test completed successfully!');
        console.log('💡 Check the email addresses above for real email notifications!');

    } catch (error) {
        console.error('❌ Error in order flow test:', error.response?.data || error.message);
    }
}

testCompleteOrderFlow();