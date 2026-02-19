# RBAC Testing Guide

## Overview
This guide provides step-by-step instructions for testing the Role-Based Access Control (RBAC) system implementation.

## Prerequisites
- Backend server running on port 5000
- Frontend server running on port 3000
- MongoDB connected
- Admin account: `bitaaaa2004@gmail.com` / `admin123`
- Seller account: `meseretmezgebe338@gmail.com` / `seller123`

## Test Plan

### Phase 1: Backend API Testing

#### 1.1 Authentication & Role Assignment
Test that users are assigned correct roles and JWT tokens contain role/permission data.

**Test 1: Admin Login**
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
    "permissions": ["..."]
  }
}
```

**Verify**:
- ✅ Token is returned
- ✅ Role is "admin"
- ✅ Permissions array is populated

**Test 2: Seller Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"meseretmezgebe338@gmail.com","password":"seller123"}'
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "userId": "...",
    "email": "meseretmezgebe338@gmail.com",
    "role": "seller",
    "permissions": ["products.create", "products.read.own", ...]
  }
}
```

**Verify**:
- ✅ Token is returned
- ✅ Role is "seller"
- ✅ Permissions include seller-specific permissions

#### 1.2 Permission Enforcement
Test that endpoints properly enforce role-based permissions.

**Test 3: Admin Access to User Management**
```bash
# First login as admin and get token
TOKEN="<admin_token_from_test_1>"

curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ✅ Success - Returns list of users

**Test 4: Seller Access to User Management (Should Fail)**
```bash
# Login as seller and get token
TOKEN="<seller_token_from_test_2>"

curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ❌ 403 Forbidden - Seller cannot access admin endpoints

**Test 5: Seller Access to Own Products**
```bash
TOKEN="<seller_token>"

curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ✅ Success - Returns seller's products only

#### 1.3 Delivery Staff Features
Test delivery assignment and tracking.

**Test 6: Admin Assigns Delivery**
```bash
TOKEN="<admin_token>"

curl -X POST http://localhost:5000/api/admin/deliveries/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "<order_id>",
    "deliveryStaffId": "<delivery_staff_id>"
  }'
```

**Expected**: ✅ Success - Delivery assigned

**Test 7: Delivery Staff Views Assigned Orders**
```bash
TOKEN="<delivery_staff_token>"

curl -X GET http://localhost:5000/api/delivery/orders \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ✅ Success - Returns only assigned deliveries

#### 1.4 Support Staff Features
Test support ticket system.

**Test 8: Customer Creates Support Ticket**
```bash
TOKEN="<customer_token>"

curl -X POST http://localhost:5000/api/support/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Ticket",
    "category": "order",
    "priority": "medium",
    "description": "Testing support system"
  }'
```

**Expected**: ✅ Success - Ticket created

**Test 9: Support Staff Views Tickets**
```bash
TOKEN="<support_staff_token>"

curl -X GET http://localhost:5000/api/support/tickets \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ✅ Success - Returns assigned/unassigned tickets

#### 1.5 Finance Staff Features
Test financial reporting and payouts.

**Test 10: Finance Staff Views Transactions**
```bash
TOKEN="<finance_staff_token>"

curl -X GET http://localhost:5000/api/finance/transactions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ✅ Success - Returns transaction list

**Test 11: Finance Staff Processes Payout**
```bash
TOKEN="<finance_staff_token>"

curl -X POST http://localhost:5000/api/finance/payouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "<seller_id>",
    "amount": 1000,
    "paymentMethod": "bank_transfer",
    "notes": "Test payout"
  }'
```

**Expected**: ✅ Success - Payout processed

#### 1.6 Audit Logging
Test that actions are being logged.

**Test 12: Admin Views Audit Logs**
```bash
TOKEN="<admin_token>"

curl -X GET http://localhost:5000/api/audit/logs \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: ✅ Success - Returns audit log entries

### Phase 2: Frontend Integration Testing

#### 2.1 AuthContext Integration
Test that AuthContext properly manages authentication state.

**Manual Test Steps**:

1. **Open Browser Console** (F12)
2. **Navigate to** http://localhost:3000
3. **Check localStorage**:
   ```javascript
   localStorage.getItem('auth-token')
   ```
   Should be `null` if not logged in

4. **Login as Admin**:
   - Go to login page
   - Enter: `bitaaaa2004@gmail.com` / `admin123`
   - Click Login

5. **Verify Token Stored**:
   ```javascript
   localStorage.getItem('auth-token')
   ```
   Should return JWT token

6. **Check AuthContext State** (in React DevTools):
   - Open React DevTools
   - Find AuthProvider component
   - Verify state:
     - `isAuthenticated`: true
     - `role`: "admin"
     - `permissions`: array of permissions
     - `user`: user object

#### 2.2 PermissionGuard Testing
Test that PermissionGuard properly hides/shows components.

**Create Test Component** (`frontend/src/Pages/RBACTest.jsx`):
```jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PermissionGuard, { 
  AdminOnly, 
  SellerOnly, 
  RequireAuth 
} from '../Components/PermissionGuard';

