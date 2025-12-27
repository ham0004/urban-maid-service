import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReviewStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/analytics/stats`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(err.response?.data?.message || 'Failed to load statistics');
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    if (!stats) return null;

    // Prepare data for charts
    const ratingData = stats.ratingDistribution.map(item => ({
        rating: `${item._id} ⭐`,
        count: item.count,
    }));

    const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Reviews</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {stats.totalReviews}
                            </p>
                        </div>
                        <div className="text-4xl">📝</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Average Rating</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {stats.averageRating.toFixed(1)} ⭐
                            </p>
                        </div>
                        <div className="text-4xl">⭐</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Recent Reviews</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {stats.recentReviews.length}
                            </p>
                        </div>
                        <div className="text-4xl">🆕</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rating Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Rating Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rating" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Rating Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Rating Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={ratingData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ rating, count }) => `${rating}: ${count}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {ratingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recent Reviews
                </h3>
                <div className="space-y-4">
                    {stats.recentReviews.slice(0, 5).map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {review.customer?.name || 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Maid: {review.maid?.name || 'Unknown'}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-yellow-500">{'⭐'.repeat(review.rating || 0)}</span>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm">{review.review}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewStats;
