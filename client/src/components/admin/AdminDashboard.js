import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Admin Dashboard Component
 * @description Main admin dashboard for managing service categories
 * @author Member-1 (Module 2 - Service Category Management)
 */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '🧹',
        pricing: [{ name: '', price: '', duration: '', description: '' }],
    });
    const [formLoading, setFormLoading] = useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

    const iconOptions = ['🧹', '🏠', '🍳', '👶', '🧺', '🪟', '🛁', '🌿', '🐕', '🚗', '⚡', '🔧'];

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/categories?includeInactive=${showInactive}&search=${searchTerm}`);
            setCategories(response.data.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, [showInactive, searchTerm]);

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
            fetchCategories();
        }
    }, [user, fetchCategories]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: '🧹',
            pricing: [{ name: '', price: '', duration: '', description: '' }],
        });
        setShowModal(true);
        setError('');
    };

    const openEditModal = (category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '🧹',
            pricing: category.pricing.length > 0
                ? category.pricing.map(p => ({
                    name: p.name,
                    price: p.price.toString(),
                    duration: p.duration.toString(),
                    description: p.description || '',
                }))
                : [{ name: '', price: '', duration: '', description: '' }],
        });
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePricingChange = (index, field, value) => {
        const newPricing = [...formData.pricing];
        newPricing[index][field] = value;
        setFormData({ ...formData, pricing: newPricing });
    };

    const addPricingTier = () => {
        setFormData({
            ...formData,
            pricing: [...formData.pricing, { name: '', price: '', duration: '', description: '' }],
        });
    };

    const removePricingTier = (index) => {
        if (formData.pricing.length > 1) {
            const newPricing = formData.pricing.filter((_, i) => i !== index);
            setFormData({ ...formData, pricing: newPricing });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);

        if (!formData.name.trim()) {
            setError('Category name is required');
            setFormLoading(false);
            return;
        }

        const validPricing = formData.pricing.filter(p => p.name && p.price && p.duration);
        if (validPricing.length === 0) {
            setError('At least one complete pricing tier is required');
            setFormLoading(false);
            return;
        }

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            icon: formData.icon,
            pricing: validPricing.map(p => ({
                name: p.name,
                price: parseFloat(p.price),
                duration: parseInt(p.duration, 10),
                description: p.description,
            })),
        };

        try {
            if (modalMode === 'create') {
                await api.post('/admin/categories', payload);
                setSuccess('Category created successfully!');
            } else {
                await api.put(`/admin/categories/${selectedCategory._id}`, payload);
                setSuccess('Category updated successfully!');
            }
            closeModal();
            fetchCategories();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = async (category) => {
        try {
            await api.put(`/admin/categories/${category._id}`, {
                isActive: !category.isActive,
            });
            setSuccess(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully!`);
            fetchCategories();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
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
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                🏠 Urban Maid Admin
                            </h1>
                            <span className="hidden sm:inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium">
                                Admin Panel
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/admin/subscriptions"
                                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all duration-200 border border-emerald-500/30"
                            >
                                📦 Subscriptions
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
                {/* Success Message */}
                {success && (
                    <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-xl flex items-center">
                        <span className="mr-3">✅</span>
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && !showModal && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl flex items-center">
                        <span className="mr-3">❌</span>
                        {error}
                    </div>
                )}

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Service Categories</h2>
                        <p className="text-slate-400">Manage service categories and pricing structures</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center"
                    >
                        <span className="mr-2">➕</span>
                        Add Category
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <label className="flex items-center space-x-3 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl cursor-pointer hover:bg-slate-900/70 transition-all">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                            />
                            <span className="text-slate-300">Show inactive</span>
                        </label>
                    </div>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No categories found</h3>
                        <p className="text-slate-500">Get started by creating your first service category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className={`bg-slate-800/50 backdrop-blur-lg rounded-2xl border ${category.isActive ? 'border-slate-700/50' : 'border-red-500/30'
                                    } p-6 hover:border-indigo-500/50 transition-all duration-200 group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-3xl">{category.icon || '🧹'}</span>
                                        <div>
                                            <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                {category.name}
                                            </h3>
                                            {!category.isActive && (
                                                <span className="inline-block px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full mt-1">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                    {category.description || 'No description provided'}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing</h4>
                                    {category.pricing.slice(0, 3).map((tier, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-300">{tier.name}</span>
                                            <span className="text-emerald-400 font-medium">৳{tier.price}</span>
                                        </div>
                                    ))}
                                    {category.pricing.length > 3 && (
                                        <p className="text-slate-500 text-xs">+{category.pricing.length - 3} more tiers</p>
                                    )}
                                </div>

                                <div className="flex space-x-2 pt-4 border-t border-slate-700/50">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="flex-1 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(category)}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium ${category.isActive
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                            }`}
                                    >
                                        {category.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        ></div>

                        <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-w-2xl w-full mx-auto overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white">
                                    {modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                                {error && (
                                    <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Deep Cleaning"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of this service category..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Icon
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {iconOptions.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon })}
                                                className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all ${formData.icon === icon
                                                    ? 'bg-indigo-500/30 border-2 border-indigo-500'
                                                    : 'bg-slate-900/50 border border-slate-600/50 hover:border-slate-500'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-slate-300">
                                            Pricing Tiers * (Name, Price in ৳, Duration in minutes)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addPricingTier}
                                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center"
                                        >
                                            ➕ Add Tier
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.pricing.map((tier, index) => (
                                            <div key={index} className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm text-slate-400">Tier {index + 1}</span>
                                                    {formData.pricing.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePricingTier(index)}
                                                            className="text-red-400 hover:text-red-300 text-sm"
                                                        >
                                                            🗑️ Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="Name (e.g., Hourly)"
                                                            value={tier.name}
                                                            onChange={(e) => handlePricingChange(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            placeholder="Price (৳)"
                                                            value={tier.price}
                                                            onChange={(e) => handlePricingChange(index, 'price', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            placeholder="Duration (min)"
                                                            value={tier.duration}
                                                            onChange={(e) => handlePricingChange(index, 'duration', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600/50 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    {(() => {
                                        const hasValidName = formData.name.trim().length > 0;
                                        const hasValidPricing = formData.pricing.some(p => p.name.trim() && p.price && p.duration);
                                        const isFormValid = hasValidName && hasValidPricing;
                                        return (
                                            <button
                                                type="submit"
                                                disabled={formLoading || !isFormValid}
                                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center ${isFormValid
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                                                    : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                                                    } ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {formLoading ? 'Saving...' : (modalMode === 'create' ? 'Create Category' : 'Save Changes')}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
