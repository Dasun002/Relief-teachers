# Period-Based Attendance - Manual Testing Guide

## 🎯 Purpose
This guide will help you manually test all features of the period-based attendance system to verify it works as expected.

---

## ✅ Pre-Test Checklist

Before starting, verify:
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] You have admin credentials (admin/admin123)
- [ ] Database has teachers with timetable data
- [ ] You're using a weekday date (Monday-Friday)

---

## 📋 Test Cases

### Test 1: Access Period-Based Attendance Tab
**Objective:** Verify the new tab is visible and accessible

**Steps:**
1. Open http://localhost:5173
2. Login with admin/admin123
3. Click "Attendance" from dashboard
4. Look for "📅 Period-Based Attendance" tab

**Expected Results:**
- ✅ Tab is visible
- ✅ Tab is active by default (highlighted)
- ✅ Page shows "Select a date to record attendance" message

**Pass/Fail:** ___________

---

### Test 2: Select Date and View Teachers
**Objective:** Verify teacher list loads after date selection

**Steps:**
1. Select a weekday date (e.g., Monday, May 12, 2026)
2. Wait 1-2 seconds

**Expected Results:**
- ✅ "Select Teacher:" heading appears
- ✅ Grid of teacher cards is displayed
- ✅ Each card shows teacher name and subjects
- ✅ Cards are clickable (hover effect)

**Number of teachers shown:** ___________

**Pass/Fail:** ___________

---

### Test 3: Select Teacher and Load Schedule
**Objective:** Verify teacher's schedule loads correctly

**Steps:**
1. Click on any teacher card
2. Wait 2-3 seconds for schedule to load

**Expected Results:**
- ✅ Teacher name appears in header
- ✅ "Back to Teacher List" button visible
- ✅ "Mark All Periods Absent" button visible
- ✅ "Mark All Periods Present" button visible
- ✅ Schedule displays with periods (if teacher has classes)
- ✅ Each period shows:
  - Period number and time
  - Class name
  - Subject
  - Checkbox (unchecked by default)
  - Green "PRESENT" badge

**Teacher selected:** ___________

**Number of periods:** ___________

**Pass/Fail:** ___________

---

### Test 4: Mark Single Period Absent
**Objective:** Verify marking a single period as absent

**Steps:**
1. Check the checkbox for Period 1
2. Wait 2-3 seconds

**Expected Results:**
- ✅ Checkbox becomes checked
- ✅ Badge changes from green "PRESENT" to red "ABSENT"
- ✅ Yellow box appears below the period
- ✅ "Select Substitute Teacher:" label appears
- ✅ Dropdown loads with available teachers OR
- ✅ "No teachers available" message appears
- ✅ Summary at bottom updates (e.g., "Absent for 1 period(s): 1")

**Substitute teachers available:** ___________

**Pass/Fail:** ___________

---

### Test 5: Select and Allocate Substitute
**Objective:** Verify substitute allocation works

**Steps:**
1. From Test 4, if dropdown has teachers:
2. Select a teacher from the dropdown
3. Click "Allocate Substitute" button
4. Wait 2-3 seconds

**Expected Results:**
- ✅ Button shows "Allocating..." with spinner
- ✅ Success toast appears (green notification)
- ✅ Toast message: "Substitute allocated: [Name] for Period [X]"
- ✅ Dropdown is replaced with green success message
- ✅ Message: "✅ Substitute already allocated for this period"

**Substitute allocated:** ___________

**Pass/Fail:** ___________

---

### Test 6: Mark Multiple Periods Absent
**Objective:** Verify multiple periods can be marked absent

**Steps:**
1. Go back to teacher list and select a different teacher
2. Check checkboxes for periods 1, 3, and 5
3. Wait for all dropdowns to load

**Expected Results:**
- ✅ All 3 checkboxes are checked
- ✅ All 3 periods show red "ABSENT" badge
- ✅ All 3 periods show substitute selection
- ✅ Each period loads its own list of available teachers
- ✅ Summary shows: "Absent for 3 period(s): 1, 3, 5"

