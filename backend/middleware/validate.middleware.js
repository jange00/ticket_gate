const { validationResult } = require('express-validator');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const { AppError } = require('./errorHandler.middleware');

/**
 * Validate request middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return next(new AppError(
      ERROR_MESSAGES.VALIDATION_ERROR,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      { errors: errorMessages }
    ));
  }

  next();
};

/**
 * Sanitize request body
 */
const sanitize = (req, res, next) => {
  if (req.body) {
    // Remove any fields that start with $ (MongoDB operators)
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('$')) {
        delete req.body[key];
      }
    });
  }
  next();
};

module.exports = {
  validate,
  sanitize
};






