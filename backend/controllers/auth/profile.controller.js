const User = require('../../models/User');
const ActivityLog = require('../../models/ActivityLog');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, ACTIVITY_TYPES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        mfaEnabled: user.mfaEnabled || false,
        isEmailVerified: user.isEmailVerified || false,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.PROFILE_UPDATED,
      description: 'User profile updated',
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle 2FA
 */
const toggle2FA = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    user.twoFactorEnabled = enabled;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      activityType: ACTIVITY_TYPES.PROFILE_UPDATED,
      description: `2FA ${enabled ? 'enabled' : 'disabled'}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: { twoFactorEnabled: user.twoFactorEnabled }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  toggle2FA
};





