import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

/**
 * Maid Payment Confirmation Component
 * @description Shows payment confirmation for subscription bookings
 * @author Member-1 (Module 3 - Subscription Payment)
 */
const MaidPaymentConfirmation = ({ bookingId }) => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const res = await api.get(`/bookings/${bookingId}`);
            setBooking(res.data.data);
        } catch (err) {
            console.error("Failed to fetch booking details", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentConfirmation = async (isPaid) => {
        const confirmMsg = isPaid
            ? "Confirm that you have received the payment?"
            : "Report that you have NOT received payment? Admin will be notified.";

        if (!window.confirm(confirmMsg)) return;

        setActionLoading(true);
        try {
            const res = await api.put(`/bookings/${bookingId}/confirm-payment`, { isPaid });
            setMessage(res.data.message);
            fetchBookingDetails(); // Refresh booking data
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

    // Only show for subscription bookings that are completed
    if (!booking?.subscriptionPayment?.isSubscriptionBooking) {
        return null;
    }

    // Only show for completed bookings
    if (booking.status !== 'completed') {
        return null;
    }

    const { maidPaymentAmount, maidPaymentConfirmed, planType } = booking.subscriptionPayment;

    // Already confirmed
    if (maidPaymentConfirmed === true) {
        return (
            <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-medium flex items-center">
                <span className="mr-2">✅</span>
                Payment of ৳{maidPaymentAmount} confirmed
            </div>
        );
    }

    // Reported as not paid
    if (maidPaymentConfirmed === false) {
        return (
            <div className="mt-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                <span className="mr-2">⚠️</span>
                Admin notified about unpaid ৳{maidPaymentAmount}
            </div>
        );
    }

    // Pending confirmation
    return (
        <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="mb-3">
                <p className="text-blue-800 font-medium">
                    💰 Subscription Payment: ৳{maidPaymentAmount}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                    {planType === 'hours' ? '⏱️ Hour-based plan' : '📋 Work-based plan'}
                </p>
            </div>

            {message && (
                <div className="mb-3 text-sm text-green-700">{message}</div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => handlePaymentConfirmation(true)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                    {actionLoading ? 'Processing...' : '✓ Yes, I received payment'}
                </button>
                <button
                    onClick={() => handlePaymentConfirmation(false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm font-medium"
                >
                    ✕ Not paid
                </button>
            </div>
        </div>
    );
};

export default MaidPaymentConfirmation;
