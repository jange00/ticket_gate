const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const User = require('../models/User');
const Event = require('../models/Event');
const env = require('../config/env');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const paypalService = require('../services/paypal.service');
const { generateTicketQRCode } = require('../services/qrcode.service');
const { sendTicketConfirmationEmail } = require('../services/email.service');
const { TICKET_STATUS, PURCHASE_STATUS } = require('../utils/constants');

exports.initiateEsewaPayment = async (req, res) => {
  try {
    console.log('Initiating eSewa payment V2. Body:', req.body);
    const { purchaseId, amount } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ success: false, message: 'Purchase ID is required' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    // Verify purchase exists
    const purchase = await Purchase.findOne({ _id: purchaseId });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    // Authorization check
    if (!purchase.userId || purchase.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Esewa V2 Configuration
    const merchantId = env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const secretKey = env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

    // Determine environment and URL
    const isTestMode = env.NODE_ENV === 'development' || merchantId === 'EPAYTEST' || env.ESEWA_ENV === 'test' || process.env.ESEWA_ENV === 'test';

    // FORCE Test Credentials if in Test Mode
    const currentMerchantId = isTestMode ? 'EPAYTEST' : merchantId;
    const currentSecretKey = isTestMode ? '8gBm/:&EnhH.1/q' : secretKey;
    const paymentUrl = isTestMode ? env.ESEWA_API_URL : 'https://epay.esewa.com.np/api/epay/main/v2/form';

    const successUrl = `${env.CLIENT_ORIGIN || env.FRONTEND_URL}/payment/verify`;
    const failureUrl = `${env.CLIENT_ORIGIN || env.FRONTEND_URL}/payment/verify`;

    // Calculate amounts exactly as requested
    const productAmount = (purchase.subtotal - (purchase.discount || 0)).toFixed(2);
    const productServiceCharge = (0).toFixed(2); // V2 session handling often prefers consistent decimals
    const deliveryCharge = (0).toFixed(2); // Delivery fee removed as per user request
    const taxAmount = (0).toFixed(2);

    const totalAmount = (
        parseFloat(productAmount) +
        parseFloat(productServiceCharge) +
        parseFloat(deliveryCharge) +
        parseFloat(taxAmount)
    ).toFixed(2);

    // Generate unique transaction UUID
    const transactionUuid = `TXN-${purchase._id.toString()}-${Date.now()}`;
    purchase.esewaTransactionId = transactionUuid;
    await purchase.save();

    // Generate Signature for V2
    // Message format: "total_amount=value,transaction_uuid=value,product_code=value"
    const productCode = currentMerchantId;
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    
    const hmac = crypto.createHmac('sha256', currentSecretKey);
    hmac.update(signatureString);
    const signatureBase64 = hmac.digest('base64');

    // Prepare form data for V2 strictly as requested
    const formData = {
        amount: productAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: currentMerchantId,
        product_service_charge: productServiceCharge,
        product_delivery_charge: deliveryCharge,
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signatureBase64,
    };

    console.log(`🌐 eSewa V2 Init: ${isTestMode ? 'TEST' : 'PROD'}`);
    console.log('📤 Signature String:', signatureString);
    console.log('📤 Form Data:', formData);

    // Proactively generate tickets at initiation as per user request
    // This ensures tickets are created even if the user cancels later
    try {
      await generateTicketsForPurchase(purchase._id);
    } catch (genError) {
      console.error('Proactive ticket generation error (non-blocking):', genError);
    }

    return res.status(200).json({
      success: true,
      data: {
        payment_url: paymentUrl,
        transactionId: transactionUuid,
        formData: formData,
        purchaseId: purchase._id
      },
      message: 'Esewa V2 payment initiated and tickets generated',
    });

  } catch (error) {
    console.error('Esewa payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate payment', error: error.message });
  }
};

/**
 * Helper function to generate tickets for a specific purchase
 * This is called after payment verification (success or fail)
 */
