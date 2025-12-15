import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * My Subscription Component
 * @description Shows customer's active subscription details and usage history
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */
const MySubscription = () => {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const response = await api.get('/subscriptions/my');
            setSubscription(response.data.data);
        } catch (err) {
            setError(err.message || 'Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? Remaining balance will be forfeited.')) {
            return;
        }

        try {
            setCancelling(true);
            await api.post('/subscriptions/cancel');
            setSuccess('Subscription cancelled successfully');
            fetchSubscription();
        } catch (err) {
            setError(err.message || 'Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'cancelled': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            case 'exhausted': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getProgressPercentage = () => {
        if (!subscription || !subscription.plan) return 0;
        const used = subscription.plan.totalUnits - subscription.remainingUnits;
        return (used / subscription.plan.totalUnits) * 100;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 hover:text-white transition-colors mb-4 flex items-center"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-white">My Subscription</h1>
                </div>

                {/* Messages */}
                {success && (
                    <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-xl">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl">
                        {error}
                    </div>
                )}

                {!subscription ? (
                    /* No Subscription */
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-semibold text-white mb-2">No Active Subscription</h2>
                        <p className="text-slate-400 mb-6">Subscribe to a plan to save on your bookings!</p>
                        <button
                            onClick={() => navigate('/subscription-plans')}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                        >
                            View Plans
                        </button>
                    </div>
                ) : (
                    /* Subscription Details */
                    <div className="space-y-6">
                        {/* Main Card */}
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-white">{subscription.plan?.name}</h2>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(subscription.status)}`}>
                                            {subscription.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${subscription.plan?.planType === 'hours'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {subscription.plan?.planType === 'hours' ? '⏱️ Hour-based' : '📋 Work-based'}
                                    </span>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <span className="text-3xl font-bold text-emerald-400">৳{subscription.plan?.price}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Usage</span>
                                    <span className="text-slate-300">
                                        {subscription.plan?.totalUnits - subscription.remainingUnits} / {subscription.plan?.totalUnits} {subscription.plan?.planType === 'hours' ? 'hours' : 'works'} used
                                    </span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${getProgressPercentage()}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-emerald-400 font-medium">
                                        {subscription.remainingUnits} {subscription.plan?.planType === 'hours' ? 'hours' : 'works'} remaining
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                                    <p className="text-slate-400 text-xs mb-1">Start Date</p>
                                    <p className="text-white font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                                    <p className="text-slate-400 text-xs mb-1">End Date</p>
                                    <p className="text-white font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                                    <p className="text-slate-400 text-xs mb-1">Days Left</p>
                                    <p className="text-white font-medium">
                                        {Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                                    <p className="text-slate-400 text-xs mb-1">Payment Status</p>
                                    <p className={`font-medium ${subscription.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {subscription.paymentStatus.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            {subscription.status === 'active' && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={cancelling}
                                        className="px-5 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium disabled:opacity-50"
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Usage History */}
                        {subscription.usageHistory && subscription.usageHistory.length > 0 && (
                            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Usage History</h3>
                                <div className="space-y-3">
                                    {subscription.usageHistory.map((usage, index) => (
                                        <div key={index} className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
                                            <div>
                                                <p className="text-slate-300">Booking #{usage.booking?.toString().slice(-6) || index + 1}</p>
                                                <p className="text-slate-500 text-sm">{new Date(usage.usedAt).toLocaleString()}</p>
                                            </div>
                                            <span className="text-amber-400 font-medium">
                                                -{usage.unitsUsed} {subscription.plan?.planType === 'hours' ? 'hours' : 'works'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Browse Plans */}
                        {subscription.status !== 'active' && (
                            <div className="text-center">
                                <button
                                    onClick={() => navigate('/subscription-plans')}
                                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    Browse New Plans
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySubscription;
