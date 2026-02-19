const Order = require('../models/Order');
const Product = require('../models/Product');
const AuthUser = require('../models/AuthUser');

/**
 * Get advanced analytics data
 * GET /api/admin/analytics
 * Requires admin role
 */
async function getAnalytics(req, res) {
    try {
        const { range = '7days' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;

        switch (range) {
            case '7days':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '90days':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            case '1year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        // Fetch orders in date range
        const orders = await Order.find({
            createdAt: { $gte: startDate }
        });

        // Calculate order stats
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const ordersByStatus = {
            pending: orders.filter(o => o.orderStatus === 'pending').length,
            confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
            shipped: orders.filter(o => o.orderStatus === 'shipped').length,
            delivered: orders.filter(o => o.orderStatus === 'delivered').length
        };

        // Sales data by date
        const salesByDate = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += order.total;
        });

        const salesData = Object.entries(salesByDate)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-7); // Last 7 data points

        // Top selling products
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        name: item.name,
                        sales: 0
                    };
                }
                productSales[item.productId].sales += item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // Revenue by category
        const revenueByCategory = {};
        for (const order of orders) {
            for (const item of order.items) {
                const product = await Product.findOne({ id: item.productId });
                if (product) {
                    const category = product.category || 'Other';
                    if (!revenueByCategory[category]) {
                        revenueByCategory[category] = 0;
                    }
                    revenueByCategory[category] += item.subtotal;
                }
            }
        }

        const revenueByCategoryArray = Object.entries(revenueByCategory)
            .map(([category, revenue]) => ({ category, revenue }))
            .sort((a, b) => b.revenue - a.revenue);

        // Customer stats
        const newCustomers = await AuthUser.countDocuments({
            createdAt: { $gte: startDate }
        });

        res.json({
            success: true,
            data: {
                orderStats: {
                    totalOrders,
                    totalRevenue,
                    averageOrderValue,
                    ...ordersByStatus
                },
                salesData,
                topProducts,
                revenueByCategory: revenueByCategoryArray,
                customerStats: {
                    newCustomers
                }
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching analytics',
            message: error.message
        });
    }
}

/**
 * Get inventory alerts
 * GET /api/admin/inventory/alerts
 * Requires admin role
 */
async function getInventoryAlerts(req, res) {
    try {
        const lowStockThreshold = 10;

        const lowStockProducts = await Product.find({
            stock: { $lte: lowStockThreshold },
            isApproved: true
        }).select('id name stock category new_price');

        const outOfStockProducts = await Product.find({
            stock: 0,
            isApproved: true
        }).select('id name category new_price');

        res.json({
            success: true,
            data: {
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts,
                totalAlerts: lowStockProducts.length + outOfStockProducts.length
            }
        });
    } catch (error) {
        console.error('Get inventory alerts error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching inventory alerts',
            message: error.message
        });
    }
}

/**
 * Export products to CSV
 * GET /api/admin/products/export
 * Requires admin role
 */
async function exportProducts(req, res) {
    try {
        const products = await Product.find({});

        // Create CSV content
        const headers = ['ID', 'Name', 'Category', 'Price', 'Old Price', 'Stock', 'Approved'];
        const rows = products.map(p => [
            p.id,
            p.name,
            p.category,
            p.new_price,
            p.old_price,
            p.stock,
            p.isApproved
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export products error:', error);
        res.status(500).json({
            success: false,
            error: 'Error exporting products',
            message: error.message
        });
    }
}

module.exports = {
    getAnalytics,
    getInventoryAlerts,
    exportProducts
};
