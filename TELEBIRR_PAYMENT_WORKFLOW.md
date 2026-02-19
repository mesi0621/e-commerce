# Telebirr Payment Workflow Documentation

## Overview
Complete implementation of Telebirr (Ethio Telecom) mobile money payment integration. Telebirr allows customers to pay directly from their mobile phone using their Telebirr wallet.

## Payment Flow

### 1. Customer Selects "Pay with Telebirr"
**Location:** Checkout page (`frontend/src/Pages/Checkout.jsx`)

When customer selects Telebirr as payment method:
- Payment method is set to `'telebirr'`
- Customer fills shipping address and phone number
- Clicks "Place Order"

### 2. Order Creation
**Endpoint:** `POST /api/orders`

- Order is created with status: `pending`
- Payment status: `pending`
- Order details saved to database

### 3. Backend Generates Transaction ID
**Endpoint:** `POST /api/payments/process`
**Handler:** `PaymentController.processPayment()` → `processTelebirr()`

Backend generates unique transaction ID:
```javascript
const transactionId = `TLB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### 4. Send Request to Telebirr API
**Service:** `TelebirrService.initializePayment()`
**File:** `backend/services/TelebirrService.js`

Request sent to Telebirr API:
```javascript
POST https://196.188.120.3:38443/ammapi/payment/service-openup/toTradeWebPay
Headers:
  - Content-Type: application/json
Body:
  - appId: {TELEBIRR_APP_ID}
  - appKey: {TELEBIRR_APP_KEY}
  - merOrderId: {order.orderNumber}
  - amount: {order.total}
  - phoneNumber: {customer.phone}
  - notifyUrl: 'http://localhost:5000/api/payments/telebirr/notify'
  - returnUrl: 'http://localhost:3000/payment/success'
  - timestamp: {current_timestamp}
  - sign: {RSA signature}
```

