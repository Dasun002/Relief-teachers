# Frontend API Configuration Fix ✅

## Issue Identified
The frontend code had **hardcoded** `http://localhost:5000` URLs that would not work in production when deployed to Netlify.

## Files Fixed

### 1. `/frontend/src/services/api.js`
**Before:**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  ...
});
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  ...
});
```

### 2. `/frontend/src/contexts/AuthContext.jsx`
**Before:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  ...
});
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const response = await fetch(`${API_URL}/auth/login`, {
  ...
});
```

### 3. `/frontend/src/components/TimetableImport.jsx`
**Before:**
```javascript
const response = await fetch('http://localhost:5000/api/timetable/import', {
  ...
});
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const response = await fetch(`${API_URL}/timetable/import`, {
  ...
});
```

## Environment Variable Configuration

The `.env` file already has the correct configuration:
```env
VITE_API_BASE_URL=https://teacher-attendance-api-v2.onrender.com/api
```

## How It Works Now

1. **In Development**: If `VITE_API_BASE_URL` is not set, it falls back to `http://localhost:5000/api`
2. **In Production (Netlify)**: Uses the environment variable from Netlify settings or the `.env` file

## Next Steps

1. ✅ Code updated to use environment variables
2. 🔄 **Commit and push these changes to GitHub**
3. 🔄 **Netlify will automatically redeploy with the new code**
4. 🔄 **Set the environment variable in Netlify** (if not already set):
   - Go to Netlify Dashboard → Your Site → Site settings → Environment variables
   - Add: `VITE_API_BASE_URL` = `https://teacher-attendance-api-v2.onrender.com/api`

## Verification Commands

```bash
# Check all API URLs are using environment variables
grep -r "localhost:5000" frontend/src/

# The only results should be the fallback defaults (|| 'http://localhost:5000/api')
```

## Testing

After deployment:
1. Open the deployed Netlify site
2. Check browser console (F12) → Network tab
3. Try to login
4. Verify API calls go to: `https://teacher-attendance-api-v2.onrender.com/api/*`
5. Should NOT see any calls to `localhost:5000`

---

**Status**: ✅ All hardcoded URLs fixed - Ready to commit and deploy!
