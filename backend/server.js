const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const RoleInitService = require('./services/RoleInitService');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://modo-ecommerce.vercel.app']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general API rate limiting to all routes
app.use('/api/', apiLimiter);

// Connect to MongoDB and initialize roles
connectDB().then(async () => {
    // Initialize system roles on startup
    await RoleInitService.initializeRoles();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'E-Commerce API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            reviews: '/api/reviews',
            interactions: '/api/interactions',
            inventory: '/api/inventory'
        }
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/cart-validation', require('./routes/cartValidation'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/support', require('./routes/support'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/payments/bank-transfer', require('./routes/bankTransfer'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin/analytics', require('./routes/analytics'));
app.use('/api/refunds', require('./routes/refunds'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/debug', require('./routes/debug')); // Temporarily disabled

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start server (only in development, Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
