# Period-Based Attendance System - Redesign Specification

## Current Problem

The existing system only supports **whole-day attendance**:
- ❌ Teacher is either present or absent for the entire day
- ❌ Cannot mark absence for specific periods
- ❌ Substitution allocation doesn't match real-world scenarios

## Required Solution

Teachers should be able to be marked absent for:
1. **Full day** - All periods
2. **Multiple periods** - Selected periods
3. **Single period** - Just one period

## New Data Model

### Attendance Schema (Redesigned)

```javascript
{
  teacher: ObjectId,           // Reference to Teacher
  date: Date,                  // Attendance date
  status: String,              // 'present' or 'absent' (default status)
  absentPeriods: [Number],     // Array of period numbers [1,2,3,4,5,6,7,8]
  // If absentPeriods is empty and status is 'absent' = full day absent
  // If absentPeriods has values = absent for those specific periods only
  createdAt: Date,
  updatedAt: Date
}
```

### Examples:

**Full Day Absent:**
```javascript
{
  teacher: "teacher123",
  date: "2026-05-12",
  status: "absent",
  absentPeriods: [1, 2, 3, 4, 5, 6, 7, 8]  // All periods
}
```

**Partial Day Absent (Periods 2, 3, 5):**
```javascript
{
  teacher: "teacher123",
  date: "2026-05-12",
  status: "present",  // Overall present, but absent for some periods
  absentPeriods: [2, 3, 5]
}
```

**Fully Present:**
```javascript
{
  teacher: "teacher123",
  date: "2026-05-12",
  status: "present",
  absentPeriods: []  // No absent periods
}
```

## User Interface Flow

### Step 1: View Teacher's Schedule
```
┌─────────────────────────────────────┐
│ Mr. John Smith                      │
│ Subjects: Math, Physics             │
│                                     │
│ [View Schedule & Mark Attendance]   │
└─────────────────────────────────────┘
```

### Step 2: Period-by-Period Attendance
```
┌─────────────────────────────────────┐
│ Mr. John Smith - May 12, 2026       │
│                                     │
│ Period 1 (08:00-08:45)              │
│ Class: 6A | Subject: Math           │
│ ○ Present  ● Absent                 │
│ [Available Substitutes: 5]          │
│                                     │
│ Period 2 (08:45-09:30)              │
│ Class: 7B | Subject: Physics        │
│ ● Present  ○ Absent                 │
│                                     │
│ Period 3 (09:30-10:15)              │
│ No class scheduled                  │
│                                     │
│ [Mark All Present] [Mark All Absent]│
│ [Save Attendance]                   │
└─────────────────────────────────────┘
```

### Step 3: Allocate Substitute for Absent Period
```
┌─────────────────────────────────────┐
│ Period 1 (08:00-08:45) - ABSENT     │
│ Class: 6A | Subject: Math           │
│                                     │
│ Available Substitute Teachers:      │
│ ┌─────────────────────────────────┐ │
│ │ ○ Ms. Jane Doe (English, Math)  │ │
│ │ ○ Mr. Bob Wilson (Math, Science)│ │
│ │ ○ Ms. Alice Brown (Physics)     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Allocate Selected Substitute]      │
└─────────────────────────────────────┘
```

## API Endpoints (New/Modified)

### 1. Mark Period-Based Attendance
```
POST /api/attendance/periods
Body: {
  teacherId: "string",
  date: "YYYY-MM-DD",
  absentPeriods: [1, 2, 5]  // Array of period numbers
}
Response: {
  success: true,
  data: {
    attendance: {
      teacher: {...},
      date: "2026-05-12",
      status: "present",  // or "absent" if all periods
      absentPeriods: [1, 2, 5]
    }
  }
}
```

### 2. Get Teacher Schedule with Attendance Status
```
GET /api/attendance/schedule/:teacherId/:date
Response: {
  success: true,
  data: {
    teacher: {...},
    date: "2026-05-12",
    schedule: [
      {
        period: 1,
        class: "6A",
        subject: "Math",
        startTime: "08:00",
        endTime: "08:45",
        isAbsent: true,
        availableSubstitutes: 5
      },
      {
        period: 2,
        class: "7B",
        subject: "Physics",
        startTime: "08:45",
        endTime: "09:30",
        isAbsent: false,
        availableSubstitutes: 0
      }
    ]
  }
}
```

### 3. Get Available Substitutes for Specific Period
```
GET /api/teachers/free?date=YYYY-MM-DD&period=1&day=Monday
Response: {
  success: true,
  data: {
    teachers: [
      {
        _id: "teacher456",
        name: "Ms. Jane Doe",
        subjects: ["English", "Math"],
        isFree: true
      }
    ]
  }
}
```

### 4. Allocate Substitute for Period
```
POST /api/substitutions
Body: {
  absentTeacherId: "teacher123",
  substituteTeacherId: "teacher456",
  date: "2026-05-12",
  period: 1,
  class: "6A",
  subject: "Math"
}
```

## Implementation Plan

### Phase 1: Backend Model Update
1. Update `Attendance` model to include `absentPeriods` array
2. Update validation logic
3. Migrate existing data (if any)

### Phase 2: Backend Service Layer
1. Update `AttendanceService` to handle period-based attendance
2. Add method to mark specific periods as absent
3. Add method to get schedule with attendance status
4. Update `isTeacherAbsent()` to check specific periods

### Phase 3: Backend API Endpoints
1. Create new endpoint for period-based attendance
2. Create endpoint to get schedule with attendance
3. Update existing endpoints to support period queries

### Phase 4: Frontend UI Components
1. Create `PeriodAttendanceForm` component
2. Show teacher's schedule with period-by-period checkboxes
3. Add "Mark All Present/Absent" quick actions
4. Integrate with existing attendance page

### Phase 5: Substitution Integration
1. Update substitution allocation to work with period-based attendance
2. Show available substitutes only for absent periods
3. Update validation to check period-specific absence

### Phase 6: Testing
1. Unit tests for new model and services
2. Integration tests for API endpoints
3. E2E tests for UI workflow
4. Manual testing with real scenarios

## Migration Strategy

### For Existing Data:
```javascript
// Old format (whole day)
{
  teacher: "teacher123",
  date: "2026-05-12",
  status: "absent"
}

// Convert to new format
{
  teacher: "teacher123",
  date: "2026-05-12",
  status: "absent",
  absentPeriods: [1, 2, 3, 4, 5, 6, 7, 8]  // All periods
}
```

## Benefits

1. **Realistic** - Matches real-world scenarios
2. **Flexible** - Supports partial day absences
3. **Efficient** - Only allocate substitutes for absent periods
4. **Accurate** - Better tracking and reporting
5. **User-Friendly** - Clear visual representation

## Timeline

- **Phase 1-2 (Backend):** 2-3 hours
- **Phase 3 (API):** 1-2 hours
- **Phase 4 (Frontend):** 3-4 hours
- **Phase 5 (Integration):** 1-2 hours
- **Phase 6 (Testing):** 2-3 hours

**Total Estimated Time:** 9-14 hours

## Next Steps

1. Get approval for this redesign
2. Start with Phase 1 (Backend Model Update)
3. Implement incrementally with testing at each phase
4. Deploy and gather user feedback

