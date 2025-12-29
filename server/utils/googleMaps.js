const axios = require('axios');

/**
 * @desc    Google Maps Distance Matrix API Integration
 * @author  Member-4 (Shakib Shadman Shoumik - 22101057)
 * @feature Module 2 Feature 4: Search & Filter Options
 * @fixed   Corrected index mapping for destinations
 */

const calculateDistancesBatch = async (originLat, originLng, destinations) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log('🔧 calculateDistancesBatch called');
  console.log('   Origin:', originLat, originLng);
  console.log('   Destinations count:', destinations.length);

  if (!apiKey) {
    console.error('❌ No API key provided');
    return destinations.map(() => null);
  }

  if (!destinations || destinations.length === 0) {
    console.log('⚠️  No destinations provided');
    return [];
  }

  try {
    // Filter valid destinations and keep track of their original indices
    const validDestinationsWithIndices = destinations
      .map((dest, index) => ({ dest, originalIndex: index }))
      .filter(({ dest }) => dest.lat && dest.lng);

    console.log(`✅ Valid destinations: ${validDestinationsWithIndices.length}/${destinations.length}`);

    if (validDestinationsWithIndices.length === 0) {
      console.log('⚠️  No valid destinations with coordinates');
      return destinations.map(() => null);
    }

    // Build destinations string for API
    const destString = validDestinationsWithIndices
      .map(({ dest }) => `${dest.lat},${dest.lng}`)
      .join('|');

    console.log('📍 Calling Distance Matrix API...');
    console.log('   Destinations string:', destString);

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = {
      origins: `${originLat},${originLng}`,
      destinations: destString,
      key: apiKey,
      units: 'metric',
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    console.log('📡 API Response status:', data.status);

    if (data.status !== 'OK') {
      console.error('❌ API returned non-OK status:', data.status);
      if (data.error_message) {
        console.error('   Error:', data.error_message);
      }
      return destinations.map(() => null);
    }

    // Extract distances from API response
    const apiDistances = [];
    data.rows[0].elements.forEach((element, idx) => {
      if (element.status === 'OK') {
        const distanceKm = element.distance.value / 1000;
        const rounded = Math.round(distanceKm * 100) / 100;
        apiDistances.push(rounded);
        console.log(`   Distance ${idx}: ${rounded} km`);
      } else {
        apiDistances.push(null);
        console.log(`   Distance ${idx}: null (status: ${element.status})`);
      }
    });

    // Map distances back to original array positions
    const result = destinations.map(() => null);
    validDestinationsWithIndices.forEach(({ originalIndex }, apiIndex) => {
      result[originalIndex] = apiDistances[apiIndex];
    });

    console.log('✅ Final mapped distances:', result);

    return result;
  } catch (error) {
    console.error('❌ Error calculating distances:', error.message);
    if (error.response?.data) {
      console.error('   API Error:', error.response.data);
    }
    return destinations.map(() => null);
  }
};

module.exports = { calculateDistancesBatch };