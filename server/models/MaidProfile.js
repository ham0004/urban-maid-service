const mongoose = require('mongoose');

/**
 * @desc    Maid Profile Model
 * @author  Member-4 (Shakib Shadman Shoumik - 22101057)
 * @feature Module 2 Feature 4: Search & Filter Options
 */
const maidProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    skills: {
      type: String,
      trim: true,
    },
    serviceTypes: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailableToday: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MaidProfile', maidProfileSchema);