import client from './client.js';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  
  login: (data) => client.post('/auth/login', data),
  
  refresh: (data) => client.post('/auth/refresh', data),
  
  logout: (data) => client.post('/auth/logout', data),
  
  getProfile: () => client.get('/auth/profile'),
  
  updateProfile: (data) => client.put('/auth/profile', data),
  
  changePassword: (data) => client.post('/auth/change-password', data),
  
  forgotPassword: (data) => client.post('/auth/forgot-password', data),
  
  resetPassword: (data) => client.post('/auth/reset-password', data),
  
  verifyEmail: (data) => client.post('/auth/verify-email', data),
  
  setupMFA: () => client.post('/auth/mfa/setup'),
  
  verifyMFA: (data) => client.post('/auth/mfa/verify', data),
  
  disableMFA: (data) => client.post('/auth/mfa/disable', data),
};












