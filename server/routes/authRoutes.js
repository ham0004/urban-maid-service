const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
// @author  Member-1
router.post('/register', registerUser);

// @route   GET /api/auth/verify/:token
// @desc    Verify user email
// @access  Public
// @author  Member-1
router.get('/verify/:userId/:token', verifyEmail);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// @author  Member-3 (TODO: Implement in authController.js)
router.post('/login', loginUser);

// ========================================
// MEMBER-4 (Shakib Shadman Shoumik - 22101057)
// Module 1 Feature 4: Profile & Password Management Routes
// ========================================

const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  verifyPassword,
} = require('../controllers/authController');

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
// @author  Member-4 (22101057)
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
// @author  Member-4 (22101057)
router.put('/profile', protect, updateProfile);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
// @author  Member-4 (22101057)
router.post('/change-password', protect, changePassword);

// @route   POST /api/auth/verify-password
// @desc    Verify current password
// @access  Private
// @author  Member-4 (22101057)
router.post('/verify-password', protect, verifyPassword);


module.exports = router;