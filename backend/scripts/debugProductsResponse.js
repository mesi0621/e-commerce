const { default: fetch } = await import('node-fetch');

async function debugProductsResponse() {
    try {
        console.log('🔍 DEBUGGING PRODUCTS API RESPONSE\n');

        const baseURL = 'http://localhost:5000';
        const response = await fetch(`${baseURL}/api/products`);
        const data = await response.json();

        console.log('✅ Status:', response.status);
        console.log('✅ Response keys:', Object.keys(data));
        console.log('✅ Success:', data.success);
        console.log('✅ Data type:', typeof data.data);
        console.log('✅ Data is array:', Array.isArray(data.data));

        if (data.data) {
            console.log('✅ Data keys (first 10):', Object.keys(data.data).slice(0, 10));
            console.log('✅ Data length/size:', Array.isArray(data.data) ? data.data.length : Object.keys(data.data).length);

            // Check if it's an object with numeric keys (which should be an array)
            const keys = Object.keys(data.data);
            const isNumericKeys = keys.every(key => !isNaN(key));
            console.log('✅ Has numeric keys:', isNumericKeys);

            if (isNumericKeys && !Array.isArray(data.data)) {
                console.log('🔧 Converting object to array...');
                const arrayData = Object.values(data.data);
                console.log('✅ Converted array length:', arrayData.length);
                console.log('✅ First item:', arrayData[0]?.name);
            }
        }

        console.log('\n📋 Full response structure:');
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugProductsResponse();