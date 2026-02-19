# RBAC System Integration Testing Guide

## Overview
This document provides comprehensive integration testing procedures for the Role-Based Access Control (RBAC) system. All tests should be performed to ensure the system works correctly across all roles and features.

## Test Environment Setup

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:3000`
3. MongoDB connected and roles seeded
4. Test accounts created for each role

### Test Accounts
- **Admin**: `bitaaaa2004@gmail.com` / `admin123`
- **Seller**: `meseretmezgebe338@gmail.com` / `seller123`
- **Customer**: Create via signup
- **Delivery**: Assign role via admin dashboard
- **Support**: Assign role via admin dashboard
- **Finance**: Assign role via admin dashboard

---

## Test Suite 1: Complete User Flows for Each Role

### 1.1 Admin User Flow
**Objective**: Test complete admin workflow from login to all admin functions

**Steps**:
1. ✅ Login as admin (`bitaaaa2004@gmail.com` / `admin123`)
2. ✅ Verify redirect to home page with admin access
3. ✅ Navigate to Admin Dashboard (`/admin-rbac`)
4. ✅ Verify access granted (no 403 error)
5. ✅ Test Overview tab - view statistics
6. ✅ Test Users tab:
   - View all users
   - Change user role (customer → seller)
   - Verify role change persists
7. ✅ Test Pending Products tab:
   - View pending products
   - Approve a product
   - Verify product status changes to approved
8. ✅ Test Orders tab:
   - View all orders
   - Update order status
   - Verify status change persists
9. ✅ Logout and verify token is invalidated

**Expected Results**:
- Admin can access all dashboards
- Admin can manage users, products, and orders
- All changes persist in database
- Audit logs created for admin actions

---

### 1.2 Seller User Flow
**Objective**: Test complete seller workflow

**Steps**:
1. ✅ Login as seller (`meseretmezgebe338@gmail.com` / `seller123`)
2. ✅ Navigate to Seller Dashboard (`/seller-rbac`)
3. ✅ Verify access granted
4. ✅ Test Overview tab - view seller statistics
5. ✅ Test My Products tab:
   - Add new product
   - Verify product status is "Pending"
   - Edit own product
   - Delete own product
6. ✅ Test Orders tab:
   - View orders containing seller's products
   - Update order status (limited to: pending, confirmed, processing, shipped)
   - Verify cannot update to "delivered" (delivery staff only)
7. ✅ Test Business Profile tab - view profile
8. ✅ Attempt to access Admin Dashboard (`/admin-rbac`)
9. ✅ Verify redirect to 403 Forbidden page
10. ✅ Logout

**Expected Results**:
- Seller can only see own products
- Seller can only see orders with their products
- Seller cannot access admin functions
- Product approval workflow works correctly

---

### 1.3 Customer User Flow
**Objective**: Test complete customer workflow

**Steps**:
1. ✅ Signup as new customer
2. ✅ Verify default role is "customer"
3. ✅ Browse products
4. ✅ Add products to cart
5. ✅ Add products to wishlist
6. ✅ Proceed to checkout
7. ✅ Place order
8. ✅ View order history (`/orders`)
9. ✅ Submit product review
10. ✅ Attempt to access Seller Dashboard (`/seller-rbac`)
11. ✅ Verify redirect to 403 Forbidden page
12. ✅ Logout

**Expected Results**:
- Customer can browse and purchase
- Customer can only see own orders
- Customer cannot access seller/admin functions

---

### 1.4 Delivery Staff User Flow
**Objective**: Test delivery staff workflow

**Steps**:
1. ✅ Create user account
2. ✅ Login as admin and assign "delivery" role
3. ✅ Logout admin, login as delivery staff
4. ✅ Navigate to Delivery Dashboard (`/delivery`)
5. ✅ Verify access granted
6. ✅ View assigned deliveries
7. ✅ Update delivery status:
   - Start delivery (pending → in_transit)
   - Mark as delivered (in_transit → delivered)
8. ✅ View delivery details
9. ✅ Attempt to access Admin Dashboard
10. ✅ Verify redirect to 403 Forbidden page
11. ✅ Logout

**Expected Results**:
- Delivery staff can only see assigned deliveries
- Delivery staff can update delivery status
- Delivery staff cannot access other dashboards

---

### 1.5 Support Staff User Flow
**Objective**: Test support staff workflow

**Steps**:
1. ✅ Create user account
2. ✅ Login as admin and assign "support" role
3. ✅ Logout admin, login as support staff
4. ✅ Navigate to Support Dashboard (`/support`)
5. ✅ Verify access granted
6. ✅ Test Tickets tab:
   - View support tickets
   - Respond to ticket
   - Mark ticket as resolved
7. ✅ Test Reviews tab:
   - View flagged reviews
   - Approve review
   - Hide inappropriate review
8. ✅ Attempt to access Admin Dashboard
9. ✅ Verify redirect to 403 Forbidden page
10. ✅ Logout

**Expected Results**:
- Support staff can manage tickets and reviews
- Support staff cannot access other dashboards

---

### 1.6 Finance Staff User Flow
**Objective**: Test finance staff workflow

**Steps**:
1. ✅ Create user account
2. ✅ Login as admin and assign "finance" role
3. ✅ Logout admin, login as finance staff
4. ✅ Navigate to Finance Dashboard (`/finance`)
5. ✅ Verify access granted
6. ✅ Test Overview tab - view financial statistics
7. ✅ Test Transactions tab - view all transactions
8. ✅ Test Reports tab - view sales and commission reports
9. ✅ Test Payouts tab - view payout management
10. ✅ Attempt to access Admin Dashboard
11. ✅ Verify redirect to 403 Forbidden page
12. ✅ Logout

**Expected Results**:
- Finance staff can view financial data
- Finance staff cannot access other dashboards

---

### 1.7 Guest User Flow
**Objective**: Test guest restrictions

**Steps**:
1. ✅ Open application without logging in
2. ✅ Browse products (should work)
3. ✅ View product details (should work)
4. ✅ Add product to cart (should work)
5. ✅ Attempt to checkout
6. ✅ Verify redirect to login page
7. ✅ Attempt to access wishlist
8. ✅ Verify redirect to login page
9. ✅ Attempt to access any dashboard
10. ✅ Verify redirect to login page

**Expected Results**:
- Guests can browse but cannot purchase
- Guests redirected to login for protected actions

---

## Test Suite 2: Role Transitions

### 2.1 Customer to Seller Transition
**Objective**: Test role change and permission updates

**Steps**:
1. ✅ Login as customer
2. ✅ Verify can only access customer features
3. ✅ Logout
4. ✅ Login as admin
5. ✅ Change customer's role to "seller"
6. ✅ Logout admin
7. ✅ Login as the user (now seller)
8. ✅ Verify can access Seller Dashboard
9. ✅ Verify can create products
10. ✅ Verify cannot access customer-only features

**Expected Results**:
- Role change is immediate
- Permissions update correctly
- User can access new role features
- Audit log records role change

---

### 2.2 Multiple Role Changes
**Objective**: Test sequential role changes

**Steps**:
1. ✅ Create new user (customer by default)
2. ✅ Admin changes role: customer → seller
3. ✅ Verify seller permissions
4. ✅ Admin changes role: seller → delivery
5. ✅ Verify delivery permissions
6. ✅ Admin changes role: delivery → support
7. ✅ Verify support permissions
8. ✅ Admin changes role: support → finance
9. ✅ Verify finance permissions
10. ✅ Admin changes role: finance → customer
11. ✅ Verify customer permissions

**Expected Results**:
- Each role change updates permissions correctly
- User can only access features for current role
- All role changes logged in audit log

---

## Test Suite 3: Permission Enforcement

### 3.1 Backend API Permission Tests

#### Admin Endpoints
**Test**: Verify only admins can access admin endpoints

**Endpoints to Test**:
- `POST /api/admin/users/:userId/role` - Assign role
- `GET /api/admin/roles` - List roles
- `POST /api/admin/products/:id/approve` - Approve product
- `GET /api/audit/logs` - View audit logs

**Steps**:
1. ✅ Test as admin - should succeed
2. ✅ Test as seller - should return 403
3. ✅ Test as customer - should return 403
4. ✅ Test as guest - should return 401

---

#### Seller Endpoints
**Test**: Verify seller permissions

**Endpoints to Test**:
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update own product
- `DELETE /api/products/:id` - Delete own product
- `GET /api/seller/profile` - Get seller profile

**Steps**:
1. ✅ Test as seller - should succeed for own products
2. ✅ Test as seller - should fail for other seller's products
3. ✅ Test as customer - should return 403
4. ✅ Test as admin - should succeed (admin override)

---

#### Order Endpoints
**Test**: Verify order filtering by role

**Endpoint**: `GET /api/orders`

**Steps**:
1. ✅ Test as customer - should only see own orders
2. ✅ Test as seller - should only see orders with their products
3. ✅ Test as delivery - should only see assigned deliveries
4. ✅ Test as admin - should see all orders

---

### 3.2 Frontend Route Protection Tests

**Test**: Verify protected routes redirect correctly

**Routes to Test**:
- `/admin-rbac` - Admin only
- `/seller-rbac` - Seller only
- `/delivery` - Delivery only
- `/support` - Support only
- `/finance` - Finance only

**Steps for Each Route**:
1. ✅ Access as correct role - should load page
2. ✅ Access as wrong role - should redirect to 403
3. ✅ Access as guest - should redirect to login

---

## Test Suite 4: Audit Logging

### 4.1 Authentication Events
**Test**: Verify authentication events are logged

**Events to Test**:
1. ✅ Successful login
2. ✅ Failed login (wrong password)
3. ✅ Failed login (user not found)
4. ✅ Successful signup
5. ✅ Logout
6. ✅ Token refresh

**Verification**:
- Check audit logs via admin dashboard
- Verify all events have correct timestamps
- Verify IP addresses are recorded
- Verify user agents are recorded

---

### 4.2 Permission Denial Events
**Test**: Verify permission denials are logged

**Steps**:
1. ✅ Customer attempts to access admin endpoint
2. ✅ Seller attempts to edit another seller's product
3. ✅ Guest attempts to checkout
4. ✅ Check audit logs for permission denial entries

**Verification**:
- All denials logged with reason
- Required permission recorded
- User role recorded

---

### 4.3 Role Change Events
**Test**: Verify role changes are logged

**Steps**:
1. ✅ Admin changes user role
2. ✅ Check audit logs
3. ✅ Verify old role recorded
4. ✅ Verify new role recorded
5. ✅ Verify admin who made change is recorded

---

### 4.4 Admin Action Events
**Test**: Verify admin actions are logged

**Actions to Test**:
1. ✅ Product approval
2. ✅ User role assignment
3. ✅ Account activation/deactivation
4. ✅ Order status changes

**Verification**:
- All actions logged with details
- Admin user recorded
- Timestamps accurate

---

## Test Suite 5: Security Features

### 5.1 Rate Limiting Tests

#### Login Rate Limiting
**Test**: Verify login attempts are limited

**Steps**:
1. ✅ Attempt to login with wrong password 5 times
2. ✅ Verify 6th attempt returns rate limit error
3. ✅ Wait 15 minutes
4. ✅ Verify can login again

**Expected**: "Too many login attempts. Please try again after 15 minutes."

---

#### Signup Rate Limiting
**Test**: Verify signup attempts are limited

**Steps**:
1. ✅ Create 3 accounts from same IP
2. ✅ Verify 4th attempt returns rate limit error
3. ✅ Wait 1 hour
4. ✅ Verify can signup again

**Expected**: "Too many accounts created. Please try again after an hour."

---

#### Password Reset Rate Limiting
**Test**: Verify password reset attempts are limited

**Steps**:
1. ✅ Request password reset 3 times
2. ✅ Verify 4th attempt returns rate limit error
3. ✅ Wait 1 hour
4. ✅ Verify can request reset again

**Expected**: "Too many password reset attempts. Please try again after an hour."

---

#### API Rate Limiting
**Test**: Verify general API rate limiting

**Steps**:
1. ✅ Make 100 API requests in 1 minute
2. ✅ Verify 101st request returns rate limit error
3. ✅ Wait 1 minute
4. ✅ Verify can make requests again

**Expected**: "Too many requests. Please try again later."

---

### 5.2 Session Management Tests

#### Token Expiration
**Test**: Verify JWT tokens expire after 24 hours

**Steps**:
1. ✅ Login and save token
2. ✅ Manually set token expiration to past (or wait 24 hours)
3. ✅ Attempt to access protected endpoint
4. ✅ Verify returns "Token expired" error

---

#### Token Refresh
**Test**: Verify token refresh works

**Steps**:
1. ✅ Login and get token
2. ✅ Call `/api/auth/refresh` endpoint
3. ✅ Verify new token is returned
4. ✅ Verify old token is blacklisted
5. ✅ Attempt to use old token
6. ✅ Verify returns "Token has been revoked" error

---

#### Token Blacklist on Logout
**Test**: Verify tokens are invalidated on logout

**Steps**:
1. ✅ Login and get token
2. ✅ Call `/api/auth/logout` endpoint
3. ✅ Attempt to use token for protected endpoint
4. ✅ Verify returns "Token has been revoked" error

---

### 5.3 Password Security Tests

#### Password Hashing
**Test**: Verify passwords are hashed

**Steps**:
1. ✅ Create new user with password "test123"
2. ✅ Check database directly
3. ✅ Verify password field is hashed (bcrypt format)
4. ✅ Verify password is not stored in plain text

---

#### Password Change
**Test**: Verify password change works

**Steps**:
1. ✅ Request password reset
2. ✅ Use reset token to change password
3. ✅ Verify new password is hashed
4. ✅ Verify can login with new password
5. ✅ Verify cannot login with old password

---

## Test Suite 6: Data Isolation

### 6.1 Seller Product Isolation
**Test**: Verify sellers can only access own products

**Steps**:
1. ✅ Login as Seller A
2. ✅ Create product
3. ✅ Note product ID
4. ✅ Logout
5. ✅ Login as Seller B
6. ✅ Attempt to edit Seller A's product
7. ✅ Verify returns 403 error
8. ✅ Attempt to delete Seller A's product
9. ✅ Verify returns 403 error

---

### 6.2 Customer Order Isolation
**Test**: Verify customers can only see own orders

**Steps**:
1. ✅ Login as Customer A
2. ✅ Place order
3. ✅ Note order ID
4. ✅ Logout
5. ✅ Login as Customer B
6. ✅ Attempt to view Customer A's order
7. ✅ Verify order not visible in list
8. ✅ Attempt to access order directly via API
9. ✅ Verify returns 403 error

---

### 6.3 Delivery Assignment Isolation
**Test**: Verify delivery staff only see assigned deliveries

**Steps**:
1. ✅ Create 2 delivery staff accounts
2. ✅ Admin assigns Order 1 to Delivery Staff A
3. ✅ Admin assigns Order 2 to Delivery Staff B
4. ✅ Login as Delivery Staff A
5. ✅ Verify can only see Order 1
6. ✅ Logout
7. ✅ Login as Delivery Staff B
8. ✅ Verify can only see Order 2

---

## Test Checklist Summary

### Critical Tests (Must Pass)
- [ ] All role dashboards accessible by correct roles
- [ ] All role dashboards blocked for incorrect roles
- [ ] Admin can manage all users and products
- [ ] Sellers can only manage own products
- [ ] Customers can only see own orders
- [ ] Rate limiting prevents brute force attacks
- [ ] Tokens expire and can be refreshed
- [ ] Tokens invalidated on logout
- [ ] Passwords are hashed
- [ ] Audit logs record all security events
- [ ] Data isolation enforced for all roles

### Important Tests (Should Pass)
- [ ] Role transitions work correctly
- [ ] Permission changes apply immediately
- [ ] Guest restrictions enforced
- [ ] 403 page displays for unauthorized access
- [ ] All CRUD operations respect permissions
- [ ] Delivery staff can update delivery status
- [ ] Support staff can moderate reviews
- [ ] Finance staff can view financial data

### Optional Tests (Nice to Have)
- [ ] Performance under load
- [ ] Concurrent user sessions
- [ ] Token refresh before expiration
- [ ] Audit log search and filtering
- [ ] Role-based UI element hiding

---

## Reporting Issues

If any test fails, report with:
1. Test name and number
2. Steps to reproduce
3. Expected result
4. Actual result
5. Error messages
6. Screenshots if applicable

---

## Test Completion

**Date**: _________________
**Tester**: _________________
**Results**: _________________
**Issues Found**: _________________
**Status**: ☐ Pass ☐ Fail ☐ Partial

---

## Notes

- All tests should be performed in a clean test environment
- Database should be reset between major test suites
- Use browser dev tools to inspect network requests
- Check browser console for errors
- Monitor backend logs during testing
- Document any unexpected behavior

