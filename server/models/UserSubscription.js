const mongoose = require('mongoose');

/**
 * User Subscription Schema
 * @description Tracks customer subscriptions to plans
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */
const userSubscriptionSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Customer is required'],
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
            required: [true, 'Subscription plan is required'],
        },
        remainingUnits: {
            type: Number,
            required: true,
            min: [0, 'Remaining units cannot be negative'],
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled', 'exhausted'],
            default: 'active',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        usageHistory: [
            {
                booking: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Booking',
                },
                unitsUsed: {
                    type: Number,
                    required: true,
                },
                usedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
userSubscriptionSchema.index({ customer: 1, status: 1 });
userSubscriptionSchema.index({ endDate: 1 });

/**
 * Check if subscription is valid (active and not expired)
 */
userSubscriptionSchema.methods.isValid = function () {
    return (
        this.status === 'active' &&
        this.paymentStatus === 'paid' &&
        this.remainingUnits > 0 &&
        new Date() <= this.endDate
    );
};

/**
 * Deduct units from subscription
 */
userSubscriptionSchema.methods.deductUnits = async function (units, bookingId) {
    if (this.remainingUnits < units) {
        throw new Error('Insufficient subscription balance');
    }

    this.remainingUnits -= units;
    this.usageHistory.push({
        booking: bookingId,
        unitsUsed: units,
        usedAt: new Date(),
    });

    if (this.remainingUnits === 0) {
        this.status = 'exhausted';
    }

    await this.save();
    return this;
};

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
