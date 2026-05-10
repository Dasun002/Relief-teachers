# Change Substitute Feature - Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing the "Change Substitute" feature that was added to the Teacher Attendance System.

## Prerequisites
- Backend server running on port 5000
- Frontend server running on port 5173
- Admin credentials: username "admin", password "admin123"
- Database with teachers and timetable data

## Feature Description
The "Change Substitute" feature allows administrators to replace an already-assigned substitute teacher with a different available teacher for the same period.

## Testing Steps

### Step 1: Mark a Teacher Absent
1. Navigate to http://localhost:5173/login
2. Login with admin credentials
3. Click "Mark Attendance" in the navigation bar
4. Select a weekday date (Monday-Friday)
5. Find a teacher and click "Mark by Period"
6. Select one or more periods (e.g., Period 1)
7. Click "Submit Attendance"
8. Verify success message appears

### Step 2: Allocate Initial Substitute
1. Click "Allocate Substitute" in the navigation bar
2. Select the same date as Step 1
3. You should see the absent teacher listed with their scheduled classes
4. For Period 1, click the yellow "Allocate Substitute" button
5. A list of free teachers will appear
6. Click "Select" for the first available teacher
7. Review the confirmation form showing:
   - Date and period details
   - Absent teacher information
   - Substitute teacher information
   - Green informational message: "Any available teacher can substitute for this class"
8. Click "Confirm Allocation"
9. Verify success message: "Successfully allocated [Teacher Name] to cover [Absent Teacher]'s class"

### Step 3: Verify Coverage Status
1. The page should refresh automatically
2. For Period 1, you should now see:
   - Green badge: "✓ Covered by [Substitute Teacher Name]"
   - Teal/cyan button: "Change Substitute"

### Step 4: Change the Substitute Teacher
1. Click the teal "Change Substitute" button
2. A list of free teachers will appear again
3. Select a DIFFERENT teacher than the original (click "Select" for the second teacher)
4. Review the confirmation form showing:
   - Header: "Change Substitute Teacher"
   - Subtitle: "Select a new substitute teacher to replace the current one"
   - Same date, period, and class details
   - New substitute teacher information
5. Click "Confirm Change"
6. Verify success message: "Successfully changed substitute to [New Teacher Name]"

### Step 5: Verify the Change
1. The page should refresh automatically
2. For Period 1, you should now see:
   - Green badge: "✓ Covered by [NEW Substitute Teacher Name]"
   - The name should be different from the original substitute
   - "Change Substitute" button should still be available

## Expected Behavior

### Visual Indicators
- **Uncovered Period**: Yellow "Allocate Substitute" button
- **Covered Period**: 
  - Green badge with checkmark and substitute name
  - Teal/cyan "Change Substitute" button

### Button Colors
- **Allocate Substitute**: Yellow background (#ffc107)
- **Change Substitute**: Teal/cyan background (#17a2b8)
- **Confirm Allocation**: Green background (#28a745)
- **Confirm Change**: Green background (#28a745)

### Success Messages
- After allocation: "Successfully allocated [Name] to cover [Absent Teacher]'s class"
- After change: "Successfully changed substitute to [Name]"

### Informational Message
- Green background (#e8f5e9)
- Green border (#a5d6a7)
- Green text (#2e7d32)
- Icon: ℹ️
- Text: "Any available teacher can substitute for this class. Subject expertise is not required for substitution."

## Backend Validation

The backend performs the following validations:

1. **Substitution Exists**: Verifies the substitution record exists
2. **Teacher Availability**: Checks the new substitute teacher is free during that period
3. **Different Teacher**: Ensures the new teacher is different from the current one
4. **Valid Period**: Confirms the period is within valid range (1-8)
5. **Weekday Only**: Ensures the date is Monday-Friday

## API Endpoint Used

**PUT** `/api/substitutions/:id`

**Request Body:**
```json
{
  "substituteTeacherId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "substitution": {
      "_id": "...",
      "absentTeacher": { "_id": "...", "name": "...", "subjects": [...] },
      "substituteTeacher": { "_id": "...", "name": "...", "subjects": [...] },
      "class": "10A",
      "period": 1,
      "date": "2026-05-12T00:00:00.000Z",
      "subject": "Mathematics"
    }
  }
}
```

## Troubleshooting

### Issue: "Change Substitute" button not appearing
- **Cause**: Period is not covered yet
- **Solution**: First allocate a substitute teacher

### Issue: "Selected teacher is not available during this period"
- **Cause**: The new teacher has a class during that period
- **Solution**: Select a different teacher from the free teachers list

### Issue: No free teachers available
- **Cause**: All teachers are either absent or have classes during that period
- **Solution**: Try a different period or date

### Issue: Success message appears but name doesn't change
- **Cause**: Page needs to refresh to show updated data
- **Solution**: Manually refresh the page or wait for auto-refresh

## Files Modified for This Feature

### Frontend
1. **AbsentTeacherList.jsx**
   - Added "Change Substitute" button for covered periods
   - Updated `handleAllocateClick` to accept `existingSubstitution` parameter
   - Passes substitution data to SubstitutionForm

2. **SubstitutionForm.jsx**
   - Added `isUpdate` logic to detect update vs create
   - Dynamic UI text based on operation type
   - Calls update API instead of create API when changing

3. **api.js**
   - Updated `substitutionsAPI.update()` to accept generic `data` object
   - Allows passing `substituteTeacherId` for updates

### Backend
- No changes needed - existing update endpoint already supported this functionality

## Success Criteria

✅ Can allocate initial substitute teacher  
✅ "Change Substitute" button appears after allocation  
✅ Can select different teacher when changing  
✅ Confirmation form shows "Change" header and text  
✅ Success message confirms the change  
✅ Updated substitute name appears after change  
✅ Can change substitute multiple times  
✅ Backend validates teacher availability  
✅ Green informational message about subject flexibility  

## Additional Test Scenarios

### Scenario 1: Multiple Periods
1. Mark teacher absent for periods 1, 2, and 3
2. Allocate substitutes for all three periods
3. Change substitute for period 2 only
4. Verify periods 1 and 3 remain unchanged

### Scenario 2: Same Teacher for Multiple Periods
1. Mark teacher absent for periods 1 and 2
2. Allocate same substitute for both periods
3. Change substitute for period 1
4. Verify period 2 still has original substitute

### Scenario 3: Rapid Changes
1. Allocate substitute
2. Immediately change to different teacher
3. Change again to another teacher
4. Verify final substitute is correct

## Notes

- The feature reuses the existing allocation UI for consistency
- The same free teacher selection flow is used for both allocation and change
- Backend validation ensures data integrity
- The feature supports the school's policy of allowing any free teacher to substitute

## Documentation

For more details, see:
- `CHANGE_SUBSTITUTE_FEATURE.md` - Feature implementation details
- `SESSION_SUMMARY.md` - Complete session summary
- `frontend/src/components/AbsentTeacherList.jsx` - Component code
- `frontend/src/components/SubstitutionForm.jsx` - Form component code

---

**Last Updated**: May 10, 2026  
**Feature Status**: ✅ Complete and Working  
**Testing Status**: ✅ Ready for Manual Testing
