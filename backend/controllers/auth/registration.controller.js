const User = require('../../models/User');
const Session = require('../../models/Session');
const PasswordHistory = require('../../models/PasswordHistory');
const ActivityLog = require('../../models/ActivityLog');
const { hashPassword, calculatePasswordExpiration } = require('../../services/password.service');
const { generateTokenPair } = require('../../services/auth.service');
const { sendWelcomeEmail } = require('../../services/email.service');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { isValidEmail, isValidPassword } = require('../../utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ACTIVITY_TYPES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const logger = require('../../services/logging.service');
const config = require('../../config/env');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate email
    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate password
    const passwordValidation = isValidPassword(password, config.PASSWORD_MIN_LENGTH);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message, HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('User with this email already exists', HTTP_STATUS.CONFLICT);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const now = new Date();

    // Create user with password expiration
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      passwordChangedAt: now,
      passwordExpiresAt: calculatePasswordExpiration(now)
    });

    // Save password to history (keep last 5 passwords)
    await PasswordHistory.create({
      userId: user._id,
      hashedPassword
    });

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.REGISTRATION,
      description: 'User registered',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user.email, user.firstName).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Create session
    await Session.create({
      userId: user._id,
      sessionToken: tokens.sessionToken,
      refreshToken: tokens.refreshToken,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register
};







