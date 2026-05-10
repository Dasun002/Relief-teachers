# Quick Deployment Guide - 5 Steps

Deploy your Teacher Attendance System for **FREE** in under 30 minutes!

## 🎯 Recommended Stack (100% Free)

| Component | Service | Free Tier |
|-----------|---------|-----------|
| **Database** | MongoDB Atlas | 512MB storage |
| **Backend API** | Render | 750 hours/month |
| **Frontend** | Vercel | Unlimited |

---

## 📋 Step 1: Database (5 minutes)

### MongoDB Atlas Setup

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create FREE cluster**:
   - Choose M0 Sandbox (FREE)
   - Select region closest to you
   - Name: `teacher-attendance`
3. **Create database user**:
   - Username: `admin`
   - Password: (generate strong password)
   - Save password securely!
4. **Allow network access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

**Save this**: `mongodb+srv://admin:YOUR_PASSWORD@teacher-attendance.xxxxx.mongodb.net/`

---

## 📋 Step 2: Backend (10 minutes)

### Render Setup

1. **Sign up**: https://render.com/ (use GitHub)
2. **New Web Service**:
   - Connect your GitHub repo
   - Or use public Git URL
3. **Configure**:
   ```
   Name: teacher-attendance-api
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
4. **Environment Variables** (click "Advanced"):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string_from_step1
   JWT_SECRET=your_random_32_character_string
   FRONTEND_URL=(leave empty for now)
   ```
5. **Deploy** and wait 5-10 minutes
6. **Copy your backend URL**: `https://teacher-attendance-api.onrender.com`

**⚠️ Important**: Free tier sleeps after 15 min. First request takes 30-60 sec.

---

## 📋 Step 3: Frontend (10 minutes)

### Vercel Setup

1. **Sign up**: https://vercel.com/signup (use GitHub)
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your repository
3. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Use your Render URL from Step 2)
5. **Deploy** and wait 2-5 minutes
6. **Copy your frontend URL**: `https://teacher-attendance.vercel.app`

---

## 📋 Step 4: Connect Services (2 minutes)

### Update Backend CORS

1. Go back to **Render dashboard**
2. Open your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   (Use your Vercel URL from Step 3)
5. **Save** (backend will auto-redeploy)

---

## 📋 Step 5: Initialize Data (5 minutes)

### Create Admin User

**Option A: Using MongoDB Compass** (Recommended)
1. Download: https://www.mongodb.com/products/compass
2. Connect with your connection string
3. Create database: `teacher-attendance`
4. Create collection: `users`
5. Insert document:
   ```json
   {
     "username": "admin",
     "password": "$2a$10$YourHashedPasswordHere",
     "role": "admin",
     "createdAt": new Date()
   }
   ```

**Option B: Use Backend Script**
1. Create a temporary setup endpoint
2. Call it once to create admin user
3. Remove the endpoint

**Option C: Manual via MongoDB Atlas**
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Create database and collection
4. Insert admin user document

---

## ✅ Verification Checklist

After deployment, test these:

- [ ] Visit your frontend URL
- [ ] Login page loads correctly
- [ ] Login with admin credentials
- [ ] Dashboard loads
- [ ] Can view teachers page
- [ ] Can view timetable page
- [ ] Can mark attendance
- [ ] Can allocate substitutions

---

## 🔧 Quick Fixes

### Frontend can't connect to backend
```bash
# Check VITE_API_URL in Vercel environment variables
# Should be: https://your-backend-url.onrender.com/api
```

### CORS errors
```bash
# Check FRONTEND_URL in Render environment variables
# Should be: https://your-frontend-url.vercel.app
# No trailing slash!
```

### Backend not responding
```bash
# Free tier sleeps after 15 minutes
# First request takes 30-60 seconds to wake up
# This is normal!
```

### Database connection failed
```bash
# Check MongoDB Atlas:
# 1. IP whitelist includes 0.0.0.0/0
# 2. Database user exists
# 3. Password is correct in connection string
```

---

## 🚀 Your URLs

After deployment, save these:

```
Frontend: https://teacher-attendance.vercel.app
Backend:  https://teacher-attendance-api.onrender.com
Database: mongodb+srv://admin:PASSWORD@teacher-attendance.xxxxx.mongodb.net/

Admin Login:
Username: admin
Password: (your chosen password)
```

---

## 💰 Cost Breakdown

| Service | Cost | Limits |
|---------|------|--------|
| MongoDB Atlas | **$0** | 512MB storage |
| Render | **$0** | 750 hours/month, sleeps after 15min |
| Vercel | **$0** | Unlimited deployments |
| **TOTAL** | **$0/month** | Perfect for small schools |

---

## 📈 When to Upgrade

### Render ($7/month)
- ✅ No sleep time
- ✅ Always fast response
- ✅ Better for 50+ teachers

### MongoDB Atlas ($9/month)
- ✅ 2GB storage
- ✅ Automated backups
- ✅ Better performance

### Current free tier is suitable for:
- Up to 100 teachers
- Up to 1000 students
- Daily attendance marking
- Basic reporting

---

## 🆘 Need Help?

1. **Check logs**:
   - Render: Dashboard → Logs tab
   - Vercel: Dashboard → Deployments → View logs
   - MongoDB: Atlas → Metrics

2. **Common issues**: See DEPLOYMENT_GUIDE.md

3. **Test locally first**:
   ```bash
   cd backend && npm start
   cd frontend && npm run dev
   ```

---

## 🎉 Success!

Your Teacher Attendance System is now live and accessible from anywhere!

**Next Steps**:
1. Change admin password
2. Add teachers
3. Import timetable
4. Train staff
5. Start using!

---

**Deployment Time**: ~30 minutes
**Monthly Cost**: $0
**Maintenance**: Minimal

Enjoy your free deployment! 🚀
