import client from './client.js';

export const paymentsApi = {
  // eSewa
  initiateEsewa: (data) => client.post('/payments/esewa/initiate', data),
  verifyEsewa: (data) => client.post('/payments/esewa/verify', data),
  
  // PayPal
  initiatePayPal: (data) => client.post('/payments/paypal/initiate', data),
  verifyPayPal: (data) => client.post('/payments/paypal/verify', data),
};
