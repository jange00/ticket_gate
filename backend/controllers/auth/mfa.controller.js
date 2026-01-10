const User = require('../../models/User');
const { generateMFASecret, verifyMFAToken, generateBackupCodes, encryptBackupCodes } = require('../../services/mfa.service');
const { comparePassword } = require('../../services/password.service');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');

/**
 * Setup MFA
 */
const setupMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA is already enabled', HTTP_STATUS.BAD_REQUEST);
    }

    // Generate MFA secret
    const mfaSecret = generateMFASecret(user.email);

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const encryptedBackupCodes = encryptBackupCodes(backupCodes);

    // Save secret and backup codes (temporarily, until verified)
    user.mfaSecret = mfaSecret.secret;
    user.backupCodes = encryptedBackupCodes;
    await user.save({ validateBeforeSave: false });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        secret: mfaSecret.secret,
        otpauthUrl: mfaSecret.otpauth_url,
        backupCodes: backupCodes // Return plain codes only once during setup
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify and enable MFA
 */
const verifyMFA = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.userId).select('+mfaSecret');

    if (!user || !user.mfaSecret) {
      throw new AppError('MFA setup not initiated', HTTP_STATUS.BAD_REQUEST);
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA is already enabled', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify code
    const isValid = verifyMFAToken(code, user.mfaSecret);
    if (!isValid) {
      throw new AppError(ERROR_MESSAGES.MFA_INVALID, HTTP_STATUS.BAD_REQUEST);
    }

    // Enable MFA
    user.mfaEnabled = true;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable MFA
 */
const disableMFA = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.backupCodes = [];
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setupMFA,
  verifyMFA,
  disableMFA
};














