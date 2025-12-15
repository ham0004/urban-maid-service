const express = require('express');
const router = express.Router();
const { 
    updateProfile, 
    uploadDocuments, 
    initializeMaidProfile, 
    searchMaids, 
    checkAvailability 
} = require('../controllers/maidController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// ========================================
// MEMBER-3 Routes
// ========================================

// @route   PUT /api/maids/profile
// @desc    Update maid profile
// @access  Private (Maid)
router.put('/profile', protect, updateProfile);

// @route   POST /api/maids/upload-documents
// @desc    Upload ID documents
// @access  Private (Maid)
router.post(
    '/upload-documents',
    protect,
    upload.array('documents', 5),
    uploadDocuments
);

// ========================================
// MEMBER-4 (Shakib Shadman Shoumik - 22101057)
// Module 2 Feature 4: Search & Filter Routes
// ========================================

// @route   POST /api/maids/initialize
// @desc    Initialize maid profile for search
// @access  Private (Maid)
// @author  Member-4 (22101057)
router.post('/initialize', protect, initializeMaidProfile);

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