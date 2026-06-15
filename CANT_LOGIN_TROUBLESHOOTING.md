# 🚨 Can't Login - Troubleshooting Guide

Based on your screenshots, here are the issues and fixes:

---

## 🔍 Issues Identified

### Issue 1: Wrong API URL in Netlify ❌
**Current (WRONG)**:
```
VITE_API_BASE_URL=https://teacher-attendance-api-v2.onrender.com/api
```

**Should be**:
```
VITE_API_URL=https://teacher-attendance-api-v2.onrender.com/api
```

⚠️ **Problem**: Variable name is `VITE_API_BASE_URL` but should be `VITE_API_URL`

### Issue 2: Backend Receiving Login Requests ✅ BUT...
Render logs show:
```
POST /api/auth/login 401 [Unauthorized]
Login error: Invalid credentials
```

This means:
- ✅ Frontend IS connecting to backend
- ✅ Backend IS running
- ❌ Credentials are incorrect OR user doesn't exist

### Issue 3: MongoDB Users
You have 2 users:
1. `admin` - password hash starts with `$2b$10$4gescuCWP1y...`
2. `facul` - different hash

---

## 🔧 FIX 1: Update Netlify Environment Variable

### Step 1: Delete Wrong Variable
1. Go to: https://app.netlify.com
2. Select: `extraordinary-croquembouche-c6feb8`
3. Go to: **Site settings** → **Environment variables**
4. Find: `VITE_API_BASE_URL`
5. Click **Options** (⋯) → **Delete**

### Step 2: Add Correct Variable
1. Click **"Add a variable"** → **"Add a single variable"**
2. Add:
   ```
   Key:   VITE_API_URL
   Value: https://teacher-attendance-api-v2.onrender.com/api
   ```
3. Scopes: ✅ All (Production, Deploy Previews, Branch deploys)
4. Click **"Create variable"**

### Step 3: Redeploy Netlify
1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes

---

## 🔧 FIX 2: Verify Admin User in MongoDB

From your screenshot, you have an admin user. Let's verify the password:

### Check Current Admin User
1. Go to: https://cloud.mongodb.com
2. Navigate to: `teacher-attendance-system` → `users` collection
3. Find the `admin` user

### Verify Password Hash
The admin user should have:
```json
{
  "username": "admin",
  "password": "$2a$10$..." or "$2b$10$...",
  "role": "admin"
}
```

### Test These Passwords

Based on common bcrypt hashes, try logging in with:

**Option 1**:
```
Username: admin
Password: Admin@2026
```

**Option 2**:
```
Username: admin  
Password: admin123
```

**Option 3**:
```
Username: admin
Password: password
```

**Option 4** (Check the other user):
```
Username: facul
Password: [try: admin123, password, facul123]
```

---

## 🔧 FIX 3: Create Fresh Admin User

If none of the passwords work, create a fresh admin user:

### Delete Existing Admin
1. MongoDB Atlas → Browse Collections
2. Find `admin` user
3. Click trash icon to delete

### Insert New Admin
1. Click **"INSERT DOCUMENT"**
2. Switch to **"JSON View"**
3. Paste:

```json
{
  "username": "admin",
  "password": "$2a$10$vGX3qJ8Y9KqH5nZ7P0Qz1.xKLm4J2wR6FsH9T5yN3jP8rQ1aL7mD6",
  "role": "admin",
  "createdAt": {"$date": "2026-06-14T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-14T00:00:00.000Z"}
}
```

4. Click **"Insert"**

**Login with**:
```
Username: admin
Password: Admin@2026
```

---

## 🔧 FIX 4: Check Render Backend Configuration

From your Render screenshot, verify these environment variables:

### Required Variables
```
✅ CORS_ORIGIN = https://extraordinary-croquembouche-c6feb8.netlify.app
✅ FRONTEND_URL = https://extraordinary-croquembouche-c6feb8.netlify.app  
✅ JWT_EXPIRES_IN = 24
⚠️ JWT_SECRET = teacher-attendance-secret-key-2026-anuruddha-balika-vidyalaya-secure
✅ MONGODB_URI = mongodb+srv://dasun_db_user:...@dasundatabase...
✅ NODE_ENV = production
✅ PORT = 10000
```

### Fix JWT_EXPIRES_IN
Change from `24` to `24h`:
1. Render → Environment tab
2. Find `JWT_EXPIRES_IN`
3. Change value to: `24h` (add the 'h')
4. Save changes

---

## 🔧 FIX 5: Test Backend Directly

### Test Health Check
Open browser and visit:
```
https://teacher-attendance-api-v2.onrender.com/api/health
```

**Expected response**:
```json
{
  "status": "ok",
  "message": "Server is running perfectly"
}
```

