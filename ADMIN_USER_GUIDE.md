# Admin User Guide

## Welcome to the Admin Dashboard

This guide will help you understand and use all the features available in the Admin Dashboard of the Modo E-Commerce platform.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Product Management](#product-management)
5. [Order Management](#order-management)
6. [Audit Logs](#audit-logs)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Dashboard

1. Navigate to the login page: `http://localhost:3000/login`
2. Enter your admin credentials
3. After successful login, navigate to `/admin-rbac`
4. You will see the Admin Dashboard with four main tabs

### Admin Credentials
- **Email**: Your admin email
- **Password**: Your admin password
- **Note**: Change default password immediately after first login

---

## Dashboard Overview

The Admin Dashboard consists of four main sections:

### 1. Overview Tab
Displays key statistics and metrics:
- **Total Users**: Number of registered users
- **Total Products**: Number of products in the system
- **Pending Products**: Products awaiting approval
- **Total Orders**: Number of orders placed

### 2. Users Tab
Manage all user accounts and roles

### 3. Pending Products Tab
Review and approve seller products

### 4. Orders Tab
View and manage all orders in the system

---

## User Management

### Viewing Users

1. Click on the **Users** tab
2. You'll see a list of all registered users with:
   - Username
   - Email
   - Current Role
   - Account Status
   - Registration Date

### Changing User Roles

**To assign a new role to a user**:

1. Locate the user in the Users list
2. Find the **Role** dropdown next to their name
3. Select the new role from the dropdown:
   - **Admin**: Full system access
   - **Seller**: Can sell products
   - **Customer**: Can purchase products
   - **Delivery**: Manages deliveries
   - **Support**: Handles customer support
   - **Finance**: Manages financial operations
4. The role change is applied immediately
5. The user will have new permissions on their next login

**Important Notes**:
- Role changes are logged in the audit system
- Users are notified of role changes via email
- Be careful when assigning admin roles
- Role changes take effect immediately

### Activating/Deactivating Accounts

**To deactivate a user account**:
1. Find the user in the Users list
2. Click the **Deactivate** button
3. Confirm the action
4. The user will be logged out and cannot login until reactivated

**To reactivate a user account**:
1. Find the deactivated user (marked with inactive status)
2. Click the **Activate** button
3. The user can now login again

---

## Product Management

### Viewing Pending Products

1. Click on the **Pending Products** tab
2. You'll see all products awaiting approval with:
   - Product image
   - Product name
   - Seller name
   - Price
   - Category
   - Submission date

### Approving Products

**To approve a product**:

1. Review the product details:
   - Check product name and description
   - Verify pricing is reasonable
   - Ensure images are appropriate
   - Confirm category is correct
2. Click the **Approve** button
3. The product will immediately appear in the store
4. The seller will be notified of approval

**Approval Guidelines**:
- ✓ Product name is clear and descriptive
- ✓ Images are high quality and appropriate
- ✓ Price is reasonable for the product
- ✓ Description is accurate and complete
- ✓ Category is correctly assigned
- ✗ No prohibited items (weapons, illegal goods, etc.)
- ✗ No misleading information
- ✗ No copyright violations

### Rejecting Products

**To reject a product**:

1. Click the **Reject** button
2. Provide a reason for rejection
3. The seller will be notified with the reason
4. The product remains in pending status for seller to edit

**Common Rejection Reasons**:
- Inappropriate content
- Misleading description
- Poor quality images
- Incorrect pricing
- Wrong category
- Prohibited items

### Viewing All Products

1. Navigate to the main products page
2. As admin, you can see all products (approved and pending)
3. You can edit or delete any product if needed

---

## Order Management

### Viewing Orders

1. Click on the **Orders** tab
2. You'll see all orders in the system with:
   - Order number
   - Customer name
   - Order date
   - Total amount
   - Current status
   - Payment method

### Order Statuses

Orders progress through these statuses:
1. **Pending**: Order placed, awaiting confirmation
2. **Confirmed**: Order confirmed by seller
3. **Processing**: Order being prepared
4. **Shipped**: Order shipped to customer
5. **Delivered**: Order delivered to customer
6. **Cancelled**: Order cancelled

### Updating Order Status

**To change order status**:

1. Find the order in the Orders list
2. Click on the order to view details
3. Select new status from the dropdown
4. Click **Update Status**
5. Customer and seller are notified of the change

**Admin Privileges**:
- Can update orders to any status
- Can override seller/delivery restrictions
- Can cancel orders at any time
- Can view full order history

### Assigning Deliveries

**To assign a delivery to delivery staff**:

1. Find an order with status "Shipped"
2. Click **Assign Delivery**
3. Select a delivery staff member from the list
4. Click **Assign**
5. The delivery staff will see the order in their dashboard

---

## Audit Logs

### Accessing Audit Logs

1. Navigate to `/audit/logs` (admin only)
2. You'll see a chronological list of all system events

### What is Logged

The audit system tracks:
- **Authentication Events**: Logins, logouts, failed attempts
- **Permission Denials**: Unauthorized access attempts
- **Role Changes**: User role assignments
- **Admin Actions**: Product approvals, order updates
- **Security Events**: Token refresh, password resets

### Viewing Audit Logs

Each log entry shows:
- **Timestamp**: When the event occurred
- **User**: Who performed the action
- **Action**: What was done
- **Result**: Success, error, or denied
- **IP Address**: Where the request came from
- **Details**: Additional information

### Filtering Logs

You can filter logs by:
- User ID
- Action type
- Date range
- Result (success/error/denied)

### Using Audit Logs

**Security Monitoring**:
- Check for suspicious login attempts
- Monitor failed permission checks
- Track admin actions
- Identify unusual patterns

**Compliance**:
- Maintain records of all system changes
- Track who made what changes and when
- Provide audit trail for investigations

**Troubleshooting**:
- Identify why a user can't access something
- Track down when a change was made
- Understand sequence of events

---

## Best Practices

### Security

1. **Change Default Password**:
   - Change your password immediately after first login
   - Use a strong, unique password
   - Enable two-factor authentication if available

2. **Limit Admin Accounts**:
   - Only assign admin role to trusted users
   - Regularly review admin accounts
   - Remove admin access when no longer needed

3. **Monitor Audit Logs**:
   - Check audit logs regularly
   - Look for suspicious activity
   - Investigate failed login attempts

4. **Secure Your Session**:
   - Always logout when finished
   - Don't share your credentials
   - Use a secure, private computer

### User Management

1. **Role Assignment**:
   - Assign the minimum role needed
   - Review roles periodically
   - Document why roles were assigned

2. **Account Deactivation**:
   - Deactivate accounts instead of deleting
   - Keep audit trail intact
   - Can reactivate if needed

3. **Communication**:
   - Notify users of role changes
   - Explain why accounts are deactivated
   - Provide clear guidelines

### Product Management

1. **Approval Process**:
   - Review products thoroughly
   - Be consistent with standards
   - Provide clear rejection reasons
   - Respond to sellers promptly

2. **Quality Control**:
   - Maintain high product standards
   - Check for prohibited items
   - Verify pricing is reasonable
   - Ensure descriptions are accurate

3. **Seller Relations**:
   - Communicate approval criteria clearly
   - Help sellers improve rejected products
   - Be fair and consistent

### Order Management

1. **Status Updates**:
   - Keep orders moving through statuses
   - Update customers on delays
   - Coordinate with sellers and delivery staff

2. **Customer Service**:
   - Respond to order issues promptly
   - Resolve disputes fairly
   - Maintain good customer relations

3. **Delivery Management**:
   - Assign deliveries promptly
   - Monitor delivery performance
   - Address delivery issues quickly

---

## Troubleshooting

### Common Issues

#### Can't Access Admin Dashboard

**Problem**: Redirected to 403 Forbidden page

**Solutions**:
1. Verify you have admin role
2. Check if your account is active
3. Try logging out and back in
4. Clear browser cache and cookies
5. Contact system administrator

#### Can't Approve Products

**Problem**: Approve button doesn't work

**Solutions**:
1. Check if product is already approved
2. Verify you have admin permissions
3. Check browser console for errors
4. Try refreshing the page
5. Check if backend server is running

#### Can't See All Users

**Problem**: User list is empty or incomplete

**Solutions**:
1. Check if database is connected
2. Verify admin permissions
3. Try refreshing the page
4. Check network tab for API errors
5. Contact technical support

#### Role Changes Not Working

**Problem**: User role doesn't change

**Solutions**:
1. Verify you selected a different role
2. Check if change was saved (check audit logs)
3. Ask user to logout and login again
4. Check for error messages
5. Verify database connection

### Getting Help

If you encounter issues not covered here:

1. **Check Audit Logs**: Look for error messages
2. **Check Browser Console**: Look for JavaScript errors
3. **Check Network Tab**: Look for failed API requests
4. **Contact Support**: Email support@ecommerce.com
5. **Check Documentation**: Review API documentation

---

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Quick search
- **Ctrl/Cmd + /**: Toggle sidebar
- **Esc**: Close modals
- **Tab**: Navigate between fields

---

## Tips and Tricks

1. **Bulk Operations**: Select multiple items for bulk actions
2. **Quick Filters**: Use filters to find specific items quickly
3. **Export Data**: Export reports for offline analysis
4. **Bookmarks**: Bookmark frequently used pages
5. **Notifications**: Enable browser notifications for important events

---

## Security Reminders

- ⚠️ Never share your admin credentials
- ⚠️ Always logout when finished
- ⚠️ Use a strong, unique password
- ⚠️ Monitor audit logs regularly
- ⚠️ Report suspicious activity immediately
- ⚠️ Keep your browser and OS updated
- ⚠️ Use HTTPS in production

---

## Additional Resources

- **API Documentation**: See RBAC_API_DOCUMENTATION.md
- **Integration Testing**: See RBAC_INTEGRATION_TESTING.md
- **Technical Support**: support@ecommerce.com
- **System Status**: http://localhost:5000/health

---

**Last Updated**: 2026-02-19  
**Version**: 1.0.0

For questions or feedback, contact: admin@ecommerce.com
