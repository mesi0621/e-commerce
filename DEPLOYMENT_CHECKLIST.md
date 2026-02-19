# Modo E-commerce Deployment Checklist

## ✅ Completed Steps

- [x] MongoDB Atlas configured and tested
- [x] Git repository initialized
- [x] Code committed to Git
- [x] GitHub repository created: https://github.com/mesi0621/e-commerce
- [x] Code pushed to GitHub (303 files)

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Vercel

- [ ] 1.1 Go to https://vercel.com/signup
- [ ] 1.2 Sign up with GitHub
- [ ] 1.3 Click "Add New" → "Project"
- [ ] 1.4 Import repository: `mesi0621/e-commerce`
- [ ] 1.5 Configure:
  - Project Name: `modo-backend`
  - Framework: Other
  - Root Directory: `backend`
- [ ] 1.6 Add Environment Variables:
  ```
  NODE_ENV=production
  MONGODB_URI=mongodb+srv://mesi0621:Messi%407962@cluster0.bn8jkeq.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
  JWT_SECRET=modo_super_secure_jwt_secret_key_2024_change_in_production
  PORT=5000
  EMAIL_SERVICE=gmail
  EMAIL_USER=bitaaaa2004@gmail.com
  EMAIL_PASSWORD=shahbalmcvadxycr
  EMAIL_FROM=Modo <bitaaaa2004@gmail.com>
  FRONTEND_URL=https://your-frontend-url.vercel.app
  BANK_ACCOUNT_NAME=Modo E-commerce
  BANK_ACCOUNT_NUMBER=1234567890
  BANK_NAME=Commercial Bank of Ethiopia
  BANK_BRANCH=Main Branch
  ```
- [ ] 1.7 Click "Deploy"
- [ ] 1.8 Wait for deployment (2-3 minutes)
- [ ] 1.9 Copy backend URL: `_______________________________`
- [ ] 1.10 Test backend: Visit URL and verify API response

---

### Step 2: Deploy Frontend to Vercel

- [ ] 2.1 In Vercel, click "Add New" → "Project"
- [ ] 2.2 Import same repository: `mesi0621/e-commerce`
- [ ] 2.3 Configure:
  - Project Name: `modo-frontend`
  - Framework: Create React App
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `build`
- [ ] 2.4 Add Environment Variable:
  ```
  REACT_APP_API_URL=https://[YOUR-BACKEND-URL]/api
  ```
  (Replace with your actual backend URL from Step 1.9)
- [ ] 2.5 Click "Deploy"
- [ ] 2.6 Wait for deployment (2-3 minutes)
- [ ] 2.7 Copy frontend URL: `_______________________________`
- [ ] 2.8 Test frontend: Visit URL and verify site loads

---

### Step 3: Update Backend with Frontend URL

- [ ] 3.1 Go to backend project in Vercel
- [ ] 3.2 Settings → Environment Variables
- [ ] 3.3 Edit `FRONTEND_URL` variable
- [ ] 3.4 Update to your frontend URL from Step 2.7
- [ ] 3.5 Save changes
- [ ] 3.6 Redeploy backend (Deployments → "..." → Redeploy)

---

### Step 4: Final Testing

- [ ] 4.1 Visit frontend URL
- [ ] 4.2 Browse products
- [ ] 4.3 Test signup/login
- [ ] 4.4 Add items to cart
- [ ] 4.5 Test checkout flow
- [ ] 4.6 Test admin dashboard (login as admin)
- [ ] 4.7 Test seller dashboard (login as seller)
- [ ] 4.8 Verify email notifications work
- [ ] 4.9 Test payment methods

---

## 📝 Important URLs

### Your Deployment URLs
- **GitHub Repository**: https://github.com/mesi0621/e-commerce
- **Backend URL**: `_______________________________`
- **Frontend URL**: `_______________________________`

### Admin Credentials
- **Email**: bitaaaa2004@gmail.com
- **Password**: admin123

### Seller Credentials
- **Email**: meseretmezgebe338@gmail.com
- **Password**: seller123

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to database"
- Check MongoDB Atlas Network Access (should allow 0.0.0.0/0)
- Verify MONGODB_URI in Vercel environment variables
- Check Vercel function logs

**Problem**: "CORS error"
- Verify FRONTEND_URL is set correctly in backend
- Check that frontend URL matches exactly (no trailing slash)
- Redeploy backend after updating FRONTEND_URL

**Problem**: "Function timeout"
- Vercel free tier has 10-second timeout
- Check for slow database queries
- Consider upgrading to Pro plan

### Frontend Issues

**Problem**: "Cannot connect to API"
- Verify REACT_APP_API_URL is set correctly
- Check backend is deployed and running
- Test backend URL directly in browser

**Problem**: "Build failed"
- Check build logs in Vercel
- Verify all dependencies are in package.json
- Test build locally: `cd frontend && npm run build`

**Problem**: "Environment variable not working"
- Ensure variable starts with `REACT_APP_`
- Redeploy after adding environment variables
- Clear browser cache

---

## 📊 Monitoring

### View Logs
1. Go to project in Vercel
2. Click "Deployments"
3. Click on a deployment
4. View "Functions" tab for logs

### Check Performance
1. Go to project in Vercel
2. Click "Analytics" tab
3. Monitor response times and errors

---

## 🎯 Post-Deployment Tasks

- [ ] Add custom domain (optional)
- [ ] Set up real payment gateway API keys
- [ ] Configure email notifications for production
- [ ] Set up monitoring/alerts
- [ ] Add Google Analytics (optional)
- [ ] Test on mobile devices
- [ ] Share with friends/customers!

---

## 💡 Tips

1. **Always test locally first** before deploying
2. **Use environment variables** for all secrets
3. **Never commit .env files** to Git
4. **Monitor Vercel logs** for errors
5. **Keep MongoDB Atlas IP whitelist** as 0.0.0.0/0 for Vercel
6. **Redeploy after changing** environment variables

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- GitHub Issues: https://github.com/mesi0621/e-commerce/issues

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Backend API responds at `/` endpoint
- ✅ Frontend loads without errors
- ✅ Can browse products
- ✅ Can signup/login
- ✅ Can add to cart and checkout
- ✅ Admin dashboard accessible
- ✅ Seller dashboard accessible
- ✅ Database operations work
- ✅ No CORS errors in browser console

---

**Good luck with your deployment! 🚀**
