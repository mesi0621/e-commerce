# Vercel Deployment Guide - Modo E-Commerce

## Overview
This guide will help you deploy your full-stack e-commerce application to Vercel.

**Architecture:**
- Frontend (React) → Vercel
- Backend (Express API) → Vercel Serverless Functions
- Database → MongoDB Atlas (Already configured ✅)

---

## Prerequisites

✅ MongoDB Atlas configured (Done!)
✅ GitHub account
✅ Vercel account (free)

---

## Step 1: Prepare Your Code for Deployment

### A. Create .gitignore (if not exists)

Create `.gitignore` in root directory:
```
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables
.env
backend/.env
frontend/.env

# Build files
frontend/build/
backend/dist/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### B. Update Frontend Environment

Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend.vercel.app/api
```

---

## Step 2: Push to GitHub

### Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Modo E-commerce"
```

### Create GitHub Repository
1. Go to https://github.com/new
2. Name: `modo-ecommerce`
3. Don't initialize with README (you already have code)
4. Click "Create repository"

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/modo-ecommerce.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Vercel

### A. Sign up for Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)

### B. Import Backend Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. **Framework Preset:** Other
4. **Root Directory:** `backend`
5. Click "Deploy"

### C. Add Environment Variables
After deployment, go to:
1. Project Settings → Environment Variables
2. Add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://mesi0621:Messi%407962@cluster0.bn8jkeq.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production_12345
PORT=5000

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=bitaaaa2004@gmail.com
EMAIL_PASSWORD=shahbalmcvadxycr
EMAIL_FROM=Modo <bitaaaa2004@gmail.com>

# Payment Gateways (add your real keys)
CHAPA_SECRET_KEY=your_chapa_secret_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Bank Transfer
BANK_ACCOUNT_NAME=Your Business Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_NAME=Commercial Bank of Ethiopia
BANK_BRANCH=Main Branch

# Frontend URL (will update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app
```

3. Click "Save"
4. Redeploy the project

### D. Get Backend URL
After deployment, copy your backend URL:
```
https://modo-ecommerce-backend.vercel.app
```

---

## Step 4: Deploy Frontend to Vercel

### A. Update Frontend Environment
1. Go to `frontend/.env.production`
2. Update with your backend URL:
```
REACT_APP_API_URL=https://modo-ecommerce-backend.vercel.app/api
```

3. Commit and push:
```bash
git add frontend/.env.production
git commit -m "Update API URL for production"
git push
```

### B. Import Frontend Project
1. In Vercel, click "Add New" → "Project"
2. Import the same GitHub repository
3. **Framework Preset:** Create React App
4. **Root Directory:** `frontend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `build`

### C. Add Frontend Environment Variables
1. Project Settings → Environment Variables
2. Add:
```
REACT_APP_API_URL=https://modo-ecommerce-backend.vercel.app/api
```

3. Click "Deploy"

### D. Get Frontend URL
After deployment, copy your frontend URL:
```
https://modo-ecommerce.vercel.app
```

---

## Step 5: Update CORS and Environment Variables

### A. Update Backend FRONTEND_URL
1. Go to backend project in Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL`:
```
FRONTEND_URL=https://modo-ecommerce.vercel.app
```
4. Redeploy

### B. Verify CORS is working
The backend `server.js` is already configured to accept your frontend URL in production.

---

## Step 6: Test Your Deployment

### Test Backend
Visit: `https://your-backend.vercel.app`

You should see:
```json
{
  "message": "E-Commerce API Server",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Test Frontend
Visit: `https://your-frontend.vercel.app`

Your e-commerce site should load!

### Test Full Flow
1. Browse products
2. Add to cart
3. Login/Signup
4. Place order
5. Check admin dashboard

---

## Step 7: Custom Domain (Optional)

### Add Custom Domain
1. Go to frontend project in Vercel
2. Settings → Domains
3. Add your domain (e.g., `modo-shop.com`)
4. Follow DNS configuration instructions

### Update Environment Variables
After adding custom domain, update:
- Backend `FRONTEND_URL` to your custom domain
- Frontend `REACT_APP_API_URL` if you add custom domain for backend

