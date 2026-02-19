const Order = require('../models/Order');
const SellerProfile = require('../models/SellerProfile');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const NotificationService = require('../services/NotificationService');

/**
 * Get seller earnings
 * GET /api/financial/seller-earnings
 * Requires admin role
 */
async function getSellerEarnings(req, res) {
    try {
        const { sellerId, startDate, endDate } = req.query;

        const query = { orderStatus: 'delivered', paymentStatus: 'completed' };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query).populate('items.productId');

        const sellerEarnings = {};

        for (const order of orders) {
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });

                if (product && product.sellerId) {
                    const sellerIdStr = product.sellerId.toString();

                    if (!sellerEarnings[sellerIdStr]) {
                        const seller = await SellerProfile.findById(product.sellerId)
                            .populate('userId', 'username email');

                        sellerEarnings[sellerIdStr] = {
                            sellerId: sellerIdStr,
                            businessName: seller?.businessName || 'Unknown',
                            email: seller?.userId?.email || 'N/A',
                            totalSales: 0,
                            commission: seller?.commission || 10,
                            earnings: 0,
                            platformFee: 0,
                            orderCount: 0
                        };
                    }

                    const itemTotal = item.subtotal;
                    const commission = sellerEarnings[sellerIdStr].commission;
                    const platformFee = (itemTotal * commission) / 100;
                    const sellerEarning = itemTotal - platformFee;

                    sellerEarnings[sellerIdStr].totalSales += itemTotal;
                    sellerEarnings[sellerIdStr].earnings += sellerEarning;
                    sellerEarnings[sellerIdStr].platformFee += platformFee;
                    sellerEarnings[sellerIdStr].orderCount += 1;
                }
            }
        }

        const earningsArray = Object.values(sellerEarnings);

        if (sellerId) {
            const filtered = earningsArray.filter(e => e.sellerId === sellerId);
            return res.json({
                success: true,
                data: filtered[0] || null
            });
        }

        res.json({
            success: true,
            data: earningsArray
        });
    } catch (error) {
        console.error('Get seller earnings error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching seller earnings',
            message: error.message
        });
    }
}

/**
 * Get commission summary
 * GET /api/financial/commission
 * Requires admin role
 */
async function getCommissionSummary(req, res) {
    try {
        const { startDate, endDate } = req.query;

        const query = { orderStatus: 'delivered', paymentStatus: 'completed' };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query);

        let totalRevenue = 0;
        let totalCommission = 0;
        let orderCount = 0;

        for (const order of orders) {
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });

                if (product && product.sellerId) {
                    const seller = await SellerProfile.findById(product.sellerId);
                    const commission = seller?.commission || 10;
                    const itemTotal = item.subtotal;
                    const commissionAmount = (itemTotal * commission) / 100;

                    totalRevenue += itemTotal;
                    totalCommission += commissionAmount;
                }
            }
            orderCount++;
        }

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalCommission,
                averageCommissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
                orderCount,
                averageCommissionPerOrder: orderCount > 0 ? totalCommission / orderCount : 0
            }
        });
    } catch (error) {
        console.error('Get commission summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching commission summary',
            message: error.message
        });
    }
}

/**
 * Update seller commission rate
 * PUT /api/financial/seller/:sellerId/commission
 * Requires admin role
 */
async function updateSellerCommission(req, res) {
    try {
        const { sellerId } = req.params;
        const { commission } = req.body;

        if (commission < 0 || commission > 100) {
            return res.status(400).json({
                success: false,
                error: 'Commission must be between 0 and 100'
            });
        }

        const seller = await SellerProfile.findById(sellerId);

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        seller.commission = commission;
        await seller.save();

        res.json({
            success: true,
            message: 'Commission rate updated successfully',
            data: seller
        });
    } catch (error) {
        console.error('Update commission error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating commission',
            message: error.message
        });
    }
}

module.exports = {
    getSellerEarnings,
    getCommissionSummary,
    updateSellerCommission
};


/**
 * Get all transactions with filtering
 * GET /api/finance/transactions
 * Requires finance role
 */
