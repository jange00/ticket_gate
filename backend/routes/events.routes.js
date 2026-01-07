const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventsController = require('../controllers/events.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { requireOrganizer } = require('../middleware/rbac.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/events
 * @desc    Get all events (public)
 * @access  Public
 */
router.get('/', optionalAuthenticate, apiLimiter, eventsController.getEvents);

/**
 * @route   GET /api/events/my-events
 * @desc    Get organizer's events
 * @access  Private (Organizer/Admin)
 */
router.get('/my-events', authenticate, requireOrganizer, apiLimiter, eventsController.getMyEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', optionalAuthenticate, apiLimiter, eventsController.getEventById);

/**
 * @route   POST /api/events
 * @desc    Create event
 * @access  Private (Organizer/Admin)
 */
router.post(
  '/',
  authenticate,
  requireOrganizer,
  apiLimiter,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('description').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('venue.name').trim().notEmpty(),
    body('venue.address').trim().notEmpty(),
    body('venue.city').trim().notEmpty(),
    body('venue.country').optional().trim(),
    body('venue.coordinates.latitude').optional().isFloat(),
    body('venue.coordinates.longitude').optional().isFloat(),
    body('startDate').isISO8601().toDate(),
    body('endDate').isISO8601().toDate(),
    body('imageUrl').optional().custom((value) => {
      if (!value) return true;
      // Allow HTTP/HTTPS URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      // Allow data URIs (base64 images)
      if (value.startsWith('data:image/')) {
        return true;
      }
      return false;
    }).withMessage('Image URL must be a valid HTTP/HTTPS URL or data URI'),
    body('bannerUrl').optional().custom((value) => {
      if (!value) return true;
      // Allow HTTP/HTTPS URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      // Allow data URIs (base64 images)
      if (value.startsWith('data:image/')) {
        return true;
      }
      return false;
    }).withMessage('Banner URL must be a valid HTTP/HTTPS URL or data URI'),
    body('ticketTypes').optional().isArray().withMessage('Ticket types must be an array'),
    body('ticketTypes.*.name').optional().trim().isLength({ max: 100 }).withMessage('Ticket type name cannot exceed 100 characters'),
    body('ticketTypes.*.description').optional().trim(),
    body('ticketTypes.*.price').optional().isFloat({ min: 0 }).withMessage('Ticket price must be a positive number'),
    body('ticketTypes.*.quantityAvailable').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('ticketTypes.*.maxPerPurchase').optional().isInt({ min: 1 }).withMessage('Max per purchase must be at least 1')
  ],
  validate,
  eventsController.createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Organizer/Admin)
 */
router.put(
  '/:id',
  authenticate,
  requireOrganizer,
  apiLimiter,
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('venue.name').optional().trim().notEmpty(),
    body('venue.address').optional().trim().notEmpty(),
    body('venue.city').optional().trim().notEmpty(),
    body('venue.country').optional().trim(),
    body('venue.coordinates.latitude').optional().isFloat(),
    body('venue.coordinates.longitude').optional().isFloat(),
    body('startDate').optional().isISO8601().toDate(),
    body('endDate').optional().isISO8601().toDate(),
    body('imageUrl').optional().custom((value) => {
      if (!value) return true;
      // Allow HTTP/HTTPS URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      // Allow data URIs (base64 images)
      if (value.startsWith('data:image/')) {
        return true;
      }
      return false;
    }).withMessage('Image URL must be a valid HTTP/HTTPS URL or data URI'),
    body('bannerUrl').optional().custom((value) => {
      if (!value) return true;
      // Allow HTTP/HTTPS URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      // Allow data URIs (base64 images)
      if (value.startsWith('data:image/')) {
        return true;
      }
      return false;
    }).withMessage('Banner URL must be a valid HTTP/HTTPS URL or data URI')
  ],
  validate,
  eventsController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Organizer/Admin)
 */
router.delete('/:id', authenticate, requireOrganizer, apiLimiter, eventsController.deleteEvent);

/**
 * @route   POST /api/events/:id/publish
 * @desc    Publish event
 * @access  Private (Organizer/Admin)
 */
router.post('/:id/publish', authenticate, requireOrganizer, apiLimiter, eventsController.publishEvent);

module.exports = router;






