const User = require('../models/User');
const MaidProfile = require('../models/MaidProfile');
const { calculateDistancesBatch } = require('../utils/googleMaps');

/**
 * @desc    Maid Profile & Search Controller
 * @author  Member-4 (Shakib Shadman Shoumik - 22101057)
 * Module 2 Feature 4: Search & Filter Options
 */

/**
 * @desc    Create maid profile
 * @route   POST /api/maids/create
 * @access  Public (for testing)
 * @author  Member-4 (22101057)
 */
exports.createMaidProfile = async (req, res, next) => {
  try {
    const {
      userId,
      experienceYears,
      skills,
      serviceTypes,
      hourlyRate,
      rating,
      totalReviews,
      isVerified,
      isAvailableToday,
    } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if maid profile already exists
    const existingMaid = await MaidProfile.findOne({ user: userId });
    if (existingMaid) {
      return res.status(400).json({
        success: false,
        message: 'Maid profile already exists',
      });
    }

    // Create maid profile
    const maid = new MaidProfile({
      user: userId,
      experienceYears: experienceYears || 0,
      skills: skills || '',
      serviceTypes: serviceTypes || [],
      hourlyRate: hourlyRate || 0,
      rating: rating || 0.0,
      totalReviews: totalReviews || 0,
      isVerified: isVerified !== undefined ? isVerified : true,
      isAvailableToday: isAvailableToday !== undefined ? isAvailableToday : true,
    });

    await maid.save();

    res.status(201).json({
      success: true,
      message: 'Maid profile created successfully',
      maid: {
        id: maid._id,
        userId: maid.user,
        hourlyRate: maid.hourlyRate,
        rating: maid.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search and filter maids
 * @route   GET /api/maids/search
 * @access  Public
 * @author  Member-4 (22101057)
 */
exports.searchMaids = async (req, res, next) => {
  try {
    const { serviceType, rating, availableToday, sortBy = 'rating', customerLat, customerLng } = req.query;

    // Build query
    let query = { isVerified: true };

    // Filter by service type
    if (serviceType) {
      query.serviceTypes = { $in: [serviceType] };
    }

    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by availability
    if (availableToday === 'true') {
      query.isAvailableToday = true;
    }

    // Execute query and populate user data
    let maids = await MaidProfile.find(query).populate('user');

    // Format results
    let maidsData = maids.map((maid) => ({
      id: maid._id,
      userId: maid.user._id,
      name: maid.user.name,
      email: maid.user.email,
      phone: maid.user.phone,
      address: maid.user.address,
      latitude: maid.user.address?.coordinates?.latitude,
      longitude: maid.user.address?.coordinates?.longitude,
      experienceYears: maid.experienceYears,
      skills: maid.skills,
      serviceTypes: maid.serviceTypes,
      hourlyRate: maid.hourlyRate,
      rating: maid.rating,
      totalReviews: maid.totalReviews,
      isAvailableToday: maid.isAvailableToday,
      distance: null,
    }));

    // Calculate distances if customer location provided
    if (customerLat && customerLng) {
      const destinations = maidsData.map((maid) => ({
        lat: maid.latitude,
        lng: maid.longitude,
      }));

      const distances = await calculateDistancesBatch(
        parseFloat(customerLat),
        parseFloat(customerLng),
        destinations
      );

      maidsData = maidsData.map((maid, index) => ({
        ...maid,
        distance: distances[index],
      }));
    }

    // Sort results
    if (sortBy === 'distance' && customerLat && customerLng) {
      maidsData.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else if (sortBy === 'price-low') {
      maidsData.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'price-high') {
      maidsData.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else if (sortBy === 'rating') {
      maidsData.sort((a, b) => b.rating - a.rating);
    }

    res.status(200).json({
      success: true,
      total: maidsData.length,
      maids: maidsData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check maid availability
 * @route   GET /api/maids/:id/availability
 * @access  Public
 * @author  Member-4 (22101057)
 */
exports.checkAvailability = async (req, res, next) => {
  try {
    const maid = await MaidProfile.findById(req.params.id);

    if (!maid) {
      return res.status(404).json({
        success: false,
        message: 'Maid not found',
      });
    }

    res.status(200).json({
      success: true,
      maidId: maid._id,
      isAvailableToday: maid.isAvailableToday,
    });
  } catch (error) {
    next(error);
  }
};