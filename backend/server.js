const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./services/logging.service');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect to database
connectDB().catch((err) => {
  logger.error('Database connection failed:', err);
  process.exit(1);
});

// Connect to Redis (optional, continue if it fails)
connectRedis().catch((err) => {
  logger.warn('Redis connection failed, continuing without Redis:', err);
});

// Start server
const PORT = config.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Local access: http://localhost:${PORT}/health`);
  logger.info(`Network access: http://169.254.223.180:${PORT}/health`);
  logger.info(`API endpoint: http://169.254.223.180:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});













