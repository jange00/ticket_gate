const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('./logging.service');

let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Only for development
    }
  });

  return transporter;
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const mailTransporter = createTransporter();
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to TicketGate';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to TicketGate!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for registering with TicketGate. Your account has been successfully created.</p>
          <p>You can now start purchasing tickets for amazing events!</p>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <div class="warning">
            <strong>Warning:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send ticket purchase confirmation email
 */
const sendTicketConfirmationEmail = async (email, name, purchaseDetails) => {
  const subject = 'Ticket Purchase Confirmation';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .ticket-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ticket Purchase Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for your purchase! Your tickets are confirmed.</p>
          <div class="ticket-info">
            <h3>Event: ${purchaseDetails.eventName}</h3>
            <p><strong>Transaction ID:</strong> ${purchaseDetails.transactionId}</p>
            <p><strong>Number of Tickets:</strong> ${purchaseDetails.quantity}</p>
            <p><strong>Total Amount:</strong> NPR ${purchaseDetails.totalAmount}</p>
            <p><strong>Purchase Date:</strong> ${purchaseDetails.purchaseDate}</p>
          </div>
          <p>Please check your account for ticket details and QR codes.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

/**
 * Send email verification OTP
 */
const sendVerificationOTPEmail = async (email, name, otp) => {
  const subject = `${otp} is your TicketGate verification code`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; }
        .content { padding: 40px; text-align: center; }
        .otp-container { background-color: #f8f9fa; border: 2px dashed #ff6b00; border-radius: 8px; padding: 20px; margin: 30px 0; display: inline-block; }
        .otp-code { font-size: 42px; font-weight: bold; color: #ff6b00; letter-spacing: 12px; margin-left: 12px; }
        .footer { text-align: center; padding: 25px; font-size: 13px; color: #888; background-color: #f8f9fa; }
        .divider { height: 1px; background-color: #eee; margin: 20px 0; }
        .note { color: #666; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TicketGate</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email</h2>
          <p>Hi ${name},</p>
          <p>Please use the following 6-digit code to complete your registration. This code will expire in 10 minutes.</p>
          
          <div class="otp-container">
            <span class="otp-code">${otp}</span>
          </div>
          
          <p class="note">If you didn't request this code, you can safely ignore this email.</p>
          <div class="divider"></div>
          <p>Welcome aboard!<br><strong>The TicketGate Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
          <p>Secure ticketing for your favorite events.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTicketConfirmationEmail,
  sendVerificationOTPEmail
};













