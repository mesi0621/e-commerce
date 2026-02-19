# RBAC System API Documentation

## Overview
This document provides comprehensive API documentation for the Role-Based Access Control (RBAC) system, including all endpoints, permission requirements, and role definitions.

**Base URL**: `http://localhost:5000/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Role Management](#role-management)
3. [User Management](#user-management)
4. [Seller Operations](#seller-operations)
5. [Delivery Operations](#delivery-operations)
6. [Support Operations](#support-operations)
7. [Finance Operations](#finance-operations)
8. [Audit Logs](#audit-logs)
9. [Role Definitions](#role-definitions)
10. [Permission System](#permission-system)
11. [Error Codes](#error-codes)

---

## Authentication

### POST /auth/signup
Register a new user account.

**Rate Limit**: 3 requests per hour per IP

**Request Body**:
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 characters)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "customer",
    "permissions": ["array of permissions"],
    "createdAt": "ISO date"
  },
  "token": "JWT token"
}
```

**Default Role**: All new users are assigned the "customer" role by default.

---

### POST /auth/login
Authenticate user and receive JWT token.

**Rate Limit**: 5 requests per 15 minutes per IP

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "permissions": ["array"],
    "lastLogin": "ISO date"
  },
  "token": "JWT token"
}
```

**JWT Token**: Valid for 24 hours. Include in Authorization header as `Bearer <token>`.

---

### POST /auth/logout
Logout user and blacklist current token.

**Authentication**: Required  
**Permission**: Any authenticated user

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note**: Token is added to blacklist and cannot be used again.

---

### POST /auth/refresh
Refresh JWT token before expiration.

**Authentication**: Required  
**Permission**: Any authenticated user

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "new JWT token",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "permissions": ["array"]
  }
}
```

**Note**: Old token is blacklisted, new token is valid for 24 hours.

---

### GET /auth/verify
Verify current token and get user data.

**Authentication**: Required  
**Permission**: Any authenticated user

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "permissions": ["array"],
    "isActive": true,
    "lastLogin": "ISO date",
    "createdAt": "ISO date"
  }
}
```

---

### POST /auth/forgot-password
Request password reset email.

**Rate Limit**: 3 requests per hour per IP

**Request Body**:
```json
{
  "email": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password
Reset password using token from email.

**Rate Limit**: 3 requests per hour per IP

**Request Body**:
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Role Management

### GET /admin/roles
List all system roles.

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "admin",
      "permissions": ["array of permissions"],
      "isSystem": true,
      "description": "string"
    }
  ]
}
```

---

### POST /admin/users/:userId/role
Assign role to user.

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "role": "string (required: admin|seller|customer|delivery|support|finance)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "userId": "string",
    "oldRole": "string",
    "newRole": "string",
    "permissions": ["array"]
  }
}
```

**Audit Log**: Role changes are logged in audit system.

---

### POST /admin/roles
Create custom role.

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "string (required)",
  "permissions": ["array of permission strings"],
  "description": "string (optional)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "permissions": ["array"],
    "isSystem": false
  }
}
```

---

### PUT /admin/roles/:roleId
Update role permissions.

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "permissions": ["array of permission strings"],
  "description": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "permissions": ["array"],
    "description": "string"
  }
}
```

**Note**: System roles (admin, seller, customer, etc.) cannot be deleted.

---

## User Management

### GET /admin/users
List all users (admin only).

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `role` (optional): Filter by role
- `isActive` (optional): Filter by active status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "isActive": true,
      "createdAt": "ISO date",
      "lastLogin": "ISO date"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### PUT /admin/users/:userId/status
Activate or deactivate user account.

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "isActive": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User status updated",
  "data": {
    "userId": "string",
    "isActive": true
  }
}
```

---

## Seller Operations

### POST /seller/profile
Create seller profile.

**Authentication**: Required  
**Permission**: Seller role

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "businessName": "string (required)",
  "businessAddress": "string (required)",
  "phone": "string (required)",
  "description": "string (optional)",
  "taxId": "string (optional)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Seller profile created",
  "data": {
    "_id": "string",
    "userId": "string",
    "businessName": "string",
    "businessAddress": "string",
    "phone": "string",
    "isApproved": false,
    "createdAt": "ISO date"
  }
}
```

---

### GET /seller/profile
Get own seller profile.

