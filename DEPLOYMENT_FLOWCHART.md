# 🗺️ Deployment Flowchart

Visual guide to understand the deployment process and architecture.

---

## 📊 Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     START DEPLOYMENT                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: MongoDB Atlas (Database)                          │
│  ────────────────────────────────────                       │
│  ✓ Create free account                                      │
│  ✓ Create M0 FREE cluster                                   │
│  ✓ Create database user (admin)                             │
│  ✓ Allow access from anywhere (0.0.0.0/0)                   │
│  ✓ Get connection string                                    │
│                                                              │
│  OUTPUT: mongodb+srv://admin:pass@cluster/database          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Render (Backend API)                              │
│  ────────────────────────                                   │
│  ✓ Sign up with GitHub                                      │
│  ✓ Connect Relief-teachers repository                       │
│  ✓ Configure: Node, backend folder                          │
│  ✓ Add environment variables:                               │
│    - MONGODB_URI (from Step 1)                              │
│    - JWT_SECRET                                              │
│    - PORT=10000                                              │
│    - NODE_ENV=production                                     │
│    - FRONTEND_URL (empty for now)                           │
│  ✓ Deploy and wait                                          │
│                                                              │
│  OUTPUT: https://teacher-attendance-api.onrender.com        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Vercel (Frontend Website)                         │
│  ─────────────────────────────                              │
│  ✓ Sign up with GitHub                                      │
│  ✓ Import Relief-teachers repository                        │
│  ✓ Configure: Vite, frontend folder                         │
│  ✓ Add environment variable:                                │
│    - VITE_API_URL (backend URL from Step 2 + /api)         │
│  ✓ Deploy and wait                                          │
│                                                              │
│  OUTPUT: https://teacher-attendance.vercel.app              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Connect Everything                                │
│  ──────────────────────────                                 │
│  ✓ Go back to Render                                        │
│  ✓ Update FRONTEND_URL with Vercel URL                      │
│  ✓ Wait for auto-redeploy                                   │
│  ✓ Test connection (no CORS errors)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Create Admin User                                 │
│  ─────────────────────────                                  │
│  ✓ Go to MongoDB Atlas                                      │
│  ✓ Browse Collections                                       │
│  ✓ Create database: teacher-attendance                      │
│  ✓ Create collection: users                                 │
│  ✓ Insert admin user document                               │
│  ✓ Test login                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    🎉 DEPLOYMENT COMPLETE!                  │
│                                                              │
│  Your system is live at:                                    │
│  https://teacher-attendance.vercel.app                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        USERS                                 │
│  (Teachers, Admin, Staff - Anywhere with Internet)          │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   VERCEL (Frontend)                          │
│  ───────────────────────────────────                         │
│                                                               │
│  • React Application                                         │
│  • Vite Build System                                         │
│  • Professional UI                                           │
│  • Responsive Design                                         │
│  • PDF Generation (jspdf)                                    │
│                                                               │
│  Location: frontend/                                         │
│  URL: https://teacher-attendance.vercel.app                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   RENDER (Backend API)                       │
│  ───────────────────────────────                             │
│                                                               │
│  • Node.js + Express                                         │
│  • REST API Endpoints                                        │
│  • JWT Authentication                                        │
│  • Business Logic                                            │
│  • CORS Protection                                           │
│                                                               │
│  Location: backend/                                          │
│  URL: https://teacher-attendance-api.onrender.com           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            │ Secure Connection
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                 MONGODB ATLAS (Database)                     │
│  ─────────────────────────────────────                       │
│                                                               │
│  • Document Database                                         │
│  • Collections:                                              │
│    - users (teachers, admin)                                 │
│    - teachers (teacher records)                              │
│    - timetable (schedule)                                    │
│    - attendance (daily records)                              │
│    - substitutions (relief teachers)                         │
│                                                               │
│  • 512MB Free Storage                                        │
│  • Automatic Backups                                         │
│  • Encryption at Rest                                        │
│                                                               │
│  URL: mongodb+srv://cluster.mongodb.net                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

