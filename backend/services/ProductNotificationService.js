const EmailService = require('./EmailService');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

class ProductNotificationService {

    // Notify admin when seller submits new product
    async notifyAdminOfNewProduct(product, sellerId) {
        try {
            // Get admin user
            const admin = await User.findOne({ role: 'admin' });
            if (!admin) {
                console.log('⚠️ No admin user found for product notification');
                return;
            }

            // Get seller info
            const seller = await User.findById(sellerId);
            const sellerProfile = await SellerProfile.findOne({ userId: sellerId });

            const sellerInfo = {
                businessName: sellerProfile?.businessName || seller?.name || 'Unknown Seller',
                email: seller?.email || 'Unknown Email'
            };

            await EmailService.sendProductSubmissionEmail(admin.email, product, sellerInfo);
            console.log(`✅ Product submission notification sent to admin: ${admin.email}`);

        } catch (error) {
            console.error('❌ Error sending product submission notification:', error.message);
        }
    }

    // Notify seller when product is approved
    async notifySellerOfApproval(product, sellerId) {
        try {
            const seller = await User.findById(sellerId);
            if (!seller) {
                console.log('⚠️ Seller not found for approval notification');
                return;
            }

            await EmailService.sendProductApprovedEmail(seller.email, product, seller.name);
            console.log(`✅ Product approval notification sent to seller: ${seller.email}`);

        } catch (error) {
            console.error('❌ Error sending product approval notification:', error.message);
        }
    }

    // Notify seller when product is rejected
    async notifySellerOfRejection(product, sellerId, reason) {
        try {
            const seller = await User.findById(sellerId);
            if (!seller) {
                console.log('⚠️ Seller not found for rejection notification');
                return;
            }

            await EmailService.sendProductRejectedEmail(seller.email, product, seller.name, reason);
            console.log(`✅ Product rejection notification sent to seller: ${seller.email}`);

        } catch (error) {
            console.error('❌ Error sending product rejection notification:', error.message);
        }
    }

    // Notify seller of low stock
    async notifySellerOfLowStock(product, sellerId, currentStock) {
        try {
            const seller = await User.findById(sellerId);
            if (!seller) {
                console.log('⚠️ Seller not found for low stock notification');
                return;
            }

            await EmailService.sendLowStockAlert(seller.email, product, seller.name, currentStock);
            console.log(`✅ Low stock alert sent to seller: ${seller.email}`);

        } catch (error) {
            console.error('❌ Error sending low stock alert:', error.message);
        }
    }

    // Notify customers when product is back in stock
    async notifyCustomersOfRestock(product, interestedCustomerIds) {
        try {
            const customers = await User.find({
                _id: { $in: interestedCustomerIds },
                role: 'customer'
            });

            for (const customer of customers) {
                try {
                    await EmailService.sendBackInStockEmail(customer.email, product, customer.name);
                    console.log(`✅ Back in stock notification sent to: ${customer.email}`);
                } catch (error) {
                    console.error(`❌ Failed to send restock notification to ${customer.email}:`, error.message);
                }
            }

        } catch (error) {
            console.error('❌ Error sending restock notifications:', error.message);
        }
    }

    // Notify customers of new product launch
    async notifyCustomersOfNewProduct(product, targetCustomerIds = null) {
        try {
            let customers;

            if (targetCustomerIds) {
                // Notify specific customers
                customers = await User.find({
                    _id: { $in: targetCustomerIds },
                    role: 'customer'
                });
            } else {
                // Notify all customers (limit to prevent spam)
                customers = await User.find({ role: 'customer' }).limit(100);
            }

            for (const customer of customers) {
                try {
                    await EmailService.sendNewProductLaunchEmail(customer.email, product, customer.name);
                    console.log(`✅ New product notification sent to: ${customer.email}`);
                } catch (error) {
                    console.error(`❌ Failed to send new product notification to ${customer.email}:`, error.message);
                }
            }

        } catch (error) {
            console.error('❌ Error sending new product notifications:', error.message);
        }
    }

    // Check stock levels and send alerts if needed
    async checkStockLevels() {
        try {
            const Product = require('../models/Product');
            const lowStockProducts = await Product.find({
                available: true,
                $expr: { $lte: ['$stock', 5] } // Products with 5 or fewer items
            }).populate('sellerId');

            for (const product of lowStockProducts) {
                if (product.sellerId) {
                    await this.notifySellerOfLowStock(product, product.sellerId._id, product.stock);
                }
            }

            console.log(`✅ Stock level check completed. Found ${lowStockProducts.length} low stock products`);

        } catch (error) {
            console.error('❌ Error checking stock levels:', error.message);
        }
    }

    // Send daily/weekly product summary to admin
    async sendProductSummaryToAdmin(period = 'daily') {
        try {
            const Product = require('../models/Product');
            const admin = await User.findOne({ role: 'admin' });

            if (!admin) {
                console.log('⚠️ No admin user found for product summary');
                return;
            }

            const now = new Date();
            const startDate = new Date();

            if (period === 'daily') {
                startDate.setDate(now.getDate() - 1);
            } else {
                startDate.setDate(now.getDate() - 7);
            }

            const newProducts = await Product.countDocuments({
                createdAt: { $gte: startDate }
            });

            const pendingProducts = await Product.countDocuments({
                approved: false
            });

            const lowStockProducts = await Product.countDocuments({
                available: true,
                $expr: { $lte: ['$stock', 5] }
            });

            const subject = `${period.charAt(0).toUpperCase() + period.slice(1)} Product Summary - Modo`;
            const text = `Product Summary for ${period}:\n\nNew Products: ${newProducts}\nPending Approval: ${pendingProducts}\nLow Stock Alerts: ${lowStockProducts}\n\nBest regards,\nThe Modo Team`;

            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #ff4141; margin: 0;">Modo</h1>
                    </div>
                    
                    <h2 style="color: #333;">${period.charAt(0).toUpperCase() + period.slice(1)} Product Summary</h2>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; font-weight: bold;">New Products:</td>
                                <td style="padding: 10px 0; color: #28a745; font-weight: bold;">${newProducts}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: bold;">Pending Approval:</td>
                                <td style="padding: 10px 0; color: #ffc107; font-weight: bold;">${pendingProducts}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: bold;">Low Stock Alerts:</td>
                                <td style="padding: 10px 0; color: #dc3545; font-weight: bold;">${lowStockProducts}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-v2" 
                           style="display: inline-block; padding: 15px 30px; background: #ff4141; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            View Admin Dashboard
                        </a>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        Best regards,<br>
                        The Modo Team
                    </p>
                </div>
            `;

            await EmailService.sendEmail(admin.email, subject, text, html);
            console.log(`✅ ${period} product summary sent to admin: ${admin.email}`);

        } catch (error) {
            console.error(`❌ Error sending ${period} product summary:`, error.message);
        }
    }
}

module.exports = new ProductNotificationService();