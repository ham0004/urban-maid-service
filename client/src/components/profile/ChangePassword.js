import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Basic validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError({ message: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError({ message: 'New password must be at least 6 characters' });
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (res.data.success) {
                setSuccess('Password changed successfully!');
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (err) {
            setError({ message: err.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-8 py-6 bg-indigo-600">
                        <h2 className="text-2xl font-bold text-white">Change Password</h2>
                        <p className="text-indigo-200 mt-1">Ensure your account uses a strong password</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center border border-red-200">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {/* Handle both string and object error formats just in case api.js returns differently */}
                                {error.message || error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center border border-green-200">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    id="currentPassword"
                                    required
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    id="newPassword"
                                    required
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Change Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
