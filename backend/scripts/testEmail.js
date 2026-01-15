const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || process.env.EMAIL_FROM,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ticketgate.com'
};

async function testEmail() {
  console.log('--- Email Configuration Test ---');
  console.log('Host:', config.EMAIL_HOST);
  console.log('Port:', config.EMAIL_PORT);
  console.log('User:', config.EMAIL_USER ? 'Configured' : 'MISSING');
  console.log('Pass:', config.EMAIL_PASS ? 'Configured' : 'MISSING');
  console.log('From:', config.EMAIL_FROM);
  console.log('-------------------------------\n');

  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    console.error('ERROR: Email user or password missing in .env file.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection successful!');

    const mailOptions = {
      from: `"TicketGate Test" <${config.EMAIL_FROM}>`,
      to: "susantmahat2@gmail.com", // Send to self
      subject: 'TicketGate Nodemailer Test',
      text: 'If you are reading this, your Nodemailer configuration for TicketGate is working correctly!',
      html: '<h1>Success!</h1><p>Your Nodemailer configuration for <b>TicketGate</b> is working correctly!</p>'
    };

    console.log(`Sending test email to ${config.EMAIL_USER}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox to verify receipt.');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
  }
}

testEmail();
