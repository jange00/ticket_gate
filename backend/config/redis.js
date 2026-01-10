const redis = require('redis');
const config = require('./env');
const logger = require('../services/logging.service');

let redisClient = null;
let isConnected = false;

const createRedisClient = () => {
  if (redisClient && isConnected) {
    return redisClient;
  }

  const clientConfig = {
    socket: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis max reconnection attempts reached');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  };

  if (config.REDIS_PASSWORD) {
    clientConfig.password = config.REDIS_PASSWORD;
  }

  redisClient = redis.createClient(clientConfig);

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
    isConnected = false;
  });

  redisClient.on('connect', () => {
    logger.info('Redis Client Connecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis Client Ready');
    isConnected = true;
  });

  redisClient.on('end', () => {
    logger.warn('Redis Client Connection Ended');
    isConnected = false;
  });

  redisClient.on('reconnecting', () => {
    logger.info('Redis Client Reconnecting...');
  });

  return redisClient;
};

const connectRedis = async () => {
  if (redisClient && isConnected) {
    return redisClient;
  }

  redisClient = createRedisClient();

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    isConnected = false;
    logger.info('Redis connection closed');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
  isConnected: () => isConnected
};









