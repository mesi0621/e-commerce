# Design Document: Role-Based Access Control System

## Overview

This document describes the design for implementing a comprehensive Role-Based Access Control (RBAC) system for the e-commerce platform. The system will support seven distinct user roles with granular permissions, ensuring secure access control across all platform features.

The RBAC system will be built on top of the existing authentication system and will integrate with all existing features (products, orders, cart, reviews, etc.) to enforce role-based permissions.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin        │  │ Seller       │  │ Customer     │     │
│  │ Dashboard    │  │ Dashboard    │  │ Interface    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │ Auth Context    │                        │
│                   │ (Role & Perms)  │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (JWT Verify)   │
                    └────────┬────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                  Backend (Node.js + Express)                  │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │ Auth Middleware │                        │
│                   │ (Role Check)    │                        │
│                   └────────┬────────┘                        │
│                            │                                  │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐     │
│  │ Permission  │  │ Role         │  │ Audit        │     │
│  │ Service     │  │ Service      │  │ Service      │     │
│  └──────┬──────┘  └───────┬──────┘  └───────┬──────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │    MongoDB      │                        │
│                   │  - Users        │                        │
│                   │  - Roles        │                        │
│                   │  - Permissions  │                        │
│                   │  - Audit Logs   │                        │
│                   └─────────────────┘                        │
└───────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Components:**
- **Auth Context**: Manages user session, role, and permissions in React context
- **Role-Based Routing**: Conditionally renders routes based on user role
- **Permission Guards**: HOCs that wrap components to check permissions
- **Dashboard Components**: Role-specific interfaces (Admin, Seller, Customer, etc.)

**Backend Components:**
- **Auth Middleware**: Verifies JWT tokens and extracts user role
- **Permission Service**: Checks if a user has required permissions
- **Role Service**: Manages role assignments and role definitions
- **Audit Service**: Logs all authentication and authorization events

## Components and Interfaces

### 1. User Model (Extended)

