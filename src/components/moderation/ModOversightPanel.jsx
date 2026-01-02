import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Check, X as XIcon } from 'lucide-react';
import './ModOversightPanel.css';

export default function ModOversightPanel({ 
    isOpen, 
    onClose, 
    API_BASE_URL, 
    authToken,
    onActionTaken 
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('open'); // 'open', 'in_review', 'resolved', 'all'

    // Fetch reports on load
    useEffect(() => {
        if (isOpen && !isCollapsed) {
            fetchReports();
        }
    }, [isOpen, statusFilter]);

    const fetchReports = async () => {
        setLoading(true);
        setError('');

        try {
            const url = statusFilter === 'all' 
                ? `${API_BASE_URL}/api/admin/reports/list`
                : `${API_BASE_URL}/api/admin/reports/list?status=${statusFilter}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch reports');
            }

            setReports(data.reports || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeAction = async (action, details = {}) => {
        if (!selectedReport) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/admin/reports/${selectedReport._id}/action`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        action,
                        ...details
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to take action');
            }

            // Update the report in the list
            setReports(reports.map(r => 
                r._id === selectedReport._id 
                    ? { ...r, status: 'resolved', actionTaken: action }
                    : r
            ));

            setSelectedReport(null);
            if (onActionTaken) onActionTaken();
        } catch (err) {
            setError(err.message);
        }
    };

    const getReportTitle = (report) => {
        if (report.contentType === 'animal') {
            return `Animal: ${report.contentDetails?.name || 'Unknown'}`;
        } else if (report.contentType === 'profile') {
            return `Profile: ${report.contentDetails?.personalName || 'Unknown'}`;
        }
        return 'Report';
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            inappropriate_content: '#f44336',
            spam: '#ff9800',
            harassment: '#e91e63',
            misinformation: '#2196f3',
            copyright: '#9c27b0',
            other: '#757575'
        };
        return colors[category] || '#757575';
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            open: '#ff6f00',
            in_review: '#1976d2',
            resolved: '#388e3c',
            dismissed: '#666'
        };
        return colors[status] || '#666';
    };

    if (!isOpen) return null;

    return (
        <div className={`mod-panel ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="mod-panel-header">
                <h3>Moderation Oversight</h3>
                <button 
                    className="mod-panel-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expand' : 'Collapse'}
                >
                    {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {!isCollapsed && (
                <div className="mod-panel-content">
                    {/* Filter tabs */}
                    <div className="mod-filter-tabs">
                        {['open', 'in_review', 'resolved', 'all'].map(status => (
                            <button
                                key={status}
                                className={`mod-filter-tab ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Reports list or detail view */}
                    {selectedReport ? (
                        <div className="mod-detail-view">
                            <button 
                                className="mod-back-button"
                                onClick={() => setSelectedReport(null)}
                            >
                                ← Back to Reports
                            </button>

                            <div className="mod-report-detail">
                                <h4>Report Details</h4>
                                
                                <div className="mod-detail-section">
                                    <strong>Content:</strong>
                                    <p>{getReportTitle(selectedReport)}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Reported Field:</strong>
                                    <p>{selectedReport.reportedField || 'Not specified'}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Category:</strong>
                                    <span 
                                        className="mod-badge"
                                        style={{ backgroundColor: getCategoryBadgeColor(selectedReport.category) }}
                                    >
                                        {selectedReport.category.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Reporter:</strong>
                                    <p>{selectedReport.reporterEmail || 'Anonymous'}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Reason:</strong>
                                    <p>{selectedReport.description}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Content Owner:</strong>
                                    <p>{selectedReport.contentOwnerDetails?.personalName || selectedReport.contentOwnerDetails?.breederName || 'Unknown'}</p>
                                </div>

                                {selectedReport.status !== 'resolved' && (
                                    <div className="mod-actions">
                                        <h5>Take Action</h5>
                                        <button 
                                            className="mod-action-btn warn"
                                            onClick={() => handleTakeAction('user_warned')}
                                        >
                                            Warn User
                                        </button>
                                        <button 
                                            className="mod-action-btn remove"
                                            onClick={() => handleTakeAction('content_removed')}
                                        >
                                            Remove Content
                                        </button>
                                        <button 
                                            className="mod-action-btn replace"
                                            onClick={() => handleTakeAction('content_replaced', {
                                                replacementText: 'Content removed due to moderation'
                                            })}
                                        >
                                            Replace Content
                                        </button>
                                        <button 
                                            className="mod-action-btn suspend"
                                            onClick={() => handleTakeAction('user_suspended')}
                                        >
                                            Suspend User
                                        </button>
                                        <button 
                                            className="mod-action-btn ban"
                                            onClick={() => handleTakeAction('user_banned')}
                                        >
                                            Ban User
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mod-list-view">
                            {error && (
                                <div className="mod-error">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="mod-loading">Loading reports...</div>
                            ) : reports.length === 0 ? (
                                <div className="mod-empty">No reports found</div>
                            ) : (
                                <div className="mod-reports-list">
                                    {reports.map(report => (
                                        <div 
                                            key={report._id}
                                            className="mod-report-item"
                                            onClick={() => setSelectedReport(report)}
                                        >
                                            <div className="mod-report-header">
                                                <span className="mod-report-title">
                                                    {getReportTitle(report)}
                                                </span>
                                                <span 
                                                    className="mod-status-badge"
                                                    style={{ backgroundColor: getStatusBadgeColor(report.status) }}
                                                >
                                                    {report.status}
                                                </span>
                                            </div>
                                            <div className="mod-report-meta">
                                                <span className="mod-report-category">
                                                    {report.category}
                                                </span>
                                                <span className="mod-report-field">
                                                    {report.reportedField || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mod-panel-footer">
                        <button 
                            className="mod-signout-btn"
                            onClick={onClose}
                        >
                            Sign Out of Moderation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
