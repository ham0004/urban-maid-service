import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MaidVerification = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        experience: '',
        serviceTypes: [],
        docType: 'NID',
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    // Common service types for maids
    const serviceOptions = [
        'Cleaning',
        'Cooking',
        'Laundry',
        'Child Care',
        'Elderly Care',
        'Pet Care'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.experience || formData.experience <= 0) {
            setError('Please enter your years of experience.');
            return;
        }
        if (formData.serviceTypes.length === 0) {
            setError('Please select at least one service type.');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            // Save both experience and serviceTypes
            await api.put('/maids/profile', {
                experience: parseInt(formData.experience),
                skills: formData.serviceTypes, // Save as skills for backward compatibility
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Also initialize serviceTypes for search functionality
            await api.post('/maids/initialize', {
                serviceTypes: formData.serviceTypes,
                hourlyRate: 0 // Default rate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (files.length === 0) {
            setError('Please select at least one document');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formDataObj = new FormData();
            files.forEach(file => formDataObj.append('documents', file));
            formDataObj.append('docType', formData.docType);

            await api.post('/maids/upload-documents', formDataObj, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update local storage user data
            const userData = JSON.parse(localStorage.getItem('user'));
            userData.maidProfile = { verificationStatus: 'pending', hasSubmittedDocuments: true };
            localStorage.setItem('user', JSON.stringify(userData));

            navigate('/maid/verification-pending');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload documents');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">🏠 Urban Maid Service</h1>
                    <p className="text-blue-100">Complete Your Maid Profile</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}`}>
                            1
                        </div>
                        <div className={`w-20 h-1 ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}`}>
                            2
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Profile Information</h2>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Services You Offer (Select all that apply)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {serviceOptions.map(service => (
                                            <div
                                                key={service}
                                                onClick={() => handleServiceToggle(service)}
                                                className={`
                                                    cursor-pointer px-4 py-3 border rounded-lg text-sm font-medium text-center transition-all
                                                    ${formData.serviceTypes.includes(service)
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                                                `}
                                            >
                                                {formData.serviceTypes.includes(service) && '✓ '}{service}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                                >
                                    {loading ? 'Saving...' : 'Next: Upload Documents'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: ID Verification</h2>
                            <form onSubmit={handleDocumentSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Document Type
                                    </label>
                                    <select
                                        name="docType"
                                        value={formData.docType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="NID">National ID (NID)</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Documents (Images or PDF)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Max 5 files, 5MB each</p>
                                </div>

                                {files.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-700">Selected files:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {files.map((file, i) => <li key={i}>{file.name}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                                    >
                                        {loading ? 'Uploading...' : 'Submit for Review'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaidVerification;