async function getAllTransactions(req, res) {
    try {
        const {
            type,
            status,
            sellerId,
            customerId,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (sellerId) query.sellerId = sellerId;
        if (customerId) query.customerId = customerId;

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('sellerId', 'businessName businessEmail')
                .populate('customerId', 'username email')
                .populate('orderId', 'orderNumber orderStatus')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching transactions',
            message: error.message
        });
    }
}

/**
 * Get sales report
 * GET /api/finance/reports/sales
 * Requires finance role
 */
async function getSalesReport(req, res) {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const query = {
            orderStatus: 'delivered',
            paymentStatus: 'completed'
        };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query).sort({ createdAt: 1 });

        // Calculate totals
        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalItems = 0;
        let totalCommission = 0;

        const salesByDate = {};
        const salesByCategory = {};
        const topProducts = {};

        for (const order of orders) {
            totalRevenue += order.total;
            totalItems += order.items.length;

            // Group by date
            const dateKey = groupBy === 'month'
                ? order.createdAt.toISOString().substring(0, 7)
                : order.createdAt.toISOString().substring(0, 10);

            if (!salesByDate[dateKey]) {
                salesByDate[dateKey] = {
                    date: dateKey,
                    revenue: 0,
                    orders: 0,
                    items: 0
                };
            }

            salesByDate[dateKey].revenue += order.total;
            salesByDate[dateKey].orders += 1;
            salesByDate[dateKey].items += order.items.length;

            // Process items
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });

                if (product) {
                    // Category sales
                    if (!salesByCategory[product.category]) {
                        salesByCategory[product.category] = {
                            category: product.category,
                            revenue: 0,
                            items: 0
                        };
                    }
                    salesByCategory[product.category].revenue += item.subtotal;
                    salesByCategory[product.category].items += item.quantity;

                    // Top products
                    if (!topProducts[item.productId]) {
                        topProducts[item.productId] = {
                            productId: item.productId,
                            name: item.name,
                            revenue: 0,
                            quantity: 0
                        };
                    }
                    topProducts[item.productId].revenue += item.subtotal;
                    topProducts[item.productId].quantity += item.quantity;

                    // Calculate commission
                    if (product.sellerId) {
                        const seller = await SellerProfile.findById(product.sellerId);
                        const commissionRate = seller?.commission || 10;
                        totalCommission += (item.subtotal * commissionRate) / 100;
                    }
                }
            }
        }

        // Sort top products by revenue
        const topProductsArray = Object.values(topProducts)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        res.json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    totalItems,
                    totalCommission,
                    netRevenue: totalRevenue - totalCommission,
                    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
                },
                salesByDate: Object.values(salesByDate),
                salesByCategory: Object.values(salesByCategory),
                topProducts: topProductsArray
            }
        });
    } catch (error) {
        console.error('Get sales report error:', error);
        res.status(500).json({
            success: false,
            error: 'Error generating sales report',
            message: error.message
        });
    }
}

/**
 * Get commission report
 * GET /api/finance/reports/commissions
 * Requires finance role
 */
async function getCommissionReport(req, res) {
    try {
        const { startDate, endDate, sellerId } = req.query;

        const query = {
            orderStatus: 'delivered',
            paymentStatus: 'completed'
        };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query);

        const sellerCommissions = {};
        let totalPlatformCommission = 0;
        let totalSellerEarnings = 0;
        let totalRevenue = 0;

        for (const order of orders) {
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });

                if (product && product.sellerId) {
                    const sellerIdStr = product.sellerId.toString();

                    if (sellerId && sellerIdStr !== sellerId) {
                        continue;
                    }

                    if (!sellerCommissions[sellerIdStr]) {
                        const seller = await SellerProfile.findById(product.sellerId)
                            .populate('userId', 'username email');

                        sellerCommissions[sellerIdStr] = {
                            sellerId: sellerIdStr,
                            businessName: seller?.businessName || 'Unknown',
                            email: seller?.userId?.email || 'N/A',
                            commissionRate: seller?.commission || 10,
                            totalSales: 0,
                            platformCommission: 0,
                            sellerEarnings: 0,
                            orderCount: 0,
                            itemCount: 0
                        };
                    }

                    const itemTotal = item.subtotal;
                    const commissionRate = sellerCommissions[sellerIdStr].commissionRate;
                    const platformCommission = (itemTotal * commissionRate) / 100;
                    const sellerEarning = itemTotal - platformCommission;

                    sellerCommissions[sellerIdStr].totalSales += itemTotal;
                    sellerCommissions[sellerIdStr].platformCommission += platformCommission;
                    sellerCommissions[sellerIdStr].sellerEarnings += sellerEarning;
                    sellerCommissions[sellerIdStr].orderCount += 1;
                    sellerCommissions[sellerIdStr].itemCount += item.quantity;

                    totalPlatformCommission += platformCommission;
                    totalSellerEarnings += sellerEarning;
                    totalRevenue += itemTotal;
                }
            }
        }

        const commissionsArray = Object.values(sellerCommissions)
            .sort((a, b) => b.platformCommission - a.platformCommission);

        res.json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalPlatformCommission,
                    totalSellerEarnings,
                    averageCommissionRate: totalRevenue > 0 ? (totalPlatformCommission / totalRevenue) * 100 : 0,
                    sellerCount: commissionsArray.length
                },
                sellers: commissionsArray
            }
        });
    } catch (error) {
        console.error('Get commission report error:', error);
        res.status(500).json({
            success: false,
            error: 'Error generating commission report',
            message: error.message
        });
    }
}

