# Payment Methods Setup Guide

## Current Status

### ✅ Functional Payment Methods
1. **Cash on Delivery** - Fully functional (no API keys needed)
2. **Bank Transfer** - Fully functional (uses configured bank account details)

### ❌ Non-Functional Payment Methods (Need API Keys)
3. **PayPal** - Requires PayPal API credentials
4. **Chapa** - Requires Chapa API credentials (Ethiopian payment gateway)
5. **Telebirr** - Requires Telebirr API credentials (Ethiopian mobile wallet)
6. **CBE Birr** - Requires CBE API credentials (Ethiopian mobile wallet)

---

## Why Only Cash on Delivery Works

The payment methods are **enabled in the database** but **not configured with real API credentials**. The `.env` file contains placeholder values:

```env
# Current (Placeholder values)
CHAPA_SECRET_KEY=your_chapa_secret_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
TELEBIRR_APP_ID=your_telebirr_app_id_here
CBE_MERCHANT_ID=your_cbe_merchant_id_here
```

These need to be replaced with **real API keys** from the respective payment providers.

---

## How to Enable Each Payment Method

### 1. Cash on Delivery ✅ (Already Working)

**Status**: Fully functional  
**Setup Required**: None  
**How it works**: Customer pays when order is delivered

**No configuration needed!**

---

### 2. Bank Transfer ✅ (Already Working)

**Status**: Fully functional  
**Setup Required**: Bank account details (already configured)  
**How it works**: 
1. Customer transfers money to your bank account
2. Customer uploads receipt
3. You verify payment manually

**Current Configuration**:
```env
BANK_ACCOUNT_NAME=Your Business Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_NAME=Commercial Bank of Ethiopia
BANK_BRANCH=Main Branch
```

**To Update**:
1. Open `backend/.env`
2. Update with your real bank details:
   ```env
   BANK_ACCOUNT_NAME=Modo E-Commerce
   BANK_ACCOUNT_NUMBER=[Your Real Account Number]
   BANK_NAME=[Your Bank Name]
   BANK_BRANCH=[Your Branch]
   ```
3. Restart backend server

---

### 3. PayPal ❌ (Needs Setup)

**Status**: Not functional (needs API keys)  
**Provider**: PayPal  
**Best For**: International payments

#### Setup Steps:

1. **Create PayPal Developer Account**:
   - Go to https://developer.paypal.com
   - Sign up or login
   - Go to "My Apps & Credentials"

2. **Create App**:
   - Click "Create App"
   - Choose "Merchant" as app type
   - Note your Client ID and Secret

3. **Configure in .env**:
   ```env
   PAYPAL_CLIENT_ID=[Your Real Client ID]
   PAYPAL_CLIENT_SECRET=[Your Real Client Secret]
   PAYPAL_MODE=sandbox  # Use 'live' for production
   PAYPAL_API_URL=https://api-m.sandbox.paypal.com  # Use live URL for production
   ```

4. **Test in Sandbox**:
   - Use PayPal sandbox accounts for testing
   - Test buyer account: sb-buyer@personal.example.com
   - Test seller account: sb-seller@business.example.com

5. **Go Live**:
   - Switch to live credentials
   - Change `PAYPAL_MODE=live`
   - Update API URL to production

6. **Restart Backend**:
   ```bash
   cd backend
   npm start
   ```

**Documentation**: https://developer.paypal.com/docs/api/overview/

---

### 4. Chapa ❌ (Needs Setup)

**Status**: Not functional (needs API keys)  
**Provider**: Chapa (Ethiopian Payment Gateway)  
**Best For**: Ethiopian customers (local cards, mobile money)

#### Setup Steps:

1. **Create Chapa Account**:
   - Go to https://chapa.co
   - Sign up for merchant account
   - Complete KYC verification

2. **Get API Keys**:
   - Login to Chapa dashboard
   - Go to Settings → API Keys
   - Copy your Secret Key and Public Key

