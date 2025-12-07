const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 * @author  Member-1
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      verificationToken,
      verificationTokenExpire,
      isVerified: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Delete user if email fails
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify user email
 * @route   GET /api/auth/verify/:token
 * @access  Public
 * @author  Member-1
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. You can login now.',
      });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 * @author  Member-3 (TODO: Implement this)
 */
exports.loginUser = async (req, res, next) => {
  // TODO: Member-3 will implement this
  res.status(501).json({
    success: false,
    message: 'Login feature not yet implemented. Member-3 will complete this.',
  });
};