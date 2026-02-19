# Checkout Button Debug Guide

## Quick Test

1. **Open**: http://localhost:3000/cart
2. **Open Console**: Press F12
3. **Click**: "PROCEED TO CHECKOUT" button
4. **Check Console**: You should see:
   ```
   Checkout button clicked!
   Cart total: [number]
   Auth token: exists/missing
   Navigating to checkout...
   ```

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Button does nothing | Check console for errors |
| "Cart is empty" alert | Add items to cart first |
| Redirects to login | Login first |
| No console logs | Refresh page (F5) |

## Pre-Flight Checklist

Before clicking the button, make sure:

✅ **Cart has items** - Add at least one product
✅ **You're logged in** - Check navbar for username
✅ **Frontend running** - http://localhost:3000 loads
✅ **Backend running** - http://localhost:5000 responds
✅ **Console open** - Press F12 to see debug logs

## Quick Tests

### Test 1: Check Cart Has Items
```javascript
// In browser console
console.log('Cart items:', document.querySelectorAll('.cart-format').length);
```

### Test 2: Check Login Status
```javascript
// In browser console
console.log('Logged in:', !!localStorage.getItem('auth-token'));
```

### Test 3: Manual Navigation
```javascript
// In browser console
window.location.href = '/checkout';
```

## What Should Happen

### Scenario 1: Empty Cart
- Click button → Alert "Your cart is empty!"

### Scenario 2: Not Logged In
- Click button → Alert "Please login..." → Redirect to /login

### Scenario 3: Success
- Click button → Navigate to /checkout page

## Debug Logs Added

The button now logs:
1. ✅ Button click detected
2. ✅ Cart total amount
3. ✅ Auth token status
4. ✅ Navigation attempt

## Next Step

**Test the button and report what you see in the console!**

If you see the debug logs, we can identify exactly where the issue is.
