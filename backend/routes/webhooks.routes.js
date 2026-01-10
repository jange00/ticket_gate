const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const ActivityLog = require('../models/ActivityLog');
const { verifyEsewaPayment } = require('../services/payment.service');
const { generateTicketQRCode } = require('../services/qrcode.service');
const { sendTicketConfirmationEmail } = require('../services/email.service');
const { HTTP_STATUS, PURCHASE_STATUS, ACTIVITY_TYPES, TICKET_STATUS } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');
const logger = require('../services/logging.service');

/**
 * @route   GET /api/webhooks/esewa
 * @desc    eSewa payment callback (redirected from eSewa after payment)
 * @access  Public (verification via signature)
 * 
 * Note: eSewa redirects to success_url/failure_url with Base64-encoded JSON in query parameter
 */
router.get('/esewa', async (req, res, next) => {
  try {
    // eSewa sends response as Base64-encoded JSON in 'data' query parameter
    const base64Data = req.query.data;
    
    if (!base64Data) {
      // Log as warning instead of error (this is expected when accessing URL directly)
      logger.warn('eSewa webhook accessed without payment data (likely direct access)', {
        url: req.originalUrl,
        query: req.query,
        ip: req.ip
      });
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Missing payment data');
    }

    // Decode Base64 to get JSON string
    let paymentData;
    try {
      const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
      paymentData = JSON.parse(decodedData);
      logger.info('eSewa callback decoded:', paymentData);
    } catch (decodeError) {
      logger.error('Failed to decode eSewa callback data', { error: decodeError.message, base64Data });
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Invalid payment data format');
    }

    // Verify payment signature
    const verification = verifyEsewaPayment(paymentData);

    if (!verification.valid) {
      logger.error('eSewa payment verification failed', paymentData);
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Payment verification failed');
    }

    // Find purchase by transaction ID (transaction_uuid)
    const purchase = await Purchase.findOne({
      transactionId: verification.transactionId
    }).populate('userId').populate('eventId');

    if (!purchase) {
      logger.error('Purchase not found for transaction', verification.transactionId);
      return res.status(HTTP_STATUS.NOT_FOUND).send('Purchase not found');
    }

    // Update purchase status
    if (verification.status === 'COMPLETE') {
      // Prevent duplicate processing
      if (purchase.status === PURCHASE_STATUS.PAID) {
        logger.warn('Purchase already processed', { transactionId: verification.transactionId });
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Purchase already processed'
        });
      }

      // Payment confirmed - update purchase status
      purchase.status = PURCHASE_STATUS.PAID;
      purchase.paymentId = verification.transactionCode;
      purchase.paymentReferenceId = verification.transactionCode;
      purchase.paymentDate = new Date();
      purchase.esewaResponse = paymentData;
      await purchase.save();

      // IMPORTANT: Tickets are created HERE (after payment confirmation) and NOT in createPurchase
      // This ensures tickets are only created when payment is successful
      // Deduct ticket quantities and create individual Ticket documents
      const createdTickets = [];
      for (const ticketItem of purchase.tickets) {
        const ticketType = await TicketType.findById(ticketItem.ticketTypeId);
        if (!ticketType) {
          logger.error('TicketType not found', { ticketTypeId: ticketItem.ticketTypeId });
          continue;
        }

        // Update TicketType sold quantity
        ticketType.quantitySold = (ticketType.quantitySold || 0) + ticketItem.quantity;
        await ticketType.save();

        // Create individual tickets
        for (let i = 0; i < ticketItem.quantity; i++) {
          // Generate QR code for ticket
          const qrData = await generateTicketQRCode({
            ticketId: null, // Will be set after ticket creation
            eventId: purchase.eventId._id.toString(),
            attendeeId: purchase.userId._id.toString(),
            purchaseId: purchase._id.toString()
          });

          const ticket = await Ticket.create({
            ticketTypeId: ticketType._id,
            eventId: purchase.eventId._id,
            attendeeId: purchase.userId._id,
            purchaseId: purchase._id,
            qrCode: qrData.qrCode,
            qrCodeHash: qrData.qrCodeHash,
            status: TICKET_STATUS.CONFIRMED
          });

          // Update QR code with actual ticket ID
          const updatedQrData = await generateTicketQRCode({
            ticketId: ticket._id.toString(),
            eventId: purchase.eventId._id.toString(),
            attendeeId: purchase.userId._id.toString(),
            purchaseId: purchase._id.toString()
          });

          ticket.qrCode = updatedQrData.qrCode;
          ticket.qrCodeHash = updatedQrData.qrCodeHash;
          await ticket.save();

          createdTickets.push(ticket);
        }
      }

      // Update event stats
      const event = purchase.eventId;
      if (event) {
        event.soldTickets = (event.soldTickets || 0) + purchase.tickets.reduce((sum, t) => sum + t.quantity, 0);
        event.totalRevenue = (event.totalRevenue || 0) + purchase.totalAmount;
        await event.save();
      }

      // Log activity
      await ActivityLog.create({
        userId: purchase.userId._id,
        activityType: ACTIVITY_TYPES.PAYMENT_SUCCESS,
        description: `Payment successful: ${purchase.transactionId}`,
        metadata: {
          purchaseId: purchase._id,
          transactionId: verification.transactionId,
          amount: purchase.totalAmount
        }
      });

      // Send confirmation email (async)
      if (purchase.userId.email) {
        sendTicketConfirmationEmail(
          purchase.userId.email,
          purchase.userId.firstName,
          {
            transactionId: purchase.transactionId,
            eventName: event.title,
            quantity: purchase.tickets.reduce((sum, t) => sum + t.quantity, 0),
            totalAmount: purchase.totalAmount,
            purchaseDate: purchase.createdAt
          }
        ).catch(err => {
          logger.error('Failed to send confirmation email:', err);
        });
      }

      logger.info('Payment processed successfully', {
        transactionId: verification.transactionId,
        purchaseId: purchase._id
      });

      // Redirect to frontend success page
      const frontendUrl = require('../config/env').FRONTEND_URL;
      return res.redirect(`${frontendUrl}/purchase/success?transactionId=${purchase.transactionId}`);
    } else {
      // Payment failed or pending
      purchase.status = verification.status === 'PENDING' ? PURCHASE_STATUS.PENDING : PURCHASE_STATUS.FAILED;
      purchase.esewaResponse = paymentData;
      await purchase.save();

      await ActivityLog.create({
        userId: purchase.userId._id,
        activityType: ACTIVITY_TYPES.PAYMENT_FAILED,
        description: `Payment ${verification.status}: ${purchase.transactionId}`,
        metadata: {
          purchaseId: purchase._id,
          transactionId: verification.transactionId,
          status: verification.status
        }
      });

      // Redirect to frontend failure page
      const frontendUrl = require('../config/env').FRONTEND_URL;
      return res.redirect(`${frontendUrl}/purchase/failure?transactionId=${purchase.transactionId}`);
    }
  } catch (error) {
    logger.error('Webhook processing error:', error);
    next(error);
  }
});

module.exports = router;





