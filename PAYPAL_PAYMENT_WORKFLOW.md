# PayPal Payment Workflow Documentation

## Overview
Complete implementation of PayPal payment integration for Modo E-Commerce platform. PayPal allows customers to pay securely using their PayPal account or credit/debit cards.

## Payment Flow

### 1. Customer Selects "Pay with PayPal"
**Location:** Checkout page (`frontend/src/Pages/Checkout.jsx`)

When customer selects PayPal as payment method:
- Payment method is set to `'paypal'`
- Customer fills shipping address
- Clicks "Place Order"

### 2. Order Creation
**Endpoint:** `POST /api/orders`

- Order is created with status: `pending`
- Payment status: `pending`
- Order details saved to database

### 3. Backend Creates PayPal Order
**Endpoint:** `POST /api/payments/process`
**Handler:** `PaymentController.processPayment()` → `processPayPal()`

### 4. Create PayPal Order via API
**Service:** `PayPalService.createOrder()`
**File:** `backend/services/PayPalService.js`

Request sent to PayPal API:
```javascript
POST https://api-m.sandbox.paypal.com/v2/checkout/orders
Headers:
  - Authorization: Basic {base64(clientId:secret)}
  - Content-Type: application/json
Body:
  {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: order.orderNumber,
      amount: {
        currency_code: 'USD',
        value: order.total.toFixed(2)
      },
      description: `Order ${order.orderNumber}`
    }],
    application_context: {
      brand_name: 'Modo E-Commerce',
      landing_page: 'LOGIN',
      user_action: 'PAY_NOW',
      return_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel'
    }
  }
```

**Includes:**
- ✅ Amount (order total)
- ✅ Currency (USD, EUR, etc.)
- ✅ Order reference ID
- ✅ Return URLs (success/cancel)
- ✅ Brand name

**Response:**
```javascript
{
    id: 'PAYPAL-ORDER-123456',
    status: 'CREATED',
    links: [
        {
            rel: 'approve',
            href: 'https://www.paypal.com/checkoutnow?token=...',
            method: 'GET'
        },
        {
            rel: 'capture',
            href: 'https://api-m.paypal.com/v2/checkout/orders/PAYPAL-ORDER-123456/capture',
            method: 'POST'
        }
    ]
}
```

### 5. Get Approval URL
**Backend extracts approval URL:**
```javascript
const approvalUrl = response.links.find(link => link.rel === 'approve').href;

return {
    success: true,
    status: 'pending',
    transactionId: response.id,
    approvalUrl: approvalUrl,
    response: response
};
```

### 6. Redirect Customer to PayPal Login Page
**Frontend:** `Checkout.jsx` handles redirect

```javascript
if (paymentData.data.payment.approvalUrl) {
    toast.info('Redirecting to PayPal...');
    setTimeout(() => {
        window.location.href = paymentData.data.payment.approvalUrl;
    }, 1500);
}
```

Customer is redirected to PayPal's secure checkout page.

### 7. Customer Logs In and Approves Payment
**External:** PayPal website

Customer workflow:
1. Lands on PayPal login page
2. Logs in with PayPal credentials (or continues as guest)
3. Reviews transaction details:
   - Merchant: Modo E-Commerce
   - Amount: $XX.XX USD
   - Order: ORDER-123
4. Clicks "Pay Now" or "Complete Purchase"
5. PayPal processes the payment

### 8. PayPal Redirects to Success URL
**Return URL:** `http://localhost:3000/payment/success?token=PAYPAL-ORDER-123456&PayerID=PAYER123`

PayPal redirects customer back to your site with:
- `token`: PayPal Order ID
- `PayerID`: PayPal Payer ID

### 9. Backend Captures Payment
**Endpoint:** `POST /api/payments/paypal/capture/:orderId`
**Handler:** `PaymentController.capturePayPalPayment()`

### 10. Capture Payment Using Order ID
**Service:** `PayPalService.capturePayment()`

Request sent to PayPal:
```javascript
POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{orderId}/capture
Headers:
  - Authorization: Basic {base64(clientId:secret)}
  - Content-Type: application/json
```

**Response:**
```javascript
{
    id: 'PAYPAL-ORDER-123456',
    status: 'COMPLETED',
    purchase_units: [{
        payments: {
            captures: [{
                id: 'CAPTURE-123',
                status: 'COMPLETED',
                amount: {
                    currency_code: 'USD',
                    value: '100.00'
                }
            }]
        }
    }]
}
```

