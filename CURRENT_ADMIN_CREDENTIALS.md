# 🔑 Current Admin User Credentials

**Last Updated**: June 14, 2026  
**Status**: ✅ Active and Working

---

## 👤 Admin Accounts in Database

### Admin Account #1
```
Username: admin
Password: Admin@2026
Role:     Administrator
Status:   ✅ Active
```

### Admin Account #2 (Principal)
```
Username: principal
Password: Principal@2026
Role:     Administrator
Status:   ✅ Active
Created:  June 14, 2026
```

---

## 🌐 System URLs

### Frontend (Netlify)
```
https://extraordinary-croquembouche-c6feb8.netlify.app
```

**Login Page**:
```
https://extraordinary-croquembouche-c6feb8.netlify.app/login
```

### Backend (Render)
```
https://teacher-attendance-api-v2.onrender.com
```

**Health Check**:
```
https://teacher-attendance-api-v2.onrender.com/api/health
```

---

## 🗄️ Database Information

### MongoDB Atlas
```
Database Name: teacher-attendance
Cluster:       DasunDataBase
Connection:    mongodb+srv://dasun_db_user:***@dasundatabase.xcakikk.mongodb.net/
```

### Collections
- `users` - Admin and teacher accounts (2 admins currently)
- `teachers` - Teacher profiles
- `timetables` - Class schedules
- `attendances` - Attendance records
- `substitutions` - Substitute teacher allocations

---

## 🚀 Quick Start Guide

### 1. Login to System
1. Open: https://extraordinary-croquembouche-c6feb8.netlify.app/login
2. Enter username: `admin` or `principal`
3. Enter password: `Admin@2026` or `Principal@2026`
4. Click **Login**

### 2. First Request May Be Slow
⏰ **Note**: Backend sleeps after 15 minutes of inactivity
- First request: 30-60 seconds (waking up)
- Subsequent requests: Fast (<2 seconds)

### 3. Access Dashboard
After login, you'll have access to:
- ✅ Dashboard (overview)
- ✅ Teachers Management
- ✅ Timetable Management
- ✅ Period Attendance
- ✅ Attendance Reports
- ✅ Substitution Management
- ✅ Settings

---

## 🔐 Security Notes

### Current Status
- ✅ Passwords are hashed with bcrypt (salt rounds: 10)
- ✅ JWT authentication implemented
- ✅ CORS configured for frontend-backend communication
- ✅ Environment variables properly secured

### Recommendations
1. **Change default passwords** after first login
2. **Create individual accounts** for each admin/staff member
3. **Don't share credentials** via unsecured channels
4. **Backup database** regularly via MongoDB Atlas
5. **Keep this file secure** - don't commit to public repos

---

## 📋 Environment Configuration

