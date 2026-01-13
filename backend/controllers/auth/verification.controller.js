const User = require('../../models/User');
const ActivityLog = require('../../models/ActivityLog');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { HTTP_STATUS, ACTIVITY_TYPES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const { sendVerificationOTPEmail } = require('../../services/email.service');
const crypto = require('crypto');

/**
 * Verify email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError('Email and OTP are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationToken: otp,
      emailVerificationExpires: { $gt: new Date() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      throw new AppError('Invalid or expired verification code', HTTP_STATUS.BAD_REQUEST);
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
      description: 'Email verified via OTP',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification OTP
 */
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists for security, but return success
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If an account exists, a new verification code has been sent.'
      });
    }

    if (user.isEmailVerified) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Email is already verified.'
      });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationToken = otp;
    user.emailVerificationExpires = otpExpires;
    await user.save();

    // Send verification OTP email
    await sendVerificationOTPEmail(user.email, user.firstName, otp);

    // Dev Fallback: Print OTP to console for easy testing
    if (config.NODE_ENV === 'development') {
      console.log('\n==========================================');
      console.log('  RESENT DEVELOPMENT OTP: ', otp);
      console.log('  EMAIL: ', user.email);
      console.log('==========================================\n');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyEmail,
  resendOTP
};