const generateTicketsForPurchase = async (purchaseId) => {
  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    // Only generate tickets if they don't already exist for this purchase
    const existingTicketsCount = await Ticket.countDocuments({ purchaseId });
    if (existingTicketsCount > 0) {
      console.log(`Tickets already exist for purchase ${purchaseId}, skipping generation.`);
      return;
    }

    const event = await Event.findById(purchase.eventId);
    const user = await User.findById(purchase.userId);
    const generatedTicketsInfo = [];

    for (const item of purchase.tickets) {
      const ticketType = await TicketType.findById(item.ticketTypeId);
      
      for (let i = 0; i < item.quantity; i++) {
        // Create temporary ticket object to generate QR code correctly
        const tempTicketId = new mongoose.Types.ObjectId();
        
        // Generate QR code
        const qrCodeData = await generateTicketQRCode({
          ticketId: tempTicketId.toString(),
          eventId: purchase.eventId.toString(),
          attendeeId: purchase.userId.toString(),
          purchaseId: purchase._id.toString()
        });

        const ticket = new Ticket({
          _id: tempTicketId,
          ticketTypeId: item.ticketTypeId,
          eventId: purchase.eventId,
          attendeeId: purchase.userId,
          purchaseId: purchase._id,
          qrCode: qrCodeData.qrCode,
          qrCodeHash: qrCodeData.qrCodeHash,
          status: TICKET_STATUS.CONFIRMED
        });

        await ticket.save();

        // Store info for email
        generatedTicketsInfo.push({
          ticketType: item.ticketType,
          qrDataUrl: qrCodeData.qrCodeDataURL
        });
      }

      // Update quantity sold for ticket type
      ticketType.quantitySold += item.quantity;
      await ticketType.save();
    }

    // Update Event stats (tickets sold and revenue)
    event.soldTickets += purchase.tickets.reduce((acc, curr) => acc + curr.quantity, 0);
    event.totalRevenue += purchase.totalAmount;
    await event.save();

    // Mark purchase as paid (even if it was a simulated failure)
    purchase.status = PURCHASE_STATUS.PAID;
    purchase.paymentDate = new Date();
    await purchase.save();

    // Send confirmation email with QR codes
    try {
      await sendTicketConfirmationEmail(user.email, user.firstName, {
        eventName: event.title,
        transactionId: purchase.transactionId,
        quantity: purchase.tickets.reduce((acc, curr) => acc + curr.quantity, 0),
        totalAmount: purchase.totalAmount,
        purchaseDate: new Date().toLocaleDateString()
      }, generatedTicketsInfo);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

  } catch (error) {
    console.error('Error generating tickets:', error);
    throw error;
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    // V2 sends 'data' param - can be in body or query string
    const data = req.body.data || req.query.data;

    if (!data) {
        return res.status(400).json({ success: false, message: 'Missing data parameter' });
    }

    // Decode Base64
    const decodedJson = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    console.log('📥 eSewa Verify Data:', decodedJson);
    
    const {
        status,
        signature,
        transaction_code,
        total_amount,
        transaction_uuid,
        product_code,
        signed_field_names
    } = decodedJson;

    if (status !== 'COMPLETE') {
         console.warn(`Payment for ${transaction_uuid} not complete, but generating tickets anyway as per user request.`);
    }

    // Determine secret key based on product code
    const secretKey = product_code === 'EPAYTEST' ? '8gBm/:&EnhH.1/q' : (env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q');

    // Reconstruct Signature using signed_field_names
    let signatureString = '';
    const fields = (signed_field_names || 'total_amount,transaction_uuid,product_code').split(',');
    fields.forEach((field, index) => {
      signatureString += `${field}=${decodedJson[field]}`;
      if (index < fields.length - 1) {
        signatureString += ',';
      }
    });

    console.log(`📥 Verifying with Key: ${secretKey.slice(0, 5)}...`);
    console.log(`📥 Reconstructed Sig String: ${signatureString}`);
    
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    const expectedSignature = hmac.digest('base64');

    if (signature !== expectedSignature) {
        console.error('Signature mismatch:', { received: signature, expected: expectedSignature });
        return res.status(400).json({ success: false, message: 'Signature verification failed' });
    }

    // Find Purchase by esewaTransactionId
    const purchase = await Purchase.findOne({ esewaTransactionId: transaction_uuid });

    if (!purchase) {
        return res.status(404).json({ success: false, message: 'Purchase not found for this transaction' });
    }

    // Update Purchase
    if (purchase.status !== 'paid') {
        purchase.status = 'paid';
        purchase.paymentDate = new Date();
        purchase.esewaRefId = transaction_code;
        // Store full eSewa response data
        purchase.esewaResponse = decodedJson;
        await purchase.save();
    }

    // Generate tickets (this now marks it as paid and handles increments)
    await generateTicketsForPurchase(purchase._id);
    const updatedPurchase = await Purchase.findById(purchase._id);

    return res.status(200).json({
      success: true,
      data: { purchase: updatedPurchase },
      message: 'Payment verified and tickets generated successfully',
    });

  } catch (error) {
    console.error('Esewa verification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
};

/**
 * Initiate PayPal Payment
 * Creates a PayPal order and returns approval URL
 */
exports.initiatePayPalPayment = async (req, res) => {
  try {
    console.log('Initiating PayPal payment. Body:', req.body);
    const { purchaseId, amount } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ success: false, message: 'Purchase ID is required' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    // Verify purchase exists
    const purchase = await Purchase.findOne({ _id: purchaseId });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    // Authorization check
    if (!purchase.userId || purchase.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get frontend URL for callbacks
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!frontendUrl.startsWith('http')) {
      frontendUrl = `http://${frontendUrl}`;
    }

    const returnUrl = `${frontendUrl}/payment/verify?payment_method=paypal`;
    const cancelUrl = `${frontendUrl}/checkout?canceled=true`;
    
    // Currency conversion logic (NPR to USD)
    const exchangeRate = env.PAYPAL_EXCHANGE_RATE || 135;
    const amountUSD = (amountNum / exchangeRate).toFixed(2);

    // Create PayPal order
    const orderData = {
      amount: amountUSD,
      currency: 'USD',
      description: `Event Tickets - Purchase ${purchase.transactionId} (${amountNum} NPR)`,
      customId: purchaseId,
      purchaseId: purchaseId,
      returnUrl: returnUrl,
      cancelUrl: cancelUrl,
      brandName: 'TicketGate',
      requestId: `${purchaseId}-${Date.now()}`,
    };

    const paypalOrder = await paypalService.createOrder(orderData);

    console.log('PayPal Order Created:', paypalOrder.id, 'Amount:', amountUSD, 'USD');

    // Store PayPal order ID and conversion details in purchase
    purchase.paypalOrderId = paypalOrder.id;
    purchase.metadata = {
      ...purchase.metadata,
      paypalConversion: {
        originalAmountNPR: amountNum,
        exchangeRate: exchangeRate,
        amountUSD: parseFloat(amountUSD)
      }
    };
    await purchase.save();

    // Find approval URL from links
    const approvalUrl = paypalOrder.links?.find(link => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      return res.status(500).json({ success: false, message: 'Failed to get PayPal approval URL' });
    }

    // Proactively generate tickets at initiation as per user request
    try {
      await generateTicketsForPurchase(purchase._id);
    } catch (genError) {
      console.error('Proactive ticket generation error (non-blocking):', genError);
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: paypalOrder.id,
        approvalUrl: approvalUrl,
        status: paypalOrder.status,
        amountUSD: amountUSD,
        exchangeRate: exchangeRate,
        purchaseId: purchase._id
      },
      message: 'PayPal payment initiated and tickets generated',
    });

  } catch (error) {
    console.error('PayPal payment initiation error:', error);
    console.error('PayPal error message:', error.message);
    console.error('PayPal error stack:', error.stack);
    if (error.response) {
      console.error('PayPal API response error:', error.response.data);
      console.error('PayPal API response status:', error.response.status);
    }
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to initiate PayPal payment';
    if (error.message?.includes('credentials are not configured')) {
      errorMessage = 'PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file';
    } else if (error.response?.data?.message) {
      errorMessage = `PayPal API error: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        ...(error.response && { 
          paypalResponse: error.response.data,
          paypalStatus: error.response.status 
        })
      })
    });
  }
};

/**
 * Verify/Capture PayPal Payment
 * Captures the payment after user approval
 */
exports.verifyPayPalPayment = async (req, res) => {
  try {
    console.log('Verifying PayPal payment. Body:', req.body);
    console.log('Verifying PayPal payment. Query:', req.query);
    
    const orderId = req.body.orderId || req.query.token;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    // Capture the order
    const captureResult = await paypalService.captureOrder(orderId);

    console.log('PayPal Capture Result:', captureResult);

    // Check if capture was successful
    if (captureResult.status !== 'COMPLETED') {
      console.warn(`PayPal payment for ${orderId} not completed, but generating tickets anyway.`);
    }

    // Find purchase by PayPal order ID
    const purchase = await Purchase.findOne({ paypalOrderId: orderId });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found for this order' });
    }

    // Update Purchase
    if (purchase.status !== 'paid') {
      purchase.status = 'paid';
      purchase.paymentDate = new Date();
      
      // Store PayPal transaction details
      const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
      if (capture) {
        purchase.paymentId = capture.id;
        purchase.paymentReferenceId = capture.id;
        purchase.paypalResponse = {
          orderId: captureResult.id,
          captureId: capture.id,
          status: capture.status,
          amount: capture.amount,
          createTime: capture.create_time,
          updateTime: capture.update_time,
          fullResponse: captureResult,
        };
      }
      
      await purchase.save();
    }

    // Generate tickets
    await generateTicketsForPurchase(purchase._id);
    const updatedPurchase = await Purchase.findById(purchase._id);

    return res.status(200).json({
      success: true,
      data: { purchase: updatedPurchase },
      message: 'PayPal payment verified and tickets generated successfully',
    });

  } catch (error) {
    console.error('PayPal verification error:', error.message);
    console.error('PayPal verification error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify PayPal payment', 
      error: error.message 
    });
  }
};
