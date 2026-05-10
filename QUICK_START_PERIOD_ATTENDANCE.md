# Quick Start Guide - Period-Based Attendance

## 🚀 Ready to Test!

Both servers are running and the new period-based attendance system is ready!

---

## 📍 Access the Application

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:5000

---

## 🔐 Login Credentials

**Username:** `admin`  
**Password:** `admin123`

---

## 🎯 How to Use Period-Based Attendance

### Step 1: Navigate to Attendance
1. Open http://localhost:5173
2. Login with admin credentials
3. Click **"Attendance"** from the dashboard

### Step 2: Select Period-Based Attendance Tab
1. You'll see 3 tabs at the top
2. Click **"📅 Period-Based Attendance"** (first tab)

### Step 3: Select Date
1. Choose a **weekday date** (Monday-Friday)
2. **Example:** Monday, May 12, 2026
3. ⚠️ **Don't use Saturday or Sunday!**

### Step 4: Select Teacher
1. You'll see a grid of all teachers
2. Click on any teacher card
3. Their schedule will load automatically

### Step 5: Mark Period Attendance
You have several options:

**Option A: Mark Specific Periods Absent**
1. Check the checkbox next to each period you want to mark absent
2. Substitute dropdowns will appear automatically
3. Select a substitute for each absent period
4. Click "Allocate Substitute" for each period

**Option B: Mark All Periods Absent (Full Day)**
1. Click the **"Mark All Periods Absent"** button
2. All periods will be checked
3. Substitute dropdowns will appear for all periods
4. Allocate substitutes as needed

**Option C: Mark All Periods Present**
1. Click the **"Mark All Periods Present"** button
2. All checkboxes will be unchecked

### Step 6: Save Attendance
1. Click the **"Save Attendance"** button at the bottom
2. You'll see a success message
3. The form will reset

---

## 🎨 Visual Guide

### What You'll See:

```
┌─────────────────────────────────────────┐
│ Period-Based Attendance                 │
│ Select a teacher to mark attendance     │
├─────────────────────────────────────────┤
│                                         │
│ Select Teacher:                         │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Mr. John │ │ Ms. Jane │ │ Mr. Bob  ││
│ │ Smith    │ │ Doe      │ │ Wilson   ││
│ │ Math,    │ │ English, │ │ Science, ││
│ │ Physics  │ │ History  │ │ Biology  ││
│ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
```

After selecting a teacher:

```
┌─────────────────────────────────────────┐
│ Mr. John Smith                          │
│ Subjects: Math, Physics                 │
│                                         │
│ [Mark All Periods Absent] [Mark All Present] │
│                                         │
│ ☑ Period 1 (08:00-08:45)    [ABSENT]   │
│   Class: 6A | Subject: Math             │
│   Select Substitute: [Ms. Jane Doe ▼]  │
│   [Allocate Substitute]                 │
│                                         │
│ ☐ Period 2 (08:45-09:30)    [PRESENT]  │
│   Class: 7B | Subject: Physics          │
│                                         │
│ ☑ Period 3 (09:30-10:15)    [ABSENT]   │
│   Class: 8A | Subject: Math             │
│   Select Substitute: [Mr. Bob Wilson ▼]│
│   [Allocate Substitute]                 │
│                                         │
│ [Save Attendance]                       │
│                                         │
│ Summary: Absent for 2 periods: 1, 3    │
└─────────────────────────────────────────┘
```

---

## ✅ Expected Behavior

### When You Mark a Period Absent:
1. ✅ Checkbox becomes checked
2. ✅ Period badge turns red showing "ABSENT"
3. ✅ Yellow box appears below with substitute selection
4. ✅ Dropdown loads with available teachers
5. ✅ You can select and allocate a substitute

### When You Mark a Period Present:
1. ✅ Checkbox becomes unchecked
2. ✅ Period badge turns green showing "PRESENT"
3. ✅ Substitute selection box disappears

### When You Allocate a Substitute:
1. ✅ Success toast appears
2. ✅ Green checkmark replaces the dropdown
3. ✅ Message: "✅ Substitute already allocated for this period"

### When You Save Attendance:
1. ✅ Success toast appears
2. ✅ Form resets to teacher selection
3. ✅ You can select another teacher

---

## 🎯 Test Scenarios

### Scenario 1: Full Day Absence
1. Select a teacher
2. Click "Mark All Periods Absent"
3. Allocate substitutes for all periods
4. Click "Save Attendance"
5. **Expected:** "marked as absent for full day"

### Scenario 2: Partial Day Absence
1. Select a teacher
2. Check only periods 1, 3, and 5
3. Allocate substitutes for those periods
4. Click "Save Attendance"
5. **Expected:** "marked as absent for 3 period(s)"

