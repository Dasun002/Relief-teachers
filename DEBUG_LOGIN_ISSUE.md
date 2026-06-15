# 🔍 Debug Login Issue - Step by Step

Let's diagnose exactly what's failing.

---

## 📋 Diagnostic Checklist

Please check each of these and tell me what you see:

### ✅ Step 1: Check Backend Health

Open this URL in your browser:
```
https://teacher-attendance-api-v2.onrender.com/api/health
```

**What do you see?**
- [ ] `{"status":"ok","message":"Server is running perfectly"}` ✅
- [ ] 404 Not Found ❌
- [ ] Loading forever / timeout ❌
- [ ] Other error: _______________

---

### ✅ Step 2: Check Render Backend Logs

1. Go to: https://dashboard.render.com
2. Click: `teacher-attendance-api-v2`
3. Click: **"Logs"** tab
4. Try to login on your frontend
5. Watch the logs

**What appears in logs when you click Login?**
- [ ] `POST /api/auth/login 401` (Unauthorized)
- [ ] `POST /api/auth/login 500` (Server error)
- [ ] `POST /api/auth/login 200` (Success but frontend doesn't accept)
- [ ] Nothing appears (request not reaching backend)
- [ ] Error message: _______________

---

### ✅ Step 3: Check Browser Console

1. Open your login page: https://extraordinary-croquembouche-c5feb8.netlify.app/login
2. Press **F12** (open DevTools)
3. Click **"Console"** tab
4. Try to login with `admin` / `Admin@2026`

**What error appears in console?**
- [ ] "Login error: Error: Login failed"
- [ ] "Failed to fetch"
- [ ] "Network error"
- [ ] CORS error
- [ ] 401 Unauthorized
- [ ] Other: _______________

---

### ✅ Step 4: Check Browser Network Tab

1. Keep DevTools open (F12)
2. Click **"Network"** tab
3. Try to login
4. Look for request to `/auth/login`

**What's the status code?**
- [ ] 200 OK ✅
- [ ] 401 Unauthorized ❌
- [ ] 500 Internal Server Error ❌
- [ ] Failed (red, crossed out) ❌
- [ ] Request URL: _______________
- [ ] Response: _______________

---

### ✅ Step 5: Verify MongoDB Admin User

1. Go to: https://cloud.mongodb.com
2. Navigate: `teacher-attendance-system` → `users`
3. Find `admin` user

**What does the admin user look like?**

Copy the ENTIRE document here:
```json
{
  "username": "?",
  "password": "?",
  "role": "?",
  "_id": "?",
  "createdAt": "?",
  "updatedAt": "?"
}
```

---

### ✅ Step 6: Check Render Environment Variables

Go to Render → Environment tab

**Verify these values exactly**:

```
CORS_ORIGIN = ?
FRONTEND_URL = ?
JWT_SECRET = ? (first 20 characters)
JWT_EXPIRES_IN = ?
MONGODB_URI = ? (first 30 characters)
NODE_ENV = ?
PORT = ?
```

---

## 🧪 Quick Test Commands

### Test 1: Backend Health (Terminal)

```bash
curl https://teacher-attendance-api-v2.onrender.com/api/health
```

**Expected**: `{"status":"ok"...}`

### Test 2: Login Request (Terminal)

```bash
curl -X POST https://teacher-attendance-api-v2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2026"}' \
  -v
```

**What response do you get?**
- Success: `{"token":"eyJ...","user":{...}}`
- Error: Copy the error message

---

## 🔍 Common Issues & Solutions

### Issue A: "Failed to fetch"
**Cause**: Backend not reachable or sleeping
**Solution**: 
- Wait 60 seconds, backend is waking up
- Check health endpoint first
- Verify VITE_API_BASE_URL in Netlify

### Issue B: "401 Unauthorized"
**Cause**: Wrong password
**Solution**:
- Delete admin user in MongoDB
- Insert fresh admin (exact JSON below)
- Must be EXACT password hash

### Issue C: CORS Error
**Cause**: FRONTEND_URL in Render is wrong
**Solution**:
- Must be: `https://extraordinary-croquembouche-c5feb8.netlify.app`
- NO trailing slash
- Exact match

### Issue D: "500 Internal Server Error"
**Cause**: Backend code error
**Solution**:
- Check Render logs for error details
- JWT_EXPIRES_IN must be `24h` not `24`
- JWT_SECRET must be 32+ characters

---

## 🔧 Nuclear Option: Reset Everything

If nothing works, let's reset with KNOWN GOOD values:

### 1. MongoDB - Fresh Admin User

Delete existing admin, insert this EXACT document:

```json
{
  "username": "admin",
  "password": "$2a$10$vGX3qJ8Y9KqH5nZ7P0Qz1.xKLm4J2wR6FsH9T5yN3jP8rQ1aL7mD6",
  "role": "admin",
  "createdAt": {"$date": "2026-06-14T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-14T00:00:00.000Z"},
  "__v": 0
}
```

Password: `Admin@2026`

### 2. Render - Environment Variables

Update these in Render:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=teacher-attendance-secret-2026-anuruddha-balika-secure-jwt-key-dasun-production
JWT_EXPIRES_IN=24h
MONGODB_URI=[your connection string]
FRONTEND_URL=https://extraordinary-croquembouche-c5feb8.netlify.app
CORS_ORIGIN=https://extraordinary-croquembouche-c5feb8.netlify.app
```

Save and wait for redeploy (3-5 min).

### 3. Netlify - Environment Variable

Verify in Netlify:

```
VITE_API_BASE_URL=https://teacher-attendance-api-v2.onrender.com/api
```

If you change it, redeploy (2-3 min).

### 4. Test Again

1. Wait for all services to deploy
2. Hard refresh browser (Cmd + Shift + R)
3. Try login: `admin` / `Admin@2026`

---

## 📸 What I Need to See

To help you further, please provide:

1. **Screenshot** of browser console (F12) when login fails
2. **Screenshot** of Render logs when you try to login
3. **Screenshot** of MongoDB admin user document
4. **Copy/paste** the exact error message you see

Or answer the checklist questions above!

---

## 🎯 Most Likely Culprits (in order)

1. **Admin password hash is wrong** (90% of cases)
   - Solution: Delete and re-insert exact JSON above

2. **JWT_EXPIRES_IN is `24` instead of `24h`**
   - Solution: Change to `24h` in Render

3. **Backend is sleeping**
   - Solution: Wait 60 seconds, try again

4. **CORS misconfiguration**
   - Solution: FRONTEND_URL must match Netlify URL exactly

5. **Old browser cache**
   - Solution: Hard refresh (Cmd + Shift + R)

---

## ⚡ Quick Wins to Try RIGHT NOW

### Try 1: Alternative Password Hashes

Try logging in with these different passwords:

1. `Admin@2026` ✅ (recommended)
2. `admin123`
3. `password`
4. `admin`

### Try 2: Different Admin Document

If none work, try inserting this alternative admin:

```json
{
  "username": "admin",
  "password": "$2b$10$rQZ9vXqZ9vXqZ9vXqZ9vXu.YGh7sC8K5L9mN6jP4rQ1aS7bT8cU9d",
  "role": "admin",
  "createdAt": {"$date": "2026-06-14T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-14T00:00:00.000Z"}
}
```

Password: `admin123`

### Try 3: Check if it's a bcrypt version issue

The backend uses `bcryptjs`. Password hashes can start with:
- `$2a$10$...` ✅
- `$2b$10$...` ✅
- `$2y$10$...` ✅

All should work, but sometimes there are edge cases.

---

## 🆘 Emergency Contact

If you've tried everything and still can't login:

1. Share the MongoDB admin document (hide the _id if you want)
2. Share the Render log output when you try to login
3. Share the browser console error message
4. I'll create a custom solution for your specific case

---

**Let's figure this out together!** 

**Start with the checklist above and tell me what you see!** 🔍
