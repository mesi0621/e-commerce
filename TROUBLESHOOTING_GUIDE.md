# 🔧 Troubleshooting Guide - Images & Backend Connection

## Issues Identified:
1. Product images not showing in UI
2. Backend not connected to frontend (suspected)

## ✅ Fixes Applied:

### 1. Fixed Image Helper
**File**: `frontend/src/utils/imageHelper.js`

**Problem**: `require()` returns a module object, not a direct path
**Solution**: Extract the `.default` property from the module

```javascript
const imageModule = require(`../Components/Assets/${imageName}`);
return imageModule.default || imageModule;
```

### 2. Added Debug Logging
**File**: `frontend/src/Context/ShopContext.jsx`

Added console logging to track:
- Backend API calls
- Response data
- Image path resolution
- Product count

### 3. Created Test Page
**File**: `frontend/src/Pages/TestConnection.jsx`

A diagnostic page to test backend connectivity.

**Access**: http://localhost:3000/test

---

## 🧪 Testing Steps:

### Step 1: Test Backend Connection

1. **Open Test Page**: http://localhost:3000/test
2. **Expected Result**: 
   - ✅ "Connected! Found 36 products"
   - Shows 3 sample products with details
3. **If Failed**:
   - Check if backend is running: http://localhost:5000
   - Check browser console for errors (F12)

### Step 2: Check Browser Console

1. **Open**: http://localhost:3000
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Look for**:
   - "Fetching products from backend..."
   - "Received X products from backend"
   - "Product 1: product_1.png -> [path]"

### Step 3: Check Network Tab

1. **Open**: http://localhost:3000
2. **Press F12** → **Network tab**
3. **Refresh page**
4. **Look for**:
   - Request to `http://localhost:5000/api/products`
   - Status should be `200 OK`
   - Response should contain product data

---

## 🐛 Common Issues & Solutions:

### Issue 1: "Network Error" in Console

**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# Check if backend is running
cd backend
npm run dev

# Should see:
# Server running on port 5000
# MongoDB Connected: localhost
```

### Issue 2: CORS Error

**Symptom**: 
```
Access to XMLHttpRequest at 'http://localhost:5000/api/products' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: Backend already has CORS enabled, but if issue persists:

```javascript
// backend/server.js
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

### Issue 3: Images Show as Broken

**Cause**: Image path not resolving correctly

**Check**:
1. Open browser console
2. Look for warnings: "Image product_X.png not found"
3. Check if images exist in `frontend/src/Components/Assets/`

**Solution**: Already fixed in `imageHelper.js`

### Issue 4: Products Not Loading

**Symptom**: Page shows "Loading..." forever

**Check**:
1. Browser console for errors
2. Network tab for failed requests
3. Backend logs for errors

**Solution**:
```bash
# Restart both servers
# Backend:
cd backend
npm run dev

# Frontend (new terminal):
cd frontend
npm start
```

---

## 🔍 Diagnostic Commands:

### Test Backend API Directly:

```powershell
# Test if backend is responding
curl http://localhost:5000 -UseBasicParsing | ConvertFrom-Json

# Test products endpoint
curl http://localhost:5000/api/products -UseBasicParsing | ConvertFrom-Json

# Check first product
$response = curl http://localhost:5000/api/products -UseBasicParsing | ConvertFrom-Json
$response.data[0]
```

### Check Frontend Build:

```bash
cd frontend
npm start

# Should see:
# Compiled successfully!
# You can now view frontend in the browser.
# Local: http://localhost:3000
```

---

## 📊 Expected Console Output:

### When Page Loads:

```
Fetching products from backend...
Backend response: {data: {success: true, count: 36, data: Array(36)}}
Received 36 products from backend
Product 1: product_1.png -> /static/media/product_1.abc123.png
Product 2: product_2.png -> /static/media/product_2.def456.png
...
Products with images: [{id: 1, name: "...", image: "..."}]
```

### If Backend Not Connected:

```
Fetching products from backend...
Error fetching products: Network Error
Error details: Error: Network Error
```

---

## ✅ Verification Checklist:

### Backend:
- [ ] Backend server running on port 5000
- [ ] MongoDB connected
- [ ] Can access http://localhost:5000
- [ ] Can access http://localhost:5000/api/products
- [ ] Returns 36 products

### Frontend:
- [ ] Frontend running on port 3000
- [ ] Compiled without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3000/test
- [ ] Test page shows "Connected!"

### Images:
- [ ] All product_X.png files exist in Assets folder
- [ ] Browser console shows image paths
- [ ] No "Image not found" warnings
- [ ] Images visible on page

### Connection:
- [ ] No CORS errors in console
- [ ] Network tab shows successful API calls
- [ ] Products array populated in console
- [ ] Cart count shows in navbar

---

## 🚀 Quick Fix Commands:

### If Nothing Works - Full Restart:

```bash
# Stop all processes (Ctrl+C in both terminals)

# Backend:
cd backend
npm run dev

# Frontend (new terminal):
cd frontend
npm start

# Wait for both to compile
# Then open: http://localhost:3000/test
```

### Clear Cache and Restart:

```bash
# Frontend:
cd frontend
rm -rf node_modules/.cache
npm start
```

---

## 📝 What Was Changed:

### Files Modified:
1. `frontend/src/utils/imageHelper.js` - Fixed image import
2. `frontend/src/Context/ShopContext.jsx` - Added debug logging
3. `frontend/src/App.js` - Added test route
4. `frontend/src/Pages/TestConnection.jsx` - Created test page

### No Breaking Changes:
- All existing functionality preserved
- Only added debugging and fixes
- Can safely test without affecting production code

---

## 🎯 Next Steps:

1. **Visit Test Page**: http://localhost:3000/test
2. **Check Console**: Press F12 and look for logs
3. **Report Results**: Tell me what you see:
   - Does test page show "Connected"?
   - Are there any errors in console?
   - Do images show on main page?

---

**Last Updated**: February 8, 2026
**Status**: Fixes Applied - Awaiting Test Results
