import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const EmailVerification = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  // ✅ Wrapped with useCallback to prevent re-creation
  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    try {
      console.log('🔍 Sending verification request for token:', token);
      console.log('👤 User ID:', userId);

      const response = await api.get(`/auth/verify/${userId}/${token}`);

      console.log('✅ Response received:', response.data);

      if (response.data.success === true) {
        setStatus('success');
        setMessage(response.data.message);

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('❌ Error caught:', err);
      console.error('❌ Error response:', err.response?.data);

      if (err.response?.data?.message?.includes('already verified')) {
        setStatus('success');
        setMessage('Your email is already verified! You can login now.');

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
          err.message ||
          'Verification failed'
        );
      }
    }
  }, [token, userId, navigate]);

  // ✅ Correct dependency added
  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">

        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-16 w-16 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-sm text-gray-600">Please wait a moment</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-16 w-16 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified! ✅</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">Redirecting to login page...</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-16 w-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed ❌</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm font-medium">Possible reasons:</p>
              <ul className="text-xs mt-2 space-y-1 text-left list-disc list-inside">
                <li>Verification link has expired (valid for 24 hours)</li>
                <li>Invalid verification token</li>
                <li>Link was already used</li>
              </ul>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
              >
                Register Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Try Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailVerification;
