// User Roles
const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  USER: 'user',
  STAFF: 'staff'
};

// Event Status
const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Ticket Status
const TICKET_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  // Legacy statuses for ticket types
  AVAILABLE: 'available',
  SOLD_OUT: 'sold_out',
  RESERVED: 'reserved'
};

// Purchase Status
const PURCHASE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Refund Status
const REFUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSED: 'processed',
  FAILED: 'failed'
};

// Activity Types
const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  REGISTRATION: 'registration',
  PASSWORD_CHANGED: 'password_changed',
  PROFILE_UPDATED: 'profile_updated',
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',
  TICKET_PURCHASED: 'ticket_purchased',
  TICKET_REFUNDED: 'ticket_refunded',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  CHECK_IN: 'check_in',
  ADMIN_ACTION: 'admin_action'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts',
  TOKEN_EXPIRED: 'Token expired',
  TOKEN_INVALID: 'Invalid token',
  MFA_REQUIRED: 'Multi-factor authentication required',
  MFA_INVALID: 'Invalid MFA code',
  PAYMENT_FAILED: 'Payment processing failed',
  INSUFFICIENT_TICKETS: 'Insufficient tickets available',
  EVENT_NOT_FOUND: 'Event not found',
  TICKET_NOT_FOUND: 'Ticket not found'
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EVENT_CREATED: 'Event created successfully',
  TICKET_PURCHASED: 'Ticket purchased successfully',
  REFUND_PROCESSED: 'Refund processed successfully'
};

module.exports = {
  ROLES,
  EVENT_STATUS,
  TICKET_STATUS,
  PURCHASE_STATUS,
  REFUND_STATUS,
  ACTIVITY_TYPES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
