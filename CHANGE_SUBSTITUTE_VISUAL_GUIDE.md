# Change Substitute Feature - Visual Guide

## UI States and Flow

### State 1: Period Without Coverage
```
┌─────────────────────────────────────────┐
│ Period 3                    10:30-11:10 │
│                                         │
│ Class: 10A                              │
│ Subject: Mathematics                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   Allocate Substitute               │ │  ← Yellow button
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### State 2: Period With Coverage (After Initial Allocation)
```
┌─────────────────────────────────────────┐
│ Period 3                    10:30-11:10 │
│                                         │
│ Class: 10A                              │
│ Subject: Mathematics                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Covered by Miss Perera Nimesha   │ │  ← Green badge
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   Change Substitute                 │ │  ← Cyan button (NEW!)
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### State 3: After Changing Substitute
```
┌─────────────────────────────────────────┐
│ Period 3                    10:30-11:10 │
│                                         │
│ Class: 10A                              │
│ Subject: Mathematics                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Covered by Miss Fernando Chamari │ │  ← Updated name
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   Change Substitute                 │ │  ← Still available
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Modal Flow Comparison

### Initial Allocation Flow
```
Step 1: Click "Allocate Substitute"
        ↓
┌──────────────────────────────────────────┐
│ Free Teachers                            │
│                                          │
│ Select a teacher to substitute:         │
│                                          │
│ ○ Miss Perera Nimesha                   │
│ ○ Miss Fernando Chamari                 │
│ ○ Miss Silva Kumari                     │
│                                          │
│ [Cancel]                                 │
└──────────────────────────────────────────┘
        ↓
Step 2: Select teacher
        ↓
┌──────────────────────────────────────────┐
│ Confirm Substitution Allocation          │  ← Title
│                                          │
│ Please review the details before         │
│ confirming the allocation                │
│                                          │
│ Class Details:                           │
│ Date: May 10, 2026    Period: 3         │
│ Time: 10:30 - 11:10   Class: 10A        │
│ Subject: Mathematics                     │
│                                          │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ Absent       │  │ Substitute   │     │
│ │ Teacher      │  │ Teacher      │     │
│ │              │  │              │     │
│ │ Miss Udakanda│  │ Miss Perera  │     │
│ │ Sasini       │  │ Nimesha      │     │
│ └──────────────┘  └──────────────┘     │
│                                          │
│ ℹ️ Any available teacher can substitute │
│                                          │
│ [Cancel]  [Confirm Allocation]           │  ← Button text
└──────────────────────────────────────────┘
```

### Change Substitute Flow
```
Step 1: Click "Change Substitute"
        ↓
┌──────────────────────────────────────────┐
│ Free Teachers                            │
│                                          │
│ Select a teacher to substitute:         │
│                                          │
│ ○ Miss Fernando Chamari                 │  ← Different teacher
│ ○ Miss Silva Kumari                     │
│ ○ Miss Jayawardena Dilini               │
│                                          │
│ [Cancel]                                 │
└──────────────────────────────────────────┘
        ↓
Step 2: Select new teacher
        ↓
