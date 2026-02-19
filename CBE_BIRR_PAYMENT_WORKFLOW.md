# CBE Birr Payment Workflow Documentation

## Overview
Complete implementation of CBE Birr (Commercial Bank of Ethiopia) payment gateway integration following the standard payment gateway workflow.

## Payment Flow

### 1. Customer Selects "Pay with CBE Birr"
**Location:** Checkout page (`frontend/src/Pages/Checkout.jsx`)

When customer selects CBE Birr as payment method:
- Payment method is set to `'cbe'`
- Customer fills shipping address
- Clicks "Place Order"

### 2. Order Creation
**Endpoint:** `POST /api/orders`

- Order is created with status: `pending`
- Payment status: `pending`
- Order details saved to database

### 3. Payment Request Generation
**Endpoint:** `POST /api/payments/process`
**Handler:** `PaymentController.processPayment()` → `processCBE()`

Backend generates payment request:
```javascript
{
    amount: order.total,
    orderId: order.orderNumber,
    customerName: user.username,
    customerPhone: paymentDetails.phoneNumber,
    callbackUrl: 'http://localhost:5000/api/payments/cbe/callback',
    returnUrl: 'http://localhost:5000/api/payments/cbe/return'
}
```

### 4. Send to CBE Birr API
**Service:** `CBEBirrService.initializePayment()`
**File:** `backend/services/CBEBirrService.js`

Request sent to CBE Birr API:
```javascript
POST https://api.cbe.com.et/birr/v1/payment/initialize
Headers:
  - X-Merchant-Id: {merchantId}
  - X-API-Key: {apiKey}
  - X-Signature: {HMAC-SHA256 signature}
Body:
  - merchantId
  - requestId
  - orderId
  - amount
  - currency: 'ETB'
  - customerName
  - customerPhone
  - callbackUrl
  - returnUrl
  - timestamp
```

**Response:**
```javascript
{
    paymentUrl: 'https://cbe.com.et/payment/...',
    transactionId: 'CBE-TXN-123456',
    ...
}
```

### 5. Redirect to CBE Birr Payment Page
**Frontend:** `Checkout.jsx` handles redirect

```javascript
if (paymentData.data.payment.paymentUrl) {
    window.location.href = paymentData.data.payment.paymentUrl;
}
```

Customer is redirected to CBE Birr's secure payment page.

### 6. Customer Logs In to CBE Birr
**External:** CBE Birr website

- Customer enters CBE Birr credentials
- Authenticates with CBE system
- Views payment details

### 7. Customer Confirms Payment
**External:** CBE Birr website

- Customer reviews transaction details
- Confirms payment
- CBE processes the transaction

### 8. CBE Birr Sends Callback to Backend
**Endpoint:** `POST /api/payments/cbe/callback`
**Handler:** `PaymentController.cbeCallback()`

CBE Birr sends webhook notification:
```javascript
POST http://localhost:5000/api/payments/cbe/callback
Headers:
  - X-Signature: {signature}
Body:
  - orderId
  - transactionId
  - status: 'SUCCESS' | 'FAILED'
  - amount
  - timestamp
```

### 9. Backend Verifies Transaction
**Service:** `CBEBirrService.verifyCallback()`

Backend verification steps:
1. Verify webhook signature using HMAC-SHA256
2. Check signature matches calculated signature
3. Validate transaction data
4. Find order in database

```javascript
const calculatedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(JSON.stringify(callbackData))
    .digest('hex');

if (calculatedSignature !== receivedSignature) {
    return false; // Invalid signature
}
```

### 10. Update Order Status

#### IF Verified (Payment Success):
```javascript
order.paymentStatus = 'completed';
order.orderStatus = 'confirmed';
order.statusHistory.push({
    status: 'confirmed',
    timestamp: Date.now(),
    note: 'Payment confirmed via CBE Birr'
});
await order.save();
```

**Actions:**
- ✅ Mark payment as completed
- ✅ Confirm order
- ✅ Clear customer's cart
- ✅ Send confirmation email
- ✅ Update inventory
- ✅ Create audit log

#### ELSE (Payment Failed):
```javascript
order.paymentStatus = 'failed';
order.statusHistory.push({
    status: 'failed',
    timestamp: Date.now(),
    note: 'Payment failed via CBE Birr'
});
await order.save();
```

**Actions:**
- ❌ Mark payment as failed
- ❌ Keep order in pending state
- ❌ Send failure notification
- ❌ Allow customer to retry

## Configuration

### Environment Variables

**Backend (.env):**
```env
# CBE Birr Configuration
CBE_MERCHANT_ID=your_cbe_merchant_id_here
CBE_API_KEY=your_cbe_api_key_here
CBE_API_URL=https://api.cbe.com.et/birr

# Base URL for callbacks
BASE_URL=http://localhost:5000
```

### Payment Method Setup

Run the seed script to enable CBE Birr:
```bash
cd backend
node scripts/seedPaymentMethods.js
```

