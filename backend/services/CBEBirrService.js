const axios = require('axios');
const crypto = require('crypto');

class CBEBirrService {
    constructor() {
        this.merchantId = process.env.CBE_MERCHANT_ID;
        this.apiKey = process.env.CBE_API_KEY;
        this.apiUrl = process.env.CBE_API_URL || 'https://api.cbe.com.et/birr';
    }

    /**
     * Generate request signature
     * @param {Object} data - Request data
     * @returns {string} Signature
     */
    generateSignature(data) {
        const signString = JSON.stringify(data);
        return crypto
            .createHmac('sha256', this.apiKey)
            .update(signString)
            .digest('hex');
    }

    /**
     * Initialize CBE Birr payment
     * @param {Object} paymentData - Payment details
     * @returns {Promise<Object>} Payment initialization response
     */
    async initializePayment(paymentData) {
        try {
            // Check if CBE credentials are properly configured
            if (!this.merchantId || !this.apiKey || this.merchantId === 'your_cbe_merchant_id_here') {
                console.log('CBE Birr not configured - credentials missing');
                return {
                    success: false,
                    error: 'CBE Birr payment gateway is not configured. Please contact support.'
                };
            }

            const { amount, orderId, customerName, customerPhone, callbackUrl, returnUrl } = paymentData;

            const timestamp = new Date().toISOString();
            const requestId = `${this.merchantId}-${Date.now()}`;

            const requestData = {
                merchantId: this.merchantId,
                requestId,
                orderId,
                amount: amount.toString(),
                currency: 'ETB',
                customerName,
                customerPhone,
                description: `Payment for order ${orderId}`,
                callbackUrl,
                returnUrl,
                timestamp
            };

            const signature = this.generateSignature(requestData);

            const response = await axios.post(
                `${this.apiUrl}/v1/payment/initialize`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Merchant-Id': this.merchantId,
                        'X-API-Key': this.apiKey,
                        'X-Signature': signature
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            return {
                success: true,
                paymentUrl: response.data.paymentUrl,
                transactionId: response.data.transactionId,
                data: response.data
            };
        } catch (error) {
            console.error('CBE Birr initialization error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'CBE Birr payment gateway is currently unavailable. Please try another payment method.'
            };
        }
    }

    /**
     * Verify payment status
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>} Payment verification response
     */
    async verifyPayment(transactionId) {
        try {
            const timestamp = new Date().toISOString();
            const requestData = {
                merchantId: this.merchantId,
                transactionId,
                timestamp
            };

            const signature = this.generateSignature(requestData);

            const response = await axios.post(
                `${this.apiUrl}/v1/payment/verify`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Merchant-Id': this.merchantId,
                        'X-API-Key': this.apiKey,
                        'X-Signature': signature
                    }
                }
            );

            return {
                success: true,
                status: response.data.status,
                amount: response.data.amount,
                transactionId: response.data.transactionId,
                data: response.data
            };
        } catch (error) {
            console.error('CBE Birr verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to verify CBE Birr payment'
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
            const timestamp = new Date().toISOString();
            const requestData = {
                merchantId: this.merchantId,
                orderId,
                timestamp
            };

            const signature = this.generateSignature(requestData);

            const response = await axios.get(
                `${this.apiUrl}/v1/payment/query`,
                {
                    params: requestData,
                    headers: {
                        'X-Merchant-Id': this.merchantId,
                        'X-API-Key': this.apiKey,
                        'X-Signature': signature
                    }
                }
            );

            return {
                success: true,
                status: response.data.paymentStatus,
                transactionId: response.data.transactionId,
                data: response.data
            };
        } catch (error) {
            console.error('CBE Birr query error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to query CBE Birr payment'
            };
        }
    }

    /**
     * Verify webhook callback
     * @param {Object} callbackData - Webhook callback data
     * @param {string} signature - Signature from webhook
     * @returns {boolean} Verification result
     */
    verifyCallback(callbackData, signature) {
        const calculatedSignature = this.generateSignature(callbackData);
        return calculatedSignature === signature;
    }

    /**
     * Refund payment
     * @param {string} transactionId - Original transaction ID
     * @param {number} amount - Refund amount
     * @param {string} reason - Refund reason
     * @returns {Promise<Object>} Refund response
     */
    async refundPayment(transactionId, amount, reason) {
        try {
            const timestamp = new Date().toISOString();
            const refundId = `REF-${Date.now()}`;

            const requestData = {
                merchantId: this.merchantId,
                refundId,
                transactionId,
                amount: amount.toString(),
                reason,
                timestamp
            };

            const signature = this.generateSignature(requestData);

            const response = await axios.post(
                `${this.apiUrl}/v1/payment/refund`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Merchant-Id': this.merchantId,
                        'X-API-Key': this.apiKey,
                        'X-Signature': signature
                    }
                }
            );

            return {
                success: true,
                refundId: response.data.refundId,
                status: response.data.status,
                data: response.data
            };
        } catch (error) {
            console.error('CBE Birr refund error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to refund CBE Birr payment'
            };
        }
    }
}

module.exports = new CBEBirrService();
