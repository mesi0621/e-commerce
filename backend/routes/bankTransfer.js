const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const Order = require('../models/Order');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

/**
 * Upload bank transfer receipt
 * POST /api/payments/bank-transfer/upload-receipt
 * Requires authentication
 */
router.post('/upload-receipt', verifyToken, upload.single('receipt'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({
                success: false,
                error: req.fileValidationError
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { orderId, referenceCode } = req.body;

        if (!orderId || !referenceCode) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and reference code are required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            // Delete uploaded file if order not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Verify order belongs to user
        if (order.userId.toString() !== req.user.userId) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Update order with receipt information
        order.paymentDetails = {
            ...order.paymentDetails,
            receiptPath: req.file.path,
            receiptFilename: req.file.filename,
            referenceCode: referenceCode,
            uploadedAt: new Date()
        };

        // Set payment status to pending verification
        order.paymentStatus = 'pending';
        order.statusHistory.push({
            status: 'pending',
            timestamp: new Date(),
            note: 'Bank transfer receipt uploaded, awaiting admin verification'
        });

        await order.save();

        res.json({
            success: true,
            message: 'Receipt uploaded successfully',
            data: {
                orderId: order._id,
                receiptFilename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Upload receipt error:', error);

        // Delete uploaded file if there was an error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            error: 'Error uploading receipt',
            message: error.message
        });
    }
});

/**
 * Get receipt image
 * GET /api/payments/bank-transfer/receipt/:filename
 * Requires authentication
 */
router.get('/receipt/:filename', verifyToken, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found'
            });
        }

        // Find order with this receipt to verify access
        const order = await Order.findOne({
            'paymentDetails.receiptFilename': filename
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user has access (owner or admin)
        if (order.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Send file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({
            success: false,
            error: 'Error retrieving receipt'
        });
    }
});

/**
 * Verify bank transfer payment (Admin only)
 * POST /api/payments/bank-transfer/verify/:orderId
 * Requires admin role
 */
router.post('/verify/:orderId', verifyToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin only.'
            });
        }

        const { orderId } = req.params;
        const { verified, notes } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.paymentMethod !== 'bank_transfer') {
            return res.status(400).json({
                success: false,
                error: 'This order is not a bank transfer payment'
            });
        }

        if (verified) {
            // Payment verified - mark as completed
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: new Date(),
                note: `Bank transfer verified by admin. ${notes || ''}`
            });

            // Send confirmation email
            const OrderController = require('../controllers/OrderController');
            await OrderController.confirmPayment({
                params: { orderId: order._id },
                body: {
                    transactionId: order.paymentDetails.referenceCode,
                    paymentGatewayResponse: {
                        method: 'bank_transfer',
                        verified: true,
                        verifiedBy: req.user.userId,
                        verifiedAt: new Date()
                    }
                }
            }, {
                json: () => { },
                status: () => ({ json: () => { } })
            });
        } else {
            // Payment rejected
            order.paymentStatus = 'failed';
            order.statusHistory.push({
                status: 'failed',
                timestamp: new Date(),
                note: `Bank transfer rejected by admin. ${notes || ''}`
            });
        }

        await order.save();

        res.json({
            success: true,
            message: verified ? 'Payment verified successfully' : 'Payment rejected',
            data: order
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Error verifying payment',
            message: error.message
        });
    }
});

module.exports = router;
