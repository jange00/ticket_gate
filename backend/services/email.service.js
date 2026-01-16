const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('./logging.service');

let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Validate configuration
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    logger.warn('Email configuration missing. Emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: config.NODE_ENV === 'production' ? true : false
    }
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      logger.error('SMTP Connection Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        user: config.EMAIL_USER
      });
      transporter = null;
    } else {
      logger.info(`SMTP Server is ready to take our messages (User: ${config.EMAIL_USER})`);
    }
  });

  return transporter;
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = null, bcc = null) => {
  try {
    const mailTransporter = createTransporter();
    
    if (!mailTransporter) {
      if (config.NODE_ENV === 'development') {
        logger.info(`[DEV MODE] Email to ${to} skipped (no configuration). Subject: ${subject}`);
        return { messageId: 'dev-mode-fake-id' };
      }
      throw new Error('Email transporter not configured');
    }
    
    const mailOptions = {
      from: `"${config.MFA_ISSUER || 'TicketGate'}" <${config.EMAIL_FROM}>`,
      to,
      bcc, // Send blind carbon copy if provided
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
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
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f9; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 40px; text-align: center; }
        .button-container { margin: 30px 0; }
        .button { display: inline-block; padding: 14px 28px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; transition: background-color 0.3s; }
        .link-text { color: #888; font-size: 13px; margin: 20px 0; word-break: break-all; }
        .footer { text-align: center; padding: 25px; font-size: 12px; color: #999; border-top: 1px solid #eeeeee; }
        .warning-box { background-color: #fff9c4; border-left: 4px solid #fbc02d; padding: 15px; margin: 20px 0; text-align: left; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We received a request to reset your TicketGate password. Click the button below to set a new password:</p>
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="warning-box">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you did not request this change, please ignore this email or contact support if you have concerns.
            </div>
            <p class="link-text">
              If the button doesn't work, copy and paste this link:<br>
              ${resetUrl}
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
            <p>Secure ticketing for your favorite events.</p>
          </div>
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
const sendTicketConfirmationEmail = async (email, name, purchaseDetails, tickets = []) => {
  const subject = 'Ticket Purchase Confirmation - ' + purchaseDetails.eventName;
  
  // Create ticket cards for the email
  const ticketCardsHtml = tickets.map((t, i) => `
    <div style="background-color: white; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
      <h4 style="margin: 0 0 10px 0; color: #333;">${t.ticketType}</h4>
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Ticket #${i + 1}</p>
      <img src="${t.qrDataUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
      <p style="margin: 15px 0 0 0; font-size: 12px; color: #888;">Scan this code at the event entrance</p>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f9; }
        .header { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .purchase-summary { background-color: #e3f2fd; padding: 20px; margin-bottom: 25px; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Tickets Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for your purchase! Your tickets for <strong>${purchaseDetails.eventName}</strong> are now confirmed and ready.</p>
          
          <div class="purchase-summary">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; color: #666;">Transaction ID:</td><td style="padding: 5px 0; font-weight: bold;">${purchaseDetails.transactionId}</td></tr>
              <tr><td style="padding: 5px 0; color: #666;">Quantity:</td><td style="padding: 5px 0; font-weight: bold;">${purchaseDetails.quantity} Tickets</td></tr>
              <tr><td style="padding: 5px 0; color: #666;">Total Amount:</td><td style="padding: 5px 0; font-weight: bold;">NPR ${purchaseDetails.totalAmount}</td></tr>
              <tr><td style="padding: 5px 0; color: #666;">Date:</td><td style="padding: 5px 0; font-weight: bold;">${purchaseDetails.purchaseDate}</td></tr>
            </table>
          </div>

          <h3 style="text-align: center; margin-top: 30px; color: #1976D2;">Your Digital Tickets</h3>
          <p style="text-align: center; font-size: 14px; color: #666;">Please have these QR codes ready at the venue.</p>
          
          ${ticketCardsHtml}

          <div style="margin-top: 30px; padding: 20px; background-color: #fff9c4; border-left: 4px solid #fbc02d; font-size: 14px;">
            <strong>Pro Tip:</strong> You can also access these tickets anytime from your dashboard on our website.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
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
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f9; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; letter-spacing: 1px; font-weight: bold; }
        .content { padding: 40px; text-align: center; }
        .content h2 { color: #2d3436; margin-top: 0; }
        .otp-container { background-color: #fff4ed; border: 2px dashed #ff6b00; border-radius: 12px; padding: 25px; margin: 30px 0; display: inline-block; }
        .otp-code { font-size: 48px; font-weight: 800; color: #ff6b00; letter-spacing: 10px; margin-left: 10px; font-family: 'Courier New', Courier, monospace; }
        .footer { text-align: center; padding: 25px; font-size: 13px; color: #888; background-color: #fafbfc; border-top: 1px solid #f1f3f5; }
        .note { color: #636e72; font-size: 14px; margin-top: 25px; line-height: 1.5; }
        .divider { height: 1px; background-color: #eee; margin: 25px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>TicketGate</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Hi ${name},</p>
            <p>Welcome to TicketGate! Please use the following 6-digit code to complete your registration.</p>
            
            <div class="otp-container">
              <span class="otp-code">${otp}</span>
            </div>
            
            <p class="note"><strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.</p>
            <div class="divider"></div>
            <p>Happy ticketing!<br><strong>The TicketGate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
            <p>Secure ticketing for your favorite events.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // BCC the admin so they can assist if delivery fails
  return sendEmail(email, subject, html, null, config.EMAIL_FROM);
};

/**
 * Send 2FA login OTP
 */
const send2FAOTPEmail = async (email, name, otp) => {
  const subject = `${otp} is your TicketGate login verification code`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f9; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; letter-spacing: 1px; font-weight: bold; }
        .content { padding: 40px; text-align: center; }
        .content h2 { color: #2d3436; margin-top: 0; }
        .otp-container { background-color: #e3f2fd; border: 2px dashed #2196F3; border-radius: 12px; padding: 25px; margin: 30px 0; display: inline-block; }
        .otp-code { font-size: 48px; font-weight: 800; color: #1976D2; letter-spacing: 10px; margin-left: 10px; font-family: 'Courier New', Courier, monospace; }
        .footer { text-align: center; padding: 25px; font-size: 13px; color: #888; background-color: #fafbfc; border-top: 1px solid #f1f3f5; }
        .note { color: #636e72; font-size: 14px; margin-top: 25px; line-height: 1.5; }
        .divider { height: 1px; background-color: #eee; margin: 25px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>TicketGate</h1>
          </div>
          <div class="content">
            <h2>Two-Factor Authentication</h2>
            <p>Hi ${name},</p>
            <p>You are attempting to log in to your TicketGate account. Please use the following 6-digit code to complete your login.</p>
            
            <div class="otp-container">
              <span class="otp-code">${otp}</span>
            </div>
            
            <p class="note"><strong>Important:</strong> This code will expire in 10 minutes. If you didn't attempt to log in, please secure your account immediately.</p>
            <div class="divider"></div>
            <p>Happy ticketing!<br><strong>The TicketGate Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
            <p>Secure ticketing for your favorite events.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // BCC the admin so they can assist if delivery fails
  return sendEmail(email, subject, html, null, config.EMAIL_FROM);
};

/**
 * Send refund approved email
 */
const sendRefundApprovedEmail = async (email, name, amount, eventTitle, refundId) => {
  const subject = `Refund Approved - ${eventTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f9; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: bold; }
        .content { padding: 40px; text-align: center; }
        .amount-box { background-color: #e8f5e9; border: 2px dashed #4CAF50; border-radius: 12px; padding: 25px; margin: 30px 0; display: inline-block; }
        .amount { font-size: 32px; font-weight: 800; color: #2E7D32; }
        .refund-id { font-family: monospace; color: #666; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; padding: 25px; font-size: 13px; color: #888; background-color: #fafbfc; border-top: 1px solid #f1f3f5; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Refund Approved</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Good news! Your refund request for <strong>${eventTitle}</strong> has been approved.</p>
            
            <div class="amount-box">
              <div class="amount">NPR ${amount}</div>
              <div class="refund-id">Ref: ${refundId}</div>
            </div>
            
            <p>The amount will be credited back to your original payment method within 5-7 business days.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(email, subject, html);
};

/**
 * Send refund rejected email
 */
const sendRefundRejectedEmail = async (email, name, eventTitle, reason) => {
  const subject = `Update on your Refund Request - ${eventTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f9; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: bold; }
        .content { padding: 40px; text-align: center; }
        .reason-box { background-color: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 30px 0; text-align: left; }
        .footer { text-align: center; padding: 25px; font-size: 13px; color: #888; background-color: #fafbfc; border-top: 1px solid #f1f3f5; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Refund Request Update</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We have reviewed your refund request for <strong>${eventTitle}</strong>.</p>
            <p>After careful consideration, we are unable to approve your request at this time.</p>
            
            <div class="reason-box">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
            
            <p>If you have any questions or believe this decision was made in error, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TicketGate. All rights reserved.</p>
          </div>
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
  sendVerificationOTPEmail,
  send2FAOTPEmail,
  sendRefundApprovedEmail,
  sendRefundRejectedEmail
};