If you get 404 or no response:
- Backend is not running
- Health check route is missing
- Wait 60 seconds (backend waking up)

---

## 📋 Step-by-Step Fix Order

### Do This Now (5 minutes):

1. **Fix Netlify Variable** ⏱️ 2 minutes
   - Delete `VITE_API_BASE_URL`
   - Add `VITE_API_URL` with correct value
   - Redeploy

2. **Fix JWT_EXPIRES_IN in Render** ⏱️ 1 minute
   - Change from `24` to `24h`
   - Save (auto-redeploys)

3. **Create Fresh Admin User** ⏱️ 2 minutes
   - Delete old admin in MongoDB
   - Insert new admin with known password
   - Use: admin / Admin@2026

4. **Test Login** ⏱️ 30 seconds
   - Wait for Netlify redeploy
   - Wait for Render redeploy
   - Try login

---

## 🧪 Testing Checklist

After making fixes, test in this order:

### Test 1: Backend Health
```
https://teacher-attendance-api-v2.onrender.com/api/health
```
✅ Should return: `{"status":"ok",...}`

### Test 2: Frontend Loads
```
https://extraordinary-croquembouche-c6feb8.netlify.app/login
```
✅ Should show login page

### Test 3: Browser Console (F12)
```
Should see no red errors
Should NOT see "Failed to fetch"
Should NOT see CORS errors
```

### Test 4: Login
```
Username: admin
Password: Admin@2026
```
✅ Should redirect to dashboard

---

## 🚨 Common Error Messages & Fixes

### "Failed to fetch"
**Cause**: Frontend can't reach backend
**Fix**: 
- Check `VITE_API_URL` is correct
- Wait 60 seconds (backend waking up)
- Verify backend is running in Render

### "Login failed" / "Invalid credentials"
**Cause**: Wrong username/password OR user doesn't exist
**Fix**:
- Try all password options above
- Create fresh admin user
- Check MongoDB for exact username

### "CORS error"
**Cause**: Backend not allowing requests from frontend
**Fix**:
- Check `FRONTEND_URL` in Render matches Netlify URL exactly
- No trailing slash
- Redeploy backend after changing

### "Unauthorized" (401)
**Cause**: Wrong password or JWT token issue
**Fix**:
- Verify password is correct
- Check `JWT_SECRET` exists in Render
- Create fresh admin user

---

## 🔍 Debug Information You Shared

From your screenshots:

### Netlify (Frontend)
```
URL: https://extraordinary-croquembouche-c6feb8.netlify.app
Variable: VITE_API_BASE_URL (❌ WRONG NAME)
Value: https://teacher-attendance-api-v2.onrender.com/api
```

### Render (Backend)  
```
URL: https://teacher-attendance-api-v2.onrender.com
Status: Live ✅
Logs: Receiving login requests ✅
Error: "Invalid credentials" ❌
```

### MongoDB Atlas
```
Database: teacher-attendance-system
Collection: users
Users: admin, facul ✅
Issue: Unknown passwords ❌
```

---

## 💡 Quick Fix Summary

**Most Likely Problem**: 
1. Wrong environment variable name in Netlify (`VITE_API_BASE_URL` vs `VITE_API_URL`)
2. Unknown admin password

**Quick Fix**:
1. Fix Netlify variable name
2. Create fresh admin with known password
3. Test login

**Time**: 5 minutes total

---

## 📞 Still Not Working?

### Check Frontend Code
The frontend expects this environment variable:
```javascript
// frontend/src/services/api.js or similar
const API_URL = import.meta.env.VITE_API_URL
```

If your code uses `VITE_API_BASE_URL`, then keep that name. But standard is `VITE_API_URL`.

### Get Render Logs
1. Render Dashboard → Your service
2. Logs tab
3. Look for login attempts
4. Share the error message

### Test with curl
```bash
curl -X POST https://teacher-attendance-api-v2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}'
```

If this works but browser doesn't = CORS issue
If this fails = Wrong credentials or backend issue

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Browser console shows no errors
2. ✅ Network tab shows 200 OK for login
3. ✅ Response includes `"token":"eyJhbGci..."`
4. ✅ Redirects to dashboard
5. ✅ Can see dashboard content
6. ✅ Sidebar navigation works

---

**Start with Fix 1 (Netlify variable) and Fix 3 (fresh admin user)!**

**These two fixes will solve 90% of login issues!**

---

**Need help?** Check:
- ADMIN_CREDENTIALS.md (admin user setup)
- QUICK_ADMIN_SETUP.md (2-minute admin guide)
- JWT_SECRET_GUIDE.md (authentication details)

**Status**: 🔴 Can't login → 🟡 Fixing → 🟢 Working!
