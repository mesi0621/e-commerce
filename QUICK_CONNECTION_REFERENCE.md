# Quick Connection Reference

## 🚀 Servers Running

| Server | Port | URL | Status |
|--------|------|-----|--------|
| Backend | 5000 | http://localhost:5000 | ✅ Running |
| Frontend | 3000 | http://localhost:3000 | ✅ Running |
| MongoDB | 27017 | mongodb://localhost:27017/ecommerce | ✅ Connected |

## 🔗 Connection Details

### Backend → Frontend
- **CORS**: Allows `http://localhost:3000`
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization

### Frontend → Backend
- **API Base**: `http://localhost:5000/api`
- **Auth**: JWT token from localStorage (`auth-token`)
- **Timeout**: 10 seconds

## 📝 Quick Test Commands

### Browser Console (F12)
```javascript
// Check connection
fetch('http://localhost:5000/api/products').then(r => r.json()).then(console.log)

// Check auth token
localStorage.getItem('auth-token')

// Check API URL
console.log(process.env.REACT_APP_API_URL)
```

### Terminal
```bash
# Test backend
curl http://localhost:5000

# Test API endpoint
curl http://localhost:5000/api/products
```

## 🎯 Test Flow

1. **Open**: http://localhost:3000
2. **Login**: Create account or login
3. **Browse**: View products
4. **Add to Cart**: Select size → Set quantity → Add
5. **Checkout**: Fill address → Select payment → Place order

## 📊 What to Monitor

### Browser DevTools (F12)
- **Console**: No CORS errors, API responses logged
- **Network**: Requests to localhost:5000, Status 200, Auth headers present
- **Application**: localStorage has 'auth-token'

### Backend Terminal
- "Server running on port 5000"
- "MongoDB Connected: localhost"
- API request logs
- No blocking errors

## ⚡ Quick Fixes

| Problem | Solution |
|---------|----------|
| CORS error | Backend configured, restart if needed |
| 401 Unauthorized | Login again |
| Network error | Check backend is running |
| Can't add to cart | Login + select size |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | CORS config |
| `frontend/.env` | API URL config |
| `frontend/src/api/client.js` | API client with auth |

## 🎉 Ready to Use!

Everything is connected and working. Start testing at:
**http://localhost:3000**
