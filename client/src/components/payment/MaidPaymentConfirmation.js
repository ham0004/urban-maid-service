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
    const [showServiceCenterModal, setShowServiceCenterModal] = useState(false);
    const [deadline, setDeadline] = useState(null);

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

            // Show service center modal if maid reported not paid
            if (res.data.showServiceCenterNotice) {
                setDeadline(res.data.deadline);
                setShowServiceCenterModal(true);
            } else {
                fetchBookingDetails(); // Refresh booking data
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcknowledgeDispute = async () => {
        setActionLoading(true);
        try {
            await api.put(`/bookings/${bookingId}/acknowledge-dispute`);
            setShowServiceCenterModal(false);
            fetchBookingDetails(); // Refresh booking data
        } catch (err) {
            console.error("Failed to acknowledge dispute", err);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDeadline = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-BD', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
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

    const { maidPaymentAmount, maidPaymentConfirmed, planType, maidAcknowledged, disputeDeadline } = booking.subscriptionPayment;

    // Already confirmed
    if (maidPaymentConfirmed === true) {
        return (
            <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-medium flex items-center">
                <span className="mr-2">✅</span>
                Payment of ৳{maidPaymentAmount} confirmed
            </div>
        );
    }

    // Reported as not paid - show status with deadline
    if (maidPaymentConfirmed === false) {
        return (
            <div className="mt-2 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                <div className="flex items-start">
                    <span className="mr-2 text-lg">⚠️</span>
                    <div>
                        <p className="font-medium">Payment dispute reported for ৳{maidPaymentAmount}</p>
                        <p className="text-xs mt-1 text-yellow-700">
                            Please visit the service center by: <strong>{formatDeadline(disputeDeadline)}</strong>
                        </p>
                        {maidAcknowledged && (
                            <p className="text-xs mt-1 text-green-600">✓ You have acknowledged this notice</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Pending confirmation
    return (
        <>
            {/* Service Center Modal */}
            {showServiceCenterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
                            <h3 className="text-white text-lg font-bold flex items-center">
                                <span className="mr-2 text-2xl">🏢</span>
                                Service Center Visit Required
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">⏰</div>
                                <p className="text-gray-800 font-medium text-lg mb-2">
                                    Please visit our service center
                                </p>
                                <p className="text-gray-600 mb-4">
                                    To resolve this payment dispute, you must visit our service center within <strong className="text-red-600">24 hours</strong>.
                                </p>
                                {deadline && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-800 text-sm font-medium">
                                            Deadline: {formatDeadline(deadline)}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleAcknowledgeDispute}
                                disabled={actionLoading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Okay, I Understand'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Confirmation UI */}
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
        </>
    );
};

export default MaidPaymentConfirmation;
