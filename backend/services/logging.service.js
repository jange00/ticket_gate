const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'ticketgate-api' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat
    }),
    // Write security events to security.log
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10, // Keep more security logs
      format: logFormat
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for non-production environments
if (config.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Security logging functions
const securityLogger = {
  logLoginAttempt: (userId, email, ip, success, reason = null) => {
    logger.warn('Security Event: Login Attempt', {
      type: 'login_attempt',
      userId,
      email: email ? email.substring(0, 3) + '***' : null,
      ip,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  logPasswordChange: (userId, ip) => {
    logger.warn('Security Event: Password Change', {
      type: 'password_change',
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  },

  logFailedAuth: (email, ip, reason) => {
    logger.warn('Security Event: Failed Authentication', {
      type: 'failed_auth',
      email: email ? email.substring(0, 3) + '***' : null,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  logRateLimitExceeded: (ip, endpoint) => {
    logger.warn('Security Event: Rate Limit Exceeded', {
      type: 'rate_limit_exceeded',
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },

  logSuspiciousActivity: (userId, activity, details) => {
    logger.warn('Security Event: Suspicious Activity', {
      type: 'suspicious_activity',
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  },

  logPaymentActivity: (userId, transactionId, amount, status, details = {}) => {
    logger.info('Payment Activity', {
      type: 'payment',
      userId,
      transactionId,
      amount,
      status,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  logAdminAction: (adminId, action, targetId, details = {}) => {
    logger.warn('Admin Action', {
      type: 'admin_action',
      adminId,
      action,
      targetId,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = logger;
module.exports.securityLogger = securityLogger;