**Pass/Fail:** ___________

---

### Test 7: Mark All Periods Absent (Quick Action)
**Objective:** Verify "Mark All Periods Absent" button works

**Steps:**
1. Select a teacher with multiple periods
2. Click "Mark All Periods Absent" button
3. Wait 3-4 seconds

**Expected Results:**
- ✅ ALL checkboxes become checked
- ✅ ALL periods show red "ABSENT" badge
- ✅ ALL periods show substitute selection
- ✅ Dropdowns load for all periods
- ✅ Summary shows all periods (e.g., "Absent for 5 period(s): 1, 2, 3, 4, 5")

**Total periods marked:** ___________

**Pass/Fail:** ___________

---

### Test 8: Mark All Periods Present (Quick Action)
**Objective:** Verify "Mark All Periods Present" button works

**Steps:**
1. From Test 7 (with all periods marked absent)
2. Click "Mark All Periods Present" button
3. Wait 1 second

**Expected Results:**
- ✅ ALL checkboxes become unchecked
- ✅ ALL periods show green "PRESENT" badge
- ✅ ALL substitute selections disappear
- ✅ Summary shows: "Present for all periods"

**Pass/Fail:** ___________

---

### Test 9: Toggle Period Status
**Objective:** Verify periods can be toggled between absent/present

**Steps:**
1. Check Period 1 (mark absent)
2. Wait for dropdown to load
3. Uncheck Period 1 (mark present)
4. Check Period 1 again (mark absent)

**Expected Results:**
- ✅ First check: Badge turns red, dropdown appears
- ✅ Uncheck: Badge turns green, dropdown disappears
- ✅ Second check: Badge turns red, dropdown appears again
- ✅ No errors or glitches

**Pass/Fail:** ___________

---

### Test 10: Save Attendance (Partial Absence)
**Objective:** Verify saving attendance with some periods absent

**Steps:**
1. Select a teacher
2. Mark periods 1 and 3 as absent
3. Allocate substitutes (if available)
4. Click "Save Attendance" button
5. Wait 2-3 seconds

**Expected Results:**
- ✅ Button shows "Saving Attendance..." with spinner
- ✅ Success toast appears
- ✅ Toast message mentions teacher name and period count
- ✅ Form resets to teacher selection screen
- ✅ Can select another teacher

**Success message:** ___________

**Pass/Fail:** ___________

---

### Test 11: Save Attendance (Full Day Absent)
**Objective:** Verify saving full day absence

**Steps:**
1. Select a teacher
2. Click "Mark All Periods Absent"
3. Click "Save Attendance"

**Expected Results:**
- ✅ Success toast appears
- ✅ Message indicates "full day" or "all periods"
- ✅ Form resets

**Pass/Fail:** ___________

---

### Test 12: Save Attendance (All Present)
**Objective:** Verify saving when teacher is present all day

**Steps:**
1. Select a teacher
2. Don't check any periods (or click "Mark All Present")
3. Click "Save Attendance"

**Expected Results:**
- ✅ Success toast appears
- ✅ Message indicates "present for all periods"
- ✅ Form resets

**Pass/Fail:** ___________

---

### Test 13: Weekend Date Validation
**Objective:** Verify weekend dates are rejected

**Steps:**
1. Select Saturday, May 9, 2026
2. Select a teacher
3. Mark a period absent
4. Click "Save Attendance"

**Expected Results:**
- ✅ Error toast appears (red notification)
- ✅ Error message: "Attendance can only be recorded for weekdays (Monday-Friday)"
- ✅ Form does NOT reset
- ✅ Can change date and try again

**Pass/Fail:** ___________

---

### Test 14: Teacher with No Scheduled Periods
**Objective:** Verify handling of teachers with no classes

**Steps:**
1. Try to find a teacher with no scheduled periods for the selected day
2. If found, click "Save Attendance"