3. **Configure in .env**:
   ```env
   CHAPA_SECRET_KEY=[Your Real Secret Key]
   CHAPA_PUBLIC_KEY=[Your Real Public Key]
   CHAPA_WEBHOOK_SECRET=[Your Webhook Secret]
   CHAPA_API_URL=https://api.chapa.co/v1
   ```

4. **Enable in Database**:
   ```bash
   cd backend
   node scripts/enableChapa.js
   ```

5. **Test**:
   - Use Chapa test cards
   - Test card: 4200 0000 0000 0000

6. **Restart Backend**:
   ```bash
   npm start
   ```

**Documentation**: https://developer.chapa.co/docs

---

### 5. Telebirr ❌ (Needs Setup)

**Status**: Not functional (needs API keys)  
**Provider**: Ethio Telecom  
**Best For**: Ethiopian customers with Telebirr mobile wallet

#### Setup Steps:

1. **Contact Ethio Telecom**:
   - Visit Ethio Telecom office
   - Apply for Telebirr merchant account
   - Provide business documents

2. **Get API Credentials**:
   - Receive App ID and App Key
   - Get Public Key for encryption

3. **Configure in .env**:
   ```env
   TELEBIRR_APP_ID=[Your Real App ID]
   TELEBIRR_APP_KEY=[Your Real App Key]
   TELEBIRR_PUBLIC_KEY=[Your Real Public Key]
   TELEBIRR_API_URL=https://196.188.120.3:38443/ammapi/payment/service-openup/toTradeWebPay
   ```

4. **Enable in Database**:
   ```bash
   cd backend
   node scripts/enableTelebirr.js
   ```

5. **Restart Backend**:
   ```bash
   npm start
   ```

**Contact**: Visit Ethio Telecom office or call 994

---

### 6. CBE Birr ❌ (Needs Setup)

**Status**: Not functional (needs API keys)  
**Provider**: Commercial Bank of Ethiopia  
**Best For**: Ethiopian customers with CBE Birr mobile wallet

#### Setup Steps:

1. **Contact CBE**:
   - Visit Commercial Bank of Ethiopia
   - Apply for CBE Birr merchant account
   - Provide business documents

2. **Get API Credentials**:
   - Receive Merchant ID
   - Get API Key

3. **Configure in .env**:
   ```env
   CBE_MERCHANT_ID=[Your Real Merchant ID]
   CBE_API_KEY=[Your Real API Key]
   CBE_API_URL=https://cbebirr.cbe.com.et/api/v1
   ```

4. **Enable in Database**:
   ```bash
   cd backend
   node scripts/enableCBEBirr.js
   ```

5. **Restart Backend**:
   ```bash
   npm start
   ```

**Contact**: Visit CBE branch or call 8000

---

## Quick Setup for Testing

If you want to test payment methods without real API keys:

### Option 1: Use Only Cash on Delivery and Bank Transfer
These work without any API keys!

### Option 2: Disable Non-Functional Methods

Disable payment methods you're not using:

```bash
cd backend

# Disable PayPal
node scripts/disablePayPal.js

# Disable Chapa
node scripts/disableChapa.js

# Disable Telebirr
node scripts/disableTelebirr.js

# Disable CBE Birr
node scripts/disableCBE.js
```

This will hide them from the checkout page.

### Option 3: Enable PayPal Sandbox (Easiest for Testing)

PayPal is the easiest to set up for testing:

1. Create free PayPal Developer account
2. Get sandbox credentials
3. Update `.env` with sandbox keys
4. Test with sandbox accounts

---

## Checking Payment Method Status

Run this script to see which payment methods are enabled:

```bash
cd backend
node scripts/checkPaymentMethods.js
```

Output shows:
- Which methods are enabled/disabled
- Which methods have API keys configured
- Which methods are ready to use

---

## Recommended Setup for Production

### For Ethiopian Business:
1. ✅ **Cash on Delivery** - Keep enabled
2. ✅ **Bank Transfer** - Keep enabled
3. ✅ **Chapa** - Enable (supports local cards and mobile money)
4. ✅ **Telebirr** - Enable (very popular in Ethiopia)
5. ✅ **CBE Birr** - Enable (widely used)
6. ❌ **PayPal** - Optional (for international customers)

