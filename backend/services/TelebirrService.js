const axios = require('axios');
const crypto = require('crypto');

class TelebirrService {
    constructor() {
        this.appId = process.env.TELEBIRR_APP_ID;
        this.appKey = process.env.TELEBIRR_APP_KEY;
        this.publicKey = process.env.TELEBIRR_PUBLIC_KEY;
        this.apiUrl = process.env.TELEBIRR_API_URL || 'https://api.ethiotelecom.et/telebirr';
    }

    /**
     * Generate signature for Telebirr request
     * @param {Object} data - Request data
     * @returns {string} Signature
     */
    generateSignature(data) {
        const sortedKeys = Object.keys(data).sort();
        const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');

        return crypto
            .createHmac('sha256', this.appKey)
            .update(signString)
            .digest('hex');
    }

    /**
     * Initialize Telebirr payment
     * @param {Object} paymentData - Payment details
     * @returns {Promise<Object>} Payment initialization response
     */
    async initializePayment(paymentData) {
        try {
            // Check if Telebirr credentials are properly configured
            if (!this.appId || !this.appKey || this.appId === 'your_telebirr_app_id_here') {
                console.log('Telebirr not configured - credentials missing');
                return {
                    success: false,
                    error: 'Telebirr payment gateway is not configured. Please contact support.'
                };
            }

            const { amount, orderId, phoneNumber, notifyUrl, returnUrl } = paymentData;

            const timestamp = Date.now().toString();
            const nonce = crypto.randomBytes(16).toString('hex');

            const requestData = {
                appId: this.appId,
                merOrderId: orderId,
                totalAmount: amount.toString(),
                currency: 'ETB',
                subject: 'E-Commerce Payment',
                body: `Payment for order ${orderId}`,
                notifyUrl,
                returnUrl,
                timeoutExpress: '30m',
                timestamp,
                nonce
            };

            // Add signature
            requestData.sign = this.generateSignature(requestData);

            const response = await axios.post(
                `${this.apiUrl}/payment/create`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-APP-Key': this.appKey
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            return {
                success: true,
                paymentUrl: response.data.toPayUrl,
                prepayId: response.data.prepayId,
                data: response.data
            };
        } catch (error) {
            console.error('Telebirr initialization error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Telebirr payment gateway is currently unavailable. Please try another payment method.'
            };
        }
    }

    /**
     * Query payment status
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Payment status
     */
    async queryPayment(orderId) {
        try {
            const timestamp = Date.now().toString();
            const nonce = crypto.randomBytes(16).toString('hex');

            const requestData = {
                appId: this.appId,
                merOrderId: orderId,
                timestamp,
                nonce
            };

            requestData.sign = this.generateSignature(requestData);

            const response = await axios.post(
                `${this.apiUrl}/payment/query`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-APP-Key': this.appKey
                    }
                }
            );

            return {
                success: true,
                status: response.data.tradeStatus,
                transactionId: response.data.transactionNo,
                data: response.data
            };
        } catch (error) {
            console.error('Telebirr query error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.msg || 'Failed to query Telebirr payment'
            };
        }
    }

    /**
     * Verify webhook notification
     * @param {Object} notification - Webhook notification data
     * @returns {boolean} Verification result
     */
    verifyNotification(notification) {
        const { sign, ...data } = notification;
        const calculatedSign = this.generateSignature(data);
        return calculatedSign === sign;
    }

    /**
     * Refund payment
     * @param {string} orderId - Original order ID
     * @param {string} transactionId - Transaction ID
     * @param {number} amount - Refund amount
     * @returns {Promise<Object>} Refund response
     */
    async refundPayment(orderId, transactionId, amount) {
        try {
            const timestamp = Date.now().toString();
            const nonce = crypto.randomBytes(16).toString('hex');
            const refundId = `REF-${orderId}-${Date.now()}`;

            const requestData = {
                appId: this.appId,
                merOrderId: orderId,
                refundId,
                transactionNo: transactionId,
                refundAmount: amount.toString(),
                refundReason: 'Customer requested refund',
                timestamp,
                nonce
            };

            requestData.sign = this.generateSignature(requestData);

            const response = await axios.post(
                `${this.apiUrl}/payment/refund`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-APP-Key': this.appKey
                    }
                }
            );

            return {
                success: true,
                refundId: response.data.refundId,
                data: response.data
            };
        } catch (error) {
            console.error('Telebirr refund error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.msg || 'Failed to refund Telebirr payment'
            };
        }
    }
}

module.exports = new TelebirrService();
