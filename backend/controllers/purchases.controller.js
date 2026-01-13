const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
// const { generateEsewaPaymentUrl } = require('../services/payment.service');
const { sendTicketConfirmationEmail } = require('../services/email.service');
const { parsePagination, buildPaginationMeta, getClientIp, getUserAgent } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, PURCHASE_STATUS, ACTIVITY_TYPES } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');
const logger = require('../services/logging.service');
const config = require('../config/env');

/**
 * Create purchase (initiate payment)
 */
const createPurchase = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { eventId, tickets } = req.body;

    // Validate tickets array
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      throw new AppError('Tickets array is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Get event
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Validate and calculate totals
    let subtotal = 0;
    const ticketItems = [];

    for (const item of tickets) {
      const ticketType = await TicketType.findById(item.ticketTypeId);
      
      if (!ticketType) {
        throw new AppError(`Ticket type ${item.ticketTypeId} not found`, HTTP_STATUS.NOT_FOUND);
      }

      if (ticketType.eventId.toString() !== eventId) {
        throw new AppError(`Ticket type does not belong to this event`, HTTP_STATUS.BAD_REQUEST);
      }

      // Check available quantity
      const availableQuantity = ticketType.quantityAvailable - ticketType.quantitySold;
      if (availableQuantity < item.quantity) {
        throw new AppError(`Insufficient tickets available for ${ticketType.name}. Available: ${availableQuantity}`, HTTP_STATUS.BAD_REQUEST);
      }

      // Check max per purchase
      if (item.quantity > ticketType.maxPerPurchase) {
        throw new AppError(`Maximum ${ticketType.maxPerPurchase} tickets allowed per purchase for ${ticketType.name}`, HTTP_STATUS.BAD_REQUEST);
      }

      const itemSubtotal = ticketType.price * item.quantity;
      subtotal += itemSubtotal;

      ticketItems.push({
        ticketTypeId: ticketType._id,
        ticketType: ticketType.name,
        quantity: item.quantity,
        price: ticketType.price,
        subtotal: itemSubtotal
      });
    }

    // Calculate totals (simplified - add tax/service charge if needed)
    const tax = 0; // Calculate tax if needed
    const serviceCharge = 0; // Calculate service charge if needed
    const totalAmount = subtotal + tax + serviceCharge;

    // IMPORTANT: Create purchase record ONLY (status: pending)
    // DO NOT create tickets here - tickets are created ONLY after payment confirmation in webhook
    // DO NOT deduct ticket quantities here - quantities are deducted ONLY in webhook after payment
    // This ensures users cannot get tickets without paying
    const purchase = await Purchase.create({
      userId,
      eventId,
      tickets: ticketItems,
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
      status: PURCHASE_STATUS.PENDING
    });

    // For now, just return the pending purchase
    // Payment integration has been removed as requested
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Purchase created successfully',
      data: {
        purchase
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's purchases
 */
const getMyPurchases = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate('eventId', 'title startDate imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        purchases,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get purchase by ID
 */
const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const purchase = await Purchase.findById(id)
      .populate('eventId')
      .populate('tickets.ticketTypeId', 'name price');

    if (!purchase) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (purchase.userId.toString() !== userId && req.user.role !== 'admin') {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { purchase }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get purchase by transaction ID (for payment verification)
 * Searches by both transactionId and esewaTransactionId
 */
const getPurchaseByTransactionId = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    // Try to find by transactionId first (original transaction ID)
    let purchase = await Purchase.findOne({ transactionId })
      .populate('eventId', 'title startDate imageUrl')
      .populate('tickets.ticketTypeId', 'name price');

    // If not found, try searching by esewaTransactionId (eSewa transaction UUID)
    // This handles cases where eSewa sends back the transaction_uuid in callbacks
    if (!purchase) {
      purchase = await Purchase.findOne({ esewaTransactionId: transactionId })
        .populate('eventId', 'title startDate imageUrl')
        .populate('tickets.ticketTypeId', 'name price');
    }

    // Also try to extract original transactionId from esewaTransactionId format
    // eSewa format: ${originalTransactionId}-${timestamp}
    // Example: TXN-1768143966707-69D53F8A08B5FACD-1768143966727
    if (!purchase && transactionId.includes('-')) {
      const parts = transactionId.split('-');
      if (parts.length >= 3) {
        // Reconstruct original transactionId (everything except the last part which is the timestamp)
        const originalTransactionId = parts.slice(0, -1).join('-');
        purchase = await Purchase.findOne({ transactionId: originalTransactionId })
          .populate('eventId', 'title startDate imageUrl')
          .populate('tickets.ticketTypeId', 'name price');
      }
    }

    if (!purchase) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (purchase.userId.toString() !== userId && req.user.role !== 'admin') {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { purchase }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tickets for a purchase
 */
const getPurchaseTickets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin/organizer
    if (purchase.userId.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'organizer') {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Get all tickets for this purchase
    const tickets = await Ticket.find({ purchaseId: id })
      .populate('ticketTypeId', 'name price')
      .populate('eventId', 'title startDate')
      .populate('attendeeId', 'firstName lastName email')
      .populate('checkedInBy', 'firstName lastName')
      .sort({ createdAt: 1 })
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
 * Check payment status from eSewa API
 */
const checkPaymentStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const purchase = await Purchase.findOne({ transactionId });
    if (!purchase) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check ownership or admin
    if (purchase.userId.toString() !== userId && req.user.role !== 'admin') {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    const { checkPaymentStatus: checkEsewaStatus } = require('../services/payment.service');
    const statusResult = await checkEsewaStatus(purchase.transactionId, purchase.totalAmount);

    if (statusResult.success && statusResult.status === 'COMPLETE' && purchase.status !== PURCHASE_STATUS.PAID) {
      // Payment was successful, update purchase status
      // Note: This is a fallback. Ideally webhook should handle this
      logger.warn('Payment status check found completed payment that was not processed', {
        transactionId,
        purchaseId: purchase._id
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: statusResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  getMyPurchases,
  getPurchaseById,
  getPurchaseByTransactionId,
  getPurchaseTickets,
  checkPaymentStatus
};





