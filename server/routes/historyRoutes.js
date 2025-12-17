const express = require('express');
const router = express.Router();
const {
    getServiceHistory,
    getPaymentHistory,
    getInvoices,
    getInvoiceById,
    viewInvoice,
    generateInvoice,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

/**
 * History Routes
 * @author Member-2 (Module 3 - Service History & Invoice Generation)
 */

// All routes require authentication
router.use(protect);

// Service History
router.get('/services', getServiceHistory);

// Payment History
router.get('/payments', getPaymentHistory);

// Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.get('/invoices/:id/view', viewInvoice); // View invoice as HTML
router.post('/invoices/generate/:bookingId', generateInvoice);

module.exports = router;
