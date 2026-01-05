import React, { useState, useEffect } from 'react';
import { 
    Shield, ShieldOff, AlertTriangle, Clock, Ban, UserX, 
    Eye, EyeOff, CheckCircle, XCircle, Search, Filter 
} from 'lucide-react';
import axios from 'axios';
import './UserManagementPanel.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_COLORS = {
    active: '#4caf50',
    warned: '#ff9800',
    suspended: '#f44336',
    banned: '#000000'
};

const UserManagementPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/users/moderation-overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLiftSuspension = async (userId) => {
        if (!window.confirm('Are you sure you want to lift this suspension?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/moderation/lift-suspension`,
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to lift suspension');
        }
    };

    const handleLiftBan = async (userId) => {
        if (!window.confirm('Are you sure you want to lift this ban?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/moderation/lift-ban`,
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to lift ban');
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
                    Monitor and manage user accounts, moderation actions, and account status
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
                            <th>Last Action</th>
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
                                    <div className="user-details">
                                        <span className="user-ctu">{user.id_public}</span>
                                        {user.role === 'admin' && (
                                            <span className="role-badge admin">Admin</span>
                                        )}
                                        {user.role === 'moderator' && (
                                            <span className="role-badge moderator">Mod</span>
                                        )}
                                    </div>
                                    <div className="user-email">{user.email}</div>
                                </td>

                                <td>
                                    <div 
                                        className="status-badge"
                                        style={{ 
                                            backgroundColor: STATUS_COLORS[user.accountStatus] || '#666' 
                                        }}
                                    >
                                        {user.accountStatus === 'active' && <CheckCircle size={14} />}
                                        {user.accountStatus === 'warned' && <AlertTriangle size={14} />}
                                        {user.accountStatus === 'suspended' && <Clock size={14} />}
                                        {user.accountStatus === 'banned' && <Ban size={14} />}
                                        {user.accountStatus}
                                    </div>

                                    {user.suspensionExpiry && new Date(user.suspensionExpiry) > new Date() && (
                                        <div className="expiry-info">
                                            Until {formatDate(user.suspensionExpiry)}
                                        </div>
                                    )}

                                    {user.accountStatus === 'banned' && user.banReason && (
                                        <div className="ban-reason">
                                            {user.banReason}
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {user.warnings && user.warnings.length > 0 ? (
                                        <div className="warnings-cell">
                                            <span className="warning-count">
                                                {user.warnings.length} warning{user.warnings.length !== 1 ? 's' : ''}
                                            </span>
                                            {user.warnings.slice(0, 2).map((warning, idx) => (
                                                <div key={idx} className="warning-item">
                                                    <div className="warning-reason">{warning.reason}</div>
                                                    <div className="warning-date">
                                                        {formatDate(warning.date)}
                                                    </div>
                                                </div>
                                            ))}
                                            {user.warnings.length > 2 && (
                                                <button 
                                                    className="view-more-btn"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowHistoryModal(true);
                                                    }}
                                                >
                                                    +{user.warnings.length - 2} more
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="no-data">None</span>
                                    )}
                                </td>

                                <td>
                                    <div className="reports-cell">
                                        {user.reportCounts?.total > 0 ? (
                                            <>
                                                <div className="report-count">
                                                    {user.reportCounts.total} total
                                                </div>
                                                <div className="report-breakdown">
                                                    {user.reportCounts.pending > 0 && (
                                                        <span className="pending-reports">
                                                            {user.reportCounts.pending} pending
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="no-data">None</span>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    {user.moderationHistory && user.moderationHistory.length > 0 ? (
                                        <div className="last-action-cell">
                                            <div className="action-type">
                                                {user.moderationHistory[0].action.replace(/_/g, ' ')}
                                            </div>
                                            <div className="action-date">
                                                {formatDate(user.moderationHistory[0].timestamp)}
                                            </div>
                                            <div className="action-by">
                                                By {user.moderationHistory[0].moderatorId?.personalName || 
                                                    user.moderationHistory[0].moderatorId?.breederName || 
                                                    'Unknown'}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="no-data">None</span>
                                    )}
                                </td>

                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view-history"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowHistoryModal(true);
                                            }}
                                            title="View full moderation history"
                                        >
                                            <Eye size={16} />
                                            History
                                        </button>

                                        {user.accountStatus === 'suspended' && (
                                            <button
                                                className="action-btn lift-suspension"
                                                onClick={() => handleLiftSuspension(user._id)}
                                                title="Lift suspension"
                                            >
                                                <CheckCircle size={16} />
                                                Lift
                                            </button>
                                        )}

                                        {user.accountStatus === 'banned' && (
                                            <button
                                                className="action-btn lift-ban"
                                                onClick={() => handleLiftBan(user._id)}
                                                title="Lift ban"
                                            >
                                                <CheckCircle size={16} />
                                                Unban
                                            </button>
                                        )}
                                    </div>
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
                />
            )}
        </div>
    );
};

const UserHistoryModal = ({ user, onClose }) => {
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Moderation History</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="user-info-section">
                    <h4>{user.personalName || user.breederName || 'Unknown User'}</h4>
                    <p>{user.email} · {user.id_public}</p>
                    <div 
                        className="status-badge"
                        style={{ 
                            backgroundColor: STATUS_COLORS[user.accountStatus] || '#666',
                            display: 'inline-flex',
                            marginTop: '8px'
                        }}
                    >
                        {user.accountStatus}
                    </div>
                </div>

                {user.warnings && user.warnings.length > 0 && (
                    <div className="history-section">
                        <h4>
                            <AlertTriangle size={18} />
                            Warnings ({user.warnings.length})
                        </h4>
                        {user.warnings.map((warning, idx) => (
                            <div key={idx} className="history-item warning-item">
                                <div className="history-reason">{warning.reason}</div>
                                <div className="history-date">{formatDate(warning.date)}</div>
                            </div>
                        ))}
                    </div>
                )}

                {user.moderationHistory && user.moderationHistory.length > 0 && (
                    <div className="history-section">
                        <h4>
                            <Shield size={18} />
                            Moderation Actions ({user.moderationHistory.length})
                        </h4>
                        {user.moderationHistory.map((action, idx) => (
                            <div key={idx} className="history-item action-item">
                                <div className="action-header">
                                    <span className="action-type">
                                        {action.action.replace(/_/g, ' ')}
                                    </span>
                                    <span className="action-date">
                                        {formatDate(action.timestamp)}
                                    </span>
                                </div>
                                <div className="action-moderator">
                                    By {action.moderatorId?.personalName || 
                                        action.moderatorId?.breederName || 
                                        'Unknown'}
                                </div>
                                {action.details && (
                                    <div className="action-details">
                                        {typeof action.details === 'string' 
                                            ? action.details 
                                            : JSON.stringify(action.details, null, 2)
                                        }
                                    </div>
                                )}
                                {action.ipAddress && (
                                    <div className="action-ip">
                                        IP: {action.ipAddress}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {user.recentReports && user.recentReports.length > 0 && (
                    <div className="history-section">
                        <h4>
                            <AlertTriangle size={18} />
                            Recent Reports ({user.reportCounts?.total || 0})
                        </h4>
                        {user.recentReports.slice(0, 5).map((report, idx) => (
                            <div key={idx} className="history-item report-item">
                                <div className="report-header">
                                    <span className="report-type">{report.category}</span>
                                    <span className="report-status" style={{
                                        color: report.status === 'pending' ? '#ff6f00' : 
                                               report.status === 'resolved' ? '#4caf50' : '#666'
                                    }}>
                                        {report.status}
                                    </span>
                                </div>
                                <div className="report-reason">{report.reason}</div>
                                <div className="report-date">{formatDate(report.createdAt)}</div>
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