function RBACTest() {
  const { user, role, permissions, isAuthenticated } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>RBAC Test Page</h1>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <h2>Current User Info</h2>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Role:</strong> {role}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Permissions:</strong> {permissions.length} permissions</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Permission Tests</h2>
        
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Test 1: Admin Only Content</h3>
          <AdminOnly>
            <div style={{ background: '#d4edda', padding: '10px' }}>
              ✅ You can see this because you are an admin
            </div>
          </AdminOnly>
          <AdminOnly hideOnDenied={false} showMessage>
            <div>This should show for admin</div>
          </AdminOnly>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Test 2: Seller Only Content</h3>
          <SellerOnly>
            <div style={{ background: '#d4edda', padding: '10px' }}>
              ✅ You can see this because you are a seller
            </div>
          </SellerOnly>
          <SellerOnly hideOnDenied={false} showMessage>
            <div>This should show for seller</div>
          </SellerOnly>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Test 3: Specific Permission</h3>
          <PermissionGuard permission="products.create" hideOnDenied>
            <div style={{ background: '#d4edda', padding: '10px' }}>
              ✅ You have products.create permission
            </div>
          </PermissionGuard>
          <PermissionGuard permission="products.create" hideOnDenied={false} showMessage>
            <div>This checks products.create permission</div>
          </PermissionGuard>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Test 4: Multiple Roles (OR logic)</h3>
          <PermissionGuard role={['admin', 'seller']} hideOnDenied>
            <div style={{ background: '#d4edda', padding: '10px' }}>
              ✅ You are either admin or seller
            </div>
          </PermissionGuard>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>Test 5: Require Authentication</h3>
          <RequireAuth fallback="/login">
            <div style={{ background: '#d4edda', padding: '10px' }}>
              ✅ You are authenticated
            </div>
          </RequireAuth>
        </div>
      </div>
    </div>
  );
}

