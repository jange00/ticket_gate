require('dotenv').config();

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketgate',
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  
  // eSewa Payment Gateway
  ESEWA_MERCHANT_ID: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  ESEWA_TOKEN: process.env.ESEWA_TOKEN || '123456',
  ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  ESEWA_CLIENT_ID: process.env.ESEWA_CLIENT_ID || 'JB0BBQ4aD0UqIThFJwAKBgAXEUkEGQUBBAwdOgABHD4DChwUAB0R',
  ESEWA_CLIENT_SECRET: process.env.ESEWA_CLIENT_SECRET || 'BhwIWQQADhIYSxILExMcAgFXFhcOBwAKBgAXEQ==',
  ESEWA_BASE_URL: process.env.ESEWA_BASE_URL || 'https://uat.esewa.com.np',
  ESEWA_API_URL: process.env.ESEWA_API_URL || 'https://uat.esewa.com.np/api/epay/main/v2/form',
  ESEWA_ENV: process.env.ESEWA_ENV || (process.env.NODE_ENV === 'development' ? 'test' : 'production'),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // PayPal Payment Gateway
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'AcnpbvL-nqay69eboBK-a2hcQLnkFTQZXbTF0f4UafVwhRYAXe11Z0B3PtFyWCTDH24INY6Cu2U0rhRC',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || 'EGZXWncK71BKAfqH7ClPpldekK6kSKvO9yIk0Loz36CkdM7uLC_vuE5mjbGjRhJhBT5BeOYyBB-_p6WW',
  PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  PAYPAL_API_BASE_URL: process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com',
  PAYPAL_EXCHANGE_RATE: parseFloat(process.env.PAYPAL_EXCHANGE_RATE || '135'), // 1 USD = 135 NPR
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ticketgate.com',
  
  // App URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:3000/api',
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '12'),
  PASSWORD_EXPIRY_DAYS: parseInt(process.env.PASSWORD_EXPIRY_DAYS || '90'),
  PASSWORD_EXPIRY_WARNING_DAYS: parseInt(process.env.PASSWORD_EXPIRY_WARNING_DAYS || '10'),
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_TIME: parseInt(process.env.LOCKOUT_TIME || '180000'), // 3 minutes
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5'),
  
  // MFA
  MFA_ISSUER: process.env.MFA_ISSUER || 'TicketGate',
  MFA_WINDOW: parseInt(process.env.MFA_WINDOW || '1'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
};
