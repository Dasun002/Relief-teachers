# Manual Test Guide: Change Substitute Feature

## Prerequisites
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 5173
- ✅ Database has teachers and timetable data
- ✅ Admin credentials: username "admin", password "admin123"

## Test Scenario: Change Substitute Teacher

### Step 1: Login and Setup
1. Open browser to `http://localhost:5173`
2. Login with admin credentials
3. Navigate to "Substitutions" page from navigation menu
4. Select today's date or a recent weekday

### Step 2: Mark Teacher Absent (if needed)
If no teachers are absent for the selected date:
1. Go to "Period Attendance" page
2. Select a teacher (e.g., "Miss Udakanda Sasini")
3. Select the same date
4. Mark specific periods as absent (e.g., periods 1, 2, 3)
5. Submit attendance
6. Return to "Substitutions" page

### Step 3: Allocate Initial Substitute
1. On Substitutions page, you should see the absent teacher listed
2. Find a period that shows "Allocate Substitute" button (yellow)
3. Click "Allocate Substitute"
4. **Expected**: Modal opens showing "Free Teachers" list
5. Select any free teacher from the list
6. **Expected**: Form shows "Confirm Substitution Allocation"
7. Review the details:
   - Absent Teacher: [Original teacher name]
   - Substitute Teacher: [Selected teacher name]
   - Class, Period, Subject details
8. Click "Confirm Allocation"
9. **Expected**: 
   - Success message: "Successfully allocated [Teacher] to cover [Absent Teacher]'s class"
   - Modal closes
   - Period now shows green badge: "✓ Covered by [Teacher Name]"
   - "Change Substitute" button appears (cyan/teal color)

### Step 4: Change the Substitute Teacher
1. Find the period you just allocated (should show green badge)
2. Click "Change Substitute" button (cyan/teal)
3. **Expected**: Modal opens showing "Free Teachers" list
4. Select a DIFFERENT free teacher from the list
5. **Expected**: Form shows "Change Substitute Teacher" (not "Confirm Substitution Allocation")
6. Review the details:
   - Absent Teacher: [Same as before]
   - Substitute Teacher: [NEW teacher name]
   - Class, Period, Subject: [Same as before]
7. Notice the button says "Confirm Change" (not "Confirm Allocation")
8. Click "Confirm Change"
9. **Expected**:
   - Success message: "Successfully changed substitute to [New Teacher Name]"
   - Modal closes
   - Period now shows: "✓ Covered by [NEW Teacher Name]"
   - "Change Substitute" button still available

### Step 5: Verify Change Persisted
1. Refresh the page (F5 or Cmd+R)
2. Select the same date
3. **Expected**: Period still shows the NEW substitute teacher
4. Click "Change Substitute" again
5. **Expected**: Can change to another teacher if needed

### Step 6: Test Error Handling
1. Click "Change Substitute" on a covered period
2. Try to select a teacher who is NOT free (has a class during that period)
3. **Expected**: Error message appears (teacher should not be in the free list)
4. If you somehow select an unavailable teacher:
   - **Expected**: Error: "Selected teacher is not available during this period"
   - Substitution remains unchanged

### Step 7: Test Multiple Changes
1. Change the same substitution 3-4 times in a row
2. **Expected**: Each change succeeds and updates the display
3. Verify the latest substitute teacher is shown

## Expected Results Summary

### ✅ Visual Indicators
- **Yellow button**: "Allocate Substitute" (no coverage)
- **Green badge**: "✓ Covered by [Teacher]" (has coverage)
- **Cyan button**: "Change Substitute" (modify coverage)

### ✅ Form Behavior
- **Create Mode**: "Confirm Substitution Allocation" + "Confirm Allocation"
- **Update Mode**: "Change Substitute Teacher" + "Confirm Change"

### ✅ Success Messages
- **Create**: "Successfully allocated [Teacher] to cover [Absent Teacher]'s class"
- **Update**: "Successfully changed substitute to [Teacher]"

### ✅ Data Persistence
- Changes persist after page refresh
- Database updated correctly
- Can change multiple times

## Troubleshooting

### Issue: "Change Substitute" button not appearing
**Solution**: 
- Verify period has coverage (green badge should show)
- Check browser console for errors
- Refresh the page

### Issue: Error when confirming change
**Possible Causes**:
1. Selected teacher is not actually free
   - **Check**: Teacher's timetable for that period
2. Backend validation failing
   - **Check**: Backend console logs
   - **Check**: Network tab in browser DevTools
3. Database connection issue
   - **Check**: Backend server is running
   - **Check**: MongoDB connection

### Issue: Changes not persisting
**Solution**:
- Check backend logs for save errors
- Verify MongoDB is running
- Check network requests completed successfully

## Browser Console Commands (for debugging)

```javascript
// Check current substitutions
fetch('http://localhost:5000/api/substitutions?date=2026-05-10', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(console.log);

// Check free teachers for a period
fetch('http://localhost:5000/api/teachers/free?date=2026-05-10&period=3&day=Monday', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(console.log);
```

## Test Data Example

### Sample Scenario
- **Date**: May 10, 2026 (Saturday - adjust to weekday)
- **Absent Teacher**: Miss Udakanda Sasini
- **Period**: 3 (10:30 AM - 11:10 AM)
- **Class**: 10A
- **Subject**: Mathematics
- **Initial Substitute**: Miss Perera Nimesha
- **Changed To**: Miss Fernando Chamari

### Expected Database Record (after change)
```json
{
  "_id": "...",
  "absentTeacher": "Miss Udakanda Sasini",
  "substituteTeacher": "Miss Fernando Chamari",
  "class": "10A",
  "period": 3,
  "date": "2026-05-10",
  "subject": "Mathematics",
  "createdAt": "2026-05-10T08:00:00.000Z",
  "updatedAt": "2026-05-10T08:15:00.000Z"
}
```

## Success Criteria
- ✅ Can allocate initial substitute
- ✅ "Change Substitute" button appears after allocation
- ✅ Can select different teacher when changing
- ✅ Form shows correct text for update mode
- ✅ Success message confirms the change
- ✅ UI updates to show new substitute
- ✅ Changes persist after refresh
- ✅ Can change multiple times
- ✅ Validation prevents invalid changes

## Completion
Once all steps pass, the feature is working correctly! 🎉

**Test Status**: Ready for manual testing
**Estimated Time**: 10-15 minutes
**Difficulty**: Easy
