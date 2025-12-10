const express = require('express');
const router = express.Router();
const {
    setWeeklySchedule,
    getWeeklySchedule,
    blockSlot,
    unblockSlot,
    getBlockedSlots,
    getAvailableSlots,
} = require('../controllers/maidScheduleController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Maid Schedule Routes
 * @author Member-3 (Module 2 - Maid Scheduling & Availability)
 */

// Public route to check available slots for a maid
router.get('/available-slots/:maidId', getAvailableSlots);

// Protected routes (require authentication)
router.use(protect);

// @route   PUT /api/maids/schedule/weekly
// @desc    Set maid's weekly working hours
// @access  Private (Maid)
router.put('/weekly', setWeeklySchedule);

// @route   GET /api/maids/schedule/weekly
// @desc    Get maid's weekly schedule
// @access  Private (Maid)
router.get('/weekly', getWeeklySchedule);

// @route   POST /api/maids/schedule/block-slot
// @desc    Block a specific time slot
// @access  Private (Maid)
router.post('/block-slot', blockSlot);

// @route   GET /api/maids/schedule/blocked-slots
// @desc    Get all blocked slots
// @access  Private (Maid)
router.get('/blocked-slots', getBlockedSlots);

// @route   DELETE /api/maids/schedule/block-slot/:slotId
// @desc    Unblock a specific time slot
// @access  Private (Maid)
router.delete('/block-slot/:slotId', unblockSlot);

module.exports = router;