**Includes:**
- ✅ Phone number (customer's mobile)
- ✅ Amount (order total)
- ✅ Order ID (unique order number)
- ✅ Transaction ID
- ✅ Callback URLs

**Response:**
```javascript
{
    code: 0,
    msg: 'success',
    data: {
        prepayId: 'TLB-PREPAY-123456',
        paymentUrl: 'https://app.ethiotelecom.et/pay/...',
        toPayUrl: 'telebirr://pay?prepayId=...'
    }
}
```

### 5. Telebirr Sends Payment Request to User's Phone
**Method:** Push notification or redirect

Two ways to initiate payment:

**Option A: Web Redirect**
```javascript
// Customer redirected to Telebirr web page
window.location.href = paymentData.data.payment.paymentUrl;
```

**Option B: Deep Link (Mobile App)**
```javascript
// Opens Telebirr mobile app directly
window.location.href = response.data.toPayUrl;
```

### 6. Customer Enters PIN on Phone
**External:** Telebirr mobile app or web interface

Customer workflow:
1. Receives payment request notification
2. Opens Telebirr app (or web page)
3. Reviews transaction details:
   - Merchant: Modo E-Commerce
   - Amount: {total} ETB
   - Order: {orderNumber}
4. Enters Telebirr PIN
5. Confirms payment

### 7. Telebirr Sends Response to Backend
**Endpoint:** `POST /api/payments/telebirr/notify`
**Handler:** `PaymentController.telebirrNotify()`

Telebirr sends notification:
```javascript
POST http://localhost:5000/api/payments/telebirr/notify
Body:
  - merOrderId: {order.orderNumber}
  - tradeNo: {telebirr_transaction_id}
  - tradeStatus: 'SUCCESS' | 'FAILED'
  - amount: {payment_amount}
  - timestamp: {timestamp}
  - sign: {RSA signature}
```

### 8. Backend Verifies Response

**Verification Steps:**
1. Verify RSA signature
2. Validate transaction data
3. Check order exists
4. Verify amount matches
5. Check transaction not already processed

```javascript
const isValid = TelebirrService.verifyNotification(notificationData);

if (!isValid) {
    return res.status(401).json({
        success: false,
        error: 'Invalid signature'
    });
}
```

### 9. Update Order Status

#### IF payment == success:
```javascript
if (tradeStatus === 'SUCCESS') {
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentDetails = {
        transactionId: tradeNo,
        paymentDate: new Date(),
        paymentGatewayResponse: notificationData
    };
    order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Payment confirmed via Telebirr'
    });
    await order.save();
    
    // Send confirmation email
    await EmailService.sendOrderConfirmation(order);
    
    // Clear cart
    await CartService.clearCart(order.userId);
    
    // Update inventory
    await InventoryService.decrementStock(order.items);
}
```

**Actions:**
- ✅ Mark order as PAID
- ✅ Update payment status to 'completed'
- ✅ Save transaction ID
- ✅ Send confirmation email
- ✅ Clear customer's cart
- ✅ Update product inventory
- ✅ Create audit log

#### ELSE (payment failed):
```javascript
else {
    order.paymentStatus = 'failed';
    order.statusHistory.push({
        status: 'failed',
        timestamp: new Date(),
        note: 'Payment failed via Telebirr'
    });
    await order.save();
    
    // Send failure notification
    await EmailService.sendPaymentFailed(order);
}
```

**Actions:**
- ❌ Show failed message to customer
- ❌ Mark payment as failed
- ❌ Keep order in pending state
- ❌ Send failure notification
- ❌ Allow customer to retry

### 10. Customer Notification

**Success:**
```
✅ Payment Successful!
Your order #ORDER-123 has been confirmed.
Amount: 1,500 ETB
Payment Method: Telebirr
Transaction ID: TLB-123456
```

**Failure:**
```
❌ Payment Failed
Your payment could not be processed.
Reason: Insufficient balance / PIN incorrect / Transaction cancelled
Please try again or use another payment method.
```

## Configuration

### Environment Variables

**Backend (.env):**
```env
# Telebirr Configuration
TELEBIRR_APP_ID=your_app_id_here
TELEBIRR_APP_KEY=your_app_key_here
TELEBIRR_PUBLIC_KEY=your_public_key_here
TELEBIRR_API_URL=https://196.188.120.3:38443/ammapi/payment/service-openup/toTradeWebPay

# Base URL for callbacks
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Payment Method Setup

Enable Telebirr in database:
```bash
cd backend
node scripts/enableTelebirr.js
```

Or manually:
```javascript
{
    name: 'telebirr',
    displayName: 'Telebirr',
    type: 'mobile_money',
    description: 'Pay with Telebirr mobile wallet',
    isActive: true,
    icon: '📱',
    fees: {
        fixed: 0,
        percentage: 0
    },
    config: {
        appId: process.env.TELEBIRR_APP_ID,
        apiUrl: process.env.TELEBIRR_API_URL
    }
}
```

## Technical Implementation

### Service Layer
**File:** `backend/services/TelebirrService.js`

Key methods:
```javascript
class TelebirrService {
    // Initialize payment
    async initializePayment(paymentData) {
        // Generate signature
        // Send request to Telebirr API
        // Return payment URL
    }
    
    // Verify notification signature
    verifyNotification(notificationData) {
        // Verify RSA signature
        // Validate data integrity
    }
    
    // Query payment status
    async queryPayment(orderId) {
        // Check payment status
        // Return current state
    }
    
    // Refund payment
    async refundPayment(transactionId, amount, reason) {
        // Process refund
        // Return refund status
    }
}
```

### Controller Layer
**File:** `backend/controllers/PaymentController.js`

```javascript
// Process Telebirr payment
async function processTelebirr(order, paymentDetails, user) {
    const result = await TelebirrService.initializePayment({
        amount: order.total,
        orderId: order.orderNumber,
        phoneNumber: paymentDetails.phoneNumber || user.phone,
        notifyUrl: `${baseUrl}/api/payments/telebirr/notify`,
        returnUrl: `${frontendUrl}/payment/success`
    });
    
    return {
        success: true,
        status: 'pending',
        transactionId: result.prepayId,
        paymentUrl: result.paymentUrl,
        response: result.data
    };
}

// Handle Telebirr notification
async function telebirrNotify(req, res) {
    // Verify signature
    // Update order
    // Send response
}
```

### Routes
**File:** `backend/routes/payments.js`

```javascript
// Webhook endpoint (no auth - verified by signature)
router.post('/telebirr/notify', PaymentController.telebirrNotify);

// Return URL endpoint
router.get('/telebirr/return', PaymentController.telebirrReturn);

// Query payment status
router.get('/telebirr/query/:orderId', verifyToken, PaymentController.queryTelebirrPayment);
```

## API Endpoints

### 1. Initialize Payment
```
POST /api/payments/process
Authorization: Bearer {token}
Body: {
    orderId: "ORDER-123",
    paymentMethod: "telebirr",
    paymentDetails: {
        phoneNumber: "+251912345678"
    }
}

Response: {
    success: true,
    data: {
        order: {...},
        payment: {
            transactionId: "TLB-PREPAY-123",
            paymentUrl: "https://app.ethiotelecom.et/pay/...",
            status: "pending"
        }
    }
}
```

### 2. Notification Handler (Webhook)
```
POST /api/payments/telebirr/notify
Body: {
    merOrderId: "ORDER-123",
    tradeNo: "TLB-TXN-456",
    tradeStatus: "SUCCESS",
    amount: "1500.00",
    timestamp: "2024-01-01T00:00:00Z",
    sign: "{RSA_signature}"
}

Response: {
    success: true
}
```

### 3. Query Payment Status
```
GET /api/payments/telebirr/query/:orderId
Authorization: Bearer {token}

Response: {
    success: true,
    data: {
        orderId: "ORDER-123",
        status: "SUCCESS",
        transactionId: "TLB-TXN-456",
        amount: 1500
    }
}
```

### 4. Return URL Handler
```
GET /api/payments/telebirr/return?orderId=ORDER-123&status=success

Redirects to: http://localhost:3000/payment/success?orderId=ORDER-123
```

## Security Features

### 1. RSA Signature Verification
All notifications are signed with RSA:
```javascript
const crypto = require('crypto');

function verifyNotification(data) {
    const { sign, ...dataToVerify } = data;
    
    const signString = Object.keys(dataToVerify)
        .sort()
        .map(key => `${key}=${dataToVerify[key]}`)
        .join('&');
    
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signString);
    
    return verifier.verify(
        publicKey,
        sign,
        'base64'
    );
}
```

### 2. Request Signing
All requests to Telebirr are signed:
```javascript
function generateSignature(data) {
    const signString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('&');
    
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signString);
    
    return signer.sign(privateKey, 'base64');
}
```

### 3. Data Validation
- Phone number format validation
- Amount verification
- Order existence check
- Duplicate transaction prevention
- Timestamp validation

### 4. Secure Communication
- HTTPS only
- API key authentication
- Request/response signing
- Callback signature verification

## Error Handling

### Configuration Errors
```javascript
if (!appId || appId === 'your_telebirr_app_id_here') {
    return {
        success: false,
        error: 'Telebirr payment gateway is not configured'
    };
}
```

### Network Errors
```javascript
try {
    const response = await axios.post(apiUrl, data, { timeout: 30000 });
} catch (error) {
    return {
        success: false,
        error: 'Telebirr payment gateway is currently unavailable'
    };
}
```

### Payment Failures
- Insufficient balance
- Incorrect PIN
- Transaction cancelled by user
- Network timeout
- Invalid phone number

### Error Messages
```javascript
const errorMessages = {
    'INSUFFICIENT_BALANCE': 'Insufficient balance in Telebirr wallet',
    'INVALID_PIN': 'Incorrect PIN entered',
    'CANCELLED': 'Transaction cancelled by user',
    'TIMEOUT': 'Transaction timed out',
    'INVALID_PHONE': 'Invalid phone number'
};
```

## Testing

### Test Script
```bash
cd backend
node scripts/testTelebirr.js
```

**Script output:**
```
✅ Connected to MongoDB
✅ Telebirr payment method found
📋 Configuration Status: ⚠️ Requires credentials
🔄 Payment Workflow: Ready
📝 API Endpoints: Configured
```

### Enable Telebirr
```bash
cd backend
node scripts/enableTelebirr.js
```

### Manual Testing Steps

1. **Configure Telebirr:**
```env
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key
TELEBIRR_PUBLIC_KEY=your_public_key
```

2. **Start servers:**
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start
```

