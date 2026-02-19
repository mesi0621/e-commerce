const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // For development: Use ethereal email (fake SMTP service)
            // For production: Use real SMTP service (Gmail, SendGrid, etc.)

            if (process.env.EMAIL_SERVICE === 'gmail') {
                // Gmail configuration
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
                console.log('✅ Email Service: Gmail configured');
            } else if (process.env.EMAIL_SERVICE === 'smtp' || process.env.SMTP_HOST) {
                // Custom SMTP configuration
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER || process.env.SMTP_USER,
                        pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD
                    }
                });
                console.log('✅ Email Service: SMTP configured');
            } else {
                // Development mode: Log emails to console
                console.log('📧 Email Service: Running in DEVELOPMENT mode (emails logged to console)');
                this.transporter = {
                    sendMail: async (mailOptions) => {
                        console.log('\n📧 ===== EMAIL SENT =====');
                        console.log('To:', mailOptions.to);
                        console.log('Subject:', mailOptions.subject);
                        console.log('Content:', mailOptions.text || mailOptions.html);
                        console.log('========================\n');
                        return { messageId: 'dev-' + Date.now() };
                    }
                };
            }

            this.initialized = true;
            console.log('✅ Email Service initialized');
        } catch (error) {
            console.error('❌ Email Service initialization failed:', error.message);
            this.initialized = false;
        }
    }

    async sendEmail(to, subject, text, html) {
        if (!this.initialized) {
            console.warn('⚠️ Email Service not initialized, skipping email');
            return null;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'Modo <noreply@modo.com>',
                to,
                subject,
                text,
                html: html || text
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Error sending email:', error.message);
            throw error;
        }
    }

    // Welcome email when user registers
    async sendWelcomeEmail(userEmail, username) {
        const subject = 'Welcome to Modo!';
        const text = `Hi ${username},\n\nWelcome to Modo! We're excited to have you on board.\n\nStart shopping now and discover amazing products.\n\nBest regards,\nThe Modo Team`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff4141;">Welcome to Modo!</h2>
                <p>Hi ${username},</p>
                <p>Welcome to Modo! We're excited to have you on board.</p>
                <p>Start shopping now and discover amazing products.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                   style="display: inline-block; padding: 12px 24px; background: #ff4141; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Start Shopping
                </a>
                <p style="color: #666; font-size: 14px;">Best regards,<br>The Modo Team</p>
            </div>
        `;

        return this.sendEmail(userEmail, subject, text, html);
    }

    // Password reset email
    async sendPasswordResetEmail(userEmail, username, resetUrl, resetToken) {
        const subject = 'Password Reset Request - Modo';
        const text = `Hi ${username},\n\nYou requested to reset your password for your Modo account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email. Your password will remain unchanged.\n\nBest regards,\nThe Modo Team`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #ff4141; margin: 0;">Modo</h1>
                </div>
                
                <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                
                <p>Hi ${username},</p>
                <p>You requested to reset your password for your Modo account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 15px 30px; background: #ff4141; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Reset Your Password
                    </a>
                </div>

                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;">
                        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
                    </p>
                </div>

                <p style="color: #666; font-size: 14px;">
                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>

                <p style="color: #666; font-size: 14px;">
                    Best regards,<br>
                    The Modo Team
                </p>
            </div>
        `;

        return this.sendEmail(userEmail, subject, text, html);
    }

    /**
     * COMPREHENSIVE PURCHASE NOTIFICATIONS
     * Send real email notifications to all three roles (Customer, Admin, Seller)
     */

    /**
     * Send comprehensive purchase notifications to all relevant parties
     * @param {Object} order - Order object
     * @param {Object} customer - Customer user object
     * @param {Object} admin - Admin user object
     * @param {Array} sellers - Array of seller objects involved in the order
     */
    async sendPurchaseNotifications(order, customer, admin, sellers) {
        try {
            console.log('📧 Sending purchase notifications to all parties...');

            // 1. Send order confirmation to customer
            await this.sendOrderConfirmationEmail(customer.email, order);
            console.log('✅ Order confirmation sent to customer:', customer.email);

            // 2. Send new order notification to admin
            await this.sendNewOrderNotificationToAdmin(admin.email, order, customer);
            console.log('✅ New order notification sent to admin:', admin.email);

            // 3. Send order notifications to all sellers involved
            for (const seller of sellers) {
                await this.sendNewOrderNotificationToSeller(seller.email, order, customer, seller);
                console.log('✅ New order notification sent to seller:', seller.email);
            }

            console.log('🎉 All purchase notifications sent successfully!');
        } catch (error) {
            console.error('❌ Error sending purchase notifications:', error);
        }
    }

    /**
nd order confirmation email to customer
     */
    async sendOrderConfirmationEmail(customerEmail, order) {
        const subject = `✅ Order Confirmation - ${order.orderNumber}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">Modo E-Commerce</h1>
                        <h2 style="color: #27ae60; margin: 10px 0;">✅ Order Confirmed!</h2>
                    </div>

                    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #155724; margin: 0 0 10px 0;">Thank you for your order!</h3>
                        <p style="margin: 0; color: #155724;">Your order has been confirmed and is being processed.</p>
                    </div>

                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Total Amount:</strong> ${order.total.toFixed(2)} ETB</p>
trong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #856404; margin-top: 0;">Items Ordered</h3>
                        ${order.items.map(item => `
                            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                                <p><strong>${item.name}</strong></p>
                                <p>Quantity: ${item.quantity} × ${item.price.toFixed(2)} ETB = ${item.subtotal.toFixed(2)} ETB</p>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #27ae60; margin-top: 0;">Shipping Address</h3>
                        <p><strong>${order.shippingAddress.fullName}</strong></p>
                        <p>${order.shippingAddress.address}</p>
                        <p>${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
                        <p>Phone: ${order.shippingAddress.phone}</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
                           style="display: inline-block; padding: 15px 30px; background: #27ae60; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Track Your Order
                        </a>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #7f8c8d; font-size: 14px;">
                      
                            You will receive updates as your order is processed and shipped.
                        </p>
                    </div>
                </div>
            </div>
        `;

        await this.sendEmail(customerEmail, subject, '', html);
    }

    /**
     * Send new order notification to admin
     */
    async sendNewOrderNotificationToAdmin(adminEmail, order, customer) {
        const subject = `🛒 New Order Received - ${order.orderNumber}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">Modo E-Commerce</h1>
                        <h2 style="color: #e74c3c; margin: 10px 0;">New Order Received!</h2>
                    </div>

                    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Customer:</strong> ${customer.username} (${customer.email})</p>
                        <p><strong>Total Amount:</strong> ${order.total.toFixed(2)} ETB</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #27ae60; margin-top: 0;">Shipping Address</h3>
                        <p><strong>${order.shippingAddress.fullName}</strong></p>
                        <p>${order.shippingAddress.address}</p>
                        <p>${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
                        <p>Phone: ${order.shippingAddress.phone}</p>
                    </div>

                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #856404; margin-top: 0;">Order Items</h3>
                        ${order.items.map(item => `
                            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                                <p><strong>${item.name}</strong></p>
                                <p>Quantity: ${item.quantity} × ${item.price.toFixed(2)} ETB = ${item.subtotal.toFixed(2)} ETB</p>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #0c5460; margin-top: 0;">Admin Actions Required</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Review order details and customer information</li>
                            <li>Coordinate with sellers for product fulfillment</li>
                            <li>Monitor payment status and processing</li>
                            <li>Update order status as needed</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-v2" 
                           style="display: inline-block; padding: 15px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Manage Order
                        </a>
                    </div>

                    <dn-top: 30px;">
                        <p style="color: #7f8c8d; font-size: 14px;">
                            This is an automated notification from Modo E-Commerce Admin System.<br>
                            Please log in to the admin dashboard to manage this order.
                        </p>
                    </div>
                </div>
            </div>
        `;

        await this.sendEmail(adminEmail, subject, '', html);
    }

    /**
     * Send new order notification to seller
     */
    async sendNewOrderNotificationToSeller(sellerEmail, order, customer, seller) {
        // Calculate seller earnings (90% of order total, 10% platform fee)
        const sellerTotal = order.total;
        const sellerCommission = sellerTotal * 0.9; // 90% to seller
        const platformFee = sellerTotal * 0.1; // 10% platform fee

        const subject = `💰 New Sale! Order ${order.orderNumber}`;

        const html = `
            <div style="fontng: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">Modo E-Commerce</h1>
                        <h2 style="color: #27ae60; margin: 10px 0;">🎉 Congratulations! New Sale!</h2>
                    </div>

                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #27ae60; margin-top: 0;">Sale Summary</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Customer:</strong> ${customer.username}</p>
                        <p><strong>Sale Amount:</strong> ${sellerTotal.toFixed(2)} ETB</p>
                        <p><strong>Your Earnings:</strong> ${sellerCommission.toFixed(2)} ETB (90%)</p>
                        <p><strong>Platform Fee:</strong> ${platformFee.toFixed(2)} ETB (10%)</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #0c5460; margin-top: 0;">Shipping Details</h3>
                        <p><strong>Ship to:</strong> ${order.shippingAddress.fullName}</p>
                        <p>${order.shippingAddress.address}</p>
                        <p>${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
                        <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
                    </div>

                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #856404; margin-top: 0;">Items Sold</h3>
                        ${order.items.map(item => `
                            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                                <p><strong>${item.name}</strong></p>
                                <p>Quantity: ${item.quantity} × ${item.price.toFixed(2)} ETB = ${item.subtotal.toFixed(2)} ETB</p>
                            </div>
                        `).join('')}
                    </div>

                    <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #721c24; margin-top: 0;">Action Required</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li><strong>Prepare items for shipping</strong></li>
                            <li>Update inventory levels</li>
                            <li>Coordinate with admin for order fulfillment</li>
                            <li>Ensure product quality and packaging</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller" 
                           style="display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Manage Order
                        </a>
                    </div>

                    <div style=">
                        <p style="color: #7f8c8d; font-size: 14px;">
                            This is an automated notification from Modo E-Commerce Seller System.<br>
                            Please log in to your seller dashboard to manage this order.
                        </p>
                    </div>
                </div>
            </div>
        `;

        await this.sendEmail(sellerEmail, subject, '', html);
    }
}

module.exports = new EmailService();