**Authentication**: Required  
**Permission**: Seller role

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "userId": "string",
    "businessName": "string",
    "businessAddress": "string",
    "phone": "string",
    "description": "string",
    "isApproved": true,
    "approvedAt": "ISO date",
    "createdAt": "ISO date"
  }
}
```

---

### POST /admin/sellers/:sellerId/approve
Approve seller profile (admin only).

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seller approved successfully",
  "data": {
    "sellerId": "string",
    "isApproved": true,
    "approvedAt": "ISO date"
  }
}
```

---

### POST /products
Create product (seller only).

**Authentication**: Required  
**Permission**: Seller role, `products.create` permission

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "price": "number (required)",
  "category": "string (required)",
  "image": "string (required)",
  "stock": "number (required)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "sellerId": "string",
    "status": "pending",
    "createdAt": "ISO date"
  }
}
```

**Note**: Products require admin approval before appearing in store.

---

### POST /admin/products/:id/approve
Approve product (admin only).

**Authentication**: Required  
**Permission**: Admin only, `products.approve` permission

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Product approved successfully",
  "data": {
    "productId": "string",
    "status": "approved",
    "approvedAt": "ISO date"
  }
}
```

---

## Delivery Operations

### GET /delivery/orders
Get assigned deliveries.

**Authentication**: Required  
**Permission**: Delivery staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): Filter by delivery status

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "orderNumber": "string",
      "customer": {
        "name": "string",
        "phone": "string",
        "address": "string"
      },
      "items": ["array of order items"],
      "deliveryStatus": "pending|in_transit|delivered",
      "assignedAt": "ISO date",
      "deliveredAt": "ISO date"
    }
  ]
}
```

---

### PUT /delivery/orders/:id/status
Update delivery status.

**Authentication**: Required  
**Permission**: Delivery staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "in_transit|delivered"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Delivery status updated",
  "data": {
    "orderId": "string",
    "deliveryStatus": "string",
    "updatedAt": "ISO date"
  }
}
```

---

### POST /admin/deliveries/assign
Assign delivery to staff (admin only).

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "orderId": "string (required)",
  "deliveryStaffId": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Delivery assigned successfully",
  "data": {
    "orderId": "string",
    "deliveryStaffId": "string",
    "assignedAt": "ISO date"
  }
}
```

---

## Support Operations

### GET /support/tickets
List support tickets.

**Authentication**: Required  
**Permission**: Support staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): Filter by status (open|in_progress|resolved)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "ticketNumber": "string",
      "userId": "string",
      "subject": "string",
      "message": "string",
      "status": "open|in_progress|resolved",
      "priority": "low|medium|high",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### POST /support/tickets/:id/respond
Respond to support ticket.

**Authentication**: Required  
**Permission**: Support staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "message": "string (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Response sent successfully",
  "data": {
    "ticketId": "string",
    "response": "string",
    "respondedAt": "ISO date"
  }
}
```

---

### POST /support/tickets/:id/resolve
Mark ticket as resolved.

**Authentication**: Required  
**Permission**: Support staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Ticket resolved successfully",
  "data": {
    "ticketId": "string",
    "status": "resolved",
    "resolvedAt": "ISO date"
  }
}
```

---

### GET /support/reviews/flagged
List flagged reviews for moderation.

**Authentication**: Required  
**Permission**: Support staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "productId": "string",
      "userId": "string",
      "rating": 1-5,
      "comment": "string",
      "isFlagged": true,
      "flagReason": "string",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### PUT /support/reviews/:id/moderate
Moderate review (approve or hide).

**Authentication**: Required  
**Permission**: Support staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "action": "approve|hide",
  "reason": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Review moderated successfully",
  "data": {
    "reviewId": "string",
    "isHidden": false,
    "moderatedAt": "ISO date"
  }
}
```

---

## Finance Operations

### GET /finance/transactions
List all transactions.

**Authentication**: Required  
**Permission**: Finance staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `status` (optional): Filter by status

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "orderId": "string",
      "userId": "string",
      "amount": 100.00,
      "paymentMethod": "string",
      "status": "completed|pending|failed",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### GET /finance/reports/sales
Get sales report.

