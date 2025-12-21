const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * @desc    Submit a review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
exports.createReview = async (req, res, next) => {
    try {
        console.log('📝 Review Submission Request');
        console.log('Body:', req.body);
        console.log('User ID:', req.user ? req.user.id : 'No User');

        const { bookingId, rating, review } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            console.error('❌ Booking not found:', bookingId);
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        console.log('Booking found:', booking._id);
        console.log('Booking Customer:', booking.customer.toString());
        console.log('Request User:', req.user.id);

        // Check if user is the customer of the booking
        if (booking.customer.toString() !== req.user.id) {
            console.error('❌ Authorization failed: User is not the customer');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking',
            });
        }

        // Check if booking is completed
        console.log('Booking Status:', booking.status);
        if (booking.status !== 'completed') {
            console.error('❌ Invalid status:', booking.status);
            return res.status(400).json({
                success: false,
                message: 'Review can only be submitted for completed services',
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            console.error('❌ Review already exists for booking:', bookingId);
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this service',
            });
        }

        const newReview = await Review.create({
            booking: bookingId,
            customer: req.user.id,
            maid: booking.maid,
            rating,
            review,
        });

        console.log('✅ Review created successfully:', newReview._id);

        res.status(201).json({
            success: true,
            data: newReview,
        });
    } catch (error) {
        console.error('🔥 Review Controller Error:', error);
        next(error);
    }
};

/**
 * @desc    Get reviews for a maid
 * @route   GET /api/reviews/maid/:maidId
 * @access  Public
 */
exports.getMaidReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ maid: req.params.maidId })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check if a booking has been reviewed
 * @route   GET /api/reviews/check/:bookingId
 * @access  Private
 */
exports.checkReviewStatus = async (req, res, next) => {
    try {
        const review = await Review.findOne({ booking: req.params.bookingId });
        res.status(200).json({
            success: true,
            hasReviewed: !!review
        });
    } catch (error) {
        next(error);
    }
}
