const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const purchasesController = require('../controllers/purchases.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { purchaseLimiter, apiLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/purchases
 * @desc    Create purchase (initiate payment)
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  purchaseLimiter,
  [
    body('eventId').isMongoId(),
    body('tickets').isArray({ min: 1 }),
    body('tickets.*.ticketTypeId').isMongoId(),
    body('tickets.*.quantity').isInt({ min: 1 })
  ],
  validate,
  purchasesController.createPurchase
);

/**
 * @route   GET /api/purchases/my-purchases
 * @desc    Get user's purchases
 * @access  Private
 */
router.get('/my-purchases', authenticate, apiLimiter, purchasesController.getMyPurchases);

/**
 * @route   GET /api/purchases/:id
 * @desc    Get purchase by ID
 * @access  Private
 */
router.get('/:id', authenticate, apiLimiter, purchasesController.getPurchaseById);

/**
 * @route   GET /api/purchases/transaction/:transactionId
 * @desc    Get purchase by transaction ID
 * @access  Private
 */
router.get('/transaction/:transactionId', authenticate, apiLimiter, purchasesController.getPurchaseByTransactionId);

/**
 * @route   GET /api/purchases/:id/tickets
 * @desc    Get tickets for a purchase
 * @access  Private
 */
router.get('/:id/tickets', authenticate, apiLimiter, purchasesController.getPurchaseTickets);

/**
 * @route   GET /api/purchases/status/:transactionId
 * @desc    Check payment status from eSewa
 * @access  Private
 */
router.get('/status/:transactionId', authenticate, apiLimiter, purchasesController.checkPaymentStatus);

module.exports = router;





