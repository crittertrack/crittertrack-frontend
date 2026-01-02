import React, { useState, useEffect } from 'react';
import { AlertTriangle, Flag, CheckCircle, Trash2, MessageSquare, Loader2, Filter, Search, AlertCircle } from 'lucide-react';

const ModerationTools = ({ authToken, API_BASE_URL, userRole }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [filterStatus, setFilterStatus] = useState('open');
    const [moderatorNote, setModeratorNote] = useState('');
    const [action, setAction] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReports();
    }, [filterStatus]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_BASE_URL}/admin/reports/list?status=${filterStatus}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports || []);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch reports');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            setActionLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    moderatorNotes: moderatorNote
                })
            });
            if (response.ok) {
                setModeratorNote('');
                fetchReports();
                setShowReportDetail(false);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update report status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTakeAction = async (reportId, actionType) => {
        if (!actionType) {
            setError('Please select an action');
            return;
        }

        if (userRole !== 'admin') {
            setError('Only admins can take actions on reports');
            return;
        }

        try {
            setActionLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    action: actionType,
                    reason: moderatorNote
                })
            });
            if (response.ok) {
                setModeratorNote('');
                setAction('');
                fetchReports();
                setShowReportDetail(false);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to take action');
            }
        } catch (error) {
            console.error('Error taking action:', error);
            setError('Failed to take action on report');
        } finally {
            setActionLoading(false);
        }
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            'inappropriate_content': 'Inappropriate Content',
            'harassment_bullying': 'Harassment/Bullying',
            'spam': 'Spam',
            'copyright_violation': 'Copyright Violation',
            'community_guidelines_violation': 'Community Guidelines',
            'other': 'Other'
        };
        return categoryMap[category] || category;
    };

    const getCategoryColor = (category) => {
        const colorMap = {
            'inappropriate_content': 'bg-red-100 text-red-800',
            'harassment_bullying': 'bg-orange-100 text-orange-800',
            'spam': 'bg-purple-100 text-purple-800',
            'copyright_violation': 'bg-pink-100 text-pink-800',
            'community_guidelines_violation': 'bg-red-100 text-red-800',
            'other': 'bg-gray-100 text-gray-800'
        };
        return colorMap[category] || 'bg-gray-100 text-gray-800';
    };

    const getContentTypeLabel = (type) => {
        const typeMap = {
            'animal': 'Animal Record',
            'profile': 'User Profile',
            'other': 'Other Content'
        };
        return typeMap[type] || type;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Community Reports & Moderation</h3>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
                {['open', 'in_review', 'resolved', 'dismissed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-3 font-medium border-b-2 transition ${
                            filterStatus === status
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-start gap-3">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Error loading reports</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">No reports in this category</p>
                    ) : (
                        reports.map(report => (
                            <div
                                key={report._id}
                                onClick={() => {
                                    setSelectedReport(report);
                                    setShowReportDetail(true);
                                    setError('');
                                }}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-600 cursor-pointer transition hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-red-100">
                                                <Flag size={20} className="text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{getCategoryLabel(report.category)}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {getContentTypeLabel(report.contentType)} • Reported by user
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 ml-11 line-clamp-2">{report.description}</p>
                                    </div>
                                    <div className="text-right ml-4 flex-shrink-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            report.status === 'open' ? 'bg-red-100 text-red-800' :
                                            report.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">{formatDate(report.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Report Detail Modal */}
            {showReportDetail && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Report Details</h3>
                            <button 
                                onClick={() => {
                                    setShowReportDetail(false);
                                    setModeratorNote('');
                                    setAction('');
                                    setError('');
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm flex items-start gap-3">
                                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Report Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Category:</p>
                                        <p className="font-semibold text-gray-800">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${getCategoryColor(selectedReport.category)}`}>
                                                {getCategoryLabel(selectedReport.category)}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Content Type:</p>
                                        <p className="font-semibold text-gray-800">{getContentTypeLabel(selectedReport.contentType)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status:</p>
                                        <p className="font-semibold text-gray-800 capitalize">{selectedReport.status.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Date Reported:</p>
                                        <p className="font-semibold text-gray-800">{formatDate(selectedReport.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-800 mb-2">Report Description</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{selectedReport.description}</p>
                            </div>

                            {selectedReport.moderatorNotes && (
                                <div className="border-t pt-4">
                                    <h4 className="font-bold text-gray-800 mb-2">Moderator Notes</h4>
                                    <p className="text-gray-700 bg-blue-50 p-3 rounded text-sm">{selectedReport.moderatorNotes}</p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {selectedReport.status === 'open' ? 'Update Status & Add Notes' : 'Additional Notes'}
                                </label>
                                <textarea
                                    value={moderatorNote}
                                    onChange={(e) => setModeratorNote(e.target.value)}
                                    placeholder="Enter moderator notes..."
                                    rows={3}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100"
                                />
                            </div>

                            <div className="border-t pt-4">
                                <div className="space-y-3">
                                    {selectedReport.status === 'open' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mark As</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(selectedReport._id, 'in_review')}
                                                        disabled={actionLoading}
                                                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading ? 'Updating...' : 'In Review'}
                                                    </button>
                                                </div>
                                            </div>

                                            {userRole === 'admin' && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Take Action</label>
                                                    <select
                                                        value={action}
                                                        onChange={(e) => setAction(e.target.value)}
                                                        disabled={actionLoading}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                                    >
                                                        <option value="">Select an action...</option>
                                                        <option value="remove_content">Remove Content</option>
                                                        <option value="warn_user">Warn User</option>
                                                        <option value="suspend_user">Suspend User</option>
                                                        <option value="ban_user">Ban User</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleTakeAction(selectedReport._id, action)}
                                                        disabled={!action || actionLoading}
                                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading ? 'Taking Action...' : 'Confirm Action'}
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                                                disabled={actionLoading}
                                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? 'Updating...' : 'Dismiss Report'}
                                            </button>
                                        </>
                                    )}

                                    {selectedReport.status === 'in_review' && (
                                        <>
                                            {userRole === 'admin' && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Take Action</label>
                                                    <select
                                                        value={action}
                                                        onChange={(e) => setAction(e.target.value)}
                                                        disabled={actionLoading}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                                    >
                                                        <option value="">Select an action...</option>
                                                        <option value="remove_content">Remove Content</option>
                                                        <option value="warn_user">Warn User</option>
                                                        <option value="suspend_user">Suspend User</option>
                                                        <option value="ban_user">Ban User</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleTakeAction(selectedReport._id, action)}
                                                        disabled={!action || actionLoading}
                                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading ? 'Taking Action...' : 'Confirm Action'}
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                                                disabled={actionLoading}
                                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? 'Updating...' : 'Dismiss Report'}
                                            </button>
                                        </>
                                    )}

                                    {['resolved', 'dismissed'].includes(selectedReport.status) && (
                                        <button
                                            onClick={() => setShowReportDetail(false)}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModerationTools;
