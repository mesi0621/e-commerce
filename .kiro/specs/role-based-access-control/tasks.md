# Implementation Plan: Role-Based Access Control System

## Overview

This implementation plan breaks down the RBAC system into discrete, manageable tasks. The implementation will extend the existing authentication system and integrate role-based permissions across all platform features.

## Tasks

- [x] 1. Create database models and schemas
  - Create Role model with name, permissions, and system flag
  - Create Permission model with resource and action fields
  - Create AuditLog model for security logging
  - Extend User model with role, permissions, and isActive fields
  - Create SellerProfile model for seller-specific data
  - Add database indexes for performance
  - _Requirements: 1.1, 9.6, 12.1-12.6_

- [x] 2. Implement core permission system
  - [x] 2.1 Create PermissionService class
    - Implement checkPermission(userId, permission) method
    - Implement hasRole(userId, role) method
    - Implement getPermissions(userId) method
    - Add permission caching logic
    - _Requirements: 9.3, 11.1_

  - [ ]* 2.2 Write property test for permission checking
    - **Property 10: Permission Check Before Action**
    - **Validates: Requirements 9.3, 11.1**

  - [x] 2.3 Create RoleService class
    - Implement assignRole(userId, roleName) method
    - Implement getRolePermissions(roleName) method
    - Implement createRole(roleData) method
    - Implement updateRole(roleId, updates) method
    - _Requirements: 1.3, 1.5, 13.1-13.5_

  - [ ]* 2.4 Write property test for role assignment
    - **Property 4: Role Change Permission Swap**
    - **Property 13: Role Assignment Authorization**
    - **Validates: Requirements 1.5, 13.1-13.5**

- [x] 3. Implement authentication middleware
  - [x] 3.1 Create JWT authentication middleware
    - Extract and verify JWT token from request headers
    - Decode user ID, role, and permissions from token
    - Attach user data to request object
    - Handle token expiration and invalid tokens
    - _Requirements: 9.1, 9.2, 9.5, 9.6_

  - [ ]* 3.2 Write property test for JWT validation
    - **Property 9: Authentication Session Creation**
    - **Validates: Requirements 9.2**

  - [x] 3.3 Create permission check middleware
    - Implement requirePermission(permission) middleware factory
    - Implement requireRole(role) middleware factory
    - Return 403 Forbidden for insufficient permissions
    - _Requirements: 9.3, 9.4, 11.1, 11.3_

  - [ ]* 3.4 Write property test for authorization
    - **Property 11: Unauthorized Access Denial**
    - **Validates: Requirements 9.4, 11.3**

- [x] 4. Implement audit logging system
  - [x] 4.1 Create AuditService class
    - Implement logAuthentication(userId, result) method
    - Implement logPermissionDenial(userId, permission) method
    - Implement logRoleChange(userId, oldRole, newRole) method
    - Implement logAdminAction(userId, action, details) method
    - _Requirements: 11.4, 12.1-12.6_

  - [ ]* 4.2 Write property test for audit logging
    - **Property 12: Audit Log Creation**
    - **Validates: Requirements 11.4, 12.1-12.4**

  - [x] 4.3 Create audit log query endpoints
    - GET /api/audit/logs - List audit logs (admin only)
    - GET /api/audit/logs/:userId - User-specific logs
    - Add filtering by action, date range, result
    - _Requirements: 2.7, 12.5_

- [x] 5. Checkpoint - Ensure core RBAC system works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Seed default roles and permissions
  - [x] 6.1 Create database seed script
    - Define all seven roles with permissions
    - Create default admin account
    - Create permission definitions
    - _Requirements: 1.1, 15.1-15.5_

  - [x] 6.2 Create role initialization service
    - Check if roles exist on startup
    - Create missing system roles
    - Update role permissions if changed
    - _Requirements: 1.1_

  - [ ]* 6.3 Write property test for role validity
    - **Property 1: Role Validity**
    - **Validates: Requirements 1.1**

- [x] 7. Update authentication endpoints
  - [x] 7.1 Modify signup endpoint
    - Assign 'customer' role by default
    - Generate JWT with role and permissions
    - _Requirements: 1.2, 9.2_

  - [ ]* 7.2 Write property test for default role
    - **Property 2: Default Role Assignment**
    - **Validates: Requirements 1.2**

  - [x] 7.3 Modify login endpoint
    - Include role and permissions in JWT
    - Log authentication attempt
    - Update lastLogin timestamp
    - _Requirements: 9.1, 9.2, 12.1_

  - [x] 7.4 Create role management endpoints
    - POST /api/admin/users/:userId/role - Assign role (admin only)
    - GET /api/admin/roles - List all roles
    - POST /api/admin/roles - Create custom role
    - PUT /api/admin/roles/:roleId - Update role
    - _Requirements: 2.1, 2.6, 13.1-13.5_

