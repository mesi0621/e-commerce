const Order = require('../models/Order');
const PaymentMethod = require('../models/PaymentMethod');
const ChapaService = require('../services/ChapaService');
const PayPalService = require('../services/PayPalService');
const TelebirrService = require('../services/TelebirrService');
const CBEBirrService = require('../services/CBEBirrService');

/**
 * Process Chapa payment
 */
async function processChapa(order, paymentDetails, user) {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        const result = await ChapaService.initializePayment({
            amount: order.total,
            email: user.email || paymentDetails.email,
            firstName: user.username || paymentDetails.firstName,
            lastName: paymentDetails.lastName || 'Customer',
            phoneNumber: paymentDetails.phoneNumber,
            txRef: `ORDER-${order.orderNumber}-${Date.now()}`,
            callbackUrl: `${baseUrl}/api/payments/chapa/callback`,
            returnUrl: `${baseUrl}/api/payments/chapa/return`
        });

        if (!result.success) {
            return {
                success: false,
                error: result.error
            };
        }

        return {
            success: true,
            status: 'pending',
            transactionId: result.data.tx_ref,
            paymentUrl: result.data.data.checkout_url,
            response: result.data
        };
    } catch (error) {
        console.error('Chapa payment error:', error);
        return {
            success: false,
            error: 'Failed to process Chapa payment'
        };
    }
}

/**
 * Process PayPal payment
 */
async function processPayPal(order, paymentDetails) {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        const result = await PayPalService.createOrder({
            amount: order.total,
            currency: 'USD',
            returnUrl: `${baseUrl}/payment/success`,
            cancelUrl: `${baseUrl}/payment/cancel`,
            orderId: order.orderNumber
        });

        if (!result.success) {
            return {
                success: false,
                error: result.error
            };
        }

        return {
            success: true,
            status: 'pending',
            transactionId: result.orderId,
            approvalUrl: result.approvalUrl,
            response: result.data
        };
    } catch (error) {
        console.error('PayPal payment error:', error);
        return {
            success: false,
            error: 'Failed to process PayPal payment'
        };
    }
}

/**
 * Process Telebirr payment
 */
async function processTelebirr(order, paymentDetails, user) {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        const result = await TelebirrService.initializePayment({
            amount: order.total,
            orderId: order.orderNumber,
            phoneNumber: paymentDetails.phoneNumber || user.phone,
            notifyUrl: `${baseUrl}/api/payments/telebirr/notify`,
            returnUrl: `${baseUrl}/api/payments/telebirr/return`
        });

        if (!result.success) {
            return {
                success: false,
                error: result.error
            };
        }

        return {
            success: true,
            status: 'pending',
            transactionId: result.prepayId,
            paymentUrl: result.paymentUrl,
            response: result.data
        };
    } catch (error) {
        console.error('Telebirr payment error:', error);
        return {
            success: false,
            error: 'Failed to process Telebirr payment'
        };
    }
}

/**
 * Process CBE (Commercial Bank of Ethiopia) payment
 */
async function processCBE(order, paymentDetails, user) {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        const result = await CBEBirrService.initializePayment({
            amount: order.total,
            orderId: order.orderNumber,
            customerName: user.username || paymentDetails.customerName,
            customerPhone: paymentDetails.phoneNumber || user.phone,
            callbackUrl: `${baseUrl}/api/payments/cbe/callback`,
            returnUrl: `${baseUrl}/api/payments/cbe/return`
        });

        if (!result.success) {
            return {
                success: false,
                error: result.error
            };
        }

        return {
            success: true,
            status: 'pending',
            transactionId: result.transactionId,
            paymentUrl: result.paymentUrl,
            response: result.data
        };
    } catch (error) {
        console.error('CBE payment error:', error);
        return {
            success: false,
            error: 'Failed to process CBE payment'
        };
    }
}

/**
 * Process Cash on Delivery
 */
async function processCashOnDelivery(order) {
    return {
        success: true,
        status: 'completed',
        transactionId: `COD-${Date.now()}`,
        response: {
            method: 'cash_on_delivery',
            amount: order.total,
            currency: 'ETB',
            note: 'Payment will be collected upon delivery'
        }
    };
}

