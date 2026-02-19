const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/AuditController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All audit routes require admin role
router.use(verifyToken);
router.use(requireAdmin);

// Get audit logs with filters
router.get('/logs', AuditController.getAuditLogs);

// Get audit logs for specific user
router.get('/logs/:userId', AuditController.getUserAuditLogs);

// Get audit statistics
router.get('/statistics', AuditController.getAuditStatistics);

// Get recent failed login attempts
router.get('/failed-logins', AuditController.getFailedLogins);

module.exports = router;
