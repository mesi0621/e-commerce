const AuthUser = require('../models/AuthUser');
const Role = require('../models/Role');
const PermissionService = require('./PermissionService');
const AuditLog = require('../models/AuditLog');

class RoleService {
    /**
     * Assign a role to a user
     * @param {String} userId - User ID
     * @param {String} roleName - Role name
     * @param {String} assignedBy - Admin user ID who assigned the role
     * @returns {Promise<Object>}
     */
    async assignRole(userId, roleName, assignedBy) {
        try {
            // Validate role exists
            const role = await Role.findOne({ name: roleName });
            if (!role) {
                throw new Error(`Role '${roleName}' does not exist`);
            }

            // Get user
            const user = await AuthUser.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const oldRole = user.role;

            // Update user role and permissions
            user.role = roleName;
            user.permissions = role.permissions;
            await user.save();

            // Clear permission cache
            PermissionService.clearCache(userId);

            // Log role change
            await AuditLog.create({
                userId: assignedBy,
                username: 'admin',
                action: 'role_change',
                resource: 'user',
                resourceId: userId,
                result: 'success',
                details: {
                    targetUserId: userId,
                    targetUsername: user.username,
                    oldRole,
                    newRole: roleName
                }
            });

            return {
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions
                }
            };
        } catch (error) {
            console.error('Error assigning role:', error);
            throw error;
        }
    }

    /**
     * Get permissions for a role
     * @param {String} roleName - Role name
     * @returns {Promise<Array<String>>}
     */
    async getRolePermissions(roleName) {
        try {
            const role = await Role.findOne({ name: roleName });

            if (!role) {
                return [];
            }

            return role.permissions || [];
        } catch (error) {
            console.error('Error getting role permissions:', error);
            return [];
        }
    }

    /**
     * Create a new role
     * @param {Object} roleData - Role data
     * @returns {Promise<Object>}
     */
    async createRole(roleData) {
        try {
            const { name, displayName, description, permissions, isSystem } = roleData;

            // Check if role already exists
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                throw new Error(`Role '${name}' already exists`);
            }

            // Create role
            const role = new Role({
                name,
                displayName,
                description,
                permissions: permissions || [],
                isSystem: isSystem || false
            });

            await role.save();

            return {
                success: true,
                role: {
                    id: role._id,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    permissions: role.permissions
                }
            };
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    /**
     * Update a role
     * @param {String} roleId - Role ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>}
     */
    async updateRole(roleId, updates) {
        try {
            const role = await Role.findById(roleId);

            if (!role) {
                throw new Error('Role not found');
            }

            // Prevent updating system roles
            if (role.isSystem && updates.name) {
                throw new Error('Cannot change name of system role');
            }

            // Apply updates
            if (updates.displayName) role.displayName = updates.displayName;
            if (updates.description) role.description = updates.description;
            if (updates.permissions) role.permissions = updates.permissions;

            await role.save();

            // Update all users with this role
            if (updates.permissions) {
                await this.updateUsersWithRole(role.name, updates.permissions);
            }

            return {
                success: true,
                role: {
                    id: role._id,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    permissions: role.permissions
                }
            };
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    /**
     * Update permissions for all users with a specific role
     * @param {String} roleName - Role name
     * @param {Array<String>} permissions - New permissions
     */
    async updateUsersWithRole(roleName, permissions) {
        try {
            await AuthUser.updateMany(
                { role: roleName },
                { $set: { permissions } }
            );

            // Clear cache for all users with this role
            const users = await AuthUser.find({ role: roleName });
            users.forEach(user => {
                PermissionService.clearCache(user._id.toString());
            });
        } catch (error) {
            console.error('Error updating users with role:', error);
        }
    }

    /**
     * Get all roles
     * @returns {Promise<Array<Object>>}
     */
    async getAllRoles() {
        try {
            const roles = await Role.find().sort({ name: 1 });
            return roles;
        } catch (error) {
            console.error('Error getting all roles:', error);
            return [];
        }
    }

    /**
     * Delete a role
     * @param {String} roleId - Role ID
     * @returns {Promise<Object>}
     */
    async deleteRole(roleId) {
        try {
            const role = await Role.findById(roleId);

            if (!role) {
                throw new Error('Role not found');
            }

            if (role.isSystem) {
                throw new Error('Cannot delete system role');
            }

            // Check if any users have this role
            const usersWithRole = await AuthUser.countDocuments({ role: role.name });
            if (usersWithRole > 0) {
                throw new Error(`Cannot delete role: ${usersWithRole} users still have this role`);
            }

            await role.remove();

            return {
                success: true,
                message: 'Role deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }
}

module.exports = new RoleService();
