const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getChatByBooking,
  getUserChats,
  getUnreadCount
} = require('../controllers/chatController');

// All routes are protected
router.use(protect);

// Get chat for specific booking
router.get('/booking/:bookingId', getChatByBooking);

// Get all chats for logged-in user
router.get('/user/chats', getUserChats);

// Get unread message count
router.get('/user/unread', getUnreadCount);

module.exports = router;