const User = require('../models/User');
const { calculateDistancesBatch } = require('../utils/googleMaps');

/**
 * @desc    Update maid profile (Experience & Skills)
 * @route   PUT /api/maids/profile
 * @access  Private (Maid only)
 * @author  Member-3
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { experience, skills } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize maidProfile if it doesn't exist
        if (!user.maidProfile) {
            user.maidProfile = {};
        }

        if (experience !== undefined) user.maidProfile.experience = experience;
        if (skills) user.maidProfile.skills = skills;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user.maidProfile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload maid ID documents
 * @route   POST /api/maids/upload-documents
 * @access  Private (Maid only)
 * @author  Member-3
 */
exports.uploadDocuments = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize maidProfile if it doesn't exist
        if (!user.maidProfile) {
            user.maidProfile = { documents: [] };
        }

        const newDocuments = req.files.map((file) => ({
            docType: req.body.docType || 'Other',
            url: file.path,
            status: 'pending',
        }));

        user.maidProfile.documents.push(...newDocuments);
        user.maidProfile.verificationStatus = 'pending';

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Documents uploaded successfully',
            data: user.maidProfile.documents,
        });
    } catch (error) {
        next(error);
    }
};

// ========================================
// MEMBER-4 (Shakib Shadman Shoumik - 22101057)
// Module 2 Feature 4: Search & Filter Options
// ========================================

/**
 * @desc    Initialize maid profile for search
 * @route   POST /api/maids/initialize
 * @access  Private (Maid only)
 * @author  Member-4 (22101057)
 */
exports.initializeMaidProfile = async (req, res, next) => {
    try {
        const { serviceTypes, hourlyRate } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Initialize maidProfile if it doesn't exist
        if (!user.maidProfile) {
            user.maidProfile = {};
        }

        // Set search fields
        if (serviceTypes) user.maidProfile.serviceTypes = serviceTypes;
        if (hourlyRate) user.maidProfile.hourlyRate = hourlyRate;
        user.maidProfile.rating = user.maidProfile.rating || 0.0;
        user.maidProfile.totalReviews = user.maidProfile.totalReviews || 0;
        user.maidProfile.isAvailableToday = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Maid profile initialized successfully',
            data: user.maidProfile,
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

        // Build query for maids
        let query = {
            role: 'maid',
            'maidProfile.verificationStatus': 'approved',
        };

        // Filter by service type
        if (serviceType) {
            query['maidProfile.serviceTypes'] = { $in: [serviceType] };
        }

        // Filter by rating
        if (rating) {
            query['maidProfile.rating'] = { $gte: parseFloat(rating) };
        }

        // Filter by availability
        if (availableToday === 'true') {
            query['maidProfile.isAvailableToday'] = true;
        }

        // Execute query
        let maids = await User.find(query).select('-password');

        // Format results
        let maidsData = maids.map((maid) => ({
            id: maid._id,
            name: maid.name,
            email: maid.email,
            phone: maid.phone,
            address: maid.address,
            latitude: maid.address?.coordinates?.latitude,
            longitude: maid.address?.coordinates?.longitude,
            experience: maid.maidProfile?.experience || 0,
            skills: maid.maidProfile?.skills || [],
            serviceTypes: maid.maidProfile?.serviceTypes || [],
            hourlyRate: maid.maidProfile?.hourlyRate || 0,
            rating: maid.maidProfile?.rating || 0,
            totalReviews: maid.maidProfile?.totalReviews || 0,
            isAvailableToday: maid.maidProfile?.isAvailableToday || false,
            verificationStatus: maid.maidProfile?.verificationStatus || 'unverified',
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
        const maid = await User.findById(req.params.id);

        if (!maid || maid.role !== 'maid') {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        res.status(200).json({
            success: true,
            maidId: maid._id,
            isAvailableToday: maid.maidProfile?.isAvailableToday || false,
        });
    } catch (error) {
        next(error);
    }
};