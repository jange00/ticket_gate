const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const checkinController = require('../controllers/checkin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireStaff } = require('../middleware/rbac.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/checkin
 * @desc    Check-in ticket using QR code
 * @access  Private (Staff/Organizer/Admin)
 */
router.post(
  '/',
  authenticate,
  requireStaff,
  apiLimiter,
  [
    body('qrData').notEmpty()
  ],
  validate,
  checkinController.checkInTicket
);

/**
 * @route   GET /api/checkin/ticket/:ticketId
 * @desc    Get check-in status for a ticket
 * @access  Private
 */
router.get('/ticket/:ticketId', authenticate, apiLimiter, checkinController.getCheckInStatus);

/**
 * @route   GET /api/checkin/event/:id
 * @desc    Get check-ins for an event
 * @access  Private (Staff/Organizer/Admin)
 */
router.get('/event/:id', authenticate, requireStaff, apiLimiter, checkinController.getEventCheckIns);

module.exports = router;
