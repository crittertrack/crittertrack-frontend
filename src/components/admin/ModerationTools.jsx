import React, { useState, useEffect } from 'react';
import { AlertTriangle, Flag, CheckCircle, Trash2, MessageSquare, Loader2, Filter, Search } from 'lucide-react';

const ModerationTools = ({ authToken, API_BASE_URL, userRole }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportDetail, setShowReportDetail] = useState(false);
    const [filterStatus, setFilterStatus] = useState('open');
    const [moderatorNote, setModeratorNote] = useState('');

    useEffect(() => {
        fetchReports();
    }, [filterStatus]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/reports?status=${filterStatus}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveEdit = async (reportId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ note: moderatorNote })
            });
            if (response.ok) {
                fetchReports();
                setShowReportDetail(false);
            }
        } catch (error) {
            console.error('Error approving edit:', error);
        }
    };

    const handleRejectEdit = async (reportId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ note: moderatorNote })
            });
            if (response.ok) {
                fetchReports();
                setShowReportDetail(false);
            }
        } catch (error) {
            console.error('Error rejecting edit:', error);
        }
    };

    const handleResolveReport = async (reportId, action = 'resolve') => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ note: moderatorNote })
            });
            if (response.ok) {
                fetchReports();
                setShowReportDetail(false);
            }
        } catch (error) {
            console.error('Error resolving report:', error);
        }
    };

    const handleSendMessage = async (reportId, userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/send-moderator-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ userId, message: moderatorNote, reportId })
            });
            if (response.ok) {
                alert('Message sent to user');
                setModeratorNote('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Moderation Tools</h3>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {['open', 'in-review', 'resolved', 'dismissed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-3 font-medium border-b-2 transition ${
                            filterStatus === status
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">No reports in this category</p>
                    ) : (
                        reports.map(report => (
                            <div
                                key={report.id}
                                onClick={() => {
                                    setSelectedReport(report);
                                    setShowReportDetail(true);
                                }}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-600 cursor-pointer transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${
                                                report.type === 'inappropriate-content' ? 'bg-red-100' :
                                                report.type === 'incorrect-data' ? 'bg-yellow-100' :
                                                'bg-blue-100'
                                            }`}>
                                                <Flag size={20} className={
                                                    report.type === 'inappropriate-content' ? 'text-red-600' :
                                                    report.type === 'incorrect-data' ? 'text-yellow-600' :
                                                    'text-blue-600'
                                                } />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{report.title}</h4>
                                                <p className="text-sm text-gray-600">Reported by {report.reporterUsername}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 ml-11">{report.description}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            report.status === 'open' ? 'bg-red-100 text-red-800' :
                                            report.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' :
                                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {report.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">{new Date(report.createdAt).toLocaleDateString()}</p>
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
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Report Details</h3>
                            <button onClick={() => setShowReportDetail(false)} className="p-1 hover:bg-white/20 rounded">
                                <AlertTriangle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Report Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Type:</p>
                                        <p className="font-semibold text-gray-800">{selectedReport.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status:</p>
                                        <p className="font-semibold text-gray-800">{selectedReport.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Reported by:</p>
                                        <p className="font-semibold text-gray-800">{selectedReport.reporterUsername}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Date:</p>
                                        <p className="font-semibold text-gray-800">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Details</h4>
                                <p className="text-gray-700">{selectedReport.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Moderator Notes
                                </label>
                                <textarea
                                    value={moderatorNote}
                                    onChange={(e) => setModeratorNote(e.target.value)}
                                    placeholder="Enter notes or message to user..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                {selectedReport.type === 'edit-approval' ? (
                                    <>
                                        <button
                                            onClick={() => handleApproveEdit(selectedReport.id)}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                        >
                                            Approve Edit
                                        </button>
                                        <button
                                            onClick={() => handleRejectEdit(selectedReport.id)}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            Reject Edit
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleSendMessage(selectedReport.id, selectedReport.reportedUserId)}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare size={18} />
                                            Send Message
                                        </button>
                                        <button
                                            onClick={() => handleResolveReport(selectedReport.id, 'resolve')}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                        >
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => handleResolveReport(selectedReport.id, 'dismiss')}
                                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                        >
                                            Dismiss
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModerationTools;
