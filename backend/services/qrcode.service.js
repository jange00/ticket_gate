const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('./logging.service');
const config = require('../config/env');

/**
 * Generate QR code for ticket with HMAC signature
 */
const generateTicketQRCode = async (ticketData) => {
  try {
    // Create payload
    const payload = {
      ticketId: ticketData.ticketId,
      eventId: ticketData.eventId,
      attendeeId: ticketData.attendeeId,
      purchaseId: ticketData.purchaseId,
      timestamp: new Date().toISOString()
    };

    // Sign with HMAC-SHA256
    const message = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(message)
      .digest('base64');

    // Create signed QR data
    const qrData = JSON.stringify({
      ...payload,
      signature
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      qrCodeDataURL,
      qrCode: qrData,
      qrCodeHash: crypto.createHash('sha256').update(qrData).digest('hex')
    };
  } catch (error) {
    logger.error('QR code generation failed:', error);
    throw error;
  }
};

/**
 * Generate QR code as buffer (for file storage)
 */
const generateTicketQRCodeBuffer = async (ticketData) => {
  try {
    // Create payload
    const payload = {
      ticketId: ticketData.ticketId,
      eventId: ticketData.eventId,
      attendeeId: ticketData.attendeeId,
      purchaseId: ticketData.purchaseId,
      timestamp: new Date().toISOString()
    };

    // Sign with HMAC-SHA256
    const message = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(message)
      .digest('base64');

    // Create signed QR data
    const qrData = JSON.stringify({
      ...payload,
      signature
    });

    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.92,
      margin: 2,
      width: 300
    });

    return {
      buffer,
      qrCode: qrData,
      qrCodeHash: crypto.createHash('sha256').update(qrData).digest('hex')
    };
  } catch (error) {
    logger.error('QR code buffer generation failed:', error);
    throw error;
  }
};

/**
 * Verify QR code data and signature
 */
const verifyQRCodeData = (qrDataString) => {
  try {
    const data = JSON.parse(qrDataString);
    
    // Validate required fields
    if (!data.ticketId || !data.purchaseId || !data.eventId || !data.attendeeId || !data.signature) {
      return { valid: false, error: 'Invalid QR code data structure' };
    }

    // Verify signature
    const { signature, ...payload } = data;
    const message = JSON.stringify(payload);
    const calculatedSignature = crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(message)
      .digest('base64');

    if (calculatedSignature !== signature) {
      return { valid: false, error: 'Invalid QR code signature' };
    }

    return { valid: true, data: payload };
  } catch (error) {
    return { valid: false, error: 'Invalid QR code format' };
  }
};

module.exports = {
  generateTicketQRCode,
  generateTicketQRCodeBuffer,
  verifyQRCodeData
};
