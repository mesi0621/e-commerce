const AuthUser = require('../models/AuthUser');
const TokenBlacklist = require('../models/TokenBlacklist');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const AuditService = require('../services/AuditService');
const RoleService = require('../services/RoleService');
const EmailService = require('../services/EmailService');
const jwt = require('jsonwebtoken');

class AuthController {
    /**
     * Register a new user
     * POST /api/auth/signup
     */
    async signup(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validation
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide username, email, and password'
                });
            }

            // Check if user already exists
            const existingUser = await AuthUser.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email already registered'
                    });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username already taken'
                    });
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Get default customer role permissions
            const customerPermissions = await RoleService.getRolePermissions('customer');

            // Create new user with customer role by default
            const newUser = new AuthUser({
                username,
                email,
                password: hashedPassword,
                role: 'customer',
                permissions: customerPermissions,
                isActive: true
            });

            await newUser.save();

            // Generate JWT token
            const token = generateToken(newUser);

            // Log successful registration
            await AuditService.logAuthentication(
                newUser._id.toString(),
                newUser.username,
                'success',
                req,
                { action: 'signup' }
            );

            // Send welcome email (async, don't wait)
            EmailService.sendWelcomeEmail(newUser.email, newUser.username)
                .catch(err => console.error('Error sending welcome email:', err));

            // Return user data with token
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    permissions: newUser.permissions,
                    createdAt: newUser.createdAt
                },
                token
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({
                success: false,
                error: 'Error creating user',
                message: error.message
            });
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide email and password'
                });
            }

            // Find user
            const user = await AuthUser.findOne({ email });

            if (!user) {
                // Log failed login attempt
                await AuditService.logAuthentication(
                    null,
                    email,
                    'error',
                    req,
                    { reason: 'User not found' }
                );

                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Check if account is active
            if (!user.isActive) {
                await AuditService.logAuthentication(
                    user._id.toString(),
                    user.username,
                    'error',
                    req,
                    { reason: 'Account inactive' }
                );

                return res.status(401).json({
                    success: false,
                    error: 'Account is inactive. Please contact support.'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                // Log failed login attempt
                await AuditService.logAuthentication(
                    user._id.toString(),
                    user.username,
                    'error',
                    req,
                    { reason: 'Invalid password' }
                );

                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Update last login
            user.lastLogin = Date.now();
            await user.save();

            // Generate JWT token
            const token = generateToken(user);

            // Log successful login
            await AuditService.logAuthentication(
                user._id.toString(),
                user.username,
                'success',
                req,
                { action: 'login' }
            );

            // Return user data with token
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                    lastLogin: user.lastLogin
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Error logging in',
                message: error.message
            });
        }
    }

    /**
     * Get user profile
     * GET /api/auth/profile/:userId
     */
    async getProfile(req, res) {
        try {
            const { userId } = req.params;

            const user = await AuthUser.findById(userId).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching profile',
                message: error.message
            });
        }
    }

    /**
     * Check if email exists
     * GET /api/auth/check-email/:email
     */
    async checkEmail(req, res) {
        try {
            const { email } = req.params;

            const user = await AuthUser.findOne({ email });

            res.status(200).json({
                success: true,
                exists: !!user
            });
        } catch (error) {
            console.error('Check email error:', error);
            res.status(500).json({
                success: false,
                error: 'Error checking email',
                message: error.message
            });
        }
    }

    /**
     * Check if username exists
     * GET /api/auth/check-username/:username
     */
    async checkUsername(req, res) {
        try {
            const { username } = req.params;

            const user = await AuthUser.findOne({ username });

            res.status(200).json({
                success: true,
                exists: !!user
            });
        } catch (error) {
            console.error('Check username error:', error);
            res.status(500).json({
                success: false,
                error: 'Error checking username',
                message: error.message
            });
        }
    }

    /**
     * Logout user
     * POST /api/auth/logout
     * Requires authentication
     */
    async logout(req, res) {
        try {
            // Blacklist the current token
            const token = req.token;
            const decoded = jwt.decode(token);

            if (decoded && decoded.exp) {
                await TokenBlacklist.create({
                    token,
                    userId: req.user.userId,
                    expiresAt: new Date(decoded.exp * 1000),
                    reason: 'logout'
                });
            }

            // Log logout
            await AuditService.logLogout(
                req.user.userId,
                req.user.username,
                req
            );

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Error logging out',
                message: error.message
            });
        }
    }

    /**
     * Verify token and get current user
     * GET /api/auth/verify
     * Requires authentication
     */
    async verifyToken(req, res) {
        try {
            // Token already verified by middleware
            // Return current user data
            const user = await AuthUser.findById(req.user.userId).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error('Verify token error:', error);
            res.status(500).json({
                success: false,
                error: 'Error verifying token',
                message: error.message
            });
        }
    }

    /**
     * Update user profile
     * PUT /api/auth/profile
     * Requires authentication
     */
    async updateProfile(req, res) {
        try {
            const { username, email, phone, address } = req.body;

            const user = await AuthUser.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== user.email) {
                const existingUser = await AuthUser.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email already in use'
                    });
                }
                user.email = email;
            }

            // Check if username is being changed and if it's already taken
            if (username && username !== user.username) {
                const existingUser = await AuthUser.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username already taken'
                    });
                }
                user.username = username;
            }

            // Update other fields
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;

            await user.save();

            // Log profile update
            await AuditService.logAdminAction(
                req.user.userId,
                req.user.username,
                'profile_update',
                req,
                { updatedFields: Object.keys(req.body) }
            );

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating profile',
                message: error.message
            });
        }
    }
}

module.exports = new AuthController();

    /**
     * Refresh JWT token
     * POST /api/auth/refresh
     * Requires authentication
     */
    async refreshToken(req, res) {
    try {
        // Get current user
        const user = await AuthUser.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is inactive'
            });
        }

        // Blacklist old token
        const oldToken = req.token;
        const decoded = jwt.decode(oldToken);

        if (decoded && decoded.exp) {
            await TokenBlacklist.create({
                token: oldToken,
                userId: user._id,
                expiresAt: new Date(decoded.exp * 1000),
                reason: 'token_refresh'
            });
        }

        // Generate new token
        const newToken = generateToken(user);

        // Log token refresh
        await AuditService.logAdminAction(
            user._id.toString(),
            user.username,
            'token_refresh',
            req,
            { oldTokenExp: decoded?.exp }
        );

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: 'Error refreshing token',
            message: error.message
        });
    }
}
}

module.exports = new AuthController();
