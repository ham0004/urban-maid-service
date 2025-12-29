const axios = require('axios');

/**
 * Convert address to coordinates using Google Geocoding API
 * Works for addresses anywhere in Bangladesh (or worldwide)
 * @param {Object} address - Address object with street, city, state, zipCode, country
 * @returns {Object} - { latitude, longitude } or null if failed
 */
async function geocodeAddress(address) {
  try {
    // Build address string
    const addressParts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean); // Remove empty values

    const addressString = addressParts.join(', ');

    if (!addressString) {
      console.log('No address provided for geocoding');
      return null;
    }

    console.log('🗺️  Geocoding address:', addressString);

    // Call Google Geocoding API
    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    
    const response = await axios.get(url, {
      params: {
        address: addressString,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      
      console.log('✅ Geocoding successful:', {
        latitude: location.lat,
        longitude: location.lng
      });

      return {
        latitude: location.lat,
        longitude: location.lng
      };
    } else {
      console.log('❌ Geocoding failed:', response.data.status);
      if (response.data.error_message) {
        console.log('Error message:', response.data.error_message);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error.response?.data || error.message);
    return null;
  }
}

module.exports = { geocodeAddress };