const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');
const TokenBlacklist = require('../models/TokenBlacklist');
const PermissionService = require('../services/PermissionService');
const AuditLog = require('../models/AuditLog');

// JWT Secret (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '24h';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        permissions: user.permissions || []
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Verify JWT token middleware
 * Extracts and verifies JWT token from Authorization header
 * Attaches user data to request object
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Check if token is blacklisted
        const blacklisted = await TokenBlacklist.findOne({
            token,
            expiresAt: { $gt: new Date() }
        });

        if (blacklisted) {
            return res.status(401).json({
                success: false,
                error: 'Token has been revoked',
                code: 'TOKEN_REVOKED'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists and is active
        const user = await AuthUser.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is inactive',
                code: 'ACCOUNT_INACTIVE'
            });
        }

        // Attach user data to request
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            permissions: user.permissions || [],
            sellerId: user.sellerId
        };

        // Attach token to request for potential blacklisting
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        console.error('Token verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't require it
 * Useful for endpoints that work for both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue as guest
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await AuthUser.findById(decoded.userId);

        if (user && user.isActive) {
            req.user = {
                userId: user._id.toString(),
                email: user.email,
                username: user.username,
                role: user.role,
                permissions: user.permissions || [],
                sellerId: user.sellerId
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // Token invalid, continue as guest
        req.user = null;
        next();
    }
};

/**
 * Require specific permission middleware factory
 * @param {String} permission - Required permission
 * @returns {Function} Middleware function
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Check permission
            const hasPermission = await PermissionService.checkPermission(
                req.user.userId,
                permission
            );

            if (!hasPermission) {
                // Log permission denial
                await AuditLog.create({
                    userId: req.user.userId,
                    username: req.user.username,
                    action: 'permission_denied',
                    resource: permission.split('.')[0],
                    result: 'denied',
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    details: {
                        requiredPermission: permission,
                        userRole: req.user.role,
                        endpoint: req.originalUrl,
                        method: req.method
                    }
                });

                return res.status(403).json({
                    success: false,
                    error: 'Permission denied',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    requiredPermission: permission,
                    userRole: req.user.role
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authorization error',
                code: 'AUTH_ERROR'
            });
        }
    };
};

/**
 * Require specific role middleware factory
 * @param {String|Array<String>} roles - Required role(s)
 * @returns {Function} Middleware function
 */
const requireRole = (roles) => {
    // Convert single role to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Check if user has any of the required roles
            if (!requiredRoles.includes(req.user.role)) {
                // Log permission denial
                await AuditLog.create({
                    userId: req.user.userId,
                    username: req.user.username,
                    action: 'permission_denied',
                    resource: 'role_check',
                    result: 'denied',
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    details: {
                        requiredRoles,
                        userRole: req.user.role,
                        endpoint: req.originalUrl,
                        method: req.method
                    }
                });

                return res.status(403).json({
                    success: false,
                    error: 'Insufficient role',
                    code: 'INSUFFICIENT_ROLE',
                    requiredRoles,
                    userRole: req.user.role
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({
                success: false,
                error: 'Authorization error',
                code: 'AUTH_ERROR'
            });
        }
    };
};

/**
 * Require admin role middleware
 */
const requireAdmin = requireRole('admin');

/**
 * Require seller role middleware
 */
const requireSeller = requireRole('seller');

/**
 * Require customer role middleware
 */
const requireCustomer = requireRole('customer');

module.exports = {
    generateToken,
    verifyToken,
    optionalAuth,
    requirePermission,
    requireRole,
    requireAdmin,
    requireSeller,
    requireCustomer,
    JWT_SECRET,
    JWT_EXPIRATION
};
