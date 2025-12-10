const mongoose = require('mongoose');

/**
 * Booking Schema
 * @description Manages service bookings between customers and maids
 * @author Member-2 (Module 2 - Real-time Booking & Conflict Handling)
 */
const bookingSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Customer is required'],
        },
        maid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Maid is required'],
        },
        serviceCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceCategory',
            required: [true, 'Service category is required'],
        },
        scheduledDate: {
            type: Date,
            required: [true, 'Scheduled date is required'],
        },
        scheduledTime: {
            type: String, // Format: "HH:MM" (24-hour)
            required: [true, 'Scheduled time is required'],
        },
        duration: {
            type: Number, // Duration in minutes
            required: [true, 'Duration is required'],
            min: [30, 'Minimum duration is 30 minutes'],
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
            default: 'pending',
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
            min: [0, 'Price cannot be negative'],
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: String,
            zipCode: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        rejectionReason: {
            type: String,
            maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ maid: 1, status: 1 });
bookingSchema.index({ maid: 1, scheduledDate: 1, scheduledTime: 1 });

/**
 * Check for booking conflicts
 * @param {ObjectId} maidId - Maid's user ID
 * @param {Date} date - Scheduled date
 * @param {String} time - Scheduled time (HH:MM)
 * @param {Number} duration - Duration in minutes
 * @param {ObjectId} excludeBookingId - Booking ID to exclude (for updates)
 * @returns {Boolean} - True if conflict exists
 */
bookingSchema.statics.checkConflict = async function (maidId, date, time, duration, excludeBookingId = null) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find existing bookings for this maid on this date
    const query = {
        maid: maidId,
        scheduledDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['pending', 'accepted'] }, // Only check active bookings
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const existingBookings = await this.find(query);

    // Convert times to minutes for comparison
    const [newHour, newMin] = time.split(':').map(Number);
    const newStart = newHour * 60 + newMin;
    const newEnd = newStart + duration;

    for (const booking of existingBookings) {
        const [existHour, existMin] = booking.scheduledTime.split(':').map(Number);
        const existStart = existHour * 60 + existMin;
        const existEnd = existStart + booking.duration;

        // Check overlap
        if (newStart < existEnd && newEnd > existStart) {
            return true; // Conflict found
        }
    }

    return false; // No conflict
};

module.exports = mongoose.model('Booking', bookingSchema);
