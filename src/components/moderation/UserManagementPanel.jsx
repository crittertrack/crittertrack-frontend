import React, { useState, useEffect } from 'react';
import { 
    Shield, AlertTriangle, Eye, Search, Filter 
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
            // Backend returns { users: [...] } so extract the users array
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

    const handleLiftSuspension = async (userId) => {
        if (!window.confirm('Are you sure you want to lift this suspension?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/lift-suspension`,
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
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/lift-ban`,
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

                                <td className="data-cell">
                                    {user.moderationHistory && user.moderationHistory.length > 0 ? (
                                        <div className="last-action">
                                            <div>{user.moderationHistory[0].action.replace(/_/g, ' ')}</div>
                                            <div className="action-date">{formatDate(user.moderationHistory[0].timestamp)}</div>
                                        </div>
                                    ) : (
                                        'None'
                                    )}
                                </td>

                                <td className="actions-cell">
                                    <button
                                        className="action-btn history-btn"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowHistoryModal(true);
                                        }}
                                    >
                                        <Eye size={14} />
                                        History
                                    </button>
                                    {user.accountStatus === 'suspended' && (
                                        <button
                                            className="action-btn lift-btn"
                                            onClick={() => handleLiftSuspension(user._id)}
                                        >
                                            Lift
                                        </button>
                                    )}
                                    {user.accountStatus === 'banned' && (
                                        <button
                                            className="action-btn lift-btn"
                                            onClick={() => handleLiftBan(user._id)}
                                        >
                                            Unban
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
                    <span className={`status-text status-${user.accountStatus || 'active'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                        {(user.accountStatus || 'active').toUpperCase()}
                    </span>
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
