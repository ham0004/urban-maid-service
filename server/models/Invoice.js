const mongoose = require('mongoose');

/**
 * Invoice Schema
 * @description Stores invoice data with PDF URL for downloadable invoices
 * @author Member-2 (Module 3 - Service History & Invoice Generation)
 */
const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        invoiceType: {
            type: String,
            enum: ['booking', 'subscription'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        pdfUrl: {
            type: String,
            required: false, // Optional - we store data in MongoDB instead
        },
        items: [
            {
                description: { type: String, required: true },
                quantity: { type: Number, default: 1 },
                unitPrice: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'completed',
        },
        paymentMethod: {
            type: String,
            default: 'Card',
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique invoice number
invoiceSchema.statics.generateInvoiceNumber = async function () {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Count invoices this month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0);

    const count = await this.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
};

// Index for faster queries
invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
