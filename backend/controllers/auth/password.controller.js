const User = require('../../models/User');
const Session = require('../../models/Session');
const PasswordHistory = require('../../models/PasswordHistory');
const ActivityLog = require('../../models/ActivityLog');
const { hashPassword, comparePassword, isPasswordInHistory, calculatePasswordExpiration } = require('../../services/password.service');
const { sendPasswordResetEmail } = require('../../services/email.service');
const { generateSecureToken } = require('../../services/encryption.service');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { isValidPassword } = require('../../utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ACTIVITY_TYPES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const logger = require('../../services/logging.service');
const config = require('../../config/env');
const crypto = require('crypto');

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate new password
    const passwordValidation = isValidPassword(newPassword, config.PASSWORD_MIN_LENGTH);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message, HTTP_STATUS.BAD_REQUEST);
    }

    // Check password history (last 5 passwords)
    const passwordHistory = await PasswordHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('hashedPassword');

    const isInHistory = await isPasswordInHistory(newPassword, passwordHistory);
    if (isInHistory) {
      throw new AppError('New password cannot be one of your last 5 passwords', HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    const now = new Date();

    // Update password with expiration tracking
    user.password = hashedPassword;
    user.passwordChangedAt = now;
    user.passwordExpiresAt = calculatePasswordExpiration(now);
    
    // Invalidate all other sessions (keep current session)
    const currentSessionToken = req.headers['x-session-token'];
    if (currentSessionToken) {
      await Session.deleteMany({
        userId: user._id,
        sessionToken: { $ne: currentSessionToken }
      });
    } else {
      // If no session token provided, invalidate all sessions
      await Session.deleteMany({ userId: user._id });
    }
    
    await user.save();

    // Save to password history
    await PasswordHistory.create({
      userId: user._id,
      hashedPassword
    });

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.PASSWORD_CHANGED,
      description: 'Password changed',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      severity: 'high'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.firstName, resetToken);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate new password
    const passwordValidation = isValidPassword(newPassword, config.PASSWORD_MIN_LENGTH);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message, HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    const now = new Date();

    // Update password with expiration tracking
    user.password = hashedPassword;
    user.passwordChangedAt = now;
    user.passwordExpiresAt = calculatePasswordExpiration(now);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Invalidate all sessions on password reset
    await Session.deleteMany({ userId: user._id });
    
    await user.save();

    // Save to password history
    await PasswordHistory.create({
      userId: user._id,
      hashedPassword
    });

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.PASSWORD_CHANGED,
      description: 'Password reset',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      severity: 'high'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  changePassword,
  requestPasswordReset,
  resetPassword
};