```javascript
// backend/models/User.js
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,  // Hashed
  role: String,      // NEW: 'admin', 'seller', 'customer', 'delivery', 'support', 'finance', 'guest'
  permissions: [String],  // NEW: Cached permissions for performance
  sellerId: ObjectId,     // NEW: Reference to Seller profile (if role is seller)
  isActive: Boolean,      // NEW: Account status
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### 2. Role Model

```javascript
// backend/models/Role.js
{
  _id: ObjectId,
  name: String,          // 'admin', 'seller', 'customer', etc.
  displayName: String,   // 'Administrator', 'Seller/Vendor', etc.
  description: String,
  permissions: [String], // Array of permission strings
  isSystem: Boolean,     // Cannot be deleted if true
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Permission Model

```javascript
// backend/models/Permission.js
{
  _id: ObjectId,
  name: String,          // 'products.create', 'orders.view', etc.
  resource: String,      // 'products', 'orders', 'users', etc.
  action: String,        // 'create', 'read', 'update', 'delete', 'manage'
  description: String,
  createdAt: Date
}
```

### 4. Audit Log Model

```javascript
// backend/models/AuditLog.js
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  action: String,        // 'login', 'role_change', 'permission_denied', etc.
  resource: String,      // What was accessed
  result: String,        // 'success', 'denied', 'error'
  ipAddress: String,
  userAgent: String,
  details: Object,       // Additional context
  timestamp: Date
}
```

### 5. Seller Profile Model

```javascript
// backend/models/SellerProfile.js
{
  _id: ObjectId,
  userId: ObjectId,      // Reference to User
  businessName: String,
  businessEmail: String,
  businessPhone: String,
  address: Object,
  taxId: String,
  bankAccount: Object,
  isApproved: Boolean,   // Admin approval status
  approvedBy: ObjectId,  // Admin who approved
  approvedAt: Date,
  rating: Number,
  totalSales: Number,
  commission: Number,    // Platform commission percentage
  createdAt: Date,
  updatedAt: Date
}
```

## Data Models

### Permission Naming Convention

Permissions follow the format: `resource.action` or `resource.action.scope`

Examples:
- `products.create` - Create products
- `products.read.own` - Read own products only
- `products.read.all` - Read all products
- `products.update.own` - Update own products
- `products.delete.own` - Delete own products
- `orders.manage.all` - Full order management
- `users.manage` - User management
- `settings.manage` - System settings

### Role Permission Matrix

| Permission | Admin | Seller | Customer | Delivery | Support | Finance |
|------------|-------|--------|----------|----------|---------|---------|
| products.create | ✓ | ✓ (own) | ✗ | ✗ | ✗ | ✗ |
| products.read.all | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |
| products.read.own | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| products.update.own | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| products.delete.own | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| products.approve | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| orders.read.all | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| orders.read.own | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| orders.update.own | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| users.manage | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| roles.manage | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| settings.manage | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| analytics.view.all | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| analytics.view.own | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| delivery.manage | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| support.manage | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| finance.manage | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Role Validity
*For any* user in the system, their role must be one of the seven valid roles: admin, seller, customer, delivery, support, finance, or guest.
**Validates: Requirements 1.1**

### Property 2: Default Role Assignment
*For any* newly registered user, their role should be 'customer' immediately after registration.
**Validates: Requirements 1.2**

### Property 3: Single Role Invariant
*For any* user at any point in time, they should have exactly one primary role assigned.
**Validates: Requirements 1.4**

### Property 4: Role Change Permission Swap
*For any* user whose role changes from role A to role B, all permissions from role A should be revoked and all permissions from role B should be granted.
**Validates: Requirements 1.5**

### Property 5: Admin Full Access
*For any* action in the system, if a user has the 'admin' role, they should have permission to perform that action.
**Validates: Requirements 2.1-2.7**

### Property 6: Seller Product Isolation
*For any* two sellers A and B, seller A should not be able to read, update, or delete seller B's products.
**Validates: Requirements 3.6, 14.1-14.3**

### Property 7: Customer Purchase Permission
*For any* customer, they should have permission to browse products, add to cart, and place orders, but not permission to create or modify products.
**Validates: Requirements 4.1-4.7**

### Property 8: Guest Restriction
*For any* guest user (unauthenticated), they should be able to browse products but not add to cart or place orders.
**Validates: Requirements 8.1-8.6**

### Property 9: Authentication Session Creation
*For any* successful login, the system should create a session containing the user's ID, role, and permissions.
**Validates: Requirements 9.2**

### Property 10: Permission Check Before Action
*For any* API request, the system should verify the user has the required permission before executing the action.
**Validates: Requirements 9.3, 11.1**

### Property 11: Unauthorized Access Denial
*For any* API request where the user lacks the required permission, the system should return HTTP 403 Forbidden and not execute the action.
**Validates: Requirements 9.4, 11.3**

### Property 12: Audit Log Creation
*For any* authentication attempt (success or failure) and any permission denial, the system should create an audit log entry.
**Validates: Requirements 11.4, 12.1-12.4**

### Property 13: Role Assignment Authorization
*For any* role assignment operation, only users with 'admin' role should be able to execute it.
**Validates: Requirements 13.1-13.5**

### Property 14: Seller Data Isolation
*For any* seller querying their products or orders, the results should only include items belonging to that seller.
**Validates: Requirements 14.4**

### Property 15: Permission Inheritance
*For any* user with a specific role, they should have all permissions defined for that role in the role definition.
**Validates: Requirements 1.3**

## Error Handling

### Authentication Errors
- **401 Unauthorized**: Invalid credentials or expired token
- **403 Forbidden**: Valid authentication but insufficient permissions
- **404 Not Found**: User or role not found

### Authorization Errors
- **403 Forbidden**: User lacks required permission
- **400 Bad Request**: Invalid role assignment (e.g., assigning non-existent role)

### Validation Errors
- **400 Bad Request**: Invalid role name, missing required fields
- **409 Conflict**: Attempting to create duplicate role

### Error Response Format
```javascript
{
  success: false,
  error: "Permission denied",
  code: "INSUFFICIENT_PERMISSIONS",
  requiredPermission: "products.delete",
  userRole: "customer"
}
```

## Testing Strategy

### Unit Tests
- Test permission checking logic with various role/permission combinations
- Test role assignment and revocation
- Test audit log creation
- Test JWT token generation and validation
- Test permission inheritance from roles

### Property-Based Tests
- Generate random users with random roles and verify permission consistency
- Generate random API requests and verify authorization checks
- Generate random role changes and verify permission updates
- Test cross-seller data isolation with random seller IDs
- Test audit logging with random actions

**Configuration**: Each property test should run minimum 100 iterations.

**Tagging**: Each property test must reference its design document property:
- Format: `Feature: role-based-access-control, Property {number}: {property_text}`

### Integration Tests
- Test complete authentication flow (login → session → permissions)
- Test role-based UI rendering
- Test admin dashboard functionality
- Test seller dashboard with product isolation
- Test customer checkout flow with permissions
- Test delivery staff order management
- Test support staff ticket handling

### Security Tests
- Test privilege escalation attempts
- Test JWT token tampering
- Test session hijacking prevention
- Test SQL injection in role queries
- Test XSS in role names/descriptions

## Implementation Notes

### JWT Token Structure
```javascript
{
  userId: "...",
  email: "...",
  role: "seller",
  permissions: ["products.create", "products.read.own", ...],
  iat: 1234567890,
  exp: 1234571490
}
```

### Middleware Order
1. CORS
2. Body Parser
3. JWT Verification
4. Role Extraction
5. Permission Check
6. Route Handler
7. Error Handler

### Performance Considerations
- Cache user permissions in JWT token to avoid database lookups
- Use indexes on User.role and User.email fields
- Implement permission caching with Redis for high-traffic endpoints
- Batch audit log writes to reduce database load

### Security Considerations
- Hash passwords with bcrypt (cost factor 10)
- Use HTTPS for all authentication endpoints
- Implement rate limiting on login endpoint
- Rotate JWT secrets regularly
- Implement session timeout (24 hours)
- Log all failed authentication attempts
- Implement account lockout after 5 failed attempts