```
┌─────────────┐
│    USER     │
└─────────────┘
      │
      │ 1. Opens website
      ▼
┌─────────────┐
│  VERCEL     │ ← Loads React App
│  (Frontend) │
└─────────────┘
      │
      │ 2. User logs in
      ▼
┌─────────────┐
│   RENDER    │ ← POST /api/auth/login
│  (Backend)  │
└─────────────┘
      │
      │ 3. Verify credentials
      ▼
┌─────────────┐
│  MONGODB    │ ← Query users collection
│  (Database) │
└─────────────┘
      │
      │ 4. Return user data
      ▼
┌─────────────┐
│   RENDER    │ ← Generate JWT token
│  (Backend)  │
└─────────────┘
      │
      │ 5. Send token
      ▼
┌─────────────┐
│  VERCEL     │ ← Store token, redirect
│  (Frontend) │
└─────────────┘
      │
      │ 6. Display dashboard
      ▼
┌─────────────┐
│    USER     │ ← Sees dashboard
└─────────────┘
```

---

## 🔐 Security Flow

```
┌────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
└────────────────────────────────────────────────────────────┘

Layer 1: HTTPS Encryption
│
├── All traffic encrypted in transit
├── SSL/TLS certificates (automatic)
└── Secure connections only

Layer 2: CORS Protection
│
├── Backend only accepts requests from frontend domain
├── Blocks unauthorized origins
└── Environment variable controlled

Layer 3: JWT Authentication
│
├── Secure token-based authentication
├── Tokens expire automatically
├── Secret key protected
└── Stateless authentication

Layer 4: Password Hashing
│
├── bcrypt with salt rounds
├── Passwords never stored in plain text
├── One-way encryption
└── Secure password comparison

Layer 5: Input Validation
│
├── Server-side validation
├── Sanitized inputs
├── Protected against injection
└── Type checking

Layer 6: Database Security
│
├── MongoDB Atlas encryption at rest
├── Network isolation
├── User authentication
└── Automatic backups
```

---

## 📊 Request Flow Example: Mark Attendance

```
Step 1: User Interface
┌───────────────────────────────────────┐
│  Teacher marks attendance on form     │
│  Selects: Present/Absent              │
│  Clicks: Submit                        │
└───────────────────────────────────────┘
          │
          ▼
Step 2: Frontend Processing
┌───────────────────────────────────────┐
│  Validate form data                   │
│  Add JWT token to request             │
│  POST /api/attendance                 │
└───────────────────────────────────────┘
          │
          ▼
Step 3: Backend Receives
┌───────────────────────────────────────┐
│  Verify JWT token                     │
│  Check user permissions               │
│  Validate attendance data             │
└───────────────────────────────────────┘
          │
          ▼
Step 4: Database Operation
┌───────────────────────────────────────┐
│  Check for existing attendance        │
│  Create/Update attendance record      │
│  Return success/error                 │
└───────────────────────────────────────┘
          │
          ▼
Step 5: Backend Response
┌───────────────────────────────────────┐
│  Format response                      │
│  Send back to frontend                │
│  Include attendance data              │
└───────────────────────────────────────┘
          │
          ▼
Step 6: Frontend Updates
┌───────────────────────────────────────┐
│  Show success message                 │
│  Update UI state                      │
│  Refresh attendance list              │
└───────────────────────────────────────┘
          │
          ▼
Step 7: User Sees Result
┌───────────────────────────────────────┐
│  "Attendance marked successfully"     │
│  Updated attendance display           │
│  Ready for next action                │
└───────────────────────────────────────┘
```

---

## 🌐 Deployment Environments

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                              │
│  ─────────────────────────────                              │
│  Location: Your Computer                                    │
│  Frontend: http://localhost:5173                            │
│  Backend:  http://localhost:5000                            │
│  Database: Local MongoDB OR MongoDB Atlas                   │
│  Purpose:  Development & Testing                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ git push
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION                               │
│  ────────────────────────                                   │
│  Location: Cloud Services                                   │
│  Frontend: https://teacher-attendance.vercel.app            │
│  Backend:  https://teacher-attendance-api.onrender.com      │
│  Database: MongoDB Atlas (Cloud)                            │
│  Purpose:  Live School Use                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Time Breakdown

