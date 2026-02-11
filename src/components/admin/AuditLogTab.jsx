import React, { useState, useEffect } from 'react';
import './AuditLogTab.css';
import DatePicker from '../DatePicker';

export default function AuditLogTab({ API_BASE_URL, authToken }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);
    
    // Filters
    const [filterAction, setFilterAction] = useState('');
    const [filterTargetType, setFilterTargetType] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [limit, setLimit] = useState(50);
    const [skip, setSkip] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [skip, limit]);

    const fetchLogs = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                skip: skip.toString()
            });

            if (filterAction) params.append('action', filterAction);
            if (filterTargetType) params.append('targetType', filterTargetType);
            if (filterStartDate) params.append('startDate', filterStartDate);
            if (filterEndDate) params.append('endDate', filterEndDate);

            const response = await fetch(`${API_BASE_URL}/admin/audit-logs/list?${params}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                let errorMessage;
                try {
                    const data = JSON.parse(text);
                    errorMessage = data.error || `Server error: ${response.status}`;
                } catch {
                    errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setSkip(0); // Reset to first page
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilterAction('');
        setFilterTargetType('');
        setFilterStartDate('');
        setFilterEndDate('');
        setSkip(0);
        setTimeout(fetchLogs, 0);
    };

    const nextPage = () => {
        setSkip(skip + limit);
    };

    const prevPage = () => {
        setSkip(Math.max(0, skip - limit));
    };

    const actionTypes = [
        'user_suspended', 'user_banned', 'user_warned', 'user_unbanned', 'user_activated',
        'user_role_changed', 'user_deleted', 'user_password_reset',
        'content_removed', 'content_edited', 'content_hidden', 'content_restored',
        'report_resolved', 'report_dismissed', 'report_status_changed',
        'setting_changed', 'backup_created', 'backup_restored',
        'broadcast_sent', 'message_sent', 'animal_deleted', 'profile_hidden'
    ];

    const targetTypes = ['user', 'animal', 'profile', 'litter', 'report', 'system', 'setting'];

    const getActionBadgeColor = (action) => {
        if (action.includes('deleted') || action.includes('banned') || action.includes('removed')) {
            return '#f44336'; // Red
        }
        if (action.includes('suspended') || action.includes('warned') || action.includes('hidden')) {
            return '#ff9800'; // Orange
        }
        if (action.includes('activated') || action.includes('restored') || action.includes('resolved')) {
            return '#4caf50'; // Green
        }
        return '#2196f3'; // Blue
    };

    return (
        <div className="audit-log-tab">
            <div className="tab-header">
                <h3>Audit Logs</h3>
                <button onClick={fetchLogs} disabled={loading}>
                    🔄 Refresh
                </button>
            </div>

            <div className="filters">
                <select 
                    value={filterAction} 
                    onChange={(e) => setFilterAction(e.target.value)}
                >
                    <option value="">All Actions</option>
                    {actionTypes.map(action => (
                        <option key={action} value={action}>
                            {action.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>

                <select 
                    value={filterTargetType} 
                    onChange={(e) => setFilterTargetType(e.target.value)}
                >
                    <option value="">All Target Types</option>
                    {targetTypes.map(type => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>

                <DatePicker
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    placeholder="Start Date"
                />

                <DatePicker
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    placeholder="End Date"
                />

                <button onClick={handleFilter} className="btn-filter">
                    Apply Filters
                </button>

                <button onClick={handleClearFilters} className="btn-clear">
                    Clear
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading audit logs...</div>
            ) : (
                <>
                    <div className="logs-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>Moderator</th>
                                    <th>Target</th>
                                    <th>Details</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(log.createdAt).toLocaleString('en-GB')}</td>
                                        <td>
                                            <span 
                                                className="action-badge"
                                                style={{ backgroundColor: getActionBadgeColor(log.action) }}
                                            >
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>{log.moderatorEmail}</td>
                                        <td>
                                            <div>
                                                <strong>{log.targetType}</strong>
                                                {log.targetName && <div className="target-name">{log.targetName}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <details className="log-details">
                                                    <summary>View Details</summary>
                                                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                                </details>
                                            )}
                                        </td>
                                        <td>{log.reason || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {logs.length === 0 && (
                            <div className="no-results">No audit logs found</div>
                        )}
                    </div>

                    <div className="pagination">
                        <div className="pagination-info">
                            Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} logs
                        </div>
                        <div className="pagination-controls">
                            <button onClick={prevPage} disabled={skip === 0}>
                                Previous
                            </button>
                            <button onClick={nextPage} disabled={skip + limit >= total}>
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
