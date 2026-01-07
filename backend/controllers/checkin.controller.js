const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const { verifyQRCodeData } = require('../services/qrcode.service');
const { getClientIp, getUserAgent } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, ACTIVITY_TYPES, ROLES, TICKET_STATUS } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');

/**
 * Check-in ticket using QR code
 */
const checkInTicket = async (req, res, next) => {
  try {
    const { qrData } = req.body;
    const checkedInBy = req.user.userId;

    // Verify QR code data and signature
    const verification = verifyQRCodeData(qrData);
    if (!verification.valid) {
      throw new AppError(verification.error || 'Invalid QR code', HTTP_STATUS.BAD_REQUEST);
    }

    const { ticketId, eventId } = verification.data;

    // Get ticket
    const ticket = await Ticket.findById(ticketId)
      .populate('eventId')
      .populate('attendeeId');

    if (!ticket) {
      throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
    }

    const event = ticket.eventId;

    // Check if user is authorized (organizer, staff, or admin)
    const isAuthorized = req.user.role === ROLES.ADMIN ||
                        req.user.role === ROLES.STAFF ||
                        (req.user.role === ROLES.ORGANIZER && 
                         event.organizerId.toString() === checkedInBy);

    if (!isAuthorized) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Check if ticket is confirmed
    if (ticket.status !== TICKET_STATUS.CONFIRMED) {
      throw new AppError(`Ticket is ${ticket.status}, cannot check in`, HTTP_STATUS.BAD_REQUEST);
    }

    // Check if already checked in
    if (ticket.status === TICKET_STATUS.CHECKED_IN) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Ticket already checked in',
        data: {
          ticket,
          alreadyCheckedIn: true,
          checkedInAt: ticket.checkedInAt
        }
      });
    }

    // Check if event date/time has passed
    if (event.startDate && new Date() < new Date(event.startDate)) {
      throw new AppError('Event has not started yet', HTTP_STATUS.BAD_REQUEST);
    }

    // Update ticket status
    ticket.status = TICKET_STATUS.CHECKED_IN;
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = checkedInBy;
    await ticket.save();

    // Log activity
    await ActivityLog.create({
      userId: ticket.attendeeId?._id,
      activityType: ACTIVITY_TYPES.CHECK_IN,
      description: `Ticket checked in for event: ${event.title}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      metadata: {
        ticketId: ticket._id,
        eventId: event._id,
        checkedInBy
      }
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Ticket checked in successfully',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get check-in status
 */
const getCheckInStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate('eventId')
      .populate('checkedInBy', 'firstName lastName email')
      .populate('attendeeId', 'firstName lastName email');

    if (!ticket) {
      throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        ticket,
        checkedIn: ticket.status === TICKET_STATUS.CHECKED_IN,
        checkedInAt: ticket.checkedInAt,
        checkedInBy: ticket.checkedInBy
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get check-ins for an event
 */
const getEventCheckIns = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(id);
    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check authorization (staff assigned, organizer own event, or admin)
    const isAuthorized = req.user.role === ROLES.ADMIN ||
                        (req.user.role === ROLES.ORGANIZER && 
                         event.organizerId.toString() === userId) ||
                        req.user.role === ROLES.STAFF;

    if (!isAuthorized) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Get all tickets for this event
    const tickets = await Ticket.find({ eventId: id })
      .populate('attendeeId', 'firstName lastName email')
      .populate('checkedInBy', 'firstName lastName email')
      .sort({ checkedInAt: -1 })
      .lean();

    // Calculate statistics
    const totalTickets = tickets.length;
    const checkedInTickets = tickets.filter(t => t.status === TICKET_STATUS.CHECKED_IN).length;
    const pendingTickets = tickets.filter(t => t.status === TICKET_STATUS.PENDING).length;
    const confirmedTickets = tickets.filter(t => t.status === TICKET_STATUS.CONFIRMED).length;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        tickets,
        statistics: {
          total: totalTickets,
          checkedIn: checkedInTickets,
          pending: pendingTickets,
          confirmed: confirmedTickets,
          checkInRate: totalTickets > 0 ? ((checkedInTickets / totalTickets) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkInTicket,
  getCheckInStatus,
  getEventCheckIns
};