/**
 * Get seller balance (pending payout)
 * GET /api/finance/seller/:sellerId/balance
 * Requires finance role
 */
async function getSellerBalance(req, res) {
    try {
        const { sellerId } = req.params;

        const seller = await SellerProfile.findById(sellerId)
            .populate('userId', 'username email');

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        // Get completed orders for this seller
        const orders = await Order.find({
            orderStatus: 'delivered',
            paymentStatus: 'completed'
        });

        let totalEarnings = 0;
        let pendingPayout = 0;
        let orderCount = 0;

        for (const order of orders) {
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });

                if (product && product.sellerId && product.sellerId.toString() === sellerId) {
                    const itemTotal = item.subtotal;
                    const commissionRate = seller.commission || 10;
                    const platformCommission = (itemTotal * commissionRate) / 100;
                    const sellerEarning = itemTotal - platformCommission;

                    totalEarnings += sellerEarning;
                    orderCount++;
                }
            }
        }

        // Get total paid out
        const payouts = await Payout.find({
            sellerId,
            status: 'completed'
        });

        const totalPaidOut = payouts.reduce((sum, payout) => sum + payout.amount, 0);
        pendingPayout = totalEarnings - totalPaidOut;

        res.json({
            success: true,
            data: {
                sellerId,
                businessName: seller.businessName,
                email: seller.userId?.email,
                totalEarnings,
                totalPaidOut,
                pendingPayout,
                orderCount,
                commissionRate: seller.commission,
                lastPayoutDate: payouts.length > 0 ? payouts[payouts.length - 1].processedAt : null
            }
        });
    } catch (error) {
        console.error('Get seller balance error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching seller balance',
            message: error.message
        });
    }
}

/**
 * Process seller payout
 * POST /api/finance/payouts
 * Requires finance role
 */
async function processPayout(req, res) {
    try {
        const { sellerId, amount, paymentMethod, notes } = req.body;
        const financeStaffId = req.user.userId;

        // Validate seller
        const seller = await SellerProfile.findById(sellerId)
            .populate('userId', 'username email');

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payout amount'
            });
        }

        // Check seller balance
        const balanceResponse = await getSellerBalance({ params: { sellerId } }, {
            json: (data) => data
        });

        // Generate payout number
        const payoutCount = await Payout.countDocuments();
        const payoutNumber = `PO-${Date.now()}-${payoutCount + 1}`;

        // Create payout record
        const payout = new Payout({
            payoutNumber,
            sellerId,
            amount,
            paymentMethod: paymentMethod || 'bank_transfer',
            bankAccount: seller.bankAccount,
            status: 'processing',
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            periodEnd: new Date(),
            processedBy: financeStaffId,
            processedAt: new Date(),
            notes
        });

        await payout.save();

        // Send notification to seller
        await NotificationService.createNotification(
            seller.userId._id,
            'payout_processed',
            `Payout of ${amount} ETB has been processed`,
            { payoutId: payout._id, amount, payoutNumber }
        );

        res.json({
            success: true,
            message: 'Payout processed successfully',
            data: payout
        });
    } catch (error) {
        console.error('Process payout error:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing payout',
            message: error.message
        });
    }
}

