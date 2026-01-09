const config = require('./env');
const crypto = require('crypto');

const esewaConfig = {
  merchantId: config.ESEWA_MERCHANT_ID,
  token: config.ESEWA_TOKEN,
  secretKey: config.ESEWA_SECRET_KEY,
  clientId: config.ESEWA_CLIENT_ID,
  clientSecret: config.ESEWA_CLIENT_SECRET,
  baseUrl: config.ESEWA_BASE_URL,
  apiUrl: config.ESEWA_API_URL,
  
  // Test credentials (for development)
  testCredentials: {
    esewaId: '9806800001',
    password: 'Nepal@123',
    mpin: '1122'
  },

  // Generate signature for payment verification
  generateSignature: (data) => {
    const message = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join(',');
    
    const signature = crypto
      .createHmac('sha256', config.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');
    
    return signature;
  },

  // Verify payment response signature
  verifySignature: (data, receivedSignature) => {
    const calculatedSignature = esewaConfig.generateSignature(data);
    return calculatedSignature === receivedSignature;
  }
};

module.exports = esewaConfig;







