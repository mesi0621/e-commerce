# Testing Guide - Cart and Payment System

## Prerequisites
- Backend server running on port 5000 ✓
- Frontend server running on port 3000 ✓
- MongoDB connected ✓

## Test 1: User Login
1. Open browser to `http://localhost:3000`
2. Click "Login" in navigation
3. Login with existing account or create new account
4. Verify you're redirected to home page
5. Check browser console - should see no errors
6. Check localStorage has `auth-token` key

**Expected Result**: Successfully logged in with token stored

## Test 2: Add Item to Cart
1. Browse to any product page
2. Select a size (e.g., "M")
3. Set quantity (e.g., 2)
4. Click "ADD TO CART"
5. Check browser console for logs:
   - "Adding to cart: {userId, itemId, product}"
   - "Cart API response: {success: true, data: {...}}"
6. Button should change to "✓ ADDED TO CART" in green for 2 seconds

**Expected Result**: 
- Item added successfully
- Success message shown
- No errors in console
- Backend logs show "Item added successfully"

## Test 3: View Cart
1. Click cart icon in navigation
2. Verify items are displayed
3. Check quantities are correct
4. Verify prices are calculated correctly
5. Try updating quantities with +/- buttons
6. Try removing items

**Expected Result**: Cart displays correctly with all items

## Test 4: Checkout Process
1. From cart page, click "PROCEED TO CHECKOUT"
2. If not logged in, should redirect to login
3. Fill in shipping address:
   - Full Name: Test User
   - Phone: +251912345678
   - Address: 123 Test Street
   - City: Addis Ababa
   - Region: Addis Ababa
4. Select payment method (e.g., "Chapa")
5. Review order summary
6. Click "Place Order"

**Expected Result**: 
- Order created successfully
- Payment processing initiated
- Redirected to payment gateway or success page

## Test 5: Check Backend Logs
1. Check backend terminal for logs
2. Should see:
   - "Add item request: {userId, productId, quantity, price}"
   - "Item added successfully"
   - No "Error updating popularity" or "Error updating user profile" errors blocking operations

**Expected Result**: Clean logs with no blocking errors

## Common Issues and Solutions

### Issue: "Please login to add items to cart"
**Solution**: User is not logged in. Login first.

### Issue: "Failed to add item to cart"
**Solution**: 
- Check backend is running
- Check MongoDB is connected
- Check browser console for detailed error
- Check backend logs for error details

### Issue: "Please select a size"
**Solution**: Select a size before clicking "Add to Cart"

### Issue: Payment not processing
**Solution**:
- Verify payment gateway credentials in `.env`
- Check payment method is active in database
- Check backend logs for payment errors

## Browser Console Commands

Check if user is logged in:
```javascript
localStorage.getItem('auth-token')
```

Decode JWT token:
```javascript
const token = localStorage.getItem('auth-token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('User ID:', payload.userId);
    console.log('Role:', payload.role);
}
```

Check cart items:
```javascript
// In React DevTools, find ShopContext and check cartItems state
```

## API Testing with curl

Test add to cart:
```bash
curl -X POST http://localhost:5000/api/cart/USER_ID/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId": 1, "quantity": 1, "price": 50}'
```

Test get cart:
```bash
curl http://localhost:5000/api/cart/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Success Criteria

✓ Users can login and token is stored
✓ Users can add items to cart
✓ Cart displays correctly
✓ Checkout process works
✓ Orders are created
✓ Payments are processed
✓ No blocking errors in backend logs
✓ Interaction tracking errors are logged but don't block operations

## Next Steps After Testing

1. If cart works: Test with multiple products and quantities
2. If checkout works: Test with different payment methods
3. If payments work: Test the complete order flow
4. Monitor backend logs for any issues
5. Test edge cases (empty cart, out of stock, etc.)
