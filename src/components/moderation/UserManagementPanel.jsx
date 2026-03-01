import React, { useState, useEffect } from 'react';
import { 
    Shield, AlertTriangle, Eye, Search, Filter, X, Ban, Clock, CheckCircle, UserCog, RefreshCw,
    ChevronUp, ChevronDown, Users, Calendar, MessageSquare, PawPrint, Activity, LogIn
} from 'lucide-react';
import axios from 'axios';
import { parseApiError, withRetry } from '../../utils/errorHandler';
import './UserManagementPanel.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const UserManagementPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState('user');
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [badgeUser, setBadgeUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchCurrentUserRole();
    }, []);

    const fetchCurrentUserRole = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/moderation/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUserRole(response.data?.role || 'user');
        } catch (err) {
            console.error('Error fetching current user role:', err);
        }
    };

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

    const handleDonationBadge = async (userId, type) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.patch(
                `${API_URL}/admin/users/${userId}/donation-badge`,
                { type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
            setShowBadgeModal(false);
            setBadgeUser(null);
        } catch (err) {
            console.error('Error updating donation badge:', err);
        }
    };

    const handleWarnUser = async (userId, reason, category) => {
        try {
            const token = localStorage.getItem('authToken');
            await withRetry(async () => {
                await axios.post(
                    `${API_URL}/moderation/users/${userId}/warn`,
                    { reason, category },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            });
            await fetchUsers();
            return { success: true };
        } catch (err) {
            const errorInfo = parseApiError(err);
            return { 
                success: false, 
                error: errorInfo.message,
                isRetryable: errorInfo.isRetryable,
                errorCode: errorInfo.errorCode
            };
        }
    };

    const handleSuspendUser = async (userId, reason, durationDays) => {
        try {
            const token = localStorage.getItem('authToken');
            await withRetry(async () => {
                await axios.post(
                    `${API_URL}/moderation/users/${userId}/status`,
                    { status: 'suspended', reason, durationDays: parseInt(durationDays) },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            });
            await fetchUsers();
            return { success: true };
        } catch (err) {
            const errorInfo = parseApiError(err);
            return { 
                success: false, 
                error: errorInfo.message,
                isRetryable: errorInfo.isRetryable,
                errorCode: errorInfo.errorCode
            };
        }
    };

    const handleBanUser = async (userId, reason, ipBan = false) => {
        try {
            const token = localStorage.getItem('authToken');
            await withRetry(async () => {
                await axios.post(
                    `${API_URL}/moderation/users/${userId}/status`,
                    { status: 'banned', reason, ipBan },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            });
            await fetchUsers();
            return { success: true };
        } catch (err) {
            const errorInfo = parseApiError(err);
            return { 
                success: false, 
                error: errorInfo.message,
                isRetryable: errorInfo.isRetryable,
                errorCode: errorInfo.errorCode
            };
        }
    };

    const handleLiftSuspension = async (userId) => {
        if (!window.confirm('Are you sure you want to lift this suspension?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/moderation/users/${userId}/status`,
                { status: 'normal', reason: 'Suspension lifted by moderator' },
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
                { status: 'normal', reason: 'Ban lifted by moderator' },
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

    const handleChangeRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.patch(
                `${API_URL}/admin/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchUsers();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to change role' };
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return formatDate(date).split(',')[0]; // Just date
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? 
            <ChevronUp size={14} className="sort-icon" /> : 
            <ChevronDown size={14} className="sort-icon" />;
    };

    const filteredUsers = users
        .filter(user => {
            const matchesSearch = !searchTerm || 
                user.personalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.breederName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id_public?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter;
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            
            return matchesSearch && matchesStatus && matchesRole;
        })
        .sort((a, b) => {
            const { key, direction } = sortConfig;
            let aVal = a[key];
            let bVal = b[key];
            
            // Handle null/undefined
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';
            
            // Handle dates
            if (key === 'createdAt' || key === 'lastLoginDate') {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }
            
            // Handle numbers
            if (key === 'warningCount') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            }
            
            // Handle strings (case-insensitive)
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
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
                        <option value="normal">Normal</option>
                        <option value="warned">Warned</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>

                <div className="role-filters">
                    <Users size={18} />
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="moderator">Moderators</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                <div className="user-count">
                    <Users size={16} />
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => handleSort('id_public')}>
                                ID {getSortIcon('id_public')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('personalName')}>
                                Name {getSortIcon('personalName')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('email')}>
                                Email {getSortIcon('email')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('accountStatus')}>
                                Status {getSortIcon('accountStatus')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('warningCount')}>
                                Warnings {getSortIcon('warningCount')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('last_login')}>
                                Last Login {getSortIcon('last_login')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td className="user-id">{user.id_public}</td>
                                <td className="user-name">
                                    {user.personalName || user.breederName || 'No Name'}
                                    {user.role !== 'user' && (
                                        <Shield size={14} className={`role-icon ${user.role}`} />
                                    )}
                                </td>
                                <td className="user-email">{user.email}</td>

                                <td className="status-cell">
                                    <span className={`status-text status-${user.accountStatus || 'normal'}`}>
                                        {(user.accountStatus || 'normal') === 'normal' ? 'NORMAL' : (user.accountStatus || 'normal').toUpperCase()}
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

                                <td className="data-cell last-login-cell">
                                    {user.last_login ? (
                                        <span title={formatDate(user.last_login)}>
                                            {formatRelativeTime(user.last_login)}
                                        </span>
                                    ) : (
                                        <span className="never-logged">Never</span>
                                    )}
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
                                    
                                    {currentUserRole === 'admin' && (
                                        <button
                                            className="action-btn role-btn"
                                            onClick={() => openActionModal(user, 'role')}
                                            title="Change role"
                                        >
                                            <UserCog size={14} />
                                        </button>
                                    )}
                                    {currentUserRole === 'admin' && (
                                        <button
                                            className="action-btn"
                                            style={{ background: user.monthlyDonationActive ? '#7c3aed' : user.lastDonationDate ? '#16a34a' : '#e5e7eb', color: (user.monthlyDonationActive || user.lastDonationDate) ? '#fff' : '#374151' }}
                                            onClick={() => { setBadgeUser(user); setShowBadgeModal(true); }}
                                            title="Manage donation badge"
                                        >
                                            {user.monthlyDonationActive ? '💎' : user.lastDonationDate ? '🎁' : '🏅'}
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

            {showBadgeModal && badgeUser && (
                <div className="modal-overlay" onClick={() => { setShowBadgeModal(false); setBadgeUser(null); }}>
                    <div className="modal-content action-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
                        <div className="modal-header">
                            <h3>Donation Badge</h3>
                            <button className="close-btn" onClick={() => { setShowBadgeModal(false); setBadgeUser(null); }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="target-user" style={{ marginBottom: 16 }}>
                                <strong>{badgeUser.personalName || badgeUser.breederName || 'Unknown'}</strong>
                                <span className="user-id">{badgeUser.id_public}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                                Current: {badgeUser.monthlyDonationActive ? '💎 Monthly Supporter' : badgeUser.lastDonationDate ? '🎁 Recent Donor (gift)' : 'No badge'}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button className="action-btn" style={{ background: '#7c3aed', color: '#fff', padding: '8px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDonationBadge(badgeUser._id, 'monthly')}>
                                    💎 Grant / Toggle Monthly Supporter
                                </button>
                                <button className="action-btn" style={{ background: '#16a34a', color: '#fff', padding: '8px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDonationBadge(badgeUser._id, 'gift')}>
                                    🎁 Grant Gift Badge (31 days)
                                </button>
                                <button className="action-btn" style={{ background: '#dc2626', color: '#fff', padding: '8px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDonationBadge(badgeUser._id, 'clear')}>
                                    🗑 Clear All Badges
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
                    onChangeRole={handleChangeRole}
                />
            )}
        </div>
    );
};

// Modal for performing moderation actions (warn, suspend, ban, role change)
const ModerationActionModal = ({ user, actionType, onClose, onWarn, onSuspend, onBan, onChangeRole }) => {
    const [reason, setReason] = useState('');
    const [category, setCategory] = useState('general');
    const [duration, setDuration] = useState('7');
    const [ipBan, setIpBan] = useState(false);
    const [newRole, setNewRole] = useState(user.role || 'user');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isRetryable, setIsRetryable] = useState(false);
    const [lastAction, setLastAction] = useState(null);

    const handleSubmit = async () => {
        if (actionType !== 'role' && !reason.trim()) {
            setError('Please provide a reason');
            setIsRetryable(false);
            return;
        }

        setSubmitting(true);
        setError('');
        setIsRetryable(false);

        // Store action params for potential retry
        setLastAction({ userId: user._id, reason, category, duration, ipBan, newRole });

        let result;
        if (actionType === 'warn') {
            result = await onWarn(user._id, reason, category);
        } else if (actionType === 'suspend') {
            result = await onSuspend(user._id, reason, duration);
        } else if (actionType === 'ban') {
            result = await onBan(user._id, reason, ipBan);
        } else if (actionType === 'role') {
            if (newRole === user.role) {
                setError('Please select a different role');
                setSubmitting(false);
                return;
            }
            result = await onChangeRole(user._id, newRole);
        }

        setSubmitting(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
            setIsRetryable(result.isRetryable || false);
        }
    };

    const handleRetry = () => {
        if (lastAction) {
            handleSubmit();
        }
    };

    const titles = {
        warn: 'Issue Warning',
        suspend: 'Suspend User',
        ban: 'Ban User',
        role: 'Change User Role'
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
                        {actionType === 'role' && (
                            <span className={`current-role role-badge ${user.role}`}>
                                Current: {user.role}
                            </span>
                        )}
                    </div>

                    {error && (
                        <div className="modal-error">
                            <span>{error}</span>
                            {isRetryable && (
                                <button 
                                    className="retry-btn" 
                                    onClick={handleRetry}
                                    disabled={submitting}
                                    title="Try again"
                                >
                                    <RefreshCw size={14} /> Retry
                                </button>
                            )}
                        </div>
                    )}

                    {actionType === 'role' && (
                        <div className="form-group">
                            <label>New Role</label>
                            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="form-hint">
                                {newRole === 'moderator' && 'Moderators can review reports, warn users, and manage content.'}
                                {newRole === 'admin' && 'Admins have full access including role management and system settings.'}
                                {newRole === 'user' && 'Regular user with no moderation privileges.'}
                            </p>
                        </div>
                    )}

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

                    {actionType !== 'role' && (
                        <div className="form-group">
                            <label>Reason *</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain the reason for this action..."
                                rows={4}
                            />
                        </div>
                    )}
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
    const [activeTab, setActiveTab] = useState('timeline');
    
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return formatDate(date).split(',')[0];
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

    // Build unified timeline from all events
    const buildTimeline = () => {
        const events = [];
        
        // Add account creation
        if (localUser.creationDate) {
            events.push({
                type: 'account_created',
                date: new Date(localUser.creationDate),
                icon: 'user',
                title: 'Account Created',
                color: 'blue'
            });
        }

        // Add warnings
        (localUser.warnings || []).forEach((warning, idx) => {
            events.push({
                type: 'warning',
                date: new Date(warning.date),
                icon: 'warning',
                title: warning.isLifted ? 'Warning (Lifted)' : 'Warning Issued',
                subtitle: warning.category || 'General',
                description: warning.reason,
                color: warning.isLifted ? 'gray' : 'yellow',
                warningIndex: idx,
                isLifted: warning.isLifted
            });
        });

        // Add moderation actions
        (localUser.moderationHistory || []).forEach(action => {
            const actionLabels = {
                user_warned: 'Warning Issued',
                user_suspended: 'Account Suspended',
                user_banned: 'Account Banned',
                user_activated: 'Account Activated',
                warning_lifted: 'Warning Lifted',
                suspension_lifted: 'Suspension Lifted',
                ban_lifted: 'Ban Lifted'
            };
            events.push({
                type: 'moderation',
                date: new Date(action.timestamp),
                icon: 'shield',
                title: actionLabels[action.action] || action.action.replace(/_/g, ' '),
                subtitle: `By ${action.moderatorEmail || 'Unknown'}`,
                description: action.reason || action.details?.reason,
                color: action.action.includes('banned') ? 'red' : 
                       action.action.includes('suspended') ? 'orange' : 
                       action.action.includes('lifted') ? 'green' : 'purple'
            });
        });

        // Add reports
        (localUser.recentReports || []).forEach(report => {
            events.push({
                type: 'report',
                date: new Date(report.createdAt),
                icon: 'flag',
                title: 'Report Filed',
                subtitle: report.category || 'Unknown',
                description: report.reason,
                status: report.status,
                color: report.status === 'resolved' ? 'green' : 
                       report.status === 'dismissed' ? 'gray' : 'red'
            });
        });

        // Sort by date descending
        return events.sort((a, b) => b.date - a.date);
    };

    const timeline = buildTimeline();

    const getTimelineIcon = (event) => {
        switch (event.icon) {
            case 'warning': return <AlertTriangle size={16} />;
            case 'shield': return <Shield size={16} />;
            case 'flag': return <AlertTriangle size={16} />;
            case 'user': return <Users size={16} />;
            default: return <Activity size={16} />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>User History & Timeline</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* User Info Section with Metrics */}
                <div className="user-info-section">
                    <div className="user-info-header">
                        <div>
                            <h4>{localUser.personalName || localUser.breederName || 'Unknown User'}</h4>
                            <p>{localUser.email} · {localUser.id_public}</p>
                            <span className={`status-badge status-${localUser.accountStatus || 'normal'}`}>
                                {(localUser.accountStatus || 'normal').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="user-metrics-grid">
                        <div className="metric-card">
                            <PawPrint size={18} />
                            <div className="metric-value">{localUser.metrics?.animalCount || 0}</div>
                            <div className="metric-label">Animals</div>
                        </div>
                        <div className="metric-card">
                            <MessageSquare size={18} />
                            <div className="metric-value">{localUser.metrics?.messageCount || 0}</div>
                            <div className="metric-label">Messages</div>
                        </div>
                        <div className="metric-card">
                            <AlertTriangle size={18} />
                            <div className="metric-value">{localUser.warnings?.filter(w => !w.isLifted).length || 0}</div>
                            <div className="metric-label">Warnings</div>
                        </div>
                        <div className="metric-card">
                            <LogIn size={18} />
                            <div className="metric-value">{formatRelativeTime(localUser.last_login)}</div>
                            <div className="metric-label">Last Login</div>
                        </div>
                    </div>
                    
                    {localUser.last_login_ip && (
                        <div className="last-login-ip">
                            Last IP: <code>{localUser.last_login_ip}</code>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="history-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <Activity size={16} /> Timeline
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'warnings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('warnings')}
                    >
                        <AlertTriangle size={16} /> Warnings ({localUser.warnings?.length || 0})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <Shield size={16} /> Reports ({localUser.recentReports?.length || 0})
                    </button>
                </div>

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                    <div className="timeline-container">
                        {timeline.length > 0 ? (
                            <div className="timeline">
                                {timeline.map((event, idx) => (
                                    <div key={idx} className={`timeline-item timeline-${event.color}`}>
                                        <div className="timeline-marker">
                                            {getTimelineIcon(event)}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-title">{event.title}</span>
                                                <span className="timeline-date">{formatRelativeTime(event.date)}</span>
                                            </div>
                                            {event.subtitle && (
                                                <div className="timeline-subtitle">{event.subtitle}</div>
                                            )}
                                            {event.description && (
                                                <div className="timeline-description">{event.description}</div>
                                            )}
                                            {event.status && (
                                                <span className={`timeline-status status-${event.status}`}>
                                                    {event.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-items">No activity recorded</div>
                        )}
                    </div>
                )}

                {/* Warnings Tab */}
                {activeTab === 'warnings' && (
                    <div className="history-section">
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
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="history-section">
                        {localUser.recentReports && localUser.recentReports.length > 0 ? (
                            localUser.recentReports.map((report, idx) => (
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
                            ))
                        ) : (
                            <div className="no-items">No reports on record</div>
                        )}
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
