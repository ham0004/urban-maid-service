const Chat = require('../models/Chat');
const Booking = require('../models/Booking');

// Get chat for a specific booking
exports.getChatByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Verify booking exists and user is part of it
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is customer or maid of this booking
    if (
      booking.customer.toString() !== userId &&
      booking.maid.toString() !== userId
    ) {
      return res.status(403).json({
        message: 'Access denied. You are not part of this booking.'
      });
    }

    // Check booking status
    if (booking.status !== 'accepted' && booking.status !== 'completed') {
      return res.status(403).json({
        message: 'Chat only available for confirmed bookings'
      });
    }

    // Get chat
    const chat = await Chat.findOne({ bookingId })
      .populate('customerId', 'name email')
      .populate('maidId', 'name email');

    if (!chat) {
      return res.json({
        bookingId,
        messages: [],
        customerId: booking.customer,
        maidId: booking.maid
      });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'customer') {
      query.customerId = userId;
    } else if (userRole === 'maid') {
      query.maidId = userId;
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }

    const chats = await Chat.find(query)
      .populate('bookingId', 'serviceDate serviceTime status')
      .populate('customerId', 'name email')
      .populate('maidId', 'name email')
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      $or: [{ customerId: userId }, { maidId: userId }]
    });

    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.senderId.toString() !== userId && !msg.isRead) {
          unreadCount++;
        }
      });
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};