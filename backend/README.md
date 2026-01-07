# TicketGate API Backend

A secure, production-ready RESTful API backend for an event management and ticketing system.

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens, role-based access control (RBAC)
- **Password Security**: bcrypt hashing, password history, account lockout
- **Multi-Factor Authentication (MFA)**: TOTP-based MFA using speakeasy/otplib
- **Payment Integration**: eSewa payment gateway integration
- **Event Management**: Create, update, and manage events
- **Ticket Management**: Ticket types, pricing, and availability
- **Purchase System**: Secure ticket purchase flow with payment processing
- **Check-in System**: QR code-based ticket check-in
- **Refund Management**: Refund request and processing system
- **Comprehensive Logging**: Winston-based logging with security event tracking
- **Rate Limiting**: Multiple rate limiters for different endpoints
- **Input Validation**: express-validator for request validation
- **Security**: Helmet.js security headers, CORS, input sanitization

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Cache/Sessions**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **MFA**: speakeasy/otplib
- **Security**: Helmet.js
- **Rate Limiting**: express-rate-limit
- **Validation**: express-validator
- **Logging**: Winston, Morgan
- **Payment**: eSewa API

## Project Structure

```
backend/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   ├── redis.js         # Redis connection
│   ├── esewa.js         # eSewa payment config
│   └── env.js           # Environment variables
├── models/              # Database models
│   ├── User.js
│   ├── Event.js
│   ├── Ticket.js
│   ├── Purchase.js
│   ├── Refund.js
│   ├── ActivityLog.js
│   ├── PasswordHistory.js
│   └── Session.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── events.routes.js
│   ├── tickets.routes.js
│   ├── purchases.routes.js
│   ├── checkin.routes.js
│   ├── refunds.routes.js
│   ├── admin.routes.js
│   └── webhooks.routes.js
├── controllers/         # Route handlers
│   ├── auth.controller.js
│   ├── events.controller.js
│   ├── tickets.controller.js
│   ├── purchases.controller.js
│   ├── checkin.controller.js
│   ├── refunds.controller.js
│   └── admin.controller.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   ├── rbac.middleware.js
│   ├── rateLimit.middleware.js
│   ├── validate.middleware.js
│   └── errorHandler.middleware.js
├── services/            # Business logic
│   ├── auth.service.js
│   ├── password.service.js
│   ├── mfa.service.js
│   ├── email.service.js
│   ├── payment.service.js
│   ├── qrcode.service.js
│   ├── logging.service.js
│   └── encryption.service.js
├── utils/               # Utility functions
│   ├── validators.js
│   ├── helpers.js
│   └── constants.js
├── logs/                # Log files (generated)
├── app.js               # Express app setup
├── server.js            # Entry point
├── package.json
└── SECURITY.md          # Security documentation
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory (see `.env.example` for reference):
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ticketgate
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   # ... (see .env.example for all variables)
   ```

4. **Start MongoDB and Redis**
   - MongoDB: Ensure MongoDB is running on your system
   - Redis: Ensure Redis is running on your system (optional but recommended)

5. **Run the application**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- **Database**: `MONGODB_URI`
- **Redis**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **JWT**: `JWT_SECRET`, `JWT_REFRESH_SECRET`
- **eSewa**: `ESEWA_MERCHANT_ID`, `ESEWA_SECRET_KEY`, etc.
- **Email**: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/mfa/setup` - Setup MFA
- `POST /api/auth/mfa/verify` - Verify and enable MFA
- `POST /api/auth/mfa/disable` - Disable MFA

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/my-events` - Get organizer's events
- `POST /api/events` - Create event (Organizer/Admin)
- `PUT /api/events/:id` - Update event (Organizer/Admin)
- `DELETE /api/events/:id` - Delete event (Organizer/Admin)
- `POST /api/events/:id/publish` - Publish event (Organizer/Admin)

### Tickets
- `GET /api/tickets/event/:eventId` - Get tickets for event
- `POST /api/tickets/event/:eventId` - Create ticket (Organizer/Admin)
- `PUT /api/tickets/:id` - Update ticket (Organizer/Admin)
- `DELETE /api/tickets/:id` - Delete ticket (Organizer/Admin)

### Purchases
- `POST /api/purchases` - Create purchase (initiate payment)
- `GET /api/purchases/my-purchases` - Get user's purchases
- `GET /api/purchases/:id` - Get purchase by ID

### Check-in
- `POST /api/checkin` - Check-in ticket (Staff/Organizer/Admin)
- `GET /api/checkin/:purchaseId` - Get check-in status

### Refunds
- `POST /api/refunds` - Request refund
- `GET /api/refunds/my-refunds` - Get user's refunds
- `POST /api/refunds/:id/process` - Process refund (Organizer/Admin)

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/users/:id` - Get user by ID (Admin)
- `PUT /api/admin/users/:id` - Update user (Admin)
- `GET /api/admin/activity-logs` - Get activity logs (Admin)
- `GET /api/admin/statistics` - Get statistics (Admin)

### Webhooks
- `POST /api/webhooks/esewa` - eSewa payment webhook

## Security Features

See `SECURITY.md` for detailed security documentation. Key features include:

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Multi-factor authentication (MFA/TOTP)
- Account lockout after failed login attempts
- Password history (prevents reuse of last 5 passwords)
- Rate limiting on all endpoints
- Input validation and sanitization
- Security headers (Helmet.js)
- Comprehensive security logging
- Payment gateway signature verification

## User Roles

- **admin**: Full system access
- **organizer**: Can create and manage events
- **staff**: Can check-in tickets
- **user**: Can purchase tickets and manage profile

## Testing

Test credentials for eSewa (development):
- eSewa ID: 9806800001/2/3/4/5
- Password: Nepal@123
- MPIN: 1122
- Merchant ID: EPAYTEST
- Token: 123456

## Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `security.log` - Security events
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## Documentation

- **Security Documentation**: See `SECURITY.md`
- **API Documentation**: Use API testing tools (Postman, Insomnia) or generate OpenAPI/Swagger docs

## License

ISC

## Support

For issues or questions, please contact the development team.






