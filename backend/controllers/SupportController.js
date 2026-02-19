const SupportTicket = require('../models/SupportTicket');
const AuthUser = require('../models/AuthUser');
const Order = require('../models/Order');
const NotificationService = require('../services/NotificationService');

class SupportController {
    /**
     * Create support ticket (Customer)
     * POST /api/support/tickets
     * Requires authentication
     */
    async createTicket(req, res) {
        try {
            const { subject, category, message, priority, relatedOrderId, relatedProductId } = req.body;

            // Validate required fields
            if (!subject || !category || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Subject, category, and message are required'
                });
            }

            // Generate unique ticket number
            const ticketCount = await SupportTicket.countDocuments();
            const ticketNumber = `TKT-${Date.now()}-${String(ticketCount + 1).padStart(5, '0')}`;

            // Create ticket
            const ticket = new SupportTicket({
                ticketNumber,
                userId: req.user.userId,
                subject,
                category,
                priority: priority || 'medium',
                relatedOrderId,
                relatedProductId,
                messages: [{
                    senderId: req.user.userId,
                    senderRole: 'customer',
                    message,
                    timestamp: Date.now()
                }]
            });

            await ticket.save();

            // Notify support staff
            const supportStaff = await AuthUser.find({ role: 'support', isActive: true });
            for (const staff of supportStaff) {
                await NotificationService.createNotification(
                    staff._id,
                    'support',
                    'New Support Ticket',
                    `New ${category} ticket: ${subject}`,
                    { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
                    `/support/tickets/${ticket._id}`
                );
            }

            res.status(201).json({
                success: true,
                message: 'Support ticket created successfully',
                data: ticket
            });
        } catch (error) {
            console.error('Create ticket error:', error);
            res.status(500).json({
                success: false,
                error: 'Error creating support ticket',
                message: error.message
            });
        }
    }

    /**
     * Get user's tickets (Customer)
     * GET /api/support/tickets/my-tickets
     * Requires authentication
     */
    async getMyTickets(req, res) {
        try {
            const { status, category, page = 1, limit = 10 } = req.query;
            const query = { userId: req.user.userId };

            if (status) query.status = status;
            if (category) query.category = category;

            const skip = (page - 1) * limit;

            const tickets = await SupportTicket.find(query)
                .populate('assignedTo', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await SupportTicket.countDocuments(query);

            res.json({
                success: true,
                data: tickets,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get my tickets error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching tickets',
                message: error.message
            });
        }
    }

    /**
     * Get all tickets (Support staff)
     * GET /api/support/tickets
     * Requires support or admin role
     */
    async getAllTickets(req, res) {
        try {
            const { status, category, priority, assignedTo, page = 1, limit = 20 } = req.query;
            const query = {};

            if (status) query.status = status;
            if (category) query.category = category;
            if (priority) query.priority = priority;
            if (assignedTo) query.assignedTo = assignedTo;

            // Support staff see only their assigned tickets unless they're admin
            if (req.user.role === 'support' && !assignedTo) {
                query.$or = [
                    { assignedTo: req.user.userId },
                    { assignedTo: { $exists: false } }
                ];
            }

            const skip = (page - 1) * limit;

            const tickets = await SupportTicket.find(query)
                .populate('userId', 'username email phone')
                .populate('assignedTo', 'username email')
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await SupportTicket.countDocuments(query);

            res.json({
                success: true,
                data: tickets,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get all tickets error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching tickets',
                message: error.message
            });
        }
    }

    /**
     * Get ticket by ID
     * GET /api/support/tickets/:ticketId
     * Requires authentication
     */
    async getTicketById(req, res) {
        try {
            const { ticketId } = req.params;

            const ticket = await SupportTicket.findById(ticketId)
                .populate('userId', 'username email phone')
                .populate('assignedTo', 'username email')
                .populate('messages.senderId', 'username email')
                .populate('resolution.resolvedBy', 'username email');

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            // Access control
            const isOwner = ticket.userId._id.toString() === req.user.userId;
            const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user.userId;
            const isSupport = req.user.role === 'support' || req.user.role === 'admin';

            if (!isOwner && !isAssigned && !isSupport) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: ticket
            });
        } catch (error) {
            console.error('Get ticket by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching ticket',
                message: error.message
            });
        }
    }

    /**
     * Add message to ticket
     * POST /api/support/tickets/:ticketId/messages
     * Requires authentication
     */
    async addMessage(req, res) {
        try {
            const { ticketId } = req.params;
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }

            const ticket = await SupportTicket.findById(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            // Access control
            const isOwner = ticket.userId.toString() === req.user.userId;
            const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === req.user.userId;
            const isSupport = req.user.role === 'support' || req.user.role === 'admin';

            if (!isOwner && !isAssigned && !isSupport) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            // Determine sender role
            let senderRole = 'customer';
            if (req.user.role === 'support') senderRole = 'support';
            if (req.user.role === 'admin') senderRole = 'admin';

            // Add message
            ticket.messages.push({
                senderId: req.user.userId,
                senderRole,
                message,
                timestamp: Date.now()
            });

            ticket.lastResponseAt = Date.now();

            // Update status if customer responds
            if (senderRole === 'customer' && ticket.status === 'waiting_customer') {
                ticket.status = 'in_progress';
            }

            // Update status if support responds
            if (senderRole !== 'customer' && ticket.status === 'open') {
                ticket.status = 'in_progress';
            }

            await ticket.save();

            // Send notification
            if (senderRole === 'customer') {
                // Notify assigned support staff
                if (ticket.assignedTo) {
                    await NotificationService.createNotification(
                        ticket.assignedTo,
                        'support',
                        'New Ticket Response',
                        `Customer responded to ticket ${ticket.ticketNumber}`,
                        { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
                        `/support/tickets/${ticket._id}`
                    );
                }
            } else {
                // Notify customer
                await NotificationService.createNotification(
                    ticket.userId,
                    'support',
                    'Support Response',
                    `Support team responded to your ticket ${ticket.ticketNumber}`,
                    { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
                    `/support/tickets/${ticket._id}`
                );
            }

            res.json({
                success: true,
                message: 'Message added successfully',
                data: ticket
            });
        } catch (error) {
            console.error('Add message error:', error);
            res.status(500).json({
                success: false,
                error: 'Error adding message',
                message: error.message
            });
        }
    }

    /**
     * Update ticket (Support staff)
     * PUT /api/support/tickets/:ticketId
     * Requires support or admin role
     */
    async updateTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const { status, priority, assignedTo, tags } = req.body;

            const ticket = await SupportTicket.findById(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            // Update fields
            if (status) ticket.status = status;
            if (priority) ticket.priority = priority;
            if (tags) ticket.tags = tags;

            if (assignedTo) {
                // Verify support staff exists
                const supportStaff = await AuthUser.findById(assignedTo);
                if (!supportStaff || (supportStaff.role !== 'support' && supportStaff.role !== 'admin')) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid support staff ID'
                    });
                }

                ticket.assignedTo = assignedTo;
                ticket.assignedAt = Date.now();

                // Notify assigned staff
                await NotificationService.createNotification(
                    assignedTo,
                    'support',
                    'Ticket Assigned',
                    `You have been assigned ticket ${ticket.ticketNumber}`,
                    { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
                    `/support/tickets/${ticket._id}`
                );
            }

            await ticket.save();

            res.json({
                success: true,
                message: 'Ticket updated successfully',
                data: ticket
            });
        } catch (error) {
            console.error('Update ticket error:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating ticket',
                message: error.message
            });
        }
    }

    /**
     * Resolve ticket (Support staff)
     * POST /api/support/tickets/:ticketId/resolve
     * Requires support or admin role
     */
    async resolveTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const { resolutionNote } = req.body;

            const ticket = await SupportTicket.findById(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            // Update ticket
            ticket.status = 'resolved';
            ticket.resolution = {
                resolvedBy: req.user.userId,
                resolvedAt: Date.now(),
                resolutionNote: resolutionNote || 'Ticket resolved'
            };

            await ticket.save();

            // Notify customer
            await NotificationService.createNotification(
                ticket.userId,
                'support',
                'Ticket Resolved',
                `Your support ticket ${ticket.ticketNumber} has been resolved`,
                { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
                `/support/tickets/${ticket._id}`
            );

            res.json({
                success: true,
                message: 'Ticket resolved successfully',
                data: ticket
            });
        } catch (error) {
            console.error('Resolve ticket error:', error);
            res.status(500).json({
                success: false,
                error: 'Error resolving ticket',
                message: error.message
            });
        }
    }

    /**
     * Escalate ticket (Support staff)
     * POST /api/support/tickets/:ticketId/escalate
     * Requires support role
     */
    async escalateTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const { escalationReason, escalateTo } = req.body;

            const ticket = await SupportTicket.findById(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            // Find admin or senior support staff
            let escalateToUser;
            if (escalateTo) {
                escalateToUser = await AuthUser.findById(escalateTo);
            } else {
                escalateToUser = await AuthUser.findOne({ role: 'admin', isActive: true });
            }

            if (!escalateToUser) {
                return res.status(400).json({
                    success: false,
                    error: 'No admin available for escalation'
                });
            }

            // Update ticket
            ticket.escalated = true;
            ticket.escalatedTo = escalateToUser._id;
            ticket.escalatedAt = Date.now();
            ticket.escalationReason = escalationReason || 'Escalated by support staff';
            ticket.priority = 'urgent';

            await ticket.save();

            // Notify escalated user
            await NotificationService.createNotification(
                escalateToUser._id,
                'support',
                'Ticket Escalated',
                `Ticket ${ticket.ticketNumber} has been escalated to you`,
                { ticketId: ticket._id, ticketNumber: ticket.ticketNumber, reason: escalationReason },
                `/support/tickets/${ticket._id}`
            );

            res.json({
                success: true,
                message: 'Ticket escalated successfully',
                data: ticket
            });
        } catch (error) {
            console.error('Escalate ticket error:', error);
            res.status(500).json({
                success: false,
                error: 'Error escalating ticket',
                message: error.message
            });
        }
    }

    /**
     * Add internal note (Support staff)
     * POST /api/support/tickets/:ticketId/notes
     * Requires support or admin role
     */
    async addInternalNote(req, res) {
        try {
            const { ticketId } = req.params;
            const { note } = req.body;

            if (!note) {
                return res.status(400).json({
                    success: false,
                    error: 'Note is required'
                });
            }

            const ticket = await SupportTicket.findById(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found'
                });
            }

            ticket.internalNotes.push({
                staffId: req.user.userId,
                note,
                timestamp: Date.now()
            });

            await ticket.save();

            res.json({
                success: true,
                message: 'Internal note added successfully',
                data: ticket
            });
        } catch (error) {
            console.error('Add internal note error:', error);
            res.status(500).json({
                success: false,
                error: 'Error adding internal note',
                message: error.message
            });
        }
    }

    /**
     * Get support statistics (Admin/Support)
     * GET /api/support/statistics
     * Requires support or admin role
     */
    async getStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const dateFilter = {};

            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);

            const query = dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {};

            const [
                totalTickets,
                openTickets,
                inProgressTickets,
                resolvedTickets,
                avgResponseTime,
                avgResolutionTime,
                ticketsByCategory,
                ticketsByPriority
            ] = await Promise.all([
                SupportTicket.countDocuments(query),
                SupportTicket.countDocuments({ ...query, status: 'open' }),
                SupportTicket.countDocuments({ ...query, status: 'in_progress' }),
                SupportTicket.countDocuments({ ...query, status: 'resolved' }),
                SupportTicket.aggregate([
                    { $match: { ...query, responseTime: { $exists: true } } },
                    { $group: { _id: null, avg: { $avg: '$responseTime' } } }
                ]),
                SupportTicket.aggregate([
                    { $match: { ...query, resolutionTime: { $exists: true } } },
                    { $group: { _id: null, avg: { $avg: '$resolutionTime' } } }
                ]),
                SupportTicket.aggregate([
                    { $match: query },
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ]),
                SupportTicket.aggregate([
                    { $match: query },
                    { $group: { _id: '$priority', count: { $sum: 1 } } }
                ])
            ]);

            res.json({
                success: true,
                data: {
                    totalTickets,
                    openTickets,
                    inProgressTickets,
                    resolvedTickets,
                    avgResponseTime: avgResponseTime[0]?.avg || 0,
                    avgResolutionTime: avgResolutionTime[0]?.avg || 0,
                    ticketsByCategory,
                    ticketsByPriority
                }
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching statistics',
                message: error.message
            });
        }
    }
}

