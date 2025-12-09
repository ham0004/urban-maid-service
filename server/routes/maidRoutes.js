const express = require('express');
const router = express.Router();
const { createMaidProfile, searchMaids, checkAvailability } = require('../controllers/maidController');

/**
 * @desc    Maid Routes
 * @author  Member-4 (Shakib Shadman Shoumik - 22101057)
 * @feature Module 2 Feature 4: Search & Filter Options
 */

// @route   POST /api/maids/create
// @desc    Create maid profile
// @access  Public (for testing)
// @author  Member-4 (22101057)
router.post('/create', createMaidProfile);

// @route   GET /api/maids/search
// @desc    Search and filter maids
// @access  Public
// @author  Member-4 (22101057)
router.get('/search', searchMaids);

// @route   GET /api/maids/:id/availability
// @desc    Check maid availability
// @access  Public
// @author  Member-4 (22101057)
router.get('/:id/availability', checkAvailability);

module.exports = router;