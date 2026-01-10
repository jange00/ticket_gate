const User = require('../../models/User');
const ActivityLog = require('../../models/ActivityLog');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { HTTP_STATUS, ACTIVITY_TYPES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const crypto = require('crypto');

/**
 * Verify email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Hash token
    const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: { $gt: new Date() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      throw new AppError('Invalid or expired verification token', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.PROFILE_UPDATED,
      description: 'Email verified',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyEmail
};









