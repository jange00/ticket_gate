const validator = require('validator');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return validator.isEmail(email) && email.length <= 255;
};

/**
 * Validate phone number (Nepal format)
 */
const isValidPhone = (phone) => {
  // Nepal phone number format: +977-XXXXXXXXX or 98XXXXXXXX
  const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
  const cleaned = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleaned);
};

/**
 * Validate URL
 */
const isValidUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

/**
 * Validate date
 */
const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * Validate positive number
 */
const isValidPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Validate non-negative integer
 */
const isValidNonNegativeInteger = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

/**
 * Validate object ID format (MongoDB)
 */
const isValidObjectId = (id) => {
  return validator.isMongoId(id);
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidDate,
  isValidPositiveNumber,
  isValidNonNegativeInteger,
  isValidObjectId
};











