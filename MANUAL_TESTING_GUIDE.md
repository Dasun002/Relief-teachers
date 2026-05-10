# Manual Testing Quick Start Guide

## Prerequisites

✅ Backend server running on http://localhost:5000  
✅ Frontend server running on http://localhost:5173  
✅ Admin user created (username: admin, password: admin123)

## Quick Test Sequence

### 1. Login Test (2 minutes)

1. Open http://localhost:5173
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login"
4. ✅ Should redirect to dashboard
5. ✅ Should see navigation menu

### 2. Import Timetable (3 minutes)

1. Click "Timetable" in navigation
2. Click "Import Timetable" button
3. Select file: `for the data base.xml`
4. Click "Upload"
5. ✅ Should see progress indicator
6. ✅ Should see success message with import count
7. ✅ Should see timetable entries in grid

### 3. Mark Attendance (2 minutes)

1. Click "Attendance" in navigation
2. Select today's date
3. Toggle some teachers to "Absent"
4. Toggle some teachers to "Present"
5. Click "Submit Attendance"
6. ✅ Should see success message
7. Refresh page
8. ✅ Attendance should be saved

### 4. Allocate Substitute (3 minutes)

1. Click "Substitution" in navigation
2. Select today's date
3. ✅ Should see list of absent teachers
4. Click on an absent teacher
5. ✅ Should see their schedule with periods
6. Click "Allocate Substitute" for a period
7. ✅ Should see list of free teachers
8. Select a free teacher
9. Click "Assign Substitute"
10. ✅ Should see success message
11. ✅ Period should now show as covered

### 5. View Reports (2 minutes)

1. Click "Attendance History"
2. Select date range (last 7 days)
3. ✅ Should see attendance records
4. Click "Substitution Summary"
5. Select today's date
6. ✅ Should see substitution assignments

### 6. Responsive Design Test (5 minutes)

1. Open browser DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test these sizes:
   - iPhone SE (375px) - ✅ Should be usable
   - iPad (768px) - ✅ Should adapt layout
   - Desktop (1920px) - ✅ Should use full width
4. ✅ Navigation should collapse to hamburger on mobile
5. ✅ Buttons should be touch-friendly
6. ✅ Tables should scroll horizontally if needed

### 7. Error Handling Test (3 minutes)

1. Try to mark attendance for a weekend date
   - ✅ Should show error message
2. Logout and try to access dashboard directly
   - ✅ Should redirect to login
3. Try to login with wrong password
   - ✅ Should show error message
4. Try to allocate a busy teacher as substitute
   - ✅ Should show error message

## Total Time: ~20 minutes

## Expected Results

All checkmarks (✅) above should pass. If any fail, note the issue and report it.

## Common Issues

### Issue: "No teachers found"
**Solution:** Import the XML file first (Step 2)

### Issue: "No absent teachers"
**Solution:** Mark some teachers as absent (Step 3)

### Issue: "No free teachers"
**Solution:** This is normal if all teachers are scheduled or absent for that period

### Issue: "Cannot login"
**Solution:** Run `cd backend && node createTestUser.js` to create admin user

## Browser Testing

Test on at least 2 browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing

Test on at least 1 mobile device:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)

## Report Issues

If you find any issues, note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Browser and screen size
5. Any error messages

## Success Criteria

✅ All workflows complete without errors  
✅ UI is responsive on all screen sizes  
✅ Error messages are clear and helpful  
✅ Data persists after page refresh  
✅ System is intuitive to use

---

**Ready to test?** Start with Step 1 above! 🚀
