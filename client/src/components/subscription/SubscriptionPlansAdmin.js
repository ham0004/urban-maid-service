import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

/**
 * Subscription Plans Admin Component
 * @description Admin panel for managing subscription plans
 * @author Member-1 (Module 3 - Subscription & Membership Plans)
 */
const SubscriptionPlansAdmin = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        planType: 'works',
        totalUnits: '',
        price: '',
        validityDays: '30',
    });
    const [formLoading, setFormLoading] = useState(false);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/subscriptions/plans?includeInactive=true');
            setPlans(response.data.data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch plans');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedPlan(null);
        setFormData({
            name: '',
            description: '',
            planType: 'works',
            totalUnits: '',
            price: '',
            validityDays: '30',
        });
        setShowModal(true);
        setError('');
    };

    const openEditModal = (plan) => {
        setModalMode('edit');
        setSelectedPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            planType: plan.planType,
            totalUnits: plan.totalUnits.toString(),
            price: plan.price.toString(),
            validityDays: plan.validityDays.toString(),
        });
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPlan(null);
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);

        if (!formData.name.trim() || !formData.totalUnits || !formData.price) {
            setError('Please fill in all required fields');
            setFormLoading(false);
            return;
        }

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            planType: formData.planType,
            totalUnits: parseInt(formData.totalUnits, 10),
            price: parseFloat(formData.price),
            validityDays: parseInt(formData.validityDays, 10),
        };

        try {
            if (modalMode === 'create') {
                await api.post('/subscriptions/plans', payload);
                setSuccess('Subscription plan created successfully!');
            } else {
                await api.put(`/subscriptions/plans/${selectedPlan._id}`, payload);
                setSuccess('Subscription plan updated successfully!');
            }
            closeModal();
            fetchPlans();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            await api.put(`/subscriptions/plans/${plan._id}`, {
                isActive: !plan.isActive,
            });
            setSuccess(`Plan ${plan.isActive ? 'deactivated' : 'activated'} successfully!`);
            fetchPlans();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Operation failed');
        }
    };

    const isFormValid = formData.name.trim() && formData.totalUnits && formData.price && formData.validityDays;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Subscription Plans</h2>
                    <p className="text-slate-400 text-sm">Manage membership packages for customers</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="mt-4 sm:mt-0 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center"
                >
                    <span className="mr-2">➕</span>
                    Add Plan
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center">
                    <span className="mr-2">✅</span>
                    {success}
                </div>
            )}
            {error && !showModal && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex items-center">
                    <span className="mr-2">❌</span>
                    {error}
                </div>
            )}

            {/* Plans Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-3">📦</div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-1">No subscription plans</h3>
                    <p className="text-slate-500 text-sm">Create your first subscription plan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className={`bg-slate-800/50 backdrop-blur-lg rounded-xl border ${plan.isActive ? 'border-slate-700/50' : 'border-red-500/30'
                                } p-5 hover:border-emerald-500/50 transition-all duration-200 group`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                        {plan.name}
                                    </h3>
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${plan.planType === 'hours'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {plan.planType === 'hours' ? '⏱️ Hour-based' : '📋 Work-based'}
                                    </span>
                                    {!plan.isActive && (
                                        <span className="inline-block px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full ml-2">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-emerald-400">৳{plan.price}</span>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                {plan.description || 'No description'}
                            </p>

                            <div className="space-y-1 mb-4 text-sm">
                                <div className="flex justify-between text-slate-300">
                                    <span>{plan.planType === 'hours' ? 'Total Hours' : 'Total Works'}</span>
                                    <span className="font-medium">{plan.totalUnits}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Validity</span>
                                    <span className="font-medium">{plan.validityDays} days</span>
                                </div>
                            </div>

                            <div className="flex space-x-2 pt-3 border-t border-slate-700/50">
                                <button
                                    onClick={() => openEditModal(plan)}
                                    className="flex-1 px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all text-sm font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggleActive(plan)}
                                    className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${plan.isActive
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                        }`}
                                >
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        ></div>

                        <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-w-lg w-full mx-auto overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    {modalMode === 'create' ? 'Create Subscription Plan' : 'Edit Plan'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Plan Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Basic Monthly"
                                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description..."
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Plan Type *</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, planType: 'works' })}
                                            className={`flex-1 py-2.5 px-4 rounded-xl border transition-all ${formData.planType === 'works'
                                                    ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                                                    : 'bg-slate-900/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            📋 Work-based
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, planType: 'hours' })}
                                            className={`flex-1 py-2.5 px-4 rounded-xl border transition-all ${formData.planType === 'hours'
                                                    ? 'bg-blue-500/30 border-blue-500 text-blue-300'
                                                    : 'bg-slate-900/50 border-slate-600/50 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            ⏱️ Hour-based
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            {formData.planType === 'hours' ? 'Total Hours *' : 'Total Works *'}
                                        </label>
                                        <input
                                            type="number"
                                            name="totalUnits"
                                            value={formData.totalUnits}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 4"
                                            min="1"
                                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Price (৳) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 5000"
                                            min="0"
                                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Validity (days) *</label>
                                        <input
                                            type="number"
                                            name="validityDays"
                                            value={formData.validityDays}
                                            onChange={handleInputChange}
                                            placeholder="30"
                                            min="1"
                                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-5 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading || !isFormValid}
                                        className={`flex-1 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center ${isFormValid
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                                                : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {formLoading ? 'Saving...' : (modalMode === 'create' ? 'Create Plan' : 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlansAdmin;
