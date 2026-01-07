# Security Documentation

This document provides comprehensive information about the security features and implementations in the TicketGate API backend.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Password Security](#password-security)
3. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
4. [API Security](#api-security)
5. [Data Protection](#data-protection)
6. [Payment Security](#payment-security)
7. [Logging & Monitoring](#logging--monitoring)
8. [Rate Limiting](#rate-limiting)
9. [Input Validation & Sanitization](#input-validation--sanitization)
10. [Security Best Practices](#security-best-practices)

---

## Authentication & Authorization

### JWT Tokens

- **Access Tokens**: Short-lived tokens (default: 15 minutes) for API access
- **Refresh Tokens**: Long-lived tokens (default: 7 days) for token renewal
- **Token Storage**: Refresh tokens stored in database with expiration
- **Token Rotation**: New refresh tokens issued on each refresh
- **Token Verification**: Strict verification with issuer and audience validation

### Role-Based Access Control (RBAC)

The system implements four user roles:

- **Admin**: Full system access
- **Organizer**: Can create and manage events
- **Staff**: Can check-in tickets
- **User**: Can purchase tickets and manage profile

### Session Management

- Sessions stored in MongoDB with expiration
- Automatic cleanup of expired sessions
- IP address and user agent tracking
- Logout invalidates sessions

---

## Password Security

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Password Hashing

- **Algorithm**: bcrypt
- **Rounds**: 12 (configurable via `BCRYPT_ROUNDS`)
- **Salt**: Automatically generated per password

### Password History

- Last 5 passwords stored in history
- Prevents password reuse
- Automatic expiration after 1 year

### Account Lockout

- **Max Login Attempts**: 5 (configurable)
- **Lockout Duration**: 15 minutes (configurable)
- **Auto-unlock**: Account unlocks after lockout duration
- Failed login attempts logged with severity level

### Password Reset

- Secure token generation using crypto.randomBytes
- Token hashed before storage (SHA-256)
- Token expiration: 1 hour
- Email notification sent on reset request
- Security best practice: Same response for existing/non-existing emails

---

## Multi-Factor Authentication (MFA)

### TOTP Implementation

- **Library**: speakeasy/otplib
- **Algorithm**: Time-based One-Time Password (TOTP)
- **Secret Length**: 32 characters
- **Token Length**: 6 digits
- **Window**: 1 time step (configurable)

### MFA Setup Flow

1. User requests MFA setup
2. System generates secret and QR code
3. User scans QR code with authenticator app
4. User verifies with 6-digit code
5. MFA enabled on successful verification

### MFA Requirements

- Password required to disable MFA
- MFA code required during login if enabled
- Invalid MFA codes logged as security events

---

## API Security

### HTTPS/TLS

- **Recommendation**: Always use HTTPS in production
- **Helmet.js**: Configures secure HTTP headers
- **Content Security Policy**: Configured via Helmet
- **CORS**: Restricted to configured frontend URL

### Security Headers (Helmet.js)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS) in production
- Content Security Policy (CSP)

### Request Size Limits

- JSON body limit: 10MB
- URL-encoded body limit: 10MB
- Protection against DoS attacks

---

## Data Protection

### Encryption

- **Sensitive Data**: Encrypted at rest using AES-256-CBC
- **Encryption Key**: Separate key from JWT secret (configurable)
- **IV Generation**: Random IV per encryption
- **Data in Transit**: TLS/SSL encryption

### Data Sanitization

- HTML tags stripped from user input
- MongoDB operator injection prevention
- SQL injection prevention (MongoDB uses parameterized queries)
- XSS prevention via input sanitization

### PII (Personally Identifiable Information)

- Email addresses partially masked in logs
- Phone numbers partially masked in logs
- Password fields never logged
- Sensitive fields excluded from API responses

---

## Payment Security

### eSewa Integration

- **Signature Verification**: All payment responses verified
- **HMAC-SHA256**: Signature generation and verification
- **Transaction ID**: Unique identifiers for all transactions
- **Webhook Security**: Signature verification on webhooks

### Payment Flow

1. User initiates purchase
2. System creates purchase record with PENDING status
3. System generates payment URL with signature
4. User redirected to eSewa
5. eSewa processes payment
6. Webhook received with signature
7. Signature verified before processing
8. Purchase status updated on verification

### Payment Data Storage

- Payment IDs stored (not full card details)
- eSewa response stored for audit
- Transaction IDs used for reference
- Refund support implemented

---

## Logging & Monitoring

### Logging Levels

- **Error**: Errors and exceptions
- **Warn**: Security events and warnings
- **Info**: General information
- **Debug**: Detailed debugging (development only)

### Security Event Logging

All security-related events are logged:

- Login attempts (success/failure)
- Failed authentication attempts
- Password changes
- Account lockouts
- Rate limit violations
- MFA setup/disable
- Payment transactions
- Admin actions
- Suspicious activities

### Log Storage

- **File-based**: Winston logger with file transports
- **Log Rotation**: 5MB max file size, 5 files kept
- **Security Logs**: Separate file with extended retention
- **Log Retention**: 1 year for activity logs (MongoDB TTL)

### Audit Trail

- User actions tracked in ActivityLog collection
- IP addresses and user agents logged
- Timestamps for all activities
- Metadata stored for context

---

## Rate Limiting

### Rate Limiters

1. **General API**: 100 requests per 15 minutes
2. **Authentication**: 5 requests per 15 minutes
3. **Password Reset**: 3 requests per hour
4. **Registration**: 5 requests per hour
5. **Purchase**: 20 requests per hour

### Rate Limit Implementation

- **Library**: express-rate-limit
- **Key Generation**: User ID (if authenticated) or IP address
- **Storage**: In-memory (can be extended to Redis)
- **Response**: 429 Too Many Requests with retry-after header

### Rate Limit Headers

- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time
- `Retry-After`: Seconds until retry

---

## Input Validation & Sanitization

### Validation Library

- **express-validator**: Used for request validation
- **Custom Validators**: Additional validation in utils/validators.js

### Validation Rules

- Email format validation
- Password strength validation
- Phone number validation (Nepal format)
- URL validation
- Date validation
- MongoDB ObjectId validation
- MFA code format validation

### Sanitization

- HTML tags removed
- MongoDB operators removed (`$`, `.`)
- Whitespace trimmed
- Email normalized to lowercase

---

## Security Best Practices

### Development

1. **Environment Variables**: Never commit `.env` files
2. **Secrets**: Use strong, random secrets in production
3. **Database**: Use strong authentication
4. **Redis**: Use password authentication in production
5. **Email**: Use app-specific passwords, not account passwords

### Production Deployment

1. **HTTPS**: Always use HTTPS
2. **Secrets**: Rotate secrets regularly
3. **Database**: Use connection pooling and SSL
4. **Redis**: Use SSL/TLS in production
5. **Monitoring**: Set up log monitoring and alerting
6. **Backups**: Regular database backups
7. **Updates**: Keep dependencies updated
8. **CORS**: Restrict to specific origins

### Code Security

1. **Error Messages**: Don't expose sensitive information
2. **SQL Injection**: Use parameterized queries (MongoDB)
3. **XSS**: Sanitize all user input
4. **CSRF**: Consider CSRF tokens for state-changing operations
5. **Dependencies**: Regularly update and audit dependencies

### User Security Recommendations

1. **Password Policy**: Enforced strong passwords
2. **MFA**: Encourage MFA usage
3. **Session Management**: Regular logout recommended
4. **Account Security**: Monitor login activity
5. **Email Verification**: Implement email verification (placeholder)

---

## Security Checklist

### Pre-Deployment

- [ ] Change all default secrets
- [ ] Configure HTTPS
- [ ] Set up database authentication
- [ ] Configure Redis password
- [ ] Set up email service
- [ ] Configure CORS properly
- [ ] Review rate limiting settings
- [ ] Set up log monitoring
- [ ] Configure backup strategy
- [ ] Review error messages
- [ ] Test security features
- [ ] Perform security audit

### Post-Deployment

- [ ] Monitor logs regularly
- [ ] Review security events
- [ ] Update dependencies
- [ ] Rotate secrets periodically
- [ ] Review user activity
- [ ] Monitor payment transactions
- [ ] Review failed login attempts
- [ ] Check for suspicious activities

---

## Security Contact

For security issues or questions, please contact the development team.

---

## Changelog

### Version 1.0.0
- Initial security implementation
- JWT authentication
- Password security with bcrypt
- MFA/TOTP support
- Rate limiting
- Comprehensive logging
- Payment gateway security
- Input validation and sanitization

---

**Last Updated**: 2024






