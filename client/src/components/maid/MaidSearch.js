import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import MaidCard from './MaidCard';

const MaidSearch = () => {
    const navigate = useNavigate();
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        serviceType: '',
        rating: '',
        availableToday: false,
        sortBy: 'rating',
    });

    // Location state
    const [location, setLocation] = useState(null);

    const serviceTypes = [
        'Cleaning',
        'Cooking',
        'Laundry',
        'Child Care',
        'Elderly Care',
        'Pet Care'
    ];

    useEffect(() => {
        // Get user location for distance calculation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.error("Error getting location:", err);
                }
            );
        }
    }, []);

    const fetchMaids = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                ...filters,
                availableToday: filters.availableToday ? 'true' : 'false'
            };

            if (location) {
                params.customerLat = location.lat;
                params.customerLng = location.lng;
            }

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await api.get('/maids/search', { params });
            setMaids(response.data.maids);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch maids. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters, location]);

    useEffect(() => {
        fetchMaids();
    }, [fetchMaids]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBook = (maidId) => {
        navigate(`/bookings/new?maidId=${maidId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Find a Maid</h1>
                    <p className="mt-2 text-gray-600">Browse and filter verified maids for your needs</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">Filters</h2>

                            <div className="space-y-6">
                                {/* Service Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Type
                                    </label>
                                    <select
                                        name="serviceType"
                                        value={filters.serviceType}
                                        onChange={handleFilterChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Services</option>
                                        {serviceTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Rating
                                    </label>
                                    <select
                                        name="rating"
                                        value={filters.rating}
                                        onChange={handleFilterChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Any Rating</option>
                                        <option value="4.5">4.5+</option>
                                        <option value="4.0">4.0+</option>
                                        <option value="3.5">3.5+</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        name="sortBy"
                                        value={filters.sortBy}
                                        onChange={handleFilterChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="rating">Rating (High to Low)</option>
                                        <option value="price-low">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        {location && <option value="distance">Distance (Nearest)</option>}
                                    </select>
                                </div>

                                {/* Availability */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="availableToday"
                                        id="availableToday"
                                        checked={filters.availableToday}
                                        onChange={handleFilterChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="availableToday" className="ml-2 block text-sm text-gray-900">
                                        Available Today
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                <p className="mb-4 text-gray-600">{maids.length} maids found</p>
                                {maids.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 text-lg">No maids found matching your criteria.</p>
                                        <button
                                            onClick={() => setFilters({ serviceType: '', rating: '', availableToday: false, sortBy: 'rating' })}
                                            className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {maids.map(maid => (
                                            <MaidCard
                                                key={maid.id}
                                                maid={maid}
                                                onBook={handleBook}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaidSearch;