module.exports = new SupportController();


    /**
     * Get flagged reviews (Support staff)
     * GET /api/support/reviews/flagged
     * Requires support or admin role
     */
    async getFlaggedReviews(req, res) {
    try {
        const Review = require('../models/Review');
        const { page = 1, limit = 20 } = req.query;

        const query = { flagged: true };
        const skip = (page - 1) * limit;

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments(query);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get flagged reviews error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching flagged reviews',
            message: error.message
        });
    }
}

    /**
     * Moderate review (Support staff)
     * PUT /api/support/reviews/:reviewId/moderate
     * Requires support or admin role
     */
    async moderateReview(req, res) {
    try {
        const Review = require('../models/Review');
        const { reviewId } = req.params;
        const { action, moderationNote } = req.body;

        // Validate action
        const validActions = ['approve', 'reject', 'hide'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                error: `Invalid action. Must be one of: ${validActions.join(', ')}`
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        // Update review based on action
        if (action === 'approve') {
            review.status = 'approved';
            review.flagged = false;
        } else if (action === 'reject') {
            review.status = 'rejected';
        } else if (action === 'hide') {
            review.status = 'rejected';
            review.flagged = true;
        }

        review.moderatedBy = req.user.userId;
        review.moderatedAt = Date.now();
        review.moderationNote = moderationNote || `Review ${action}ed by support staff`;

        await review.save();

        // Notify review author if rejected
        if (action === 'reject' || action === 'hide') {
            await NotificationService.createNotification(
                review.userId,
                'system',
                'Review Moderated',
                `Your review has been ${action}ed by our moderation team`,
                { reviewId: review._id, reason: moderationNote }
            );
        }

        res.json({
            success: true,
            message: `Review ${action}ed successfully`,
            data: review
        });
    } catch (error) {
        console.error('Moderate review error:', error);
        res.status(500).json({
            success: false,
            error: 'Error moderating review',
            message: error.message
        });
    }
}

    /**
     * Flag review (Customer)
     * POST /api/support/reviews/:reviewId/flag
     * Requires authentication
     */
    async flagReview(req, res) {
    try {
        const Review = require('../models/Review');
        const { reviewId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Flag reason is required'
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        // Check if user already flagged this review
        const alreadyFlagged = review.flaggedBy.some(
            flag => flag.userId === req.user.userId
        );

        if (alreadyFlagged) {
            return res.status(400).json({
                success: false,
                error: 'You have already flagged this review'
            });
        }

        // Add flag
        review.flaggedBy.push({
            userId: req.user.userId,
            reason,
            timestamp: Date.now()
        });

        // Mark as flagged if multiple flags
        if (review.flaggedBy.length >= 3) {
            review.flagged = true;
            review.status = 'flagged';

            // Notify support staff
            const supportStaff = await AuthUser.find({ role: 'support', isActive: true });
            for (const staff of supportStaff) {
                await NotificationService.createNotification(
                    staff._id,
                    'support',
                    'Review Flagged',
                    `A review has been flagged multiple times and requires moderation`,
                    { reviewId: review._id, flagCount: review.flaggedBy.length }
                );
            }
        }

        await review.save();

        res.json({
            success: true,
            message: 'Review flagged successfully',
            data: review
        });
    } catch (error) {
        console.error('Flag review error:', error);
        res.status(500).json({
            success: false,
            error: 'Error flagging review',
            message: error.message
        });
    }
}
}

module.exports = new SupportController();
