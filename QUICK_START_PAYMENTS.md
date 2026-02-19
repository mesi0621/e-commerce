# Quick Start Guide - Payment Integration

## ✅ What's Been Done

All payment APIs have been successfully integrated:
- ✅ Chapa (Ethiopian payment gateway)
- ✅ PayPal (International payments)
- ✅ Telebirr (Ethiopian mobile money)
- ✅ CBE Birr (Commercial Bank of Ethiopia)
- ✅ Cash on Delivery
- ✅ Bank Transfer

## 🚀 Quick Setup (3 Steps)

### Step 1: Get API Credentials

#### Chapa
1. Sign up at https://chapa.co
2. Go to Dashboard → Settings → API Keys
3. Copy your Secret Key and Public Key

#### PayPal
1. Go to https://developer.paypal.com
2. Create a REST API app
3. Copy Client ID and Client Secret

#### Telebirr
- Contact Ethio Telecom for merchant account
- Get App ID, App Key, and Public Key

#### CBE Birr
- Contact Commercial Bank of Ethiopia
- Register as merchant
- Get Merchant ID and API Key

### Step 2: Update .env File

Open `backend/.env` and add your credentials:

```env
# Chapa
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxx
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-xxxxxxxxxx
CHAPA_WEBHOOK_SECRET=your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox

# Telebirr (if you have credentials)
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key

# CBE Birr (if you have credentials)
CBE_MERCHANT_ID=your_merchant_id
CBE_API_KEY=your_api_key
```

### Step 3: Setup Payment Methods

Run this command:
```bash
cd backend
npm run setup:payments
```

## ✅ Done! Payment System Ready

## 🧪 Testing

### Test with Chapa (Easiest to start)

1. Create an order in your app
2. Choose Chapa as payment method
3. Use test card: **4200 0000 0000 0000**
4. CVV: Any 3 digits
5. Expiry: Any future date

### Test with PayPal

1. Create sandbox buyer account at https://developer.paypal.com
2. Create an order
3. Choose PayPal
4. Login with sandbox account
5. Approve payment

## 📱 Frontend Integration

### Process Payment

```javascript
// When user clicks "Pay Now"
const response = await fetch('http://localhost:5000/api/payments/process', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: order._id,
    paymentMethod: 'chapa', // or 'paypal', 'telebirr', 'cbe', etc.
    paymentDetails: {
      email: user.email,
      firstName: user.username,
      phoneNumber: '+251912345678'
    }
  })
});

const data = await response.json();

// Redirect user to payment page
if (data.success && data.data.payment.paymentUrl) {
  window.location.href = data.data.payment.paymentUrl;
}
```

### Check Payment Status

```javascript
const response = await fetch(`http://localhost:5000/api/payments/${orderId}/status`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Payment Status:', data.data.paymentStatus);
```

## 🔒 Security Checklist

- ✅ API keys stored in .env (never in code)
- ✅ Webhook signatures verified automatically
- ✅ All requests use HTTPS in production
- ✅ Sensitive data encrypted in database

## 📚 Full Documentation

For detailed information, see:
- `backend/PAYMENT_INTEGRATION_GUIDE.md` - Complete setup guide
- `PAYMENT_API_INTEGRATION_COMPLETE.md` - Technical details

## 🆘 Need Help?

### Common Issues

**"Payment initialization fails"**
- Check API keys in .env are correct
- Verify amount is valid (minimum 1 ETB/USD)

**"Webhook not working"**
- Make sure your server is publicly accessible
- Configure webhook URL in payment gateway dashboard

**"PayPal token error"**
- Verify Client ID and Secret match the mode (sandbox/live)

### Support

- Chapa: support@chapa.co
- PayPal: https://developer.paypal.com/support

## 🎉 You're All Set!

Your payment system is ready to accept payments. Start testing with Chapa or PayPal sandbox mode.
