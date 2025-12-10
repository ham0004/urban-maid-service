const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getMaidBookings,
    updateBookingStatus,
    getAvailableSlots,
    getBookingById,
    getVerifiedMaids,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Booking Routes
 * @author Member-2 (Module 2 - Real-time Booking & Conflict Handling)
 */

// Public routes
router.get('/maids', getVerifiedMaids);
router.get('/availability/:maidId', getAvailableSlots);

// Protected routes
router.use(protect); // All routes below require authentication

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Customer)
router.post('/', createBooking);

// @route   GET /api/bookings/my
// @desc    Get customer's bookings
// @access  Private (Customer)
router.get('/my', getMyBookings);

// @route   GET /api/bookings/maid
// @desc    Get maid's bookings
// @access  Private (Maid)
router.get('/maid', getMaidBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Maid/Customer)
router.put('/:id/status', updateBookingStatus);

module.exports = router;
