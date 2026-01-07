const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('./logging.service');
const { encrypt, decrypt } = require('./encryption.service');

/**
 * Generate MFA secret for user
 */
const generateMFASecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `${config.MFA_ISSUER} (${email})`,
    issuer: config.MFA_ISSUER,
    length: 32
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url
  };
};

/**
 * Generate QR code for MFA setup
 */
const generateMFAQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    logger.error('QR code generation failed:', error);
    throw error;
  }
};

/**
 * Verify MFA token
 */
const verifyMFAToken = (token, secret) => {
  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: config.MFA_WINDOW
    });

    return verified;
  } catch (error) {
    logger.error('MFA verification failed:', error);
    return false;
  }
};

/**
 * Generate TOTP token (for testing)
 */
const generateTOTPToken = (secret) => {
  try {
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    return token;
  } catch (error) {
    logger.error('TOTP token generation failed:', error);
    throw null;
  }
};

/**
 * Generate backup codes (10 codes, 8 digits each)
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-digit code
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  return codes;
};

/**
 * Encrypt backup codes
 */
const encryptBackupCodes = (codes) => {
  return codes.map(code => encrypt(code));
};

/**
 * Decrypt backup codes
 */
const decryptBackupCodes = (encryptedCodes) => {
  try {
    return encryptedCodes.map(encryptedCode => decrypt(encryptedCode));
  } catch (error) {
    logger.error('Backup code decryption failed:', error);
    return [];
  }
};

/**
 * Verify backup code
 */
const verifyBackupCode = (code, encryptedCodes) => {
  try {
    const decryptedCodes = decryptBackupCodes(encryptedCodes);
    const normalizedCode = code.toString().trim();
    return decryptedCodes.includes(normalizedCode);
  } catch (error) {
    logger.error('Backup code verification failed:', error);
    return false;
  }
};

/**
 * Remove used backup code
 */
const removeBackupCode = (code, encryptedCodes) => {
  try {
    const decryptedCodes = decryptBackupCodes(encryptedCodes);
    const normalizedCode = code.toString().trim();
    const filteredCodes = decryptedCodes.filter(c => c !== normalizedCode);
    return encryptBackupCodes(filteredCodes);
  } catch (error) {
    logger.error('Backup code removal failed:', error);
    return encryptedCodes;
  }
};

module.exports = {
  generateMFASecret,
  generateMFAQRCode,
  verifyMFAToken,
  generateTOTPToken,
  generateBackupCodes,
  encryptBackupCodes,
  decryptBackupCodes,
  verifyBackupCode,
  removeBackupCode
};
