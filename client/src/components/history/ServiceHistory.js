import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Service History Component
 * @description View past services, payments, and download invoices
 * @author Member-2 (Module 3 - Service History & Invoice Generation)
 */
const ServiceHistory = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('services');
    const [services, setServices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === 'services') {
                const res = await api.get('/history/services', { headers });
                setServices(res.data.data);
            } else if (activeTab === 'payments') {
                const res = await api.get('/history/payments', { headers });
                setPayments(res.data.data);
            } else if (activeTab === 'invoices') {
                const res = await api.get('/history/invoices', { headers });
                setInvoices(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoiceId) => {
        try {
            // Fetch invoice HTML with authentication token
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/history/invoices/${invoiceId}/view`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load invoice');
            }

            // Get the HTML content
            const html = await response.text();

            // Open in new window with the HTML content
            const newWindow = window.open('', '_blank');
            newWindow.document.write(html);
            newWindow.document.close();
        } catch (err) {
            setError('Failed to load invoice. Please try again.');
            console.error('Invoice load error:', err);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };
        return `px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📋 My History</h1>
                        <p className="text-gray-600">View past services, payments, and invoices</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        ← Back
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b">
                        {['services', 'payments', 'invoices'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-center font-medium transition ${activeTab === tab
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'services' && '🧹 Services'}
                                {tab === 'payments' && '💳 Payments'}
                                {tab === 'invoices' && '📄 Invoices'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Services Tab */}
                        {activeTab === 'services' && (
                            <div className="space-y-4">
                                {services.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                        <p className="text-gray-500">No service history yet</p>
                                    </div>
                                ) : (
                                    services.map((service) => (
                                        <div key={service._id} className="bg-white rounded-lg shadow-md p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {service.serviceCategory?.icon} {service.serviceCategory?.name}
                                                    </h3>
                                                    <p className="text-gray-600">Maid: {service.maid?.name}</p>
                                                    <p className="text-gray-600">📅 {formatDate(service.scheduledDate)} at {service.scheduledTime}</p>
                                                    <p className="text-gray-600">⏱ {service.duration} mins</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={getStatusBadge(service.status)}>
                                                        {service.status}
                                                    </span>
                                                    <p className="text-2xl font-bold text-indigo-600 mt-2">৳{service.totalPrice}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                {payments.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-gray-500">No payment history yet</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {payments.map((payment) => (
                                                <tr key={payment.transactionId}>
                                                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{payment.transactionId}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.date)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{payment.service}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">৳{payment.amount}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={getStatusBadge(payment.status)}>{payment.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleDownloadInvoice(payment.invoiceId)}
                                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                        >
                                                            📥 Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Invoices Tab */}
                        {activeTab === 'invoices' && (
                            <div className="space-y-4">
                                {invoices.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                        <p className="text-gray-500">No invoices yet</p>
                                    </div>
                                ) : (
                                    invoices.map((invoice) => (
                                        <div key={invoice._id} className="bg-white rounded-lg shadow-md p-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                                                    <p className="text-gray-600">{formatDate(invoice.createdAt)}</p>
                                                    <p className="text-gray-600">{invoice.booking?.serviceCategory?.name || 'Subscription'}</p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-2xl font-bold text-indigo-600">৳{invoice.totalAmount}</span>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(invoice._id)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                                    >
                                                        📥 Download PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ServiceHistory;
