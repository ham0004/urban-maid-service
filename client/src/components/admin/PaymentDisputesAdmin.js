import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Payment Disputes Admin Component
 * @description Shows payment disputes reported by maids for subscription bookings
 * @author Member-1 (Module 3 - Payment Disputes)
 */
const PaymentDisputesAdmin = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDisputes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings/admin/unpaid');
            setDisputes(response.data.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch disputes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role !== 'admin') {
                navigate('/dashboard');
                return;
            }
            setUser(parsedUser);
        } catch (err) {
            console.error('Error parsing user data:', err);
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchDisputes();
        }
    }, [user, fetchDisputes]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString('en-BD', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        return new Date() > new Date(deadline);
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return 'N/A';
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;

        if (diff <= 0) return 'OVERDUE';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                ⚠️ Payment Disputes
                            </h1>
                            <span className="hidden sm:inline-block px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
                                {disputes.length} Active
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/admin/dashboard"
                                className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all duration-200 border border-indigo-500/30"
                            >
                                ⬅️ Back to Dashboard
                            </a>
                            <span className="text-slate-300 hidden sm:block">Welcome, {user?.name}!</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Info Banner */}
                <div className="mb-6 bg-orange-500/20 border border-orange-500/30 text-orange-300 px-6 py-4 rounded-xl">
                    <div className="flex items-start">
                        <span className="mr-3 text-2xl">📢</span>
                        <div>
                            <p className="font-medium">Payment Dispute Management</p>
                            <p className="text-sm text-orange-200 mt-1">
                                When a maid reports "Not Paid" for a subscription booking, they are asked to visit the service center within 24 hours.
                                Monitor disputes below and contact maids if needed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl flex items-center">
                        <span className="mr-3">❌</span>
                        {error}
                    </div>
                )}

                {/* Disputes List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No Active Disputes</h3>
                        <p className="text-slate-500">All subscription payments are confirmed. Great job!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute) => (
                            <div
                                key={dispute._id}
                                className={`bg-slate-800/50 backdrop-blur-lg rounded-2xl border ${isOverdue(dispute.subscriptionPayment?.disputeDeadline)
                                        ? 'border-red-500/50'
                                        : 'border-yellow-500/30'
                                    } p-6 hover:border-indigo-500/50 transition-all duration-200`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Dispute Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{dispute.serviceCategory?.icon || '🧹'}</span>
                                            <h3 className="text-lg font-semibold text-white">
                                                {dispute.serviceCategory?.name || 'Service'}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOverdue(dispute.subscriptionPayment?.disputeDeadline)
                                                    ? 'bg-red-500/30 text-red-300'
                                                    : 'bg-yellow-500/30 text-yellow-300'
                                                }`}>
                                                {getTimeRemaining(dispute.subscriptionPayment?.disputeDeadline)}
                                            </span>
                                        </div>

                                        {/* Maid Info */}
                                        <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                                            <p className="text-sm text-slate-400">Maid:</p>
                                            <p className="text-white font-medium">{dispute.maid?.name}</p>
                                            <p className="text-slate-400 text-sm">{dispute.maid?.email}</p>
                                            {dispute.maid?.phone && (
                                                <p className="text-emerald-400 text-sm">📞 {dispute.maid?.phone}</p>
                                            )}
                                        </div>

                                        {/* Customer Info */}
                                        <div className="bg-slate-900/50 rounded-lg p-3">
                                            <p className="text-sm text-slate-400">Customer:</p>
                                            <p className="text-white font-medium">{dispute.customer?.name}</p>
                                            <p className="text-slate-400 text-sm">{dispute.customer?.email}</p>
                                        </div>
                                    </div>

                                    {/* Payment & Timeline */}
                                    <div className="lg:text-right space-y-3">
                                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                                            <p className="text-sm text-red-300">Unpaid Amount</p>
                                            <p className="text-2xl font-bold text-red-400">
                                                ৳{dispute.subscriptionPayment?.maidPaymentAmount}
                                            </p>
                                        </div>

                                        <div className="text-sm text-slate-400 space-y-1">
                                            <p>
                                                <span className="text-slate-500">Reported:</span>{' '}
                                                {formatDate(dispute.subscriptionPayment?.disputeReportedAt)}
                                            </p>
                                            <p>
                                                <span className="text-slate-500">Deadline:</span>{' '}
                                                <span className={isOverdue(dispute.subscriptionPayment?.disputeDeadline) ? 'text-red-400' : 'text-yellow-400'}>
                                                    {formatDate(dispute.subscriptionPayment?.disputeDeadline)}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-slate-500">Acknowledged:</span>{' '}
                                                {dispute.subscriptionPayment?.maidAcknowledged ? (
                                                    <span className="text-green-400">✓ Yes</span>
                                                ) : (
                                                    <span className="text-red-400">✕ No</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="text-xs text-slate-500">
                                            <p>Booking ID: {dispute._id}</p>
                                            <p>Date: {new Date(dispute.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDisputesAdmin;
