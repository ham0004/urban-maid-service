const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const Booking = require('../models/Booking');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Utility Script: Regenerate Old Invoices with Public Access
 * 
 * This script regenerates all existing invoices that were created before
 * the Cloudinary public access fix. Old invoices have private URLs that
 * return 401/404 errors. This script will:
 * 1. Find all invoices
 * 2. Regenerate PDFs with public access
 * 3. Update invoice records with new public URLs
 * 
 * Usage: node regenerateInvoices.js
 */

const regenerateAllInvoices = async () => {
    try {
        console.log('🔄 Starting invoice regeneration...\n');

        // Find all invoices
        const invoices = await Invoice.find({})
            .populate('booking')
            .populate('subscription')
            .populate('user', 'name email address');

        console.log(`📊 Found ${invoices.length} invoices to regenerate\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const invoice of invoices) {
            try {
                console.log(`Processing invoice: ${invoice.invoiceNumber}...`);

                let invoiceData;

                if (invoice.invoiceType === 'booking' && invoice.booking) {
                    // Regenerate booking invoice
                    const booking = await Booking.findById(invoice.booking._id)
                        .populate('customer', 'name email address')
                        .populate('serviceCategory', 'name icon');

                    invoiceData = {
                        invoiceNumber: invoice.invoiceNumber,
                        date: invoice.createdAt,
                        customerName: booking.customer.name,
                        customerEmail: booking.customer.email,
                        customerAddress: booking.address
                            ? `${booking.address.street}, ${booking.address.city}`
                            : '',
                        items: invoice.items,
                        amount: invoice.amount,
                        tax: invoice.tax,
                        totalAmount: invoice.totalAmount,
                    };
                } else if (invoice.invoiceType === 'subscription' && invoice.subscription) {
                    // Regenerate subscription invoice
                    const subscription = await UserSubscription.findById(invoice.subscription._id)
                        .populate('plan');

                    invoiceData = {
                        invoiceNumber: invoice.invoiceNumber,
                        date: invoice.createdAt,
                        customerName: invoice.user.name,
                        customerEmail: invoice.user.email,
                        customerAddress: invoice.user.address
                            ? `${invoice.user.address.street || ''}, ${invoice.user.address.city || ''}`.trim()
                            : '',
                        items: invoice.items,
                        amount: invoice.amount,
                        tax: invoice.tax,
                        totalAmount: invoice.totalAmount,
                    };
                } else {
                    console.log(`⚠️  Skipping ${invoice.invoiceNumber} - missing related data`);
                    errorCount++;
                    continue;
                }

                // Generate new PDF with public access
                const newPdfUrl = await generateInvoicePDF(invoiceData);

                // Update invoice with new URL
                invoice.pdfUrl = newPdfUrl;
                await invoice.save();

                console.log(`✅ Successfully regenerated: ${invoice.invoiceNumber}`);
                successCount++;

            } catch (err) {
                console.error(`❌ Error regenerating ${invoice.invoiceNumber}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\n📈 Regeneration complete!`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📊 Total: ${invoices.length}`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        process.exit(0);
    }
};

// Connect to MongoDB and run
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ Connected to MongoDB\n');
        regenerateAllInvoices();
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
