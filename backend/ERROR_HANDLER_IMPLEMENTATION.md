# Global Error Handler Implementation

## Overview

This document describes the implementation of the global error handling middleware for the Teacher Attendance and Substitution Management System.

## Implementation Details

### Files Created

1. **`backend/utils/errors.js`** - Custom error classes
2. **`backend/middleware/errorHandler.js`** - Global error handler middleware
3. **`backend/index.js`** - Updated to register error handler as last middleware

### Custom Error Classes

The following custom error classes have been implemented:

#### 1. ApplicationError (Base Class)
- Base class for all custom errors
- Properties: `message`, `statusCode`, `code`, `details`

#### 2. BusinessError
- Used for business rule violations
- HTTP Status: 400 Bad Request
- Examples:
  - Teacher not free for substitution
  - Teacher not marked absent
  - Invalid allocation attempt

#### 3. DatabaseError
- Used for database operation failures
- HTTP Status: 500 Internal Server Error
- Wraps original database errors

#### 4. ValidationError
- Used for input validation failures
- HTTP Status: 400 Bad Request
- Includes field-level validation details

#### 5. AuthenticationError
- Used for authentication failures
- HTTP Status: 401 Unauthorized
- Examples:
  - Invalid credentials
  - Missing token
  - Expired token

#### 6. AuthorizationError
- Used for authorization failures
- HTTP Status: 403 Forbidden
- Examples:
  - Non-admin accessing admin endpoints

#### 7. NotFoundError
- Used when requested resource doesn't exist
- HTTP Status: 404 Not Found

## Error Response Format

All errors return a standardized JSON response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional
  }
}
```

## Error Handling Features

### 1. Automatic Error Type Detection

The error handler automatically detects error types and maps them to appropriate HTTP status codes:

- **ApplicationError instances**: Use their defined statusCode
- **Mongoose ValidationError**: 400 Bad Request
- **Mongoose CastError**: 400 Bad Request (invalid ObjectId)
- **MongoDB Duplicate Key (code 11000)**: 409 Conflict
- **Unknown errors**: 500 Internal Server Error

### 2. Production-Safe Error Messages

In production mode, the error handler sanitizes error messages to hide sensitive information:

- **Database errors**: Generic message instead of connection strings
- **Stack traces**: Hidden in production, shown in development
- **Internal errors**: Generic "unexpected error" message

### 3. Structured Error Logging

All errors are logged with context information:

```javascript
{
  url: '/api/teachers/invalid-id',
  method: 'GET',
  ip: '127.0.0.1',
  userId: 'unauthenticated',
  userAgent: 'curl/7.64.1',
  timestamp: '2024-01-15T10:30:45.123Z',
  errorName: 'CastError',
  errorCode: 'INVALID_ID',
  statusCode: 400,
  stack: '...' // Only for 500 errors
}
```

### 4. Log Level Based on Severity

- **ERROR level**: 500+ status codes (server errors)
- **WARN level**: 400-499 status codes (client errors)
- **INFO level**: Other errors

## Testing the Error Handler

### Test Case 1: Invalid MongoDB ObjectId (CastError)

```bash
# Request
curl -X GET http://localhost:5000/api/teachers/invalid-id \
  -H "Authorization: Bearer <token>"

# Expected Response (400)
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid ID format provided."
  }
}
```

### Test Case 2: Missing Authentication Token

```bash
# Request
curl -X GET http://localhost:5000/api/teachers

# Expected Response (401)
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "No token provided"
  }
}
```

### Test Case 3: Validation Error

```bash
# Request
curl -X POST http://localhost:5000/api/teachers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Expected Response (400)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name and at least one subject are required"
  }
}
```

### Test Case 4: Resource Not Found

```bash
# Request
curl -X GET http://localhost:5000/api/teachers/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"

# Expected Response (404)
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Teacher not found"
  }
}
```

### Test Case 5: Authorization Error

```bash
# Request (with non-admin user token)
curl -X POST http://localhost:5000/api/teachers \
  -H "Authorization: Bearer <non-admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "subjects": ["Math"]}'

# Expected Response (403)
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

### Test Case 6: Database Error (Production Mode)

```bash
# Simulate database connection failure
# Expected Response (500)
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "A database error occurred. Please try again later."
  }
}
```

## Integration with Existing Controllers

The error handler works seamlessly with existing controller error handling. Controllers can:

1. **Throw custom errors directly**:
```javascript
throw new ValidationError('Invalid input', { field: 'name' });
```

2. **Let Mongoose errors bubble up**:
```javascript
// Mongoose ValidationError will be caught and handled
await Teacher.create({ name: '' }); // Missing required field
```

3. **Use try-catch with error wrapping**:
```javascript
try {
  await someOperation();
} catch (error) {
  throw new DatabaseError('Operation failed', error);
}
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **11.1**: Database operation failures return 500 with descriptive message
- **11.2**: Invalid input returns 400 with validation details
- **11.3**: Unauthorized operations return 403
- **11.4**: Non-existent resources return 404
- **11.5**: All errors logged with timestamp, type, and context
- **11.6**: Sensitive information hidden in production (stack traces, database details)

## Environment-Specific Behavior

### Development Mode (`NODE_ENV=development`)
- Full error messages shown
- Stack traces included for 500 errors
- Detailed error information in response
- All errors logged with full context

### Production Mode (`NODE_ENV=production`)
- Generic error messages for internal errors
- No stack traces in response
- Sanitized error messages
- Database details hidden
- Only essential information logged

## Middleware Registration

The error handler is registered as the **LAST middleware** in the Express app:

```javascript
// All routes registered first
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
// ... other routes

// Error handler MUST be last
app.use(errorHandler);
```

This ensures all errors from routes and middleware are caught and handled consistently.

## Future Enhancements

Potential improvements for future iterations:

1. **Error Tracking Service Integration**: Send errors to services like Sentry or Rollbar
2. **Request ID Tracking**: Add unique request IDs for tracing across logs
3. **Rate Limiting**: Add rate limiting for error-prone endpoints
4. **Error Metrics**: Track error rates and types for monitoring
5. **Custom Error Pages**: Render HTML error pages for browser requests
6. **Localization**: Support multiple languages for error messages

## Conclusion

The global error handler provides a robust, production-ready error handling solution that:
- Standardizes error responses across the API
- Protects sensitive information in production
- Provides detailed logging for debugging
- Handles all error types consistently
- Integrates seamlessly with existing code
