// Re-export all auth controllers from subdirectories
const registrationController = require('./auth/registration.controller');
const loginController = require('./auth/login.controller');
const profileController = require('./auth/profile.controller');
const passwordController = require('./auth/password.controller');
const mfaController = require('./auth/mfa.controller');
const verificationController = require('./auth/verification.controller');

module.exports = {
  // Registration
  register: registrationController.register,
  
  // Login/Logout
  login: loginController.login,
  refreshToken: loginController.refreshToken,
  logout: loginController.logout,
  
  // Profile
  getProfile: profileController.getProfile,
  updateProfile: profileController.updateProfile,
  
  // Password
  changePassword: passwordController.changePassword,
  requestPasswordReset: passwordController.requestPasswordReset,
  resetPassword: passwordController.resetPassword,
  
  // MFA
  setupMFA: mfaController.setupMFA,
  verifyMFA: mfaController.verifyMFA,
  disableMFA: mfaController.disableMFA,
  
  // Verification
  verifyEmail: verificationController.verifyEmail,
  resendOTP: verificationController.resendOTP
};
