const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/rbac.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', authenticate, requireAdmin, apiLimiter, adminController.getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/users/:id', authenticate, requireAdmin, apiLimiter, adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/users/:id', authenticate, requireAdmin, apiLimiter, adminController.updateUser);

/**
 * @route   GET /api/admin/activity-logs
 * @desc    Get activity logs
 * @access  Private (Admin)
 */
router.get('/activity-logs', authenticate, requireAdmin, apiLimiter, adminController.getActivityLogs);

/**
 * @route   GET /api/admin/statistics
 * @desc    Get statistics
 * @access  Private (Admin)
 */
router.get('/statistics', authenticate, requireAdmin, apiLimiter, adminController.getStatistics);

/**
 * @route   GET /api/admin/refunds
 * @desc    Get all refunds
 * @access  Private (Admin)
 */
router.get('/refunds', authenticate, requireAdmin, apiLimiter, adminController.getAllRefunds);

/**
 * @route   GET /api/admin/purchases
 * @desc    Get all purchases
 * @access  Private (Admin)
 */
router.get('/purchases', authenticate, requireAdmin, apiLimiter, adminController.getAllPurchases);

module.exports = router;




