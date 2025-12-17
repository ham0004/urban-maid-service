import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

/**
 * Maid Approval Admin Component
 * @description Admin panel for reviewing and approving/rejecting maid verification documents
 * @author Member-1 (Module 3 - Admin Dashboard & Maid Approval)
 */
const MaidApprovalAdmin = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedMaid, setSelectedMaid] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchMaids = useCallback(async () => {
        try {
            setLoading(true);
            const endpoint = statusFilter === 'all'
                ? '/admin/maids'
                : `/admin/maids?status=${statusFilter}`;
            const response = await api.get(endpoint);
            setMaids(response.data.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch maids');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role !== 'admin') {
                navigate('/dashboard');
                return;
            }
            setUser(parsedUser);
        } catch (err) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchMaids();
        }
    }, [user, fetchMaids]);

    const handleApprove = async (maidId) => {
        try {
            setActionLoading(maidId);
            await api.put(`/admin/maids/${maidId}/approve`);
            setSuccess('Maid approved successfully!');
            fetchMaids();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve maid');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedMaid) return;
        try {
            setActionLoading(selectedMaid._id);
            await api.put(`/admin/maids/${selectedMaid._id}/reject`, {
                reason: rejectionReason || 'Documents did not meet requirements',
            });
            setSuccess('Maid verification rejected');
            setShowModal(false);
            setSelectedMaid(null);
            setRejectionReason('');
            fetchMaids();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject maid');
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (maid) => {
        setSelectedMaid(maid);
        setRejectionReason('');
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'approved':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <a href="/admin/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                🏠 Urban Maid Admin
                            </a>
                            <span className="hidden sm:inline-block px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium">
                                Maid Approval
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/admin/dashboard"
                                className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all duration-200 border border-indigo-500/30"
                            >
                                📦 Categories
                            </a>
                            <span className="text-slate-300 hidden sm:block">Welcome, {user?.name}!</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Messages */}
                {success && (
                    <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-4 rounded-xl flex items-center">
                        <span className="mr-3">✅</span>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl flex items-center">
                        <span className="mr-3">❌</span>
                        {error}
                    </div>
                )}

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Maid Verification</h2>
                        <p className="text-slate-400">Review and approve maid ID verification documents</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-8">
                    <div className="flex flex-wrap gap-3">
                        {['pending', 'approved', 'rejected', 'all'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === status
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                {status === 'pending' && maids.filter(m => m.maidProfile?.verificationStatus === 'pending').length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                        {maids.filter(m => m.maidProfile?.verificationStatus === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Maids List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : maids.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">👤</div>
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">No maids found</h3>
                        <p className="text-slate-500">
                            {statusFilter === 'pending' ? 'No pending verifications.' : `No ${statusFilter} maids.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {maids.map((maid) => (
                            <div
                                key={maid._id}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 hover:border-indigo-500/50 transition-all duration-200"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl">
                                            👩
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{maid.name}</h3>
                                            <p className="text-slate-400 text-sm">{maid.email}</p>
                                            {maid.phone && (
                                                <p className="text-slate-500 text-sm">{maid.phone}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(maid.maidProfile?.verificationStatus)}`}>
                                                    {maid.maidProfile?.verificationStatus?.toUpperCase() || 'UNVERIFIED'}
                                                </span>
                                                {maid.maidProfile?.experience > 0 && (
                                                    <span className="text-slate-400 text-xs">
                                                        {maid.maidProfile.experience} years exp.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                        {/* Documents */}
                                        {maid.maidProfile?.documents?.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-sm">📄 {maid.maidProfile.documents.length} doc(s)</span>
                                                {maid.maidProfile.documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={doc.url.startsWith('http') ? doc.url : `http://localhost:5000/${doc.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all"
                                                    >
                                                        View {doc.docType}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {maid.maidProfile?.verificationStatus === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(maid._id)}
                                                    disabled={actionLoading === maid._id}
                                                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all font-medium disabled:opacity-50"
                                                >
                                                    {actionLoading === maid._id ? '...' : '✓ Approve'}
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(maid)}
                                                    disabled={actionLoading === maid._id}
                                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium disabled:opacity-50"
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Skills */}
                                {maid.maidProfile?.skills?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                                        <p className="text-slate-500 text-xs mb-2">Skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {maid.maidProfile.skills.map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {showModal && selectedMaid && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowModal(false)}
                        ></div>

                        <div className="relative bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-w-md w-full mx-auto overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white">
                                    Reject Verification
                                </h3>
                            </div>

                            <div className="p-6">
                                <p className="text-slate-300 mb-4">
                                    Reject verification for <strong>{selectedMaid.name}</strong>?
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Reason for rejection (optional)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                                />
                                <div className="flex space-x-3 mt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaidApprovalAdmin;
