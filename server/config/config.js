require('dotenv').config();

module.exports = {
  // Server
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // SendGrid (Email Service)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'ilhamazahar07@gmail.com',

  // Frontend URL
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Stripe (Payment Gateway)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  // Firebase FCM (SMS Notifications)
  FIREBASE_SERVER_KEY: process.env.FIREBASE_SERVER_KEY,

  // Google Maps API
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,

  // Google Gemini API (AI Analytics)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};