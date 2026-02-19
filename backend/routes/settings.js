const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All settings routes require admin role
router.use(verifyToken);
router.use(requireAdmin);

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);
router.post('/reset', SettingsController.resetSettings);

module.exports = router;
