const AuditLog = require('../models/AuditLog');

class AuditService {
    /**
     * Log authentication attempt
     * @param {String} userId - User ID
     * @param {String} username - Username
     * @param {String} result - 'success' or 'error'
     * @param {Object} req - Express request object
     * @param {Object} details - Additional details
     */
    async logAuthentication(userId, username, result, req, details = {}) {
        try {
            await AuditLog.create({
                userId,
                username,
                action: result === 'success' ? 'login' : 'login_failed',
                resource: 'authentication',
                result,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                details
            });
        } catch (error) {
            console.error('Error logging authentication:', error);
        }
    }

    /**
     * Log permission denial
     * @param {String} userId - User ID
     * @param {String} username - Username
     * @param {String} permission - Permission that was denied
     * @param {Object} req - Express request object
     * @param {Object} details - Additional details
     */
    async logPermissionDenial(userId, username, permission, req, details = {}) {
        try {
            await AuditLog.create({
                userId,
                username,
                action: 'permission_denied',
                resource: permission.split('.')[0] || 'unknown',
                result: 'denied',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                details: {
                    permission,
                    endpoint: req.originalUrl,
                    method: req.method,
                    ...details
                }
            });
        } catch (error) {
            console.error('Error logging permission denial:', error);
        }
    }

    /**
     * Log role change
     * @param {String} adminUserId - Admin user ID who made the change
     * @param {String} adminUsername - Admin username
     * @param {String} targetUserId - Target user ID
     * @param {String} targetUsername - Target username
     * @param {String} oldRole - Old role
     * @param {String} newRole - New role
     * @param {Object} req - Express request object
     */
    async logRoleChange(adminUserId, adminUsername, targetUserId, targetUsername, oldRole, newRole, req) {
        try {
            await AuditLog.create({
                userId: adminUserId,
                username: adminUsername,
                action: 'role_change',
                resource: 'user',
                resourceId: targetUserId,
                result: 'success',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                details: {
                    targetUserId,
                    targetUsername,
                    oldRole,
                    newRole
                }
            });
        } catch (error) {
            console.error('Error logging role change:', error);
        }
    }

    /**
     * Log admin action
     * @param {String} userId - Admin user ID
     * @param {String} username - Admin username
     * @param {String} action - Action performed
     * @param {String} resource - Resource affected
     * @param {String} resourceId - Resource ID
     * @param {Object} req - Express request object
     * @param {Object} details - Additional details
     */
    async logAdminAction(userId, username, action, resource, resourceId, req, details = {}) {
        try {
            await AuditLog.create({
                userId,
                username,
                action: 'admin_action',
                resource,
                resourceId,
                result: 'success',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                details: {
                    adminAction: action,
                    ...details
                }
            });
        } catch (error) {
            console.error('Error logging admin action:', error);
        }
    }

    /**
     * Log user creation
     * @param {String} adminUserId - Admin user ID
     * @param {String} adminUsername - Admin username
     * @param {String} newUserId - New user ID
     * @param {String} newUsername - New username
     * @param {String} role - Assigned role
     * @param {Object} req - Express request object
     */
    async logUserCreation(adminUserId, adminUsername, newUserId, newUsername, role, req) {
        try {
            await AuditLog.create({
                userId: adminUserId,
                username: adminUsername,
                action: 'user_created',
                resource: 'user',
                resourceId: newUserId,
                result: 'success',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                details: {
                    newUserId,
                    newUsername,
                    assignedRole: role
                }
            });
        } catch (error) {
            console.error('Error logging user creation:', error);
        }
    }

    /**
     * Log logout
     * @param {String} userId - User ID
     * @param {String} username - Username
     * @param {Object} req - Express request object
     */
    async logLogout(userId, username, req) {
        try {
            await AuditLog.create({
                userId,
                username,
                action: 'logout',
                resource: 'authentication',
                result: 'success',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                details: {}
            });
        } catch (error) {
            console.error('Error logging logout:', error);
        }
    }

    /**
     * Get audit logs with filters
     * @param {Object} filters - Filter options
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     * @returns {Promise<Object>}
     */
    async getAuditLogs(filters = {}, page = 1, limit = 50) {
        try {
            const query = {};

            // Apply filters
            if (filters.userId) query.userId = filters.userId;
            if (filters.action) query.action = filters.action;
            if (filters.result) query.result = filters.result;
            if (filters.resource) query.resource = filters.resource;

            // Date range filter
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
                if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
            }

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Get logs
            const logs = await AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Get total count
            const total = await AuditLog.countDocuments(query);

            return {
                success: true,
                data: logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting audit logs:', error);
            throw error;
        }
    }

    /**
     * Get audit logs for a specific user
     * @param {String} userId - User ID
     * @param {Number} limit - Number of logs to return
     * @returns {Promise<Array>}
     */
    async getUserAuditLogs(userId, limit = 100) {
        try {
            const logs = await AuditLog.find({ userId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean();

            return logs;
        } catch (error) {
            console.error('Error getting user audit logs:', error);
            return [];
        }
    }

    /**
     * Get recent failed login attempts
     * @param {Number} minutes - Time window in minutes
     * @returns {Promise<Array>}
     */
    async getRecentFailedLogins(minutes = 15) {
        try {
            const timeWindow = new Date(Date.now() - minutes * 60 * 1000);

            const logs = await AuditLog.find({
                action: 'login_failed',
                timestamp: { $gte: timeWindow }
            })
                .sort({ timestamp: -1 })
                .lean();

            return logs;
        } catch (error) {
            console.error('Error getting failed logins:', error);
            return [];
        }
    }

    /**
     * Get audit statistics
     * @param {Object} filters - Filter options
     * @returns {Promise<Object>}
     */
    async getAuditStatistics(filters = {}) {
        try {
            const query = {};

            // Date range filter
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
                if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
            }

            // Get statistics
            const [
                totalLogs,
                successfulLogins,
                failedLogins,
                permissionDenials,
                roleChanges
            ] = await Promise.all([
                AuditLog.countDocuments(query),
                AuditLog.countDocuments({ ...query, action: 'login', result: 'success' }),
                AuditLog.countDocuments({ ...query, action: 'login_failed' }),
                AuditLog.countDocuments({ ...query, action: 'permission_denied' }),
                AuditLog.countDocuments({ ...query, action: 'role_change' })
            ]);

            return {
                success: true,
                statistics: {
                    totalLogs,
                    successfulLogins,
                    failedLogins,
                    permissionDenials,
                    roleChanges
                }
            };
        } catch (error) {
            console.error('Error getting audit statistics:', error);
            throw error;
        }
    }
}

module.exports = new AuditService();