/**
 * Process Bank Transfer
 */
async function processBankTransfer(order, paymentDetails) {
    return {
        success: true,
        status: 'completed',
        transactionId: `BT-${Date.now()}`,
        response: {
            method: 'bank_transfer',
            amount: order.total,
            currency: 'ETB',
            referenceNumber: paymentDetails?.referenceNumber || `REF-${Date.now()}`,
            ...paymentDetails
        }
    };
}

/**
 * Get available payment methods
 * GET /api/payments/methods
 */
async function getPaymentMethods(req, res) {
    try {
        const methods = await PaymentMethod.find({ isActive: true })
            .select('-configuration.apiKey -configuration.secretKey')
            .sort({ displayName: 1 });

        res.json({
            success: true,
            data: methods
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching payment methods',
            message: error.message
        });
    }
}

/**
 * Process payment
 * POST /api/payments/process
 * Requires authentication
 */
async function processPayment(req, res) {
    try {
        const { orderId, paymentMethod, paymentDetails } = req.body;

        console.log('💳 Payment processing request:', { orderId, paymentMethod, paymentDetails });

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        console.log('📋 Order payment method:', order.paymentMethod, 'vs requested:', paymentMethod);

        // Check ownership
        if (order.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Check if already paid
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Order already paid'
            });
        }

        // Process payment based on method
        let paymentResult;
        console.log('🔄 Processing payment method:', paymentMethod);
        switch (paymentMethod) {
            case 'chapa':
                paymentResult = await processChapa(order, paymentDetails, req.user);
                break;
            case 'paypal':
                paymentResult = await processPayPal(order, paymentDetails);
                break;
            case 'telebirr':
                paymentResult = await processTelebirr(order, paymentDetails, req.user);
                break;
            case 'cbe':
                paymentResult = await processCBE(order, paymentDetails, req.user);
                break;
            case 'cash_on_delivery':
                paymentResult = await processCashOnDelivery(order);
                break;
            case 'bank_transfer':
                paymentResult = await processBankTransfer(order, paymentDetails);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid payment method'
                });
        }

        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                error: paymentResult.error
            });
        }

        // Update order payment status
        order.paymentStatus = paymentResult.status;
        order.paymentDetails = {
            transactionId: paymentResult.transactionId,
            paymentDate: Date.now(),
            paymentGatewayResponse: paymentResult.response
        };

        // If payment completed immediately (Cash on Delivery, etc.)
        if (paymentResult.status === 'completed') {
            // Call confirmPayment to complete the order flow
            const OrderController = require('./OrderController');
            await OrderController.confirmPayment({
                params: { orderId: order._id },
                body: {
                    transactionId: paymentResult.transactionId,
                    paymentGatewayResponse: paymentResult.response
                }
            }, {
                json: () => { }, // Mock response object
                status: () => ({ json: () => { } })
            });

            order.orderStatus = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: Date.now(),
                note: 'Payment completed and order confirmed'
            });
        }

        await order.save();

        res.json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                order,
                payment: paymentResult
            }
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing payment',
            message: error.message
        });
    }
}

module.exports = {
    getPaymentMethods,
    processPayment,
    processChapa,
    processPayPal,
    processTelebirr,
    processCBE,
    processCashOnDelivery,
    processBankTransfer
};

/**
 * Verify payment status
 * GET /api/payments/:orderId/status
 * Requires authentication
 */
async function getPaymentStatus(req, res) {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check ownership
        if (order.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                total: order.total,
                paymentDetails: order.paymentDetails
            }
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching payment status',
            message: error.message
        });
    }
}

/**
 * Create/Update payment method (Admin only)
 * POST /api/payments/admin/methods
 * Requires admin role
 */
async function createPaymentMethod(req, res) {
    try {
        const paymentMethod = new PaymentMethod(req.body);
        await paymentMethod.save();

        res.status(201).json({
            success: true,
            message: 'Payment method created successfully',
            data: paymentMethod
        });
    } catch (error) {
        console.error('Create payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating payment method',
            message: error.message
        });
    }
}

