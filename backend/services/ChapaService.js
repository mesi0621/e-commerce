const axios = require('axios');

class ChapaService {
    constructor() {
        this.secretKey = process.env.CHAPA_SECRET_KEY;
        this.publicKey = process.env.CHAPA_PUBLIC_KEY;
        this.apiUrl = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';
        this.webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
    }

    /**
     * Initialize payment with Chapa
     * @param {Object} paymentData - Payment details
     * @returns {Promise<Object>} Payment initialization response
     */
    async initializePayment(paymentData) {
        try {
            // Check if Chapa credentials are properly configured
            if (!this.secretKey || this.secretKey === 'your_chapa_secret_key_here') {
                console.log('Chapa not configured - credentials missing');
                return {
                    success: false,
                    error: 'Chapa payment gateway is not configured. Please contact support.'
                };
            }

            const { amount, email, firstName, lastName, phoneNumber, txRef, callbackUrl, returnUrl } = paymentData;

            const payload = {
                amount: parseFloat(amount).toFixed(2),
                currency: 'ETB',
                email: email || 'customer@example.com',
                first_name: firstName || 'Customer',
                last_name: lastName || 'Name',
                phone_number: phoneNumber || '0911000000',
                tx_ref: txRef,
                callback_url: callbackUrl,
                return_url: returnUrl,
                customization: {
                    title: 'Modo E-Commerce',
                    description: 'Payment for your order',
                    logo: 'https://your-logo-url.com/logo.png'
                }
            };

            console.log('🔄 Chapa payment request:', { ...payload, amount: payload.amount });

            const response = await axios.post(
                `${this.apiUrl}/transaction/initialize`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            console.log('✅ Chapa response:', response.data);

            if (response.data.status === 'success') {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to initialize Chapa payment'
                };
            }
        } catch (error) {
            console.error('❌ Chapa initialization error:', error.response?.data || error.message);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Invalid API Key or the business can\'t accept payments at the moment. Please verify your API key and ensure the account is active and able to process payments.'
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Chapa payment service is currently unavailable. Please try another payment method.'
            };
        }
    }

    /**
     * Verify payment with Chapa
     * @param {string} txRef - Transaction reference
     * @returns {Promise<Object>} Payment verification response
     */
    async verifyPayment(txRef) {
        try {
            if (!this.secretKey || this.secretKey === 'your_chapa_secret_key_here') {
                return {
                    success: false,
                    error: 'Chapa payment gateway is not configured'
                };
            }

            const response = await axios.get(
                `${this.apiUrl}/transaction/verify/${txRef}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Chapa verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to verify Chapa payment'
            };
        }
    }

    /**
     * Get payment details
     * @param {string} txRef - Transaction reference
     * @returns {Promise<Object>} Payment details
     */
    async getPaymentDetails(txRef) {
        try {
            const response = await axios.get(
                `${this.apiUrl}/transaction/verify/${txRef}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data.data;
            return {
                success: true,
                status: data.status,
                amount: data.amount,
                currency: data.currency,
                reference: data.reference,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Chapa get details error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get payment details'
            };
        }
    }

    /**
     * Verify webhook signature
     * @param {string} signature - Webhook signature
     * @param {Object} payload - Webhook payload
     * @returns {boolean} Verification result
     */
    verifyWebhookSignature(signature, payload) {
        if (!this.webhookSecret) {
            console.warn('⚠️ Webhook secret not configured, skipping signature verification');
            return true; // Allow webhook if secret not configured
        }

        try {
            const crypto = require('crypto');
            const hash = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(JSON.stringify(payload))
                .digest('hex');

            return hash === signature;
        } catch (error) {
            console.error('❌ Webhook signature verification error:', error);
            return false;
        }
    }

    /**
     * Create subaccount for marketplace
     * @param {Object} subaccountData - Subaccount details
     * @returns {Promise<Object>} Subaccount creation response
     */
    async createSubaccount(subaccountData) {
        try {
            const { business_name, account_name, bank_code, account_number, split_type, split_value } = subaccountData;

            const response = await axios.post(
                `${this.apiUrl}/subaccount`,
                {
                    business_name,
                    account_name,
                    bank_code,
                    account_number,
                    split_type,
                    split_value
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Chapa subaccount creation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create subaccount'
            };
        }
    }
}

module.exports = new ChapaService();