┌──────────────────────────────────────────┐
│ Change Substitute Teacher                │  ← Different title
│                                          │
│ Select a new substitute teacher to       │  ← Different subtitle
│ replace the current one                  │
│                                          │
│ Class Details:                           │
│ Date: May 10, 2026    Period: 3         │
│ Time: 10:30 - 11:10   Class: 10A        │
│ Subject: Mathematics                     │
│                                          │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ Absent       │  │ Substitute   │     │
│ │ Teacher      │  │ Teacher      │     │
│ │              │  │              │     │
│ │ Miss Udakanda│  │ Miss Fernando│     │  ← New teacher
│ │ Sasini       │  │ Chamari      │     │
│ └──────────────┘  └──────────────┘     │
│                                          │
│ ℹ️ Any available teacher can substitute │
│                                          │
│ [Cancel]  [Confirm Change]               │  ← Different button text
└──────────────────────────────────────────┘
```

## Color Scheme

### Button Colors
- **Yellow (#ffc107)**: Allocate Substitute (needs action)
- **Green (#28a745)**: Coverage badge (status indicator)
- **Cyan (#17a2b8)**: Change Substitute (modify action)
- **Gray (#6c757d)**: Cancel button

### Status Colors
- **Red (#dc3545)**: Absent teacher indicator
- **Green (#28a745)**: Covered status
- **Yellow (#ffc107)**: Needs coverage

## Success Messages

### Initial Allocation
```
┌────────────────────────────────────────────────┐
│ ✓ Success                                      │
│                                                │
│ Successfully allocated Miss Perera Nimesha     │
│ to cover Miss Udakanda Sasini's class          │
└────────────────────────────────────────────────┘
```

### Change Substitute
```
┌────────────────────────────────────────────────┐
│ ✓ Success                                      │
│                                                │
│ Successfully changed substitute to             │
│ Miss Fernando Chamari                          │
└────────────────────────────────────────────────┘
```

## Error Messages

### Teacher Not Available
```
┌────────────────────────────────────────────────┐
│ ✗ Error                                        │
│                                                │
│ Selected teacher is not available during       │
│ this period                                    │
└────────────────────────────────────────────────┘
```

## Complete Absent Teacher Card Example

```
┌─────────────────────────────────────────────────────────────┐
│ Miss Udakanda Sasini                          [Absent]      │
│ Subjects: Mathematics, Science                              │
│                                                             │
│ Scheduled Classes:                                          │
│                                                             │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐│
│ │ Period 1         │ │ Period 2         │ │ Period 3     ││
│ │ 08:00-08:40      │ │ 08:40-09:20      │ │ 10:30-11:10  ││
│ │                  │ │                  │ │              ││
│ │ Class: 10A       │ │ Class: 10B       │ │ Class: 10A   ││
│ │ Subject: Math    │ │ Subject: Math    │ │ Subject: Math││
│ │                  │ │                  │ │              ││
│ │ ┌──────────────┐ │ │ ┌──────────────┐ │ │ ┌──────────┐││
│ │ │✓ Covered by  │ │ │ │  Allocate    │ │ │ │✓ Covered │││
│ │ │Miss Perera   │ │ │ │  Substitute  │ │ │ │by Miss   │││
│ │ │Nimesha       │ │ │ └──────────────┘ │ │ │Fernando  │││
│ │ └──────────────┘ │ │                  │ │ │Chamari   │││
│ │                  │ │                  │ │ └──────────┘││
│ │ ┌──────────────┐ │ │                  │ │            ││
│ │ │   Change     │ │ │                  │ │ ┌──────────┐││
│ │ │  Substitute  │ │ │                  │ │ │  Change  │││
│ │ └──────────────┘ │ │                  │ │ │Substitute│││
│ └──────────────────┘ └──────────────────┘ │ └──────────┘││
│                                            └──────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key Visual Differences

### Before Feature (Old)
- Only "Allocate Substitute" button
- Once allocated, no way to change
- Had to delete and recreate substitution

### After Feature (New)
- "Allocate Substitute" for uncovered periods
- "Change Substitute" for covered periods
- Can change as many times as needed
- Same smooth flow for both operations

## User Experience Flow

```
1. View Absent Teachers
   ↓
2. See periods needing coverage (yellow button)
   ↓
3. Allocate substitute
   ↓
4. Period shows green badge + cyan button
   ↓
5. Need to change? Click cyan button
   ↓
6. Select new teacher
   ↓
7. Confirm change
   ↓
8. Updated immediately
   ↓
9. Can change again if needed
```

## Responsive Design

### Desktop View
- Periods displayed in grid (3 columns)
- Full teacher names visible
- All buttons full width

### Mobile View
- Periods stack vertically (1 column)
- Teacher names may truncate
- Buttons remain full width
- Touch-friendly button sizes

## Accessibility

- ✅ Clear button labels
- ✅ Color + text indicators (not just color)
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast colors

## Summary

The "Change Substitute" feature provides:
1. **Clear Visual Feedback**: Green badge shows coverage status
2. **Easy Access**: Cyan button always available on covered periods
3. **Consistent Flow**: Same modal flow as initial allocation
4. **Flexible**: Can change as many times as needed
5. **Safe**: Validates teacher availability before allowing change

**Result**: Administrators can easily manage and update substitution assignments! 🎉
