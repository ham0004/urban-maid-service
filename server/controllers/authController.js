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
      await sendVerificationEmail(user.email, user.name, verificationToken, user._id);
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
    const { userId, token } = req.params;

    console.log('🔍 Verifying token for user:', userId);

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link',
      });
    }

    // Find user by ID first
    const user = await User.findById(userId).select('+verificationToken +verificationTokenExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if ALREADY verified
    if (user.isVerified) {
      console.log('✅ Already verified:', user.email);
      return res.status(200).json({
        success: true,
        message: 'Email already verified. You can login now.',
      });
    }

    // Verify token
    if (user.verificationToken !== token) {
      console.log('❌ Invalid token for user:', user.email);
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token.',
      });
    }

    // Check expiry
    if (user.verificationTokenExpire < Date.now()) {
      console.log('⏰ Token expired');
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please register again.',
      });
    }

    // Verify the user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    console.log('✅ Email verified successfully:', user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
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