export default RBACTest;
```

**Test Steps**:
1. Add route to App.js: `<Route path="/rbac-test" element={<RBACTest />} />`
2. Navigate to http://localhost:3000/rbac-test
3. Test as different roles:
   - **As Guest**: Should see authentication required messages
   - **As Admin**: Should see all admin content
   - **As Seller**: Should see seller content, not admin content
   - **As Customer**: Should see limited content

#### 2.3 Role-Specific Navigation
Test that navigation items appear based on role.

**Expected Behavior**:
- **Guest**: Login, Signup, Browse Products
- **Customer**: Home, Products, Cart, Orders, Profile, Logout
- **Seller**: Home, My Products, Orders, Profile, Logout
- **Admin**: Home, Users, Products, Orders, Analytics, Settings, Logout
- **Delivery**: Home, Deliveries, Profile, Logout
- **Support**: Home, Tickets, Reviews, Profile, Logout
- **Finance**: Home, Transactions, Reports, Payouts, Profile, Logout

### Phase 3: Integration Tests

#### 3.1 Complete User Flow Tests

**Test Flow 1: Customer Purchase Flow**
1. Register new customer account
2. Verify role is "customer"
3. Browse products
4. Add to cart
5. Checkout
6. View order history
7. Verify customer can only see own orders

**Test Flow 2: Seller Product Management**
1. Login as seller
2. Create new product
3. Verify product is pending approval
4. Try to view other seller's products (should fail)
5. Update own product
6. View orders for own products only

**Test Flow 3: Admin Approval Workflow**
1. Login as admin
2. View pending products
3. Approve seller's product
4. View all orders (not just own)
5. Assign role to user
6. View audit logs

**Test Flow 4: Delivery Assignment**
1. Admin assigns delivery to staff
2. Delivery staff logs in
3. Views assigned deliveries only
4. Updates delivery status
5. Customer sees updated status

**Test Flow 5: Support Ticket Lifecycle**
1. Customer creates support ticket
2. Support staff views ticket
3. Support staff responds to ticket
4. Support staff escalates to admin
5. Admin resolves ticket
6. Customer receives notification

**Test Flow 6: Finance Payout Process**
1. Finance staff views seller balances
2. Generates commission report
3. Processes payout to seller
4. Updates payout status
5. Seller receives notification

### Phase 4: Security Tests

#### 4.1 Permission Bypass Attempts

**Test 13: Token Tampering**
1. Get valid token
2. Modify token payload (change role to admin)
3. Try to access admin endpoint
4. **Expected**: ❌ 401 Unauthorized (invalid signature)

**Test 14: Expired Token**
1. Use expired token
2. Try to access protected endpoint
3. **Expected**: ❌ 401 Unauthorized (token expired)

**Test 15: No Token**
1. Access protected endpoint without token
2. **Expected**: ❌ 401 Unauthorized (no token)

**Test 16: Cross-Seller Access**
1. Login as Seller A
2. Try to update Seller B's product
3. **Expected**: ❌ 403 Forbidden (ownership check)

**Test 17: Role Escalation**
1. Login as customer
2. Try to access admin endpoints
3. **Expected**: ❌ 403 Forbidden (insufficient permissions)

### Test Results Checklist

#### Backend Tests
- [ ] Admin login returns correct role and permissions
- [ ] Seller login returns correct role and permissions
- [ ] Admin can access user management
- [ ] Seller cannot access admin endpoints
- [ ] Seller can only view own products
- [ ] Delivery staff can view assigned deliveries
- [ ] Support staff can manage tickets
- [ ] Finance staff can view transactions and process payouts
- [ ] Audit logs are created for actions
- [ ] Permission denials return 403 Forbidden

#### Frontend Tests
- [ ] AuthContext loads user from localStorage
- [ ] Login stores token and updates context
- [ ] Logout clears token and resets context
- [ ] PermissionGuard hides content for unauthorized users
- [ ] AdminOnly shows content only for admins
- [ ] SellerOnly shows content only for sellers
- [ ] RequireAuth redirects unauthenticated users
- [ ] Role-specific navigation appears correctly

#### Integration Tests
- [ ] Customer can complete purchase flow
- [ ] Seller can manage own products only
- [ ] Admin can approve products and assign roles
- [ ] Delivery staff can update delivery status
- [ ] Support staff can manage tickets
- [ ] Finance staff can process payouts

#### Security Tests
- [ ] Token tampering is detected
- [ ] Expired tokens are rejected
- [ ] Missing tokens are rejected
- [ ] Cross-seller access is prevented
- [ ] Role escalation is prevented

## Quick Test Script

For quick backend testing, save this as `test-rbac.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:5000/api"

echo "=== RBAC Testing Script ==="
echo ""

# Test 1: Admin Login
echo "Test 1: Admin Login"
ADMIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bitaaaa2004@gmail.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
echo ""

# Test 2: Seller Login
echo "Test 2: Seller Login"
SELLER_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"meseretmezgebe338@gmail.com","password":"seller123"}')

SELLER_TOKEN=$(echo $SELLER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Seller Token: ${SELLER_TOKEN:0:20}..."
echo ""

# Test 3: Admin Access (Should Succeed)
echo "Test 3: Admin accessing /admin/users (should succeed)"
curl -s -X GET $API_URL/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" | head -c 100
echo "..."
echo ""

# Test 4: Seller Access to Admin Endpoint (Should Fail)
echo "Test 4: Seller accessing /admin/users (should fail with 403)"
curl -s -X GET $API_URL/admin/users \
  -H "Authorization: Bearer $SELLER_TOKEN"
echo ""

echo "=== Tests Complete ==="
```

Run with: `bash test-rbac.sh`

## Troubleshooting

### Issue: Token not being sent with requests
**Solution**: Check that axios interceptor is configured in `client.js`

### Issue: PermissionGuard not working
**Solution**: Ensure App is wrapped with AuthProvider

### Issue: Role not updating after login
**Solution**: Check that JWT token includes role and permissions

### Issue: 403 errors for valid requests
**Solution**: Verify user has correct permissions in database

## Next Steps After Testing

Once all tests pass:
1. Document any issues found
2. Fix any bugs discovered
3. Proceed with Task 16: Admin Dashboard implementation
4. Continue with remaining frontend tasks

---
**Testing Date**: 2026-02-18
**Tester**: [Your Name]
**Status**: Ready for Testing