**Authentication**: Required  
**Permission**: Finance staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `startDate` (optional): Report start date
- `endDate` (optional): Report end date

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalRevenue": 10000.00,
    "totalOrders": 150,
    "averageOrderValue": 66.67,
    "completedOrders": 140,
    "pendingOrders": 10,
    "period": {
      "start": "ISO date",
      "end": "ISO date"
    }
  }
}
```

---

### GET /finance/reports/commissions
Get commission report.

**Authentication**: Required  
**Permission**: Finance staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalCommission": 1000.00,
    "pendingPayouts": 500.00,
    "completedPayouts": 500.00,
    "activeSellers": 25
  }
}
```

---

### POST /finance/payouts
Process seller payout.

**Authentication**: Required  
**Permission**: Finance staff role

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "sellerId": "string (required)",
  "amount": "number (required)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payout processed successfully",
  "data": {
    "payoutId": "string",
    "sellerId": "string",
    "amount": 500.00,
    "status": "completed",
    "processedAt": "ISO date"
  }
}
```

---

## Audit Logs

### GET /audit/logs
List audit logs (admin only).

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `limit` (optional): Results per page (default: 50)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "username": "string",
      "action": "login|logout|permission_denied|role_change|etc",
      "resource": "string",
      "result": "success|error|denied",
      "ipAddress": "string",
      "userAgent": "string",
      "details": {},
      "createdAt": "ISO date"
    }
  ]
}
```

---

### GET /audit/logs/:userId
Get audit logs for specific user.

