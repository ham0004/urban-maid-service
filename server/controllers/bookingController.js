const Booking = require('../models/Booking');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const UserSubscription = require('../models/UserSubscription');
const { deductFromSubscription } = require('./subscriptionController'); // Module 3 Feature 1

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer)
 * @author  Member-2 (Module 2 - Booking & Conflict Handling)
 * @modified Member-1 (Added subscription payment tracking)
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

        // Calculate price based on hourly rate (basePrice)
        const hoursBooked = duration / 60;
        const totalPrice = Math.round(serviceCategory.basePrice * hoursBooked);

        // ========================================
        // MEMBER-1: Check for active subscription
        // ========================================
        let subscriptionPaymentData = {
            isSubscriptionBooking: false,
            subscription: null,
            planType: null,
            unitsDeducted: 0,
            maidPaymentAmount: 0,
            maidPaymentConfirmed: null,
            adminNotified: false,
        };

        const activeSubscription = await UserSubscription.findOne({
            customer: req.user.id,
            status: 'active',
            paymentStatus: 'paid',
            remainingUnits: { $gt: 0 },
            endDate: { $gt: new Date() },
        }).populate('plan');

        if (activeSubscription && activeSubscription.plan) {
            const plan = activeSubscription.plan;
            const hoursBooked = Math.ceil(duration / 60);

            // Check if scheduled date is within subscription validity
            const bookingDate = new Date(scheduledDate);
            const subscriptionEndDate = new Date(activeSubscription.endDate);
            const isDateWithinValidity = bookingDate <= subscriptionEndDate;

            // Only apply subscription if date is within validity
            if (isDateWithinValidity) {
                // Calculate units to deduct
                let unitsToDeduct = 1; // Default for work-based
                if (plan.planType === 'hours') {
                    unitsToDeduct = hoursBooked;
                }

                // Check if subscription has enough balance
                if (activeSubscription.remainingUnits >= unitsToDeduct) {
                    // Calculate maid payment amount
                    const pricePerUnit = plan.price / plan.totalUnits;
                    const maidPayment = Math.round(pricePerUnit * unitsToDeduct);

                    subscriptionPaymentData = {
                        isSubscriptionBooking: true,
                        subscription: activeSubscription._id,
                        planType: plan.planType,
                        unitsDeducted: unitsToDeduct,
                        maidPaymentAmount: maidPayment,
                        maidPaymentConfirmed: null, // Will be confirmed by maid
                        adminNotified: false,
                    };
                }
            }
            // If date is beyond validity, subscriptionPaymentData stays as default (regular booking)
        }

        // Create booking
        const booking = await Booking.create({
            customer: req.user.id,
            maid: maidId,
            serviceCategory: serviceCategoryId,
            scheduledDate,
            scheduledTime,
            duration,
            totalPrice: subscriptionPaymentData.isSubscriptionBooking ? 0 : totalPrice, // ৳0 for subscription
            address,
            notes,
            status: 'pending',
            subscriptionPayment: subscriptionPaymentData,
        });

        // Populate references for response
        await booking.populate([
            { path: 'maid', select: 'name email phone' },
            { path: 'serviceCategory', select: 'name icon' },
        ]);

        res.status(201).json({
            success: true,
            message: subscriptionPaymentData.isSubscriptionBooking
                ? `Booking created using subscription! Maid will receive ৳${subscriptionPaymentData.maidPaymentAmount}`
                : 'Booking created successfully',
            data: booking,
            subscription: subscriptionPaymentData.isSubscriptionBooking ? {
                planType: subscriptionPaymentData.planType,
                unitsToDeduct: subscriptionPaymentData.unitsDeducted,
                maidPayment: subscriptionPaymentData.maidPaymentAmount,
                remainingAfter: activeSubscription.remainingUnits - subscriptionPaymentData.unitsDeducted,
            } : null,
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
            accepted: ['work_completed', 'cancelled'], // Maid marks work done
            work_completed: ['completed', 'cancelled'], // System completes after payment
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
        if (['accepted', 'rejected', 'work_completed'].includes(status) && !isMaid) {
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

        // When maid marks work as completed
        if (status === 'work_completed') {
            booking.completedAt = new Date();
            // For subscription bookings, auto-complete (no payment needed from customer)
            if (booking.subscriptionPayment?.isSubscriptionBooking) {
                booking.status = 'completed';
                booking.paymentStatus = 'subscription';
                try {
                    const unitsToDeduct = booking.subscriptionPayment.unitsDeducted || 1;
                    const subscription = await deductFromSubscription(booking.customer, booking._id, unitsToDeduct);
                    if (subscription) {
                        console.log(`✅ Deducted ${unitsToDeduct} ${booking.subscriptionPayment.planType} from subscription for customer ${booking.customer}`);
                    }
                } catch (subError) {
                    console.log('Subscription deduction error:', subError.message);
                }
            }
            // For regular bookings, wait for customer payment confirmation
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

// ========================================
// MEMBER-1: Subscription Payment Endpoints
// ========================================

/**
 * @desc    Maid confirms payment received for subscription booking
 * @route   PUT /api/bookings/:id/confirm-payment
 * @access  Private (Maid only)
 * @author  Member-1 (Module 3 - Subscription Payment)
 */
exports.confirmMaidPayment = async (req, res, next) => {
    try {
        const { isPaid } = req.body;
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Only maid can confirm
        if (booking.maid.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the assigned maid can confirm payment',
            });
        }

        // Only for subscription bookings
        if (!booking.subscriptionPayment?.isSubscriptionBooking) {
            return res.status(400).json({
                success: false,
                message: 'This is not a subscription booking',
            });
        }

        // Update payment confirmation
        booking.subscriptionPayment.maidPaymentConfirmed = isPaid;
        booking.subscriptionPayment.paymentConfirmedAt = new Date();

        if (!isPaid) {
            // Set dispute details
            booking.subscriptionPayment.adminNotified = true;
            booking.subscriptionPayment.disputeReportedAt = new Date();

            // Set 24-hour deadline
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + 24);
            booking.subscriptionPayment.disputeDeadline = deadline;

            console.log(`⚠️ ADMIN NOTIFICATION: Maid reported unpaid for booking ${bookingId}. Deadline: ${deadline}`);
        }

        await booking.save();

        await booking.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'maid', select: 'name email phone' },
            { path: 'serviceCategory', select: 'name icon' },
        ]);

        res.status(200).json({
            success: true,
            message: isPaid
                ? 'Payment confirmed. Thank you!'
                : 'Admin has been notified. Please visit our service center within 24 hours to resolve this issue.',
            data: booking,
            showServiceCenterNotice: !isPaid, // Flag for frontend to show the popup
            deadline: !isPaid ? booking.subscriptionPayment.disputeDeadline : null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get unpaid subscription bookings (Admin only)
 * @route   GET /api/bookings/admin/unpaid
 * @access  Private (Admin only)
 * @author  Member-1 (Module 3 - Subscription Payment)
 */
exports.getUnpaidBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            'subscriptionPayment.isSubscriptionBooking': true,
            'subscriptionPayment.maidPaymentConfirmed': false,
            'subscriptionPayment.adminNotified': true,
        })
            .populate('customer', 'name email phone')
            .populate('maid', 'name email phone')
            .populate('serviceCategory', 'name icon')
            .sort({ createdAt: -1 });

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
 * @desc    Maid acknowledges the 24-hour service center notice
 * @route   PUT /api/bookings/:id/acknowledge-dispute
 * @access  Private (Maid only)
 * @author  Member-1 (Module 3 - Payment Dispute)
 */
