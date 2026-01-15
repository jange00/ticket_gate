// Re-export all auth controllers from subdirectories
const registrationController = require('./auth/registration.controller');
const loginController = require('./auth/login.controller');
const profileController = require('./auth/profile.controller');
const passwordController = require('./auth/password.controller');
const mfaController = require('./auth/mfa.controller');
const verificationController = require('./auth/verification.controller');
const googleController = require('./auth/google.controller');

module.exports = {
  // Registration
  register: registrationController.register,

  // Google OAuth
  googleLogin: googleController.googleLogin,
  
  // Login/Logout
  login: loginController.login,
  refreshToken: loginController.refreshToken,
  logout: loginController.logout,
  verify2FALogin: loginController.verify2FALogin,
  
  // Profile
  getProfile: profileController.getProfile,
  updateProfile: profileController.updateProfile,
  toggle2FA: profileController.toggle2FA,
  
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
