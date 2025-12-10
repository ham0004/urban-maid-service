import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MaidProfileSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        hourlyRate: '',
        serviceTypes: [],
    });

    const serviceOptions = [
        'Cleaning',
        'Cooking',
        'Laundry',
        'Child Care',
        'Elderly Care',
        'Pet Care'
    ];

    // Fetch existing profile data if available (Optional enhancement)
    // For now, we assume this is primarily for initialization or overwrite

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => {
            const currentServices = prev.serviceTypes;
            if (currentServices.includes(service)) {
                return { ...prev, serviceTypes: currentServices.filter(s => s !== service) };
            } else {
                return { ...prev, serviceTypes: [...currentServices, service] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validation
        if (!formData.hourlyRate || formData.hourlyRate <= 0) {
            setError('Please enter a valid hourly rate.');
            setLoading(false);
            return;
        }
        if (formData.serviceTypes.length === 0) {
            setError('Please select at least one service type.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/maids/initialize', {
                hourlyRate: parseFloat(formData.hourlyRate),
                serviceTypes: formData.serviceTypes
            });

            setSuccess('Profile initialized successfully! You are now searchable.');
            setTimeout(() => {
                navigate('/dashboard'); // Or redirect to schedule setup
            }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Service Settings</h2>
                    <p className="mt-2 text-gray-600">Set your rates and services to get discovered by customers.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hourly Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate ($)
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="hourlyRate"
                                id="hourlyRate"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3 border"
                                placeholder="0.00"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                min="0"
                                step="0.50"
                            />
                        </div>
                    </div>

                    {/* Service Types */}
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-3">Service Types Offered</span>
                        <div className="grid grid-cols-2 gap-3">
                            {serviceOptions.map(service => (
                                <div
                                    key={service}
                                    onClick={() => handleServiceToggle(service)}
                                    className={`
                                        cursor-pointer px-4 py-3 border rounded-lg text-sm font-medium text-center transition-all
                                        ${formData.serviceTypes.includes(service)
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    {service}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                            ${loading ? 'opacity-75 cursor-not-allowed' : ''}
                        `}
                    >
                        {loading ? 'Saving...' : 'Save Service Settings'}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Skip for now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaidProfileSetup;