### Scenario 3: No Absence
1. Select a teacher
2. Don't check any periods (or click "Mark All Present")
3. Click "Save Attendance"
4. **Expected:** "marked as present for all periods"

### Scenario 4: Change Mind
1. Select a teacher
2. Check period 1 (mark absent)
3. Uncheck period 1 (mark present)
4. **Expected:** Substitute dropdown disappears

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Attendance can only be recorded for weekdays"
**Cause:** You selected Saturday or Sunday  
**Solution:** Select a weekday (Monday-Friday)

### Issue 2: "No teachers available for this period"
**Cause:** All teachers are busy during that period  
**Solution:** This is expected! Some periods may have no available substitutes

### Issue 3: "Teacher is not marked absent for period X"
**Cause:** Trying to allocate substitute without marking period absent  
**Solution:** Check the period checkbox first, then allocate

### Issue 4: Dropdown is empty
**Cause:** Loading or no teachers available  
**Solution:** Wait for loading to complete, or accept that no substitutes are available

---

## 🔄 Comparison with Old System

### Old "Quick Attendance" Tab:
- Whole-day attendance only
- Mark teacher present/absent for entire day
- Shows all periods if absent
- Still available for quick marking

### New "Period-Based Attendance" Tab:
- Period-by-period attendance
- Mark specific periods absent
- Only shows substitutes for absent periods
- More flexible and realistic

**Both tabs work!** Use whichever fits your needs.

---

## 📊 What to Look For

### Good Signs ✅
- Teacher cards load quickly
- Schedule appears when teacher is selected
- Checkboxes respond immediately
- Substitute dropdowns load within 1-2 seconds
- Allocation succeeds with success toast
- Save attendance shows success message

### Warning Signs ⚠️
- Red error toasts (check error message)
- Loading that never completes (check network)
- Empty dropdowns (may be no available teachers)
- Weekend date error (select weekday)

---

## 🎊 Features to Try

### 1. Quick Actions
- Click "Mark All Periods Absent"
- Click "Mark All Periods Present"
- See how fast it updates!

### 2. Individual Period Control
- Check and uncheck individual periods
- Watch substitute dropdowns appear/disappear
- Very responsive!

### 3. Substitute Allocation
- Select different substitutes for different periods
- Allocate them one by one
- See the green checkmarks!

### 4. Real-time Summary
- Watch the summary at the bottom update
- Shows count and list of absent periods
- Color-coded for easy reading

### 5. Back Navigation
- Click "← Back to Teacher List"
- Select a different teacher
- Smooth transition!

---

## 🐛 If Something Goes Wrong

### Check These:

1. **Backend Running?**
   - Should see: "Server is running on port 5000"
   - Check terminal for errors

2. **Frontend Running?**
   - Should see: "Local: http://localhost:5173/"
   - Check browser console (F12)

3. **Logged In?**
   - Username: admin
   - Password: admin123

4. **Weekday Date?**
   - Monday-Friday only
   - Not Saturday or Sunday

5. **Network Tab (F12)?**
   - Check for failed requests
   - Look for error responses

---

## 📝 Testing Checklist

- [ ] Can access http://localhost:5173
- [ ] Can login as admin
- [ ] Can see "Period-Based Attendance" tab
- [ ] Can select a weekday date
- [ ] Can see list of teachers
- [ ] Can click on a teacher
- [ ] Schedule loads successfully
- [ ] Can check/uncheck period checkboxes
- [ ] Substitute dropdowns appear when period is marked absent
- [ ] Can select substitute from dropdown
- [ ] Can allocate substitute successfully
- [ ] Can use "Mark All Absent" button
- [ ] Can use "Mark All Present" button
- [ ] Can save attendance successfully
- [ ] Success toast appears
- [ ] Form resets after save
- [ ] Can select another teacher

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ You can mark specific periods absent
2. ✅ Substitute dropdowns load automatically
3. ✅ You can allocate substitutes per period
4. ✅ Save attendance succeeds
5. ✅ No errors in console
6. ✅ All toast notifications appear correctly

---

## 🚀 Ready to Test!

**Everything is set up and ready to go!**

1. Open http://localhost:5173
2. Login as admin/admin123
3. Go to Attendance page
4. Click "Period-Based Attendance" tab
5. Select a weekday date
6. Start marking attendance!

---

## 📞 Need Help?

If you encounter any issues:

1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify you're using a weekday date
4. Make sure you're logged in as admin
5. Try refreshing the page

---

**Happy Testing! 🎉**

The period-based attendance system is fully functional and ready for use!
