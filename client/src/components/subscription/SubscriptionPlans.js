import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Subscription Plans Component (Customer View)
 * @description Shows available subscription plans for customers to purchase
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */
const SubscriptionPlans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch available plans
                const plansRes = await api.get('/subscriptions/plans');
                setPlans(plansRes.data.data);

                // Check if user has active subscription
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const subRes = await api.get('/subscriptions/my');
                        if (subRes.data.hasSubscription) {
                            setCurrentSubscription(subRes.data.data);
                        }
                    } catch (err) {
                        // User might not be logged in or no subscription
                    }
                }
            } catch (err) {
                setError(err.message || 'Failed to load plans');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubscribe = async (planId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setSubscribing(planId);
            setError('');
            const response = await api.post(`/subscriptions/subscribe/${planId}`);
            setSuccess('Successfully subscribed! 🎉');
            setCurrentSubscription(response.data.data);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message || 'Failed to subscribe');
        } finally {
            setSubscribing(null);
        }
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                        Subscription Plans
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Save money with our subscription packages. Choose a plan that fits your needs.
                    </p>
                </div>

                {/* Current Subscription Banner */}
                {currentSubscription && currentSubscription.status === 'active' && (
                    <div className="mb-8 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-400 flex items-center">
                                    <span className="mr-2">✅</span> Active Subscription
                                </h3>
                                <p className="text-slate-300 mt-1">
                                    <span className="font-medium">{currentSubscription.plan?.name}</span> •
                                    <span className="ml-2">{currentSubscription.remainingUnits} {currentSubscription.plan?.planType === 'hours' ? 'hours' : 'works'} remaining</span>
                                </p>
                                <p className="text-slate-400 text-sm mt-1">
                                    Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/my-subscription')}
                                className="mt-4 md:mt-0 px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all font-medium"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {success && (
                    <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-xl text-center">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Plans Grid */}
                {plans.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No plans available</h3>
                        <p className="text-slate-500">Check back later for subscription options.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                            <div
                                key={plan._id}
                                className={`relative bg-slate-800/50 backdrop-blur-lg rounded-2xl border ${index === 1 ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' : 'border-slate-700/50'
                                    } p-6 hover:border-emerald-500/50 transition-all duration-300 group`}
                            >
                                {index === 1 && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full">
                                            POPULAR
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 ${plan.planType === 'hours'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {plan.planType === 'hours' ? '⏱️ Hour-based' : '📋 Work-based'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-4xl font-bold text-emerald-400">৳{plan.price}</span>
                                        <span className="text-slate-400 ml-2">/ {plan.validityDays} days</span>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm text-center mb-6 min-h-[40px]">
                                    {plan.description || 'Get more value with this subscription plan'}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-slate-300">
                                        <span className="text-emerald-400 mr-3">✓</span>
                                        {plan.totalUnits} {plan.planType === 'hours' ? 'hours' : 'service bookings'}
                                    </div>
                                    <div className="flex items-center text-slate-300">
                                        <span className="text-emerald-400 mr-3">✓</span>
                                        Valid for {plan.validityDays} days
                                    </div>
                                    <div className="flex items-center text-slate-300">
                                        <span className="text-emerald-400 mr-3">✓</span>
                                        Use anytime during validity
                                    </div>
                                    <div className="flex items-center text-slate-300">
                                        <span className="text-emerald-400 mr-3">✓</span>
                                        Priority booking support
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan._id)}
                                    disabled={subscribing === plan._id || (currentSubscription && currentSubscription.status === 'active')}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all ${currentSubscription && currentSubscription.status === 'active'
                                            ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                                            : index === 1
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25'
                                                : 'bg-slate-700 text-white hover:bg-slate-600'
                                        }`}
                                >
                                    {subscribing === plan._id ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </span>
                                    ) : currentSubscription && currentSubscription.status === 'active' ? (
                                        'Already Subscribed'
                                    ) : (
                                        'Subscribe Now'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
