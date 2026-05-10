# Dashboard Issues - Diagnosis and Fixes

## Issues Identified

### 1. Teachers and Attendance Cards Not Clickable
**Root Cause:** The CSS had `pointer-events: none` on disabled cards, which was preventing clicks even when the cards should be enabled for admin users.

**Fix Applied:**
- Removed `pointer-events: none` from `.dashboard-card.disabled` in `Dashboard.css`
- Added error toast message when non-admin users try to access admin-only features
- The logic correctly checks if user is admin: `!card.adminOnly || user?.role === 'admin'`

### 2. Substitutions and Timetable Causing Automatic Logout
**Root Cause:** The API interceptor in `frontend/src/services/api.js` automatically logs out users on 401 (Unauthorized) responses. This happens when:
- The JWT token is expired
- The token is invalid or malformed
- The token is missing from the request

**Possible Causes:**
1. **Token Expiration:** JWT tokens expire after 24 hours (configured in backend/.env)
2. **Token Not Being Sent:** The request interceptor might not be attaching the token properly
3. **Backend Authentication Issue:** The backend might be rejecting valid tokens

## Debugging Steps Added

### 1. Frontend Logging
Added console.log statements to track:
- User object in AuthContext when loaded from localStorage
- User object in Dashboard component
- API errors and 401 responses
- Token presence in requests

### 2. How to Debug

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Clear localStorage and login again:**
   ```javascript
   localStorage.clear()
   ```
3. **Check what's stored after login:**
   ```javascript
   console.log('Token:', localStorage.getItem('token'))
   console.log('User:', localStorage.getItem('user'))
   ```
4. **Navigate to Dashboard and check console for:**
   - "AuthContext - Stored token: exists/missing"
   - "AuthContext - Parsed user: {object}"
   - "Dashboard - user object: {object}"
   - "Dashboard - user role: admin"

5. **Click on Substitutions or Timetable and watch for:**
   - "API Error: 401 ..."
   - "401 Unauthorized - Logging out"
   - Error details showing why authentication failed

## Expected Behavior

### For Admin Users:
- All 4 cards (Teachers, Attendance, Substitutions, Timetable) should be clickable
- No "admin only" badges should appear
- Clicking any card should navigate to that page
- No automatic logout should occur

### For Regular Users:
- Teachers and Attendance cards should show "admin only" badge and be slightly dimmed
- Clicking Teachers or Attendance should show error toast
- Substitutions and Timetable should be fully accessible

## Testing Checklist

- [ ] Login as admin user
- [ ] Verify Dashboard shows "Welcome, admin (admin)"
- [ ] Verify all 4 cards are fully visible (no dimming)
- [ ] Click Teachers card - should navigate to /teachers
- [ ] Click Attendance card - should navigate to /attendance
- [ ] Click Substitutions card - should navigate to /substitutions (NOT logout)
- [ ] Click Timetable card - should navigate to /timetable (NOT logout)
- [ ] Check browser console for any errors

## If Issues Persist

### Check Backend
1. Verify backend is running: `curl http://localhost:5000/api/auth/login`
2. Test authentication:
   ```bash
   # Login and get token
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # Use token to access protected route
   curl -X GET http://localhost:5000/api/timetable \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

### Check Frontend
1. Open browser DevTools > Network tab
2. Click on Substitutions or Timetable
3. Look for the API request
4. Check if Authorization header is present
5. Check the response status and body

### Common Issues

1. **Token Not Being Sent:**
   - Check if token exists in localStorage
   - Check if request interceptor is working
   - Verify Authorization header format: "Bearer TOKEN"

2. **Token Expired:**
   - Login again to get a fresh token
   - Check JWT_EXPIRES_IN in backend/.env (currently 24h)

3. **CORS Issues:**
   - Verify CORS_ORIGIN in backend/.env matches frontend URL
   - Check browser console for CORS errors

4. **User Object Not Loaded:**
   - Check localStorage.getItem('user') format
   - Should be valid JSON string
   - Should contain: _id, username, role, createdAt, updatedAt

## Files Modified

1. `frontend/src/pages/Dashboard.jsx` - Added error handling and debugging
2. `frontend/src/pages/Dashboard.css` - Removed pointer-events: none
3. `frontend/src/contexts/AuthContext.jsx` - Added debugging logs
4. `frontend/src/services/api.js` - Added error logging

## Next Steps

1. Test the application with the debugging enabled
2. Check browser console for the logged information
3. Share the console output if issues persist
4. Consider adding a token refresh mechanism if tokens expire frequently
