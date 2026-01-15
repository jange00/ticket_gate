const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');
const logger = require('../services/logging.service');
const config = require('../config/env');

// Store for rate limit (fallback if Redis is not available)
const memoryStore = new Map();

/**
 * Create rate limiter
 */
const createRateLimiter = (windowMs, maxRequests, message) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const email = req.body?.email?.toLowerCase();
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        email,
        url: req.originalUrl,
        method: req.method
      });
      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    // Custom key generator
    keyGenerator: (req) => {
      // Use email if provided in body (for login/auth isolation), otherwise user ID or IP
      const email = req.body?.email?.toLowerCase()?.trim();
      
      // If we have an email, use it as the unique key for this bucket
      if (email) {
        return `rate_limit_email_${email}`;
      }
      
      // Fallback to user ID or IP
      return req.user?.userId || req.ip || 'unknown';
    }
  });
};

/**
 * General API rate limiter (100 per IP per minute)
 */
const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests per minute
  'Too many requests from this IP, please try again later'
);

/**
 * Login rate limiter (5 per 3 minutes per account)
 */
const loginLimiter = createRateLimiter(
  3 * 60 * 1000, // 3 minutes
  5, // 5 requests per 3 minutes
  'Too many login attempts, please try again later'
);

/**
 * Authentication rate limiter (stricter) - for other auth endpoints
 */
const authLimiter = createRateLimiter(
  3 * 60 * 1000, // 3 minutes
  config.RATE_LIMIT_AUTH_MAX || 5,
  'Too many authentication attempts, please try again later'
);

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour
  'Too many password reset requests, please try again later'
);

/**
 * Registration rate limiter
 */
const registrationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 registrations per hour
  'Too many registration attempts, please try again later'
);

/**
 * Purchase rate limiter (10 per user per hour)
 */
const purchaseLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 purchases per hour
  'Too many purchase attempts, please try again later'
);

/**
 * Forgot password rate limiter (3 per email per hour)
 */
const forgotPasswordLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour per email
  'Too many password reset requests, please try again later'
);

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  forgotPasswordLimiter,
  registrationLimiter,
  purchaseLimiter
};
