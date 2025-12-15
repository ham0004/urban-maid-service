const mongoose = require('mongoose');

/**
 * Subscription Plan Schema
 * @description Defines subscription/membership plans created by Admin
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */
const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a plan name'],
            unique: true,
            trim: true,
            maxlength: [100, 'Plan name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        planType: {
            type: String,
            enum: ['hours', 'works'],
            required: [true, 'Please specify plan type (hours or works)'],
        },
        totalUnits: {
            type: Number,
            required: [true, 'Please specify total units (hours or number of works)'],
            min: [1, 'Total units must be at least 1'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: [0, 'Price cannot be negative'],
        },
        validityDays: {
            type: Number,
            required: [true, 'Please specify validity period in days'],
            min: [1, 'Validity must be at least 1 day'],
            default: 30,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
subscriptionPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