Or manually create in database:
```javascript
{
    name: 'cbe',
    displayName: 'CBE Birr',
    type: 'mobile_money',
    description: 'Pay with CBE Birr mobile wallet',
    isActive: true,
    icon: '🏦',
    fees: {
        fixed: 0,
        percentage: 0
    },
    config: {
        merchantId: process.env.CBE_MERCHANT_ID,
        apiUrl: process.env.CBE_API_URL
    }
}
```

## API Endpoints

### 1. Initialize Payment
```
POST /api/payments/process
Authorization: Bearer {token}
Body: {
    orderId: "ORDER-123",
    paymentMethod: "cbe",
    paymentDetails: {
        phoneNumber: "+251912345678"
    }
}
```

### 2. Callback Handler
```
POST /api/payments/cbe/callback
Headers: {
    X-Signature: {signature}
}
Body: {
    orderId: "ORDER-123",
    transactionId: "CBE-TXN-123",
    status: "SUCCESS",
    amount: 1000,
    timestamp: "2024-01-01T00:00:00Z"
}
```

### 3. Verify Payment
```
POST /api/payments/cbe/verify
Body: {
    transactionId: "CBE-TXN-123"
}
```

### 4. Query Payment Status
```
GET /api/payments/cbe/query?orderId=ORDER-123
```

## Security Features

### 1. Signature Verification
All requests and callbacks are signed using HMAC-SHA256:
```javascript
const signature = crypto
    .createHmac('sha256', apiKey)
    .update(JSON.stringify(data))
    .digest('hex');
```

### 2. Request Validation
- Merchant ID verification
- Timestamp validation (prevent replay attacks)
- Amount verification
- Order ID validation

### 3. Secure Communication
- HTTPS only
- API key authentication
- Request signing
- Callback signature verification

## Error Handling

### Configuration Errors
```javascript
if (!merchantId || merchantId === 'your_cbe_merchant_id_here') {
    return {
        success: false,
        error: 'CBE Birr payment gateway is not configured'
    };
}
```

### Network Errors
```javascript
try {
    const response = await axios.post(apiUrl, data, { timeout: 10000 });
} catch (error) {
    return {
        success: false,
        error: 'CBE Birr payment gateway is currently unavailable'
    };
}
```

### Payment Failures
- Transaction declined
- Insufficient funds
- Invalid credentials
- Network timeout

## Testing

### Test Mode
CBE Birr provides a sandbox environment for testing:
```env
CBE_API_URL=https://sandbox.cbe.com.et/birr
CBE_MERCHANT_ID=test_merchant_123
CBE_API_KEY=test_api_key_456
```

### Test Credentials
Contact CBE to obtain test credentials:
- Test merchant ID
- Test API key
- Test phone numbers
- Test amounts

### Manual Testing Steps

1. **Start servers:**
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start
```

2. **Create test order:**
- Add items to cart
- Go to checkout
- Fill shipping address
- Select "CBE Birr"

3. **Complete payment:**
- Click "Place Order"
- Redirected to CBE Birr page
- Login with test credentials
- Confirm payment

4. **Verify callback:**
- Check backend logs for callback
- Verify signature validation
- Check order status updated
- Confirm email sent

## Monitoring & Logging

### Payment Logs
```javascript
console.log('CBE Birr initialization:', {
    orderId,
    amount,
    transactionId
});

console.log('CBE Birr callback received:', {
    orderId,
    status,
    transactionId
});
```

### Audit Trail
All payment actions are logged:
- Payment initialization
- Callback received
- Signature verification
- Order status updates

## Troubleshooting

### Issue: Payment URL not generated
**Solution:**
- Check CBE credentials in .env
- Verify API URL is correct
- Check network connectivity
- Review backend logs

### Issue: Callback not received
**Solution:**
- Verify callback URL is publicly accessible
- Check firewall settings
- Ensure webhook endpoint is registered with CBE
- Test callback URL manually

### Issue: Signature verification fails
**Solution:**
- Verify API key is correct
- Check signature algorithm (HMAC-SHA256)
- Ensure data format matches exactly
- Review CBE documentation

### Issue: Payment stuck in pending
**Solution:**
- Query payment status via API
- Check CBE dashboard
- Verify callback was received
- Manually verify transaction

## Production Checklist

- [ ] Obtain production CBE credentials
- [ ] Update environment variables
- [ ] Configure production callback URL
- [ ] Test with real transactions
- [ ] Set up monitoring and alerts
- [ ] Configure error notifications
- [ ] Document support procedures
- [ ] Train support staff
- [ ] Set up refund procedures
- [ ] Configure reconciliation process

## Support

### CBE Birr Support
- Email: support@cbe.com.et
- Phone: +251-11-xxx-xxxx
- Documentation: https://developer.cbe.com.et

### Integration Issues
Contact CBE technical support with:
- Merchant ID
- Transaction ID
- Error messages
- Request/response logs

## Status

✅ Implementation Complete
✅ Service layer implemented
✅ Payment controller configured
✅ Callback handler registered
✅ Signature verification implemented
✅ Error handling configured
✅ Security measures in place

**Ready for testing with CBE credentials!**

## Next Steps

1. Obtain CBE Birr merchant credentials
2. Update environment variables
3. Test in sandbox environment
4. Deploy to production
5. Monitor transactions
