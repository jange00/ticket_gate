const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');

router.post('/esewa/initiate', authenticate, paymentController.initiateEsewaPayment);

// Allow both GET and POST for eSewa callbacks (eSewa can send data as query params or body)
// Note: No validation middleware needed as eSewa sends data as query params in GET requests
router.all(
    '/esewa/verify', 
    optionalAuthenticate, // eSewa callbacks don't include auth tokens
    paymentController.verifyEsewaPayment
);

// PayPal routes
router.post('/paypal/initiate', authenticate, paymentController.initiatePayPalPayment);
router.post('/paypal/verify', optionalAuthenticate, paymentController.verifyPayPalPayment);

module.exports = router;
