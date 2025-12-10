const mongoose = require('mongoose');

/**
 * Service Category Schema
 * @description Defines service categories with pricing structures for the Urban Maid Service
 * @author Member-1 (Module 2 - Service Category Management)
 */
const serviceCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true,
            maxlength: [100, 'Category name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        icon: {
            type: String,
            trim: true,
            default: '🧹',
        },
        pricing: [
            {
                name: {
                    type: String,
                    required: [true, 'Pricing tier name is required'],
                    trim: true,
                },
                price: {
                    type: Number,
                    required: [true, 'Price is required'],
                    min: [0, 'Price cannot be negative'],
                },
                duration: {
                    type: Number,
                    required: [true, 'Duration is required'],
                    min: [1, 'Duration must be at least 1 minute'],
                },
                description: {
                    type: String,
                    trim: true,
                },
            },
        ],
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

// Index for faster queries (isActive only, name is already indexed via unique: true)
serviceCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
