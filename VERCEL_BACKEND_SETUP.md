# Backend Configuration for Vercel Frontend

## Current Status
- Frontend URL: `https://modooo-e-commerce.vercel.app`
- Backend URL: `https://modo-backend-8da3.onrender.com`
- Backend CORS has been updated to allow the Vercel frontend

## Steps to Complete Setup

### 1. Update Render.com Environment Variables

Go to your Render.com dashboard and update these environment variables:

1. **Set NODE_ENV to production:**
   - Go to https://dashboard.render.com
   - Click on your backend service `modo-backend-8da3`
   - Go to "Environment" tab
   - Find `NODE_ENV` variable
   - Change value from `development` to `production`
   - Click "Save Changes"

2. **Verify FRONTEND_URL (optional):**
   - You can also set `FRONTEND_URL=https://modooo-e-commerce.vercel.app`
   - But it's not required since we hardcoded it in server.js

### 2. Redeploy Backend on Render

After changing environment variables:
- Render will automatically redeploy
- Wait 2-3 minutes for deployment to complete
- Check logs to confirm it's running

### 3. Test the Connection

1. Go to https://modooo-e-commerce.vercel.app
2. Open browser console (F12)
3. Try to view products
4. You should see NO CORS errors
5. Products should load from backend

## CORS Configuration

The backend now allows requests from:
- `https://modo-ecommerce.vercel.app`
- `https://modooo-e-commerce.vercel.app`
- Any URL set in `FRONTEND_URL` environment variable

## Troubleshooting

### If you see CORS errors:
1. Check that NODE_ENV is set to `production` on Render
2. Check that backend has redeployed after the change
3. Clear browser cache and hard refresh (Ctrl + Shift + R)

### If products don't load:
1. Check browser console for errors
2. Verify backend is running: https://modo-backend-8da3.onrender.com
3. Test API directly: https://modo-backend-8da3.onrender.com/api/products

## Next Steps

After completing the above:
1. Test registration and login
2. Test adding products to cart
3. Test checkout flow
4. Verify all features work correctly