- [x] 8. Implement seller-specific features
  - [x] 8.1 Create SellerProfile model and endpoints
    - POST /api/seller/profile - Create seller profile
    - GET /api/seller/profile - Get own profile
    - PUT /api/seller/profile - Update profile
    - POST /api/admin/sellers/:sellerId/approve - Approve seller
    - _Requirements: 3.1-3.7_

  - [x] 8.2 Add seller product isolation
    - Filter product queries by seller ID
    - Prevent cross-seller product access
    - Add sellerId to Product model
    - _Requirements: 3.6, 14.1-14.5_

  - [ ]* 8.3 Write property test for seller isolation
    - **Property 6: Seller Product Isolation**
    - **Property 14: Seller Data Isolation**
    - **Validates: Requirements 3.6, 14.1-14.5**

- [x] 9. Update product endpoints with permissions
  - [x] 9.1 Add permission checks to product routes
    - POST /api/products - Require 'products.create'
    - PUT /api/products/:id - Require 'products.update.own' or 'products.update.all'
    - DELETE /api/products/:id - Require 'products.delete.own' or 'products.delete.all'
    - POST /api/admin/products/:id/approve - Require 'products.approve'
    - _Requirements: 2.2, 3.1-3.7_

  - [x] 9.2 Implement ownership verification
    - Check if user owns the product before allowing updates
    - Allow admins to bypass ownership check
    - _Requirements: 3.6, 14.1_

  - [ ]* 9.3 Write property test for admin access
    - **Property 5: Admin Full Access**
    - **Validates: Requirements 2.1-2.7**

- [x] 10. Update order endpoints with permissions
  - [x] 10.1 Add permission checks to order routes
    - GET /api/orders - Filter by role (customers see own, sellers see their products, admin sees all)
    - POST /api/orders - Require 'orders.create'
    - PUT /api/orders/:id/status - Require 'orders.update.own' or 'orders.manage.all'
    - _Requirements: 2.4, 3.3, 4.4, 5.2_

  - [x] 10.2 Implement order filtering by role
    - Customers see only their orders
    - Sellers see orders containing their products
    - Delivery staff see assigned deliveries
    - Admins see all orders
    - _Requirements: 4.4, 5.1, 14.4_

- [x] 11. Implement delivery staff features
  - [x] 11.1 Create delivery assignment system
    - POST /api/admin/deliveries/assign - Assign delivery to staff
    - GET /api/delivery/orders - Get assigned deliveries
    - PUT /api/delivery/orders/:id/status - Update delivery status
    - _Requirements: 5.1-5.6_

  - [x] 11.2 Add delivery status tracking
    - Create DeliveryStatus enum (pending, assigned, in_transit, delivered)
    - Add delivery tracking to Order model
    - _Requirements: 5.2, 5.3_

- [x] 12. Implement support staff features
  - [x] 12.1 Create support ticket system
    - POST /api/support/tickets - Create ticket
    - GET /api/support/tickets - List tickets (support staff)
    - PUT /api/support/tickets/:id - Update ticket
    - POST /api/support/tickets/:id/resolve - Resolve ticket
    - _Requirements: 6.1-6.6_

  - [x] 12.2 Add review moderation
    - PUT /api/support/reviews/:id/moderate - Hide/approve review
    - GET /api/support/reviews/flagged - List flagged reviews
    - _Requirements: 6.3_

- [x] 13. Implement finance staff features
  - [x] 13.1 Create financial reporting endpoints
    - GET /api/finance/transactions - List all transactions
    - GET /api/finance/reports/sales - Sales report
    - GET /api/finance/reports/commissions - Commission report
    - POST /api/finance/payouts - Process seller payout
    - _Requirements: 7.1-7.5_

  - [x] 13.2 Add commission tracking
    - Calculate platform commission on orders
    - Track seller balances
    - Generate payout records
    - _Requirements: 7.4_

- [x] 14. Checkpoint - Ensure all backend features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement frontend role-based UI
  - [x] 15.1 Create AuthContext with role support
    - Store user role and permissions in context
    - Provide useAuth() hook
    - Provide usePermission(permission) hook
    - _Requirements: 10.1-10.5_

  - [x] 15.2 Create PermissionGuard component
    - Wrap components that require permissions
    - Hide UI elements if user lacks permission
    - Show "Access Denied" message for unauthorized access
    - _Requirements: 10.5, 11.2_

  - [ ]* 15.3 Write property test for customer permissions
    - **Property 7: Customer Purchase Permission**
    - **Validates: Requirements 4.1-4.7**

