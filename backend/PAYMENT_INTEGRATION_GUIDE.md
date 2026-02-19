# Payment Gateway Integration Guide

This document provides comprehensive instructions for integrating and configuring payment gateways in the e-commerce platform.

## Supported Payment Methods

1. **Chapa** - Ethiopian payment gateway
2. **PayPal** - International payment gateway
3. **Telebirr** - Ethiopian mobile money
4. **CBE Birr** - Commercial Bank of Ethiopia digital payment
5. **Cash on Delivery** - Pay upon delivery
6. **Bank Transfer** - Direct bank transfer

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Base URL for callbacks
BASE_URL=http://localhost:5000

# Chapa Configuration
CHAPA_SECRET_KEY=your_chapa_secret_key_here
CHAPA_PUBLIC_KEY=your_chapa_public_key_here
CHAPA_WEBHOOK_SECRET=your_chapa_webhook_secret_here
CHAPA_API_URL=https://api.chapa.co/v1

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox  # or 'live' for production
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# Telebirr Configuration
TELEBIRR_APP_ID=your_telebirr_app_id_here
TELEBIRR_APP_KEY=your_telebirr_app_key_here
TELEBIRR_PUBLIC_KEY=your_telebirr_public_key_here
TELEBIRR_API_URL=https://api.ethiotelecom.et/telebirr

# CBE Birr Configuration
CBE_MERCHANT_ID=your_cbe_merchant_id_here
CBE_API_KEY=your_cbe_api_key_here
CBE_API_URL=https://api.cbe.com.et/birr

# Bank Transfer Details
BANK_ACCOUNT_NAME=Your Business Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_NAME=Commercial Bank of Ethiopia
BANK_BRANCH=Main Branch
```

---

## 1. Chapa Integration

### Getting Started

1. Sign up at [https://chapa.co](https://chapa.co)
2. Get your API keys from the dashboard
3. Configure webhook URL: `https://yourdomain.com/api/payments/chapa/callback`

### API Endpoints

#### Initialize Payment
```javascript
POST /api/payments/process
{
  "orderId": "order_id",
  "paymentMethod": "chapa",
  "paymentDetails": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+251912345678"
  }
}
```

#### Verify Payment
```javascript
GET /api/payments/chapa/verify/:txRef
```

### Webhook Handler

Chapa will send payment notifications to:
```
POST /api/payments/chapa/callback
```

The webhook is automatically verified using the signature header.

### Testing

Use Chapa's test credentials:
- Test Card: 4200 0000 0000 0000
- CVV: Any 3 digits
- Expiry: Any future date

---

## 2. PayPal Integration

### Getting Started

1. Create a PayPal Business account
2. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
3. Create a REST API app
4. Get your Client ID and Secret

### API Endpoints

#### Initialize Payment
```javascript
POST /api/payments/process
{
  "orderId": "order_id",
  "paymentMethod": "paypal",
  "paymentDetails": {}
}
```

Response includes `approvalUrl` - redirect user to this URL.

#### Capture Payment
```javascript
POST /api/payments/paypal/capture/:paypalOrderId
```

Call this after user approves payment.

### Payment Flow

1. Initialize payment → Get approval URL
2. Redirect user to PayPal
3. User approves payment
4. PayPal redirects back to your return URL
5. Capture payment using the order ID

### Testing

Use PayPal sandbox accounts:
- Buyer account: Create in PayPal Developer Dashboard
- Use sandbox credentials for testing

---

## 3. Telebirr Integration

### Getting Started

1. Contact Ethio Telecom for merchant account
2. Get App ID, App Key, and Public Key
3. Configure notification URL: `https://yourdomain.com/api/payments/telebirr/notify`

### API Endpoints

#### Initialize Payment
```javascript
POST /api/payments/process
{
  "orderId": "order_id",
  "paymentMethod": "telebirr",
  "paymentDetails": {
    "phoneNumber": "+251912345678"
  }
}
```

#### Query Payment Status
```javascript
GET /api/payments/:orderId/status
```

### Webhook Handler

Telebirr sends notifications to:
```
POST /api/payments/telebirr/notify
```

### Security

- All requests are signed using HMAC-SHA256
- Signatures are verified automatically
- Nonce prevents replay attacks

---

## 4. CBE Birr Integration

### Getting Started

1. Contact Commercial Bank of Ethiopia
2. Register as a merchant
3. Get Merchant ID and API Key
4. Configure callback URL: `https://yourdomain.com/api/payments/cbe/callback`

### API Endpoints

#### Initialize Payment
```javascript
POST /api/payments/process
{
  "orderId": "order_id",
  "paymentMethod": "cbe",
  "paymentDetails": {
    "customerName": "John Doe",
    "phoneNumber": "+251912345678"
  }
}
```

#### Verify Payment
```javascript
GET /api/payments/:orderId/status
```

### Webhook Handler

