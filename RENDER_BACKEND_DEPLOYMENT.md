# 🚀 Render Backend Deployment - Step by Step

**Platform**: Render.com  
**Cost**: $0/month (Free Forever)  
**Time**: 10 minutes

---

## 📋 Current Status: You're on the "New Web Service" Page

Follow these **exact** settings based on your screenshots:

---

## 🔧 STEP 1: Basic Configuration

### Name
```
teacher-attendance-api
```
(or any name you prefer - this will be part of your URL)

### Project (Optional)
- You can select a project or leave empty
- Or "Select an environment" - can skip this

### Language
```
Node
```
✅ Should be selected

### Branch
```
main
```
✅ Should be selected

### Region
```
Oregon (US West)
```
Or choose closest to Sri Lanka:
- **Singapore** (if available - best for Sri Lanka)
- **Oregon (US West)** (current selection - OK)

### Root Directory
```
backend
```
⚠️ **CRITICAL**: Must be exactly `backend` (no leading slash, no trailing slash)

If you see "e.g., src" placeholder, clear it and type: `backend`

### Build Command
```
npm install
```
Or if it shows "$ yarn":
```
$ npm install
```

### Start Command
```
npm start
```
Or:
```
$ npm start
```

---

## 💳 STEP 2: Instance Type

**SELECT**: **Free** (512 MB RAM, 0.1 CPU)

✅ This is perfect for your school project!

**DO NOT SELECT**:
- ❌ Starter ($7/month)
- ❌ Standard ($25/month)
- ❌ Pro, Pro Plus, Pro Max (expensive)

The **Free** tier gives you:
- 512 MB RAM
- 0.1 CPU
- 750 hours/month (covers 24/7 for 31 days)
- Sleeps after 15 min inactivity (first request takes 30-60s)

---

## 🔑 STEP 3: Environment Variables

This is **CRITICAL**! Click **"Add Environment Variable"** or **"+ Add from .env"**

Add these **5 variables** one by one:

### Variable 1: NODE_ENV
```
Key:   NODE_ENV
Value: production
```

### Variable 2: PORT
```
Key:   PORT
Value: 10000
```
⚠️ Must be `10000` (Render uses this port)

### Variable 3: MONGODB_URI
```
Key:   MONGODB_URI
Value: [Your MongoDB Atlas connection string]
```

**If you don't have MongoDB yet**, use placeholder:
```
Value: mongodb://placeholder
```
You'll update this after setting up MongoDB Atlas.

**Format should be**:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/teacher-attendance?retryWrites=true&w=majority
```

### Variable 4: JWT_SECRET
```
Key:   JWT_SECRET
Value: teacher-attendance-secret-2026-anuruddha-balika-secure-jwt-key-dasun
```
(This is a secure random string for JWT tokens)

### Variable 5: FRONTEND_URL
```
Key:   FRONTEND_URL
Value: [Your Netlify URL]
```

**Example**:
```
Value: https://relief-teachers.netlify.app
```
⚠️ **NO trailing slash!** ❌ `https://site.netlify.app/`

If you deployed to Netlify and got a URL like `https://something.netlify.app`, paste it here.

If you don't have it yet, use placeholder:
```
Value: http://localhost:5173
```
You'll update this later.

---

## 📊 Summary of Environment Variables

