const axios = require('axios');

class PayPalService {
    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID;
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        this.mode = process.env.PAYPAL_MODE || 'sandbox';
        this.apiUrl = this.mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get PayPal access token
     * @returns {Promise<string>} Access token
     */
    async getAccessToken() {
        try {
            // Return cached token if still valid
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(
                `${this.apiUrl}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            // Set expiry to 5 minutes before actual expiry
            this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

            return this.accessToken;
        } catch (error) {
            console.error('PayPal token error:', error.response?.data || error.message);
            throw new Error('Failed to get PayPal access token');
        }
    }

    /**
     * Create PayPal order
     * @param {Object} orderData - Order details
     * @returns {Promise<Object>} Order creation response
     */
    async createOrder(orderData) {
        try {
            const { amount, currency = 'USD', returnUrl, cancelUrl, orderId } = orderData;

            const accessToken = await this.getAccessToken();

            const response = await axios.post(
                `${this.apiUrl}/v2/checkout/orders`,
                {
                    intent: 'CAPTURE',
                    purchase_units: [{
                        reference_id: orderId,
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2)
                        }
                    }],
                    application_context: {
                        return_url: returnUrl,
                        cancel_url: cancelUrl,
                        brand_name: 'E-Commerce Store',
                        landing_page: 'BILLING',
                        user_action: 'PAY_NOW'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                orderId: response.data.id,
                approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
                data: response.data
            };
        } catch (error) {
            console.error('PayPal create order error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create PayPal order'
            };
        }
    }

    /**
     * Capture PayPal payment
     * @param {string} orderId - PayPal order ID
     * @returns {Promise<Object>} Capture response
     */
    async capturePayment(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.post(
                `${this.apiUrl}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                status: response.data.status,
                captureId: response.data.purchase_units[0]?.payments?.captures[0]?.id,
                data: response.data
            };
        } catch (error) {
            console.error('PayPal capture error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to capture PayPal payment'
            };
        }
    }

    /**
     * Get order details
     * @param {string} orderId - PayPal order ID
     * @returns {Promise<Object>} Order details
     */
    async getOrderDetails(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.get(
                `${this.apiUrl}/v2/checkout/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('PayPal get order error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get PayPal order details'
            };
        }
    }

    /**
     * Refund payment
     * @param {string} captureId - Capture ID
     * @param {number} amount - Refund amount
     * @returns {Promise<Object>} Refund response
     */
    async refundPayment(captureId, amount) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.post(
                `${this.apiUrl}/v2/payments/captures/${captureId}/refund`,
                {
                    amount: {
                        value: amount.toFixed(2),
                        currency_code: 'USD'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                refundId: response.data.id,
                data: response.data
            };
        } catch (error) {
            console.error('PayPal refund error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to refund PayPal payment'
            };
        }
    }
}

module.exports = new PayPalService();
