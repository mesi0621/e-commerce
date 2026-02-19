const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');

class TransactionService {
    /**
     * Create transaction record for completed order
     */
    static async createOrderTransaction(order) {
        try {
            // Generate transaction number
            const transactionCount = await Transaction.countDocuments();
            const transactionNumber = `TXN-${Date.now()}-${transactionCount + 1}`;

            // Get product details and calculate commission
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });

                if (product && product.sellerId) {
                    const seller = await SellerProfile.findById(product.sellerId);
                    const commissionRate = seller?.commission || 10;
                    const commission = (item.subtotal * commissionRate) / 100;
                    const netAmount = item.subtotal - commission;

                    // Create transaction for this item
                    const transaction = new Transaction({
                        transactionNumber: `${transactionNumber}-${item.productId}`,
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        sellerId: product.sellerId,
                        customerId: order.userId,
                        type: 'sale',
                        amount: item.subtotal,
                        commission,
                        commissionRate,
                        netAmount,
                        paymentMethod: order.paymentMethod,
                        status: 'completed',
                        description: `Sale of ${item.name} (Qty: ${item.quantity})`,
                        metadata: {
                            productId: item.productId,
                            productName: item.name,
                            quantity: item.quantity,
                            price: item.price
                        }
                    });

                    await transaction.save();
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Create order transaction error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create refund transaction
     */
    static async createRefundTransaction(order, refundAmount) {
        try {
            const transactionCount = await Transaction.countDocuments();
            const transactionNumber = `TXN-REFUND-${Date.now()}-${transactionCount + 1}`;

            const transaction = new Transaction({
                transactionNumber,
                orderId: order._id,
                orderNumber: order.orderNumber,
                customerId: order.userId,
                type: 'refund',
                amount: refundAmount,
                commission: 0,
                commissionRate: 0,
                netAmount: refundAmount,
                paymentMethod: order.paymentMethod,
                status: 'completed',
                description: `Refund for order ${order.orderNumber}`,
                metadata: {
                    originalOrderTotal: order.total,
                    refundReason: order.refundReason
                }
            });

            await transaction.save();

            return { success: true, transaction };
        } catch (error) {
            console.error('Create refund transaction error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get seller transactions
     */
    static async getSellerTransactions(sellerId, startDate, endDate) {
        try {
            const query = { sellerId, type: 'sale', status: 'completed' };

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const transactions = await Transaction.find(query)
                .populate('orderId', 'orderNumber orderStatus')
                .populate('customerId', 'username email')
                .sort({ createdAt: -1 });

            const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
            const totalCommission = transactions.reduce((sum, txn) => sum + txn.commission, 0);
            const totalNet = transactions.reduce((sum, txn) => sum + txn.netAmount, 0);

            return {
                success: true,
                data: {
                    transactions,
                    summary: {
                        count: transactions.length,
                        totalAmount,
                        totalCommission,
                        totalNet
                    }
                }
            };
        } catch (error) {
            console.error('Get seller transactions error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = TransactionService;
