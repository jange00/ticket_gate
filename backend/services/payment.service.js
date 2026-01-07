const axios = require('axios');
const crypto = require('crypto');
const esewaConfig = require('../config/esewa');
const logger = require('./logging.service');
const { generateTransactionId } = require('../utils/helpers');

/**
 * Generate eSewa payment request URL
 */
const generateEsewaPaymentUrl = (paymentData) => {
  try {
    const {
      amount,
      taxAmount = 0,
      serviceCharge = 0,
      deliveryCharge = 0,
      totalAmount,
      productId,
      productName,
      productServiceCharge = 0,
      productDeliveryCharge = 0,
      callbackUrl,
      successUrl,
      failureUrl
    } = paymentData;

    // Calculate total
    const calculatedTotal = amount + taxAmount + serviceCharge + deliveryCharge;
    
    // Build payment parameters
    const paymentParams = {
      amt: totalAmount || calculatedTotal,
      psc: productServiceCharge || serviceCharge,
      pdc: productDeliveryCharge || deliveryCharge,
      tAmt: totalAmount || calculatedTotal,
      pid: productId || generateTransactionId(),
      scd: esewaConfig.merchantId,
      su: successUrl || `${esewaConfig.baseUrl}/success`,
      fu: failureUrl || `${esewaConfig.baseUrl}/failure`
    };

    // Generate signature
    const message = Object.keys(paymentParams)
      .sort()
      .map(key => `${key}=${paymentParams[key]}`)
      .join(',');
    
    const signature = crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(message)
      .digest('base64');

    // Build payment URL
    const paymentUrl = new URL(esewaConfig.apiUrl);
    Object.keys(paymentParams).forEach(key => {
      paymentUrl.searchParams.append(key, paymentParams[key]);
    });
    paymentUrl.searchParams.append('signature', signature);

    logger.info('eSewa payment URL generated', {
      productId: paymentParams.pid,
      amount: paymentParams.tAmt
    });

    return {
      paymentUrl: paymentUrl.toString(),
      transactionId: paymentParams.pid,
      signature
    };
  } catch (error) {
    logger.error('eSewa payment URL generation failed:', error);
    throw error;
  }
};

/**
 * Verify eSewa payment response
 */
const verifyEsewaPayment = (paymentResponse) => {
  try {
    const {
      amount,
      refId,
      transactionId,
      transactionUUID,
      signature
    } = paymentResponse;

    // Build verification data
    const verificationData = {
      amount,
      refId,
      transactionId,
      transactionUUID
    };

    // Generate signature
    const message = Object.keys(verificationData)
      .sort()
      .map(key => `${key}=${verificationData[key]}`)
      .join(',');
    
    const calculatedSignature = crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(message)
      .digest('base64');

    // Verify signature
    const isValid = calculatedSignature === signature;

    if (isValid) {
      logger.info('eSewa payment verified successfully', {
        transactionId,
        refId,
        amount
      });
    } else {
      logger.warn('eSewa payment verification failed', {
        transactionId,
        refId
      });
    }

    return {
      valid: isValid,
      transactionId,
      refId,
      amount,
      transactionUUID
    };
  } catch (error) {
    logger.error('eSewa payment verification failed:', error);
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Process refund (if eSewa API supports it)
 */
const processRefund = async (refundData) => {
  try {
    // Note: eSewa refund implementation depends on their API
    // This is a placeholder for refund logic
    logger.info('Refund request received', refundData);
    
    // In a real implementation, you would call eSewa's refund API here
    // For now, return a mock response
    return {
      success: true,
      refundId: generateTransactionId(),
      amount: refundData.amount,
      status: 'processed'
    };
  } catch (error) {
    logger.error('Refund processing failed:', error);
    throw error;
  }
};

module.exports = {
  generateEsewaPaymentUrl,
  verifyEsewaPayment,
  processRefund
};






