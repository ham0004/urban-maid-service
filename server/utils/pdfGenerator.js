const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary (should already be configured, but ensure it's set)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate PDF Invoice and upload to Cloudinary
 * @author Member-2 (Module 3 - Service History & Invoice Generation)
 * @param {Object} invoiceData - Invoice details
 * @returns {Promise<string>} - Cloudinary URL of the PDF
 */
const generateInvoicePDF = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', async () => {
                const pdfBuffer = Buffer.concat(chunks);

                // Upload to Cloudinary
                // Using resource_type: 'image' with format: 'pdf' for better public access
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'urban-maid-service/invoices',
                        resource_type: 'image', // Changed from 'raw' to 'image' for better public access
                        format: 'pdf', // Specify PDF format
                        public_id: `invoice_${invoiceData.invoiceNumber}`,
                        // No need for access_mode with image resource type - it's public by default
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );

                streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
            });

            // ==========================================
            // PDF Content Generation
            // ==========================================

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).font('Helvetica').text('Urban Maid Service', { align: 'center' });
            doc.fontSize(10).text('Your trusted platform for household services', { align: 'center' });
            doc.moveDown(1);

            // Invoice Info Box
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 50);
            doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, 50);
            doc.text(`Status: PAID`, 50);
            doc.moveDown(1);

            // Divider
            doc.strokeColor('#cccccc').lineWidth(1)
                .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(1);

            // Customer Info
            doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
            doc.fontSize(10).font('Helvetica');
            doc.text(invoiceData.customerName);
            doc.text(invoiceData.customerEmail);
            if (invoiceData.customerAddress) {
                doc.text(invoiceData.customerAddress);
            }
            doc.moveDown(1);

            // Service Details
            doc.fontSize(12).font('Helvetica-Bold').text('Service Details:');
            doc.moveDown(0.5);

            // Table Header
            const tableTop = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Price', 370, tableTop);
            doc.text('Total', 450, tableTop);

            // Divider
            doc.strokeColor('#cccccc').lineWidth(0.5)
                .moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            doc.moveDown(0.5);

            // Items
            let y = doc.y + 5;
            doc.font('Helvetica');
            invoiceData.items.forEach((item) => {
                doc.text(item.description, 50, y);
                doc.text(item.quantity.toString(), 300, y);
                doc.text(`৳${item.unitPrice}`, 370, y);
                doc.text(`৳${item.total}`, 450, y);
                y += 20;
            });

            doc.y = y + 10;

            // Divider
            doc.strokeColor('#cccccc').lineWidth(0.5)
                .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Totals
            doc.fontSize(10).font('Helvetica');
            doc.text(`Subtotal:`, 370, doc.y);
            doc.text(`৳${invoiceData.amount}`, 450, doc.y - 12);
            doc.moveDown(0.3);

            if (invoiceData.tax > 0) {
                doc.text(`Tax:`, 370, doc.y);
                doc.text(`৳${invoiceData.tax}`, 450, doc.y - 12);
                doc.moveDown(0.3);
            }

            doc.fontSize(12).font('Helvetica-Bold');
            doc.text(`Total:`, 370, doc.y);
            doc.text(`৳${invoiceData.totalAmount}`, 450, doc.y - 14);
            doc.moveDown(2);

            // Footer
            doc.fontSize(10).font('Helvetica').fillColor('#666666');
            doc.text('Thank you for using Urban Maid Service!', { align: 'center' });
            doc.text('For support, contact: support@urbanmaid.com', { align: 'center' });

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
