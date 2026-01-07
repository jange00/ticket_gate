const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ticketsController = require('../controllers/tickets.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { requireOrganizer } = require('../middleware/rbac.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/tickets/event/:eventId/types
 * @desc    Get ticket types for an event
 * @access  Public
 */
router.get('/event/:eventId/types', optionalAuthenticate, apiLimiter, ticketsController.getEventTicketTypes);

/**
 * @route   GET /api/tickets/my-tickets
 * @desc    Get user's tickets
 * @access  Private
 */
router.get('/my-tickets', authenticate, apiLimiter, ticketsController.getMyTickets);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get('/:id', authenticate, apiLimiter, ticketsController.getTicketById);

/**
 * @route   GET /api/tickets/:id/qr
 * @desc    Get QR code for ticket
 * @access  Private (Ticket owner)
 */
router.get('/:id/qr', authenticate, apiLimiter, ticketsController.getTicketQRCode);

/**
 * @route   POST /api/tickets/event/:eventId/types
 * @desc    Create ticket type
 * @access  Private (Organizer/Admin)
 */
router.post(
  '/event/:eventId/types',
  authenticate,
  requireOrganizer,
  apiLimiter,
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('price').isFloat({ min: 0 }),
    body('quantityAvailable').isInt({ min: 1 }),
    body('maxPerPurchase').optional().isInt({ min: 1 })
  ],
  validate,
  ticketsController.createTicketType
);

/**
 * @route   PUT /api/tickets/types/:id
 * @desc    Update ticket type
 * @access  Private (Organizer/Admin)
 */
router.put(
  '/types/:id',
  authenticate,
  requireOrganizer,
  apiLimiter,
  [
    body('price').optional().isFloat({ min: 0 }),
    body('quantityAvailable').optional().isInt({ min: 0 }),
    body('maxPerPurchase').optional().isInt({ min: 1 })
  ],
  validate,
  ticketsController.updateTicketType
);

/**
 * @route   DELETE /api/tickets/types/:id
 * @desc    Delete ticket type
 * @access  Private (Organizer/Admin)
 */
router.delete('/types/:id', authenticate, requireOrganizer, apiLimiter, ticketsController.deleteTicketType);

module.exports = router;
