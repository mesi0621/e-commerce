# RBAC Quick Test Guide

## Setup Complete ✅

The RBAC system is now ready for testing. Here's how to test it:

## Quick Start

### 1. Start Servers
Make sure both servers are running:

**Backend** (Terminal 1):
```bash
cd backend
npm start
```
Should see: `Server running on port 5000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
```
Should open: `http://localhost:3000`

### 2. Access Test Page
Navigate to: **http://localhost:3000/rbac-test**

This page will show you:
- Your current authentication status
- Your role and permissions
- Visual tests for all permission guards

### 3. Test Different Roles

#### Test as Guest (Not Logged In)
1. If logged in, logout first
2. Go to http://localhost:3000/rbac-test
3. **Expected**: Yellow warning messages saying you need to login

#### Test as Admin
1. Go to http://localhost:3000/login
2. Login with:
   - Email: `bitaaaa2004@gmail.com`
   - Password: `admin123`
3. Go to http://localhost:3000/rbac-test
4. **Expected**: All green success boxes (admin has all permissions)

#### Test as Seller
1. Logout if logged in
2. Go to http://localhost:3000/login
3. Login with:
   - Email: `meseretmezgebe338@gmail.com`
   - Password: `seller123`
4. Go to http://localhost:3000/rbac-test
5. **Expected**: 
   - ✅ Seller-only content shows green
   - ✅ Admin/Seller content shows green
   - ❌ Admin-only content shows yellow warning
   - ❌ Customer-only content shows yellow warning

#### Test as Customer
1. Register a new account or use existing customer account
2. Go to http://localhost:3000/rbac-test
3. **Expected**:
   - ✅ Customer-only content shows green
   - ❌ Admin-only content shows yellow warning
   - ❌ Seller-only content shows yellow warning

## What to Check

### ✅ Success Indicators
- Green boxes appear for content you have access to
- User info section shows correct role and permissions
- No console errors in browser DevTools (F12)
- Token is stored in localStorage

### ❌ Failure Indicators
- Yellow warning boxes appear for content you should have access to
- Console errors in browser DevTools
- Role shows as "guest" when you're logged in
- Permissions array is empty when logged in

## Browser Console Checks

Open browser console (F12) and run these commands:

### Check Token
```javascript
localStorage.getItem('auth-token')
```
Should return JWT token string if logged in, `null` if not.

### Decode Token (copy token from above)
```javascript
// Replace YOUR_TOKEN with actual token
const token = 'YOUR_TOKEN';
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
  '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
).join(''));
console.log(JSON.parse(jsonPayload));
```
Should show: userId, email, role, permissions, exp

## Backend API Tests

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bitaaaa2004@gmail.com","password":"admin123"}'
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "userId": "...",
    "email": "bitaaaa2004@gmail.com",
    "role": "admin",
    "permissions": [...]
  }
}
```

### Test Permission Enforcement
```bash
# Get admin token from login response above
TOKEN="<paste_admin_token_here>"

# This should succeed (admin accessing admin endpoint)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Get seller token
SELLER_TOKEN="<paste_seller_token_here>"

# This should fail with 403 (seller accessing admin endpoint)
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

## Common Issues & Solutions

### Issue: "useAuth must be used within an AuthProvider"
**Solution**: App.js is already wrapped with AuthProvider. Refresh the page.

### Issue: Token not being sent with API requests
**Solution**: Check that `frontend/src/api/client.js` has the Authorization header interceptor.

### Issue: Role shows as "guest" after login
**Solution**: 
1. Check backend response includes role in JWT
2. Clear localStorage: `localStorage.clear()`
3. Login again

### Issue: Permissions array is empty
**Solution**: 
1. Check backend JWT includes permissions
2. Verify RoleInitService has run on backend startup
3. Check backend console for role initialization logs

### Issue: 403 Forbidden on valid requests
**Solution**:
1. Verify user has correct role in database
2. Check backend middleware is checking correct permission
3. Verify JWT token is valid and not expired

## Next Steps After Testing

Once all tests pass:

1. ✅ Verify all role-based content shows/hides correctly
2. ✅ Verify API requests include Authorization header
3. ✅ Verify backend enforces permissions (403 for unauthorized)
4. ✅ Verify audit logs are created (check backend `/api/audit/logs`)
5. 📝 Document any issues found
6. 🚀 Proceed with Task 16: Admin Dashboard

## Test Checklist

- [ ] Guest user sees warning messages on /rbac-test
- [ ] Admin user sees all green success boxes
- [ ] Seller user sees seller-specific content only
- [ ] Customer user sees customer-specific content only
- [ ] Token is stored in localStorage after login
- [ ] Token is removed from localStorage after logout
- [ ] API requests include Authorization header
- [ ] Backend returns 403 for unauthorized requests
- [ ] No console errors in browser DevTools
- [ ] Role and permissions display correctly in test page

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend console for errors
3. Verify both servers are running
4. Clear localStorage and try again
5. Refer to `RBAC_TESTING_GUIDE.md` for detailed troubleshooting

---
**Status**: Ready for Testing
**Date**: 2026-02-18
