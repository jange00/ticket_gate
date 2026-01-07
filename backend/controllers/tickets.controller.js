const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const { generateTicketQRCode } = require('../services/qrcode.service');
const { HTTP_STATUS, ERROR_MESSAGES, TICKET_STATUS, ROLES } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');

/**
 * Get ticket types for an event
 */
const getEventTicketTypes = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const ticketTypes = await TicketType.find({ eventId })
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { ticketTypes }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's tickets
 */
const getMyTickets = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const tickets = await Ticket.find({ attendeeId: userId })
      .populate('eventId', 'title startDate imageUrl')
      .populate('ticketTypeId', 'name price')
      .sort({ createdAt: -1 })
      .lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { tickets }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ticket by ID
 */
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const ticket = await Ticket.findById(id)
      .populate('eventId')
      .populate('ticketTypeId')
      .populate('attendeeId', 'firstName lastName email');

    if (!ticket) {
      throw new AppError(ERROR_MESSAGES.TICKET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or staff/admin
    if (ticket.attendeeId?._id.toString() !== userId && 
        req.user.role !== ROLES.ADMIN && 
        req.user.role !== ROLES.STAFF) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get QR code for ticket
 */
const getTicketQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const ticket = await Ticket.findById(id)
      .populate('eventId')
      .populate('attendeeId');

    if (!ticket) {
      throw new AppError(ERROR_MESSAGES.TICKET_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership
    if (ticket.attendeeId?._id.toString() !== userId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Generate QR code
    const qrCodeData = await generateTicketQRCode({
      ticketId: ticket._id.toString(),
      eventId: ticket.eventId._id.toString(),
      attendeeId: ticket.attendeeId._id.toString(),
      purchaseId: ticket.purchaseId.toString()
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        qrCode: qrCodeData.qrCodeDataURL,
        ticketId: ticket._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create ticket type (organizer/admin only)
 */
const createTicketType = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const ticketTypeData = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (event.organizerId.toString() !== req.user.userId && req.user.role !== ROLES.ADMIN) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    const ticketType = await TicketType.create({
      ...ticketTypeData,
      eventId
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Ticket type created successfully',
      data: { ticketType }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket type
 */
const updateTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ticketType = await TicketType.findById(id).populate('eventId');
    if (!ticketType) {
      throw new AppError('Ticket type not found', HTTP_STATUS.NOT_FOUND);
    }

    const event = ticketType.eventId;

    // Check ownership or admin
    if (event.organizerId.toString() !== req.user.userId && req.user.role !== ROLES.ADMIN) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    Object.assign(ticketType, updateData);
    await ticketType.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Ticket type updated successfully',
      data: { ticketType }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete ticket type
 */
const deleteTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticketType = await TicketType.findById(id).populate('eventId');
    if (!ticketType) {
      throw new AppError('Ticket type not found', HTTP_STATUS.NOT_FOUND);
    }

    const event = ticketType.eventId;

    // Check ownership or admin
    if (event.organizerId.toString() !== req.user.userId && req.user.role !== ROLES.ADMIN) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Check if tickets have been sold
    if (ticketType.quantitySold > 0) {
      throw new AppError('Cannot delete ticket type with sold tickets', HTTP_STATUS.BAD_REQUEST);
    }

    await ticketType.deleteOne();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Ticket type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventTicketTypes,
  getMyTickets,
  getTicketById,
  getTicketQRCode,
  createTicketType,
  updateTicketType,
  deleteTicketType
};
