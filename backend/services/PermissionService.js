const AuthUser = require('../models/AuthUser');
const Role = require('../models/Role');

class PermissionService {
    constructor() {
        // In-memory cache for permissions (optional, for performance)
        this.permissionCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Check if a user has a specific permission
     * @param {String} userId - User ID
     * @param {String} permission - Permission string (e.g., 'products.create')
     * @returns {Promise<Boolean>}
     */
    async checkPermission(userId, permission) {
        try {
            // Get user with permissions
            const user = await AuthUser.findById(userId);

            if (!user || !user.isActive) {
                return false;
            }

            // Admin has all permissions
            if (user.role === 'admin') {
                return true;
            }

            // Check if user has the specific permission
            if (user.permissions && user.permissions.includes(permission)) {
                return true;
            }

            // Check wildcard permissions (e.g., 'products.*' matches 'products.create')
            const [resource, action] = permission.split('.');
            const wildcardPermission = `${resource}.*`;

            if (user.permissions && user.permissions.includes(wildcardPermission)) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }

    /**
     * Check if a user has a specific role
     * @param {String} userId - User ID
     * @param {String} roleName - Role name
     * @returns {Promise<Boolean>}
     */
    async hasRole(userId, roleName) {
        try {
            const user = await AuthUser.findById(userId);

            if (!user || !user.isActive) {
                return false;
            }

            return user.role === roleName;
        } catch (error) {
            console.error('Error checking role:', error);
            return false;
        }
    }

    /**
     * Get all permissions for a user
     * @param {String} userId - User ID
     * @returns {Promise<Array<String>>}
     */
    async getPermissions(userId) {
        try {
            // Check cache first
            const cacheKey = `permissions_${userId}`;
            const cached = this.permissionCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.permissions;
            }

            // Get user
            const user = await AuthUser.findById(userId);

            if (!user || !user.isActive) {
                return [];
            }

            // Admin gets all permissions
            if (user.role === 'admin') {
                const allPermissions = ['*']; // Wildcard for all permissions
                this.cachePermissions(cacheKey, allPermissions);
                return allPermissions;
            }

            // Return user's permissions
            const permissions = user.permissions || [];
            this.cachePermissions(cacheKey, permissions);

            return permissions;
        } catch (error) {
            console.error('Error getting permissions:', error);
            return [];
        }
    }

    /**
     * Check if user owns a resource
     * @param {String} userId - User ID
     * @param {Object} resource - Resource object with userId or sellerId field
     * @returns {Boolean}
     */
    checkOwnership(userId, resource) {
        if (!resource) return false;

        // Check direct ownership
        if (resource.userId && resource.userId.toString() === userId.toString()) {
            return true;
        }

        // Check seller ownership
        if (resource.sellerId && resource.sellerId.toString() === userId.toString()) {
            return true;
        }

        return false;
    }

    /**
     * Cache permissions for performance
     * @param {String} key - Cache key
     * @param {Array} permissions - Permissions array
     */
    cachePermissions(key, permissions) {
        this.permissionCache.set(key, {
            permissions,
            timestamp: Date.now()
        });
    }

    /**
     * Clear permission cache for a user
     * @param {String} userId - User ID
     */
    clearCache(userId) {
        const cacheKey = `permissions_${userId}`;
        this.permissionCache.delete(cacheKey);
    }

    /**
     * Clear all permission cache
     */
    clearAllCache() {
        this.permissionCache.clear();
    }
}

module.exports = new PermissionService();
