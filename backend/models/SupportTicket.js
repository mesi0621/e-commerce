const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['customer', 'support', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const supportTicketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['order_issue', 'product_inquiry', 'payment_issue', 'delivery_issue', 'refund_request', 'account_issue', 'technical_issue', 'other'],
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'],
        default: 'open',
        index: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        index: true
    },
    assignedAt: Date,
    relatedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    relatedProductId: Number,
    messages: [ticketMessageSchema],
    resolution: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AuthUser'
        },
        resolvedAt: Date,
        resolutionNote: String,
        customerSatisfaction: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    tags: [String],
    internalNotes: [{
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AuthUser'
        },
        note: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    escalated: {
        type: Boolean,
        default: false
    },
    escalatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    escalatedAt: Date,
    escalationReason: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastResponseAt: Date,
    responseTime: Number, // Time to first response in minutes
    resolutionTime: Number // Time to resolution in minutes
}, {
    timestamps: true
});

// Indexes for efficient queries
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportTicketSchema.index({ category: 1, status: 1 });

// Calculate response time before saving
supportTicketSchema.pre('save', function (next) {
    if (this.messages.length > 1 && !this.responseTime) {
        const firstMessage = this.messages[0];
        const firstResponse = this.messages.find(msg => msg.senderRole !== 'customer');
        if (firstResponse) {
            this.responseTime = Math.round((firstResponse.timestamp - firstMessage.timestamp) / (1000 * 60));
        }
    }

    if (this.resolution && this.resolution.resolvedAt && !this.resolutionTime) {
        this.resolutionTime = Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
    }

    next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;
