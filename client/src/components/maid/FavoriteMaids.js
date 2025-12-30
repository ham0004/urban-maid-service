import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Favorite Maids Component
 * @description Display and manage customer's favorite maids
 */
const FavoriteMaids = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (maidId) => {
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/favorites/${maidId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove from local state
            setFavorites(favorites.filter((maid) => maid.id !== maidId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove favorite');
        }
    };

    const handleBookMaid = (maidId) => {
        navigate(`/bookings/new?maidId=${maidId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">⭐ My Favorite Maids</h1>
                        <p className="text-gray-600">Quick access to your preferred service providers</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/search-maids')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Find Maids
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Favorites Grid */}
                {favorites.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">💔</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorite Maids Yet</h3>
                        <p className="text-gray-600 mb-6">
                            Start adding maids to your favorites for quick access!
                        </p>
                        <button
                            onClick={() => navigate('/search-maids')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Find Maids
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((maid) => (
                            <div
                                key={maid.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{maid.name}</h3>
                                            <div className="flex items-center mt-1">
                                                <span className="text-yellow-500 mr-1">★</span>
                                                <span className="font-medium text-gray-700">
                                                    {maid.rating.toFixed(1)}
                                                </span>
                                                <span className="text-gray-500 text-sm ml-1">
                                                    ({maid.totalReviews} reviews)
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFavorite(maid.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Remove from favorites"
                                        >
                                            <svg
                                                className="w-6 h-6 fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-gray-600">
                                            <span className="font-medium mr-2">Rate:</span>
                                            <span>৳{maid.hourlyRate}/hr</span>
                                        </div>

                                        <div>
                                            <span className="block font-medium text-gray-600 mb-1">Services:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {maid.serviceTypes.map((service, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                                    >
                                                        {service}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {maid.isAvailableToday ? (
                                            <div className="flex items-center text-green-600 text-sm font-medium">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                Available Today
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                                Not Available Today
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleBookMaid(maid.id)}
                                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteMaids;
