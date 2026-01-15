const { OAuth2Client } = require('google-auth-library');
const User = require('../../models/User');
const Session = require('../../models/Session');
const { generateTokenPair } = require('../../services/auth.service');
const { getClientIp, getUserAgent } = require('../../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorHandler.middleware');
const config = require('../../config/env');
const axios = require('axios');

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/**
 * Login with Google
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body; // In this flow, credential is the access_token
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    if (!credential) {
      throw new AppError('Google credential is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify access token
    let tokenInfo;
    try {
      tokenInfo = await client.getTokenInfo(credential);
    } catch (err) {
      throw new AppError('Invalid Google token', HTTP_STATUS.UNAUTHORIZED);
    }

    // Fetch user profile info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` }
    });

    const { email, sub: googleId, given_name: firstName, family_name: lastName, picture } = userInfoResponse.data;

    if (!email) {
      throw new AppError('Google account does not have an email', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() }); // Ensure email comparison is case-insensitive

    if (user) {
      // User exists - link Google account if not linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: email.toLowerCase(),
        firstName: firstName || 'Google User',
        lastName: lastName || '', 
        googleId,
        authProvider: 'google',
        isEmailVerified: true, // Google emails are verified
        isActive: true,
        role: 'user' // Default role
      });
    }

    // Check if account is locked/inactive
    if (!user.isActive) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_INACTIVE, HTTP_STATUS.FORBIDDEN);
    }

    if (user.isAccountLocked && user.isAccountLocked()) {
        throw new AppError(ERROR_MESSAGES.ACCOUNT_LOCKED, HTTP_STATUS.FORBIDDEN);
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = ipAddress;
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

    // Set refresh token cookie
    // Note: login.controller.js doesn't seem to set cookie? 
    // Wait, login.controller.js returns tokens in JSON. 
    // It does NOT set cookie in response. The frontend stores it?
    // Let's check login.controller.js again.
    // It returns 'data: { ...tokens }'. It does NOT set cookie.
    // So I should follow the pattern. 
    // The previous implementation set cookie, which might be inconsistent.
    // I will remove cookie setting to match login.controller.js unless I see it there.
    // Reviewed login.controller.js: No res.cookie calls.

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged in successfully with Google',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        sessionToken: tokens.sessionToken,
        user: {
          id: user._id, // Frontend expects 'id', login.controller sends 'id'
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled,
          picture: picture 
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleLogin
};
