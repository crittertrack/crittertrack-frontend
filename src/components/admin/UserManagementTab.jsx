import React, { useState, useEffect } from 'react';
import './UserManagementTab.css';

export default function UserManagementTab({ API_BASE_URL, authToken }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSummary, setUserSummary] = useState(null);
    const [moderationHistory, setModerationHistory] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
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
            console.log('UserManagementTab: fetched users data:', data);
            // Ensure data is an array before setting
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserSummary = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/summary`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setUserSummary(data);
            }
        } catch (err) {
            console.error('Failed to fetch user summary:', err);
        }
    };

    const fetchModerationHistory = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/moderation-history`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setModerationHistory(data);
            }
        } catch (err) {
            console.error('Failed to fetch moderation history:', err);
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setUserSummary(null);
        setModerationHistory([]);
        await fetchUserSummary(user._id);
        await fetchModerationHistory(user._id);
    };

    const handleChangeStatus = async (userId, newStatus, reason = '') => {
        if (!reason && (newStatus === 'suspended' || newStatus === 'banned')) {
            reason = prompt(`Enter reason for ${newStatus}:`);
            if (!reason) return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ status: newStatus, reason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status');
            }

            alert(`User status updated to: ${newStatus}`);
            fetchUsers();
            if (selectedUser && selectedUser._id === userId) {
                handleViewUser({ ...selectedUser, accountStatus: newStatus });
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!window.confirm(`Change user role to: ${newRole}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update role');
            }

            alert(`User role updated to: ${newRole}`);
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleWarnUser = async (userId) => {
        const reason = prompt('Enter warning reason:');
        if (!reason) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/warn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to warn user');
            }

            alert(data.message);
            fetchUsers();
            if (selectedUser && selectedUser._id === userId) {
                await fetchUserSummary(userId);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.personalName && user.personalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || (user.accountStatus || 'normal') === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const colors = {
            normal: '#4caf50',
            suspended: '#ff9800',
            banned: '#f44336'
        };
        return {
            backgroundColor: colors[status] || colors.normal,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
        };
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: '#9c27b0',
            moderator: '#2196f3',
            user: '#757575'
        };
        return {
            backgroundColor: colors[role] || colors.user,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
        };
    };

    if (selectedUser) {
        return (
            <div className="user-detail-view">
                <button 
                    className="back-button"
                    onClick={() => setSelectedUser(null)}
                >
                    ← Back to Users List
                </button>

                <div className="user-detail-header">
                    <h3>{selectedUser.email}</h3>
                    <div className="user-badges">
                        <span style={getStatusBadge(selectedUser.accountStatus || 'normal')}>
                            {(selectedUser.accountStatus || 'normal') === 'normal' ? 'normal' : selectedUser.accountStatus}
                        </span>
                        <span style={getRoleBadge(selectedUser.role)}>
                            {selectedUser.role}
                        </span>
                    </div>
                </div>

                {userSummary && (
                    <div className="user-summary-grid">
                        <div className="summary-card">
                            <h4>Profile Information</h4>
                            <p><strong>Email:</strong> {userSummary.user.email}</p>
                            <p><strong>Personal Name:</strong> {userSummary.user.personalName || 'N/A'}</p>
                            <p><strong>Breeder Name:</strong> {userSummary.user.breederName || 'N/A'}</p>
                            <p><strong>Member Since:</strong> {new Date(userSummary.user.createdAt).toLocaleDateString()}</p>
                            <p><strong>Last Login:</strong> {userSummary.user.lastLogin ? new Date(userSummary.user.lastLogin).toLocaleDateString() : 'Never'}</p>
                            <p><strong>Warnings:</strong> {userSummary.user.warningCount}</p>
                        </div>

                        <div className="summary-card">
                            <h4>Content Statistics</h4>
                            <p><strong>Total Animals:</strong> {userSummary.content.totalAnimals}</p>
                            <p><strong>Public Animals:</strong> {userSummary.content.publicAnimals}</p>
                            <p><strong>Litters:</strong> {userSummary.content.litters}</p>
                        </div>

                        <div className="summary-card">
                            <h4>Moderation</h4>
                            <p><strong>Reports Filed:</strong> {userSummary.moderation.reportsFiled}</p>
                            <p><strong>Reports Against:</strong> {userSummary.moderation.reportsAgainst}</p>
                        </div>
                    </div>
                )}

                <div className="user-actions">
                    <h4>Actions</h4>
                    <div className="action-buttons">
                        <button onClick={() => handleWarnUser(selectedUser._id)}>
                            ⚠️ Issue Warning
                        </button>
                        
                        <select 
                            onChange={(e) => handleChangeStatus(selectedUser._id, e.target.value)}
                            value={selectedUser.accountStatus || 'normal'}
                        >
                            <option value="" disabled>Change Status...</option>
                            <option value="normal">Activate</option>
                            <option value="suspended">Suspend</option>
                            <option value="banned">Ban</option>
                        </select>

                        <select 
                            onChange={(e) => handleChangeRole(selectedUser._id, e.target.value)}
                            value={selectedUser.role}
                        >
                            <option value="" disabled>Change Role...</option>
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {moderationHistory.length > 0 && (
                    <div className="moderation-history">
                        <h4>Moderation History</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Action</th>
                                    <th>Moderator</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moderationHistory.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(entry.createdAt).toLocaleString()}</td>
                                        <td>{entry.action.replace(/_/g, ' ')}</td>
                                        <td>{entry.moderatorId?.email || 'Unknown'}</td>
                                        <td>{entry.reason || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="user-management-tab">
            <div className="tab-header">
                <h3>User Management</h3>
                <button onClick={fetchUsers} disabled={loading}>
                    🔄 Refresh
                </button>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by email, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="normal">Normal</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Personal Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Warnings</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>{user.email}</td>
                                    <td>{user.personalName || 'N/A'}</td>
                                    <td>
                                        <span style={getRoleBadge(user.role)}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={getStatusBadge(user.accountStatus || 'normal')}>
                                            {(user.accountStatus || 'normal') === 'normal' ? 'normal' : user.accountStatus}
                                        </span>
                                    </td>
                                    <td>{user.warningCount || 0}</td>
                                    <td>
                                        <button 
                                            className="btn-view"
                                            onClick={() => handleViewUser(user)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="no-results">No users found</div>
                    )}

                    <div className="table-footer">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </div>
            )}
        </div>
    );
}