### Render Backend Environment Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://dasun_db_user:icCSX2AeiFBHiCXs@dasundatabase.xcakikk.mongodb.net/teacher-attendance?appName=DasunDataBase
JWT_SECRET=[Your secure secret]
FRONTEND_URL=https://extraordinary-croquembouche-c6feb8.netlify.app
```

### Netlify Frontend Environment Variables
```
VITE_API_BASE_URL=https://teacher-attendance-api-v2.onrender.com/api
```

---

## 🛠️ Creating Additional Admin Users

### Option 1: Using the Script
```bash
cd backend
node scripts/createNewAdmin.js
```

Edit the script first to change:
- `username`: Choose a new username
- `password`: Set a secure password
- `role`: Keep as 'admin'

### Option 2: MongoDB Atlas Manual Insert
1. Go to: https://cloud.mongodb.com
2. Browse Collections → `teacher-attendance` → `users`
3. Click **"INSERT DOCUMENT"**
4. Use this template (generate password hash at https://bcrypt-generator.com/):

```json
{
  "username": "your_username",
  "password": "$2a$10$YOUR_BCRYPT_HASH_HERE",
  "role": "admin",
  "createdAt": {"$date": "2026-06-14T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-14T00:00:00.000Z"}
}
```

---

## ✅ System Health Checks

### Check Backend Status
```bash
curl https://teacher-attendance-api-v2.onrender.com/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2026-06-14T..."
}
```

### Check Database Connection
Look at Render logs:
1. Go to: https://dashboard.render.com
2. Click on `teacher-attendance-api-v2`
3. Check **Logs** tab
4. Look for: `✅ Connected to MongoDB`

### Check Frontend
1. Open: https://extraordinary-croquembouche-c6feb8.netlify.app
2. Press F12 (Developer Tools)
3. Look at Console tab
4. Should see no red errors on page load

---

## 🐛 Troubleshooting

### "Cannot connect to server" Error
**Solution**: Wait 60 seconds for backend to wake up from sleep

### "Invalid credentials" Error
**Possible causes**:
1. Wrong username or password
2. User doesn't exist in database
3. Database connection issue

**Check**:
- Verify username exactly matches (case-sensitive)
- Try the other admin account
- Check MongoDB Atlas that user exists

### CORS Error
**Solution**: 
- Verify Render environment variable `FRONTEND_URL` has no trailing slash
- Check Netlify environment variable `VITE_API_BASE_URL` ends with `/api`

### 404 Error on Page Refresh
**Status**: ✅ FIXED
- Added `_redirects` file to handle React Router
- Netlify will automatically redeploy

---

## 📊 Current System Status

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ Deployed | Netlify - Auto-deploy on push |
| Backend | ✅ Deployed | Render - Free tier (sleeps after 15min) |
| Database | ✅ Connected | MongoDB Atlas - Free tier |
| Admin Users | ✅ Created | 2 admin accounts active |
| Timetable | ⏳ Pending | Import XML data after login |
| Teachers | ⏳ Pending | Add teachers after login |

---

## 🎯 Next Steps

### Immediate Tasks
1. ✅ Login with admin credentials
2. ⏳ Add environment variable in Netlify (`VITE_API_BASE_URL`)
3. ⏳ Import timetable data
4. ⏳ Add teacher accounts
5. ⏳ Test attendance marking
6. ⏳ Test substitution system

### Future Enhancements
- [ ] Add "Change Password" feature
- [ ] Add "Forgot Password" feature
- [ ] Add user profile management
- [ ] Add email notifications
- [ ] Add SMS notifications
- [ ] Add reports export (Excel/PDF)

---

## 💾 Backup & Recovery

### Database Backup
**Method 1: MongoDB Atlas Backups** (Automatic)
- Free tier includes snapshots
- Go to: Cluster → Backups

**Method 2: Manual Export**
- Use MongoDB Compass
- Connect to database
- Export collections to JSON

### Important Files to Backup
- `.env` files (backend and frontend)
- `MONGODB_URI` connection string
- Admin credentials
- JWT secret keys

---

## 📞 Support Information

### Documentation Files
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `NETLIFY_DEPLOYMENT_GUIDE.md` - Netlify setup
- `RENDER_BACKEND_DEPLOYMENT.md` - Render setup
- `ADMIN_CREDENTIALS.md` - Initial setup guide

### Useful Commands
```bash
# Backend local development
cd backend
npm install
npm run dev

# Frontend local development
cd frontend
npm install
npm run dev

# Create admin user
cd backend
node scripts/createAdminUser.js

# Create additional admin
cd backend
node scripts/createNewAdmin.js
```

---

## 🎉 Success Checklist

- [x] Backend deployed to Render
- [x] Frontend deployed to Netlify
- [x] MongoDB Atlas connected
- [x] Admin users created
- [x] Can access login page
- [ ] Environment variables set in Netlify
- [ ] Successful login test
- [ ] Dashboard loads correctly
- [ ] All pages accessible

---

**School**: Anuruddha Balika Vidyalaya  
**System**: Teacher Attendance & Substitution Management System  
**Deployed**: June 2026  
**Maintained by**: Dasun

---

⚠️ **SECURITY WARNING**: Keep this file private! Contains sensitive credentials.

