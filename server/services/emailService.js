const sgMail = require('@sendgrid/mail');
const config = require('../config/config');

// Set SendGrid API Key
sgMail.setApiKey(config.SENDGRID_API_KEY);

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Unique verification token
 */
const sendVerificationEmail = async (email, name, verificationToken, userId) => {
  const verificationUrl = `${config.CLIENT_URL}/verify-email/${userId}/${verificationToken}`;

  const msg = {
    to: email,
    from: config.SENDGRID_FROM_EMAIL,
    subject: 'Urban Maid Service - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Urban Maid Service</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}! 👋</h2>
            <p>Thank you for registering with Urban Maid Service. We're excited to have you on board!</p>
            <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            <p><strong>⏰ This link will expire in 24 hours.</strong></p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Urban Maid Service. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Urban Maid Service, ${name}!
      
      Please verify your email address by visiting this link:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create this account, you can safely ignore this email.
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${email}`);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('❌ SendGrid Error:', error);
    if (error.response) {
      console.error('SendGrid Response Error:', error.response.body);
    }
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`;

  const msg = {
    to: email,
    from: config.SENDGRID_FROM_EMAIL,
    subject: 'Urban Maid Service - Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #EF4444; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password for your Urban Maid Service account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #EF4444;">${resetUrl}</p>
            <p><strong>⏰ This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>© 2025 Urban Maid Service. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('❌ SendGrid Error:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};