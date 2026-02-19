const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login with admin credentials...\n');

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@ecommerce.com',
            password: 'admin123'
        });

        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\nToken:', response.data.token);

    } catch (error) {
        console.error('❌ Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
