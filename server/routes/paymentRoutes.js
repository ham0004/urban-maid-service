const express = require('express');
const {
    initiatePayment,
    confirmPayment,
    getPaymentByBooking
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/initiate', authorize('customer'), initiatePayment);
router.put('/:id/confirm', authorize('maid'), confirmPayment);
router.get('/booking/:bookingId', getPaymentByBooking);

module.exports = router;
