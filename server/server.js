const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const maidRoutes = require('./routes/maidRoutes');
const maidScheduleRoutes = require('./routes/maidScheduleRoutes'); // Module 2 - Maid Scheduling & Availability (Member-3)
const adminRoutes = require('./routes/adminRoutes'); // Module 2 - Admin Service Category Management
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // Module 2 - Booking & Conflict Handling
const subscriptionRoutes = require('./routes/subscriptionRoutes'); // Module 3 - Subscription & Membership Plans (Member-1)
const historyRoutes = require('./routes/historyRoutes'); // Module 3 - Service History & Invoice Generation (Member-2)
// TODO: Import other routes as team members complete them
// const profileRoutes = require('./routes/profileRoutes');
// const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Module 3 - Feature 7: In-app Chat Support (Member-4)
const analyticsRoutes = require('./routes/analyticsRoutes'); // Module 3 - Feature 8: AI-Powered Analytics (Member-4)

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
app.use('/api/maids', maidRoutes);
app.use('/api/maids/schedule', maidScheduleRoutes); // Module 2 - Maid Scheduling & Availability (Member-3)
app.use('/api/admin', adminRoutes); // Module 2 - Admin Service Category Management
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes); // Module 2 - Booking & Conflict Handling
app.use('/api/subscriptions', subscriptionRoutes); // Module 3 - Subscription & Membership Plans (Member-1)
app.use('/api/history', historyRoutes); // Module 3 - Service History & Invoice Generation (Member-2)
// TODO: Add other routes as team members complete them
// app.use('/api/profile', profileRoutes);
// app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes); // Module 3 - Feature 7: In-app Chat Support (Member-4)
app.use('/api/analytics', analyticsRoutes); // Module 3 - Feature 8: AI-Powered Analytics (Member-4)

// Serve uploads statically
app.use('/uploads', express.static('uploads'));

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
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: config.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handling
require('./socket/socketHandler')(io);

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running in ${config.NODE_ENV} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Socket.io enabled for real-time chat`);
  console.log(`🤖 AI Analytics powered by Google Gemini`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;