CBE Birr sends callbacks to:
```
POST /api/payments/cbe/callback
```

### Security

- Requests include signature in `X-Signature` header
- Signatures verified using HMAC-SHA256
- Timestamps prevent replay attacks

---

## 5. Cash on Delivery

### Configuration

No API keys required. Payment is collected upon delivery.

### API Endpoint

```javascript
POST /api/payments/process
{
  "orderId": "order_id",
  "paymentMethod": "cash_on_delivery",
  "paymentDetails": {}
}
```

### Order Flow

1. Order created with status "pending"
2. Payment status set to "pending"
3. Delivery staff collects payment
4. Admin updates payment status to "completed"

---

## 6. Bank Transfer

### Configuration

Set bank details in `.env`:
```env
BANK_ACCOUNT_NAME=Your Business Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_NAME=Commercial Bank of Ethiopia
BANK_BRANCH=Main Branch
```

### API Endpoint

```javascript
POST /api/payments/process
{
  "orderId": "order_id",
  "paymentMethod": "bank_transfer",
  "paymentDetails": {
    "referenceNumber": "TXN123456"
  }
}
```

### Verification Process

1. Customer transfers money to your bank account
2. Customer provides reference number
3. Admin verifies payment manually
4. Admin updates payment status to "completed"

---

## Payment Status Flow

```
pending → processing → completed
                    ↓
                  failed
```

### Status Definitions

- **pending**: Payment initiated, awaiting confirmation
- **processing**: Payment being processed by gateway
- **completed**: Payment successful
- **failed**: Payment failed
- **refunded**: Payment refunded to customer

---

## Error Handling

All payment methods return standardized error responses:

```javascript
{
  "success": false,
  "error": "Error message here"
}
```

### Common Errors

- **Invalid API credentials**: Check your environment variables
- **Insufficient funds**: Customer doesn't have enough balance
- **Network timeout**: Retry the request
- **Invalid signature**: Webhook verification failed

---

## Testing Checklist

### Before Going Live

- [ ] Test all payment methods in sandbox/test mode
- [ ] Verify webhook handlers receive notifications
- [ ] Test payment verification endpoints
- [ ] Test refund functionality
- [ ] Verify order status updates correctly
- [ ] Test error scenarios (failed payments, timeouts)
- [ ] Ensure sensitive data is not logged
- [ ] Configure production API keys
- [ ] Update BASE_URL to production domain
- [ ] Set up SSL certificate for webhooks
- [ ] Test with real small amounts

---

## Security Best Practices

1. **Never expose API keys** in frontend code
2. **Always verify webhook signatures** before processing
3. **Use HTTPS** for all payment endpoints
4. **Log payment transactions** for audit trail
5. **Implement rate limiting** on payment endpoints
6. **Validate all input data** before processing
7. **Store sensitive data encrypted** in database
8. **Use environment variables** for configuration
9. **Implement idempotency** to prevent duplicate charges
10. **Monitor for suspicious activity**

---

## Troubleshooting

### Chapa Issues

**Problem**: Payment initialization fails
- Check API key is correct
- Verify amount is valid (minimum 1 ETB)
- Ensure phone number format is correct

**Problem**: Webhook not receiving notifications
- Verify webhook URL is publicly accessible
- Check webhook secret is configured
- Review Chapa dashboard for failed webhooks

### PayPal Issues

**Problem**: Access token fails
- Verify Client ID and Secret are correct
- Check API mode (sandbox vs live)
- Ensure credentials match the mode

**Problem**: Payment capture fails
- Verify order was approved by user
- Check order ID is correct
- Ensure order hasn't expired (3 hours)

### Telebirr Issues

**Problem**: Signature verification fails
- Check App Key is correct
- Verify request data format
- Ensure timestamp is current

### CBE Birr Issues

**Problem**: Payment initialization fails
- Verify Merchant ID is correct
- Check API key is valid
- Ensure customer phone number is valid

---

## Support

For payment gateway specific issues:

- **Chapa**: support@chapa.co
- **PayPal**: https://developer.paypal.com/support
- **Telebirr**: Contact Ethio Telecom merchant support
- **CBE Birr**: Contact CBE merchant services

---

## API Reference

### Payment Processing

```javascript
POST /api/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "string",
  "paymentMethod": "chapa|paypal|telebirr|cbe|cash_on_delivery|bank_transfer",
  "paymentDetails": {
    // Method-specific details
  }
}
```

### Get Payment Status

```javascript
GET /api/payments/:orderId/status
Authorization: Bearer {token}
```

### Verify Chapa Payment

```javascript
GET /api/payments/chapa/verify/:txRef
```

### Capture PayPal Payment

```javascript
POST /api/payments/paypal/capture/:orderId
```

---

## Changelog

### Version 1.0.0 (2024)
- Initial integration of Chapa, PayPal, Telebirr, CBE Birr
- Added webhook handlers
- Implemented payment verification
- Added comprehensive error handling
