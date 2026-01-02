import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Lock, Unlock, Shield, AlertTriangle, Loader2, Search, Download, CheckCircle, X } from 'lucide-react';

const UserManagement = ({ authToken, API_BASE_URL }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showLoginHistory, setShowLoginHistory] = useState(false);
    const [loginHistory, setLoginHistory] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        role: 'user',
        twoFactorEnabled: false,
        status: 'active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoginHistory = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/login-history`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLoginHistory(data);
                setShowLoginHistory(true);
            }
        } catch (error) {
            console.error('Error fetching login history:', error);
        }
    };

    const handleSuspendUser = async (userId, suspend = true) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ status: suspend ? 'suspended' : 'active' })
            });
            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleResetPassword = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                alert('Password reset email sent to user');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">User Accounts</h3>
                <button
                    onClick={() => setShowUserForm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create User
                </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                    <Download size={20} />
                    Export CSV
                </button>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">2FA</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-3 text-sm text-gray-800">{user.email}</td>
                                    <td className="px-6 py-3 text-sm text-gray-800">{user.username}</td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        {user.twoFactorEnabled ? (
                                            <CheckCircle size={18} className="text-green-600" />
                                        ) : (
                                            <X size={18} className="text-gray-400" />
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center text-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => fetchLoginHistory(user.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="View login history"
                                            >
                                                <Shield size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                                title="Reset password"
                                            >
                                                <Lock size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleSuspendUser(user.id, user.status === 'active')}
                                                className={`p-2 rounded-lg transition ${
                                                    user.status === 'active'
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                                            >
                                                {user.status === 'active' ? <Unlock size={18} /> : <Lock size={18} />}
                                            </button>
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Login History Modal */}
            {showLoginHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Login History</h3>
                            <button onClick={() => setShowLoginHistory(false)} className="p-1 hover:bg-white/20 rounded">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            {loginHistory.length === 0 ? (
                                <p className="text-gray-600">No login history available</p>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 font-semibold text-gray-700">Date/Time</th>
                                            <th className="text-left py-2 font-semibold text-gray-700">IP Address</th>
                                            <th className="text-left py-2 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginHistory.map((entry, index) => (
                                            <tr key={index} className="border-b last:border-b-0">
                                                <td className="py-2 text-sm text-gray-600">{new Date(entry.timestamp).toLocaleString()}</td>
                                                <td className="py-2 text-sm text-gray-600">{entry.ipAddress}</td>
                                                <td className="py-2 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        entry.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
