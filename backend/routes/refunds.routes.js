const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const refundsController = require('../controllers/refunds.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireOrganizer } = require('../middleware/rbac.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/refunds
 * @desc    Request refund
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  apiLimiter,
  [
    body('purchaseId').isMongoId(),
    body('reason').trim().notEmpty().isLength({ max: 500 })
  ],
  validate,
  refundsController.requestRefund
);

/**
 * @route   GET /api/refunds/my-refunds
 * @desc    Get user's refunds
 * @access  Private
 */
router.get('/my-refunds', authenticate, apiLimiter, refundsController.getMyRefunds);

/**
 * @route   POST /api/refunds/:id/process
 * @desc    Process refund request
 * @access  Private (Organizer/Admin)
 */
router.post(
  '/:id/process',
  authenticate,
  requireOrganizer,
  apiLimiter,
  [
    body('action').isIn(['approve', 'reject']),
    body('rejectionReason').optional().trim().isLength({ max: 500 })
  ],
  validate,
  refundsController.processRefundRequest
);

/**
 * @route   GET /api/refunds/organizer
 * @desc    Get organizer's refunds (for their events)
 * @access  Private (Organizer/Admin)
 */
router.get('/organizer', authenticate, requireOrganizer, apiLimiter, refundsController.getOrganizerRefunds);

module.exports = router;





