const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/SupportController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All support routes require authentication
router.use(verifyToken);

// Customer routes
router.post('/tickets', SupportController.createTicket);
router.get('/tickets/my-tickets', SupportController.getMyTickets);

// Shared routes (customer and support can access their own tickets)
router.get('/tickets/:ticketId', SupportController.getTicketById);
router.post('/tickets/:ticketId/messages', SupportController.addMessage);

// Support staff routes
router.get('/tickets', requireRole(['support', 'admin']), SupportController.getAllTickets);
router.put('/tickets/:ticketId', requireRole(['support', 'admin']), SupportController.updateTicket);
router.post('/tickets/:ticketId/resolve', requireRole(['support', 'admin']), SupportController.resolveTicket);
router.post('/tickets/:ticketId/escalate', requireRole(['support', 'admin']), SupportController.escalateTicket);
router.post('/tickets/:ticketId/notes', requireRole(['support', 'admin']), SupportController.addInternalNote);
router.get('/statistics', requireRole(['support', 'admin']), SupportController.getStatistics);

// Review moderation routes
router.get('/reviews/flagged', requireRole(['support', 'admin']), SupportController.getFlaggedReviews);
router.put('/reviews/:reviewId/moderate', requireRole(['support', 'admin']), SupportController.moderateReview);
router.post('/reviews/:reviewId/flag', SupportController.flagReview);

module.exports = router;
