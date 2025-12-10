const User = require('../models/User');
const Booking = require('../models/Booking');

/**
 * @desc    Set maid's weekly working hours
 * @route   PUT /api/maids/schedule/weekly
 * @access  Private (Maid only)
 * @author  Member-3 (Module 2 - Maid Scheduling & Availability)
 */
exports.setWeeklySchedule = async (req, res, next) => {
    try {
        const { weeklySchedule } = req.body;

        // Validate input
        if (!weeklySchedule || !Array.isArray(weeklySchedule) || weeklySchedule.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid weekly schedule',
            });
        }

        // Validate each day
        for (const day of weeklySchedule) {
            if (day.dayOfWeek < 0 || day.dayOfWeek > 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Day of week must be between 0 (Monday) and 6 (Sunday)',
                });
            }

            if (day.isAvailable && (!day.startTime || !day.endTime)) {
                return res.status(400).json({
                    success: false,
                    message: `Please provide start and end times for ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day.dayOfWeek]}`,
                });
            }

            // Validate time format (HH:MM)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (day.isAvailable) {
                if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Time must be in HH:MM format (24-hour)',
                    });
                }

                // Validate that start time is before end time
                const [startHour, startMin] = day.startTime.split(':').map(Number);
                const [endHour, endMin] = day.endTime.split(':').map(Number);
                const startInMinutes = startHour * 60 + startMin;
                const endInMinutes = endHour * 60 + endMin;

                if (startInMinutes >= endInMinutes) {
                    return res.status(400).json({
                        success: false,
                        message: 'End time must be after start time',
                    });
                }
            }
        }

        // Update user's weekly schedule
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                'maidProfile.weeklySchedule': weeklySchedule,
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Weekly schedule updated successfully',
            data: user.maidProfile.weeklySchedule,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get maid's weekly schedule
 * @route   GET /api/maids/schedule/weekly
 * @access  Private (Maid)
 * @author  Member-3 (Module 2 - Maid Scheduling & Availability)
 */
