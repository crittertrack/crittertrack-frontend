import React, { useState, useEffect } from 'react';
import { 
    Shield, AlertTriangle, Eye, Search, Filter, X, Ban, Clock, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import './UserManagementPanel.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const UserManagementPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/admin/users/moderation-overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const usersData = response.data?.users || response.data;
            setUsers(Array.isArray(usersData) ? usersData : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWarnUser = async (userId, reason, category) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/warn`,
                { reason, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to warn user' };
        }
    };

    const handleSuspendUser = async (userId, reason, durationDays) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/status`,
                { status: 'suspended', reason, durationDays: parseInt(durationDays) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to suspend user' };
        }
    };

    const handleBanUser = async (userId, reason, ipBan = false) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/status`,
                { status: 'banned', reason, ipBan },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to ban user' };
        }
    };

    const handleLiftSuspension = async (userId) => {
        if (!window.confirm('Are you sure you want to lift this suspension?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/status`,
                { status: 'active', reason: 'Suspension lifted by moderator' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to lift suspension');
        }
    };

    const handleLiftBan = async (userId) => {
        if (!window.confirm('Are you sure you want to lift this ban?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/status`,
                { status: 'active', reason: 'Ban lifted by moderator' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to lift ban');
        }
    };

    const handleLiftWarning = async (userId, warningIndex) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/lift-warning`,
                { warningIndex, reason: 'Warning lifted by moderator' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Failed to lift warning' };
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.personalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.breederName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id_public?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const openActionModal = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setShowActionModal(true);
    };

    if (loading) {
        return (
            <div className="user-management-panel">
                <div className="loading-message">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="user-management-panel">
            <div className="panel-header">
                <h2>
                    <Shield size={24} />
                    User Management
                </h2>
                <p className="panel-subtitle">
                    Monitor and manage user accounts, warnings, suspensions, and bans
                </p>
            </div>

            {error && (
                <div className="error-message">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or CTU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="status-filters">
                    <Filter size={18} />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="warned">Warned</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>

                <div className="user-count">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User Info</th>
                            <th>Status</th>
                            <th>Warnings</th>
                            <th>Reports</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td className="user-info-cell">
                                    <div className="user-name">
                                        {user.personalName || user.breederName || 'No Name'}
                                    </div>
                                    <div className="user-meta">
                                        <span className="user-ctu">{user.id_public}</span>
                                        {user.role !== 'user' && (
                                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                                        )}
                                    </div>
                                    <div className="user-email">{user.email}</div>
                                </td>

                                <td className="status-cell">
                                    <span className={`status-text status-${user.accountStatus || 'active'}`}>
                                        {(user.accountStatus || 'active').toUpperCase()}
                                    </span>
                                    {user.suspensionExpiry && new Date(user.suspensionExpiry) > new Date() && (
                                        <div className="status-detail">
                                            Until {formatDate(user.suspensionExpiry)}
                                        </div>
                                    )}
                                </td>

                                <td className="data-cell">
                                    {user.warningCount > 0 ? user.warningCount : 'None'}
                                </td>

                                <td className="data-cell">
                                    {user.reportCount > 0 ? user.reportCount : 'None'}
                                </td>

                                <td className="actions-cell">
                                    <button
                                        className="action-btn history-btn"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowHistoryModal(true);
                                        }}
                                        title="View history"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    
                                    {user.accountStatus !== 'banned' && (
                                        <>
                                            <button
                                                className="action-btn warn-btn"
                                                onClick={() => openActionModal(user, 'warn')}
                                                title="Issue warning"
                                            >
                                                <AlertTriangle size={14} />
                                            </button>
                                            <button
                                                className="action-btn suspend-btn"
                                                onClick={() => openActionModal(user, 'suspend')}
                                                title="Suspend user"
                                            >
                                                <Clock size={14} />
                                            </button>
                                            <button
                                                className="action-btn ban-btn"
                                                onClick={() => openActionModal(user, 'ban')}
                                                title="Ban user"
                                            >
                                                <Ban size={14} />
                                            </button>
                                        </>
                                    )}
                                    
                                    {user.accountStatus === 'suspended' && (
                                        <button
                                            className="action-btn lift-btn"
                                            onClick={() => handleLiftSuspension(user._id)}
                                            title="Lift suspension"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                    {user.accountStatus === 'banned' && (
                                        <button
                                            className="action-btn lift-btn"
                                            onClick={() => handleLiftBan(user._id)}
                                            title="Lift ban"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="no-results">
                        No users found matching your filters.
                    </div>
                )}
            </div>

            {showHistoryModal && selectedUser && (
                <UserHistoryModal
                    user={selectedUser}
                    onClose={() => {
                        setShowHistoryModal(false);
                        setSelectedUser(null);
                    }}
                    onLiftWarning={handleLiftWarning}
                    onRefresh={fetchUsers}
                />
            )}

            {showActionModal && selectedUser && (
                <ModerationActionModal
                    user={selectedUser}
                    actionType={actionType}
                    onClose={() => {
                        setShowActionModal(false);
                        setSelectedUser(null);
                        setActionType(null);
                    }}
                    onWarn={handleWarnUser}
                    onSuspend={handleSuspendUser}
                    onBan={handleBanUser}
                />
            )}
        </div>
    );
};

// Modal for performing moderation actions (warn, suspend, ban)
const ModerationActionModal = ({ user, actionType, onClose, onWarn, onSuspend, onBan }) => {
    const [reason, setReason] = useState('');
    const [category, setCategory] = useState('general');
    const [duration, setDuration] = useState('7');
    const [ipBan, setIpBan] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason');
            return;
        }

        setSubmitting(true);
        setError('');

        let result;
        if (actionType === 'warn') {
            result = await onWarn(user._id, reason, category);
        } else if (actionType === 'suspend') {
            result = await onSuspend(user._id, reason, duration);
        } else if (actionType === 'ban') {
            result = await onBan(user._id, reason, ipBan);
        }

        setSubmitting(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    const titles = {
        warn: 'Issue Warning',
        suspend: 'Suspend User',
        ban: 'Ban User'
    };

    const categories = [
        { value: 'harassment', label: 'Harassment' },
        { value: 'inappropriate_content', label: 'Inappropriate Content' },
        { value: 'spam', label: 'Spam' },
        { value: 'scam', label: 'Scam/Fraud' },
        { value: 'animal_welfare', label: 'Animal Welfare Concern' },
        { value: 'misinformation', label: 'Misinformation' },
        { value: 'general', label: 'General Violation' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content action-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{titles[actionType]}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="target-user">
                        <strong>{user.personalName || user.breederName || 'Unknown'}</strong>
                        <span className="user-id">{user.id_public}</span>
                    </div>

                    {error && <div className="modal-error">{error}</div>}

                    {actionType === 'warn' && (
                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {actionType === 'suspend' && (
                        <div className="form-group">
                            <label>Duration</label>
                            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                                <option value="1">1 day</option>
                                <option value="3">3 days</option>
                                <option value="7">7 days</option>
                                <option value="14">14 days</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                            </select>
                        </div>
                    )}

                    {actionType === 'ban' && (
                        <div className="form-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={ipBan} 
                                    onChange={(e) => setIpBan(e.target.checked)} 
                                />
                                Also ban IP address
                            </label>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain the reason for this action..."
                            rows={4}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button 
                        className={`btn-primary btn-${actionType}`} 
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Processing...' : titles[actionType]}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal for viewing user history with ability to lift warnings
const UserHistoryModal = ({ user, onClose, onLiftWarning, onRefresh }) => {
    const [localUser, setLocalUser] = useState(user);
    
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLiftWarning = async (index) => {
        if (!window.confirm('Are you sure you want to lift this warning?')) return;
        
        const result = await onLiftWarning(user._id, index);
        if (result.success) {
            const updatedWarnings = [...localUser.warnings];
            updatedWarnings[index] = { ...updatedWarnings[index], isLifted: true };
            setLocalUser({ ...localUser, warnings: updatedWarnings });
            onRefresh();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>User History</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="user-info-section">
                    <h4>{localUser.personalName || localUser.breederName || 'Unknown User'}</h4>
                    <p>{localUser.email} · {localUser.id_public}</p>
                    <span className={`status-text status-${localUser.accountStatus || 'active'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                        {(localUser.accountStatus || 'active').toUpperCase()}
                    </span>
                </div>

                {/* Warnings Section */}
                <div className="history-section">
                    <h4>
                        <AlertTriangle size={18} />
                        Warnings ({localUser.warnings?.filter(w => !w.isLifted).length || 0} active)
                    </h4>
                    {localUser.warnings && localUser.warnings.length > 0 ? (
                        localUser.warnings.map((warning, idx) => (
                            <div key={idx} className={`history-item warning-item ${warning.isLifted ? 'lifted' : ''}`}>
                                <div className="item-header">
                                    <span className="warning-category">{warning.category || 'General'}</span>
                                    {warning.isLifted ? (
                                        <span className="lifted-badge">LIFTED</span>
                                    ) : (
                                        <button 
                                            className="lift-warning-btn"
                                            onClick={() => handleLiftWarning(idx)}
                                            title="Lift this warning"
                                        >
                                            <X size={14} />
                                            Lift
                                        </button>
                                    )}
                                </div>
                                <div className="history-reason">{warning.reason}</div>
                                <div className="history-date">{formatDate(warning.date)}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-items">No warnings on record</div>
                    )}
                </div>

                {/* Moderation History Section */}
                {localUser.moderationHistory && localUser.moderationHistory.length > 0 && (
                    <div className="history-section">
                        <h4>
                            <Shield size={18} />
                            Moderation Actions ({localUser.moderationHistory.length})
                        </h4>
                        {localUser.moderationHistory.map((action, idx) => (
                            <div key={idx} className="history-item action-item">
                                <div className="item-header">
                                    <span className="action-type">
                                        {action.action.replace(/_/g, ' ')}
                                    </span>
                                    <span className="history-date">
                                        {formatDate(action.timestamp)}
                                    </span>
                                </div>
                                <div className="action-moderator">
                                    By {action.moderatorId?.personalName || 
                                        action.moderatorId?.breederName || 
                                        'Unknown'}
                                </div>
                                {action.details?.reason && (
                                    <div className="history-reason">{action.details.reason}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Reports Section */}
                {localUser.recentReports && localUser.recentReports.length > 0 && (
                    <div className="history-section">
                        <h4>
                            <AlertTriangle size={18} />
                            Reports Against User ({localUser.reportCounts?.total || localUser.recentReports.length})
                        </h4>
                        {localUser.recentReports.slice(0, 5).map((report, idx) => (
                            <div key={idx} className="history-item report-item">
                                <div className="item-header">
                                    <span className="report-type">{report.category}</span>
                                    <span className={`report-status status-${report.status}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <div className="history-reason">{report.reason}</div>
                                <div className="history-date">{formatDate(report.createdAt)}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPanel;