### 11. Verify Payment Status

**Backend verification:**
```javascript
const captureResult = await PayPalService.capturePayment(orderId);

if (!captureResult.success) {
    return {
        success: false,
        error: 'Failed to capture PayPal payment'
    };
}

const status = captureResult.status; // 'COMPLETED' or other
```

### 12. Update Order Status

#### IF status == COMPLETED:
```javascript
if (status === 'COMPLETED') {
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentDetails = {
        transactionId: orderId,
        captureId: captureResult.captureId,
        paymentDate: new Date(),
        paymentGatewayResponse: captureResult.data
    };
    order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Payment captured via PayPal'
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
- ✅ Save order
- ✅ Mark as PAID
- ✅ Update payment status to 'completed'
- ✅ Save capture ID
- ✅ Send confirmation email
- ✅ Clear customer's cart
- ✅ Update product inventory
- ✅ Create audit log

#### ELSE (Payment Failed/Cancelled):
```javascript
else {
    order.paymentStatus = 'failed';
    order.statusHistory.push({
        status: 'failed',
        timestamp: new Date(),
        note: `PayPal payment ${status}`
    });
    await order.save();
    
    // Send failure notification
    await EmailService.sendPaymentFailed(order);
}
```

**Actions:**
- ❌ Cancel order
- ❌ Mark payment as failed
- ❌ Send failure notification
- ❌ Allow customer to retry

### 13. Customer Notification

**Success:**
```
✅ Payment Successful!
Your order #ORDER-123 has been confirmed.
Amount: $100.00 USD
Payment Method: PayPal
Transaction ID: PAYPAL-ORDER-123456
Capture ID: CAPTURE-123
```

**Failure:**
```
❌ Payment Failed
Your PayPal payment could not be processed.
Reason: Payment cancelled / Insufficient funds / Card declined
Please try again or use another payment method.
```

## Configuration

### Environment Variables

**Backend (.env):**
```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# For production:
# PAYPAL_MODE=live
# PAYPAL_API_URL=https://api-m.paypal.com

# Base URLs
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Payment Method Setup

Enable PayPal in database:
```bash
cd backend
node scripts/enablePayPal.js
```

Or manually:
```javascript
{
    name: 'paypal',
    displayName: 'PayPal',
    type: 'digital_wallet',
    description: 'Pay securely with PayPal',
    isActive: true,
    icon: '💳',
    fees: {
        fixed: 0.30,
        percentage: 2.9
    },
    config: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        mode: process.env.PAYPAL_MODE
    }
}
```

## Technical Implementation

### Service Layer
**File:** `backend/services/PayPalService.js`

Key methods:
```javascript
class PayPalService {
    // Get access token
    async getAccessToken() {
        // Authenticate with PayPal
        // Return bearer token
    }
    
    // Create order
    async createOrder(orderData) {
        // Create PayPal order
        // Return order ID and approval URL
    }
    
    // Capture payment
    async capturePayment(orderId) {
        // Capture authorized payment
        // Return capture details
    }
    
    // Get order details
    async getOrderDetails(orderId) {
        // Fetch order information
        // Return order status
    }
    
    // Refund payment
    async refundPayment(captureId, amount, reason) {
        // Process refund
        // Return refund status
    }
}
```

### Controller Layer
**File:** `backend/controllers/PaymentController.js`

```javascript
// Process PayPal payment
async function processPayPal(order, paymentDetails) {
    const result = await PayPalService.createOrder({
        amount: order.total,
        currency: 'USD',
        returnUrl: `${frontendUrl}/payment/success`,
        cancelUrl: `${frontendUrl}/payment/cancel`,
        orderId: order.orderNumber
    });
    
    return {
        success: true,
        status: 'pending',
        transactionId: result.orderId,
        approvalUrl: result.approvalUrl,
        response: result.data
    };
}

// Capture PayPal payment
async function capturePayPalPayment(req, res) {
    const { orderId } = req.params;
    
    const result = await PayPalService.capturePayment(orderId);
    
    if (result.status === 'COMPLETED') {
        // Update order
        const order = await Order.findOne({
            'paymentDetails.transactionId': orderId
        });
        
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        await order.save();
    }
    
    res.json(result);
}
```

### Routes
**File:** `backend/routes/payments.js`