/**
 * Get all payouts
 * GET /api/finance/payouts
 * Requires finance role
 */
async function getAllPayouts(req, res) {
    try {
        const {
            status,
            sellerId,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (sellerId) query.sellerId = sellerId;

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [payouts, total] = await Promise.all([
            Payout.find(query)
                .populate('sellerId', 'businessName businessEmail')
                .populate('processedBy', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Payout.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: payouts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching payouts',
            message: error.message
        });
    }
}

/**
 * Update payout status
 * PUT /api/finance/payouts/:payoutId/status
 * Requires finance role
 */
async function updatePayoutStatus(req, res) {
    try {
        const { payoutId } = req.params;
        const { status, failureReason, transactionReference } = req.body;
        const financeStaffId = req.user.userId;

        const payout = await Payout.findById(payoutId)
            .populate('sellerId');

        if (!payout) {
            return res.status(404).json({
                success: false,
                error: 'Payout not found'
            });
        }

        payout.status = status;

        if (status === 'completed') {
            payout.processedAt = new Date();
            payout.processedBy = financeStaffId;
            if (transactionReference) {
                payout.metadata = {
                    ...payout.metadata,
                    transactionReference
                };
            }

            // Notify seller
            await NotificationService.createNotification(
                payout.sellerId.userId,
                'payout_completed',
                `Your payout of ${payout.amount} ETB has been completed`,
                { payoutId: payout._id, amount: payout.amount }
            );
        } else if (status === 'failed') {
            payout.failureReason = failureReason;

            // Notify seller
            await NotificationService.createNotification(
                payout.sellerId.userId,
                'payout_failed',
                `Your payout of ${payout.amount} ETB has failed`,
                { payoutId: payout._id, reason: failureReason }
            );
        }

        await payout.save();

        res.json({
            success: true,
            message: 'Payout status updated successfully',
            data: payout
        });
    } catch (error) {
        console.error('Update payout status error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating payout status',
            message: error.message
        });
    }
}

/**
 * Get financial statistics
 * GET /api/finance/statistics
 * Requires finance role
 */
async function getFinancialStatistics(req, res) {
    try {
        const { startDate, endDate } = req.query;

        const dateQuery = {};
        if (startDate && endDate) {
            dateQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get order statistics
        const [
            totalOrders,
            completedOrders,
            pendingOrders,
            totalRevenue,
            pendingPayouts,
            completedPayouts
        ] = await Promise.all([
            Order.countDocuments({ ...dateQuery }),
            Order.countDocuments({ ...dateQuery, orderStatus: 'delivered', paymentStatus: 'completed' }),
            Order.countDocuments({ ...dateQuery, orderStatus: { $in: ['pending', 'confirmed', 'processing'] } }),
            Order.aggregate([
                { $match: { ...dateQuery, orderStatus: 'delivered', paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Payout.countDocuments({ ...dateQuery, status: 'pending' }),
            Payout.countDocuments({ ...dateQuery, status: 'completed' })
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Calculate commission
        const orders = await Order.find({
            ...dateQuery,
            orderStatus: 'delivered',
            paymentStatus: 'completed'
        });

        let totalCommission = 0;
        for (const order of orders) {
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });
                if (product && product.sellerId) {
                    const seller = await SellerProfile.findById(product.sellerId);
                    const commissionRate = seller?.commission || 10;
                    totalCommission += (item.subtotal * commissionRate) / 100;
                }
            }
        }

        res.json({
            success: true,
            data: {
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    pending: pendingOrders
                },
                revenue: {
                    total: revenue,
                    commission: totalCommission,
                    net: revenue - totalCommission
                },
                payouts: {
                    pending: pendingPayouts,
                    completed: completedPayouts
                }
            }
        });
    } catch (error) {
        console.error('Get financial statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching financial statistics',
            message: error.message
        });
    }
}

module.exports = {
    getSellerEarnings,
    getCommissionSummary,
    updateSellerCommission,
    getAllTransactions,
    getSalesReport,
    getCommissionReport,
    getSellerBalance,
    processPayout,
    getAllPayouts,
    updatePayoutStatus,
    getFinancialStatistics
};
