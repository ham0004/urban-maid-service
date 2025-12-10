const ServiceCategory = require('../models/ServiceCategory');

/**
 * @desc    Create a new service category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 * @author  Member-1 (Module 2)
 */
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, icon, pricing } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a category name',
            });
        }

        if (!pricing || pricing.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one pricing tier',
            });
        }

        const existingCategory = await ServiceCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'A category with this name already exists',
            });
        }

        const category = await ServiceCategory.create({
            name,
            description,
            icon,
            pricing,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Service category created successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all service categories
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
exports.getAllCategories = async (req, res, next) => {
    try {
        const { includeInactive, search } = req.query;
        let query = {};

        if (includeInactive !== 'true') {
            query.isActive = true;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const categories = await ServiceCategory.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single service category by ID
 * @route   GET /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await ServiceCategory.findById(req.params.id).populate('createdBy', 'name email');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Service category not found',
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update service category
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const { name, description, icon, pricing, isActive } = req.body;

        let category = await ServiceCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Service category not found',
            });
        }

        if (name && name !== category.name) {
            const existingCategory = await ServiceCategory.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'A category with this name already exists',
                });
            }
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (icon) category.icon = icon;
        if (pricing) category.pricing = pricing;
        if (typeof isActive === 'boolean') category.isActive = isActive;

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Service category updated successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete service category
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const { permanent } = req.query;
        const category = await ServiceCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Service category not found',
            });
        }

        if (permanent === 'true') {
            await ServiceCategory.findByIdAndDelete(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Service category permanently deleted',
            });
        } else {
            category.isActive = false;
            await category.save();
            res.status(200).json({
                success: true,
                message: 'Service category deactivated successfully',
                data: category,
            });
        }
    } catch (error) {
        next(error);
    }
};
