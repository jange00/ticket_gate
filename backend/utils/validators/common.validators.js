/**
 * Validate MFA code format (6 digits)
 */
const isValidMFACode = (code) => {
  return /^\d{6}$/.test(code);
};

/**
 * Validate currency amount
 */
const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0 && isFinite(num);
};

module.exports = {
  isValidMFACode,
  isValidAmount
};








