import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const SearchMaids = () => {
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        serviceType: '',
        rating: '',
        availableToday: false,
        sortBy: 'rating',
        customerLat: '',
        customerLng: ''
    });

    const fetchMaids = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters.serviceType) params.append('serviceType', filters.serviceType);
            if (filters.rating) params.append('rating', filters.rating);
            if (filters.availableToday) params.append('availableToday', 'true');
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.customerLat) params.append('customerLat', filters.customerLat);
            if (filters.customerLng) params.append('customerLng', filters.customerLng);

            const res = await api.get(`/maids/search?${params.toString()}`);

            if (res.data.success) {
                setMaids(res.data.maids);
            }
        } catch (err) {
            setError('Failed to fetch maids. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaids();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.sortBy, filters.availableToday]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMaids();
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFilters(prev => ({
                        ...prev,
                        customerLat: position.coords.latitude,
                        customerLng: position.coords.longitude
                    }));
                    // Auto trigger search when location is found? Maybe let user click search.
                },
                (error) => {
                    alert("Error getting location: " + error.message);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Maid</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
                            <form onSubmit={handleSearch} className="space-y-4">

                                {/* Service Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                    <select
                                        name="serviceType"
                                        value={filters.serviceType}
                                        onChange={handleFilterChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Services</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Cooking">Cooking</option>
                                        <option value="Laundry">Laundry</option>
                                        <option value="Babysitting">Babysitting</option>
                                        <option value="Elderly Care">Elderly Care</option>
                                    </select>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                                    <select
                                        name="rating"
                                        value={filters.rating}
                                        onChange={handleFilterChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Any Rating</option>
                                        <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                                        <option value="4.0">4.0+ ⭐⭐⭐⭐</option>
                                        <option value="3.0">3.0+ ⭐⭐⭐</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        name="sortBy"
                                        value={filters.sortBy}
                                        onChange={handleFilterChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="rating">Rating (High to Low)</option>
                                        <option value="price-low">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        <option value="distance">Distance (Nearest First)</option>
                                    </select>
                                </div>

                                {/* Availability Toggle */}
                                <div className="flex items-center">
                                    <input
                                        id="availableToday"
                                        name="availableToday"
                                        type="checkbox"
                                        checked={filters.availableToday}
                                        onChange={handleFilterChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="availableToday" className="ml-2 block text-sm text-gray-900">
                                        Available Today
                                    </label>
                                </div>

                                <hr className="my-4" />

                                {/* Location Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location (for Distance)</label>
                                    <button
                                        type="button"
                                        onClick={getUserLocation}
                                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-2"
                                    >
                                        📍 Use My Location
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            step="any"
                                            name="customerLat"
                                            placeholder="Lat"
                                            value={filters.customerLat}
                                            onChange={handleFilterChange}
                                            className="block w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            name="customerLng"
                                            placeholder="Lng"
                                            value={filters.customerLng}
                                            onChange={handleFilterChange}
                                            className="block w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Required for "Distance" sort</p>
                                </div>


                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
                                >
                                    Apply Filters
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="w-full lg:w-3/4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
                        ) : maids.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <p className="text-gray-500 text-lg">No maids found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {maids.map((maid) => (
                                    <div key={maid.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                                        <div className="h-32 bg-indigo-100 flex items-center justify-center">
                                            <span className="text-4xl">👩‍💼</span>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{maid.name}</h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    ★ {maid.rating}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-4 space-y-1">
                                                <p>💼 {maid.serviceTypes.join(', ')}</p>
                                                <p>💰 ${maid.hourlyRate}/hour</p>
                                                {maid.distance !== null && maid.distance !== undefined && (
                                                    <p className="text-indigo-600 font-medium">📏 {maid.distance} km away</p>
                                                )}
                                            </div>

                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                                    Book Now
                                                </button>
                                                <button className="flex-1 bg-white text-indigo-600 border border-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchMaids;