### For International Business:
1. ✅ **Cash on Delivery** - Keep enabled
2. ✅ **Bank Transfer** - Keep enabled
3. ✅ **PayPal** - Enable (international standard)
4. ❌ **Chapa** - Disable (Ethiopia only)
5. ❌ **Telebirr** - Disable (Ethiopia only)
6. ❌ **CBE Birr** - Disable (Ethiopia only)

---

## Testing Payment Methods

### Test Cash on Delivery:
1. Add items to cart
2. Go to checkout
3. Select "Cash on Delivery"
4. Complete order
5. ✅ Should work immediately

### Test Bank Transfer:
1. Add items to cart
2. Go to checkout
3. Select "Bank Transfer"
4. Note the bank details and reference code
5. Upload a test receipt image
6. Complete order
7. ✅ Should work immediately

### Test Other Methods:
1. Configure API keys (see above)
2. Restart backend
3. Add items to cart
4. Go to checkout
5. Select payment method
6. Follow payment flow
7. Verify payment completes

---

## Troubleshooting

### Payment Method Not Showing in Checkout

**Check 1**: Is it enabled in database?
```bash
node scripts/checkPaymentMethods.js
```

**Check 2**: Are API keys configured?
```bash
# Check .env file
cat backend/.env | grep PAYPAL
cat backend/.env | grep CHAPA
```

**Check 3**: Did you restart backend?
```bash
cd backend
npm start
```

### Payment Fails with Error

**For PayPal**:
- Check API keys are correct
- Verify mode (sandbox vs live)
- Check PayPal dashboard for errors

**For Chapa**:
- Verify secret key is correct
- Check Chapa dashboard for transaction
- Ensure webhook URL is configured

**For Telebirr/CBE Birr**:
- Contact provider support
- Verify merchant account is active
- Check API credentials

### Payment Shows as Pending

This is normal for:
- **Bank Transfer**: Requires manual verification
- **Mobile Wallets**: Waiting for customer to complete payment

Check order status in admin dashboard.

---

## Security Notes

1. **Never commit API keys to Git**:
   - `.env` file is in `.gitignore`
   - Never share API keys publicly

2. **Use Environment Variables**:
   - Store all sensitive data in `.env`
   - Never hardcode API keys in code

3. **Rotate Keys Regularly**:
   - Change API keys every 6 months
   - Rotate immediately if compromised

4. **Use Sandbox for Testing**:
   - Never test with live API keys
   - Use sandbox/test mode during development

5. **Verify Webhooks**:
   - Always verify webhook signatures
   - Validate payment status before fulfilling orders

---

## Support

### Payment Provider Support:
- **PayPal**: https://developer.paypal.com/support
- **Chapa**: support@chapa.co
- **Telebirr**: 994 or visit Ethio Telecom
- **CBE Birr**: 8000 or visit CBE branch

### Technical Support:
- Check documentation in `backend/PAYMENT_INTEGRATION_GUIDE.md`
- Check Ethiopian payment guide in `backend/ETHIOPIAN_PAYMENT_INTEGRATION_GUIDE.md`
- Email: support@ecommerce.com

---

## Summary

**Currently Working**:
- ✅ Cash on Delivery (no setup needed)
- ✅ Bank Transfer (bank details configured)

**Need API Keys**:
- ❌ PayPal (easiest to set up for testing)
- ❌ Chapa (for Ethiopian customers)
- ❌ Telebirr (for Ethiopian customers)
- ❌ CBE Birr (for Ethiopian customers)

**Next Steps**:
1. Decide which payment methods you need
2. Get API credentials from providers
3. Update `.env` file with real keys
4. Test each payment method
5. Go live!

---

**Last Updated**: 2026-02-19  
**Status**: Documentation Complete  
**Action Required**: Configure API keys for desired payment methods
