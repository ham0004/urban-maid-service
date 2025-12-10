const Booking = require('../models/Booking');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer)
 * @author  Member-2 (Module 2 - Booking & Conflict Handling)
 */
exports.createBooking = async (req, res, next) => {
    try {
        const { maidId, serviceCategoryId, scheduledDate, scheduledTime, duration, address, notes } = req.body;

        // Validate required fields
        if (!maidId || !serviceCategoryId || !scheduledDate || !scheduledTime || !duration || !address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Check if maid exists and is verified
        const maid = await User.findById(maidId);
        if (!maid || maid.role !== 'maid') {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        if (maid.maidProfile?.verificationStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Maid is not verified',
            });
        }

        // Check if service category exists
        const serviceCategory = await ServiceCategory.findById(serviceCategoryId);
        if (!serviceCategory || !serviceCategory.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Service category not found',
            });
        }

        // Check for booking conflicts
        const hasConflict = await Booking.checkConflict(maidId, scheduledDate, scheduledTime, duration);
        if (hasConflict) {
            return res.status(409).json({
                success: false,
                message: 'This time slot is not available. Please choose a different time.',
            });
        }

        // Calculate price from service category pricing
        const pricing = serviceCategory.pricing.find(p => p.duration === duration);
        const totalPrice = pricing ? pricing.price : serviceCategory.pricing[0]?.price || 0;

        // Create booking
        const booking = await Booking.create({
            customer: req.user.id,
            maid: maidId,
            serviceCategory: serviceCategoryId,
            scheduledDate,
            scheduledTime,
            duration,
            totalPrice,
            address,
            notes,
            status: 'pending',
        });

        // Populate references for response
        await booking.populate([
            { path: 'maid', select: 'name email phone' },
            { path: 'serviceCategory', select: 'name icon' },
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get customer's bookings
 * @route   GET /api/bookings/my
 * @access  Private (Customer)
 */
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ customer: req.user.id })
            .populate('maid', 'name email phone')
            .populate('serviceCategory', 'name icon')
            .sort({ scheduledDate: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get maid's bookings
 * @route   GET /api/bookings/maid
 * @access  Private (Maid)
 */
exports.getMaidBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ maid: req.user.id })
            .populate('customer', 'name email phone')
            .populate('serviceCategory', 'name icon')
            .sort({ scheduledDate: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Maid for accept/reject/complete, Customer for cancel)
 */
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status, rejectionReason } = req.body;
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        const userId = req.user.id.toString();
        const isMaid = booking.maid.toString() === userId;
        const isCustomer = booking.customer.toString() === userId;

        // Validate status transitions
        const validTransitions = {
            pending: ['accepted', 'rejected', 'cancelled'],
            accepted: ['completed', 'cancelled'],
            rejected: [],
            completed: [],
            cancelled: [],
        };

        if (!validTransitions[booking.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${booking.status} to ${status}`,
            });
        }

        // Permission checks
        if (['accepted', 'rejected', 'completed'].includes(status) && !isMaid) {
            return res.status(403).json({
                success: false,
                message: 'Only the assigned maid can perform this action',
            });
        }

        if (status === 'cancelled' && !isCustomer && !isMaid) {
            return res.status(403).json({
                success: false,
                message: 'Only the customer or maid can cancel the booking',
            });
        }

        // Update booking
        booking.status = status;
        if (status === 'rejected' && rejectionReason) {
            booking.rejectionReason = rejectionReason;
        }
        if (status === 'completed') {
            booking.completedAt = new Date();
        }

        await booking.save();

        await booking.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'maid', select: 'name email phone' },
            { path: 'serviceCategory', select: 'name icon' },
        ]);

        res.status(200).json({
            success: true,
            message: `Booking ${status} successfully`,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get available time slots for a maid on a specific date
 * @route   GET /api/bookings/availability/:maidId
 * @access  Public
 */
exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { maidId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date',
            });
        }

        const queryDate = new Date(date);
        const startDate = new Date(queryDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setHours(23, 59, 59, 999);

        // Get existing bookings for this maid on this date
        const existingBookings = await Booking.find({
            maid: maidId,
            scheduledDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['pending', 'accepted'] },
        }).select('scheduledTime duration');

        // Generate all possible time slots (9 AM to 6 PM, 1-hour intervals)
        const allSlots = [];
        for (let hour = 9; hour < 18; hour++) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }

        // Filter out booked slots
        const bookedSlots = existingBookings.map(b => b.scheduledTime);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({
            success: true,
            data: {
                date: date,
                availableSlots,
                bookedSlots,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single booking details
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('maid', 'name email phone maidProfile')
            .populate('serviceCategory', 'name icon description pricing');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if user is authorized to view this booking
        const userId = req.user.id.toString();
        if (booking.customer._id.toString() !== userId && booking.maid._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking',
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all verified maids for booking
 * @route   GET /api/bookings/maids
 * @access  Public
 */
exports.getVerifiedMaids = async (req, res, next) => {
    try {
        const maids = await User.find({
            role: 'maid',
            'maidProfile.verificationStatus': 'approved',
            isActive: true,
        }).select('name email phone maidProfile.experience maidProfile.skills');

        res.status(200).json({
            success: true,
            count: maids.length,
            data: maids,
        });
    } catch (error) {
        next(error);
    }
};
