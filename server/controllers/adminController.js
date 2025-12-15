const User = require('../models/User');
const Booking = require('../models/Booking');
const ServiceCategory = require('../models/ServiceCategory');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');

/**
 * Admin Controller - Maid Approval & Dashboard Metrics
 * @author Member-1 (Module 3 - Admin Dashboard & Maid Approval)
 */

// ==========================================
// Dashboard Metrics
// ==========================================

/**
 * @desc    Get dashboard metrics/statistics
 * @route   GET /api/admin/metrics
 * @access  Admin only
 */
exports.getDashboardMetrics = async (req, res, next) => {
    try {
        const [
            totalCustomers,
            totalMaids,
            pendingVerifications,
            approvedMaids,
            totalBookings,
            pendingBookings,
            completedBookings,
            totalCategories,
            activeSubscriptions,
        ] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'maid' }),
            User.countDocuments({ role: 'maid', 'maidProfile.verificationStatus': 'pending' }),
            User.countDocuments({ role: 'maid', 'maidProfile.verificationStatus': 'approved' }),
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'completed' }),
            ServiceCategory.countDocuments({ isActive: true }),
            UserSubscription.countDocuments({ status: 'active' }),
        ]);

        // Get today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = await Booking.countDocuments({
            createdAt: { $gte: today },
        });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    totalCustomers,
                    totalMaids,
                    pendingVerifications,
                    approvedMaids,
                },
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    completed: completedBookings,
                    today: todayBookings,
                },
                services: {
                    totalCategories,
                    activeSubscriptions,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Maid Approval Management
// ==========================================

/**
 * @desc    Get all maids pending verification
 * @route   GET /api/admin/maids/pending
 * @access  Admin only
 */
exports.getPendingMaids = async (req, res, next) => {
    try {
        const pendingMaids = await User.find({
            role: 'maid',
            'maidProfile.verificationStatus': 'pending',
        })
            .select('name email phone maidProfile createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingMaids.length,
            data: pendingMaids,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all maids (with optional status filter)
 * @route   GET /api/admin/maids
 * @access  Admin only
 */
exports.getAllMaids = async (req, res, next) => {
    try {
        const { status } = req.query;

        const query = { role: 'maid' };
        if (status && ['pending', 'approved', 'rejected', 'unverified'].includes(status)) {
            query['maidProfile.verificationStatus'] = status;
        }

        const maids = await User.find(query)
            .select('name email phone maidProfile isActive createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: maids.length,
            data: maids,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single maid details with documents
 * @route   GET /api/admin/maids/:id
 * @access  Admin only
 */
exports.getMaidById = async (req, res, next) => {
    try {
        const maid = await User.findById(req.params.id).select('-password');

        if (!maid || maid.role !== 'maid') {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        res.status(200).json({
            success: true,
            data: maid,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approve maid verification
 * @route   PUT /api/admin/maids/:id/approve
 * @access  Admin only
 */
exports.approveMaid = async (req, res, next) => {
    try {
        const maid = await User.findById(req.params.id);

        if (!maid || maid.role !== 'maid') {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        if (maid.maidProfile.verificationStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Maid is already approved',
            });
        }

        // Update verification status
        maid.maidProfile.verificationStatus = 'approved';
        maid.isActive = true;

        // Update all documents status to approved
        if (maid.maidProfile.documents && maid.maidProfile.documents.length > 0) {
            maid.maidProfile.documents.forEach((doc) => {
                doc.status = 'approved';
            });
        }

        await maid.save();

        res.status(200).json({
            success: true,
            message: 'Maid approved successfully',
            data: {
                id: maid._id,
                name: maid.name,
                email: maid.email,
                verificationStatus: maid.maidProfile.verificationStatus,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reject maid verification
 * @route   PUT /api/admin/maids/:id/reject
 * @access  Admin only
 */
exports.rejectMaid = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const maid = await User.findById(req.params.id);

        if (!maid || maid.role !== 'maid') {
            return res.status(404).json({
                success: false,
                message: 'Maid not found',
            });
        }

        // Update verification status
        maid.maidProfile.verificationStatus = 'rejected';
        maid.maidProfile.rejectionReason = reason || 'Documents did not meet requirements';

        // Update all documents status to rejected
        if (maid.maidProfile.documents && maid.maidProfile.documents.length > 0) {
            maid.maidProfile.documents.forEach((doc) => {
                doc.status = 'rejected';
            });
        }

        await maid.save();

        res.status(200).json({
            success: true,
            message: 'Maid verification rejected',
            data: {
                id: maid._id,
                name: maid.name,
                email: maid.email,
                verificationStatus: maid.maidProfile.verificationStatus,
                rejectionReason: maid.maidProfile.rejectionReason,
            },
        });
    } catch (error) {
        next(error);
    }
};
