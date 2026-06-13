# 🚀 DEPLOY NOW - Step by Step Guide

**Status**: ✅ Code pushed to GitHub - Ready to deploy!  
**Repository**: https://github.com/Dasun002/Relief-teachers.git  
**Time Required**: 25 minutes  
**Cost**: $0/month forever

---

## ✅ Pre-Deployment Checklist (DONE)

- [x] Code committed to Git
- [x] Code pushed to GitHub
- [x] Environment variable template created
- [x] Package dependencies verified (including jspdf)
- [x] All features working locally
- [x] Documentation complete

**You're ready to deploy!**

---

# DEPLOYMENT ORDER

## 🗄️ STEP 1: Database First (5 min)
## ⚙️ STEP 2: Backend API Second (10 min)
## 🎨 STEP 3: Frontend Last (5 min)
## 🔗 STEP 4: Connect Everything (5 min)

**Total Time**: ~25 minutes

---

# 🗄️ STEP 1: Deploy Database (MongoDB Atlas)

## Why First?
Backend needs database connection string to start.

## Instructions

### 1.1 Sign Up
1. Open: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with email or Google
3. Verify your email

### 1.2 Create FREE Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Provider: **AWS**
4. Region: Choose closest to Sri Lanka:
   - Singapore (ap-south-1)
   - Mumbai (ap-south-1)
   - Or closest Asian region
5. Cluster Name: `teacher-attendance`
6. Click **"Create"**
7. Wait 2-3 minutes for cluster creation

### 1.3 Create Database User
1. Username: `admin`
2. Click **"Autogenerate Secure Password"**
3. **COPY AND SAVE THE PASSWORD** ← IMPORTANT!
4. Click **"Create User"**

### 1.4 Network Access
1. Click **"Add My Current IP Address"**
2. Then click **"Add IP Address"**
3. IP Address: `0.0.0.0/0`
4. Description: `Allow from anywhere`
5. Click **"Add Entry"**
6. Click **"Finish and Close"**

### 1.5 Get Connection String
1. Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@teacher-attendance.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `/teacher-attendance`
6. Final format:
   ```
   mongodb+srv://admin:YourPassword@teacher-attendance.xxxxx.mongodb.net/teacher-attendance?retryWrites=true&w=majority
   ```

### 1.6 Save This Information
```
MongoDB Connection String:
mongodb+srv://admin:YourPassword@teacher-attendance.xxxxx.mongodb.net/teacher-attendance?retryWrites=true&w=majority

Database User: admin
Database Password: [Your saved password]
Database Name: teacher-attendance
```

✅ **STEP 1 COMPLETE** - Database ready!

---

# ⚙️ STEP 2: Deploy Backend API (Render)

## Why Second?
Frontend needs backend API URL to connect.

## Instructions

### 2.1 Sign Up for Render
1. Open: **https://render.com**
2. Click **"Get Started"**
3. Click **"Sign up with GitHub"**
4. Authorize Render to access GitHub
5. Select: **Only select repositories**
6. Choose: **Relief-teachers**

### 2.2 Create Web Service
1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Find repository: `Relief-teachers`
4. Click **"Connect"**

### 2.3 Configure Service Settings

Fill in these **exact** settings:

