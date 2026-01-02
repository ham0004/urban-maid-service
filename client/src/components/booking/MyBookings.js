import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ReviewForm from '../review/ReviewForm';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [reviewBookingId, setReviewBookingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [reviewedBookings, setReviewedBookings] = useState([]);

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

    const handleConfirmPayment = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/bookings/${bookingId}/customer-confirm-payment`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(res.data.message || 'Payment confirmed! Invoice generated.');
            // Refresh bookings
            const updatedRes = await api.get('/bookings/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(updatedRes.data.data);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-blue-100 text-blue-800',
            work_completed: 'bg-purple-100 text-purple-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        const labels = {
            pending: 'Pending',
            accepted: 'Accepted',
            work_completed: 'Work Completed',
            rejected: 'Rejected',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return { className: `px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100'}`, label: labels[status] || status };
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
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        ✅ {success}
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
                                        <span className={getStatusBadge(booking.status).className}>
                                            {getStatusBadge(booking.status).label}
                                        </span>
                                        {booking.paymentStatus === 'awaiting_payment' && (
                                            <span className="block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                Payment Required
                                            </span>
                                        )}
                                        <p className="text-2xl font-bold text-indigo-600 mt-2">৳{booking.totalPrice}</p>

                                        {['accepted', 'work_completed', 'completed'].includes(booking.status) && (
                                            <button
                                                onClick={() => navigate(`/chat/${booking._id}`)}
                                                className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium flex items-center justify-end ml-auto"
                                            >
                                                <span className="mr-1">💬</span> Message Maid
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Required - Show Confirm Payment Button */}
                                {booking.paymentStatus === 'awaiting_payment' && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                                            <p className="text-orange-800 font-medium">💰 Maid has completed the work and is requesting payment</p>
                                            <p className="text-orange-600 text-sm mt-1">Please confirm payment to complete this booking.</p>
                                        </div>
                                        <button
                                            onClick={() => handleConfirmPayment(booking._id)}
                                            disabled={actionLoading === booking._id}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-semibold disabled:opacity-50"
                                        >
                                            {actionLoading === booking._id ? 'Processing...' : '✓ Confirm Payment & Complete'}
                                        </button>
                                    </div>
                                )}

                                {/* Cancel Button - Only for pending/accepted (non-completed) */}
                                {['pending', 'accepted'].includes(booking.status) && (
                                    <div className="mt-4 pt-4 border-t">
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                                {booking.status === 'completed' && (
                                    <div className="mt-4 pt-4 border-t">
                                        {reviewedBookings.includes(booking._id) ? (
                                            <div className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center">
                                                ✓ Review Submitted
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReviewBookingId(booking._id)}
                                                className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium"
                                            >
                                                ★ Rate & Review Service
                                            </button>
                                        )}
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
            {reviewBookingId && (
                <ReviewForm
                    bookingId={reviewBookingId}
                    onReviewSubmitted={() => {
                        // Add to reviewed bookings so button shows "Review Submitted"
                        setReviewedBookings(prev => [...prev, reviewBookingId]);
                        setReviewBookingId(null);
                        setSuccess('Thank you for your review!');
                        setTimeout(() => setSuccess(''), 4000);
                    }}
                    onClose={() => setReviewBookingId(null)}
                />
            )}
        </div>
    );
};

export default MyBookings;