**Expected Results:**
- ✅ Message: "No classes scheduled for [Day]"
- ✅ "Save Attendance" button still visible
- ✅ Can save attendance (saves as present)
- ✅ Success toast appears

**Pass/Fail:** ___________

---

### Test 15: No Available Substitutes
**Objective:** Verify handling when no substitutes are available

**Steps:**
1. Mark a period absent during a busy time
2. Check the substitute section

**Expected Results:**
- ✅ Red warning box appears
- ✅ Message: "⚠️ No teachers available for this period"
- ✅ No dropdown shown
- ✅ Can still save attendance (without allocating substitute)

**Pass/Fail:** ___________

---

### Test 16: Back Navigation
**Objective:** Verify back button works correctly

**Steps:**
1. Select a teacher
2. Mark some periods absent
3. Click "← Back to Teacher List"
4. Select a different teacher

**Expected Results:**
- ✅ Returns to teacher selection screen
- ✅ Previous selections are cleared
- ✅ Can select a different teacher
- ✅ New teacher's schedule loads correctly

**Pass/Fail:** ___________

---

### Test 17: Loading States
**Objective:** Verify loading indicators appear correctly

**Steps:**
1. Select a teacher (watch for loading)
2. Mark a period absent (watch for loading)
3. Allocate substitute (watch for loading)
4. Save attendance (watch for loading)

**Expected Results:**
- ✅ "Loading schedule..." appears when loading teacher
- ✅ "Loading available teachers..." appears when loading substitutes
- ✅ "Allocating..." appears on button during allocation
- ✅ "Saving Attendance..." appears on button during save
- ✅ Spinners are visible during loading

**Pass/Fail:** ___________

---

### Test 18: Summary Updates in Real-Time
**Objective:** Verify summary updates as periods are checked/unchecked

**Steps:**
1. Select a teacher with multiple periods
2. Check Period 1 - observe summary
3. Check Period 3 - observe summary
4. Uncheck Period 1 - observe summary
5. Check Period 5 - observe summary

**Expected Results:**
- ✅ Summary updates immediately after each change
- ✅ Shows correct count of absent periods
- ✅ Lists correct period numbers
- ✅ Color-coded (green=all present, yellow=partial, red=all absent)

**Pass/Fail:** ___________

---

### Test 19: Multiple Teachers in Sequence
**Objective:** Verify can process multiple teachers without issues

**Steps:**
1. Select Teacher A, mark periods, save
2. Select Teacher B, mark periods, save
3. Select Teacher C, mark periods, save

**Expected Results:**
- ✅ Each teacher processes independently
- ✅ No data carries over between teachers
- ✅ All saves succeed
- ✅ No errors or glitches

**Pass/Fail:** ___________

---

### Test 20: Browser Console Check
**Objective:** Verify no JavaScript errors

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform various actions (select teacher, mark absent, allocate, save)
4. Check for errors

**Expected Results:**
- ✅ No red error messages
- ✅ Only info/log messages (blue/gray)
- ✅ API calls succeed (check Network tab)

**Errors found:** ___________

**Pass/Fail:** ___________

---

## 📊 Test Summary

### Overall Results

**Total Tests:** 20

**Passed:** _____ / 20

**Failed:** _____ / 20

**Skipped:** _____ / 20

**Pass Rate:** _____% 

---

### Critical Issues Found

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

### Minor Issues Found

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

### Suggestions for Improvement

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

## ✅ Sign-Off

**Tester Name:** ___________________________________________

**Date:** ___________________________________________

**Time Spent:** ___________________________________________

**Overall Assessment:**
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes
- [ ] Not ready

**Comments:**
___________________________________________
___________________________________________
___________________________________________

---

## 📸 Screenshots

Please attach screenshots of:
1. Teacher selection screen
2. Schedule with periods marked absent
3. Substitute dropdown with available teachers
4. Success toast after saving
5. Any errors encountered

---

**Testing Complete!** 🎉

Thank you for thoroughly testing the period-based attendance system!
