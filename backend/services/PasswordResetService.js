const crypto = require('crypto');
const bcrypt = require('bcrypt');
const PasswordReset = require('../models/PasswordReset');
const AuthUser = require('../models/AuthUser');
const EmailService = require('./EmailService');

class PasswordResetService {
    /**
     * Generate a secure password reset token
     */
    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Create password reset request
     * @param {String} email - User email
     * @param {String} ipAddress - Request IP address
     * @param {String} userAgent - Request user agent
     */
    async createResetRequest(email, ipAddress = null, userAgent = null) {
        try {
            // Find user by email
            const user = await AuthUser.findOne({ email: email.toLowerCase() });

            if (!user) {
                // Don't reveal if email exists or not for security
                return {
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                };
            }

            if (!user.isActive) {
                return {
                    success: false,
                    error: 'Account is inactive. Please contact support.'
                };
            }

            // Check for recent reset requests (rate limiting)
            const recentRequest = await PasswordReset.findOne({
                email: email.toLowerCase(),
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
            });

            if (recentRequest) {
                return {
                    success: false,
                    error: 'A password reset email was already sent recently. Please check your email or wait 5 minutes before trying again.'
                };
            }

            // Invalidate any existing unused tokens for this user
            await PasswordReset.updateMany(
                { userId: user._id, isUsed: false },
                { isUsed: true, usedAt: new Date() }
            );

            // Generate new reset token
            const token = this.generateResetToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Create password reset record
            const passwordReset = new PasswordReset({
                userId: user._id,
                email: email.toLowerCase(),
                token,
                expiresAt,
                ipAddress,
                userAgent
            });

            await passwordReset.save();

            // Send reset email
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

            await EmailService.sendPasswordResetEmail(user.email, user.username, resetUrl, token);

            console.log(`✅ Password reset email sent to ${email}`);

            return {
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
                // Include token in development for testing
                ...(process.env.NODE_ENV === 'development' && { token, resetUrl })
            };

        } catch (error) {
            console.error('Error creating password reset request:', error);
            throw error;
        }
    }

    /**
     * Verify reset token
     * @param {String} token - Reset token
     */
    async verifyResetToken(token) {
        try {
            const passwordReset = await PasswordReset.findOne({
                token,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            }).populate('userId', 'username email');

            if (!passwordReset) {
                return {
                    success: false,
                    error: 'Invalid or expired reset token.'
                };
            }

            return {
                success: true,
                data: {
                    userId: passwordReset.userId._id,
                    email: passwordReset.email,
                    username: passwordReset.userId.username
                }
            };

        } catch (error) {
            console.error('Error verifying reset token:', error);
            throw error;
        }
    }

    /**
     * Reset password using token
     * @param {String} token - Reset token
     * @param {String} newPassword - New password
     * @param {String} ipAddress - Request IP address
     * @param {String} userAgent - Request user agent
     */
    async resetPassword(token, newPassword, ipAddress = null, userAgent = null) {
        try {
            // Verify token
            const tokenVerification = await this.verifyResetToken(token);

            if (!tokenVerification.success) {
                return tokenVerification;
            }

            const { userId, email } = tokenVerification.data;

            // Validate password strength
            if (!newPassword || newPassword.length < 6) {
                return {
                    success: false,
                    error: 'Password must be at least 6 characters long.'
                };
            }

            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update user password
            await AuthUser.findByIdAndUpdate(userId, {
                password: hashedPassword,
                updatedAt: new Date()
            });

            // Mark token as used
            await PasswordReset.findOneAndUpdate(
                { token },
                {
                    isUsed: true,
                    usedAt: new Date(),
                    ipAddress,
                    userAgent
                }
            );

            // Invalidate all other unused tokens for this user
            await PasswordReset.updateMany(
                { userId, isUsed: false },
                { isUsed: true, usedAt: new Date() }
            );

            // Send confirmation email
            const user = await AuthUser.findById(userId);
            await EmailService.sendPasswordResetConfirmationEmail(email, user.username);

            console.log(`✅ Password reset successful for user ${email}`);

            return {
                success: true,
                message: 'Password has been reset successfully. You can now login with your new password.'
            };

        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }

    /**
     * Clean up expired tokens (for cron job)
     */
    async cleanupExpiredTokens() {
        try {
            const result = await PasswordReset.deleteMany({
                expiresAt: { $lt: new Date() }
            });

            console.log(`🗑️ Cleaned up ${result.deletedCount} expired password reset tokens`);
            return result.deletedCount;

        } catch (error) {
            console.error('Error cleaning up expired tokens:', error);
            throw error;
        }
    }

    /**
     * Get reset statistics (admin only)
     */
    async getResetStatistics() {
        try {
            const stats = await PasswordReset.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRequests: { $sum: 1 },
                        usedTokens: { $sum: { $cond: ['$isUsed', 1, 0] } },
                        expiredTokens: {
                            $sum: {
                                $cond: [
                                    { $lt: ['$expiresAt', new Date()] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            const recentRequests = await PasswordReset.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            });

            return {
                ...stats[0],
                recentRequests
            };

        } catch (error) {
            console.error('Error getting reset statistics:', error);
            throw error;
        }
    }
}

module.exports = new PasswordResetService();