const Role = require('../models/Role');

class RoleInitService {
    /**
     * Initialize system roles on application startup
     * Creates missing roles and updates permissions if needed
     */
    async initializeRoles() {
        try {
            console.log('Initializing system roles...');

            const systemRoles = [
                {
                    name: 'admin',
                    displayName: 'Administrator',
                    description: 'Full system access and control',
                    isSystem: true,
                    permissions: ['*.*']
                },
                {
                    name: 'seller',
                    displayName: 'Seller/Vendor',
                    description: 'Sell products on the platform',
                    isSystem: true,
                    permissions: [
                        'products.create',
                        'products.read',
                        'products.update.own',
                        'products.delete.own',
                        'orders.read.own',
                        'orders.update.own'
                    ]
                },
                {
                    name: 'customer',
                    displayName: 'Customer',
                    description: 'Purchase products',
                    isSystem: true,
                    permissions: [
                        'products.read',
                        'orders.create',
                        'orders.read.own',
                        'orders.cancel.own',
                        'cart.manage.own',
                        'reviews.create',
                        'reviews.read',
                        'reviews.update.own',
                        'reviews.delete.own'
                    ]
                },
                {
                    name: 'delivery',
                    displayName: 'Delivery Staff',
                    description: 'Handle product delivery',
                    isSystem: true,
                    permissions: [
                        'deliveries.read.assigned',
                        'deliveries.update.assigned'
                    ]
                },
                {
                    name: 'support',
                    displayName: 'Customer Support',
                    description: 'Help customers and maintain quality',
                    isSystem: true,
                    permissions: [
                        'support.read',
                        'support.update',
                        'reviews.moderate',
                        'orders.read.all'
                    ]
                },
                {
                    name: 'finance',
                    displayName: 'Finance Staff',
                    description: 'Manage financial operations',
                    isSystem: true,
                    permissions: [
                        'finance.read',
                        'finance.reports',
                        'finance.payouts',
                        'orders.read.all'
                    ]
                },
                {
                    name: 'guest',
                    displayName: 'Guest',
                    description: 'Unregistered visitor',
                    isSystem: true,
                    permissions: [
                        'products.read',
                        'reviews.read'
                    ]
                }
            ];

            for (const roleData of systemRoles) {
                const existingRole = await Role.findOne({ name: roleData.name });

                if (!existingRole) {
                    // Create new role
                    await Role.create(roleData);
                    console.log(`✓ Created role: ${roleData.displayName}`);
                } else {
                    // Update permissions if they've changed
                    const permissionsChanged = JSON.stringify(existingRole.permissions.sort()) !==
                        JSON.stringify(roleData.permissions.sort());

                    if (permissionsChanged) {
                        existingRole.permissions = roleData.permissions;
                        existingRole.displayName = roleData.displayName;
                        existingRole.description = roleData.description;
                        await existingRole.save();
                        console.log(`✓ Updated role: ${roleData.displayName}`);
                    }
                }
            }

            console.log('System roles initialized successfully');
        } catch (error) {
            console.error('Error initializing roles:', error);
            throw error;
        }
    }

    /**
     * Check if all system roles exist
     * @returns {Promise<Boolean>}
     */
    async checkRolesExist() {
        try {
            const requiredRoles = ['admin', 'seller', 'customer', 'delivery', 'support', 'finance', 'guest'];
            const existingRoles = await Role.find({ name: { $in: requiredRoles } });

            return existingRoles.length === requiredRoles.length;
        } catch (error) {
            console.error('Error checking roles:', error);
            return false;
        }
    }
}

module.exports = new RoleInitService();
