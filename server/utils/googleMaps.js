const axios = require('axios');

/**
 * @desc    Google Maps Distance Matrix API Integration
 * @author  Member-4 (Shakib Shadman Shoumik - 22101057)
 * @feature Module 2 Feature 4: Search & Filter Options
 */

const calculateDistancesBatch = async (originLat, originLng, destinations) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !destinations || destinations.length === 0) {
    return destinations.map(() => null);
  }

  try {
    // Filter valid destinations
    const validDestinations = destinations.filter((dest) => dest.lat && dest.lng);

    if (validDestinations.length === 0) {
      return destinations.map(() => null);
    }

    // Build destinations string
    const destString = validDestinations.map((dest) => `${dest.lat},${dest.lng}`).join('|');

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = {
      origins: `${originLat},${originLng}`,
      destinations: destString,
      key: apiKey,
      units: 'metric',
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    const distances = [];

    if (data.status === 'OK') {
      data.rows[0].elements.forEach((element) => {
        if (element.status === 'OK') {
          const distanceKm = element.distance.value / 1000;
          distances.push(Math.round(distanceKm * 100) / 100);
        } else {
          distances.push(null);
        }
      });
    } else {
      return destinations.map(() => null);
    }

    // Map back to original destinations array
    let distanceIndex = 0;
    return destinations.map((dest) => {
      if (dest.lat && dest.lng) {
        return distances[distanceIndex++];
      }
      return null;
    });
  } catch (error) {
    console.error('Error calculating distances:', error.message);
    return destinations.map(() => null);
  }
};

module.exports = { calculateDistancesBatch };