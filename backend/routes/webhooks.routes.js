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
 * Process eSewa payment callback data
 * Handles both Base64-encoded JSON and individual parameters from query or body
 */
const processEsewaCallback = (dataSource) => {
  let paymentData = null;
  
  // Try Base64-encoded JSON format first (in 'data' parameter)
  const base64Data = dataSource.data;
  if (base64Data) {
    try {
      const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
      paymentData = JSON.parse(decodedData);
      logger.info('eSewa callback decoded from Base64:', paymentData);
      return paymentData;
    } catch (decodeError) {
      logger.warn('Failed to decode Base64 data, trying individual parameters', { 
        error: decodeError.message 
      });
    }
  }
  
  // If Base64 decode failed or not present, try individual parameters
  const {
    transaction_code,
    status,
    total_amount,
    transaction_uuid,
    product_code,
    signed_field_names,
    signature
  } = dataSource;
  
  // Check if we have the required fields
  if (transaction_code || status || transaction_uuid) {
    paymentData = {
      transaction_code,
      status,
      total_amount: total_amount || null, // Keep as string for signature verification
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    };
    logger.info('eSewa callback from individual parameters:', paymentData);
  }
  
  return paymentData;
};

/**
 * @route   GET /api/webhooks/esewa
 * @desc    eSewa payment callback (redirected from eSewa after payment)
 * @access  Public (verification via signature)
 * 
 * Note: eSewa redirects to success_url/failure_url with payment data.
 * Supports both Base64-encoded JSON in 'data' parameter and individual query parameters.
 */
