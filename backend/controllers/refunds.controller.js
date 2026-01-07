const Refund = require('../models/Refund');
const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const { processRefund } = require('../services/payment.service');
const { parsePagination, buildPaginationMeta, getClientIp, getUserAgent } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, REFUND_STATUS, PURCHASE_STATUS, ACTIVITY_TYPES, ROLES } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');
const logger = require('../services/logging.service');

/**
 * Request refund
 */
const requestRefund = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { purchaseId, reason } = req.body;

    // Get purchase
    const purchase = await Purchase.findById(purchaseId)
      .populate('eventId');

    if (!purchase) {
      throw new AppError('Purchase not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership
    if (purchase.userId.toString() !== userId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Check if already paid
    if (purchase.status !== PURCHASE_STATUS.PAID) {
      throw new AppError('Purchase is not paid', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if already refunded
    if (purchase.status === PURCHASE_STATUS.REFUNDED) {
      throw new AppError('Purchase already refunded', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if refund deadline passed
    const event = purchase.eventId;
    if (event.settings.refundDeadline && new Date() > event.settings.refundDeadline) {
      throw new AppError('Refund deadline has passed', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if event allows refunds
    if (!event.settings.allowRefunds) {
      throw new AppError('Refunds are not allowed for this event', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if already checked in
    if (purchase.checkedIn) {
      throw new AppError('Cannot refund checked-in tickets', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if refund already exists
    const existingRefund = await Refund.findOne({
      purchaseId,
      status: { $in: [REFUND_STATUS.PENDING, REFUND_STATUS.APPROVED] }
    });

    if (existingRefund) {
      throw new AppError('Refund request already exists', HTTP_STATUS.CONFLICT);
    }

    // Create refund request
    const refund = await Refund.create({
      purchaseId: purchase._id,
      userId: purchase.userId,
      eventId: purchase.eventId,
      originalTransactionId: purchase.transactionId,
      refundAmount: purchase.totalAmount,
      reason,
      requestedBy: userId
    });

    // Log activity
    await ActivityLog.create({
      userId,
      activityType: ACTIVITY_TYPES.TICKET_REFUNDED,
      description: `Refund requested for purchase: ${purchase.transactionId}`,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      metadata: {
        purchaseId: purchase._id,
        refundId: refund._id
      }
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: { refund }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my refunds
 */
const getMyRefunds = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate('purchaseId', 'transactionId totalAmount')
        .populate('eventId', 'title startDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Refund.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        refunds,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund (admin/organizer only)
 */
const processRefundRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const processedBy = req.user.userId;

    const refund = await Refund.findById(id)
      .populate('purchaseId')
      .populate('eventId');

    if (!refund) {
      throw new AppError('Refund not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check authorization (organizer or admin)
    const event = refund.eventId;
    const isAuthorized = req.user.role === ROLES.ADMIN ||
                        (req.user.role === ROLES.ORGANIZER &&
                         event.organizerId.toString() === processedBy);

    if (!isAuthorized) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    if (action === 'approve') {
      // Process refund
      const refundResult = await processRefund({
        transactionId: refund.originalTransactionId,
        amount: refund.refundAmount,
        refundId: refund.refundId
      });

      // Update refund
      refund.status = REFUND_STATUS.PROCESSED;
      refund.processedBy = processedBy;
      refund.processedAt = new Date();
      refund.paymentReferenceId = refundResult.refundId;
      await refund.save();

      // Update purchase
      const purchase = refund.purchaseId;
      purchase.status = PURCHASE_STATUS.REFUNDED;
      await purchase.save();

      // Update ticket counts
      for (const ticketItem of purchase.tickets) {
        const ticket = await Ticket.findById(ticketItem.ticketId);
        if (ticket) {
          ticket.sold = Math.max(0, ticket.sold - ticketItem.quantity);
          await ticket.save();
        }
      }

      // Log activity
      await ActivityLog.create({
        userId: refund.userId,
        activityType: ACTIVITY_TYPES.TICKET_REFUNDED,
        description: `Refund processed: ${refund.refundId}`,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        metadata: {
          refundId: refund._id,
          processedBy
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Refund processed successfully',
        data: { refund }
      });
    } else if (action === 'reject') {
      // Reject refund
      refund.status = REFUND_STATUS.REJECTED;
      refund.processedBy = processedBy;
      refund.processedAt = new Date();
      refund.rejectionReason = rejectionReason;
      await refund.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Refund rejected',
        data: { refund }
      });
    } else {
      throw new AppError('Invalid action', HTTP_STATUS.BAD_REQUEST);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get organizer's refunds (for their events)
 */
const getOrganizerRefunds = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, skip } = parsePagination(req.query);
    const { status, eventId } = req.query;

    // Get organizer's events
    const events = await Event.find({ organizerId: userId }).lean();
    const eventIds = events.map(e => e._id.toString());

    const query = { eventId: { $in: eventIds } };
    if (status) {
      query.status = status;
    }
    if (eventId) {
      query.eventId = eventId;
    }

    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate('userId', 'email firstName lastName')
        .populate('eventId', 'title startDate')
        .populate('purchaseId', 'transactionId totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Refund.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        refunds,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestRefund,
  getMyRefunds,
  processRefundRequest,
  getOrganizerRefunds
};





