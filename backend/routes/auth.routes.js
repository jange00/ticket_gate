const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter, loginLimiter, passwordResetLimiter, forgotPasswordLimiter, registrationLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  registrationLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/),
    body('firstName').trim().notEmpty().isLength({ max: 50 }),
    body('lastName').trim().notEmpty().isLength({ max: 50 }),
    body('phone').optional().matches(/^(\+977)?[9][6-9]\d{8}$/)
  ],
  validate,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('mfaCode').optional().isLength({ min: 6, max: 6 }).isNumeric()
  ],
  validate,
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty()
  ],
  validate,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  [
    body('refreshToken').optional().notEmpty()
  ],
  validate,
  authController.logout
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('phone').optional().matches(/^(\+977)?[9][6-9]\d{8}$/)
  ],
  validate,
  authController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 12 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)
  ],
  validate,
  authController.changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [
    body('email').isEmail().normalizeEmail()
  ],
  validate,
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 12 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)
  ],
  validate,
  authController.resetPassword
);

/**
 * @route   POST /api/auth/mfa/setup
 * @desc    Setup MFA
 * @access  Private
 */
router.post('/mfa/setup', authenticate, authController.setupMFA);

/**
 * @route   POST /api/auth/mfa/verify
 * @desc    Verify and enable MFA
 * @access  Private
 */
router.post(
  '/mfa/verify',
  authenticate,
  [
    body('code').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  validate,
  authController.verifyMFA
);

/**
 * @route   POST /api/auth/mfa/disable
 * @desc    Disable MFA
 * @access  Private
 */
router.post(
  '/mfa/disable',
  authenticate,
  [
    body('password').notEmpty()
  ],
  validate,
  authController.disableMFA
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post(
  '/verify-email',
  [
    body('token').notEmpty()
  ],
  validate,
  authController.verifyEmail
);

module.exports = router;