```javascript
// Capture payment endpoint
router.post('/paypal/capture/:orderId', PaymentController.capturePayPalPayment);

// Get order details
router.get('/paypal/order/:orderId', verifyToken, PaymentController.getPayPalOrder);

// Webhook endpoint (optional)
router.post('/paypal/webhook', PaymentController.paypalWebhook);
```

## API Endpoints

### 1. Initialize Payment
```
POST /api/payments/process
Authorization: Bearer {token}
Body: {
    orderId: "ORDER-123",
    paymentMethod: "paypal",
    paymentDetails: {
        email: "customer@example.com"
    }
}

Response: {
    success: true,
    data: {
        order: {...},
        payment: {
            transactionId: "PAYPAL-ORDER-123",
            approvalUrl: "https://www.paypal.com/checkoutnow?token=...",
            status: "pending"
        }
    }
}
```

### 2. Capture Payment
```
POST /api/payments/paypal/capture/:orderId

Response: {
    success: true,
    status: "COMPLETED",
    captureId: "CAPTURE-123",
    data: {
        id: "PAYPAL-ORDER-123",
        status: "COMPLETED",
        ...
    }
}
```

### 3. Get Order Details
```
GET /api/payments/paypal/order/:orderId
Authorization: Bearer {token}

Response: {
    success: true,
    data: {
        id: "PAYPAL-ORDER-123",
        status: "COMPLETED",
        amount: {
            currency_code: "USD",
            value: "100.00"
        }
    }
}
```

### 4. Webhook Handler (Optional)
```
POST /api/payments/paypal/webhook
Headers: {
    PAYPAL-TRANSMISSION-ID: "...",
    PAYPAL-TRANSMISSION-TIME: "...",
    PAYPAL-TRANSMISSION-SIG: "..."
}
Body: {
    event_type: "PAYMENT.CAPTURE.COMPLETED",
    resource: {...}
}
```

## Security Features

### 1. OAuth 2.0 Authentication
All requests use OAuth 2.0:
```javascript
async function getAccessToken() {
    const auth = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString('base64');
    
    const response = await axios.post(
        `${apiUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    
    return response.data.access_token;
}
```

### 2. Webhook Signature Verification
Verify webhook authenticity:
```javascript
function verifyWebhookSignature(headers, body) {
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    // Verify signature using PayPal SDK
    return PayPalSDK.verifyWebhookSignature({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: body
    });
}
```

### 3. Data Validation
- Order existence check
- Amount verification
- Currency validation
- Status verification
- Duplicate capture prevention

### 4. Secure Communication
- HTTPS only
- OAuth 2.0 authentication
- Webhook signature verification
- Token expiration handling

## Error Handling

### Configuration Errors
```javascript
if (!clientId || clientId === 'your_paypal_client_id_here') {
    return {
        success: false,
        error: 'PayPal payment gateway is not configured'
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
        error: 'PayPal payment gateway is currently unavailable'
    };
}
```

### Payment Failures
- Payment cancelled by user
- Insufficient funds
- Card declined
- Invalid credentials
- Network timeout

### Error Messages
```javascript
const errorMessages = {
    'INSTRUMENT_DECLINED': 'Payment method declined',
    'INSUFFICIENT_FUNDS': 'Insufficient funds',
    'PAYER_CANNOT_PAY': 'Payer cannot complete payment',
    'TRANSACTION_REFUSED': 'Transaction refused by PayPal',
    'INTERNAL_SERVER_ERROR': 'PayPal service error'
};
```

## Currency Support

PayPal supports multiple currencies:
```javascript
const supportedCurrencies = [
    'USD', // US Dollar
    'EUR', // Euro
    'GBP', // British Pound
    'CAD', // Canadian Dollar
    'AUD', // Australian Dollar
    'JPY', // Japanese Yen
    // ... and many more
];

// Convert ETB to USD (example)
function convertCurrency(amountETB) {
    const exchangeRate = 0.018; // 1 ETB = 0.018 USD (example)
    return (amountETB * exchangeRate).toFixed(2);
}
```

## Testing

### Sandbox Mode

PayPal provides sandbox environment:
```env
PAYPAL_MODE=sandbox
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_CLIENT_SECRET=sandbox_secret
```

### Test Accounts

Create test accounts at: https://developer.paypal.com/dashboard/accounts

**Test Buyer Account:**
- Email: buyer@example.com
- Password: test1234
- Balance: $9,999.00

**Test Seller Account:**
- Email: seller@example.com
- Password: test1234

### Test Cards

PayPal sandbox accepts test cards:
```
Visa: 4032039974619896
Mastercard: 5425233430109903
Amex: 374245455400126
```

### Manual Testing Steps

1. **Configure PayPal:**
```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox
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
- Select "PayPal"
- Click "Place Order"
- Login with test account
- Approve payment
- Verify order confirmed

