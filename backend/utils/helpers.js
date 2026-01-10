const crypto = require('crypto');

/**
 * Generate a random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a unique transaction ID
 */
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = generateRandomString(8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate a unique ticket code
 */
const generateTicketCode = (eventId, ticketTypeId) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = generateRandomString(4).toUpperCase();
  return `${eventId.slice(-4)}-${ticketTypeId.slice(-4)}-${timestamp}-${random}`;
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'NPR') => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Sanitize input - remove HTML tags and trim whitespace
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove remaining angle brackets
};

/**
 * Mask sensitive data (email, phone)
 */
const maskSensitiveData = (data, type = 'email') => {
  if (!data) return '';
  
  if (type === 'email') {
    const [name, domain] = data.split('@');
    if (!domain) return data;
    const maskedName = name.length > 2 
      ? name.substring(0, 2) + '*'.repeat(name.length - 2)
      : '*'.repeat(name.length);
    return `${maskedName}@${domain}`;
  }
  
  if (type === 'phone') {
    if (data.length <= 4) return '*'.repeat(data.length);
    return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2);
  }
  
  return data;
};

/**
 * Parse pagination parameters
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination metadata
 */
const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    'unknown';
};

/**
 * Get user agent from request
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Check if date is in the future
 */
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Check if date is in the past
 */
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Add days to a date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Format date for display
 */
const formatDate = (date, format = 'long') => {
  const d = new Date(date);
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return d.toISOString();
};

module.exports = {
  generateRandomString,
  generateTransactionId,
  generateTicketCode,
  formatCurrency,
  sanitizeInput,
  maskSensitiveData,
  parsePagination,
  buildPaginationMeta,
  getClientIp,
  getUserAgent,
  isFutureDate,
  isPastDate,
  addDays,
  formatDate
};









