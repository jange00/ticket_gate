const { verifyAccessToken } = require('../services/auth.service');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const User = require('../models/User');
const { AppError } = require('./errorHandler.middleware');
const logger = require('../services/logging.service');

/**
 * Authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const verification = verifyAccessToken(token);
    
    if (!verification.valid) {
      throw new AppError(verification.error || ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Get user from database
    const user = await User.findById(verification.payload.userId);
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }

    // Check if account is locked
    if (user.isAccountLocked && user.isAccountLocked()) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_LOCKED, HTTP_STATUS.FORBIDDEN);
    }

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    
    logger.error('Authentication error:', error);
    next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
  }
};

/**
 * Optional authentication - doesn't fail if token is missing
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verification = verifyAccessToken(token);
      
      if (verification.valid) {
        const user = await User.findById(verification.payload.userId);
        if (user && user.isActive && (!user.isAccountLocked || !user.isAccountLocked())) {
          req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
