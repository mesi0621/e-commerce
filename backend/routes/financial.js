const express = require('express');
const router = express.Router();
const FinancialController = require('../controllers/FinancialController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All financial routes require finance or admin role
router.use(verifyToken);
router.use(requireRole(['admin', 'finance']));

// Transaction endpoints
router.get('/transactions', FinancialController.getAllTransactions);

// Report endpoints
router.get('/reports/sales', FinancialController.getSalesReport);
router.get('/reports/commissions', FinancialController.getCommissionReport);

// Seller earnings and balance
router.get('/seller-earnings', FinancialController.getSellerEarnings);
router.get('/seller/:sellerId/balance', FinancialController.getSellerBalance);

// Commission management
router.get('/commission', FinancialController.getCommissionSummary);
router.put('/seller/:sellerId/commission', FinancialController.updateSellerCommission);

// Payout endpoints
router.post('/payouts', FinancialController.processPayout);
router.get('/payouts', FinancialController.getAllPayouts);
router.put('/payouts/:payoutId/status', FinancialController.updatePayoutStatus);

// Statistics
router.get('/statistics', FinancialController.getFinancialStatistics);

module.exports = router;
