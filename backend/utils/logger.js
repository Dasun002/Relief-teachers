/**
 * Simple logger utility
 * Can be replaced with Winston or Pino for production
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 
    ? `\n  Context: ${JSON.stringify(context, null, 2)}`
    : '';
  
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * Log error message
 */
const error = (message, context = {}) => {
  console.error(formatMessage(LOG_LEVELS.ERROR, message, context));
};

/**
 * Log warning message
 */
const warn = (message, context = {}) => {
  console.warn(formatMessage(LOG_LEVELS.WARN, message, context));
};

/**
 * Log info message
 */
const info = (message, context = {}) => {
  console.log(formatMessage(LOG_LEVELS.INFO, message, context));
};

/**
 * Log debug message (only in development)
 */
const debug = (message, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatMessage(LOG_LEVELS.DEBUG, message, context));
  }
};

/**
 * Log HTTP request
 */
const logRequest = (req) => {
  info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

/**
 * Log error with stack trace
 */
const logError = (error, context = {}) => {
  const errorContext = {
    ...context,
    message: error.message,
    stack: error.stack,
  };
  
  console.error(formatMessage(LOG_LEVELS.ERROR, 'Error occurred', errorContext));
};

export default {
  error,
  warn,
  info,
  debug,
  logRequest,
  logError,
};
