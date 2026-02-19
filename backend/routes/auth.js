const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const PasswordResetController = require('../controllers/PasswordResetController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { loginLimiter, signupLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/signup - Register new user (rate limited)
router.post('/signup', signupLimiter, AuthController.signup);

// POST /api/auth/login - Login user (rate limited)
router.post('/login', loginLimiter, AuthController.login);

// POST /api/auth/logout - Logout user (requires authentication)
router.post('/logout', verifyToken, AuthController.logout);

// GET /api/auth/verify - Verify token and get current user
router.get('/verify', verifyToken, AuthController.verifyToken);

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', verifyToken, AuthController.refreshToken);

// GET /api/auth/profile/:userId - Get user profile
router.get('/profile/:userId', AuthController.getProfile);

// GET /api/auth/check-email/:email - Check if email exists
router.get('/check-email/:email', AuthController.checkEmail);

// GET /api/auth/check-username/:username - Check if username exists
router.get('/check-username/:username', AuthController.checkUsername);

// PUT /api/auth/profile - Update user profile
router.put('/profile', verifyToken, AuthController.updateProfile);

// Password Reset Routes
// POST /api/auth/forgot-password - Request password reset (rate limited)
router.post('/forgot-password', passwordResetLimiter, PasswordResetController.requestReset);

// GET /api/auth/verify-reset-token/:token - Verify reset token
router.get('/verify-reset-token/:token', PasswordResetController.verifyToken);

// POST /api/auth/reset-password - Reset password with token (rate limited)
router.post('/reset-password', passwordResetLimiter, PasswordResetController.resetPassword);

// GET /api/auth/password-reset-stats - Get reset statistics (Admin only)
router.get('/password-reset-stats', verifyToken, requireAdmin, PasswordResetController.getResetStatistics);

module.exports = router;
