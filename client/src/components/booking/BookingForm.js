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

    // Fetch verified maids and service categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [maidsRes, categoriesRes] = await Promise.all([
                    api.get('/bookings/maids'),
                    api.get('/admin/service-categories'),
                ]);
                setMaids(maidsRes.data.data);
                setCategories(categoriesRes.data.data);
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
