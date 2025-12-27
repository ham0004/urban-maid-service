import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import MaidPaymentConfirmation from '../payment/MaidPaymentConfirmation';

const MaidBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/bookings/maid', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data.data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, status, rejectionReason = '') => {
        setActionLoading(bookingId);
        try {
            const token = localStorage.getItem('token');
            await api.put(`/bookings/${bookingId}/status`, { status, rejectionReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b =>
                b._id === bookingId ? { ...b, status } : b
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (bookingId) => {
        const reason = prompt('Reason for rejection (optional):');
        await handleStatusUpdate(bookingId, 'rejected', reason || '');
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">🧹 My Job Requests</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">No booking requests yet.</p>
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
                                        <p className="text-gray-600">Customer: {booking.customer?.name}</p>
                                        <p className="text-gray-600">📞 {booking.customer?.phone || 'N/A'}</p>
                                        <p className="text-gray-600">
                                            📅 {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                        </p>
                                        <p className="text-gray-600">⏱ {booking.duration} mins</p>
                                        <p className="text-gray-600">📍 {booking.address?.street}, {booking.address?.city}</p>
                                        {booking.notes && <p className="text-gray-500 italic mt-2">"{booking.notes}"</p>}
                                    </div>
                                    <div className="text-right">
                                        <span className={getStatusBadge(booking.status)}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                        <p className="text-2xl font-bold text-green-600 mt-2">৳{booking.totalPrice}</p>

                                        {['accepted', 'completed'].includes(booking.status) && (
                                            <button
                                                onClick={() => navigate(`/chat/${booking._id}`)}
                                                className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center justify-end ml-auto"
                                            >
                                                <span className="mr-1">💬</span> Message Customer
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-4 border-t">

                                    {/* Payment Confirmation Component - Only visible to maid when needed */}
                                    <div className="mb-3">
                                        <MaidPaymentConfirmation bookingId={booking._id} />
                                    </div>

                                    <div className="flex gap-3">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                                                    disabled={actionLoading === booking._id}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    ✓ Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(booking._id)}
                                                    disabled={actionLoading === booking._id}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'accepted' && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                disabled={actionLoading === booking._id}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                ✓ Mark Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
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

export default MaidBookings;