---

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
- Check `REACT_APP_API_URL` in frontend environment variables
- Verify backend is deployed and running
- Check browser console for CORS errors

### Issue: "Database connection failed"
**Solution:**
- Verify `MONGODB_URI` in backend environment variables
- Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
- Test connection with `node scripts/testMongoConnection.js` locally

### Issue: "Authentication failed"
**Solution:**
- Check `JWT_SECRET` is set in backend environment variables
- Verify it's the same secret used for token generation

### Issue: "Payment methods not working"
**Solution:**
- Add real API keys for payment gateways in backend environment variables
- Test with sandbox/test mode first

### Issue: "Emails not sending"
**Solution:**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Check Gmail "Less secure app access" or use App Password

### Issue: "Serverless Function Timeout"
**Solution:**
- Vercel free tier has 10-second timeout
- Optimize slow database queries
- Consider upgrading to Pro plan for 60-second timeout

---

## Deployment Checklist

### Before Deployment
- [ ] MongoDB Atlas configured and tested
- [ ] All environment variables documented
- [ ] Code pushed to GitHub
- [ ] .gitignore includes .env files
- [ ] Frontend build works locally (`npm run build`)
- [ ] Backend works locally (`npm run dev`)

### Backend Deployment
- [ ] Backend deployed to Vercel
- [ ] All environment variables added
- [ ] Backend URL accessible
- [ ] API endpoints responding
- [ ] Database connection working

### Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] REACT_APP_API_URL configured
- [ ] Frontend loads correctly
- [ ] Can connect to backend API
- [ ] All features working

### Post-Deployment
- [ ] Update FRONTEND_URL in backend
- [ ] Test complete user flow
- [ ] Test all payment methods
- [ ] Test email notifications
- [ ] Test admin dashboard
- [ ] Test seller dashboard
- [ ] Monitor for errors

---

## Monitoring & Maintenance

### View Logs
1. Go to your project in Vercel
2. Click "Deployments"
3. Click on a deployment
4. View "Functions" tab for serverless logs

### Redeploy
- Push to GitHub → Auto-deploys
- Or click "Redeploy" in Vercel dashboard

### Rollback
1. Go to "Deployments"
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Cost Breakdown

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments

### Limits:
- ⚠️ 10-second function timeout (free)
- ⚠️ 100 GB bandwidth/month
- ⚠️ 6,000 build minutes/month

### Upgrade to Pro ($20/month):
- 60-second function timeout
- 1 TB bandwidth
- Priority support

---

## Alternative: Deploy Backend to Render.com

If you face issues with Vercel serverless functions, consider Render.com for backend:

### Render.com Advantages:
- ✅ Traditional server (not serverless)
- ✅ No timeout limits
- ✅ Free tier available
- ✅ Better for long-running processes

### Quick Render Setup:
1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect repository
5. Root Directory: `backend`
6. Build Command: `npm install`
7. Start Command: `node server.js`
8. Add environment variables
9. Deploy!

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- MongoDB Atlas Support: https://www.mongodb.com/support
- GitHub Issues: Create issues in your repository

---

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Test complete application
4. 🎯 Add custom domain
5. 🎯 Set up monitoring
6. 🎯 Configure real payment gateways
7. 🎯 Add analytics (Google Analytics, etc.)

---

## Quick Commands Reference

```bash
# Local Development
cd backend && npm run dev
cd frontend && npm start

# Build Frontend
cd frontend && npm run build

# Test Backend Connection
cd backend && node scripts/testMongoConnection.js

# Git Commands
git add .
git commit -m "Your message"
git push

# View Vercel Logs
vercel logs [deployment-url]
```

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment variables for all secrets
- [ ] Never commit .env files
- [ ] Enable MongoDB Atlas IP whitelist in production
- [ ] Use HTTPS only (Vercel provides this)
- [ ] Implement rate limiting (already done ✅)
- [ ] Validate all user inputs
- [ ] Sanitize database queries

---

## Success! 🎉

Your Modo E-commerce application is now live on Vercel!

**Frontend:** https://your-frontend.vercel.app
**Backend:** https://your-backend.vercel.app

Share your live site and start selling! 🚀
