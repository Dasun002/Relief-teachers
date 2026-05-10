# Quick Start Guide - Teacher Attendance System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ MongoDB Atlas connected

---

## 1. Access the System

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 2. Login

**Admin Credentials**:
- **Username**: `admin`
- **Password**: `admin123`

Click "Login" button.

---

## 3. Mark Teacher Absent

### Option A: Full Day Absence
1. Click **"Mark Attendance"** in navigation bar
2. Select a date (weekday)
3. Find a teacher
4. Click **"Mark Absent"** button
5. Confirm

### Option B: Period-Based Absence
1. Click **"Mark Attendance"** in navigation bar
2. Select a date (weekday)
3. Find a teacher
4. Click **"Mark by Period"** button
5. Check the periods (e.g., Period 1, Period 2)
6. Click **"Submit Attendance"**

---

## 4. Allocate Substitute Teacher

1. Click **"Allocate Substitute"** in navigation bar
2. Select the same date
3. You'll see the absent teacher with their schedule
4. For each uncovered period (yellow button):
   - Click **"Allocate Substitute"**
   - Select a free teacher from the list
   - Click **"Select"**
   - Review the confirmation
   - Click **"Confirm Allocation"**
5. Period now shows green badge: **"✓ Covered by [Name]"**

---

## 5. Change Substitute (Optional)

1. On the substitution page with covered periods
2. Click the teal **"Change Substitute"** button
3. Select a different teacher
4. Click **"Select"**
5. Review the confirmation (shows "Change" header)
6. Click **"Confirm Change"**
7. Updated substitute name appears

---

## Visual Guide

### Status Indicators

| Color | Button/Badge | Meaning |
|-------|-------------|---------|
| 🟡 Yellow | "Allocate Substitute" | Period needs coverage |
| 🟢 Green | "✓ Covered by [Name]" | Period has coverage |
| 🔵 Teal | "Change Substitute" | Can change substitute |

### Navigation

**Top Navigation Bar**:
- Dashboard
- Mark Attendance
- Allocate Substitute
- Timetable
- Teachers
- User Menu (Settings, Help, Logout)

**Breadcrumbs** (below navigation):
- Shows current location
- Click to navigate back

---

## Common Workflows

### Workflow 1: Handle Single Period Absence
```
Mark Attendance → Select Date → Mark by Period → Select Period 1 
→ Submit → Allocate Substitute → Select Date → Allocate Substitute 
→ Select Teacher → Confirm
```
**Time**: ~2 minutes

### Workflow 2: Handle Full Day Absence
```
Mark Attendance → Select Date → Mark Absent → Confirm 
→ Allocate Substitute → Select Date → Allocate for each period
```
**Time**: ~5 minutes (depending on number of periods)

### Workflow 3: Change Substitute
```
Allocate Substitute → Select Date → Change Substitute 
→ Select New Teacher → Confirm Change
```
**Time**: ~1 minute

---

## Tips & Tricks

### 💡 Quick Tips

1. **Use Navigation Bar**: One-click access to any page
2. **Check Coverage**: Green badges show covered periods
3. **Any Teacher Can Substitute**: Subject expertise not required
4. **Change Anytime**: Can change substitute after allocation
5. **Mobile Friendly**: Works on phones and tablets

### ⚠️ Important Notes

- Only weekdays (Monday-Friday) are allowed
- Teacher must be marked absent before allocating substitute
- Substitute teacher must be free during that period
- Can't assign same teacher as substitute for themselves

### 🔍 Troubleshooting

**Problem**: No free teachers available  
**Solution**: All teachers are busy or absent. Try different period or date.

**Problem**: Can't confirm allocation  
**Solution**: Make sure teacher is marked absent for that specific period.

**Problem**: "Change Substitute" button not showing  
**Solution**: Period must have coverage first. Allocate a substitute first.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal/dialog |
| `Tab` | Navigate form fields |
| `Enter` | Submit form |

---

## Mobile Usage

### On Mobile Devices:
1. Tap **☰** (hamburger menu) in top-left
2. Select page from menu
3. Tap outside menu to close
4. All features work the same as desktop

---

## Need Help?

### Documentation
- **Complete Guide**: `COMPLETE_SYSTEM_SUMMARY.md`
- **Testing Guide**: `CHANGE_SUBSTITUTE_TESTING_GUIDE.md`
- **Navigation Guide**: `HOW_TO_USE_NEW_NAVIGATION.md`

### Support
- Check browser console for errors (F12)
- Review backend logs for API issues
- Refer to troubleshooting section in documentation

---

## Quick Reference

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Login**: http://localhost:5173/login

### Credentials
- **Admin**: admin / admin123

### Server Commands
```bash
# Start backend
cd backend && npm run dev

# Start frontend  
cd frontend && npm run dev

# Run tests
cd frontend && npx playwright test
```

---

## Feature Checklist

Use this checklist to verify everything works:

- [ ] Can login with admin credentials
- [ ] Can navigate using top navigation bar
- [ ] Can mark teacher absent (full day)
- [ ] Can mark teacher absent (by period)
- [ ] Can see absent teachers on substitution page
- [ ] Can allocate substitute teacher
- [ ] Can see green coverage badge
- [ ] Can click "Change Substitute" button
- [ ] Can change to different substitute
- [ ] Can see updated substitute name
- [ ] Navigation breadcrumbs work
- [ ] Mobile menu works (if on mobile)

---

## Success!

You're now ready to use the Teacher Attendance System! 🎉

**Next Steps**:
1. Try marking a teacher absent
2. Allocate a substitute
3. Try changing the substitute
4. Explore other features

**Remember**: 
- Any free teacher can substitute (subject doesn't matter)
- You can change substitutes anytime
- System validates everything automatically

---

**Happy Managing!** 📚✨

For detailed information, see `COMPLETE_SYSTEM_SUMMARY.md`
