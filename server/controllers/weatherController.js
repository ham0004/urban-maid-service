const { getCoordinates, getWeatherForecast } = require('../utils/weatherService');

/**
 * @desc    Get weather forecast for a city and date
 * @route   GET /api/weather/forecast
 * @access  Public
 */
exports.getForecast = async (req, res, next) => {
    try {
        const { city, date } = req.query;

        if (!city || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both city and date',
            });
        }

        // 1. Get Coordinates
        const location = await getCoordinates(city);
        if (!location) {
            return res.status(404).json({
                success: false,
                message: `Could not find coordinates for city: ${city}`,
            });
        }

        // 2. Get Weather
        const weather = await getWeatherForecast(location.latitude, location.longitude, date);
        if (!weather) {
            return res.status(404).json({
                success: false,
                message: 'Could not retrieve weather data',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                location,
                weather
            }
        });
    } catch (error) {
        next(error);
    }
};
