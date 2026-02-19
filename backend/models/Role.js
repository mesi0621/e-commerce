const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        enum: ['admin', 'seller', 'customer', 'delivery', 'support', 'finance', 'guest']
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        required: true
    }],
    isSystem: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
roleSchema.index({ name: 1 });

// Prevent deletion of system roles
roleSchema.pre('remove', function (next) {
    if (this.isSystem) {
        next(new Error('Cannot delete system role'));
    } else {
        next();
    }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
