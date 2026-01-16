const config = require('../config/env');
const logger = require('./logging.service');
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate eSewa Signature
 */
const generateSignature = (message) => {
  const hmac = crypto.createHmac('sha256', config.ESEWA_SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
};

/**
 * Generate eSewa Payment URL
 */
const generateEsewaPaymentUrl = async (purchaseId, amount, transactionId) => {
  try {
    logger.info('=== eSewa Payment URL Generation Started ===');
    
    // In test environment, use default success/fail URLs
    // In production, these should be real endpoints
    const successUrl = `${config.FRONTEND_URL}/payment/success?q=su`;
    const failureUrl = `${config.FRONTEND_URL}/payment/failure?q=fu`;
    
    const productCode = config.ESEWA_MERCHANT_ID;
    const totalAmount = amount.toString();
    const transactionUuid = transactionId;
    
    // Message format: "total_amount,transaction_uuid,product_code"
    const message = `${totalAmount},${transactionUuid},${productCode}`;
    const signature = generateSignature(message);
    
    logger.info('eSewa Payment URL generated', {
      productCode,
      totalAmount,
      transactionUuid
    });
    
    return {
      url: config.ESEWA_API_URL,
      formData: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature
      }
    };
  } catch (error) {
    logger.error('Error generating eSewa payment URL:', error);
    throw error;
  }
};

/**
 * Check Payment Status
 */
const checkPaymentStatus = async (transactionId, totalAmount) => {
  try {
    const productCode = config.ESEWA_MERCHANT_ID;
    const url = `${config.ESEWA_BASE_URL}/api/epay/transaction/status/`;
    
    const params = {
      product_code: productCode,
      total_amount: totalAmount,
      transaction_uuid: transactionId
    };
    
    // In development/test with local URL, we might mock this
    // But assuming the standard eSewa API
    
    logger.info(`Checking payment status for ${transactionId}`);
    
    const response = await axios.get(url, { params });
    
    // eSewa status format: { status: "COMPLETE", ref_id: "...", ... }
    const status = response.data.status;
    
    return {
      success: true,
      status: status,
      details: response.data
    };
  } catch (error) {
    logger.error(`Error checking payment status for ${transactionId}:`, error.message);
    // Return graceful failure
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process Refund
 * This is a partial stub since eSewa refund API is not fully detailed here.
 * Implementing as a record-keeping function mainly.
 */
const processRefund = async ({ transactionId, amount, refundId }) => {
  try {
    logger.info(`Processing refund for transaction ${transactionId}, amount: ${amount}`);
    
    // Here logic to contact eSewa API for refund would go
    // Since we don't have the specific endpoint in env, we simulate success
    // or log it.
    
    logger.warn('*** SIMULATING ESEWA REFUND ***');
    logger.warn(`Would send request to eSewa to refund ${amount} for transaction ${transactionId}`);
    logger.warn('*** END SIMULATION ***');
    
    // Assuming success for internal tracking
    return {
      success: true,
      refundId: refundId || uuidv4(),
      status: 'PROCESSED',
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Error processing refund:', error);
    throw error;
  }
};

// Verify eSewa Signature (for webhooks)
const verifyEsewaSignature = (data) => {
  try {
    const { total_amount, transaction_uuid, product_code, signature } = data;
    
    const message = `${total_amount},${transaction_uuid},${product_code}`;
    const expectedSignature = generateSignature(message);
    
    return signature === expectedSignature;
  } catch (error) {
    logger.error('Error verifying signature:', error);
    return false;
  }
};

module.exports = {
  generateEsewaPaymentUrl,
  checkPaymentStatus,
  processRefund,
  verifyEsewaSignature
};
