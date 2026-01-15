const User = require('../../models/User');
const Session = require('../../models/Session');
const PasswordHistory = require('../../models/PasswordHistory');
const ActivityLog = require('../../models/ActivityLog');
const { hashPassword, calculatePasswordExpiration } = require('../../services/password.service');
const { generateTokenPair } = require('../../services/auth.service');
const { sendVerificationOTPEmail } = require('../../services/email.service');
const { getClientIp, getUserAgent, generateRandomString } = require('../../utils/helpers');
const { isValidEmail, isValidPassword } = require('../../utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ACTIVITY_TYPES, ROLES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const logger = require('../../services/logging.service');
const config = require('../../config/env');
const crypto = require('crypto');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Validate email
    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate role if provided (default to user)
    const userRole = role && Object.values(ROLES).includes(role) ? role : ROLES.USER;

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with password expiration and OTP
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: userRole,
      passwordChangedAt: now,
      passwordExpiresAt: calculatePasswordExpiration(now),
      isEmailVerified: false,
      emailVerificationToken: otp,
      emailVerificationExpires: otpExpires,
      twoFactorEnabled: true // Enforced for all roles by default
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
      description: `User registered as ${userRole}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    // Send verification OTP email (async, don't wait)
    sendVerificationOTPEmail(user.email, user.firstName, otp).catch(err => {
      logger.error('Failed to send verification email:', err);
    });

    // Dev Fallback: Print OTP to console for easy testing
    if (config.NODE_ENV === 'development') {
      console.log('\n==========================================');
      console.log('  DEVELOPMENT OTP: ', otp);
      console.log('  EMAIL: ', user.email);
      console.log('==========================================\n');
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      data: {
        email: user.email,
        verificationRequired: true
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register
};














