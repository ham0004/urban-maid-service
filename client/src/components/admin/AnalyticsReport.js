import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsReport = ({ report }) => {
    if (!report || !report.analytics) {
        return null;
    }

    const { analytics, generatedAt, reviewCount, dateRange } = report;

    // Prepare sentiment distribution data
    const sentimentData = [
        { name: 'Positive', value: analytics.sentimentDistribution?.positive || 0 },
        { name: 'Neutral', value: analytics.sentimentDistribution?.neutral || 0 },
        { name: 'Negative', value: analytics.sentimentDistribution?.negative || 0 },
    ].filter(item => item.value > 0);

    const SENTIMENT_COLORS = {
        Positive: '#22c55e',
        Neutral: '#eab308',
        Negative: '#ef4444',
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'low':
                return 'bg-green-100 text-green-700 border-green-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">AI-Powered Analytics Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                        <p className="opacity-80">Generated</p>
                        <p className="font-semibold">
                            {new Date(generatedAt).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="opacity-80">Reviews Analyzed</p>
                        <p className="font-semibold">{reviewCount}</p>
                    </div>
                    <div>
                        <p className="opacity-80">Overall Sentiment</p>
                        <p className="font-semibold capitalize">{analytics.overallSentiment}</p>
                    </div>
                </div>
            </div>

            {/* Sentiment Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Sentiment Analysis
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={sentimentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center">
                        <div className="space-y-3 w-full">
                            {sentimentData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: SENTIMENT_COLORS[item.name] }}
                                        ></div>
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="text-gray-600">{item.value} reviews</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            {analytics.keyInsights && analytics.keyInsights.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <span className="mr-2">💡</span> Key Insights
                    </h3>
                    <ul className="space-y-2">
                        {analytics.keyInsights.map((insight, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                <span className="text-blue-900">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Top Complaints */}
            {analytics.topComplaints && analytics.topComplaints.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">⚠️</span> Top Complaints
                    </h3>
                    <div className="space-y-4">
                        {analytics.topComplaints.map((complaint, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${getSeverityColor(complaint.severity)}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold">{complaint.issue}</h4>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm px-2 py-1 bg-white rounded">
                                            {complaint.frequency} times
                                        </span>
                                        <span className="text-sm px-2 py-1 bg-white rounded capitalize">
                                            {complaint.severity}
                                        </span>
                                    </div>
                                </div>
                                {complaint.examples && complaint.examples.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium mb-1">Examples:</p>
                                        <ul className="text-sm space-y-1">
                                            {complaint.examples.map((example, idx) => (
                                                <li key={idx} className="italic">"{example}"</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Praised Features */}
            {analytics.topPraised && analytics.topPraised.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🌟</span> Top Praised Features
                    </h3>
                    <div className="space-y-4">
                        {analytics.topPraised.map((praise, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg border border-green-200 bg-green-50"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-green-900">{praise.feature}</h4>
                                    <span className="text-sm px-2 py-1 bg-white rounded text-green-700">
                                        {praise.frequency} mentions
                                    </span>
                                </div>
                                {praise.examples && praise.examples.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium text-green-900 mb-1">Examples:</p>
                                        <ul className="text-sm space-y-1 text-green-800">
                                            {praise.examples.map((example, idx) => (
                                                <li key={idx} className="italic">"{example}"</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Improvement Suggestions */}
            {analytics.improvementSuggestions && analytics.improvementSuggestions.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🎯</span> Improvement Suggestions
                    </h3>
                    <div className="space-y-4">
                        {analytics.improvementSuggestions.map((suggestion, index) => (
                            <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">{suggestion.area}</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(suggestion.priority)}`}></div>
                                        <span className="text-sm capitalize text-gray-600">{suggestion.priority} Priority</span>
                                    </div>
                                </div>
                                {suggestion.actionableSteps && suggestion.actionableSteps.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Action Steps:</p>
                                        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                                            {suggestion.actionableSteps.map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                                {suggestion.expectedImpact && (
                                    <div className="mt-2 p-2 bg-indigo-50 rounded text-sm text-indigo-900">
                                        <span className="font-medium">Expected Impact:</span> {suggestion.expectedImpact}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Areas */}
            {analytics.riskAreas && analytics.riskAreas.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🚨</span> Risk Areas
                    </h3>
                    <div className="space-y-4">
                        {analytics.riskAreas.map((risk, index) => (
                            <div key={index} className="p-4 rounded-lg border border-red-200 bg-red-50">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-red-900">{risk.risk}</h4>
                                    <span className={`text-sm px-2 py-1 rounded capitalize ${risk.impact === 'high' ? 'bg-red-600 text-white' :
                                            risk.impact === 'medium' ? 'bg-orange-500 text-white' :
                                                'bg-yellow-500 text-white'
                                        }`}>
                                        {risk.impact} Impact
                                    </span>
                                </div>
                                {risk.mitigation && (
                                    <div className="mt-2 p-2 bg-white rounded">
                                        <p className="text-sm font-medium text-red-900 mb-1">Mitigation Strategy:</p>
                                        <p className="text-sm text-red-800">{risk.mitigation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsReport;