Copy and paste these (update the bracketed values):

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=[Your MongoDB connection string or placeholder]
JWT_SECRET=teacher-attendance-secret-2026-anuruddha-balika-secure-jwt-key-dasun
FRONTEND_URL=[Your Netlify URL or http://localhost:5173]
```

---

## 🚀 STEP 4: Deploy!

After filling all fields:

1. Scroll down to find **"Advanced"** section (you can skip this)
2. Scroll to the bottom
3. Click the **"Deploy Web Service"** button (or "Create Web Service")

---

## ⏱️ STEP 5: Wait for Build

After clicking Deploy:

### Build Process (5-10 minutes)
1. You'll see **"Build starting..."**
2. Logs will scroll showing:
   ```
   ==> Cloning from GitHub...
   ==> Installing dependencies...
   ==> npm install
   ==> Build successful
   ==> Starting service...
   ==> Server running on port 10000
   ==> Your service is live 🎉
   ```

3. Watch for:
   - ✅ "Build successful"
   - ✅ "Server running on port 10000"
   - ✅ "Connected to MongoDB" (if you added MongoDB URI)

### If Build Fails
- Check the error message in logs
- Common issues:
  - Root directory not set to `backend`
  - Missing `package.json` in backend folder
  - Wrong start command

---

## 🎯 STEP 6: Get Your Backend URL

After deployment succeeds:

1. At the top of the page, you'll see your URL:
   ```
   https://teacher-attendance-api.onrender.com
   ```
   (Your actual name will be different)

2. **Copy this URL!** You need it for:
   - Netlify frontend (VITE_API_URL)
   - Testing the API

---

## ✅ STEP 7: Test Your Backend

### Test Health Endpoint

Open in browser or use this format:
```
https://YOUR-SERVICE-NAME.onrender.com/api/health
```

**Example**:
```
https://teacher-attendance-api.onrender.com/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

⚠️ **First request takes 30-60 seconds** (waking from sleep)  
⏰ Subsequent requests are fast (< 2 seconds)

---

## 🔗 STEP 8: Connect to Netlify Frontend

Now update your Netlify frontend to use this backend:

### 8.1 Go to Netlify Dashboard
1. Open: https://app.netlify.com
2. Click on your **"Relief-teachers"** site
3. Go to **"Site settings"**
4. Click **"Environment variables"** (left sidebar)

### 8.2 Add/Update Environment Variable
1. Click **"Add a variable"** → **"Add a single variable"**
2. Add:
   ```
   Key:   VITE_API_URL
   Value: https://YOUR-RENDER-URL.onrender.com/api
   ```
   
   **Example**:
   ```
   Value: https://teacher-attendance-api.onrender.com/api
   ```
   
   ⚠️ **Must end with `/api`**

3. **Scopes**: Select all (Production, Deploy Previews, Branch deploys)
4. Click **"Create variable"**

### 8.3 Redeploy Netlify
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes

---

## 🔄 STEP 9: Update Backend CORS

Go back to Render:

### 9.1 Update FRONTEND_URL
1. In Render dashboard, click your service
2. Go to **"Environment"** tab (left sidebar)
3. Find **"FRONTEND_URL"** variable
4. Click **Edit** (pencil icon)
5. Update with your Netlify URL:
   ```
   https://your-site.netlify.app
   ```
   **NO trailing slash!**
6. Click **"Save Changes"**

### 9.2 Wait for Auto-Redeploy
- Service will automatically redeploy (2-3 minutes)
- Watch the **"Events"** tab for progress

---

## ✅ STEP 10: Final Test

### Test Full Connection

1. Open your Netlify URL in browser
2. You should see the login page
3. Press **F12** to open Developer Tools
4. Click **"Console"** tab
5. Try to login with dummy credentials:
   - Username: `test`
   - Password: `test123`

**Expected Result**:
- Error message: "Invalid credentials" or "User not found"
- ✅ This is GOOD! It means frontend is talking to backend!

**Bad Result**:
- CORS error in console
- "Cannot connect to server"
- Solution: Check FRONTEND_URL has no trailing slash, wait 2 more minutes

---

## 📊 Configuration Summary

```
┌────────────────────────────────────────────────────┐
│  RENDER BACKEND CONFIGURATION                      │
├────────────────────────────────────────────────────┤
│  Repository:      Relief-teachers                  │
│  Branch:          main                             │
│  Root Directory:  backend                          │
│  Build Command:   npm install                      │
│  Start Command:   npm start                        │
│  Instance Type:   Free (512 MB RAM)                │
│                                                     │
│  Environment Variables (5):                        │
│    NODE_ENV=production                             │
│    PORT=10000                                      │
│    MONGODB_URI=[Your MongoDB connection]           │
│    JWT_SECRET=[Secure random string]               │
│    FRONTEND_URL=[Your Netlify URL]                 │
└────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Build Failed: "Cannot find module"
**Solution**: Check Root Directory is set to `backend`

### Build Failed: "npm start failed"
**Solution**: Verify `backend/package.json` has:
```json
"scripts": {
  "start": "node server.js"
}
```

### "Failed to connect to MongoDB"
**Solution**: 
- Check MONGODB_URI is correct
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Ensure password in connection string has no special characters that need encoding

### Service Keeps Crashing
**Solution**:
- Check **"Logs"** tab in Render
- Look for specific error messages
- Common: Missing environment variables

### CORS Errors After Deploy
**Solution**:
- FRONTEND_URL must match your Netlify URL exactly
- No trailing slash: ❌ `https://site.com/` ✅ `https://site.com`
- Wait for auto-redeploy after changing variable

### "This service is not responding"
**Solution**:
- Wait 60 seconds (waking from sleep)
- Check if PORT=10000 is set
- Verify Start Command is `npm start`

---

## ⏰ Free Tier Sleep Behavior

### What Happens:
- After **15 minutes** of no requests, service goes to sleep
- First request after sleep: **30-60 seconds** to wake up
- Subsequent requests: Fast (**< 2 seconds**)

### How to Handle:
1. **Accept it**: Inform users first load may be slow
2. **Keep-alive service**: Use external service to ping every 14 minutes (UptimeRobot)
3. **Upgrade**: $7/month for Starter tier (no sleep)

For a school system, option 1 (accept it) is usually fine!

---

## 📈 Monitoring Your Service

### Check Status
1. Render Dashboard → Your Service
2. **"Metrics"** tab: CPU, Memory, Response time
3. **"Logs"** tab: Real-time logs
4. **"Events"** tab: Deployment history

### View Logs
```
Dashboard → Service → Logs
```

You'll see:
- Server startup messages
- Incoming requests
- MongoDB connection status
- Errors (if any)

---

## 💡 Pro Tips

### 1. Manual Deploy
If you need to redeploy:
1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Or select specific branch/commit

### 2. Auto-Deploy Settings
**"Settings"** → **"Build & Deploy"**
- Auto-deploy: ON (deploys on every git push)
- You can disable this if you want manual control

### 3. Custom Domain (Optional)
**"Settings"** → **"Custom Domains"**
- Add: `api.yourschool.lk`
- Follow DNS setup instructions

---

## 🎯 Next Steps After Backend Deployment

### You Still Need:

1. ✅ **Frontend deployed** (Netlify) - DONE
2. ✅ **Backend deployed** (Render) - YOU ARE HERE
3. ⏭️ **Database setup** (MongoDB Atlas) - NEXT (if not done)
4. ⏭️ **Connect everything** - Update environment variables
5. ⏭️ **Create admin user** - Insert into MongoDB

---

## 📝 Save These URLs

Fill in after deployment:

```
Frontend (Netlify):
https://________________________________.netlify.app

Backend (Render):
https://________________________________.onrender.com

Backend API:
https://________________________________.onrender.com/api

Database (MongoDB - if setup):
mongodb+srv://admin:____@cluster.mongodb.net/teacher-attendance
```

---

## 🆘 Need Help?

**Render Docs**: https://render.com/docs

**Your Logs**: Dashboard → Service → Logs tab

**Support**: Check full guide in [DEPLOY_NOW.md](./DEPLOY_NOW.md)

---

## ✨ You're Almost There!

Backend deployment is the most technical part. You're doing great!

**After this**:
- Set up MongoDB (5 minutes)
- Create admin user (5 minutes)
- **YOUR SYSTEM IS LIVE!** 🎉

---

**Status**: 🟡 Backend deploying...  
**Time**: ~10 minutes  
**Next**: MongoDB Atlas setup

Keep going! 🚀
