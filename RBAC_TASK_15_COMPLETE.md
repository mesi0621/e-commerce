# RBAC Task 15 Complete: Frontend Role-Based UI

## Overview
Successfully implemented comprehensive frontend role-based UI system with AuthContext and PermissionGuard components for React application.

## Implementation Summary

### 1. AuthContext with Role Support
Created comprehensive authentication context (`frontend/src/contexts/AuthContext.jsx`):

#### State Management
- `user`: Current user object with userId, email, username
- `role`: User's role (admin, seller, customer, delivery, support, finance, guest)
- `permissions`: Array of user permissions
- `loading`: Authentication loading state
- `isAuthenticated`: Boolean authentication status

#### Core Functions

**Authentication**:
- `login(credentials)`: Login with email/password
  * Stores JWT token in localStorage
  * Decodes token to extract user, role, and permissions
  * Updates context state
  * Returns success/error response

- `signup(userData)`: Register new user
  * Creates account with 'customer' role by default
  * Stores JWT token
  * Decodes and sets user data
  * Returns success/error response

- `logout()`: Logout user
  * Removes token from localStorage
  * Resets all state
  * Sets role to 'guest'

**Token Management**:
- `decodeToken(token)`: Decode JWT and extract user info
- `isTokenExpired(token)`: Check if token is expired
- Auto-loads user from localStorage on mount
- Auto-clears expired tokens

**Permission Checks**:
- `hasRole(role)`: Check if user has specific role
  * Supports single role: `hasRole('admin')`
  * Supports multiple roles (OR logic): `hasRole(['admin', 'seller'])`

- `hasPermission(permission)`: Check if user has specific permission
  * Admin automatically has all permissions
  * Supports single permission: `hasPermission('products.create')`
  * Supports multiple permissions (OR logic): `hasPermission(['products.update.own', 'products.update.all'])`

- `canAccess(resource, action, scope)`: Check resource access
  * Example: `canAccess('products', 'update', 'own')`
  * Checks for `products.update.own` or `products.update` permission
  * Admin bypasses all checks

**Utility Functions**:
- `getDisplayName()`: Get user display name (username or email)
- `getRoleDisplayName()`: Get formatted role name (e.g., "Administrator", "Delivery Staff")

**Role Check Shortcuts**:
- `isAdmin()`: Check if user is admin
- `isSeller()`: Check if user is seller
- `isCustomer()`: Check if user is customer
- `isDelivery()`: Check if user is delivery staff
- `isSupport()`: Check if user is support staff
- `isFinance()`: Check if user is finance staff
- `isGuest()`: Check if user is guest/unauthenticated

#### Custom Hooks
- `useAuth()`: Access auth context
- `usePermission(permission)`: Check specific permission
- `useRole(role)`: Check specific role

### 2. PermissionGuard Component
Created flexible permission guard component (`frontend/src/Components/PermissionGuard/PermissionGuard.jsx`):

#### Main Component: PermissionGuard

**Props**:
- `permission`: Required permission(s) - string or array
- `role`: Required role(s) - string or array
- `requireAuth`: Require authentication (boolean)
- `fallback`: Redirect path on denial (string or null)
- `hideOnDenied`: Hide component if denied (boolean)
- `showMessage`: Show denial message (boolean)
- `customMessage`: Custom denial message (string)
- `loading`: Custom loading component

**Behavior**:
- Shows loading state while checking auth
- Checks authentication if `requireAuth` is true
- Checks role if `role` prop is provided
- Checks permission if `permission` prop is provided
- On denial:
  * Hides component if `hideOnDenied` is true
  * Redirects to `fallback` path if provided
  * Shows message if `showMessage` is true
  * Returns null otherwise

#### Usage Examples

**1. Route Protection**:
```jsx
<PermissionGuard permission="products.create" fallback="/unauthorized">
  <CreateProduct />
</PermissionGuard>
```

**2. UI Element Protection (hide if denied)**:
```jsx
<PermissionGuard permission="products.delete" hideOnDenied>
  <button>Delete</button>
</PermissionGuard>
```

**3. Role-based Protection**:
```jsx
<PermissionGuard role="admin" fallback="/home">
  <AdminDashboard />
</PermissionGuard>
```

**4. Multiple Permissions (OR logic)**:
```jsx
<PermissionGuard permission={["products.update.own", "products.update.all"]}>
  <EditButton />
</PermissionGuard>
```

**5. Multiple Roles (OR logic)**:
```jsx
<PermissionGuard role={["admin", "seller"]}>
  <SellerPanel />
</PermissionGuard>
```

**6. Show Denial Message**:
```jsx
<PermissionGuard 
  permission="orders.view" 
  showMessage 
  customMessage="Please login to view orders"
>
  <OrderList />
</PermissionGuard>
```