4. **Verify:**
- Check PayPal sandbox dashboard
- Verify capture was successful
- Check order status updated
- Confirm email sent

## Monitoring & Logging

### Payment Events
```javascript
console.log('PayPal order created:', {
    orderId: paypalOrderId,
    amount,
    currency,
    approvalUrl
});

console.log('PayPal payment captured:', {
    orderId,
    captureId,
    status,
    amount
});
```

### Audit Trail
```javascript
{
    action: 'paypal_payment_initiated',
    userId: ObjectId,
    details: {
        orderId: 'ORDER-123',
        paypalOrderId: 'PAYPAL-ORDER-123',
        amount: 100,
        currency: 'USD'
    },
    timestamp: Date,
    ipAddress: String
}
```

## Troubleshooting

### Issue: Approval URL not generated
**Solution:**
- Check PayPal credentials in .env
- Verify API URL is correct (sandbox vs live)
- Check amount format (must be string with 2 decimals)
- Review backend logs

### Issue: Capture fails
**Solution:**
- Verify order was approved by customer
- Check order ID is correct
- Ensure order hasn't been captured already
- Review PayPal dashboard for details

### Issue: Customer not redirected back
**Solution:**
- Verify return URL is correct
- Check return URL is publicly accessible
- Ensure frontend is running
- Test return URL manually

### Issue: Webhook not received
**Solution:**
- Verify webhook URL in PayPal dashboard
- Check webhook signature verification
- Ensure endpoint is publicly accessible
- Test webhook URL manually

## Production Checklist

- [ ] Obtain production PayPal credentials
- [ ] Update environment variables
- [ ] Change mode from sandbox to live
- [ ] Update API URL to production
- [ ] Configure production return URLs
- [ ] Set up webhook endpoints
- [ ] Test with real transactions
- [ ] Set up monitoring and alerts
- [ ] Configure error notifications
- [ ] Document support procedures
- [ ] Train support staff
- [ ] Set up refund procedures

## PayPal Dashboard

Access your PayPal dashboard:
- **Sandbox:** https://developer.paypal.com/dashboard
- **Production:** https://www.paypal.com/businessmanage

Features:
- View transactions
- Manage webhooks
- Create test accounts
- View API credentials
- Generate reports
- Process refunds

## Support

### PayPal Support
- Developer Portal: https://developer.paypal.com
- Documentation: https://developer.paypal.com/docs/api/overview
- Support: https://www.paypal.com/us/smarthelp/contact-us
- Community: https://www.paypal-community.com

### Integration Issues
Contact PayPal support with:
- Client ID
- Order ID
- Error messages
- Request/response logs

## Status

✅ Implementation Complete
✅ Service layer implemented
✅ Payment controller configured
✅ Capture endpoint registered
✅ OAuth 2.0 authentication implemented
✅ Error handling configured
✅ Security measures in place

**Ready for testing with PayPal sandbox credentials!**

## Comparison: PayPal vs Other Methods

| Feature | PayPal | CBE Birr | Telebirr |
|---------|--------|----------|----------|
| **Provider** | PayPal Inc. | CBE | Ethio Telecom |
| **Type** | Digital Wallet | Bank Account | Mobile Money |
| **Currency** | Multi-currency | ETB only | ETB only |
| **International** | Yes | No | No |
| **Speed** | 1-2 minutes | 1-2 minutes | Instant |
| **User Experience** | Web-based | Web-based | Mobile-first |
| **Authentication** | Login | Login | PIN |
| **Fees** | 2.9% + $0.30 | ~1-2% | ~1-2% |
| **Refunds** | Supported | Supported | Supported |

## Next Steps

1. Obtain PayPal business account
2. Get sandbox credentials for testing
3. Update environment variables
4. Test in sandbox environment
5. Apply for production credentials
6. Deploy to production
7. Monitor transactions

---

**Implementation Date:** February 18, 2026
**Status:** ✅ COMPLETE
**Ready for Testing:** YES
