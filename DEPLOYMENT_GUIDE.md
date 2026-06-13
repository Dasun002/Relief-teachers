# Free Deployment Guide - Teacher Attendance System

This guide will help you deploy your Teacher Attendance System for **free** using modern cloud platforms.

## Architecture Overview

Your application has:
- **Frontend**: React application (Vite)
- **Backend**: Node.js/Express API
- **Database**: MongoDB

## Recommended Free Hosting Solution

### Option 1: Best for Production (Recommended)

**Frontend**: Vercel (Free)
**Backend**: Render (Free)
**Database**: MongoDB Atlas (Free)

---

## Step-by-Step Deployment

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Choose **FREE** M0 Sandbox tier

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** Shared tier (M0)
3. Select a cloud provider and region (choose closest to your users)
4. Cluster name: `teacher-attendance`
5. Click "Create"

### 3. Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `admin` (or your choice)
4. Password: Generate a secure password (save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 5. Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Save this connection string - you'll need it!

Example: `mongodb+srv://admin:YOUR_PASSWORD@teacher-attendance.xxxxx.mongodb.net/?retryWrites=true&w=majority`

Key: MONGODB_URI | Value: mongodb+srv://dasun_db_user:icCSX2AeiFBHiCXs@dasundatabase.xcakikk.mongodb.net/teacher-attendance?appName=DasunDataBase

---

## Part 2: Backend Deployment (Render)

### 1. Prepare Backend for Deployment

Create a file `backend/.env.production`:
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string_here
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2. Update backend/package.json

Add these scripts if not present:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 3. Create Render Account
1. Go to https://render.com/
2. Sign up with GitHub (recommended) or email
3. Free tier includes 750 hours/month

### 4. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (or use "Public Git repository")
3. Configure:
   - **Name**: `teacher-attendance-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your branch name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   - Add each variable from your `.env.production`:
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
     - `MONGODB_URI` = `your_mongodb_connection_string`
     - `JWT_SECRET` = `your_secure_random_string`
     - `FRONTEND_URL` = (leave empty for now, update after frontend deployment)

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Copy your backend URL: `https://teacher-attendance-api.onrender.com`

**Important**: Free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

---

## Part 3: Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment

Update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Replace with your actual Render backend URL.

### 2. Update frontend/vite.config.js

Ensure it has:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
```

### 3. Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Free tier includes unlimited deployments

### 4. Deploy Frontend
1. Click "Add New..." → "Project"
2. Import your Git repository
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

5. Click "Deploy"
6. Wait for deployment (2-5 minutes)
7. Copy your frontend URL: `https://teacher-attendance.vercel.app`

### 5. Update Backend CORS

Go back to Render dashboard:
1. Open your backend service
2. Go to "Environment"
3. Update `FRONTEND_URL` = `https://your-frontend-url.vercel.app`
4. Save changes (backend will redeploy)

---

## Part 4: Initialize Database

### 1. Import Initial Data

You need to populate your database with:
- Admin user
- Teachers
- Timetable data

**Option A: Using MongoDB Compass (GUI)**
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using your Atlas connection string
3. Create database: `teacher-attendance`
4. Import your data collections

**Option B: Using MongoDB Shell**
```bash
# Install MongoDB Shell
brew install mongosh  # macOS
# or download from https://www.mongodb.com/try/download/shell

# Connect to your cluster
mongosh "your_mongodb_connection_string"

# Create admin user
use teacher-attendance
db.users.insertOne({
  username: "admin",
  password: "$2a$10$...", // Use bcrypt to hash password
  role: "admin",
  createdAt: new Date()
})
```

**Option C: Create API Endpoint for Initial Setup**

Add a one-time setup endpoint in your backend (remove after use):
```javascript
// backend/routes/setup.js
router.post('/setup', async (req, res) => {
  // Check if already setup
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return res.status(400).json({ error: 'Already setup' });
  }
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  
  res.json({ message: 'Setup complete' });
});
```

Call it once: `POST https://your-backend-url.onrender.com/api/setup`

---

## Alternative Free Hosting Options

### Option 2: All-in-One Platform

**Railway** (Free tier: $5 credit/month)
- Deploy both frontend and backend
- Includes PostgreSQL/MongoDB
- https://railway.app/

**Steps**:
1. Sign up at https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Add MongoDB plugin
4. Deploy backend service
5. Deploy frontend service
6. Connect services

### Option 3: Netlify + Render

**Frontend**: Netlify (Free)
**Backend**: Render (Free)
**Database**: MongoDB Atlas (Free)

Similar to Vercel + Render setup.

---

## Cost Comparison

| Service | Free Tier Limits | Best For |
|---------|-----------------|----------|
| **Vercel** | Unlimited deployments, 100GB bandwidth | Frontend |
| **Render** | 750 hours/month, sleeps after 15min | Backend |
| **MongoDB Atlas** | 512MB storage, shared cluster | Database |
| **Railway** | $5 credit/month (~500 hours) | All-in-one |
| **Netlify** | 100GB bandwidth, 300 build minutes | Frontend |

---

## Production Checklist

### Security
- [ ] Change default admin password after first login
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Configure CORS properly
- [ ] Don't commit `.env` files to Git
- [ ] Use environment variables for all secrets

### Performance
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Use production build (`npm run build`)
- [ ] Enable caching headers
- [ ] Monitor API response times

### Monitoring
- [ ] Set up error tracking (Sentry free tier)
- [ ] Monitor uptime (UptimeRobot free)
- [ ] Check MongoDB Atlas metrics
- [ ] Review Render/Vercel logs

### Backup
- [ ] Enable MongoDB Atlas automated backups
- [ ] Export data regularly
- [ ] Keep local development copy
- [ ] Document deployment process

---

## Deployment Commands Summary

### Backend (Render)
```bash
cd backend
npm install
npm start
```

### Frontend (Vercel)
```bash
cd frontend
npm install
npm run build
```

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check Render logs
- Verify MongoDB connection string
- Ensure all environment variables are set
- Check Node.js version compatibility

**Problem**: CORS errors
- Verify FRONTEND_URL in backend environment
- Check CORS configuration in backend
- Ensure URLs don't have trailing slashes

### Frontend Issues

**Problem**: API calls failing
- Check VITE_API_URL is correct
- Verify backend is running
- Check browser console for errors
- Test API directly with Postman

**Problem**: Build failing
- Check for TypeScript errors
- Verify all dependencies installed
- Check Node.js version
- Review Vercel build logs

### Database Issues

**Problem**: Connection timeout
- Verify IP whitelist (0.0.0.0/0)
- Check connection string format
- Ensure database user has permissions
- Test connection with MongoDB Compass

---

## Custom Domain (Optional)

### Vercel Custom Domain (Free)
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Render Custom Domain (Free)
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. Wait for SSL certificate

---

## Keeping Free Tier Active

### Render Free Tier
- Sleeps after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- Use a cron job to ping every 14 minutes (optional)

**Cron Job Service** (Free):
- https://cron-job.org/
- Set up: `GET https://your-backend-url.onrender.com/health`
- Interval: Every 14 minutes

---

## Upgrade Path (When Needed)

### When to Upgrade

**Render** ($7/month):
- No sleep time
- Faster response
- More resources

**MongoDB Atlas** ($9/month):
- 2GB storage
- Better performance
- Automated backups

**Vercel Pro** ($20/month):
- Team collaboration
- More bandwidth
- Priority support

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Vite Docs**: https://vitejs.dev/guide/
- **Express Docs**: https://expressjs.com/

---

## Quick Start Commands

```bash
# 1. Setup MongoDB Atlas (web interface)
# 2. Deploy Backend to Render (web interface)
# 3. Deploy Frontend to Vercel

# Local testing before deployment
cd backend
npm install
npm start

cd ../frontend
npm install
npm run dev
```

---

**Estimated Setup Time**: 30-45 minutes
**Total Cost**: $0/month (free tier)
**Suitable For**: Small to medium schools (up to 100 teachers)

---

## Next Steps After Deployment

1. ✅ Test login with admin account
2. ✅ Import teacher data
3. ✅ Import timetable data
4. ✅ Test attendance marking
5. ✅ Test substitution allocation
6. ✅ Train staff on system usage
7. ✅ Set up regular backups
8. ✅ Monitor system performance

---

**Need Help?** Check the troubleshooting section or review service documentation.
