const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['view', 'cart_add', 'purchase'],
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for querying interactions by product and type
interactionSchema.index({ productId: 1, type: 1, timestamp: -1 });

// Compound index for querying user interactions
interactionSchema.index({ userId: 1, timestamp: -1 });

// Virtual for age in weeks
interactionSchema.virtual('ageInWeeks').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.timestamp);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
});

// Ensure virtuals are included in JSON
interactionSchema.set('toJSON', { virtuals: true });
interactionSchema.set('toObject', { virtuals: true });

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
