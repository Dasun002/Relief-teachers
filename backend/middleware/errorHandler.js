/**
 * Global Error Handler Middleware
 * 
 * This middleware catches all errors thrown in the application and returns
 * standardized error responses. It also handles error logging with context.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */

import logger from '../utils/logger.js';
import { ApplicationError } from '../utils/errors.js';

/**
 * Sanitize error message for production
 * Hides sensitive information like stack traces and database details
 * 
 * @param {Error} error - The error object
 * @param {string} env - The environment (development, production)
 * @returns {string} - Sanitized error message
 */
const sanitizeErrorMessage = (error, env) => {
  // For custom application errors, return the message as-is
  if (error instanceof ApplicationError) {
    return error.message;
  }

  // For production, hide internal error details
  if (env === 'production') {
    // Check for specific error types and provide generic messages
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return 'A database error occurred. Please try again later.';
    }

    if (error.name === 'ValidationError') {
      return 'Invalid data provided. Please check your input.';
    }

    if (error.name === 'CastError') {
      return 'Invalid ID format provided.';
    }

    // Generic message for all other errors
    return 'An unexpected error occurred. Please try again later.';
  }

  // In development, return the actual error message
  return error.message;
};

/**
 * Sanitize error details for production
 * Removes sensitive information from error details
 * 
 * @param {Error} error - The error object
 * @param {string} env - The environment (development, production)
 * @returns {object|null} - Sanitized error details or null
 */
const sanitizeErrorDetails = (error, env) => {
  // Only include details for ApplicationError instances
  if (error instanceof ApplicationError && error.details) {
    return error.details;
  }

  // In development, include additional error information
  if (env === 'development') {
    return {
      name: error.name,
      ...(error.code && { code: error.code }),
    };
  }

  return null;
};

/**
 * Determine HTTP status code from error
 * 
 * @param {Error} error - The error object
 * @returns {number} - HTTP status code
 */
const getStatusCode = (error) => {
  // Use statusCode from ApplicationError instances
  if (error instanceof ApplicationError) {
    return error.statusCode;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return 400;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return 400;
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    return 409; // Conflict
  }

  // Default to 500 for unknown errors
  return 500;
};

/**
 * Determine error code from error
 * 
 * @param {Error} error - The error object
 * @returns {string} - Error code
 */
const getErrorCode = (error) => {
  // Use code from ApplicationError instances
  if (error instanceof ApplicationError) {
    return error.code;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return 'VALIDATION_ERROR';
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return 'INVALID_ID';
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    return 'DUPLICATE_ENTRY';
  }

  // Default error code
  return 'INTERNAL_ERROR';
};

/**
 * Log error with context information
 * 
 * @param {Error} error - The error object
 * @param {object} req - Express request object
 */
const logErrorWithContext = (error, req) => {
  const context = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'unauthenticated',
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
    errorName: error.name,
    errorCode: error.code || 'N/A',
    statusCode: getStatusCode(error),
  };

  // Include stack trace for server errors
  if (getStatusCode(error) >= 500) {
    context.stack = error.stack;
  }

  // Include original error for DatabaseError
  if (error.originalError) {
    context.originalError = {
      message: error.originalError.message,
      name: error.originalError.name,
    };
  }

  // Log at appropriate level based on status code
  if (getStatusCode(error) >= 500) {
    logger.error(error.message, context);
  } else if (getStatusCode(error) >= 400) {
    logger.warn(error.message, context);
  } else {
    logger.info(error.message, context);
  }
};

/**
 * Global Error Handler Middleware
 * 
 * This middleware should be registered LAST in the middleware chain,
 * after all routes and other middleware.
 * 
 * @param {Error} err - The error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error with context
  logErrorWithContext(err, req);

  // Determine status code and error code
  const statusCode = getStatusCode(err);
  const errorCode = getErrorCode(err);

  // Get environment
  const env = process.env.NODE_ENV || 'development';

  // Sanitize error message and details
  const message = sanitizeErrorMessage(err, env);
  const details = sanitizeErrorDetails(err, env);

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
    },
  };

  // Include details if present
  if (details) {
    errorResponse.error.details = details;
  }

  // Include stack trace in development mode for 500 errors
  if (env === 'development' && statusCode >= 500) {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
