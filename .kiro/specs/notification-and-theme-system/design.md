op notification collection (after backup)
lers
2. Hide notification bell from UI
3. Revert theme system to dark-theme.css
4. Remove notification API routes
5. Dr
- User receives notification on order confirmation
- User marks notification as read
- User switches theme and it persists
- Admin receives notification on new seller registration

## Migration Plan

1. Create Notification model and indexes
2. Deploy NotificationService and API endpoints
3. Deploy frontend notification components
4. Integrate notification triggers in existing controllers
5. Deploy theme system
6. Monitor and optimize performance

## Rollback Plan

1. Disable notification creation in controls
- Notification API endpoints

### E2E Tests Tab through notifications, Enter to open
3. **Screen Reader**: Announce new notifications
4. **Focus Management**: Focus first notification when dropdown opens
5. **Color Contrast**: Meet WCAG AA standards in both themes
6. **Reduced Motion**: Respect prefers-reduced-motion

## Testing Strategy

### Unit Tests
- NotificationService methods
- Theme toggle functionality
- Notification filtering and sorting

### Integration Tests
- Notification creation on order status change
- Theme persistence across page reloadification bell has descriptive label
2. **Keyboard Navigation**: lists
5. **Lazy Loading**: Load notification dropdown on first click
6. **CSS Transitions**: Use GPU-accelerated transforms

## Security Considerations

1. **Authorization**: Users can only access their own notifications
2. **Input Sanitization**: Sanitize notification content to prevent XSS
3. **Rate Limiting**: Max 100 notifications per user per hour
4. **Data Validation**: Validate notification type and metadata
5. **CORS**: Restrict API access to frontend domain

## Accessibility

1. **ARIA Labels**: Notache unread count for 30 seconds
3. **Debouncing**: Debounce mark-as-read API calls
4. **Virtual Scrolling**: For large notificationllerId);
```

### Seller Registration
```javascript
// In SellerController.createProfile()
await NotificationService.notifyNewSellerRegistration(sellerProfile._id);
```

## State Management

### Notification State
```javascript
{
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
}
```

### Theme State
```javascript
{
  theme: 'light' | 'dark' | 'auto',
  systemTheme: 'light' | 'dark'
}
```

## Performance Optimizations

1. **Pagination**: Load 20 notifications at a time
2. **Caching**: Cccess, info, warning, error
- Slide-in animation
- Stack multiple toasts

## Integration Points

### Order Status Updates
```javascript
// In OrderController.confirmPayment()
await NotificationService.notifyOrderConfirmed(order._id);

// In OrderController.updateOrderStatus()
if (status === 'shipped') {
  await NotificationService.notifyOrderShipped(order._id);
}
```

### Product Approval
```javascript
// In ProductController.approveProduct()
await NotificationService.notifyProductApproved(productId, product.sent
- Appears top-right corner
- Auto-dismiss after 5 seconds
- Types: suew notification

#### NotificationDropdown Component
- Max height: 400px with scroll
- Width: 360px
- Shows last 20 notifications
- "Mark all as read" button at top
- "View all" link at bottom
- Empty state when no notifications

#### NotificationItem Component
- Icon based on type (📦 order, 📋 product, 💰 payment, ⚙️ system)
- Title (bold if unread)
- Message (truncated to 2 lines)
- Timestamp (relative: "2 hours ago")
- Click to mark as read and navigate to link
- Hover effect and delete button

#### Toast Componenread count
- Click opens dropdown
- Positioned in navbar next to cart icon
- Badge color: red (#ef4444)
- Animation on neb;
  --shadow: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  /* Dark Theme */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --shadow: rgba(0, 0, 0, 0.5);
}
```

#### ThemeContext
```javascript
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: (theme) => {}
});
```

### Notification UI Design

#### NotificationBell Component
- Bell icon with badge showing uf2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7/
│   │   ├── ThemeToggle.jsx
│   │   └── ThemeToggle.css
│   └── Toast/
│       ├── Toast.jsx
│       └── Toast.css
├── contexts/
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
├── themes/
│   ├── light-theme.css
│   ├── dark-theme.css
│   └── theme-variables.css
└── api/
    └── notificationAPI.js
```

### Theme System Design

#### Theme Variables (CSS Custom Properties)
```css
:root {
  /* Light Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #1ll.css
│   │   ├── NotificationDropdown.jsx
│   │   └── NotificationItem.jsx
│   ├── ThemeTogglen)
  
  // Seller notifications
  async notifyNewOrder(sellerId, orderId)
  async notifyPaymentReceived(sellerId, orderId, amount)
  
  // Admin notifications
  async notifyNewSellerRegistration(sellerId)
  async notifyNewProductSubmission(productId)
  async notifyRefundRequest(orderId)
  
  // Cleanup
  async cleanupOldNotifications(daysOld = 30)
}
```

## Frontend Design

### Component Structure

```
src/
├── Components/
│   ├── NotificationBell/
│   │   ├── NotificationBell.jsx
│   │   ├── NotificationBeproved(productId, sellerId)
  async notifyProductRejected(productId, sellerId, reaso
#### DELETE /api/notifications/:id
- **Auth**: Required
- **Response**: { success, message }

### Notification Service Methods

```javascript
class NotificationService {
  // Create notification
  async createNotification(userId, type, title, message, metadata = {}, link = null)
  
  // Order notifications
  async notifyOrderConfirmed(orderId)
  async notifyOrderShipped(orderId)
  async notifyOrderDelivered(orderId)
  async notifyOrderCancelled(orderId)
  
  // Product notifications
  async notifyProductApations/:id/read
- **Auth**: Required
- **Response**: { success, data: notification }

#### POST /api/notifications/read-all
- **Auth**: Required
- **Response**: { success, message, count }
*: { success, count: Number }

#### POST /api/notificI Endpoints

#### GET /api/notifications
- **Auth**: Required
- **Query Params**: page, limit, type, isRead
- **Response**: { success, data: [notifications], pagination }

#### GET /api/notifications/unread-count
- **Auth**: Required
- **Response*: Number
  },
  createdAt: Date (default: Date.now),
  expiresAt: Date (optional)
}
```

### APd: ObjectId,
    status: String,
    amountId: Number,
    sellerIdel
2. **Frontend**: Notification UI, Theme Provider, Theme Toggle
3. **Storage**: MongoDB for notifications, localStorage for theme preference

## Backend Design

### Database Schema

#### Notification Model
```javascript
{
  userId: ObjectId (ref: AuthUser),
  type: String (enum: ['order', 'product', 'seller', 'admin', 'system', 'payment']),
  title: String (required),
  message: String (required),
  isRead: Boolean (default: false),
  link: String (optional),
  metadata: {
    orderId: String,
    product Document

## Architecture Overview

### System Components
1. **Backend**: Notification API, Notification Service, Notification Mo# Notification and Theme System - Design