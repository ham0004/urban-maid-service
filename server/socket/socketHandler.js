const Chat = require('../models/Chat');
const Booking = require('../models/Booking');

// Store active socket connections
const activeUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // User joins with their userId
    socket.on('user:join', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Join a specific chat room (booking-based)
    socket.on('chat:join', async (bookingId) => {
      try {
        // Verify booking exists and user is part of it
        const booking = await Booking.findById(bookingId);

        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Check if booking is confirmed
        if (booking.status !== 'accepted' && booking.status !== 'completed') {
          socket.emit('error', {
            message: 'Chat only available for confirmed bookings'
          });
          return;
        }

        // Join the room
        socket.join(bookingId);
        console.log(`Socket ${socket.id} joined chat room ${bookingId}`);

        // Send existing messages
        const chat = await Chat.findOne({ bookingId })
          .populate('customerId', 'name email')
          .populate('maidId', 'name email');

        if (chat) {
          socket.emit('chat:history', chat.messages);
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle new message
    socket.on('chat:message', async (data) => {
      try {
        const { bookingId, message, senderId, senderRole } = data;

        // Validate message
        if (!message || !message.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Find or create chat
        let chat = await Chat.findOne({ bookingId });

        if (!chat) {
          const booking = await Booking.findById(bookingId);

          if (!booking) {
            socket.emit('error', { message: 'Booking not found' });
            return;
          }

          chat = new Chat({
            bookingId,
            customerId: booking.customer,
            maidId: booking.maid,
            messages: []
          });
        }

        // Add message
        const newMessage = {
          senderId,
          senderRole,
          message: message.trim(),
          timestamp: new Date(),
          isRead: false
        };

        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();
        await chat.save();

        // Emit to all users in the room
        io.to(bookingId).emit('chat:newMessage', newMessage);

        console.log(`Message sent in room ${bookingId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('chat:markRead', async (bookingId) => {
      try {
        const chat = await Chat.findOne({ bookingId });

        if (chat) {
          chat.messages.forEach(msg => {
            if (msg.senderId.toString() !== socket.userId) {
              msg.isRead = true;
            }
          });
          await chat.save();

          io.to(bookingId).emit('chat:messagesRead', bookingId);
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle typing indicator
    socket.on('chat:typing', (bookingId) => {
      socket.to(bookingId).emit('chat:userTyping', socket.userId);
    });

    socket.on('chat:stopTyping', (bookingId) => {
      socket.to(bookingId).emit('chat:userStopTyping', socket.userId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);
      }
      console.log('❌ User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;