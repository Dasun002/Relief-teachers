/**
 * Custom Error Classes for the Teacher Attendance and Substitution System
 * 
 * These error classes provide structured error handling with specific error codes
 * and HTTP status codes for different error scenarios.
 */

/**
 * Base Application Error
 * All custom errors extend from this class
 */
class ApplicationError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Business Logic Error
 * Used for business rule violations (e.g., teacher not free, teacher not absent)
 * HTTP Status: 400 Bad Request
 */
class BusinessError extends ApplicationError {
  constructor(code, message, details = null) {
    super(message, 400, code, details);
  }
}

/**
 * Database Error
 * Used for database operation failures
 * HTTP Status: 500 Internal Server Error
 */
class DatabaseError extends ApplicationError {
  constructor(message, originalError = null) {
    super(message, 500, 'DATABASE_ERROR', null);
    this.originalError = originalError;
  }
}

/**
 * Validation Error
 * Used for input validation failures
 * HTTP Status: 400 Bad Request
 */
class ValidationError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication Error
 * Used for authentication failures (invalid credentials, missing token)
 * HTTP Status: 401 Unauthorized
 */
class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_FAILED', null);
  }
}

/**
 * Authorization Error
 * Used for authorization failures (insufficient permissions)
 * HTTP Status: 403 Forbidden
 */
class AuthorizationError extends ApplicationError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN', null);
  }
}

/**
 * Not Found Error
 * Used when a requested resource does not exist
 * HTTP Status: 404 Not Found
 */
class NotFoundError extends ApplicationError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', null);
  }
}

export {
  ApplicationError,
  BusinessError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
