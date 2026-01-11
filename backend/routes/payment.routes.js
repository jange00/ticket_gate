const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/esewa/initiate', authenticate, paymentController.initiateEsewaPayment);

router.post(
    '/esewa/verify', 
    authenticate,
    [
        body('data').optional().isString(),
        // Legacy fields are required ONLY if 'data' is NOT present
        body('purchaseId').if(body('data').not().exists()).notEmpty().withMessage('Purchase ID is required'),
        body('refId').if(body('data').not().exists()).notEmpty().withMessage('Reference ID is required'),
    ],
    paymentController.verifyEsewaPayment
);

module.exports = router;
