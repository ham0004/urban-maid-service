import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import CustomerPaymentAction from '../payment/CustomerPaymentAction';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/bookings/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data.data);
            } catch (err) {
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
        } catch (err) {
            setError('Failed to cancel booking');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return `px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100'}`;
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
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">📋 My Bookings</h1>
                    <button
                        onClick={() => navigate('/bookings/new')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        + New Booking
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">No bookings yet. Book your first service!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {booking.serviceCategory?.icon} {booking.serviceCategory?.name}
                                        </h3>
                                        <p className="text-gray-600">Maid: {booking.maid?.name}</p>
                                        <p className="text-gray-600">
                                            📅 {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                        </p>
                                        <p className="text-gray-600">⏱ {booking.duration} mins</p>
                                        <p className="text-gray-600">📍 {booking.address?.street}, {booking.address?.city}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={getStatusBadge(booking.status)}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                        <p className="text-2xl font-bold text-indigo-600 mt-2">৳{booking.totalPrice}</p>
                                    </div>
                                </div>
                                {['pending', 'accepted'].includes(booking.status) && (
                                    <div className="mt-4 pt-4 border-t">
                                        {/* Payment Component */}
                                        <div className="mb-3">
                                            <CustomerPaymentAction bookingId={booking._id} />
                                        </div>

                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
