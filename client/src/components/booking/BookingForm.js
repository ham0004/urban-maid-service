import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const BookingForm = () => {
    const navigate = useNavigate();
    const [maids, setMaids] = useState([]);
    const [categories, setCategories] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    // Member-1: Subscription state
    const [subscription, setSubscription] = useState(null);

    const [formData, setFormData] = useState({
        maidId: '',
        serviceCategoryId: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        address: {
            street: '',
            city: '',
        },
        notes: '',
    });

    // Fetch verified maids, service categories, and check subscription
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [maidsRes, categoriesRes] = await Promise.all([
                    api.get('/bookings/maids'),
                    api.get('/admin/service-categories'),
                ]);
                setMaids(maidsRes.data.data);
                setCategories(categoriesRes.data.data);

                // Check for active subscription
                try {
                    const subRes = await api.get('/bookings/check-subscription');
                    if (subRes.data.hasSubscription) {
                        setSubscription(subRes.data.data);
                    }
                } catch (subErr) {
                    // User might not have subscription or not logged in
                }
            } catch (err) {
                setError('Failed to load data');
            }
        };
        fetchData();
    }, []);

    // Fetch available slots when maid and date are selected
    useEffect(() => {
        const fetchSlots = async () => {
            if (formData.maidId && formData.scheduledDate) {
                try {
                    const res = await api.get(`/bookings/availability/${formData.maidId}?date=${formData.scheduledDate}`);
                    setAvailableSlots(res.data.data.availableSlots);
                } catch (err) {
                    setAvailableSlots([]);
                }
            }
        };
        fetchSlots();
    }, [formData.maidId, formData.scheduledDate]);

    // Fetch weather when city and date are selected
    useEffect(() => {
        const fetchWeather = async () => {
            if (formData.address.city && formData.scheduledDate) {
                setWeatherLoading(true);
                try {
                    const res = await api.get(`/weather/forecast?city=${formData.address.city}&date=${formData.scheduledDate}`);
                    setWeather(res.data.data);
                } catch (err) {
                    console.error('Failed to fetch weather:', err);
                    setWeather(null);
                } finally {
                    setWeatherLoading(false);
                }
            }
        };

        const timeoutId = setTimeout(() => {
            fetchWeather();
        }, 1000); // Debounce weather fetch 

        return () => clearTimeout(timeoutId);
    }, [formData.address.city, formData.scheduledDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await api.post('/bookings', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Booking created successfully!');
            setTimeout(() => navigate('/bookings/my'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">📅 Book a Service</h1>

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

                    {/* Member-1: Subscription Status Banner */}
                    {subscription && (() => {
                        // Check if selected date is within subscription validity
                        const selectedDate = formData.scheduledDate ? new Date(formData.scheduledDate) : null;
                        const endDate = new Date(subscription.endDate);
                        const isDateBeyondValidity = selectedDate && selectedDate > endDate;

                        return (
                            <div className={`border rounded-lg p-4 mb-6 ${isDateBeyondValidity ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className={`font-semibold flex items-center ${isDateBeyondValidity ? 'text-amber-800' : 'text-emerald-800'}`}>
                                            <span className="mr-2">{isDateBeyondValidity ? '⚠️' : '🎫'}</span>
                                            {isDateBeyondValidity ? 'SUBSCRIPTION NOT APPLICABLE' : 'SUBSCRIPTION ACTIVE'}
                                        </h4>
                                        <p className={`text-sm mt-1 ${isDateBeyondValidity ? 'text-amber-700' : 'text-emerald-700'}`}>
                                            <span className="font-medium">{subscription.planName}</span>
                                            <span className="mx-2">•</span>
                                            {subscription.remainingUnits} {subscription.planType === 'hours' ? 'hours' : 'works'} remaining
                                            <span className="mx-2">•</span>
                                            <span className="text-xs">Valid until: {new Date(subscription.endDate).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isDateBeyondValidity ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
                                            {subscription.planType === 'hours' ? '⏱️ Hour-based' : '📋 Work-based'}
                                        </span>
                                    </div>
                                </div>

                                {isDateBeyondValidity ? (
                                    <div className="mt-3 pt-3 border-t border-amber-200">
                                        <p className="text-amber-800 text-sm">
                                            ⚠️ <strong>Selected date ({new Date(formData.scheduledDate).toLocaleDateString()}) is beyond your subscription validity.</strong>
                                        </p>
                                        <p className="text-amber-700 text-sm mt-1">
                                            This booking will be a <strong>regular booking</strong> with standard pricing. Your subscription will NOT be used.
                                        </p>
                                    </div>
                                ) : formData.duration && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-emerald-600">This booking:</span>
                                            <span className="font-medium text-emerald-800 ml-2">
                                                {subscription.planType === 'hours' ? Math.ceil(formData.duration / 60) : 1} {subscription.planType}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-600">Maid will receive:</span>
                                            <span className="font-bold text-emerald-800 ml-2">
                                                ৳{subscription.pricePerUnit * (subscription.planType === 'hours' ? Math.ceil(formData.duration / 60) : 1)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Select Maid */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Maid</label>
                            <select
                                name="maidId"
                                value={formData.maidId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Select a Maid --</option>
                                {maids.map(maid => (
                                    <option key={maid._id} value={maid._id}>
                                        {maid.name} ({maid.maidProfile?.experience || 0} yrs exp)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select Service Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                            <select
                                name="serviceCategoryId"
                                value={formData.serviceCategoryId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Select Service --</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Weather Information Display */}
                        {weather && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-300">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                    <span className="mr-2">🌤️</span> Weather Forecast for {weather.location.name}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Condition</span>
                                        <span className="font-medium text-gray-900">{weather.weather.condition}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Temperature</span>
                                        <span className="font-medium text-gray-900">{weather.weather.maxTemp}°C / {weather.weather.minTemp}°C</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Precipitation</span>
                                        <span className="font-medium text-gray-900">{weather.weather.precipitation} mm</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {weatherLoading && (
                            <div className="text-sm text-gray-500 italic">Checking weather forecast...</div>
                        )}

                        {/* Time Slot */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                            <select
                                name="scheduledTime"
                                value={formData.scheduledTime}
                                onChange={handleChange}
                                required
                                disabled={availableSlots.length === 0}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">-- Select Time --</option>
                                {availableSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                            {formData.maidId && formData.scheduledDate && availableSlots.length === 0 && (
                                <p className="text-red-500 text-sm mt-1">No available slots for this date</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={60}>1 Hour</option>
                                <option value={120}>2 Hours</option>
                                <option value={180}>3 Hours</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Dhaka"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Any special instructions..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition"
                        >
                            {loading ? 'Creating Booking...' : 'Book Now'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;