exports.getWeeklySchedule = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const weeklySchedule = user.maidProfile?.weeklySchedule || [];

        res.status(200).json({
            success: true,
            data: weeklySchedule,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Block a specific time slot for a maid
 * @route   POST /api/maids/schedule/block-slot
 * @access  Private (Maid only)
 * @author  Member-3 (Module 2 - Maid Scheduling & Availability)
 */
exports.blockSlot = async (req, res, next) => {
    try {
        const { date, reason, startTime, endTime } = req.body;

        // Validate required fields
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date',
            });
        }

        // Validate date
        const blockDate = new Date(date);
        blockDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (blockDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot block dates in the past',
            });
        }

        // Default to full day block if times not provided
        const blockStartTime = startTime || '00:00';
        const blockEndTime = endTime || '23:59';

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(blockStartTime) || !timeRegex.test(blockEndTime)) {
            return res.status(400).json({
                success: false,
                message: 'Time must be in HH:MM format (24-hour)',
            });
        }

        // Validate that start time is before end time
        const [startHour, startMin] = blockStartTime.split(':').map(Number);
        const [endHour, endMin] = blockEndTime.split(':').map(Number);
        const startInMinutes = startHour * 60 + startMin;
        const endInMinutes = endHour * 60 + endMin;

        if (startInMinutes >= endInMinutes) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time',
            });
        }

        // Check if slot is already blocked
        const user = await User.findById(req.user.id);
        const existingBlock = user.maidProfile.blockedSlots.find(
            (slot) => {
                const slotDate = new Date(slot.date);
                slotDate.setHours(0, 0, 0, 0);
                return slotDate.getTime() === blockDate.getTime() &&
                    slot.startTime === blockStartTime &&
                    slot.endTime === blockEndTime;
            }
        );

        if (existingBlock) {
            return res.status(400).json({
                success: false,
                message: 'This slot is already blocked',
            });
        }

        // Add blocked slot
        user.maidProfile.blockedSlots.push({
            date: blockDate,
            reason: reason || 'Unavailable',
            startTime: blockStartTime,
            endTime: blockEndTime,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Time slot blocked successfully',
            data: user.maidProfile.blockedSlots[user.maidProfile.blockedSlots.length - 1],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Unblock a specific time slot for a maid
 * @route   DELETE /api/maids/schedule/block-slot/:slotId
 * @access  Private (Maid only)
 * @author  Member-3 (Module 2 - Maid Scheduling & Availability)
 */
exports.unblockSlot = async (req, res, next) => {
    try {
        const { slotId } = req.params;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Find and remove the blocked slot
        const initialLength = user.maidProfile.blockedSlots.length;
        user.maidProfile.blockedSlots = user.maidProfile.blockedSlots.filter(
            (slot) => slot._id.toString() !== slotId
        );

        if (user.maidProfile.blockedSlots.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Blocked slot not found',
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Blocked slot removed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all blocked slots for a maid
 * @route   GET /api/maids/schedule/blocked-slots
 * @access  Private (Maid)
 * @author  Member-3 (Module 2 - Maid Scheduling & Availability)
 */
exports.getBlockedSlots = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const blockedSlots = user.maidProfile?.blockedSlots || [];

        res.status(200).json({
            success: true,
            count: blockedSlots.length,
            data: blockedSlots,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get available time slots for a maid on a specific date (considering schedule & blocked slots)
 * @route   GET /api/maids/schedule/available-slots/:maidId
 * @access  Public
 * @author  Member-3 (Module 2 - Maid Scheduling & Availability)
 * @note    This integrates with Member-2's conflict checking logic
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

        const maid = await User.findById(maidId);

        if (!maid || maid.role !== 'maid') {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        // Get the day of week (0 = Monday, 6 = Sunday)
        const queryDate = new Date(date);
        const dayOfWeek = (queryDate.getDay() + 6) % 7; // Convert JS date day (0=Sunday) to ISO (0=Monday)

        // Get maid's weekly schedule for this day
        const daySchedule = maid.maidProfile?.weeklySchedule?.find(
            (schedule) => schedule.dayOfWeek === dayOfWeek
        );

        // If maid is not available on this day, return empty slots
        if (!daySchedule || !daySchedule.isAvailable) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    availableSlots: [],
                    message: 'Maid is not available on this day',
                },
            });
        }

        // Check if the entire day is blocked
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        const endDateObj = new Date(date);
        endDateObj.setHours(23, 59, 59, 999);

        const blockedSlots = maid.maidProfile?.blockedSlots?.filter(
            (slot) => {
                const slotDate = new Date(slot.date);
                slotDate.setHours(0, 0, 0, 0);
                return slotDate.getTime() === dateObj.getTime();
            }
        ) || [];

        // Check if entire day is blocked
        const fullDayBlocked = blockedSlots.some(
            (slot) => slot.startTime === '00:00' && slot.endTime === '23:59'
        );

        if (fullDayBlocked) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    availableSlots: [],
                    message: 'Maid is unavailable on this date',
                },
            });
        }

        // Get existing bookings for this maid on this date (from Member-2)
        const existingBookings = await Booking.find({
            maid: maidId,
            scheduledDate: { $gte: dateObj, $lte: endDateObj },
            status: { $in: ['pending', 'accepted'] },
        }).select('scheduledTime duration');

        // Generate available slots based on maid's working hours
        const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

        const allSlots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }

        // Filter out booked slots
        const bookedSlots = existingBookings.map((b) => b.scheduledTime);

        // Filter out partially or fully blocked slots
        const filteredSlots = allSlots.filter((slot) => {
            if (bookedSlots.includes(slot)) return false;

            const [slotHour, slotMin] = slot.split(':').map(Number);
            const slotStartMinutes = slotHour * 60 + slotMin;
            const slotEndMinutes = slotStartMinutes + 60; // Assume 1-hour slot

            // Check if this slot overlaps with any blocked time
            for (const blocked of blockedSlots) {
                const [blockedStartHour, blockedStartMin] = blocked.startTime.split(':').map(Number);
                const [blockedEndHour, blockedEndMin] = blocked.endTime.split(':').map(Number);
                const blockedStartMinutes = blockedStartHour * 60 + blockedStartMin;
                const blockedEndMinutes = blockedEndHour * 60 + blockedEndMin;

                if (slotStartMinutes < blockedEndMinutes && slotEndMinutes > blockedStartMinutes) {
                    return false; // Slot overlaps with blocked time
                }
            }

            return true;
        });

        res.status(200).json({
            success: true,
            data: {
                date,
                maidSchedule: daySchedule,
                availableSlots: filteredSlots,
                bookedSlots,
                blockedSlots,
            },
        });
    } catch (error) {
        next(error);
    }
};