3. **Test payment flow:**
- Add items to cart
- Go to checkout
- Enter phone number: +251912345678
- Select "Telebirr"
- Click "Place Order"
- Complete payment on phone

4. **Verify:**
- Check backend logs for notification
- Verify signature validation
- Check order status updated
- Confirm email sent

## Phone Number Format

Telebirr requires Ethiopian phone numbers:
```javascript
// Valid formats
+251912345678  // International format
0912345678     // Local format
251912345678   // Without +

// Validation
function validatePhoneNumber(phone) {
    const regex = /^(\+?251|0)?9\d{8}$/;
    return regex.test(phone);
}
```

## Monitoring & Logging

### Payment Events
```javascript
console.log('Telebirr payment initialized:', {
    orderId,
    amount,
    phoneNumber,
    prepayId
});

console.log('Telebirr notification received:', {
    merOrderId,
    tradeStatus,
    tradeNo
});
```

### Audit Trail
```javascript
{
    action: 'telebirr_payment_initiated',
    userId: ObjectId,
    details: {
        orderId: 'ORDER-123',
        amount: 1500,
        phoneNumber: '+251912345678'
    },
    timestamp: Date,
    ipAddress: String
}
```

## Troubleshooting

### Issue: Payment URL not generated
**Solution:**
- Check Telebirr credentials in .env
- Verify API URL is correct
- Check phone number format
- Review backend logs

