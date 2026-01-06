import React, { useState, useEffect } from 'react';
import { 
    FileText, Filter, Search, Calendar, User, Shield, 
    Activity, Download, RefreshCw 
} from 'lucide-react';
import axios from 'axios';
import './AuditLogViewer.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Helper to format details into readable text
const formatDetails = (details) => {
    if (!details || typeof details !== 'object') return null;
    
    const lines = [];
    
    // Common fields to display nicely
    if (details.reason) lines.push(`Reason: ${details.reason}`);
    if (details.newStatus) lines.push(`New Status: ${details.newStatus}`);
    if (details.previousStatus) lines.push(`Previous Status: ${details.previousStatus}`);
    if (details.durationDays) lines.push(`Duration: ${details.durationDays} days`);
    if (details.warningCategory) lines.push(`Category: ${details.warningCategory}`);
    if (details.warningCount) lines.push(`Warning Count: ${details.warningCount}`);
    if (details.fieldName) lines.push(`Field: ${details.fieldName}`);
    if (details.oldValue) lines.push(`Old Value: ${details.oldValue}`);
    if (details.newValue) lines.push(`New Value: ${details.newValue}`);
    if (details.reportType) lines.push(`Report Type: ${details.reportType}`);
    if (details.resolution) lines.push(`Resolution: ${details.resolution}`);
    
    return lines.length > 0 ? lines : null;
};

const ACTION_TYPES = [
    { value: 'all', label: 'All Actions' },
    { value: 'admin_login', label: 'Admin Login' },
    { value: 'moderator_login', label: 'Moderator Login' },
    { value: 'user_warned', label: 'User Warned' },
    { value: 'user_suspended', label: 'User Suspended' },
    { value: 'suspension_lifted', label: 'Suspension Lifted' },
    { value: 'user_banned', label: 'User Banned' },
    { value: 'ban_lifted', label: 'Ban Lifted' },
    { value: 'profile_flagged', label: 'Profile Flagged' },
    { value: 'profile_unflagged', label: 'Profile Unflagged' },
    { value: 'animal_flagged', label: 'Animal Flagged' },
    { value: 'animal_unflagged', label: 'Animal Unflagged' },
    { value: 'report_reviewed', label: 'Report Reviewed' },
    { value: 'report_resolved', label: 'Report Resolved' },
    { value: 'report_dismissed', label: 'Report Dismissed' }
];

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        action: 'all',
        moderator: '',
        targetUser: '',
        startDate: '',
        endDate: '',
        searchTerm: ''
    });
    const [page, setPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const logsPerPage = 50;

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: logsPerPage.toString()
            });

            if (filters.action !== 'all') params.append('action', filters.action);
            if (filters.moderator) params.append('moderator', filters.moderator);
            if (filters.targetUser) params.append('targetUser', filters.targetUser);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.searchTerm) params.append('search', filters.searchTerm);

            const response = await axios.get(
                `${API_URL}/admin/audit-logs?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const logsData = response.data?.logs || response.data;
            setLogs(Array.isArray(logsData) ? logsData : []);
            setTotalLogs(response.data?.total || (Array.isArray(logsData) ? logsData.length : 0));
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load audit logs');
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filters change
    };

    const handleRefresh = () => {
        fetchLogs();
    };

    const handleExport = () => {
        // Export logs as CSV
        const csvHeader = 'Timestamp,Action,Moderator,Target User,IP Address,Details\n';
        const csvRows = logs.map(log => {
            const timestamp = new Date(log.timestamp).toISOString();
            const action = log.action;
            const moderator = log.moderatorId?.personalName || log.moderatorId?.breederName || 'System';
            const targetUser = log.targetUserId?.personalName || log.targetUserId?.breederName || 'N/A';
            const ip = log.ipAddress || 'N/A';
            const details = (log.details ? JSON.stringify(log.details) : '').replace(/"/g, '""');
            
            return `"${timestamp}","${action}","${moderator}","${targetUser}","${ip}","${details}"`;
        }).join('\n');

        const csv = csvHeader + csvRows;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const totalPages = Math.ceil(totalLogs / logsPerPage);

    return (
        <div className="audit-log-viewer">
            <div className="panel-header">
                <h2>
                    <FileText size={24} />
                    Audit Log Viewer
                </h2>
                <p className="panel-subtitle">
                    Complete record of all administrative and moderation actions
                </p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="audit-controls">
                <div className="filters-row">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select 
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                        >
                            {ACTION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <Calendar size={16} />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            placeholder="Start Date"
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            placeholder="End Date"
                        />
                    </div>

                    <div className="search-group">
                        <Search size={16} />
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            placeholder="Search logs..."
                        />
                    </div>
                </div>

                <div className="actions-row">
                    <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="export-btn" onClick={handleExport} disabled={logs.length === 0}>
                        <Download size={16} />
                        Export CSV
                    </button>
                    <div className="log-count">
                        {totalLogs} total log{totalLogs !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-message">Loading audit logs...</div>
            ) : (
                <>
                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>Moderator</th>
                                    <th>Target</th>
                                    <th>Reason</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id}>
                                        <td className="timestamp-cell">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="action-cell">
                                            <span className={`action-badge action-${log.action.replace(/_/g, '-')}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="moderator-cell">
                                            {log.moderatorId ? (
                                                <>
                                                    <div className="moderator-name">
                                                        {log.moderatorId.personalName || 
                                                         log.moderatorId.breederName || 
                                                         'Unknown'}
                                                    </div>
                                                    <div className="moderator-id">
                                                        {log.moderatorId.id_public}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="system-action">System</span>
                                            )}
                                        </td>
                                        <td className="target-cell">
                                            {log.targetUserId ? (
                                                <>
                                                    <div className="target-name">
                                                        {log.targetUserId.personalName || 
                                                         log.targetUserId.breederName || 
                                                         'Unknown'}
                                                    </div>
                                                    <div className="target-id">
                                                        {log.targetUserId.id_public}
                                                    </div>
                                                </>
                                            ) : log.targetAnimalId ? (
                                                <>
                                                    <div className="target-name">
                                                        {log.targetAnimalId.name || 'Unknown Animal'}
                                                    </div>
                                                    <div className="target-id">
                                                        {log.targetAnimalId.id_public}
                                                    </div>
                                                </>
                                            ) : log.targetName ? (
                                                <div className="target-name">{log.targetName}</div>
                                            ) : (
                                                <span className="no-target">N/A</span>
                                            )}
                                        </td>
                                        <td className="reason-cell">
                                            {log.reason || log.details?.reason || '—'}
                                        </td>
                                        <td className="details-cell">
                                            {(() => {
                                                const details = log.details || {};
                                                const parts = [];
                                                if (details.newStatus) parts.push(details.newStatus);
                                                if (details.durationDays) parts.push(`${details.durationDays} days`);
                                                if (details.warningCategory) parts.push(details.warningCategory);
                                                if (details.warningCount) parts.push(`Warning #${details.warningCount}`);
                                                if (details.resolution) parts.push(details.resolution);
                                                return parts.length > 0 ? parts.join(' • ') : '—';
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {logs.length === 0 && (
                            <div className="no-results">
                                No audit logs found matching your filters.
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            
                            <div className="page-info">
                                Page {page} of {totalPages}
                            </div>

                            <button
                                className="page-btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AuditLogViewer;
