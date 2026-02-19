# Backend-Frontend Connection Setup

## Overview
The backend and frontend are now properly connected with the following configuration:

## Backend Configuration

### Server Details
- **Port**: 5000
- **Base URL**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`

### CORS Configuration
```javascript
cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Available API Endpoints
- `/api/auth` - Authentication (login, signup, profile)
- `/api/products` - Product management
- `/api/cart` - Shopping cart operations
- `/api/reviews` - Product reviews
- `/api/interactions` - User interaction tracking
- `/api/inventory` - Inventory management
- `/api/audit` - Audit logs
- `/api/admin` - Admin operations
- `/api/seller` - Seller operations
- `/api/orders` - Order management
- `/api/payments` - Payment processing

## Frontend Configuration

### Server Details
- **Port**: 3000
- **Base URL**: `http://localhost:3000`

### Environment Variables
Created `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

### API Client Configuration
- **File**: `frontend/src/api/client.js`
- **Base URL**: `http://localhost:5000/api` (from env or default)
- **Timeout**: 10 seconds
- **Auth**: Automatically includes JWT token from localStorage

### Request Interceptor
```javascript
// Automatically adds Authorization header with JWT token
config.headers.Authorization = `Bearer ${token}`;
```

## Connection Flow

### 1. User Authentication
```
Frontend (Login) → POST /api/auth/login → Backend
Backend → Returns JWT token → Frontend
Frontend → Stores token in localStorage as 'auth-token'
```

### 2. API Requests
```
Frontend → Makes API request → Interceptor adds auth token
Request → http://localhost:5000/api/[endpoint]
Backend → Verifies token → Processes request
Backend → Returns response → Frontend
```

### 3. Cart Operations
```
Frontend → POST /api/cart/:userId/items
Headers: { Authorization: Bearer [token] }
Body: { productId, quantity, price }
Backend → Verifies token → Adds to cart
Backend → Returns updated cart → Frontend
```

### 4. Order & Payment
```
Frontend → POST /api/orders
Headers: { Authorization: Bearer [token] }
Body: { shippingAddress, paymentMethod }
Backend → Creates order → Returns order
Frontend → POST /api/payments/process
Backend → Processes payment → Returns payment URL
Frontend → Redirects to payment gateway
```

## Testing the Connection

### 1. Check Backend is Running
```bash
curl http://localhost:5000
```
Expected response:
```json
{
  "message": "E-Commerce API Server",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 2. Check Frontend is Running
Open browser to: `http://localhost:3000`

### 3. Test API Connection from Browser Console
```javascript
// Test basic connection
fetch('http://localhost:5000/api/products')
  .then(r => r.json())
  .then(console.log);

// Test authenticated request
const token = localStorage.getItem('auth-token');
fetch('http://localhost:5000/api/cart/USER_ID', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log);
```

### 4. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions (login, add to cart, etc.)
4. Check requests:
   - URL should be `http://localhost:5000/api/...`
   - Headers should include `Authorization: Bearer ...`
   - Status should be 200 for successful requests

## Common Connection Issues

### Issue 1: CORS Error
**Symptom**: "Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy"

**Solution**: 
- Backend CORS is now configured to allow localhost:3000
- Restart backend server to apply changes

### Issue 2: Network Error
**Symptom**: "Network Error" in console

**Solution**:
- Check backend is running: `http://localhost:5000`
- Check MongoDB is connected
- Check firewall settings

### Issue 3: 401 Unauthorized
**Symptom**: API returns 401 status

**Solution**:
- User needs to login first
- Check auth token exists: `localStorage.getItem('auth-token')`
- Token might be expired - login again

### Issue 4: 404 Not Found
**Symptom**: API returns 404 status

**Solution**:
- Check endpoint URL is correct
- Check route is registered in backend/server.js
- Check route file exists in backend/routes/

## Verification Checklist

✓ Backend running on port 5000
✓ Frontend running on port 3000
✓ MongoDB connected
✓ CORS configured for localhost:3000
✓ API client configured with correct base URL
✓ Auth token interceptor enabled
✓ Environment variables set

## Files Modified

1. **backend/server.js** - Enhanced CORS configuration
2. **frontend/.env** - Created with API URL configuration
3. **frontend/src/api/client.js** - Already configured (auth token interceptor enabled)

## Next Steps

1. **Restart Backend Server** (if not using nodemon):
   ```bash
   cd backend
   npm run dev
   ```

2. **Restart Frontend Server** (to pick up .env changes):
   ```bash
   cd frontend
   npm start
   ```

3. **Test the Connection**:
   - Login to the application
   - Add items to cart
   - Proceed to checkout
   - Monitor browser console and network tab

## Environment Variables Summary

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Frontend (React)                            │    │
│  │         http://localhost:3000                       │    │
│  │                                                      │    │
│  │  - Components (ProductDisplay, Cart, Checkout)     │    │
│  │  - Context (ShopContext)                           │    │
│  │  - API Client (axios with interceptors)            │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓ HTTP Requests                     │
│                          ↓ (with JWT token)                  │
└──────────────────────────┼──────────────────────────────────┘
                           ↓
┌──────────────────────────┼──────────────────────────────────┐
│                          ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Backend (Express)                           │    │
│  │         http://localhost:5000                       │    │
│  │                                                      │    │
│  │  - Routes (auth, products, cart, orders, payments) │    │
│  │  - Controllers (business logic)                     │    │
│  │  - Services (reusable logic)                        │    │
│  │  - Middleware (auth, CORS)                          │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                    │
│                          ↓ MongoDB Queries                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         MongoDB                                     │    │
│  │         mongodb://localhost:27017/ecommerce         │    │
│  │                                                      │    │
│  │  - Collections: products, carts, orders, users     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Success Indicators

When properly connected, you should see:

1. **Browser Console**:
   - No CORS errors
   - Successful API responses
   - Auth token in localStorage

2. **Backend Logs**:
   - "Server running on port 5000"
   - "MongoDB Connected: localhost"
   - API request logs

3. **Network Tab**:
   - Requests to localhost:5000
   - Status 200 for successful requests
   - Authorization headers present

4. **Functionality**:
   - Users can login/signup
   - Products load correctly
   - Cart operations work
   - Checkout process completes
   - Orders are created
