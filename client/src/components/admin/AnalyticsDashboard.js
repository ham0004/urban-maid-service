import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewStats from './ReviewStats';
import AnalyticsReport from './AnalyticsReport';

const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    // Check if user is admin
    React.useEffect(() => {
        if (!token) {
            navigate('/login');
        } else if (user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [token, user.role, navigate]);

    const handleGenerateReport = async () => {
        setGenerating(true);
        setError('');

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/analytics/generate-report`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setReport(response.data);
            setGenerating(false);
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err.response?.data?.message || 'Failed to generate report');
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                📊 Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                AI-powered insights from customer reviews
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                            ← Back to Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Generate Report Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                🤖 AI-Powered Analytics Report
                            </h2>
                            <p className="text-gray-600">
                                Generate comprehensive insights using Google Gemini AI
                            </p>
                        </div>
                        <button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className={`px-6 py-3 rounded-lg font-semibold transition ${generating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                                }`}
                        >
                            {generating ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Generating...
                                </span>
                            ) : (
                                'Generate Report'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {generating && (
                        <div className="mt-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg">
                            <p className="flex items-center">
                                <span className="mr-2">⏳</span>
                                Analyzing reviews with AI... This may take a few moments.
                            </p>
                        </div>
                    )}
                </div>

                {/* Review Statistics */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Review Statistics
                    </h2>
                    <ReviewStats />
                </div>

                {/* AI Report */}
                {report && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                AI-Generated Report
                            </h2>
                            <button
                                onClick={() => setReport(null)}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                Clear Report
                            </button>
                        </div>
                        <AnalyticsReport report={report} />
                    </div>
                )}

                {/* Empty State */}
                {!report && !generating && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="text-6xl mb-4">🤖</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Report Generated Yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Click "Generate Report" to create an AI-powered analysis
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
