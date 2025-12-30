const User = require('../models/User');

/**
 * Favorite Maids Controller
 * @description Handles favorite maid operations for customers
 */

/**
 * @desc    Add a maid to customer's favorites
 * @route   POST /api/favorites/:maidId
 * @access  Private (Customer only)
 */
exports.addFavorite = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { maidId } = req.params;

        // Verify user is a customer
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can favorite maids',
            });
        }

        // Verify maid exists and is actually a maid
        const maid = await User.findById(maidId);
        if (!maid) {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        if (maid.role !== 'maid') {
            return res.status(400).json({
                success: false,
                message: 'User is not a maid',
            });
        }

        // Get customer and check if already favorited
        const customer = await User.findById(customerId);
        if (customer.favoriteMaids.includes(maidId)) {
            return res.status(400).json({
                success: false,
                message: 'Maid is already in favorites',
            });
        }

        // Add to favorites
        customer.favoriteMaids.push(maidId);
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Maid added to favorites',
            data: {
                favoriteMaids: customer.favoriteMaids,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove a maid from customer's favorites
 * @route   DELETE /api/favorites/:maidId
 * @access  Private (Customer only)
 */
exports.removeFavorite = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { maidId } = req.params;

        // Verify user is a customer
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can manage favorites',
            });
        }

        // Get customer and remove from favorites
        const customer = await User.findById(customerId);
        const index = customer.favoriteMaids.indexOf(maidId);

        if (index === -1) {
            return res.status(400).json({
                success: false,
                message: 'Maid is not in favorites',
            });
        }

        customer.favoriteMaids.splice(index, 1);
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Maid removed from favorites',
            data: {
                favoriteMaids: customer.favoriteMaids,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all favorite maids for customer
 * @route   GET /api/favorites
 * @access  Private (Customer only)
 */
exports.getFavorites = async (req, res, next) => {
    try {
        const customerId = req.user.id;

        // Verify user is a customer
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can view favorites',
            });
        }

        // Get customer with populated favorite maids
        const customer = await User.findById(customerId).populate({
            path: 'favoriteMaids',
            select: 'name email phone maidProfile',
            match: { role: 'maid', isActive: true },
        });

        // Format the response to match maid search format
        const favoriteMaids = customer.favoriteMaids.map((maid) => ({
            id: maid._id,
            name: maid.name,
            email: maid.email,
            phone: maid.phone,
            rating: maid.maidProfile?.rating || 0,
            totalReviews: maid.maidProfile?.totalReviews || 0,
            hourlyRate: maid.maidProfile?.hourlyRate || 0,
            serviceTypes: maid.maidProfile?.serviceTypes || [],
            isAvailableToday: maid.maidProfile?.isAvailableToday || false,
            verificationStatus: maid.maidProfile?.verificationStatus || 'unverified',
        }));

        res.status(200).json({
            success: true,
            count: favoriteMaids.length,
            data: favoriteMaids,
        });
    } catch (error) {
        next(error);
    }
};
