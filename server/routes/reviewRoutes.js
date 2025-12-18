const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createReview,
    getMaidReviews,
    checkReviewStatus,
} = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/maid/:maidId', getMaidReviews);
router.get('/check/:bookingId', protect, checkReviewStatus);

module.exports = router;
