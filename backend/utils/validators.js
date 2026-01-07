// Re-export all validators from subdirectories
const inputValidators = require('./validators/input.validators');
const passwordValidators = require('./validators/password.validators');
const commonValidators = require('./validators/common.validators');

module.exports = {
  // Input validators
  ...inputValidators,
  
  // Password validators
  ...passwordValidators,
  
  // Common validators
  ...commonValidators
};
