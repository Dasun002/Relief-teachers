# Clear Timetable Feature - Added

## Overview
Added functionality to clear all timetable entries from the database with a single click, including proper admin authorization and confirmation dialog.

## Changes Made

### 1. Backend - DELETE Endpoint ✅
**File:** `backend/routes/timetableRoutes.js`

Added new DELETE endpoint:
```javascript
/**
 * @route   DELETE /api/timetable
 * @desc    Delete all timetable entries (admin only)
 * @access  Private (Admin only)
 */
router.delete('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const TimetableService = (await import('../services/TimetableService.js')).default;
    const result = await TimetableService.deleteAll();
    
    res.status(200).json({
      success: true,
      data: {
        message: 'All timetable entries deleted successfully',
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete timetable entries',
      },
    });
  }
});
```

**Features:**
- ✅ Admin-only access (requires authentication + admin role)
- ✅ Uses existing `TimetableService.deleteAll()` method
- ✅ Returns count of deleted entries
- ✅ Proper error handling

### 2. Frontend - API Method ✅
**File:** `frontend/src/services/api.js`

Added deleteAll method:
```javascript
export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  import: (xmlData) => api.post('/timetable/import', { xmlData }),
  deleteAll: () => api.delete('/timetable'),  // ← New method
};
```

### 3. Frontend - Clear Function ✅
**File:** `frontend/src/pages/TimetablePage.jsx`

Added handleClearTimetable function:
```javascript
const handleClearTimetable = async () => {
  // Confirmation dialog
  if (!window.confirm('Are you sure you want to delete ALL timetable entries? This action cannot be undone!')) {
    return;
  }

  try {
    setLoading(true);
    const response = await timetableAPI.deleteAll();
    
    toast.showSuccess(`Timetable cleared: ${response.data.data.deletedCount} entries deleted`);
    
    // Refresh the timetable list
    fetchTimetable();
  } catch (err) {
    const errorMessage = err.response?.data?.error?.message || 'Failed to clear timetable';
    toast.showError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

**Features:**
- ✅ Confirmation dialog before deletion
- ✅ Shows success message with count
- ✅ Automatically refreshes timetable list
- ✅ Error handling with toast notifications
- ✅ Loading state management

### 4. Frontend - Clear Button UI ✅
**File:** `frontend/src/pages/TimetablePage.jsx`

Added "Danger Zone" section with Clear button:
```javascript
{!loading && timetableEntries.length > 0 && (
  <div style={{
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div>
      <strong>Danger Zone:</strong> Clear all timetable entries from the database
    </div>
    <button
      onClick={handleClearTimetable}
      disabled={loading}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold'
      }}
    >
      Clear All Timetable
    </button>
  </div>
)}
```

**Features:**
- ✅ Only shows when timetable has entries
- ✅ Warning color scheme (yellow background, red button)
- ✅ Clear "Danger Zone" label
- ✅ Disabled during loading
- ✅ Positioned between Import and Filters sections

## How It Works

### User Flow:
1. **Admin logs in** and navigates to Timetable page
2. **Sees timetable entries** (if any exist)
3. **Sees "Danger Zone" section** with Clear button
4. **Clicks "Clear All Timetable"** button
5. **Confirmation dialog appears:** "Are you sure you want to delete ALL timetable entries? This action cannot be undone!"
6. **User confirms:**
   - Backend deletes all entries
   - Success toast shows: "Timetable cleared: X entries deleted"
   - Timetable list refreshes (shows empty state)
7. **User cancels:**
   - Nothing happens
   - Timetable remains unchanged

### Security:
- ✅ **Admin-only:** Only users with admin role can delete
- ✅ **Authentication required:** Must be logged in
- ✅ **Confirmation required:** User must confirm action
- ✅ **Cannot be undone:** Clear warning message

### UI States:
- **Hidden:** When no timetable entries exist
- **Visible:** When timetable has entries
- **Disabled:** During loading/deletion process
- **Success:** Shows count of deleted entries
- **Error:** Shows error message if deletion fails

## Testing Instructions

### Test 1: Clear Timetable (Happy Path)
1. Login as admin
2. Navigate to Timetable page
3. Verify timetable has entries
4. Verify "Danger Zone" section is visible
5. Click "Clear All Timetable" button
6. Confirm the dialog
7. **Expected:**
   - ✅ Success toast: "Timetable cleared: X entries deleted"
   - ✅ Timetable grid shows "No timetable entries found"
   - ✅ "Danger Zone" section disappears

### Test 2: Cancel Clear
1. Login as admin
2. Navigate to Timetable page
3. Click "Clear All Timetable" button
4. Click "Cancel" on confirmation dialog
5. **Expected:**
   - ✅ Nothing happens
   - ✅ Timetable remains unchanged

### Test 3: Non-Admin User
1. Login as regular user
2. Navigate to Timetable page
3. **Expected:**
   - ✅ "Danger Zone" section is visible (if entries exist)
   - ✅ Clicking button shows error: "Access denied" or similar
   - ✅ No entries are deleted

### Test 4: No Entries
1. Login as admin
2. Navigate to Timetable page (with no entries)
3. **Expected:**
   - ✅ "Danger Zone" section is NOT visible
   - ✅ Only Import section is shown

## API Endpoint

**DELETE** `/api/timetable`

**Headers:**
- `Authorization: Bearer <token>`

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "message": "All timetable entries deleted successfully",
    "deletedCount": 2530
  }
}
```

**Response (Error - Not Admin):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

**Response (Error - Server):**
```json
{
  "success": false,
  "error": {
    "code": "DELETE_FAILED",
    "message": "Failed to delete timetable entries"
  }
}
```

## Files Modified

1. ✅ `backend/routes/timetableRoutes.js` - Added DELETE endpoint
2. ✅ `frontend/src/services/api.js` - Added deleteAll method
3. ✅ `frontend/src/pages/TimetablePage.jsx` - Added clear function and UI

## Benefits

1. **Easy Cleanup:** Quickly remove all timetable entries for fresh import
2. **Safe:** Requires admin role and confirmation
3. **User-Friendly:** Clear feedback with success/error messages
4. **Efficient:** Single API call deletes all entries
5. **Visible:** Only shows when relevant (entries exist)

## Notes

- The button only appears when there are timetable entries
- The action requires admin privileges
- A confirmation dialog prevents accidental deletion
- The timetable list automatically refreshes after deletion
- The existing `TimetableService.deleteAll()` method is reused

## Next Steps

The feature is ready to use! After the servers restart:
1. Navigate to Timetable page
2. You'll see the "Danger Zone" section if entries exist
3. Click "Clear All Timetable" to remove all entries
4. Import a fresh timetable if needed