/**
 * Update payment method (Admin only)
 * PUT /api/payments/admin/methods/:methodId
 * Requires admin role
 */
async function updatePaymentMethod(req, res) {
    try {
        const { methodId } = req.params;

        const paymentMethod = await PaymentMethod.findByIdAndUpdate(
            methodId,
            req.body,
            { new: true }
        );

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                error: 'Payment method not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment method updated successfully',
            data: paymentMethod
        });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating payment method',
            message: error.message
        });
    }
}

/**
 * Chapa webhook callback
 * POST /api/payments/chapa/callback
 */
async function chapaCallback(req, res) {
    try {
        const signature = req.headers['x-chapa-signature'];

        if (!ChapaService.verifyWebhookSignature(signature, req.body)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        const { tx_ref, status } = req.body;

        // Find order by transaction reference
        const order = await Order.findOne({
            'paymentDetails.transactionId': tx_ref
        });

        if (order && status === 'success') {
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: Date.now(),
                note: 'Payment confirmed via Chapa webhook'
            });
            await order.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Chapa callback error:', error);
        res.status(500).json({ success: false });
    }
}

/**
 * Verify Chapa payment
 * GET /api/payments/chapa/verify/:txRef
 */
async function verifyChapaPayment(req, res) {
    try {
        const { txRef } = req.params;

        const result = await ChapaService.verifyPayment(txRef);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Update order if payment successful
        if (result.data.status === 'success') {
            const order = await Order.findOne({
                'paymentDetails.transactionId': txRef
            });

            if (order) {
                order.paymentStatus = 'completed';
                order.orderStatus = 'confirmed';
                order.statusHistory.push({
                    status: 'confirmed',
                    timestamp: Date.now(),
                    note: 'Payment verified via Chapa'
                });
                await order.save();
            }
        }

        res.json(result);
    } catch (error) {
        console.error('Verify Chapa payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Error verifying payment'
        });
    }
}

/**
 * PayPal capture payment
 * POST /api/payments/paypal/capture/:orderId
 */
async function capturePayPalPayment(req, res) {
    try {
        const { orderId } = req.params;

        const result = await PayPalService.capturePayment(orderId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Update order
        const order = await Order.findOne({
            'paymentDetails.transactionId': orderId
        });

        if (order && result.status === 'COMPLETED') {
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            order.paymentDetails.captureId = result.captureId;
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: Date.now(),
                note: 'Payment captured via PayPal'
            });
            await order.save();
        }

        res.json(result);
    } catch (error) {
        console.error('Capture PayPal payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Error capturing payment'
        });
    }
}

/**
 * Telebirr notification handler
 * POST /api/payments/telebirr/notify
 */
async function telebirrNotify(req, res) {
    try {
        if (!TelebirrService.verifyNotification(req.body)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        const { merOrderId, tradeStatus } = req.body;

        const order = await Order.findOne({ orderNumber: merOrderId });

        if (order && tradeStatus === 'SUCCESS') {
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: Date.now(),
                note: 'Payment confirmed via Telebirr'
            });
            await order.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Telebirr notify error:', error);
        res.status(500).json({ success: false });
    }
}

/**
 * CBE Birr callback handler
 * POST /api/payments/cbe/callback
 */
async function cbeCallback(req, res) {
    try {
        const signature = req.headers['x-signature'];

        if (!CBEBirrService.verifyCallback(req.body, signature)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        const { orderId, status } = req.body;

        const order = await Order.findOne({ orderNumber: orderId });

        if (order && status === 'SUCCESS') {
            order.paymentStatus = 'completed';
            order.orderStatus = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: Date.now(),
                note: 'Payment confirmed via CBE Birr'
            });
            await order.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('CBE callback error:', error);
        res.status(500).json({ success: false });
    }
}

module.exports = {
    getPaymentMethods,
    processPayment,
    getPaymentStatus,
    createPaymentMethod,
    updatePaymentMethod,
    chapaCallback,
    verifyChapaPayment,
    capturePayPalPayment,
    telebirrNotify,
    cbeCallback
};
