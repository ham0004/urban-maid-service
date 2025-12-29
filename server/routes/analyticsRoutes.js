const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateAnalyticsReport,
  getReviewStats,
  getReviewsByDateRange
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(protect);

// Generate AI-powered analytics report (Admin only)
router.post('/generate-report', generateAnalyticsReport);

// Get basic review statistics (Admin only)
router.get('/stats', getReviewStats);

// Get reviews by date range (Admin only)
router.get('/reviews', getReviewsByDateRange);

module.exports = router;