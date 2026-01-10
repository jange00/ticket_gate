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
    const finalTotalAmount = totalAmount || calculatedTotal;
    const finalTaxAmount = taxAmount || 0;
    const finalProductServiceCharge = productServiceCharge || serviceCharge || 0;
    const finalProductDeliveryCharge = productDeliveryCharge || deliveryCharge || 0;
    const transactionUuid = productId || generateTransactionId();
    
    logger.info('Calculated values:', {
      amount,
      taxAmount: finalTaxAmount,
      serviceCharge: finalProductServiceCharge,
      deliveryCharge: finalProductDeliveryCharge,
      calculatedTotal,
      totalAmount: finalTotalAmount,
      transactionUuid
    });
    
    // Build payment parameters (using eSewa documentation parameter names)
    const finalSuccessUrl = successUrl || `${esewaConfig.baseUrl}/success`;
    const finalFailureUrl = failureUrl || `${esewaConfig.baseUrl}/failure`;
    
    const paymentParams = {
      amount: amount.toString(),
      tax_amount: finalTaxAmount.toString(),
      total_amount: finalTotalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: esewaConfig.merchantId,
      product_service_charge: finalProductServiceCharge.toString(),
      product_delivery_charge: finalProductDeliveryCharge.toString(),
      success_url: finalSuccessUrl,
      failure_url: finalFailureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code'
    };

    logger.info('Payment parameters built:', JSON.stringify(paymentParams, null, 2));
    logger.info('eSewa configuration:', {
      merchantId: esewaConfig.merchantId,
      apiUrl: esewaConfig.apiUrl,
      baseUrl: esewaConfig.baseUrl,
      secretKeyLength: esewaConfig.secretKey ? esewaConfig.secretKey.length : 0,
      secretKeySet: !!esewaConfig.secretKey
    });

    // Generate signature (ONLY these 3 fields in exact order as per eSewa documentation)
    const signatureFields = ['total_amount', 'transaction_uuid', 'product_code'];
    const signatureMessage = signatureFields
      .map(field => `${field}=${paymentParams[field]}`)
      .join(',');
    
    logger.info('Signature generation:', {
      signatureFields,
      signatureMessage,
      secretKey: esewaConfig.secretKey ? `${esewaConfig.secretKey.substring(0, 5)}...` : 'NOT SET'
    });
    
    const signature = crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(signatureMessage)
      .digest('base64');

    logger.info('Signature generated:', {
      signature,
      signatureLength: signature.length
    });

    // Add signature to params
    paymentParams.signature = signature;

    // Build form data (eSewa expects form submission, but we'll return URL with query params)
    // Note: eSewa documentation shows HTML form, but query params in URL also work
    const queryParts = [];
    Object.keys(paymentParams).forEach(key => {
      const value = paymentParams[key];
      queryParts.push(`${key}=${encodeURIComponent(value)}`);
    });
    
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
      transactionUuid: paymentParams.transaction_uuid,
      totalAmount: paymentParams.total_amount,
      productCode: paymentParams.product_code,
      endpoint: esewaConfig.apiUrl,
      successUrl: paymentParams.success_url,
      failureUrl: paymentParams.failure_url
    });

    return {
      paymentUrl: paymentUrl,
      transactionId: paymentParams.transaction_uuid,
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
 * Response format from eSewa documentation:
 * {
 *   "transaction_code": "000AWEO",
 *   "status": "COMPLETE",
 *   "total_amount": 1000.0,
 *   "transaction_uuid": "250610-162413",
 *   "product_code": "EPAYTEST",
 *   "signed_field_names": "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
 *   "signature": "..."
 * }
 */
const verifyEsewaPayment = (paymentResponse) => {
  try {
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    } = paymentResponse;

    // Build verification data (fields must match signed_field_names in order)
    // According to documentation: transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names
    const verificationMessage = [
      `transaction_code=${transaction_code}`,
      `status=${status}`,
      `total_amount=${total_amount}`,
      `transaction_uuid=${transaction_uuid}`,
      `product_code=${product_code}`,
      `signed_field_names=${signed_field_names}`
    ].join(',');
    
    const calculatedSignature = crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(verificationMessage)
      .digest('base64');

    // Verify signature
    const isValid = calculatedSignature === signature;

    if (isValid) {
      logger.info('eSewa payment verified successfully', {
        transaction_uuid,
        transaction_code,
        status,
        total_amount
      });
    } else {
      logger.warn('eSewa payment verification failed', {
        transaction_uuid,
        expectedSignature: calculatedSignature,
        receivedSignature: signature
      });
    }

    return {
      valid: isValid,
      transactionId: transaction_uuid,
      transactionCode: transaction_code,
      refId: transaction_code,
      status: status,
      totalAmount: total_amount,
      productCode: product_code
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
 * Check payment status from eSewa API
 * Used when no response received within 5 minutes
 */
const checkPaymentStatus = async (transactionUuid, totalAmount) => {
  try {
    const statusUrl = `${esewaConfig.baseUrl}/api/epay/transaction/status/`;
    const params = new URLSearchParams({
      product_code: esewaConfig.merchantId,
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid
    });

    const response = await axios.get(`${statusUrl}?${params.toString()}`);
    
    logger.info('Payment status checked', {
      transactionUuid,
      status: response.data.status,
      refId: response.data.ref_id
    });

    return {
      success: true,
      status: response.data.status,
      refId: response.data.ref_id,
      productCode: response.data.product_code,
      transactionUuid: response.data.transaction_uuid,
      totalAmount: response.data.total_amount
    };
  } catch (error) {
    logger.error('Payment status check failed:', error);
    return {
      success: false,
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
  checkPaymentStatus,
  processRefund
};







