// Script to add coordinates to maids for distance calculation testing
// Run this with: node addMaidCoordinates.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

// Sample Dhaka coordinates (different locations for testing)
//const dhakaLocations = [
 // { name: 'Gulshan', lat: 23.7808, lng: 90.4145 },
 // { name: 'Dhanmondi', lat: 23.7465, lng: 90.3763 },
 // { name: 'Mirpur', lat: 23.8223, lng: 90.3654 },
 // { name: 'Uttara', lat: 23.8759, lng: 90.3795 },
 // { name: 'Mohakhali', lat: 23.7808, lng: 90.4025 },
 // { name: 'Banani', lat: 23.7937, lng: 90.4066 },
 // { name: 'Bashundhara', lat: 23.8223, lng: 90.4254 },
 // { name: 'Kafrul', lat: 23.7858, lng: 90.3787 }
//];
const dhakaLocations = [
  { name: 'Gulshan-2', lat: 23.7925, lng: 90.4078 },           // xyz - Premium area
  { name: 'Banani', lat: 23.7937, lng: 90.4066 },              // Tamim - Close to Gulshan
  { name: 'Dhanmondi', lat: 23.7465, lng: 90.3763 },           // hey - Mid distance
  { name: 'Mohammadpur', lat: 23.7656, lng: 90.3563 },         // mike (Hasina gets this)
  { name: 'Mirpur-10', lat: 23.8069, lng: 90.3685 },           // asdr
  { name: 'Uttara Sector 7', lat: 23.8759, lng: 90.3795 },     // asd - Far north
  { name: 'Bashundhara R/A', lat: 23.8223, lng: 90.4254 },     // her - East
  { name: 'Kafrul', lat: 23.7858, lng: 90.3787 }               // maid - West
];
async function addCoordinates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all maids without coordinates
    const maids = await User.find({
      role: 'maid',
      'address.coordinates.latitude': { $exists: false }
    });

    console.log(`Found ${maids.length} maids without coordinates`);

    // Update each maid with random coordinates from Dhaka
    for (let i = 0; i < maids.length; i++) {
      const maid = maids[i];
      const location = dhakaLocations[i % dhakaLocations.length];

      // Initialize address if it doesn't exist
      if (!maid.address) {
        maid.address = {};
      }

      // Add coordinates
      maid.address.coordinates = {
        latitude: location.lat,
        longitude: location.lng
      };

      // Update city if not set
      if (!maid.address.city) {
        maid.address.city = 'Dhaka';
        maid.address.country = 'Bangladesh';
      }

      await maid.save();
      console.log(`✅ Updated ${maid.name} with ${location.name} coordinates`);
    }

    console.log('\n🎉 All maids updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCoordinates();