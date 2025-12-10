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
 * @desc    Login user and generate JWT token
 * @route   POST /api/auth/login
 * @access  Public
 * @author  Member-3
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists (including password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        userId: user._id,
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const { generateToken } = require('../utils/jwtUtils');
    const token = generateToken(user._id);

    // Build response object
    const responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified, // Email verification
    };

    // For maids, include maidProfile verification status
    if (user.role === 'maid') {
      responseUser.maidProfile = {
        verificationStatus: user.maidProfile?.verificationStatus || 'unverified',
        hasSubmittedDocuments: user.maidProfile?.documents?.length > 0 || false,
      };
    }

    // Return success response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: responseUser,
    });
  } catch (error) {
    next(error);
  }
};


// ========================================
// MEMBER-4 (Shakib Shadman Shoumik - 22101057)
// Module 1 Feature 4: Profile & Password Management
// ========================================

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 * @author  Member-4 (22101057)
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 * @author  Member-4 (22101057)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/auth/change-password
 * @access  Private
 * @author  Member-4 (22101057)
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password (will be hashed automatically by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify current password
 * @route   POST /api/auth/verify-password
 * @access  Private
 * @author  Member-4 (22101057)
 */
exports.verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isValid = await user.comparePassword(password);

    res.status(200).json({
      success: true,
      valid: isValid,
    });
  } catch (error) {
    next(error);
  }
};