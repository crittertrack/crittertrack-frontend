import React, { useState, useEffect } from 'react';
import { 
    MessageCircle, RefreshCw, Search, Filter, AlertCircle, CheckCircle, 
    Clock, XCircle, Eye, Loader2, User, Calendar, Dna, FlaskConical,
    ChevronDown, Tag, FileText
} from 'lucide-react';
import './FeedbackTab.css';

const FeedbackTab = ({ API_BASE_URL, authToken }) => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    // Fetch feedback
    const fetchFeedback = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching feedback from:', `${API_BASE_URL}/genetics-feedback/admin`);
            
            const response = await fetch(`${API_BASE_URL}/genetics-feedback/admin`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            console.log('Feedback fetch response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Feedback fetch failed:', errorData);
                
                let errorMessage = errorData.error || errorData.message || `Failed to fetch feedback (${response.status})`;
                if (response.status === 403) {
                    errorMessage = 'Access denied. Admin or moderator privileges required.';
                } else if (response.status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('Feedback data received:', data);
            setFeedback(data);
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError(err.message || 'Failed to fetch feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchFeedback();
        }
    }, [authToken, API_BASE_URL]);

    // Update feedback status
    const updateStatus = async (feedbackId, newStatus) => {
        setUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/genetics-feedback/${feedbackId}/status`, {
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
            
            // Refresh feedback
            await fetchFeedback();
            setSelectedFeedback(null);
            setAdminNotes('');
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    // Filter feedback
    const filteredFeedback = feedback.filter(item => {
        const matchesSearch = 
            item.phenotype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.genotype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.User?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.User?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            pending: { icon: Clock, color: 'yellow', label: 'Pending' },
            reviewed: { icon: Eye, color: 'blue', label: 'Reviewed' },
            resolved: { icon: CheckCircle, color: 'green', label: 'Resolved' },
            dismissed: { icon: XCircle, color: 'gray', label: 'Dismissed' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
            <span className={`feedback-status-badge feedback-status-${config.color}`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    // Stats summary
    const stats = {
        total: feedback.length,
        pending: feedback.filter(f => f.status === 'pending').length,
        reviewed: feedback.filter(f => f.status === 'reviewed').length,
        resolved: feedback.filter(f => f.status === 'resolved').length
    };

    if (loading && feedback.length === 0) {
        return (
            <div className="feedback-loading">
                <Loader2 className="spin" size={32} />
                <p>Loading feedback...</p>
            </div>
        );
    }

    return (
        <div className="feedback-tab">
            <div className="feedback-header">
                <div className="feedback-title">
                    <Dna size={28} />
                    <div>
                        <h2>Calculator Feedback</h2>
                        <p>Review user feedback on genetics calculator & species data</p>
                    </div>
                </div>
                <button 
                    className="feedback-refresh-btn"
                    onClick={fetchFeedback}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="feedback-stats-grid">
                <div className="feedback-stat-card">
                    <div className="feedback-stat-value">{stats.total}</div>
                    <div className="feedback-stat-label">Total Feedback</div>
                </div>
                <div className="feedback-stat-card feedback-stat-yellow">
                    <div className="feedback-stat-value">{stats.pending}</div>
                    <div className="feedback-stat-label">Pending</div>
                </div>
                <div className="feedback-stat-card feedback-stat-blue">
                    <div className="feedback-stat-value">{stats.reviewed}</div>
                    <div className="feedback-stat-label">Reviewed</div>
                </div>
                <div className="feedback-stat-card feedback-stat-green">
                    <div className="feedback-stat-value">{stats.resolved}</div>
                    <div className="feedback-stat-label">Resolved</div>
                </div>
            </div>

            {/* Filters */}
            <div className="feedback-filters">
                <div className="feedback-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search phenotype, genotype, feedback..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="feedback-filter-group">
                    <Filter size={18} />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="feedback-error-banner">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Feedback List */}
            <div className="feedback-list">
                {filteredFeedback.length === 0 ? (
                    <div className="feedback-empty-state">
                        <Dna size={48} />
                        <h3>No feedback found</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No calculator feedback has been submitted yet'}
                        </p>
                    </div>
                ) : (
                    filteredFeedback.map(item => (
                        <div 
                            key={item.id} 
                            className={`feedback-card ${selectedFeedback?.id === item.id ? 'selected' : ''}`}
                            onClick={() => setSelectedFeedback(selectedFeedback?.id === item.id ? null : item)}
                        >
                            <div className="feedback-card-header">
                                <div className="feedback-meta">
                                    <StatusBadge status={item.status} />
                                </div>
                                <span className="feedback-date">
                                    <Calendar size={14} />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            {/* Genetics Info */}
                            <div className="feedback-genetics-info">
                                <div className="genetics-field">
                                    <FlaskConical size={16} />
                                    <div>
                                        <span className="genetics-label">Phenotype</span>
                                        <span className="genetics-value">{item.phenotype}</span>
                                    </div>
                                </div>
                                <div className="genetics-field">
                                    <Dna size={16} />
                                    <div>
                                        <span className="genetics-label">Genotype</span>
                                        <span className="genetics-value">{item.genotype}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="feedback-body">
                                <div className="feedback-content">
                                    <FileText size={16} />
                                    <p>{item.feedback}</p>
                                </div>
                            </div>
                            
                            <div className="feedback-footer">
                                <div className="feedback-user-info">
                                    <User size={14} />
                                    <span>{item.User?.username || 'Anonymous'}</span>
                                    {item.User?.email && (
                                        <span className="feedback-user-email">{item.User.email}</span>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedFeedback?.id === item.id && (
                                <div className="feedback-expanded">
                                    <div className="feedback-divider"></div>
                                    
                                    {item.adminNotes && (
                                        <div className="feedback-admin-notes-display">
                                            <strong>Admin Notes:</strong>
                                            <p>{item.adminNotes}</p>
                                        </div>
                                    )}
                                    
                                    {item.reviewedAt && (
                                        <div className="feedback-reviewed-info">
                                            <Clock size={14} />
                                            <span>Last reviewed: {new Date(item.reviewedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    <div className="feedback-action-section">
                                        <label>Add/Update Admin Notes:</label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this feedback (e.g., action taken, data updated)..."
                                            rows={3}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    
                                    <div className="feedback-action-buttons">
                                        <button
                                            className="feedback-action-btn feedback-btn-review"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(item.id, 'reviewed');
                                            }}
                                            disabled={updating || item.status === 'reviewed'}
                                        >
                                            <Eye size={16} />
                                            Mark Reviewed
                                        </button>
                                        <button
                                            className="feedback-action-btn feedback-btn-resolve"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(item.id, 'resolved');
                                            }}
                                            disabled={updating || item.status === 'resolved'}
                                        >
                                            <CheckCircle size={16} />
                                            Mark Resolved
                                        </button>
                                        <button
                                            className="feedback-action-btn feedback-btn-dismiss"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateStatus(item.id, 'dismissed');
                                            }}
                                            disabled={updating || item.status === 'dismissed'}
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

export default FeedbackTab;
