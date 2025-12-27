// Script to reset maid profile and remove test admin
// Run this with: node resetData.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-maid-service';

async function resetData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const userSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', userSchema);

        // 1. Reset Jen's profile
        const jen = await User.findOne({ email: 'jen@gmail.com' });
        if (jen) {
            console.log('Found Jen:', jen.email);

            // Reset maid profile fields
            if (jen.maidProfile) {
                jen.maidProfile.verificationStatus = 'unverified';
                jen.maidProfile.profileCompleted = false;
                jen.maidProfile.documents = [];
                // Keep other fields like skills/bio if you want, or clear them too
                // jen.maidProfile.experience = undefined;
                // jen.maidProfile.bio = undefined;
            }

            await jen.save();
            console.log('✅ Reset Jen\'s profile to UNVERIFIED. (She will need to upload docs now)');
        } else {
            console.log('ℹ️ Jen not found, skipping reset.');
        }

        // 2. Remove test admin (admin@test.com)
        // ONLY if it was the one I suggested. I won't delete YOUR admin.
        const testAdminEmail = 'admin@test.com';
        const result = await User.deleteOne({ email: testAdminEmail });

        if (result.deletedCount > 0) {
            console.log(`✅ Removed test admin user: ${testAdminEmail}`);
        } else {
            console.log(`ℹ️ Test admin user (${testAdminEmail}) not found. (No action needed)`);
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetData();