### Issue: Notification not received
**Solution:**
- Verify notifyUrl is publicly accessible
- Check firewall settings
- Ensure webhook is registered with Telebirr
- Test notification URL manually

### Issue: Signature verification fails
**Solution:**
- Verify public key is correct
- Check signature algorithm (RSA-SHA256)
- Ensure data format matches
- Review Telebirr documentation

### Issue: Payment stuck in pending
**Solution:**
- Query payment status via API
- Check Telebirr dashboard
- Verify notification was received
- Manually verify transaction

## Production Checklist

- [ ] Obtain production Telebirr credentials
- [ ] Update environment variables
- [ ] Configure production notification URL
- [ ] Test with real phone numbers
- [ ] Set up monitoring and alerts
- [ ] Configure error notifications
- [ ] Document support procedures
- [ ] Train support staff
- [ ] Set up refund procedures
- [ ] Configure reconciliation process

## Support

### Telebirr Support
- Email: support@ethiotelecom.et
- Phone: 127 (from Ethio Telecom line)
- Documentation: https://developer.ethiotelecom.et

### Integration Issues
Contact Telebirr technical support with:
- App ID
- Transaction ID
- Error messages
- Request/response logs

## Status

✅ Implementation Complete
✅ Service layer implemented
✅ Payment controller configured
✅ Notification handler registered
✅ Signature verification implemented
✅ Error handling configured
✅ Security measures in place

**Ready for testing with Telebirr credentials!**

## Comparison: Telebirr vs CBE Birr

| Feature | Telebirr | CBE Birr |
|---------|----------|----------|
| **Provider** | Ethio Telecom | Commercial Bank of Ethiopia |
| **Type** | Mobile Money | Bank Account |
| **Authentication** | PIN on phone | Login on website |
| **Payment Method** | Push notification | Web redirect |
| **Speed** | Instant (seconds) | Fast (1-2 minutes) |
| **User Experience** | Mobile-first | Web-based |
| **Signature** | RSA-SHA256 | HMAC-SHA256 |
| **Callback** | Async notification | Webhook |
| **Refunds** | Supported | Supported |

## Next Steps

1. Obtain Telebirr merchant credentials from Ethio Telecom
2. Update environment variables with production credentials
3. Test in sandbox environment
4. Deploy to production
5. Monitor transactions and notifications