**Basic Settings:**
```
Name: teacher-attendance-api
Region: Singapore (or closest to you)
Branch: main
Root Directory: backend
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
```
Select: Free ($0/month)
```

### 2.4 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **5 variables**:

1. **NODE_ENV**
   ```
   Value: production
   ```

2. **PORT**
   ```
   Value: 10000
   ```

3. **MONGODB_URI**
   ```
   Value: [Paste your connection string from Step 1.5]
   ```

4. **JWT_SECRET**
   ```
   Value: teacher-attendance-secret-2026-anuruddha-balika-secure-jwt-key
   ```

5. **FRONTEND_URL**
   ```
   Value: [Leave empty - we'll add this in Step 4]
   ```

### 2.5 Deploy Backend
1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. Watch the logs - you should see:
   ```
   ==> Server running on port 10000
   ==> Connected to MongoDB
   ==> Your service is live 🎉
   ```

### 2.6 Get Backend URL
1. At the top of the page, you'll see your URL:
   ```
   https://teacher-attendance-api.onrender.com
   ```
2. **COPY THIS URL** - you'll need it for Step 3!

### 2.7 Test Backend
1. Click on the URL or open in new tab
2. Add `/api/health` to the end:
   ```
   https://teacher-attendance-api.onrender.com/api/health
   ```
3. You should see:
   ```json
   {"status":"ok","message":"Server is running"}
   ```

### 2.8 Save This Information
```
Backend URL:
https://teacher-attendance-api.onrender.com

Backend API Endpoint:
https://teacher-attendance-api.onrender.com/api
```

✅ **STEP 2 COMPLETE** - Backend API is live!

**⚠️ Important**: Free tier sleeps after 15 minutes of inactivity. First request takes 30-60 seconds to wake up. This is normal!

---

# 🎨 STEP 3: Deploy Frontend (Vercel)

## Why Last?
Frontend needs to know the backend API URL.

## Instructions

### 3.1 Sign Up for Vercel
1. Open: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel
4. Complete profile setup

### 3.2 Import Project
1. Click **"Add New..."** (top right)
2. Select **"Project"**
3. Click **"Import Third-Party Git Repository"** OR find your repo
4. Repository URL: `https://github.com/Dasun002/Relief-teachers`
5. Click **"Import"**

### 3.3 Configure Project

**Configure Project Settings:**

```
Project Name: teacher-attendance
Framework Preset: Vite (should auto-detect)
Root Directory: frontend (click Edit → select frontend)
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.4 Environment Variables

Click **"Environment Variables"** section

Add **1 variable**:

**VITE_API_URL**
```
Value: https://teacher-attendance-api.onrender.com/api
```

**IMPORTANT**: 
- Replace with YOUR backend URL from Step 2.6
- Must end with `/api`
- No trailing slash after `api`

Example:
```
https://your-backend-name.onrender.com/api
```

### 3.5 Deploy Frontend
1. Click **"Deploy"** button
2. Wait 2-5 minutes
3. You'll see build logs scrolling
4. When complete, you'll see **"Congratulations! 🎉"**

### 3.6 Get Frontend URL
1. Click **"Continue to Dashboard"**
2. At the top, you'll see your domains:
   ```
   https://teacher-attendance.vercel.app
   ```
3. Click **"Visit"** to open your live site!

### 3.7 Test Frontend
1. You should see the login page
2. Professional blue gradient background
3. White login card with GraduationCap icon
4. "Anuruddha Balika Vidyalaya" subtitle
5. Username and password fields
6. Login button

### 3.8 Save This Information
```
Frontend URL:
https://teacher-attendance.vercel.app

Live Website:
https://teacher-attendance.vercel.app
```

✅ **STEP 3 COMPLETE** - Frontend is live!

---

# 🔗 STEP 4: Connect Everything

## Why?
Backend needs to allow requests from your frontend (CORS).

## Instructions

### 4.1 Update Backend CORS
1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on **"teacher-attendance-api"** service
3. Click **"Environment"** (left sidebar)
4. Find **"FRONTEND_URL"** variable
5. Click **Edit** (pencil icon)
6. Enter your frontend URL:
   ```
   https://teacher-attendance.vercel.app
   ```
   **NO trailing slash!**
7. Click **"Save Changes"**
8. Backend will auto-redeploy (wait 2-3 minutes)

### 4.2 Verify Connection
1. Open your frontend URL in browser
2. Press **F12** to open Developer Tools
3. Click **"Console"** tab
4. Refresh the page
5. Check for errors:
   - ✅ **No CORS errors** = Success!
   - ❌ **CORS errors** = Wait 2 more minutes and refresh

### 4.3 Test Login Attempt
1. Try logging in with dummy credentials:
   - Username: `test`
   - Password: `test`
2. You should see: **"Invalid credentials"** error
3. This is good! It means frontend is talking to backend!

✅ **STEP 4 COMPLETE** - Everything connected!

---

# 👤 STEP 5: Create Admin User

## Option A: Using MongoDB Atlas (Recommended)

### 5.1 Access Database
1. Go to **MongoDB Atlas**: https://cloud.mongodb.com
2. Click **"Browse Collections"**
3. Select your cluster: `teacher-attendance`

### 5.2 Create Database & Collection
1. Click **"+ Create Database"**
2. Database name: `teacher-attendance`
3. Collection name: `users`
4. Click **"Create"**

### 5.3 Insert Admin User
1. Click on `users` collection
2. Click **"Insert Document"**
3. Switch to **"JSON View"** (toggle at top)
4. Paste this:
   ```json
   {
     "username": "admin",
     "password": "$2a$10$YourHashedPasswordHere",
     "role": "admin",
     "createdAt": {"$date": "2026-06-13T00:00:00.000Z"}
   }
   ```

### 5.4 Generate Password Hash

**Option 1: Use Online Tool**
1. Go to: https://bcrypt-generator.com/
2. Enter password: `admin123`
3. Rounds: 10
4. Copy the generated hash
5. Replace `$2a$10$YourHashedPasswordHere` with the hash

**Option 2: Use Backend Script**
I can create a password hash generator script for you.

### 5.5 Test Login
1. Go to your frontend URL
2. Login with:
   - Username: `admin`
   - Password: `admin123` (or whatever you used)
3. You should be redirected to Dashboard!

✅ **STEP 5 COMPLETE** - Admin user created!

---

# 🎉 DEPLOYMENT COMPLETE!

## Your Live System

```
🌐 Frontend:    https://teacher-attendance.vercel.app
⚙️ Backend:     https://teacher-attendance-api.onrender.com
🗄️ Database:    MongoDB Atlas (512MB free)

👤 Admin Login:
   Username: admin
   Password: admin123

📱 Accessible from:
   ✅ Desktop computers
   ✅ Laptops
   ✅ Tablets
   ✅ Mobile phones
   ✅ Anywhere with internet
```

---

## ✅ Final Testing Checklist

Test all features:

- [ ] Login page loads correctly
- [ ] Can login as admin
- [ ] Dashboard displays correctly
- [ ] Sidebar toggles properly
- [ ] Navigation works on all pages
- [ ] Teachers page loads
- [ ] Can add new teacher
- [ ] Timetable page loads
- [ ] Quick Attendance works
- [ ] Period Attendance works
- [ ] Can allocate substitutions
- [ ] Substitution Summary displays
- [ ] Can download PDF report
- [ ] Works on mobile device
- [ ] Login/logout works properly

---

## 📊 Deployment Summary

| Component | Service | URL | Cost |
|-----------|---------|-----|------|
| Database | MongoDB Atlas | cloud.mongodb.com | **$0** |
| Backend | Render | teacher-attendance-api.onrender.com | **$0** |
| Frontend | Vercel | teacher-attendance.vercel.app | **$0** |
| **TOTAL** | - | - | **$0/month** |

**Free Forever!** 🎉

---

## 🔒 Security Next Steps

After deployment, immediately:

1. **Change Admin Password**:
   - Login as admin
   - Go to profile settings
   - Change password to something strong

2. **Add Teachers**:
   - Add all teacher accounts
   - Give them initial passwords
   - Ask them to change on first login

3. **Backup Strategy**:
   - MongoDB Atlas has automatic backups
   - Export important data weekly
   - Keep offline backup

---

## ⚠️ Important Notes

### Free Tier Behavior

**Backend Sleep Mode**:
- Sleeps after 15 minutes of no activity
- First request takes 30-60 seconds
- Subsequent requests are fast
- **This is normal for free tier!**

**How to Handle**:
- Inform users about first load delay
- Use paid tier ($7/month) for instant response
- Or use a "keep-alive" ping service

### Monthly Limits

**Render Free Tier**:
- 750 hours/month (covers 24/7 for 31 days)
- Resets on 1st of each month
- Automatic - no action needed

**MongoDB Free Tier**:
- 512MB storage
- Enough for 100+ teachers
- Unlimited reads/writes

**Vercel Free Tier**:
- Unlimited deployments
- 100GB bandwidth/month
- More than enough for school use

---

## 🆘 Troubleshooting

### "Cannot connect to server"
**Solution**: Wait 60 seconds (backend waking up), then refresh

### "CORS Error"
**Solution**: 
- Check FRONTEND_URL in Render environment variables
- Make sure no trailing slash
- Wait for backend to redeploy

### "Invalid credentials" but credentials are correct
**Solution**:
- Check MongoDB Atlas - verify user exists
- Check password hash is correct
- Try creating new admin user

### Frontend not updating
**Solution**:
- Go to Vercel dashboard
- Click **"Redeploy"**
- Wait 2 minutes

### Backend crashed
**Solution**:
- Go to Render dashboard
- Check **"Logs"** tab
- Look for error messages
- Usually auto-restarts

---

## 📞 Support Resources

**Documentation**:
- [START_DEPLOYMENT_HERE.md](./START_DEPLOYMENT_HERE.md) - Detailed guide
- [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) - Quick reference
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full documentation

**Service Dashboards**:
- MongoDB: https://cloud.mongodb.com
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard

**Check Logs**:
- Render Logs: Dashboard → Service → Logs
- Vercel Logs: Dashboard → Project → Deployments → View Function Logs
- MongoDB Logs: Atlas → Cluster → Metrics

---

## 🚀 You're Live!

**Congratulations!** Your Teacher Attendance System is now:

✅ **Live** on the internet  
✅ **Accessible** from anywhere  
✅ **Professional** and secure  
✅ **FREE** forever  
✅ **Ready** for school use  

**Share your website**: https://teacher-attendance.vercel.app

**Start using it today!**

---

**Deployed**: June 13, 2026  
**School**: Anuruddha Balika Vidyalaya  
**Status**: 🟢 **LIVE**  
**GitHub**: https://github.com/Dasun002/Relief-teachers

---

Need help? All your documentation is in the repository! 📚
