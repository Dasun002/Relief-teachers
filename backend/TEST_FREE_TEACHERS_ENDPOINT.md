# Testing the Free Teachers Endpoint

## Endpoint Details

**URL:** `GET /api/teachers/free`

**Authentication:** Required (JWT token in Authorization header)

**Query Parameters:**
- `period` (required): Period number (1-8)
- `day` (required): Day of week (Monday, Tuesday, Wednesday, Thursday, Friday)
- `date` (required): Date in ISO 8601 format (YYYY-MM-DD)

## Example Request

```bash
curl -X GET "http://localhost:5000/api/teachers/free?period=3&day=Monday&date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Responses

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "subjects": ["Mathematics", "Physics"]
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "subjects": ["English", "History"]
      }
    ],
    "count": 2
  }
}
```

### Missing Query Parameters (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required query parameters: period, day, and date are required"
  }
}
```

### Invalid Period (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Period must be a number between 1 and 8"
  }
}
```

### Invalid Day (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday"
  }
}
```

### Invalid Date Format (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Date must be in valid ISO 8601 format (YYYY-MM-DD)"
  }
}
```

### Database Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to retrieve free teachers"
  }
}
```

### Unauthorized (401 Unauthorized)

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid token"
  }
}
```

## Testing Steps

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Login to get JWT token:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your_password"}'
   ```

3. **Test the free teachers endpoint:**
   ```bash
   # Replace YOUR_JWT_TOKEN with the token from step 2
   curl -X GET "http://localhost:5000/api/teachers/free?period=3&day=Monday&date=2024-01-15" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

4. **Test validation errors:**
   ```bash
   # Missing parameters
   curl -X GET "http://localhost:5000/api/teachers/free" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   
   # Invalid period
   curl -X GET "http://localhost:5000/api/teachers/free?period=10&day=Monday&date=2024-01-15" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   
   # Invalid day
   curl -X GET "http://localhost:5000/api/teachers/free?period=3&day=Saturday&date=2024-01-15" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   
   # Invalid date
   curl -X GET "http://localhost:5000/api/teachers/free?period=3&day=Monday&date=invalid-date" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Implementation Details

### Controller Function
Location: `backend/controllers/teacherController.js`

The `getFreeTeachers` function:
1. Validates all required query parameters (period, day, date)
2. Validates period is between 1-8
3. Validates day is a weekday (Monday-Friday)
4. Validates date is in ISO 8601 format
5. Calls `FreeTeacherAlgorithm.findFreeTeachers()` to get available teachers
6. Returns the list of free teachers with count

### Route Configuration
Location: `backend/routes/teacherRoutes.js`

The route is registered as:
```javascript
router.get('/free', authenticate, getFreeTeachers);
```

**Important:** The `/free` route is placed BEFORE the `/:id` route to prevent Express from treating "free" as an ID parameter.

### Algorithm
The `FreeTeacherAlgorithm.findFreeTeachers()` method:
1. Gets all teachers from the database
2. Excludes teachers scheduled for the period/day (from Timetable)
3. Excludes teachers marked absent for the date (from Attendance)
4. Excludes teachers already assigned as substitutes for the period/date (from Substitution)
5. Returns the remaining free teachers

## Requirements Validated

This implementation satisfies the following requirements:

- **Requirement 6.1:** Returns all teachers who have no timetable entry for the specified period
- **Requirement 6.2:** Excludes teachers marked absent for the current date
- **Requirement 6.3:** Excludes teachers already assigned as substitutes for the queried period
- **Requirement 6.4:** Returns free teachers with their names and subject specializations
- **Requirement 6.5:** Returns an empty list when no free teachers are available
- **Requirement 11.1:** Returns 500 error with descriptive message on database failure
- **Requirement 11.2:** Returns 400 error with validation details on invalid input
