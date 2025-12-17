import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CustomerPaymentAction = ({ bookingId }) => {
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

    const handleMarkAsPaid = async () => {
        if (!window.confirm("Confirm that you have made the payment manually (Cash/External Transfer)?")) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/payments/initiate', { bookingId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayment(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Checking payment logic...</div>;

    if (!payment) {
        return (
            <button
                onClick={handleMarkAsPaid}
                disabled={actionLoading}
                className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
                {actionLoading ? 'Processing...' : '💵 I have made the Payment'}
            </button>
        );
    }

    if (payment.status === 'pending') {
        return (
            <div className="mt-2 px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium flex items-center justify-center">
                <span className="mr-2">⏳</span> Waiting for Maid Confirmation
            </div>
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

export default CustomerPaymentAction;
