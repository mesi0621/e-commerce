// This script will help debug what's being sent in payment requests
// We'll add temporary logging to see the actual requests

const express = require('express');
const app = express();

app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
    if (req.path.includes('/payments/') || req.path.includes('/orders')) {
        console.log('\n🔍 REQUEST DEBUG:');
        console.log('Method:', req.method);
        console.log('Path:', req.path);
        console.log('Headers:', req.headers);
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('Query:', req.query);
        console.log('-------------------\n');
    }
    next();
});

// Test endpoint
app.post('/test-payment', (req, res) => {
    console.log('🧪 Test payment request received:');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Test successful' });
});

app.listen(3001, () => {
    console.log('🔍 Debug server running on port 3001');
    console.log('This will help us see what requests are being made');
});

console.log('To test, make a request to http://localhost:3001/test-payment');
console.log('Or modify the frontend to temporarily use port 3001 for debugging');