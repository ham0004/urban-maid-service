const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

// @desc    Initiate payment (Customer marks as paid)
// @route   POST /api/payments/initiate
// @access  Private (Customer)
exports.initiatePayment = async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Ensure user owns this booking
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ booking: bookingId });
        if (existingPayment) {
            return res.status(400).json({ success: false, message: 'Payment already initiated for this booking' });
        }

        const payment = await Payment.create({
            booking: bookingId,
            customer: req.user.id,
            maid: booking.maid,
            amount: amount || booking.totalPrice,
            status: 'pending',
            paymentMethod: 'manual',
        });

        res.status(201).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm payment (Maid confirms receipt)
// @route   PUT /api/payments/:id/confirm
// @access  Private (Maid)
exports.confirmPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Ensure current user is the maid for this payment
        if (payment.maid.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to confirm this payment' });
        }

        payment.status = 'succeeded';
        await payment.save();

        // Automatically generate invoice after successful payment confirmation
        try {
            // Check if invoice already exists
            const existingInvoice = await Invoice.findOne({ booking: payment.booking });

            if (!existingInvoice) {
                // Fetch booking details for invoice generation
                const booking = await Booking.findById(payment.booking)
                    .populate('customer', 'name email address')
                    .populate('serviceCategory', 'name icon');

                if (booking) {
                    // Generate invoice number
                    const invoiceNumber = await Invoice.generateInvoiceNumber();

                    // Create invoice record (no PDF generation - data stored in MongoDB)
                    await Invoice.create({
                        invoiceNumber,
                        user: booking.customer._id,
                        booking: booking._id,
                        invoiceType: 'booking',
                        amount: booking.totalPrice,
                        tax: 0,
                        totalAmount: booking.totalPrice,
                        items: [
                            {
                                description: `${booking.serviceCategory?.name || 'Service'} - ${booking.duration} mins`,
                                quantity: 1,
                                unitPrice: booking.totalPrice,
                                total: booking.totalPrice,
                            },
                        ],
                        paymentStatus: 'completed',
                        paymentMethod: payment.paymentMethod || 'Card',
                    });

                    console.log(`Invoice ${invoiceNumber} generated for booking ${booking._id}`);
                }
            }
        } catch (invoiceError) {
            // Log error but don't fail the payment confirmation
            console.error('Error generating invoice:', invoiceError);
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment status for a booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
exports.getPaymentByBooking = async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ booking: req.params.bookingId });

        if (!payment) {
            return res.status(200).json({
                success: true,
                data: null
            });
        }

        // Access control: only customer or maid of the booking/payment
        if (payment.customer.toString() !== req.user.id && payment.maid.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};
