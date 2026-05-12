# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to GitHub
- [ ] No sensitive data in code (passwords, API keys)
- [ ] `.env` files are in `.gitignore`
- [ ] README.md is complete
- [ ] All tests passing locally

### Accounts Setup
- [ ] MongoDB Atlas account created
- [ ] Render account created (with GitHub)
- [ ] Vercel account created (with GitHub)
- [ ] GitHub repository is public or accessible

---

## 📦 Step 1: Database Deployment (MongoDB Atlas)

### Account Setup
- [ ] Signed up at https://www.mongodb.com/cloud/atlas/register
- [ ] Email verified

### Cluster Creation
- [ ] Created new project: "Teacher Attendance"
- [ ] Created M0 FREE cluster
- [ ] Selected closest region
- [ ] Cluster name: `teacher-attendance`
- [ ] Waited for cluster to be ready (2-3 minutes)

### Security Configuration
- [ ] Created database user:
  - Username: `admin`
  - Password: (strong password saved securely)
  - Role: Atlas Admin
- [ ] Added IP whitelist: `0.0.0.0/0` (allow from anywhere)
- [ ] Saved connection string securely

### Connection String
```
mongodb+srv://admin:YOUR_PASSWORD@teacher-attendance.xxxxx.mongodb.net/teacher-attendance?retryWrites=true&w=majority
```
- [ ] Connection string saved
- [ ] Password replaced in connection string
- [ ] Database name added: `teacher-attendance`

---

## 🔧 Step 2: Backend Deployment (Render)

### Account Setup
- [ ] Signed up at https://render.com
- [ ] Connected GitHub account
- [ ] Authorized Render to access repository

### Web Service Creation
- [ ] Clicked "New +" → "Web Service"
- [ ] Selected repository: `Relief-teachers`
- [ ] Configured service:
  - **Name**: `teacher-attendance-api`
  - **Region**: (closest to you)
  - **Branch**: `main`
  - **Root Directory**: `backend`
  - **Runtime**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Instance Type**: `Free`

### Environment Variables
- [ ] Added environment variables:
  ```
  NODE_ENV=production
  PORT=10000
  MONGODB_URI=<your_mongodb_connection_string>
  JWT_SECRET=<random_32_character_string>
  FRONTEND_URL=<leave_empty_for_now>
  ```
- [ ] JWT_SECRET is at least 32 characters
- [ ] MONGODB_URI includes password and database name

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment (5-10 minutes)
- [ ] Deployment successful (green checkmark)
- [ ] Saved backend URL: `https://teacher-attendance-api.onrender.com`
- [ ] Tested backend: `https://teacher-attendance-api.onrender.com/api/health`

### Troubleshooting
- [ ] If build fails, check logs
- [ ] Verify `package.json` has correct scripts
- [ ] Verify Node version compatibility

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### Account Setup
- [ ] Signed up at https://vercel.com/signup
- [ ] Connected GitHub account
- [ ] Authorized Vercel to access repository

### Project Import
- [ ] Clicked "Add New..." → "Project"
- [ ] Selected repository: `Relief-teachers`
- [ ] Configured project:
  - **Framework Preset**: `Vite`
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

### Environment Variables
- [ ] Added environment variable:
  ```
  VITE_API_URL=https://teacher-attendance-api.onrender.com/api
  ```
- [ ] Used backend URL from Step 2
- [ ] No trailing slash in URL

### Deployment
- [ ] Clicked "Deploy"
- [ ] Waited for deployment (2-5 minutes)
- [ ] Deployment successful
- [ ] Saved frontend URL: `https://teacher-attendance.vercel.app`
- [ ] Visited frontend URL to verify

### Troubleshooting
- [ ] If build fails, check build logs
- [ ] Verify `vite.config.js` is correct
- [ ] Check environment variable name (must start with `VITE_`)

---

## 🔗 Step 4: Connect Services

### Update Backend CORS
- [ ] Went back to Render dashboard
- [ ] Opened backend service
- [ ] Clicked "Environment" tab
- [ ] Updated `FRONTEND_URL` variable:
  ```
  FRONTEND_URL=https://teacher-attendance.vercel.app
  ```
- [ ] Saved changes
- [ ] Waited for auto-redeploy (2-3 minutes)

### Verify Connection
- [ ] Opened frontend URL
- [ ] Opened browser console (F12)
- [ ] No CORS errors
- [ ] API calls working

---

## 📊 Step 5: Initialize Database

### Create Admin User

**Option A: MongoDB Compass (Recommended)**
- [ ] Downloaded MongoDB Compass
- [ ] Connected using connection string
- [ ] Created database: `teacher-attendance`
- [ ] Created collection: `users`
- [ ] Inserted admin user document:
  ```json
  {
    "username": "admin",
    "password": "$2a$10$YourHashedPasswordHere",
    "role": "admin",
    "createdAt": {"$date": "2026-05-12T00:00:00.000Z"}
  }
  ```

**Option B: MongoDB Atlas Web Interface**
- [ ] Logged into MongoDB Atlas
- [ ] Clicked "Browse Collections"
- [ ] Created database: `teacher-attendance`
- [ ] Created collection: `users`
- [ ] Inserted admin user document

