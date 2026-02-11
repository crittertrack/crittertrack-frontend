import React, { useState, useEffect } from 'react';
import { 
    Bug, RefreshCw, Search, Filter, AlertCircle, CheckCircle, 
    Clock, XCircle, Eye, MessageSquare, ExternalLink, ChevronDown,
    Loader2, User, Calendar, Globe, Tag
} from 'lucide-react';
import './BugReportsTab.css';

const BugReportsTab = ({ API_BASE_URL, authToken }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    // Fetch bug reports
    const fetchReports = async () => {
        console.log('[BugReportsTab] fetchReports called');
        console.log('[BugReportsTab] API_BASE_URL:', API_BASE_URL);
        console.log('[BugReportsTab] authToken:', authToken ? 'present' : 'missing');
        
        setLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}/bug-reports/admin`;
            console.log('[BugReportsTab] Fetching from:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            console.log('[BugReportsTab] Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to fetch bug reports');
            }
            
            const data = await response.json();
            console.log('[BugReportsTab] Received reports:', data.length);
            setReports(data);
        } catch (err) {
            console.error('[BugReportsTab] Error fetching bug reports:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchReports();
        }
    }, [authToken, API_BASE_URL]);

    // Update report status
    const updateStatus = async (reportId, newStatus) => {
        setUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/bug-reports/${reportId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    adminNotes: adminNotes || undefined
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            
            // Refresh reports
            await fetchReports();
            setSelectedReport(null);
            setAdminNotes('');
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    // Get unique categories from reports
    const categories = [...new Set(reports.map(r => r.category).filter(Boolean))];

    // Filter reports
    const filteredReports = reports.filter(report => {
        const matchesSearch = 
            report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.page?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            pending: { icon: Clock, color: 'yellow', label: 'Pending' },
            'in-progress': { icon: Loader2, color: 'blue', label: 'In Progress' },
            resolved: { icon: CheckCircle, color: 'green', label: 'Resolved' },
            dismissed: { icon: XCircle, color: 'gray', label: 'Dismissed' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
            <span className={`bug-status-badge bug-status-${config.color}`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    // Stats summary
    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        inProgress: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length
    };

    if (loading && reports.length === 0) {
        return (
            <div className="bug-reports-loading">
                <Loader2 className="spin" size={32} />
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="bug-reports-tab">
            <div className="bug-reports-header">
                <div className="bug-reports-title">
                    <Bug size={28} />
                    <div>
                        <h2>Bug Reports & Feedback</h2>
                        <p>Review and manage user-submitted reports</p>
                    </div>
                </div>
                <button 
                    className="bug-refresh-btn"
                    onClick={fetchReports}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="bug-stats-grid">
                <div className="bug-stat-card">
                    <div className="bug-stat-value">{stats.total}</div>
                    <div className="bug-stat-label">Total</div>
                </div>
                <div className="bug-stat-card bug-stat-yellow">
                    <div className="bug-stat-value">{stats.pending}</div>
                    <div className="bug-stat-label">Pending</div>
                </div>
                <div className="bug-stat-card bug-stat-blue">
                    <div className="bug-stat-value">{stats.inProgress}</div>
                    <div className="bug-stat-label">In Progress</div>
                </div>
                <div className="bug-stat-card bug-stat-green">
                    <div className="bug-stat-value">{stats.resolved}</div>
                    <div className="bug-stat-label">Resolved</div>
                </div>
                <div className="bug-stat-card bug-stat-gray">
                    <div className="bug-stat-value">{stats.dismissed}</div>
                    <div className="bug-stat-label">Dismissed</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bug-filters">
                <div className="bug-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bug-filter-group">
                    <Filter size={18} />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>
                <div className="bug-filter-group">
                    <Tag size={18} />
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bug-error-banner">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Reports List */}
            <div className="bug-reports-list">
                {filteredReports.length === 0 ? (
                    <div className="bug-empty-state">
                        <Bug size={48} />
                        <h3>No bug reports found</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No bug reports have been submitted yet'}
                        </p>
                    </div>
                ) : (
                    filteredReports.map(report => (
                        <div 
                            key={report._id} 
                            className={`bug-report-card ${selectedReport?._id === report._id ? 'selected' : ''}`}
                            onClick={() => setSelectedReport(selectedReport?._id === report._id ? null : report)}
                        >
                            <div className="bug-report-header">
                                <div className="bug-report-meta">
                                    <span className="bug-category-tag">{report.category}</span>
                                    <StatusBadge status={report.status} />
                                </div>
                                <span className="bug-report-date">
                                    <Calendar size={14} />
                                    {new Date(report.createdAt).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                            
                            <div className="bug-report-body">
                                <p className="bug-description">{report.description}</p>
                            </div>
                            
                            <div className="bug-report-footer">
                                <div className="bug-user-info">
                                    <User size={14} />
                                    <span>{report.userName || 'Unknown User'}</span>
                                    <span className="bug-user-email">{report.userEmail}</span>
                                </div>
                                {report.page && (
                                    <div className="bug-page-info">
                                        <Globe size={14} />
                                        <span>{report.page}</span>
                                    </div>
                                )}
                            </div>

                            {/* Expanded Details */}
                            {selectedReport?._id === report._id && (
                                <div className="bug-report-expanded">
                                    <div className="bug-divider"></div>
                                    
                                    {report.adminNotes && (
                                        <div className="bug-admin-notes-display">
                                            <strong>Admin Notes:</strong>
                                            <p>{report.adminNotes}</p>
                                        </div>
                                    )}
                                    
                                    <div className="bug-action-section">
                                        <label>Add/Update Admin Notes:</label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this bug report..."
                                            rows={3}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    
                                    <div className="bug-action-buttons">
                                        <button
                                            className="bug-action-btn bug-btn-progress"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(report._id, 'in-progress');
                                            }}
                                            disabled={updating || report.status === 'in-progress'}
                                        >
                                            <Loader2 size={16} />
                                            Mark In Progress
                                        </button>
                                        <button
                                            className="bug-action-btn bug-btn-resolve"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(report._id, 'resolved');
                                            }}
                                            disabled={updating || report.status === 'resolved'}
                                        >
                                            <CheckCircle size={16} />
                                            Mark Resolved
                                        </button>
                                        <button
                                            className="bug-action-btn bug-btn-dismiss"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(report._id, 'dismissed');
                                            }}
                                            disabled={updating || report.status === 'dismissed'}
                                        >
                                            <XCircle size={16} />
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BugReportsTab;
