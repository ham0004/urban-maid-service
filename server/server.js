const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
// TODO: Import other routes as team members complete them
const maidRoutes = require('./routes/maidRoutes');
// const profileRoutes = require('./routes/profileRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');
// const serviceRoutes = require('./routes/serviceRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging (development only)
if (config.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
// TODO: Add other routes as team members complete them
app.use('/api/maids', maidRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/chat', chatRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running in ${config.NODE_ENV} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;