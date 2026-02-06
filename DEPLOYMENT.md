# Deploy MERN Project to Render

Complete step-by-step guide to deploy your Monkey project management app on Render.

---

## 📋 Prerequisites

1. ✅ GitHub account with your code pushed
2. ✅ Render account (sign up at https://render.com)
3. ✅ MongoDB Atlas account (for production database)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Production Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. **Database Access:**
   - Create a database user
   - Username: `monkey_user` (or any name)
   - Password: Generate secure password (**save it!**)
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (allow all - needed for Render)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://monkey_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/monkey?retryWrites=true&w=majority`

---

## 🔧 Step 2: Deploy Backend on Render

### A. Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `ishaansh20/Monkey`
4. Configure:

   **Basic Settings:**
   - Name: `monkey-backend` (or any name)
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

### B. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```
PORT=8000
NODE_ENV=production
MONGO_URI=mongodb+srv://monkey_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/monkey?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=1d
SESSION_SECRET=your_super_secret_session_key_min_32_characters
SESSION_EXPIRES_IN=1d
FRONTEND_ORIGIN=https://monkey-frontend.onrender.com
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
GOOGLE_CALLBACK_URL=https://monkey-backend.onrender.com/api/auth/google/callback (optional)
FRONTEND_GOOGLE_CALLBACK_URL=https://monkey-frontend.onrender.com/auth/google (optional)
```

**⚠️ Important:**

- Replace `YOUR_PASSWORD` with your MongoDB password
- Generate strong random strings for JWT_SECRET and SESSION_SECRET
- Use at least 32 characters for secrets
- `FRONTEND_ORIGIN` will be your frontend URL (update after frontend deployment)

### C. Deploy

1. Click **"Create Web Service"**
2. Wait for build (2-5 minutes)
3. Once deployed, copy your backend URL: `https://monkey-backend.onrender.com`

### D. Test Backend

Visit: `https://monkey-backend.onrender.com/`
Should see JSON response:

```json
{
  "message": "Monkey API Running",
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 🎨 Step 3: Deploy Frontend on Render

### A. Create Static Site

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository: `ishaansh20/Monkey`
4. Configure:

   **Basic Settings:**
   - Name: `monkey-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### B. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

```
VITE_API_BASE_URL=https://monkey-backend.onrender.com/api
```

**⚠️ Replace with your actual backend URL from Step 2!**

### C. Deploy

1. Click **"Create Static Site"**
2. Wait for build (2-5 minutes)
3. Copy your frontend URL: `https://monkey-frontend.onrender.com`

---

## 🔄 Step 4: Update Backend CORS

After frontend deployment, update backend environment variable:

1. Go to your backend service on Render
2. **Environment** tab
3. Update `FRONTEND_ORIGIN`:
   ```
   FRONTEND_ORIGIN=https://monkey-frontend.onrender.com
   ```
4. Click **"Save Changes"** (triggers auto-redeploy)

---

## ✅ Step 5: Test Your Deployment

1. Visit your frontend: `https://monkey-frontend.onrender.com`
2. Try signing up with email
3. Check if workspace is created
4. Test all features

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** 500 Internal Server Error

- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Check MongoDB connection string

**Problem:** CORS errors

- Ensure `FRONTEND_ORIGIN` matches your frontend URL exactly
- Include protocol: `https://...`

### Frontend Issues

**Problem:** API calls failing

- Check `VITE_API_BASE_URL` is correct
- Must include `/api` at the end
- Must use `https://`

**Problem:** Blank page

- Check browser console for errors
- Verify build succeeded in Render logs

**Problem:** White screen + MIME type errors / 404 for assets

- Ensure `vite.config.js` has `base: "/"` (not `/project-management/`)
- Verify `_redirects` file exists in `public/` folder with content: `/*    /index.html   200`
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check Render logs for successful build
- Verify Publish Directory is set to `dist` (not `build`)

**Problem:** React Router not working on direct URLs or refresh

- Ensure `_redirects` file exists in `public/` folder
- Content should be: `/*    /index.html   200`
- This file tells Render to redirect all routes to index.html for client-side routing

### Database Issues

**Problem:** Can't connect to MongoDB

- Verify IP whitelist: `0.0.0.0/0` in MongoDB Atlas
- Check username/password in connection string
- Ensure database user has read/write permissions

---

## 🔒 Security Checklist

- ✅ Strong JWT_SECRET (32+ random characters)
- ✅ Strong SESSION_SECRET (32+ random characters)
- ✅ MongoDB password is complex
- ✅ .env files are in .gitignore
- ✅ Only .env.example files are committed
- ✅ Update FRONTEND_ORIGIN after deployment

## ⚙️ Build Configuration Checklist

- ✅ `vite.config.js` has `base: "/"` for Render
- ✅ `_redirects` file in `public/` folder for SPA routing
- ✅ `package.json` has correct build script: `vite build`
- ✅ Publish directory is `dist` (Vite default output)

---

## 🚀 Auto-Deploy Setup

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Both frontend and backend will rebuild automatically!

---

## 💰 Render Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month (enough for 1 service running 24/7)
- Upgrade to paid plan for always-on services

---

## 📊 Monitoring

**View Logs:**

- Render Dashboard → Your Service → Logs
- See real-time application logs
- Debug errors and monitor activity

**Metrics:**

- Dashboard → Metrics tab
- Monitor CPU, memory, response times

---

## 🎯 Next Steps

1. ✅ Test all features in production
2. ✅ Setup custom domain (optional)
3. ✅ Configure Google OAuth (optional)
4. ✅ Monitor application logs
5. ✅ Setup error tracking (Sentry, etc.)

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- GitHub Repo Issues: https://github.com/ishaansh20/Monkey/issues

---

**🎉 Congratulations! Your app is now live!**
