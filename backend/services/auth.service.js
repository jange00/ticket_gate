const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('./logging.service');

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
      issuer: 'ticketgate-api',
      audience: 'ticketgate-client'
    }
  );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      type: 'refresh'
    },
    config.JWT_REFRESH_SECRET,
    {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      issuer: 'ticketgate-api',
      audience: 'ticketgate-client'
    }
  );
};

/**
 * Verify JWT access token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'ticketgate-api',
      audience: 'ticketgate-client'
    });
    return { valid: true, payload: decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    } else if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    } else {
      return { valid: false, error: error.message };
    }
  }
};

/**
 * Verify JWT refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
      issuer: 'ticketgate-api',
      audience: 'ticketgate-client'
    });
    
    if (decoded.type !== 'refresh') {
      return { valid: false, error: 'Invalid token type' };
    }
    
    return { valid: true, payload: decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    } else if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    } else {
      return { valid: false, error: error.message };
    }
  }
};

/**
 * Generate session token (random 256-bit token)
 */
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate token pair
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const sessionToken = generateSessionToken();
  
  return {
    accessToken,
    refreshToken,
    sessionToken,
    tokenType: 'Bearer',
    expiresIn: config.JWT_EXPIRES_IN
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  generateSessionToken
};
