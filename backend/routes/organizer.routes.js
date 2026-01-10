const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireOrganizer } = require('../middleware/rbac.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @route   GET /api/organizer/statistics
 * @desc    Get organizer statistics
 * @access  Private (Organizer/Admin)
 */
router.get('/statistics', authenticate, requireOrganizer, apiLimiter, organizerController.getOrganizerStatistics);

/**
 * @route   GET /api/organizer/events/:eventId/analytics
 * @desc    Get event sales analytics
 * @access  Private (Organizer/Admin)
 */
router.get('/events/:eventId/analytics', authenticate, requireOrganizer, apiLimiter, organizerController.getEventSalesAnalytics);

module.exports = router;









