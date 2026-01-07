const bcrypt = require('bcrypt');
const config = require('../config/env');
const logger = require('./logging.service');

/**
 * Hash password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('Password hashing failed:', error);
    throw error;
  }
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error('Password comparison failed:', error);
    return false;
  }
};

/**
 * Check if password was recently used
 */
const isPasswordInHistory = async (password, passwordHistory) => {
  for (const historyItem of passwordHistory) {
    const isMatch = await comparePassword(password, historyItem.hashedPassword);
    if (isMatch) {
      return true;
    }
  }
  return false;
};

/**
 * Check if password is expired
 */
const isPasswordExpired = (passwordExpiresAt) => {
  if (!passwordExpiresAt) return false;
  return new Date() > new Date(passwordExpiresAt);
};

/**
 * Check if password expires soon (within warning days)
 */
const isPasswordExpiringSoon = (passwordExpiresAt, warningDays = 10) => {
  if (!passwordExpiresAt) return false;
  const warningDate = new Date(passwordExpiresAt);
  warningDate.setDate(warningDate.getDate() - warningDays);
  return new Date() >= warningDate && !isPasswordExpired(passwordExpiresAt);
};

/**
 * Calculate password expiration date
 */
const calculatePasswordExpiration = (passwordChangedAt) => {
  if (!passwordChangedAt) {
    passwordChangedAt = new Date();
  }
  const expirationDate = new Date(passwordChangedAt);
  expirationDate.setDate(expirationDate.getDate() + config.PASSWORD_EXPIRY_DAYS);
  return expirationDate;
};

module.exports = {
  hashPassword,
  comparePassword,
  isPasswordInHistory,
  isPasswordExpired,
  isPasswordExpiringSoon,
  calculatePasswordExpiration
};
