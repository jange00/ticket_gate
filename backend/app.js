const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const logger = require('./services/logging.service');
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');
const { sanitize } = require('./middleware/validate.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const purchasesRoutes = require('./routes/purchases.routes');
const checkinRoutes = require('./routes/checkin.routes');
const refundsRoutes = require('./routes/refunds.routes');
const adminRoutes = require('./routes/admin.routes');
const organizerRoutes = require('./routes/organizer.routes');
const webhooksRoutes = require('./routes/webhooks.routes');

// Initialize Express app
const app = express();

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost on any port
    if (config.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // In production, use configured frontend URL
    const allowedOrigins = [config.FRONTEND_URL];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request sanitization
app.use(sanitize);

// Logging middleware - skip Chrome DevTools requests
const skipLogging = (req, res) => {
  return req.originalUrl?.includes('.well-known') || 
         req.originalUrl?.includes('appspecific') ||
         req.originalUrl?.includes('favicon.ico');
};

if (config.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: skipLogging,
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev', {
    skip: skipLogging
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/refunds', refundsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/webhooks', webhooksRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;



