const mongoose = require('mongoose');

// Simple in-memory settings store (in production, use a database model)
let systemSettings = {
    siteName: 'E-Commerce Store',
    currency: 'USD',
    taxRate: 10,
    shippingFee: 5,
    defaultCommission: 10,
    maintenanceMode: false,
    allowGuestCheckout: true,
    maxCartItems: 50,
    orderCancellationWindow: 24, // hours
    refundProcessingDays: 7
};

/**
 * Get system settings
 * GET /api/settings
 * Requires admin role
 */
async function getSettings(req, res) {
    try {
        res.json({
            success: true,
            data: systemSettings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching settings',
            message: error.message
        });
    }
}

/**
 * Update system settings
 * PUT /api/settings
 * Requires admin role
 */
async function updateSettings(req, res) {
    try {
        const updates = req.body;

        // Validate numeric fields
        if (updates.taxRate !== undefined) {
            if (updates.taxRate < 0 || updates.taxRate > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Tax rate must be between 0 and 100'
                });
            }
        }

        if (updates.defaultCommission !== undefined) {
            if (updates.defaultCommission < 0 || updates.defaultCommission > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Default commission must be between 0 and 100'
                });
            }
        }

        if (updates.shippingFee !== undefined) {
            if (updates.shippingFee < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Shipping fee cannot be negative'
                });
            }
        }

        // Update settings
        systemSettings = { ...systemSettings, ...updates };

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: systemSettings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating settings',
            message: error.message
        });
    }
}

/**
 * Reset settings to defaults
 * POST /api/settings/reset
 * Requires admin role
 */
async function resetSettings(req, res) {
    try {
        systemSettings = {
            siteName: 'E-Commerce Store',
            currency: 'USD',
            taxRate: 10,
            shippingFee: 5,
            defaultCommission: 10,
            maintenanceMode: false,
            allowGuestCheckout: true,
            maxCartItems: 50,
            orderCancellationWindow: 24,
            refundProcessingDays: 7
        };

        res.json({
            success: true,
            message: 'Settings reset to defaults',
            data: systemSettings
        });
    } catch (error) {
        console.error('Reset settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Error resetting settings',
            message: error.message
        });
    }
}

module.exports = {
    getSettings,
    updateSettings,
    resetSettings
};
