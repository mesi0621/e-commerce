const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login attempts
 * Limit: 20 requests per 15 minutes per IP (increased for testing)
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs (increased from 5)
    message: {
        success: false,
        error: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
});

/**
 * Rate limiter for signup attempts
 * Limit: 3 requests per hour per IP
 */
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        error: 'Too many accounts created. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for password reset requests
 * Limit: 3 requests per hour per IP
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        error: 'Too many password reset attempts. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * Limit: 100 requests per minute per IP
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for certain routes if needed
        return false;
    }
});

/**
 * Strict rate limiter for sensitive operations
 * Limit: 10 requests per minute per IP
 */
const strictLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests for this operation. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    signupLimiter,
    passwordResetLimiter,
    apiLimiter,
    strictLimiter
};