```
┌────────────────────────────────────────────────────────┐
│  Task                        │  Time      │  Waiting  │
├────────────────────────────────────────────────────────┤
│  MongoDB Atlas Setup         │  3 min     │  2 min    │
│  Render Backend Deploy       │  2 min     │  8 min    │
│  Vercel Frontend Deploy      │  2 min     │  3 min    │
│  Connect Services            │  2 min     │  2 min    │
│  Create Admin User           │  3 min     │  0 min    │
├────────────────────────────────────────────────────────┤
│  TOTAL                       │ 12 min     │ 15 min    │
│                              │            │           │
│  Active Work: 12 minutes                              │
│  Waiting Time: 15 minutes                             │
│  Total Time: ~27 minutes                              │
└────────────────────────────────────────────────────────┘
```

---

## 💡 Tips for Success

### ✅ DO:
- Follow steps in exact order (Database → Backend → Frontend)
- Save all URLs and credentials as you go
- Test each step before moving to next
- Wait for deployments to complete
- Check logs if something fails

### ❌ DON'T:
- Skip MongoDB Atlas setup (backend needs it)
- Deploy frontend before backend (no API to connect to)
- Forget to add `/api` to VITE_API_URL
- Add trailing slash to FRONTEND_URL
- Use weak passwords for production

---

## 🔍 Monitoring & Logs

```
┌─────────────────────────────────────────────────────────┐
│  Where to Find Logs                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel):                                     │
│  Dashboard → Project → Deployments → View Logs         │
│                                                          │
│  Backend (Render):                                      │
│  Dashboard → Service → Logs Tab                        │
│                                                          │
│  Database (MongoDB):                                    │
│  Atlas → Cluster → Metrics → Real-time              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Scaling Path

```
Current: FREE Tier
│
├── Suitable for: 50-100 teachers
├── Storage: 512MB database
├── Response: First load 30-60s (wake up)
└── Cost: $0/month

        │
        │ When needed:
        ▼

Upgrade: PAID Tier ($16/month)
│
├── Render Pro: $7/month
│   ✓ No sleep time
│   ✓ Instant response
│   ✓ More resources
│
├── MongoDB M10: $9/month
│   ✓ 2GB storage
│   ✓ Automated backups
│   ✓ Better performance
│
└── Vercel: Still FREE
    ✓ More than enough for frontend
```

---

## 🎯 Success Indicators

After deployment, you should see:

✅ **Frontend**: 
- Login page loads < 2 seconds
- Professional design
- No console errors

✅ **Backend**: 
- /api/health returns OK
- First load: 30-60s
- Subsequent: < 2s

✅ **Database**: 
- Connection successful
- Collections created
- Admin user exists

✅ **Integration**: 
- Login works
- Dashboard loads
- All features functional

---

## 🆘 Quick Troubleshooting

```
Problem: "Cannot connect to server"
Solution: Wait 60 seconds (backend waking up)

Problem: "CORS error"
Solution: Check FRONTEND_URL in Render (no trailing slash)

Problem: "Invalid credentials"
Solution: Verify admin user in MongoDB

Problem: "Build failed"
Solution: Check logs, verify Node version, npm install

Problem: "Database connection failed"
Solution: Check MONGODB_URI, verify IP whitelist
```

---

**Ready to deploy?** Follow: [DEPLOY_NOW.md](./DEPLOY_NOW.md)

**Need details?** Read: [START_DEPLOYMENT_HERE.md](./START_DEPLOYMENT_HERE.md)

---

**Status**: ✅ Ready to deploy  
**Time**: ~27 minutes  
**Cost**: $0/month  
**Difficulty**: Easy
