import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MaidPaymentConfirmation = ({ bookingId }) => {
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPaymentStatus();
    }, [bookingId]);

    const fetchPaymentStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/payments/booking/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayment(res.data.data);
        } catch (err) {
            console.error("Failed to fetch payment status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!window.confirm("Confirm that you have received the payment?")) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/payments/${payment._id}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayment(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Checking payment...</div>;

    if (!payment) {
        return (
            <div className="mt-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm text-center">
                No payment reported yet
            </div>
        );
    }

    if (payment.status === 'pending') {
        return (
            <button
                onClick={handleConfirmPayment}
                disabled={actionLoading}
                className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium animate-pulse"
            >
                {actionLoading ? 'Processing...' : '💰 Confirm Payment Received'}
            </button>
        );
    }

    if (payment.status === 'succeeded') {
        return (
            <div className="mt-2 px-4 py-2 bg-green-50 text-green-800 rounded-lg text-sm font-medium flex items-center justify-center">
                <span className="mr-2">✅</span> Payment Verified
            </div>
        );
    }

    return null;
};

export default MaidPaymentConfirmation;
