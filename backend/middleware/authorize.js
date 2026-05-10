import logger from '../utils/logger.js';

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required role
 * @param {string|Array<string>} allowedRoles - Role(s) allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by authenticate middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
        });
      }

      // Check if user has required role
      const userRole = req.user.role;
      const hasPermission = allowedRoles.includes(userRole);

      if (!hasPermission) {
        logger.warn('Authorization failed', {
          userId: req.user._id,
          userRole,
          requiredRoles: allowedRoles,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
          },
        });
      }

      // User is authorized
      next();
    } catch (error) {
      logger.error('Authorization middleware error', { error: error.message });
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authorization check failed',
        },
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = authorize('admin');

export { authorize, requireAdmin };
