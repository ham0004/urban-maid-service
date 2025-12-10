const User = require('../models/User');

/**
 * @desc    Update maid profile (Experience & Skills)
 * @route   PUT /api/maids/profile
 * @access  Private (Maid only)
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