- [x] 16. Create admin dashboard
  - [x] 16.1 Create admin layout and navigation
    - Dashboard overview with statistics
    - User management section
    - Product approval section
    - Order management section
    - System settings section
    - _Requirements: 2.1-2.7, 10.2_

  - [x] 16.2 Create user management interface
    - List all users with filters
    - View user details
    - Assign/change user roles
    - Activate/deactivate accounts
    - _Requirements: 2.1, 2.6_

  - [x] 16.3 Create product approval interface
    - List pending products
    - Approve/reject products
    - View seller information
    - _Requirements: 2.2_

- [x] 17. Create seller dashboard
  - [x] 17.1 Create seller layout and navigation
    - Dashboard with sales statistics
    - Product management section
    - Order management section
    - Profile settings
    - _Requirements: 3.1-3.7, 10.3_

  - [x] 17.2 Create seller product management
    - List seller's products
    - Add new product form
    - Edit product form
    - Delete product confirmation
    - _Requirements: 3.1, 3.2_

  - [x] 17.3 Create seller order management
    - List orders for seller's products
    - Update order status
    - View order details
    - _Requirements: 3.3, 3.4_

- [x] 18. Update customer interface
  - [x] 18.1 Add customer-specific features
    - Order history page
    - Order tracking page
    - Wishlist functionality
    - Review submission
    - _Requirements: 4.1-4.7, 10.4_

  - [x] 18.2 Implement guest restrictions
    - Show "Login to purchase" for guests
    - Redirect to login on cart/checkout
    - Allow browsing without login
    - _Requirements: 8.1-8.6_

  - [ ]* 18.3 Write property test for guest restrictions
    - **Property 8: Guest Restriction**
    - **Validates: Requirements 8.1-8.6**

- [x] 19. Create delivery staff interface
  - [x] 19.1 Create delivery dashboard
    - List assigned deliveries
    - View delivery details
    - Update delivery status
    - Mark as delivered
    - _Requirements: 5.1-5.6_

- [x] 20. Create support staff interface
  - [x] 20.1 Create support dashboard
    - List support tickets
    - View ticket details
    - Respond to tickets
    - Moderate reviews
    - _Requirements: 6.1-6.6_

- [x] 21. Create finance staff interface
  - [x] 21.1 Create finance dashboard
    - View financial reports
    - List transactions
    - Process payouts
    - View commission data
    - _Requirements: 7.1-7.5_

- [x] 22. Implement role-based routing
  - [x] 22.1 Create protected routes
    - /admin/* - Admin only
    - /seller/* - Seller only
    - /delivery/* - Delivery staff only
    - /support/* - Support staff only
    - /finance/* - Finance staff only
    - _Requirements: 10.1-10.5_

  - [x] 22.2 Add route guards
    - Redirect unauthorized users to home
    - Show 403 page for insufficient permissions
    - _Requirements: 11.2_

- [x] 23. Add security features
  - [x] 23.1 Implement password hashing
    - Use bcrypt with cost factor 10
    - Hash passwords on signup and password change
    - _Requirements: 9.6, 15.5_

  - [x] 23.2 Implement rate limiting
    - Limit login attempts (5 per 15 minutes)
    - Limit API requests (100 per minute)
    - _Requirements: 9.6_

  - [x] 23.3 Implement session management
    - Set JWT expiration to 24 hours
    - Implement token refresh endpoint
    - Implement logout (token blacklist)
    - _Requirements: 9.5_

- [x] 24. Final checkpoint - Integration testing
  - Test complete user flows for each role
  - Test role transitions (customer → seller)
  - Test permission enforcement across all endpoints
  - Test audit logging for all actions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 25. Documentation and deployment
  - [x] 25.1 Create API documentation
    - Document all new endpoints
    - Document permission requirements
    - Document role definitions
    - _Requirements: All_

  - [x] 25.2 Create user guides
    - Admin user guide
    - Seller onboarding guide
    - Customer guide
    - _Requirements: All_

  - [x] 25.3 Create deployment checklist
    - Database migration steps
    - Environment variables
    - Default admin account setup
    - Security configuration
    - _Requirements: 15.1-15.5_

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Implementation should be done in order to maintain dependencies
- Each role dashboard can be developed in parallel after core RBAC is complete
