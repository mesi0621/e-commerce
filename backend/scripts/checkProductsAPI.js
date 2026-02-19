const { default: fetch } = await import('node-fetch');

async function checkProductsAPI() {
    try {
        console.log('🧪 CHECKING PRODUCTS API\n');

        const baseURL = 'http://localhost:5000';
        const response = await fetch(`${baseURL}/api/products`);
        const data = await response.json();

        console.log('✅ Products API Status:', response.status);
        console.log('✅ Raw Response Structure:');
        console.log('   - success:', data.success);
        console.log('   - data type:', typeof data.data);
        console.log('   - data keys:', data.data ? Object.keys(data.data) : 'null');

        if (data.data && data.data.data) {
            console.log(`   - products count: ${data.data.data.length}`);
            console.log(`   - first product:`, data.data.data[0]);
        } else if (Array.isArray(data.data)) {
            console.log(`   - products count: ${data.data.length}`);
            console.log(`   - first product:`, data.data[0]);
        } else {
            console.log('   - data structure:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkProductsAPI();