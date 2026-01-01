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
    confirmMaidPayment,
    getUnpaidBookings,
    resendPaymentNotification,
    checkCustomerSubscription,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Booking Routes
 * @author Member-2 (Module 2 - Real-time Booking & Conflict Handling)
 * @modified Member-1 (Added subscription payment routes)
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

// ========================================
// MEMBER-1: Subscription Payment Routes
// ========================================

// @route   GET /api/bookings/check-subscription
// @desc    Check customer's active subscription for booking form
// @access  Private (Customer)
router.get('/check-subscription', checkCustomerSubscription);

// @route   GET /api/bookings/admin/unpaid
// @desc    Get unpaid subscription bookings
// @access  Private (Admin)
router.get('/admin/unpaid', authorize('admin'), getUnpaidBookings);

// @route   POST /api/bookings/admin/resend-payment/:id
// @desc    Resend payment notification (Mock)
// @access  Private (Admin)
router.post('/admin/resend-payment/:id', authorize('admin'), resendPaymentNotification);

// @route   PUT /api/bookings/:id/confirm-payment
// @desc    Maid confirms payment received
// @access  Private (Maid)
router.put('/:id/confirm-payment', confirmMaidPayment);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Maid/Customer)
router.put('/:id/status', updateBookingStatus);

module.exports = router;
