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



module.exports = router;