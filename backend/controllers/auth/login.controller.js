const User = require('../../models/User');
const Session = require('../../models/Session');
const ActivityLog = require('../../models/ActivityLog');
const { comparePassword, isPasswordExpired, isPasswordExpiringSoon } = require('../../services/password.service');
const { generateTokenPair, verifyRefreshToken } = require('../../services/auth.service');
const { verifyMFAToken, verifyBackupCode, removeBackupCode } = require('../../services/mfa.service');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { isValidMFACode } = require('../../utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, ACTIVITY_TYPES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const config = require('../../config/env');

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password, mfaCode } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +mfaSecret +backupCodes');
    
    if (!user) {
      await ActivityLog.create({
        activityType: ACTIVITY_TYPES.LOGIN_FAILED,
        description: 'Login failed: User not found',
        ipAddress,
        userAgent
      });
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if account is locked
    if (user.isAccountLocked && user.isAccountLocked()) {
      await ActivityLog.create({
        userId: user._id,
        activityType: ACTIVITY_TYPES.LOGIN_FAILED,
        description: 'Login failed: Account locked',
        ipAddress,
        userAgent,
        severity: 'high'
      });
      throw new AppError(ERROR_MESSAGES.ACCOUNT_LOCKED, HTTP_STATUS.FORBIDDEN);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }

    // Check password expiration
    if (user.passwordExpiresAt && isPasswordExpired(user.passwordExpiresAt)) {
      await ActivityLog.create({
        userId: user._id,
        activityType: ACTIVITY_TYPES.LOGIN_FAILED,
        description: 'Login failed: Password expired',
        ipAddress,
        userAgent,
        severity: 'high'
      });
      throw new AppError('Your password has expired. Please reset your password', HTTP_STATUS.FORBIDDEN);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      await ActivityLog.create({
        userId: user._id,
        activityType: ACTIVITY_TYPES.LOGIN_FAILED,
        description: 'Login failed: Invalid password',
        ipAddress,
        userAgent,
        severity: 'high'
      });
      
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaCode) {
        // Return MFA required flag
        return res.status(HTTP_STATUS.OK).json({
          success: false,
          mfaRequired: true,
          message: ERROR_MESSAGES.MFA_REQUIRED
        });
      }

      // Verify MFA code (TOTP or backup code)
      if (!isValidMFACode(mfaCode)) {
        await ActivityLog.create({
          userId: user._id,
          activityType: ACTIVITY_TYPES.LOGIN_FAILED,
          description: 'Login failed: Invalid MFA code format',
          ipAddress,
          userAgent,
          severity: 'high'
        });
        throw new AppError(ERROR_MESSAGES.MFA_INVALID, HTTP_STATUS.UNAUTHORIZED);
      }

      // Try TOTP verification first
      let isMFAValid = verifyMFAToken(mfaCode, user.mfaSecret);
      let usedBackupCode = false;

      // If TOTP fails, try backup codes
      if (!isMFAValid && user.backupCodes && user.backupCodes.length > 0) {
        isMFAValid = verifyBackupCode(mfaCode, user.backupCodes);
        if (isMFAValid) {
          usedBackupCode = true;
          // Remove used backup code
          user.backupCodes = removeBackupCode(mfaCode, user.backupCodes);
          await user.save({ validateBeforeSave: false });
        }
      }

      if (!isMFAValid) {
        await ActivityLog.create({
          userId: user._id,
          activityType: ACTIVITY_TYPES.LOGIN_FAILED,
          description: 'Login failed: Invalid MFA code',
          ipAddress,
          userAgent,
          severity: 'high'
        });
        throw new AppError(ERROR_MESSAGES.MFA_INVALID, HTTP_STATUS.UNAUTHORIZED);
      }
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = ipAddress;
    
    // Check if password is expiring soon
    const passwordExpiringSoon = user.passwordExpiresAt && isPasswordExpiringSoon(user.passwordExpiresAt, config.PASSWORD_EXPIRY_WARNING_DAYS);
    
    await user.save();

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
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.LOGIN,
      description: 'User logged in',
      ipAddress,
      userAgent
    });

    const responseData = {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mfaEnabled: user.mfaEnabled
        },
        ...tokens
      }
    };

    // Add password expiration warning
    if (passwordExpiringSoon) {
      responseData.warning = {
        message: `Your password will expire in ${Math.ceil((user.passwordExpiresAt - new Date()) / (1000 * 60 * 60 * 24))} days`,
        passwordExpiresAt: user.passwordExpiresAt
      };
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify refresh token
    const verification = verifyRefreshToken(token);
    
    if (!verification.valid) {
      throw new AppError(verification.error || ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if session exists
    const session = await Session.findOne({ refreshToken: token });
    
    if (!session || session.expiresAt < new Date()) {
      throw new AppError('Session expired', HTTP_STATUS.UNAUTHORIZED);
    }

    // Get user
    const user = await User.findById(verification.payload.userId);
    
    if (!user || !user.isActive) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Update session with new tokens
    session.sessionToken = tokens.sessionToken;
    session.refreshToken = tokens.refreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      // Delete session
      await Session.deleteOne({ refreshToken: token });
    }

    // Log activity
    if (req.user) {
      await ActivityLog.create({
        userId: req.user.userId,
        activityType: ACTIVITY_TYPES.LOGOUT,
        description: 'User logged out',
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req)
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refreshToken,
  logout
};