router.get('/esewa', async (req, res, next) => {
  try {
    const paymentData = processEsewaCallback(req.query);
    
    if (!paymentData || (!paymentData.transaction_uuid && !paymentData.transaction_code)) {
      // Log as warning (this is expected when accessing URL directly)
      logger.warn('eSewa webhook accessed without payment data (likely direct access)', {
        url: req.originalUrl,
        query: req.query,
        ip: req.ip,
        method: req.method
      });
      
      // Return helpful message in development
      const config = require('../config/env');
      if (config.NODE_ENV === 'development') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Missing payment data',
          message: 'This endpoint expects payment callback data from eSewa. Access this URL after completing a payment on eSewa.',
          webhookUrl: `${config.API_URL}/webhooks/esewa`,
          testEndpoint: `${config.API_URL}/webhooks/esewa/test`,
          note: 'Use the test endpoint to simulate eSewa callbacks in development'
        });
      }
      
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Missing payment data');
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

/**
 * @route   POST /api/webhooks/esewa
 * @desc    eSewa payment callback (POST format, if supported)
 * @access  Public (verification via signature)
 * 
 * Some eSewa implementations may use POST with form data or JSON body
 */
router.post('/esewa', async (req, res, next) => {
  try {
    // Try body first (for JSON or form data), then query parameters
    const dataSource = Object.keys(req.body || {}).length > 0 ? req.body : req.query;
    const paymentData = processEsewaCallback(dataSource);
    
    if (!paymentData || (!paymentData.transaction_uuid && !paymentData.transaction_code)) {
      logger.warn('eSewa POST webhook accessed without payment data', {
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        ip: req.ip,
        method: req.method
      });
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Missing payment data');
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

      // Create tickets (same logic as GET handler)
      const createdTickets = [];
      for (const ticketItem of purchase.tickets) {
        const ticketType = await TicketType.findById(ticketItem.ticketTypeId);
        if (!ticketType) {
          logger.error('TicketType not found', { ticketTypeId: ticketItem.ticketTypeId });
          continue;
        }

        ticketType.quantitySold = (ticketType.quantitySold || 0) + ticketItem.quantity;
        await ticketType.save();

        for (let i = 0; i < ticketItem.quantity; i++) {
          const qrData = await generateTicketQRCode({
            ticketId: null,
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

      logger.info('Payment processed successfully (POST)', {
        transactionId: verification.transactionId,
        purchaseId: purchase._id
      });

      // For POST requests, return JSON instead of redirect
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: purchase.transactionId
      });
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

      return res.status(HTTP_STATUS.OK).json({
        success: false,
        message: `Payment ${verification.status}`,
        transactionId: purchase.transactionId
      });
    }
  } catch (error) {
    logger.error('Webhook processing error (POST):', error);
    next(error);
  }
});

/**
 * @route   GET /api/webhooks/esewa/test
 * @desc    Test endpoint to simulate eSewa callback (DEVELOPMENT ONLY)
 * @access  Public (development only)
 * 
 * This endpoint allows testing the webhook locally without real eSewa payments.
 * Usage: GET /api/webhooks/esewa/test?transactionId=<purchase_transaction_id>&status=COMPLETE
 */
router.get('/esewa/test', async (req, res, next) => {
  try {
    const config = require('../config/env');
    
    // Only allow in development
    if (config.NODE_ENV !== 'development') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Test endpoint only available in development mode'
      });
    }

    const { transactionId, status = 'COMPLETE' } = req.query;
    
    if (!transactionId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Missing transactionId',
        message: 'Provide a transactionId query parameter from an existing purchase',
        example: `${config.API_URL}/webhooks/esewa/test?transactionId=<purchase_transaction_id>&status=COMPLETE`
      });
    }

    // Find the purchase
    const purchase = await Purchase.findOne({
      transactionId: transactionId
    }).populate('userId').populate('eventId');

    if (!purchase) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Purchase not found',
        transactionId: transactionId,
        message: 'Make sure the transactionId exists in your database'
      });
    }

    // Generate a mock eSewa response with valid signature
    const crypto = require('crypto');
    const esewaConfig = require('../config/esewa');
    
    const mockTransactionCode = `TEST${Date.now()}`;
    const mockPaymentData = {
      transaction_code: mockTransactionCode,
      status: status,
      total_amount: purchase.totalAmount.toString(),
      transaction_uuid: purchase.transactionId,
      product_code: esewaConfig.merchantId,
      signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names'
    };

    // Generate signature
    const verificationMessage = [
      `transaction_code=${mockPaymentData.transaction_code}`,
      `status=${mockPaymentData.status}`,
      `total_amount=${mockPaymentData.total_amount}`,
      `transaction_uuid=${mockPaymentData.transaction_uuid}`,
      `product_code=${mockPaymentData.product_code}`,
      `signed_field_names=${mockPaymentData.signed_field_names}`
    ].join(',');

    const signature = crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(verificationMessage)
      .digest('base64');

    mockPaymentData.signature = signature;

    logger.info('Test webhook: Simulating eSewa callback', {
      transactionId: purchase.transactionId,
      status: status,
      purchaseId: purchase._id
    });

    // Process the payment (reuse the same logic as real webhook)
    const verification = verifyEsewaPayment(mockPaymentData);

    if (!verification.valid) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Signature verification failed in test',
        message: 'This should not happen. Check your eSewa configuration.'
      });
    }

    // Update purchase status
    if (verification.status === 'COMPLETE') {
      if (purchase.status === PURCHASE_STATUS.PAID) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Purchase already processed',
          purchaseId: purchase._id,
          transactionId: purchase.transactionId
        });
      }

      purchase.status = PURCHASE_STATUS.PAID;
      purchase.paymentId = verification.transactionCode;
      purchase.paymentReferenceId = verification.transactionCode;
      purchase.paymentDate = new Date();
      purchase.esewaResponse = mockPaymentData;
      await purchase.save();

      // Create tickets
      const createdTickets = [];
      for (const ticketItem of purchase.tickets) {
        const ticketType = await TicketType.findById(ticketItem.ticketTypeId);
        if (!ticketType) {
          logger.error('TicketType not found', { ticketTypeId: ticketItem.ticketTypeId });
          continue;
        }

        ticketType.quantitySold = (ticketType.quantitySold || 0) + ticketItem.quantity;
        await ticketType.save();

        for (let i = 0; i < ticketItem.quantity; i++) {
          const qrData = await generateTicketQRCode({
            ticketId: null,
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
        description: `Payment successful (TEST): ${purchase.transactionId}`,
        metadata: {
          purchaseId: purchase._id,
          transactionId: verification.transactionId,
          amount: purchase.totalAmount,
          test: true
        }
      });

      logger.info('Test payment processed successfully', {
        transactionId: verification.transactionId,
        purchaseId: purchase._id,
        ticketsCreated: createdTickets.length
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Test payment processed successfully',
        purchaseId: purchase._id,
        transactionId: purchase.transactionId,
        status: purchase.status,
        ticketsCreated: createdTickets.length,
        note: 'This was a test transaction. In production, use real eSewa payments.'
      });
    } else {
      purchase.status = verification.status === 'PENDING' ? PURCHASE_STATUS.PENDING : PURCHASE_STATUS.FAILED;
      purchase.esewaResponse = mockPaymentData;
      await purchase.save();

      return res.status(HTTP_STATUS.OK).json({
        success: false,
        message: `Test payment status: ${verification.status}`,
        purchaseId: purchase._id,
        transactionId: purchase.transactionId,
        status: purchase.status
      });
    }
  } catch (error) {
    logger.error('Test webhook processing error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/webhooks/esewa/config
 * @desc    Check eSewa configuration status (DEVELOPMENT ONLY)
 * @access  Public (development only)
 */
router.get('/esewa/config', (req, res) => {
  const config = require('../config/env');
  
  // Only allow in development
  if (config.NODE_ENV !== 'development') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Config endpoint only available in development mode'
    });
  }

  const esewaConfig = require('../config/esewa');
  
  res.status(HTTP_STATUS.OK).json({
    environment: config.NODE_ENV,
    configured: {
      merchantId: !!esewaConfig.merchantId,
      secretKey: !!esewaConfig.secretKey,
      apiUrl: !!esewaConfig.apiUrl,
      baseUrl: !!esewaConfig.baseUrl
    },
    values: {
      merchantId: esewaConfig.merchantId,
      apiUrl: esewaConfig.apiUrl,
      baseUrl: esewaConfig.baseUrl,
      secretKeyLength: esewaConfig.secretKey ? esewaConfig.secretKey.length : 0
    },
    urls: {
      webhook: `${config.API_URL}/webhooks/esewa`,
      testEndpoint: `${config.API_URL}/webhooks/esewa/test`,
      frontendUrl: config.FRONTEND_URL,
      apiUrl: config.API_URL
    },
    testCredentials: esewaConfig.testCredentials,
    note: 'Secret key is masked for security. Check .env file for actual values.'
  });
});

module.exports = router;