**Authentication**: Required  
**Permission**: Admin only

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "username": "string",
      "action": "string",
      "result": "string",
      "createdAt": "ISO date"
    }
  ]
}
```

---

## Role Definitions

### System Roles

#### 1. Admin
**Description**: Full system access with all permissions

**Permissions**:
- `users.read.all` - View all users
- `users.update.all` - Update any user
- `users.delete.all` - Delete any user
- `roles.manage` - Manage roles and permissions
- `products.read.all` - View all products
- `products.update.all` - Update any product
- `products.delete.all` - Delete any product
- `products.approve` - Approve pending products
- `orders.read.all` - View all orders
- `orders.manage.all` - Manage all orders
- `deliveries.assign` - Assign deliveries to staff
- `audit.read` - View audit logs
- `settings.manage` - Manage system settings

**Access**:
- Admin Dashboard
- User Management
- Product Approval
- Order Management
- Audit Logs
- All system features

---

#### 2. Seller
**Description**: Can sell products on the platform

**Permissions**:
- `products.create` - Create new products
- `products.read.own` - View own products
- `products.update.own` - Update own products
- `products.delete.own` - Delete own products
- `orders.read.own` - View orders with own products
- `orders.update.own` - Update order status (limited)
- `profile.manage` - Manage seller profile

**Access**:
- Seller Dashboard
- Product Management (own products only)
- Order Management (orders with own products)
- Business Profile

**Restrictions**:
- Cannot approve own products
- Cannot see other sellers' products
- Cannot access admin features
- Limited order status updates

---

#### 3. Customer
**Description**: Can browse and purchase products

**Permissions**:
- `products.read` - View approved products
- `orders.create` - Place orders
- `orders.read.own` - View own orders
- `cart.manage` - Manage shopping cart
- `wishlist.manage` - Manage wishlist
- `reviews.create` - Submit product reviews
- `profile.manage` - Manage own profile

**Access**:
- Product Browsing
- Shopping Cart
- Checkout
- Order History
- Wishlist
- Product Reviews

**Restrictions**:
- Cannot access seller features
- Cannot access admin features
- Can only see own orders

---

#### 4. Delivery
**Description**: Manages product deliveries

**Permissions**:
- `deliveries.read.assigned` - View assigned deliveries
- `deliveries.update.assigned` - Update delivery status
- `orders.read.assigned` - View order details for assigned deliveries

**Access**:
- Delivery Dashboard
- Assigned Deliveries
- Delivery Status Updates

**Restrictions**:
- Can only see assigned deliveries
- Cannot access other dashboards
- Cannot modify order details

---

#### 5. Support
**Description**: Handles customer support and moderation

**Permissions**:
- `tickets.read.all` - View all support tickets
- `tickets.update.all` - Respond to tickets
- `tickets.resolve` - Mark tickets as resolved
- `reviews.moderate` - Moderate product reviews
- `reviews.read.flagged` - View flagged reviews

**Access**:
- Support Dashboard
- Support Tickets
- Review Moderation

**Restrictions**:
- Cannot access admin features
- Cannot manage users or products
- Cannot view financial data

---

#### 6. Finance
**Description**: Manages financial operations and reporting

**Permissions**:
- `transactions.read.all` - View all transactions
- `reports.sales` - View sales reports
- `reports.commissions` - View commission reports
- `payouts.process` - Process seller payouts
- `payouts.read.all` - View payout history

**Access**:
- Finance Dashboard
- Transaction History
- Financial Reports
- Payout Management

**Restrictions**:
- Cannot access admin features
- Cannot manage users or products
- Read-only access to most data

---

#### 7. Guest
**Description**: Unauthenticated users

**Permissions**:
- `products.read` - View approved products
- `products.search` - Search products

**Access**:
- Product Browsing
- Product Search
- Product Details

**Restrictions**:
- Cannot add to cart
- Cannot checkout
- Cannot access any dashboard
- Must login to purchase

---

## Permission System

### Permission Format
Permissions follow the format: `resource.action.scope`

**Examples**:
- `products.create` - Create products
- `products.read.own` - Read own products
- `products.read.all` - Read all products
- `orders.update.own` - Update own orders
- `orders.manage.all` - Manage all orders

### Permission Scopes
- `own` - User's own resources only
- `all` - All resources in the system
- `assigned` - Resources assigned to the user
- No scope - General permission

### Permission Checking
Permissions are checked at two levels:
1. **Backend**: Middleware checks permissions before allowing API access
2. **Frontend**: UI elements hidden/shown based on permissions

---

## Error Codes

### Authentication Errors
- `NO_TOKEN` (401) - No authentication token provided
- `TOKEN_EXPIRED` (401) - JWT token has expired
- `TOKEN_REVOKED` (401) - Token has been blacklisted
- `INVALID_TOKEN` (401) - Token is malformed or invalid
- `USER_NOT_FOUND` (401) - User account not found
- `ACCOUNT_INACTIVE` (401) - User account is deactivated
- `AUTH_REQUIRED` (401) - Authentication required for this endpoint

### Authorization Errors
- `INSUFFICIENT_PERMISSIONS` (403) - User lacks required permission
- `INSUFFICIENT_ROLE` (403) - User lacks required role
- `ACCESS_DENIED` (403) - General access denied

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests

### Validation Errors
- `VALIDATION_ERROR` (400) - Request validation failed
- `INVALID_INPUT` (400) - Invalid input data

### Resource Errors
- `NOT_FOUND` (404) - Resource not found
- `ALREADY_EXISTS` (409) - Resource already exists

### Server Errors
- `INTERNAL_ERROR` (500) - Internal server error
- `DATABASE_ERROR` (500) - Database operation failed

---

## Rate Limiting

### Limits by Endpoint
- **Login**: 5 requests per 15 minutes per IP
- **Signup**: 3 requests per hour per IP
- **Password Reset**: 3 requests per hour per IP
- **General API**: 100 requests per minute per IP

### Rate Limit Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

---

## Security Best Practices

### For API Consumers

1. **Token Storage**:
   - Store JWT tokens securely (httpOnly cookies or secure storage)
   - Never expose tokens in URLs or logs
   - Clear tokens on logout

2. **Token Refresh**:
   - Refresh tokens before expiration
   - Handle token expiration gracefully
   - Implement automatic token refresh

3. **Error Handling**:
   - Handle 401 errors by redirecting to login
   - Handle 403 errors by showing access denied message
   - Handle 429 errors by implementing retry logic

4. **HTTPS**:
   - Always use HTTPS in production
   - Never send tokens over HTTP

5. **Input Validation**:
   - Validate all input on client side
   - Don't rely solely on server validation
   - Sanitize user input

---

## Changelog

### Version 1.0.0 (Current)
- Initial RBAC system implementation
- 7 system roles (Admin, Seller, Customer, Delivery, Support, Finance, Guest)
- JWT authentication with 24-hour expiration
- Token refresh and blacklist
- Rate limiting on authentication endpoints
- Comprehensive audit logging
- Role-based route protection
- Permission-based API access control

---

## Support

For API support or questions:
- Email: support@ecommerce.com
- Documentation: http://localhost:3000/docs
- GitHub: [Repository URL]

---

**Last Updated**: 2026-02-19  
**API Version**: 1.0.0