exports.acknowledgeMaidDispute = async (req, res, next) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Only maid can acknowledge
        if (booking.maid.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the assigned maid can acknowledge',
            });
        }

        // Set acknowledged
        booking.subscriptionPayment.maidAcknowledged = true;
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Thank you for acknowledging. Please visit our service center within 24 hours.',
            deadline: booking.subscriptionPayment.disputeDeadline,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resend payment notification (Admin only - Mock)
 * @route   POST /api/bookings/admin/resend-payment/:id
 * @access  Private (Admin only)
 * @author  Member-1 (Module 3 - Subscription Payment)
 */
exports.resendPaymentNotification = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('maid', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Mock: Just log the notification
        console.log('====================================');
        console.log('📧 PAYMENT REMINDER SENT (MOCK)');
        console.log(`To Customer: ${booking.customer.name} (${booking.customer.email})`);
        console.log(`For Maid: ${booking.maid.name}`);
        console.log(`Amount: ৳${booking.subscriptionPayment.maidPaymentAmount}`);
        console.log(`Booking ID: ${booking._id}`);
        console.log('====================================');

        res.status(200).json({
            success: true,
            message: `Payment reminder sent to ${booking.customer.email} (Mock)`,
            data: {
                customer: booking.customer.name,
                maid: booking.maid.name,
                amount: booking.subscriptionPayment.maidPaymentAmount,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check customer's active subscription for booking form
 * @route   GET /api/bookings/check-subscription
 * @access  Private (Customer)
 * @author  Member-1 (Module 3 - Subscription Payment)
 */
exports.checkCustomerSubscription = async (req, res, next) => {
    try {
        const subscription = await UserSubscription.findOne({
            customer: req.user.id,
            status: 'active',
            paymentStatus: 'paid',
            remainingUnits: { $gt: 0 },
            endDate: { $gt: new Date() },
        }).populate('plan');

        if (!subscription) {
            return res.status(200).json({
                success: true,
                hasSubscription: false,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            hasSubscription: true,
            data: {
                planName: subscription.plan.name,
                planType: subscription.plan.planType,
                remainingUnits: subscription.remainingUnits,
                totalUnits: subscription.plan.totalUnits,
                pricePerUnit: Math.round(subscription.plan.price / subscription.plan.totalUnits),
                endDate: subscription.endDate,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// REGULAR BOOKING PAYMENT ENDPOINTS
// ==========================================

/**
 * @desc    Maid requests payment from customer after work is done
 * @route   PUT /api/bookings/:id/request-payment
 * @access  Private (Maid)
 */
exports.requestPayment = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('maid', 'name email')
            .populate('serviceCategory', 'name');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Only maid can request payment
        if (booking.maid._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the assigned maid can request payment',
            });
        }

        // Can only request payment after work is completed
        if (booking.status !== 'work_completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only request payment after work is marked as completed',
            });
        }

        // Don't allow for subscription bookings
        if (booking.subscriptionPayment?.isSubscriptionBooking) {
            return res.status(400).json({
                success: false,
                message: 'Subscription bookings do not require payment request',
            });
        }

        // Update payment status
        booking.paymentStatus = 'awaiting_payment';
        booking.paymentRequestedAt = new Date();
        await booking.save();

        console.log(`💳 Maid ${booking.maid.name} requested payment from ${booking.customer.name} for ৳${booking.totalPrice}`);

        res.status(200).json({
            success: true,
            message: `Payment request sent to ${booking.customer.name}`,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Customer confirms payment and completes booking
 * @route   PUT /api/bookings/:id/confirm-payment
 * @access  Private (Customer)
 */
exports.confirmPayment = async (req, res, next) => {
    try {
        const Invoice = require('../models/Invoice');

        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('maid', 'name email')
            .populate('serviceCategory', 'name');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Only customer can confirm payment
        if (booking.customer._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the customer can confirm payment',
            });
        }

        // Can only confirm payment when awaiting
        if (booking.paymentStatus !== 'awaiting_payment') {
            return res.status(400).json({
                success: false,
                message: 'No payment pending for this booking',
            });
        }

        // Update booking status
        booking.paymentStatus = 'paid';
        booking.paymentConfirmedAt = new Date();
        booking.status = 'completed';
        await booking.save();

        // Generate invoice
        let invoice = null;
        try {
            const invoiceNumber = await Invoice.generateInvoiceNumber();
            invoice = await Invoice.create({
                invoiceNumber,
                user: booking.customer._id,
                booking: booking._id,
                invoiceType: 'booking',
                amount: booking.totalPrice,
                tax: 0,
                totalAmount: booking.totalPrice,
                items: [
                    {
                        description: `${booking.serviceCategory?.name || 'Service'} - ${booking.duration} minutes`,
                        quantity: 1,
                        unitPrice: booking.totalPrice,
                        total: booking.totalPrice,
                    },
                ],
                paymentStatus: 'completed',
                paymentMethod: 'Cash',
            });
            console.log(`✅ Invoice ${invoiceNumber} generated for booking ${booking._id}`);
        } catch (invoiceError) {
            console.error('Invoice generation error:', invoiceError);
        }

        console.log(`💰 Customer ${booking.customer.name} confirmed payment of ৳${booking.totalPrice}`);

        res.status(200).json({
            success: true,
            message: 'Payment confirmed! Booking completed.',
            data: {
                booking,
                invoice: invoice ? {
                    invoiceNumber: invoice.invoiceNumber,
                    amount: invoice.totalAmount,
                } : null,
            },
        });
    } catch (error) {
        next(error);
    }
};
