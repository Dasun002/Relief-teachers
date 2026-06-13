# 🚀 Netlify Frontend Deployment Guide

**Platform**: Netlify (Alternative to Vercel)  
**Cost**: $0/month (Free Forever)  
**Time**: 10 minutes

---

## ✅ Current Status

You're already on the Netlify build settings page! Follow these exact settings:

---

## 🔧 Netlify Build Settings

### Basic Settings

**Branch to deploy**: `main` ✅ (Already selected)

**Base directory**: `frontend`
```
frontend
```
⚠️ **IMPORTANT**: Must be exactly `frontend` (no leading slash)

**Build command**:
```
npm run build
```

**Publish directory**:
```
frontend/dist
```
OR if base directory is set to `frontend`, then just:
```
dist
```

**Functions directory**: Leave as is or `netlify/functions`

---

## 🔑 Environment Variables

Click **"Add environment variables"** button and add:

### Variable 1: VITE_API_URL

**Key**: `VITE_API_URL`

**Value**: (You'll add this after backend is deployed)
```
https://your-backend-url.onrender.com/api
```

**For now**: Click **"Deploy Relief-teachers to Netlify"** button without environment variables. You can add them later!

---

## 📝 Step-by-Step Instructions

### Current Step: Configure Build Settings

1. **Branch to deploy**: ✅ Already set to `main`

2. **Base directory**: 
   - Clear the field if it has anything
   - Type: `frontend`
   - Press Tab or click outside

3. **Build command**:
   - Should auto-detect as: `npm run build`
   - If not, manually enter: `npm run build`

4. **Publish directory**:
   - Change to: `frontend/dist`
   - OR if base directory is `frontend`, then just: `dist`

5. **Click**: **"Deploy Relief-teachers to Netlify"** button (the teal button at bottom)

---

## ⏱️ Deployment Process

After clicking Deploy:

1. **Build starts** (2-3 minutes)
   - You'll see build logs scrolling
   - Watch for any errors

2. **Build completes**
   - Status: "Published"
   - You'll get your site URL

3. **Get your URL**
   - Format: `https://relief-teachers.netlify.app`
   - Or custom: `https://[random-name].netlify.app`

---

## 🎯 After Deployment

### Step 1: Get Your Netlify URL

1. After build completes, you'll see:
   ```
   Site is live at: https://[your-site].netlify.app
   ```

2. **Copy this URL** - you'll need it for backend CORS!

### Step 2: Add Environment Variable

1. Go to **Site settings**
2. Click **"Environment variables"** (left sidebar)
3. Click **"Add a variable"** → **"Add a single variable"**
4. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`
   - **Scopes**: All (Production, Deploy Previews, Branch deploys)

5. Click **"Create variable"**

### Step 3: Trigger Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes for rebuild

### Step 4: Test Your Site

1. Visit your Netlify URL
2. You should see the login page
3. Check browser console (F12) for errors

---

## 🔗 Next Steps: Backend Deployment

Now that frontend is deployed, you need to deploy the backend!

### Option 1: Render (Recommended - Easiest)

**Follow these steps**:

1. Go to: **https://render.com**
2. Sign up with GitHub
3. Create new **Web Service**
4. Connect your repository
5. Configure:
   ```
   Name: teacher-attendance-api
   Runtime: Node
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=[Your MongoDB connection string]
   JWT_SECRET=teacher-attendance-secret-2026-secure-key
   FRONTEND_URL=https://[your-netlify-url].netlify.app
   ```

7. Deploy and get backend URL

8. Update Netlify environment variable `VITE_API_URL` with backend URL

**Detailed guide**: See [DEPLOY_NOW.md](./DEPLOY_NOW.md) Step 2

---

### Option 2: Netlify Functions (Serverless)

⚠️ **Not Recommended**: Would require significant code changes to convert Express app to serverless functions.

---

## 📊 Configuration Summary

```
┌─────────────────────────────────────────────┐
│  NETLIFY CONFIGURATION                      │
├─────────────────────────────────────────────┤
│  Repository:    Relief-teachers             │
│  Branch:        main                        │
│  Base Dir:      frontend                    │
│  Build Cmd:     npm run build               │
│  Publish Dir:   frontend/dist  or  dist     │
│                                             │
│  Environment Variables:                     │
│  VITE_API_URL=[Backend URL]/api            │
└─────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Build completed successfully
- [ ] No build errors in logs
- [ ] Site is live (green status)
- [ ] Can access Netlify URL
- [ ] Login page loads correctly
- [ ] Professional blue gradient shows
- [ ] No console errors (except API connection - expected if backend not deployed yet)

---

## 🐛 Troubleshooting

### Build Failed

**Error**: "Command failed with exit code 1"
**Solution**: 
- Check build logs for specific error
- Verify `frontend/package.json` exists
- Verify Node version (should use 18+)

**Error**: "Publish directory not found"
**Solution**:
- Change publish directory to `frontend/dist`
- Or set base directory to `frontend` and publish to `dist`

### Site Loads but Blank Page

**Solution**:
- Check browser console (F12)
- Likely missing `VITE_API_URL` environment variable
- Add it in Site settings → Environment variables

### Cannot Connect to Backend

**Solution**:
- Deploy backend first (Render)
- Update `VITE_API_URL` in Netlify
- Redeploy site

---

## 🆚 Netlify vs Vercel

Both are excellent and free. You chose Netlify - great choice!

| Feature | Netlify | Vercel |
|---------|---------|--------|
| **Free Tier** | 100GB bandwidth | 100GB bandwidth |
| **Build Time** | 300 min/month | 6000 min/month |
| **Sites** | Unlimited | Unlimited |
| **Custom Domains** | Yes | Yes |
| **SSL** | Automatic | Automatic |

**Your choice**: ✅ Netlify works perfectly for this project!

---

## 💡 Pro Tips

### 1. Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `attendance.yourschool.lk`)
4. Follow DNS setup instructions

### 2. Preview Deployments

Every pull request gets a preview URL automatically!
- Great for testing before merging
- Each branch gets its own URL

### 3. Instant Rollbacks

If something breaks:
1. Go to **Deploys** tab
2. Find a previous working deploy
3. Click **"Publish deploy"**
4. Instant rollback!

---

## 📱 After Frontend Deployment

### Immediate Next Steps:

1. ✅ **Frontend deployed on Netlify**
2. ⏭️ **Deploy database on MongoDB Atlas** (5 min)
3. ⏭️ **Deploy backend on Render** (10 min)
4. ⏭️ **Connect everything** (5 min)
5. ⏭️ **Create admin user** (5 min)

**Total time remaining**: ~25 minutes

---

## 🎯 Your Deployment URLs

Save these as you deploy:

```
Frontend (Netlify):
https://__________________.netlify.app

Backend (Render - Deploy Next):
https://__________________.onrender.com

Database (MongoDB Atlas):
mongodb+srv://admin:____@cluster.mongodb.net
```

---

## 🚀 Deploy Order

```
✅ Step 1: Frontend (Netlify) - YOU ARE HERE
⏭️ Step 2: Database (MongoDB Atlas) - NEXT
⏭️ Step 3: Backend (Render) - AFTER DATABASE
⏭️ Step 4: Connect Everything
⏭️ Step 5: Create Admin User
```

---

## 📞 Need Help?

**Netlify Docs**: https://docs.netlify.com/

**Support**: See full guide in [DEPLOY_NOW.md](./DEPLOY_NOW.md)

**Quick Reference**: See [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)

---

## ✨ You're Doing Great!

Frontend deployment is the easiest part. You're making excellent progress!

**Next**: Deploy backend and database to make everything work together.

---

**Current Status**: 🟡 Frontend deployed, waiting for backend

**Final Status**: 🟢 Fully deployed and operational

Keep going! 🚀
