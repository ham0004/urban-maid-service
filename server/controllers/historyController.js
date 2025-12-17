const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

/**
 * History Controller
 * @description Handles service history, payment records, and invoice management
 * @author Member-2 (Module 3 - Service History & Invoice Generation)
 */

/**
 * @desc    Get user's service history (past bookings)
 * @route   GET /api/history/services
 * @access  Private
 */
exports.getServiceHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'customer') {
            query.customer = userId;
        } else if (userRole === 'maid') {
            query.maid = userId;
        }

        // Only show completed or cancelled bookings (history)
        query.status = { $in: ['completed', 'cancelled'] };

        const services = await Booking.find(query)
            .populate('customer', 'name email phone')
            .populate('maid', 'name email phone')
            .populate('serviceCategory', 'name icon')
            .sort({ completedAt: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's payment history
 * @route   GET /api/history/payments
 * @access  Private
 */
exports.getPaymentHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get invoices as payment records
        const payments = await Invoice.find({ user: userId })
            .populate({
                path: 'booking',
                populate: [
                    { path: 'serviceCategory', select: 'name icon' },
                    { path: 'maid', select: 'name' },
                ],
            })
            .sort({ createdAt: -1 });

        const paymentRecords = payments.map((invoice) => ({
            transactionId: invoice.invoiceNumber,
            date: invoice.createdAt,
            amount: invoice.totalAmount,
            method: invoice.paymentMethod,
            status: invoice.paymentStatus,
            invoiceId: invoice._id,
            invoiceUrl: invoice.pdfUrl,
            service: invoice.booking?.serviceCategory?.name || 'Subscription',
        }));

        res.status(200).json({
            success: true,
            count: paymentRecords.length,
            data: paymentRecords,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's invoices
 * @route   GET /api/history/invoices
 * @access  Private
 */
exports.getInvoices = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const invoices = await Invoice.find({ user: userId })
            .populate({
                path: 'booking',
                populate: { path: 'serviceCategory', select: 'name icon' },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    View invoice as HTML
 * @route   GET /api/history/invoices/:id/view
 * @access  Private
 */
exports.viewInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('user', 'name email address')
            .populate({
                path: 'booking',
                populate: { path: 'serviceCategory', select: 'name' }
            })
            .populate({
                path: 'subscription',
                populate: { path: 'plan', select: 'name' }
            });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        // Verify ownership
        if (invoice.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this invoice',
            });
        }

        // Generate HTML invoice
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
        .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
        .header h1 { color: #4F46E5; font-size: 32px; margin-bottom: 10px; }
        .header p { color: #666; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { flex: 1; }
        .info-box h3 { color: #333; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
        .info-box p { color: #666; line-height: 1.6; }
        .invoice-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .invoice-details p { margin: 5px 0; color: #333; }
        .invoice-details strong { color: #4F46E5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        thead { background: #4F46E5; color: white; }
        th, td { padding: 12px; text-align: left; }
        th { font-weight: 600; }
        tbody tr { border-bottom: 1px solid #e5e7eb; }
        tbody tr:hover { background: #f9fafb; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-row { display: flex; justify-content: flex-end; margin: 10px 0; }
        .total-label { min-width: 150px; text-align: right; padding-right: 20px; color: #666; }
        .total-value { min-width: 120px; text-align: right; font-weight: 600; }
        .grand-total { font-size: 20px; color: #4F46E5; padding-top: 10px; border-top: 2px solid #e5e7eb; margin-top: 10px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-completed { background: #d1fae5; color: #065f46; }
        @media print { body { padding: 0; background: white; } .invoice { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <h1>🏠 INVOICE</h1>
            <p>Urban Maid Service</p>
            <p style="font-size: 12px; color: #999;">Your trusted platform for household services</p>
        </div>

        <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Status:</strong> <span class="status-badge status-completed">${invoice.paymentStatus.toUpperCase()}</span></p>
        </div>

        <div class="info-section">
            <div class="info-box">
                <h3>Bill To:</h3>
                <p><strong>${invoice.user.name}</strong></p>
                <p>${invoice.user.email}</p>
                ${invoice.user.address ? `<p>${invoice.user.address.street || ''}, ${invoice.user.address.city || ''}</p>` : ''}
            </div>
            <div class="info-box" style="text-align: right;">
                <h3>Payment Method:</h3>
                <p>${invoice.paymentMethod}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">৳${item.unitPrice.toFixed(2)}</td>
                    <td style="text-align: right;">৳${item.total.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <div class="total-label">Subtotal:</div>
                <div class="total-value">৳${invoice.amount.toFixed(2)}</div>
            </div>
            ${invoice.tax > 0 ? `
            <div class="total-row">
                <div class="total-label">Tax:</div>
                <div class="total-value">৳${invoice.tax.toFixed(2)}</div>
            </div>
            ` : ''}
            <div class="total-row grand-total">
                <div class="total-label">Total:</div>
                <div class="total-value">৳${invoice.totalAmount.toFixed(2)}</div>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for using Urban Maid Service!</p>
            <p style="font-size: 12px; margin-top: 10px;">For support, contact: support@urbanmaid.com</p>
        </div>
    </div>
</body>
</html>
        `;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate invoice for a completed booking
 * @route   POST /api/history/invoices/generate/:bookingId
 * @access  Private
 */
exports.generateInvoice = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('customer', 'name email address')
            .populate('serviceCategory', 'name icon');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ booking: booking._id });
        if (existingInvoice) {
            return res.status(200).json({
                success: true,
                message: 'Invoice already exists',
                data: existingInvoice,
            });
        }

        // Generate invoice number
        const invoiceNumber = await Invoice.generateInvoiceNumber();

        // Prepare invoice data for PDF
        const invoiceData = {
            invoiceNumber,
            date: new Date(),
            customerName: booking.customer.name,
            customerEmail: booking.customer.email,
            customerAddress: booking.address
                ? `${booking.address.street}, ${booking.address.city}`
                : '',
            items: [
                {
                    description: `${booking.serviceCategory?.name || 'Service'} - ${booking.duration} mins`,
                    quantity: 1,
                    unitPrice: booking.totalPrice,
                    total: booking.totalPrice,
                },
            ],
            amount: booking.totalPrice,
            tax: 0,
            totalAmount: booking.totalPrice,
        };

        // Generate PDF and upload to Cloudinary
        const pdfUrl = await generateInvoicePDF(invoiceData);

        // Create invoice record
        const invoice = await Invoice.create({
            invoiceNumber,
            user: booking.customer._id,
            booking: booking._id,
            invoiceType: 'booking',
            amount: booking.totalPrice,
            tax: 0,
            totalAmount: booking.totalPrice,
            pdfUrl,
            items: invoiceData.items,
            paymentStatus: 'completed',
            paymentMethod: 'Card',
        });

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: invoice,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single invoice by ID
 * @route   GET /api/history/invoices/:id
 * @access  Private
 */
exports.getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate({
                path: 'booking',
                populate: [
                    { path: 'serviceCategory', select: 'name icon' },
                    { path: 'maid', select: 'name' },
                ],
            });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        // Verify ownership
        if (invoice.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this invoice',
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        next(error);
    }
};
