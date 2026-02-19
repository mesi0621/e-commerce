const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    resource: {
        type: String,
        required: true,
        trim: true
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'read', 'update', 'delete', 'manage', 'approve']
    },
    scope: {
        type: String,
        enum: ['own', 'all', 'assigned'],
        default: 'all'
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Indexes
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 });

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
