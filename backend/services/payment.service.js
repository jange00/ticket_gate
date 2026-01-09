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
    logger.info('=== eSewa Payment URL Generation Started ===');
    logger.info('Input paymentData:', JSON.stringify(paymentData, null, 2));

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
    
    logger.info('Calculated values:', {
      amount,
      taxAmount,
      serviceCharge,
      deliveryCharge,
      calculatedTotal,
      totalAmount: totalAmount || calculatedTotal
    });
    
    // Build payment parameters
    // CRITICAL: su and fu URLs MUST be URL-encoded before adding to params
    // URLSearchParams.append() encodes values, but eSewa requires explicit encoding
    const finalSuccessUrl = successUrl || `${esewaConfig.baseUrl}/success`;
    const finalFailureUrl = failureUrl || `${esewaConfig.baseUrl}/failure`;
    
    const paymentParams = {
      amt: (totalAmount || calculatedTotal).toString(), // Convert to string
      psc: (productServiceCharge || serviceCharge).toString(),
      pdc: (productDeliveryCharge || deliveryCharge).toString(),
      txAmt: '0', // Tax amount (required by eSewa, usually 0)
      tAmt: (totalAmount || calculatedTotal).toString(), // Total amount
      pid: productId || generateTransactionId(),
      scd: esewaConfig.merchantId,
      su: encodeURIComponent(finalSuccessUrl), // CRITICAL: Must be URL-encoded!
      fu: encodeURIComponent(finalFailureUrl)  // CRITICAL: Must be URL-encoded!
    };

    logger.info('Payment parameters built:', JSON.stringify(paymentParams, null, 2));
    logger.info('eSewa configuration:', {
      merchantId: esewaConfig.merchantId,
      apiUrl: esewaConfig.apiUrl,
      baseUrl: esewaConfig.baseUrl,
      secretKeyLength: esewaConfig.secretKey ? esewaConfig.secretKey.length : 0,
      secretKeySet: !!esewaConfig.secretKey
    });

    // Generate signature
    const sortedKeys = Object.keys(paymentParams).sort();
    const message = sortedKeys
      .map(key => `${key}=${paymentParams[key]}`)
      .join(',');
    
    logger.info('Signature generation:', {
      sortedKeys,
      message,
      secretKey: esewaConfig.secretKey ? `${esewaConfig.secretKey.substring(0, 5)}...` : 'NOT SET'
    });
    
    const signature = crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(message)
      .digest('base64');

    logger.info('Signature generated:', {
      signature,
      signatureLength: signature.length
    });

    // Build payment URL manually to avoid double-encoding
    // URLSearchParams would double-encode pre-encoded URLs
    // Build query string manually: keys don't need encoding, values do (except su/fu which are pre-encoded)
    const queryParts = [];
    
    // Add all parameters
    Object.keys(paymentParams).forEach(key => {
      const value = paymentParams[key];
      // Keys are safe strings, values need encoding (but su/fu are already encoded)
      queryParts.push(`${key}=${value}`); // su and fu are already encoded, others are safe strings
    });
    queryParts.push(`signature=${encodeURIComponent(signature)}`); // Encode signature (base64 may have special chars)
    
    // Build final URL
    const queryString = queryParts.join('&');
    const paymentUrl = `${esewaConfig.apiUrl}?${queryString}`;

    logger.info('=== eSewa Payment URL Generated Successfully ===');
    logger.info('Final payment URL:', paymentUrl);
    logger.info('Payment URL breakdown:', {
      baseUrl: esewaConfig.apiUrl,
      queryString: queryString,
      parameters: paymentParams,
      signature: signature,
      fullUrl: paymentUrl
    });
    logger.info('Summary:', {
      productId: paymentParams.pid,
      amount: paymentParams.tAmt,
      merchantId: paymentParams.scd,
      endpoint: esewaConfig.apiUrl,
      successUrl: paymentParams.su,
      failureUrl: paymentParams.fu
    });

    return {
      paymentUrl: paymentUrl,
      transactionId: paymentParams.pid,
      signature
    };
  } catch (error) {
    logger.error('=== eSewa Payment URL Generation FAILED ===');
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    logger.error('Error occurred with paymentData:', JSON.stringify(paymentData, null, 2));
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