**Option C: Backend Script**
- [ ] Created temporary setup endpoint
- [ ] Called endpoint to create admin
- [ ] Removed endpoint after use

### Import Initial Data
- [ ] Imported teachers (if available)
- [ ] Imported timetable data
- [ ] Verified data in MongoDB

---

## ✅ Step 6: Testing & Verification

### Frontend Testing
- [ ] Visited frontend URL
- [ ] Login page loads correctly
- [ ] No console errors
- [ ] Styling looks correct
- [ ] Sidebar navigation works
- [ ] Mobile responsive

### Authentication Testing
- [ ] Can login with admin credentials
- [ ] JWT token stored correctly
- [ ] Can logout
- [ ] Protected routes work
- [ ] Unauthorized access blocked

### Feature Testing
- [ ] Dashboard loads
- [ ] Can view teachers list
- [ ] Can add new teacher
- [ ] Can view timetable
- [ ] Can mark attendance (Quick)
- [ ] Can mark attendance (Period-Based)
- [ ] Can allocate substitutes
- [ ] Can view substitution summary
- [ ] Can download PDF report

### Performance Testing
- [ ] First load time acceptable
- [ ] Navigation is smooth
- [ ] API responses are fast
- [ ] No memory leaks
- [ ] Works on mobile devices

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## 🔐 Step 7: Security Hardening

### Backend Security
- [ ] Changed default admin password
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] Input validation working
- [ ] SQL injection protection
- [ ] XSS protection

### Database Security
- [ ] Database user has minimal permissions
- [ ] Connection string not exposed
- [ ] IP whitelist configured
- [ ] Backup strategy in place

### Frontend Security
- [ ] No sensitive data in localStorage
- [ ] API keys not exposed
- [ ] HTTPS enforced
- [ ] Content Security Policy set

**📖 See**: [SECURITY_QUICK_SETUP.md](./SECURITY_QUICK_SETUP.md)

---

## 📝 Step 8: Documentation

### Update Documentation
- [ ] Updated README.md with live URLs
- [ ] Added deployment date
- [ ] Documented admin credentials (securely)
- [ ] Created user guide
- [ ] Created admin guide

### Save Important Information
```
=== DEPLOYMENT INFORMATION ===

Frontend URL: https://teacher-attendance.vercel.app
Backend URL:  https://teacher-attendance-api.onrender.com
Database:     mongodb+srv://admin:PASSWORD@teacher-attendance.xxxxx.mongodb.net/

Admin Credentials:
Username: admin
Password: [SECURE PASSWORD]

Deployment Date: [DATE]
Deployed By: [YOUR NAME]

=== IMPORTANT NOTES ===
- Backend sleeps after 15 minutes (free tier)
- First request takes 30-60 seconds
- Free tier limits: 512MB DB, 750 hours/month backend
- Vercel: Unlimited deployments
```

- [ ] Saved deployment information securely
- [ ] Shared with relevant stakeholders
- [ ] Added to password manager

---

## 🎉 Step 9: Go Live

### Announcement
- [ ] Notified school administration
- [ ] Trained key users
- [ ] Provided user documentation
- [ ] Set up support channel

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor error logs (Render)
- [ ] Monitor deployment logs (Vercel)
- [ ] Monitor database metrics (Atlas)

### Backup Plan
- [ ] Database backup strategy
- [ ] Rollback plan documented
- [ ] Emergency contacts listed

---

## 🔄 Post-Deployment

### Week 1
- [ ] Monitor daily for issues
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Update documentation

### Month 1
- [ ] Review usage metrics
- [ ] Optimize performance
- [ ] Add requested features
- [ ] Plan upgrades if needed

### Ongoing
- [ ] Monthly security updates
- [ ] Quarterly feature reviews
- [ ] Annual cost review
- [ ] User satisfaction surveys

---

## 🆘 Troubleshooting

### Common Issues

**Frontend can't connect to backend**
- [ ] Check VITE_API_URL in Vercel
- [ ] Check FRONTEND_URL in Render
- [ ] Verify CORS settings
- [ ] Check browser console for errors

**Backend not responding**
- [ ] Wait 60 seconds (free tier wake-up)
- [ ] Check Render logs
- [ ] Verify MongoDB connection
- [ ] Check environment variables

**Database connection failed**
- [ ] Verify IP whitelist (0.0.0.0/0)
- [ ] Check database user credentials
- [ ] Verify connection string format
- [ ] Check MongoDB Atlas status

**Login not working**
- [ ] Verify admin user exists in database
- [ ] Check password hash
- [ ] Verify JWT_SECRET is set
- [ ] Check browser console for errors

---

## 📊 Success Metrics

After deployment, you should see:
- ✅ Frontend loads in < 3 seconds
- ✅ Backend responds in < 2 seconds (after wake-up)
- ✅ Zero CORS errors
- ✅ All features working
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Users can login and use system

---

## 🎯 Next Steps

1. **Change admin password** immediately
2. **Add teachers** to the system
3. **Import timetable** data
4. **Train staff** on system usage
5. **Monitor** for first week
6. **Collect feedback** and improve

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Project Docs**: See README.md

---

**Deployment Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Total Time**: ~30-45 minutes

**Cost**: $0/month (free tier)

Good luck with your deployment! 🚀
