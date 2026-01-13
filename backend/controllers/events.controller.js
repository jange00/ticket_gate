const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const ActivityLog = require('../models/ActivityLog');
const { parsePagination, buildPaginationMeta, getClientIp, getUserAgent } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, ACTIVITY_TYPES, EVENT_STATUS, ROLES } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');
const logger = require('../services/logging.service');
const { uploadImage } = require('../services/cloudinary.service');

/**
 * Get all events (public)
 */
const getEvents = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, category, search, startDate, endDate } = req.query;

    // Build query
    const query = {};

    // Filter by status (default: published)
    if (status) {
      query.status = status;
    } else {
      query.status = EVENT_STATUS.PUBLISHED;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by date range
    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    } else {
      // Exclude events with past end dates (only for public listings when endDate not specified)
      query.endDate = { $gte: new Date() };
    }

    // Get events
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizerId', 'firstName lastName email')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        events,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('organizerId', 'firstName lastName email');

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Get ticket types for this event
    const ticketTypes = await TicketType.find({ eventId: id })
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        event,
        ticketTypes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create event (organizer/admin only)
 */
const createEvent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const eventData = { ...req.body };
    const ticketTypesData = eventData.ticketTypes || [];
    
    // Remove ticketTypes from eventData (not part of Event schema)
    delete eventData.ticketTypes;

    // Validate dates
    if (eventData.startDate && eventData.endDate) {
      const startDate = new Date(eventData.startDate);
      const endDate = new Date(eventData.endDate);
      
      if (endDate <= startDate) {
        throw new AppError('End date must be after start date', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Handle empty strings for optional URL fields
    if (eventData.imageUrl === '') eventData.imageUrl = undefined;
    if (eventData.bannerUrl === '') eventData.bannerUrl = undefined;

    // Upload images to Cloudinary if provided
    try {
      if (eventData.imageUrl) {
        const imageResult = await uploadImage(eventData.imageUrl, 'ticketgate/events');
        if (imageResult && imageResult.secure_url) {
          eventData.imageUrl = imageResult.secure_url;
          logger.info('Event image uploaded to Cloudinary');
        }
      }

      if (eventData.bannerUrl) {
        const bannerResult = await uploadImage(eventData.bannerUrl, 'ticketgate/events');
        if (bannerResult && bannerResult.secure_url) {
          eventData.bannerUrl = bannerResult.secure_url;
          logger.info('Event banner uploaded to Cloudinary');
        }
      }
    } catch (uploadError) {
      logger.error('Error uploading images to Cloudinary:', uploadError);
      // Continue with original URLs if upload fails (graceful degradation)
    }

    // Create event - always start as DRAFT regardless of payload
    const event = await Event.create({
      ...eventData,
      organizerId: userId,
      status: EVENT_STATUS.DRAFT // Always create as draft, must publish separately
    });

    // Create ticket types if provided
    let ticketTypes = [];
    if (ticketTypesData && ticketTypesData.length > 0) {
      // Validate ticket types data
      for (const ticketType of ticketTypesData) {
        if (!ticketType.name || !ticketType.price || !ticketType.quantityAvailable) {
          throw new AppError('Each ticket type must have name, price, and quantityAvailable', HTTP_STATUS.BAD_REQUEST);
        }
        if (ticketType.price < 0) {
          throw new AppError('Ticket price cannot be negative', HTTP_STATUS.BAD_REQUEST);
        }
        if (ticketType.quantityAvailable < 1) {
          throw new AppError('Ticket quantity must be at least 1', HTTP_STATUS.BAD_REQUEST);
        }
      }

      // Create ticket types
      ticketTypes = await TicketType.insertMany(
        ticketTypesData.map(ticketType => ({
          ...ticketType,
          eventId: event._id,
          quantitySold: 0
        }))
      );

      // Update event totalTickets
      const totalTickets = ticketTypes.reduce((sum, tt) => sum + tt.quantityAvailable, 0);
      event.totalTickets = totalTickets;
      await event.save();
    }

    // Log activity
    await ActivityLog.create({
      userId,
      activityType: ACTIVITY_TYPES.EVENT_CREATED,
      description: `Event created: ${event.title}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Event created successfully',
      data: { 
        event,
        ticketTypes 
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const event = await Event.findById(id);

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (event.organizerId.toString() !== userId && req.user.role !== ROLES.ADMIN) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Validate dates if both are being updated
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      
      if (endDate <= startDate) {
        throw new AppError('End date must be after start date', HTTP_STATUS.BAD_REQUEST);
      }
    } else if (updateData.startDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(event.endDate);
      
      if (endDate <= startDate) {
        throw new AppError('End date must be after start date', HTTP_STATUS.BAD_REQUEST);
      }
    } else if (updateData.endDate) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(updateData.endDate);
      
      if (endDate <= startDate) {
        throw new AppError('End date must be after start date', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Handle empty strings for optional URL fields
    if (updateData.imageUrl === '') updateData.imageUrl = undefined;
    if (updateData.bannerUrl === '') updateData.bannerUrl = undefined;

    // Upload new images to Cloudinary if provided
    try {
      if (updateData.imageUrl && updateData.imageUrl !== event.imageUrl) {
        const imageResult = await uploadImage(updateData.imageUrl, 'ticketgate/events');
        if (imageResult && imageResult.secure_url) {
          updateData.imageUrl = imageResult.secure_url;
          logger.info('Event image updated in Cloudinary');
        }
      }

      if (updateData.bannerUrl && updateData.bannerUrl !== event.bannerUrl) {
        const bannerResult = await uploadImage(updateData.bannerUrl, 'ticketgate/events');
        if (bannerResult && bannerResult.secure_url) {
          updateData.bannerUrl = bannerResult.secure_url;
          logger.info('Event banner updated in Cloudinary');
        }
      }
    } catch (uploadError) {
      logger.error('Error uploading images to Cloudinary:', uploadError);
      // Continue with original URLs if upload fails (graceful degradation)
    }

    // Update event
    Object.assign(event, updateData);
    await event.save();

    // Log activity
    await ActivityLog.create({
      userId,
      activityType: ACTIVITY_TYPES.EVENT_UPDATED,
      description: `Event updated: ${event.title}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(id);

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (event.organizerId.toString() !== userId && req.user.role !== ROLES.ADMIN) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Delete event
    await event.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId,
      activityType: ACTIVITY_TYPES.EVENT_DELETED,
      description: `Event deleted: ${event.title}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      severity: 'high'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish event
 */
const publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(id);

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (event.organizerId.toString() !== userId && req.user.role !== ROLES.ADMIN) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Publish event
    event.status = EVENT_STATUS.PUBLISHED;
    event.publishedAt = new Date();
    await event.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event published successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get organizer's events
 */
const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const query = { organizerId: userId };
    if (status) {
      query.status = status;
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        events,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  getMyEvents
};
