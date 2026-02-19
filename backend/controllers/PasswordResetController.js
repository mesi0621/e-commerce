const PasswordResetService = require('../services/PasswordResetService');

class PasswordResetController {
    /**
     * Request password reset
     * POST /api/auth/forgot-password
     * Public endpoint
     */
    async requestReset(req, res) {
        try {
            const { email } = req.body;

            // Validate email
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is required'
                });
            }

            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide a valid email address'
                });
            }

            // Get client info for security logging
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('user-agent');

            // Create reset request
            const result = await PasswordResetService.createResetRequest(
                email,
                ipAddress,
                userAgent
            );

            // Always return success message for security (don't reveal if email exists)
            res.status(200).json({
                success: true,
                message: result.message,
                // Include additional data in development
                ...(process.env.NODE_ENV === 'development' && result.token && {
                    dev: {
                        token: result.token,
                        resetUrl: result.resetUrl
                    }
                })
            });

        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                success: false,
                error: 'An error occurred while processing your request. Please try again later.'
            });
        }
    }

    /**
     * Verify reset token
     * GET /api/auth/verify-reset-token/:token
     * Public endpoint
     */
    async verifyToken(req, res) {
        try {
            const { token } = req.params;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Reset token is required'
                });
            }

            const result = await PasswordResetService.verifyResetToken(token);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json({
                success: true,
                message: 'Token is valid',
                data: {
                    email: result.data.email,
                    username: result.data.username
                }
            });

        } catch (error) {
            console.error('Token verification error:', error);
            res.status(500).json({
                success: false,
                error: 'An error occurred while verifying the token'
            });
        }
    }

    /**
     * Reset password
     * POST /api/auth/reset-password
     * Public endpoint
     */
    async resetPassword(req, res) {
        try {
            const { token, password, confirmPassword } = req.body;

            // Validate input
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Reset token is required'
                });
            }

            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'New password is required'
                });
            }

            if (!confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Password confirmation is required'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Passwords do not match'
                });
            }

            // Password strength validation
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must be at least 6 characters long'
                });
            }

            // Additional password strength checks
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                });
            }

            // Get client info for security logging
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('user-agent');

            // Reset password
            const result = await PasswordResetService.resetPassword(
                token,
                password,
                ipAddress,
                userAgent
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({
                success: false,
                error: 'An error occurred while resetting your password. Please try again later.'
            });
        }
    }

    /**
     * Get password reset statistics (Admin only)
     * GET /api/admin/password-reset-stats
     * Requires admin role
     */
    async getResetStatistics(req, res) {
        try {
            const stats = await PasswordResetService.getResetStatistics();

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Get reset statistics error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching password reset statistics'
            });
        }
    }
}

module.exports = new PasswordResetController();