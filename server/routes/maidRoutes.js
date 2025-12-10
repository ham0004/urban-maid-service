const express = require('express');
const router = express.Router();
const { updateProfile, uploadDocuments } = require('../controllers/maidController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

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

module.exports = router;
