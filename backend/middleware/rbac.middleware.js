const { ROLES } = require('../utils/constants');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const { PERMISSIONS, hasPermission, hasAnyPermission } = require('../utils/permissions');
const { AppError } = require('./errorHandler.middleware');

/**
 * Role-based access control middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    }

    const userRole = req.user.role;

    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Require organizer or admin role
 */
const requireOrganizer = requireRole(ROLES.ORGANIZER, ROLES.ADMIN);

/**
 * Require staff, organizer, or admin role
 */
const requireStaff = requireRole(ROLES.STAFF, ROLES.ORGANIZER, ROLES.ADMIN);

/**
 * Check if user owns resource or is admin
 */
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    }

    // Admin can access anything
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Check ownership
    const resourceUserId = req.resource?.[resourceUserIdField]?.toString();
    const userId = req.user.userId;

    if (resourceUserId !== userId) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require specific permission
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    }

    const userRole = req.user.role;

    // Admin has all permissions
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // Check if user has any of the required permissions
    if (!hasAnyPermission(userRole, requiredPermissions)) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require all specified permissions
 */
const requireAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    }

    const userRole = req.user.role;

    // Admin has all permissions
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // Check if user has all required permissions
    const userPermissions = require('../utils/permissions').getPermissionsForRole(userRole);
    const hasAll = requiredPermissions.every(permission => userPermissions.includes(permission));

    if (!hasAll) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require MFA if enabled
 */
const requireMFA = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
    }

    // For now, MFA check is handled in the controller
    // This middleware can be extended to check MFA status from session/Redis
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireRole,
  requireAdmin,
  requireOrganizer,
  requireStaff,
  requireOwnershipOrAdmin,
  requirePermission,
  requireAllPermissions,
  requireMFA,
  PERMISSIONS
};
