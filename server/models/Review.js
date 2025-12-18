const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Booking ID is required'],
        },
        maid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Maid ID is required'],
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Customer ID is required'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Please add a rating between 1 and 5'],
        },
        review: {
            type: String,
            required: [true, 'Please add a text review'],
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from submitting more than one review per booking
reviewSchema.index({ booking: 1, customer: 1 }, { unique: true });

// Static method to calculate average rating and save to user
reviewSchema.statics.getAverageRating = async function (maidId) {
    const obj = await this.aggregate([
        {
            $match: { maid: maidId },
        },
        {
            $group: {
                _id: '$maid',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model('User').findByIdAndUpdate(maidId, {
            'maidProfile.rating': obj[0]?.averageRating || 0,
            'maidProfile.totalReviews': obj[0]?.totalReviews || 0,
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.maid);
});

// Call getAverageRating before remove (if we implement delete/update later)
// reviewSchema.pre('remove', function() {
//   this.constructor.getAverageRating(this.maid);
// });

module.exports = mongoose.model('Review', reviewSchema);
