const Purchase = require('../models/Purchase');
const env = require('../config/env');
const axios = require('axios');
const crypto = require('crypto');

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
    // If V2 is strictly required, we switch endpoints and logic
    const isTestMode = 
      process.env.NODE_ENV === 'development' || 
      process.env.ESEWA_ENV === 'test';

    // credentials for V2 Test
    // Product Code: EPAYTEST
    // Secret Key: 8gBm/:&EnhH.1/q
    // URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
    
    let merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    let secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    let paymentUrl = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    if (isTestMode) {
        merchantId = 'EPAYTEST';
        secretKey = '8gBm/:&EnhH.1/q';
        paymentUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    }

    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!frontendUrl.startsWith('http')) {
        frontendUrl = `http://${frontendUrl}`;
    }

    const successUrl = `${frontendUrl}/purchase/success`;
    const failureUrl = `${frontendUrl}/purchase/failure`;

    const productServiceCharge = 0;
    const deliveryCharge = 0; 
    const taxAmount = 0;
    
    const productAmount = purchase.subtotal - (purchase.discount || 0);
    const totalAmount = productAmount + productServiceCharge + deliveryCharge + taxAmount;
    
    // Verify calculation matches
    if (Math.abs(totalAmount - purchase.totalAmount) > 0.01) {
      console.warn(`Amount mismatch: calculated ${totalAmount}, purchase total ${purchase.totalAmount}`);
    }

    // Transaction UUID must be unique. Using purchase.transactionId or a new unique string
    // V2 requires 'transaction_uuid'
    const transactionUuid = `${purchase.transactionId}-${Date.now()}`; 
    purchase.esewaTransactionId = transactionUuid; 
    await purchase.save();

    // V2 Signature Generation
    // Format: total_amount=${total},transaction_uuid=${uid},product_code=${code}
    // eSewa requires amounts with 2 decimal places
    const totalAmountStr = totalAmount.toFixed(2);
    const signatureString = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${merchantId}`;
    
    const signature = crypto.createHmac('sha256', secretKey)
        .update(signatureString)
        .digest('base64');
    
    const formData = {
        amount: productAmount.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        total_amount: totalAmountStr,
        transaction_uuid: String(transactionUuid),
        product_code: String(merchantId),
        product_service_charge: productServiceCharge.toFixed(2),
        product_delivery_charge: deliveryCharge.toFixed(2),
        success_url: String(successUrl),
        failure_url: String(failureUrl),
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature,
    };

    console.log('eSewa V2 Form Data:', JSON.stringify(formData, null, 2));
    console.log('Payment URL:', paymentUrl);

    return res.status(200).json({
      success: true,
      data: {
        payment_url: paymentUrl,
        transactionId: transactionUuid, 
        formData: formData,
      },
      message: 'Esewa V2 payment initiated successfully',
    });

  } catch (error) {
    console.error('Esewa payment error STACK:', error.stack);
    return res.status(500).json({ success: false, message: 'Failed to initiate payment', error: error.message, stack: error.stack });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    console.log('Verifying eSewa payment V2. Body:', req.body);
    const { data } = req.body; // V2 sends a 'data' param (Base64 encoded)

    if (!data) {
        return res.status(400).json({ success: false, message: 'Missing data parameter' });
    }

    // Decode Base64
    const decodedBuffer = Buffer.from(data, 'base64');
    const decodedJson = JSON.parse(decodedBuffer.toString('utf-8'));
    console.log('Decoded Esewa Response:', decodedJson);
    
    const {
        transaction_code,
        status,
        total_amount,
        transaction_uuid,
        product_code,
        signature
    } = decodedJson;

    if (status !== 'COMPLETE') {
         return res.status(400).json({ success: false, message: 'Payment not complete' });
    }

    // Reconstruct Signature
    // Format: total_amount=${total},transaction_uuid=${uid},product_code=${code}
    let secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    if (product_code === 'EPAYTEST') {
        secretKey = '8gBm/:&EnhH.1/q';
    }
    
    // Ensure total_amount is formatted as in the string.
    // eSewa sends it back as string usually.
    // Example: "100.0"
    const totalAmountStr = String(total_amount).replace(/,/g, '');

    const signatureString = `total_amount=${totalAmountStr},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    
    const calculatedSignature = crypto.createHmac('sha256', secretKey)
        .update(signatureString)
        .digest('base64');

    if (calculatedSignature !== signature) {
        console.warn('Signature mismatch:', { calculatedSignature, signature, signatureString });
        // NOTE: In some test cases, eSewa signature matching can be tricky due to formatting.
        // But for V2 this is mandatory.
        return res.status(400).json({ success: false, message: 'Signature verification failed' });
    }

    // Find Purchase
    // We saved transaction_uuid as esewaTransactionId in the purchase
    const purchase = await Purchase.findOne({ esewaTransactionId: transaction_uuid });

    if (!purchase) {
        // Fallback: try finding by part of the uuid if we used `${purchase.transactionId}-...`
        // But better to exact match.
        return res.status(404).json({ success: false, message: 'Purchase not found for this transaction' });
    }

    // Update Purchase
    if (purchase.status !== 'paid') {
        purchase.status = 'paid';
        purchase.paymentDate = new Date();
        // optionally store the eSewa ref code
        purchase.esewaRefId = transaction_code; 
        await purchase.save();
    }

    return res.status(200).json({
      success: true,
      data: { purchase },
      message: 'Payment verified successfully',
    });

  } catch (error) {
    console.error('Esewa verification error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
};
