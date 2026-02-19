const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    upvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    downvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    // Moderation fields
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'approved',
        index: true
    },
    flagged: {
        type: Boolean,
        default: false,
        index: true
    },
    flagReason: String,
    flaggedBy: [{
        userId: String,
        reason: String,
        timestamp: Date
    }],
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    moderatedAt: Date,
    moderationNote: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for querying reviews by product
reviewSchema.index({ productId: 1, createdAt: -1 });

// Virtual for helpfulness score
reviewSchema.virtual('helpfulness').get(function () {
    return this.upvotes - this.downvotes;
});

// Virtual for age in weeks
reviewSchema.virtual('ageInWeeks').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
});

// Ensure virtuals are included in JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
