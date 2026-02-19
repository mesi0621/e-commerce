const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const RoleService = require('../services/RoleService');
const AuthUser = require('../models/AuthUser');
const Role = require('../models/Role');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

/**
 * POST /api/admin/users/:userId/role
 * Assign role to a user
 */
router.post('/users/:userId/role', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                error: 'Role is required'
            });
        }

        const result = await RoleService.assignRole(
            userId,
            role,
            req.user.userId
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Assign role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/roles
 * Get all roles
 */
router.get('/roles', async (req, res) => {
    try {
        const roles = await RoleService.getAllRoles();

        res.status(200).json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/admin/roles
 * Create a new custom role
 */
router.post('/roles', async (req, res) => {
    try {
        const result = await RoleService.createRole(req.body);

        res.status(201).json(result);
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/roles/:roleId
 * Update a role
 */
router.put('/roles/:roleId', async (req, res) => {
    try {
        const { roleId } = req.params;

        const result = await RoleService.updateRole(roleId, req.body);

        res.status(200).json(result);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/roles/:roleId
 * Delete a role
 */
router.delete('/roles/:roleId', async (req, res) => {
    try {
        const { roleId } = req.params;

        const result = await RoleService.deleteRole(roleId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/users
 * Get all users with filters
 */
router.get('/users', async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 50 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const skip = (page - 1) * limit;

        const users = await AuthUser.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuthUser.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/users/:userId/status
 * Activate or deactivate a user
 */
router.put('/users/:userId/status', async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({
                success: false,
                error: 'isActive field is required'
            });
        }

        const user = await AuthUser.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