#### Shorthand Components

**RequireAuth**: Require authentication
```jsx
<RequireAuth fallback="/login">
  <ProtectedPage />
</RequireAuth>
```

**RequireRole**: Require specific role
```jsx
<RequireRole role="admin" fallback="/unauthorized">
  <AdminPanel />
</RequireRole>
```

**RequirePermission**: Require specific permission
```jsx
<RequirePermission permission="products.create">
  <CreateButton />
</RequirePermission>
```

**AdminOnly**: Admin-only content
```jsx
<AdminOnly hideOnDenied>
  <AdminSettings />
</AdminOnly>
```

**SellerOnly**: Seller-only content
```jsx
<SellerOnly>
  <SellerDashboard />
</SellerOnly>
```

**CustomerOnly**: Customer-only content
```jsx
<CustomerOnly>
  <CheckoutButton />
</CustomerOnly>
```

**StaffOnly**: Staff-only content (delivery, support, finance)
```jsx
<StaffOnly>
  <StaffPanel />
</StaffOnly>
```

### 3. Styling
Created CSS for PermissionGuard (`frontend/src/Components/PermissionGuard/PermissionGuard.css`):

**Features**:
- Loading state styling
- Denial message styling (warning style)
- Dark theme support
- Inline message variant

### 4. Integration with Existing API
- Integrated with existing `authAPI.js` for login/signup
- Uses existing `client.js` axios instance with JWT interceptor
- Token automatically added to all API requests via interceptor

## Key Features

### Comprehensive Permission System
- Role-based access control
- Permission-based access control
- Resource-action-scope pattern support
- Multiple roles/permissions with OR logic
- Admin bypass for all permissions

### Flexible Component Protection
- Route-level protection with redirects
- UI element hiding based on permissions
- Custom denial messages
- Loading states
- Multiple protection strategies

### Developer-Friendly API
- Simple hooks: `useAuth()`, `usePermission()`, `useRole()`
- Shorthand components for common cases
- Clear prop names and behavior
- TypeScript-ready structure

### Security
- JWT token validation
- Automatic token expiration handling
- Token stored in localStorage
- Automatic token cleanup on expiry
- Permission checks on both frontend and backend

### User Experience
- Loading states during auth check
- Graceful denial handling
- Custom messages for denied access
- Automatic redirect options
- Dark theme support

## Files Created
- ✅ `frontend/src/contexts/AuthContext.jsx` (AuthContext with role support)
- ✅ `frontend/src/Components/PermissionGuard/PermissionGuard.jsx` (PermissionGuard component)
- ✅ `frontend/src/Components/PermissionGuard/PermissionGuard.css` (Styling)
- ✅ `frontend/src/Components/PermissionGuard/index.js` (Export file)

## Dependencies Added
- ✅ `jwt-decode` - JWT token decoding

## Testing Status
- All diagnostics passed
- No syntax or linting errors
- Ready for integration

## Integration Guide

### 1. Wrap App with AuthProvider
```jsx
// src/index.js or src/App.js
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use in Components
```jsx
import { useAuth } from './contexts/AuthContext';
import PermissionGuard, { AdminOnly } from './Components/PermissionGuard';

function MyComponent() {
  const { user, role, hasPermission, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <p>Role: {role}</p>
      
      <PermissionGuard permission="products.create" hideOnDenied>
        <button>Create Product</button>
      </PermissionGuard>
      
      <AdminOnly>
        <button>Admin Settings</button>
      </AdminOnly>
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Protect Routes
```jsx
import { RequireAuth, RequireRole } from './Components/PermissionGuard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <RequireAuth fallback="/login">
          <Dashboard />
        </RequireAuth>
      } />
      
      <Route path="/admin" element={
        <RequireRole role="admin" fallback="/unauthorized">
          <AdminDashboard />
        </RequireRole>
      } />
    </Routes>
  );
}
```

## Next Steps

### Task 16: Create Admin Dashboard
- Admin layout and navigation
- User management interface
- Product approval interface

### Task 17: Create Seller Dashboard
- Seller layout and navigation
- Product management
- Order management

### Task 18: Update Customer Interface
- Customer-specific features
- Guest restrictions

### Task 19-21: Create Staff Interfaces
- Delivery staff interface
- Support staff interface
- Finance staff interface

### Task 22: Implement Role-Based Routing
- Protected routes
- Route guards
- 403 error pages

## Statistics
- **Lines of Code**: ~500 lines
- **Components**: 1 main component + 7 shorthand components
- **Hooks**: 3 custom hooks
- **Functions**: 20+ utility functions
- **Time to Complete**: Single session

---
**Status**: ✅ Complete
**Date**: 2026-02-18
