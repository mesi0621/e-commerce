# Debugging Products Not Showing

## Backend Status ✅
- Backend is running on port 5000
- API endpoint `/api/products` returns 20 products
- All products have `isApproved: true`
- Sample product:
  ```json
  {
    "id": 36,
    "name": "Boys Orange Colourblocked Hooded Sweatshirt",
    "image": "product_36.png",
    "new_price": 85,
    "isApproved": true
  }
  ```

## Frontend Status
- Frontend is running on port 3000
- ShopContext is configured to fetch from `http://localhost:5000/api`

## Steps to Debug in Browser

### 1. Open Browser Console
Press `F12` or `Ctrl+Shift+I` to open Developer Tools

### 2. Check Console Logs
Look for these messages:
```
Fetching products from backend...
Backend response: {data: {...}}
Received X products from backend
Product 1: product_1.png -> [object]
```

### 3. Check Network Tab
- Go to Network tab
- Refresh the page
- Look for request to `http://localhost:5000/api/products`
- Check if:
  - Status is 200 OK
  - Response contains products array
  - CORS headers are present

### 4. Check for Errors
Look for any red error messages in console:
- CORS errors
- Network errors
- Image loading errors
- JavaScript errors

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom:** Console shows "CORS policy" error

**Solution:** Backend CORS is already configured for localhost:3000, but verify:
```javascript
// backend/server.js
cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
})
```

### Issue 2: API Not Responding
**Symptom:** Network request fails or times out

**Check:**
1. Is backend running? Check terminal for "Server running on port 5000"
2. Test API directly: Open `http://localhost:5000/api/products` in browser
3. Check if MongoDB is connected

### Issue 3: Products Array Empty
**Symptom:** API returns `{success: true, count: 0, data: []}`

**Solution:** Products need to be approved
```bash
cd backend
node scripts/seedProducts.js
```

### Issue 4: Images Not Loading
**Symptom:** Products show but images are broken

**Check:**
1. Image files exist in `frontend/src/Components/Assets/`
2. Image names match (e.g., `product_1.png`)
3. Console shows image import errors

## Quick Test Commands

### Test Backend API
```bash
# Windows PowerShell
curl -UseBasicParsing http://localhost:5000/api/products

# Should return JSON with products
```

### Check Backend Logs
Look at the terminal where backend is running for any errors

### Check Frontend Logs
Look at browser console (F12) for:
- "Fetching products from backend..."
- "Received X products from backend"
- Any error messages

## Manual Test in Browser Console

Open browser console and run:
```javascript
// Test API directly
fetch('http://localhost:5000/api/products')
  .then(r => r.json())
  .then(data => console.log('Products:', data))
  .catch(err => console.error('Error:', err));
```

Expected output:
```javascript
{
  success: true,
  count: 20,
  data: [...], // Array of products
  pagination: {...}
}
```

## If Products Still Don't Show

### Check React State
In browser console:
```javascript
// Check if ShopContext has products
// This will show in React DevTools
```

### Force Refresh
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+F5`
3. Or try incognito mode

### Restart Everything
```bash
# Stop both servers (Ctrl+C in terminals)

# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm start
```

## What Should Happen

When everything works:
1. Frontend loads at http://localhost:3000
2. ShopContext fetches products from backend
3. Console shows: "Received 20 products from backend"
4. Products display on:
   - Homepage (Popular Products section)
   - Homepage (New Collections section)
   - Shop Categories (Men, Women, Kids)
   - Search results

## Current Configuration

✅ Backend: Running on port 5000
✅ Frontend: Running on port 3000  
✅ Database: 36 products seeded and approved
✅ API: Returning products correctly
✅ CORS: Configured for localhost:3000
✅ Images: All 36 product images exist in Assets folder

## Next Step

**Open your browser at http://localhost:3000 and check the console (F12)**

Look for:
1. Any error messages (red text)
2. Network requests to `/api/products`
3. Console logs from ShopContext

Then share what you see in the console!
