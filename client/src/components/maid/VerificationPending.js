import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerificationPending = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
                <div className="text-6xl mb-6">⏳</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Verification Pending
                </h1>
                <p className="text-gray-600 mb-6">
                    Thank you for submitting your documents! Our admin team is reviewing your profile.
                    This usually takes 1-2 business days.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                        You will receive an email notification once your account is verified.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default VerificationPending;
