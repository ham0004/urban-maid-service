const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');

/**
 * Subscription Controller
 * @description Handles subscription plan management and user subscriptions
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */

// ==========================================
// ADMIN: Subscription Plan Management
// ==========================================

/**
 * @desc    Create a new subscription plan
 * @route   POST /api/subscriptions/plans
 * @access  Admin only
 */
exports.createPlan = async (req, res, next) => {
    try {
        const { name, description, planType, totalUnits, price, validityDays } = req.body;

        // Validation
        if (!name || !planType || !totalUnits || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, planType, totalUnits, and price',
            });
        }

        // Check if plan with same name exists
        const existingPlan = await SubscriptionPlan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({
                success: false,
                message: 'A plan with this name already exists',
            });
        }

        const plan = await SubscriptionPlan.create({
            name,
            description,
            planType,
            totalUnits,
            price,
            validityDays: validityDays || 30,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all subscription plans
 * @route   GET /api/subscriptions/plans
 * @access  Public
 */
exports.getPlans = async (req, res, next) => {
    try {
        const { includeInactive } = req.query;

        const query = includeInactive === 'true' ? {} : { isActive: true };
        const plans = await SubscriptionPlan.find(query).sort({ price: 1 });

        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single subscription plan
 * @route   GET /api/subscriptions/plans/:id
 * @access  Public
 */
exports.getPlanById = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found',
            });
        }

        res.status(200).json({
            success: true,
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update subscription plan
 * @route   PUT /api/subscriptions/plans/:id
 * @access  Admin only
 */
exports.updatePlan = async (req, res, next) => {
    try {
        const { name, description, planType, totalUnits, price, validityDays, isActive } = req.body;

        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found',
            });
        }

        // Update fields
        if (name) plan.name = name;
        if (description !== undefined) plan.description = description;
        if (planType) plan.planType = planType;
        if (totalUnits) plan.totalUnits = totalUnits;
        if (price) plan.price = price;
        if (validityDays) plan.validityDays = validityDays;
        if (isActive !== undefined) plan.isActive = isActive;

        await plan.save();

        res.status(200).json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete subscription plan (soft delete - deactivate)
 * @route   DELETE /api/subscriptions/plans/:id
 * @access  Admin only
 */
exports.deletePlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found',
            });
        }

        // Soft delete - just deactivate
        plan.isActive = false;
        await plan.save();

        res.status(200).json({
            success: true,
            message: 'Subscription plan deactivated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// CUSTOMER: Subscription Management
// ==========================================

/**
 * @desc    Subscribe to a plan
 * @route   POST /api/subscriptions/subscribe/:planId
 * @access  Customer only
 */
exports.subscribeToPlan = async (req, res, next) => {
    try {
        const { planId } = req.params;

        // Check if plan exists and is active
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found or inactive',
            });
        }

        // Check if customer already has an active subscription
        const existingSubscription = await UserSubscription.findOne({
            customer: req.user.id,
            status: 'active',
            endDate: { $gt: new Date() },
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active subscription. Please wait for it to expire or cancel it first.',
                currentSubscription: existingSubscription,
            });
        }

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        // Create subscription
        const subscription = await UserSubscription.create({
            customer: req.user.id,
            plan: planId,
            remainingUnits: plan.totalUnits,
            startDate,
            endDate,
            status: 'active',
            paymentStatus: 'paid', // In real scenario, this would be set after Stripe payment
        });

        // Populate plan details
        await subscription.populate('plan');

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to plan!',
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get customer's active subscription
 * @route   GET /api/subscriptions/my
 * @access  Customer only
 */
exports.getMySubscription = async (req, res, next) => {
    try {
        const subscription = await UserSubscription.findOne({
            customer: req.user.id,
            status: { $in: ['active', 'exhausted'] },
        })
            .populate('plan')
            .sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(200).json({
                success: true,
                hasSubscription: false,
                message: 'No active subscription found',
                data: null,
            });
        }

        // Check if expired
        if (subscription.status === 'active' && new Date() > subscription.endDate) {
            subscription.status = 'expired';
            await subscription.save();
        }

        res.status(200).json({
            success: true,
            hasSubscription: subscription.status === 'active',
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get customer's subscription history
 * @route   GET /api/subscriptions/history
 * @access  Customer only
 */
exports.getSubscriptionHistory = async (req, res, next) => {
    try {
        const subscriptions = await UserSubscription.find({
            customer: req.user.id,
        })
            .populate('plan')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/subscriptions/cancel
 * @access  Customer only
 */
exports.cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await UserSubscription.findOne({
            customer: req.user.id,
            status: 'active',
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found to cancel',
            });
        }

        subscription.status = 'cancelled';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check and get customer's valid subscription (used by booking system)
 * @route   GET /api/subscriptions/check
 * @access  Customer only
 */
exports.checkSubscription = async (req, res, next) => {
    try {
        const subscription = await UserSubscription.findOne({
            customer: req.user.id,
            status: 'active',
            paymentStatus: 'paid',
            remainingUnits: { $gt: 0 },
            endDate: { $gt: new Date() },
        }).populate('plan');

        if (!subscription) {
            return res.status(200).json({
                success: true,
                hasValidSubscription: false,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            hasValidSubscription: true,
            data: {
                subscriptionId: subscription._id,
                planName: subscription.plan.name,
                planType: subscription.plan.planType,
                remainingUnits: subscription.remainingUnits,
                expiresAt: subscription.endDate,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Deduct units from subscription (called when booking is completed)
 * @param   {ObjectId} customerId - Customer's user ID
 * @param   {ObjectId} bookingId - Booking ID
 * @param   {Number} units - Units to deduct (1 for work-based, duration for hour-based)
 * @returns {Object} Updated subscription or null
 */
exports.deductFromSubscription = async (customerId, bookingId, units = 1) => {
    try {
        const subscription = await UserSubscription.findOne({
            customer: customerId,
            status: 'active',
            paymentStatus: 'paid',
            remainingUnits: { $gte: units },
            endDate: { $gt: new Date() },
        });

        if (!subscription) {
            return null;
        }

        await subscription.deductUnits(units, bookingId);
        return subscription;
    } catch (error) {
        console.error('Error deducting from subscription:', error);
        return null;
    }
};
