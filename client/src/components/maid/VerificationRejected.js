import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerificationRejected = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleResubmit = () => {
        // Reset status and go to verification page
        const userData = JSON.parse(localStorage.getItem('user'));
        userData.maidProfile = { verificationStatus: 'unverified', hasSubmittedDocuments: false };
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/maid/verification');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
                <div className="text-6xl mb-6">❌</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Verification Rejected
                </h1>
                <p className="text-gray-600 mb-6">
                    Unfortunately, your verification was not approved. This could be due to
                    unclear documents or missing information.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm">
                        Please resubmit with clear, valid documents to try again.
                    </p>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={handleResubmit}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Resubmit Documents
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationRejected;
