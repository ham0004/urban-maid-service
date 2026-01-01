const axios = require('axios');

/**
 * Get coordinates for a city name
 * @param {string} city 
 * @returns {Object|null} { latitude, longitude }
 */
async function getCoordinates(city) {
    try {
        const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: {
                name: city,
                count: 1,
                language: 'en',
                format: 'json'
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const place = response.data.results[0];
            return {
                latitude: place.latitude,
                longitude: place.longitude,
                name: place.name,
                country: place.country
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

/**
 * Get weather forecast for a specific date and location
 * @param {number} lat 
 * @param {number} lon 
 * @param {string} date (YYYY-MM-DD)
 */
async function getWeatherForecast(lat, lon, date) {
    try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: lat,
                longitude: lon,
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                start_date: date,
                end_date: date,
                timezone: 'auto'
            }
        });

        if (response.data.daily && response.data.daily.time && response.data.daily.time.length > 0) {
            const daily = response.data.daily;
            return {
                date: daily.time[0],
                maxTemp: daily.temperature_2m_max[0],
                minTemp: daily.temperature_2m_min[0],
                precipitation: daily.precipitation_sum[0],
                weatherCode: daily.weather_code[0],
                condition: getWeatherCondition(daily.weather_code[0])
            };
        }
        return null;
    } catch (error) {
        console.error('Weather API error:', error.message);
        return null;
    }
}

/**
 * Helper to map WMO weather codes to human readable strings
 */
function getWeatherCondition(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return codes[code] || 'Unknown';
}

module.exports = { getCoordinates, getWeatherForecast };
