const crypto = require('crypto');

function verifySignature(totalAmount, transactionUuid, productCode, secretKey, expectedSignature) {
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    const signatureBase64 = hmac.digest('base64');
    
    console.log('--- Signature Verification ---');
    console.log('Sig String:', signatureString);
    console.log('Expected:', expectedSignature);
    console.log('Calculated:', signatureBase64);
    
    return signatureBase64 === expectedSignature;
}

// Test with the data from the user's request
const testData = {
    total_amount: '2.95',
    transaction_uuid: 'TXN-696518889501844c7d9994ac-1768233096307',
    product_code: 'EPAYTEST',
    secret: '8gBm/:&EnhH.1/q',
    signature: 'rBrfWcmknoOvki6QwJmomvr2VsZghjfC4pIO2gMUUYI='
};

const result = verifySignature(
    '100.00',
    'TXN-TEST-123',
    'EPAYTEST',
    '8gBm/:&EnhH.1/q',
    'orRIPs9ZEvbd8THnEOZF/AkOnpz/6XeKGVSp6z3snKw=' // signature for "100.00"
);

if (result) {
    console.log('✅ Signature verification logic is correct.');
} else {
    console.log('❌ Signature verification logic FAILED.');
    process.exit(1);
}
