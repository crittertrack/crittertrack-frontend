import React, { useState, useEffect } from 'react';
import {
    X, Users, Settings, BarChart3, Mail, Shield, Lock, AlertTriangle,
    Loader2, Save, Plus, Trash2, Edit, Eye, Search, Download, Upload,
    ChevronDown, ChevronRight, CheckCircle, Clock, Flag, MessageSquare
} from 'lucide-react';
import UserManagement from './admin/UserManagement';
import AnimalManagement from './admin/AnimalManagement';
import ModerationTools from './admin/ModerationTools';
import SystemSettings from './admin/SystemSettings';
import Reports from './admin/Reports';
import Communication from './admin/Communication';
import DataAudit from './admin/DataAudit';

const EnhancedAdminPanel = ({ isOpen, onClose, authToken, API_BASE_URL, userRole }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [adminPassword, setAdminPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [passwordAttempts, setPasswordAttempts] = useState(0);
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalAnimals: 0,
        pendingReports: 0,
        systemHealth: 'good',
        lastBackup: null
    });
    const [loading, setLoading] = useState(false);

    // Load dashboard stats
    useEffect(() => {
        if (isAuthenticated && activeSection === 'dashboard') {
            fetchDashboardStats();
        }
    }, [isAuthenticated, activeSection]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordAttempts >= 3) {
            setPasswordError('Too many failed attempts. Please close and reopen the admin panel.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ password: adminPassword })
            });

            if (response.ok) {
                setIsAuthenticated(true);
                setShowPasswordPrompt(false);
                setAdminPassword('');
                setPasswordAttempts(0);
            } else {
                setPasswordAttempts(prev => prev + 1);
                setPasswordError(`Incorrect admin password (${3 - passwordAttempts - 1} attempts remaining)`);
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            setPasswordError('Error verifying password');
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDashboardStats(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    if (!isOpen) return null;

    // Password prompt
    if (showPasswordPrompt) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <Lock size={24} />
                            <h2 className="text-xl font-bold">Admin Authentication</h2>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                        <p className="text-sm text-gray-600 mb-4">Enter admin password to access admin panel:</p>

                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => {
                                setAdminPassword(e.target.value);
                                setPasswordError('');
                            }}
                            placeholder="Admin password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            autoFocus
                        />

                        {passwordError && (
                            <div className="text-sm text-red-600 font-medium">{passwordError}</div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                            >
                                Unlock
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield size={28} />
                        <h2 className="text-2xl font-bold">CritterTrack Admin Panel</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                        <nav className="p-4 space-y-2">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                                { id: 'users', label: 'User Management', icon: Users, requiredRole: 'admin' },
                                { id: 'animals', label: 'Animal Records', icon: Shield, requiredRole: 'admin' },
                                { id: 'moderation', label: 'Moderation Tools', icon: AlertTriangle },
                                { id: 'data-audit', label: 'Data Integrity', icon: Lock, requiredRole: 'admin' },
                                { id: 'system-settings', label: 'System Settings', icon: Settings, requiredRole: 'admin' },
                                { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
                                { id: 'communication', label: 'Communication', icon: Mail }
                            ].map(section => {
                                const Icon = section.icon;
                                const hasAccess = !section.requiredRole || userRole === section.requiredRole;
                                if (!hasAccess) return null;

                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                            activeSection === section.id
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Dashboard */}
                        {activeSection === 'dashboard' && (
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <StatCard label="Total Users" value={dashboardStats.totalUsers} icon={Users} />
                                    <StatCard label="Active Users" value={dashboardStats.activeUsers} icon={Users} />
                                    <StatCard label="Total Animals" value={dashboardStats.totalAnimals} icon={Shield} />
                                    <StatCard label="Pending Reports" value={dashboardStats.pendingReports} icon={AlertTriangle} color="red" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h4 className="font-bold text-gray-800 mb-4">System Health</h4>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${
                                                dashboardStats.systemHealth === 'good' ? 'bg-green-600' :
                                                dashboardStats.systemHealth === 'warning' ? 'bg-yellow-600' :
                                                'bg-red-600'
                                            }`}></div>
                                            <span className="text-lg font-semibold text-gray-800 capitalize">
                                                {dashboardStats.systemHealth}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h4 className="font-bold text-gray-800 mb-4">Last Backup</h4>
                                        <p className="text-gray-600">
                                            {dashboardStats.lastBackup
                                                ? new Date(dashboardStats.lastBackup).toLocaleString()
                                                : 'No backups yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Management */}
                        {activeSection === 'users' && (
                            <UserManagement authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        )}

                        {/* Animal Management */}
                        {activeSection === 'animals' && (
                            <AnimalManagement authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        )}

                        {/* Moderation Tools */}
                        {activeSection === 'moderation' && (
                            <ModerationTools authToken={authToken} API_BASE_URL={API_BASE_URL} userRole={userRole} />
                        )}

                        {/* Data Audit */}
                        {activeSection === 'data-audit' && (
                            <DataAudit authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        )}

                        {/* System Settings */}
                        {activeSection === 'system-settings' && (
                            <SystemSettings authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        )}

                        {/* Reports */}
                        {activeSection === 'reports' && (
                            <Reports authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        )}

                        {/* Communication */}
                        {activeSection === 'communication' && (
                            <Communication authToken={authToken} API_BASE_URL={API_BASE_URL} userRole={userRole} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        green: 'bg-green-50 text-green-600 border-green-200'
    };

    return (
        <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <Icon size={32} className="opacity-20" />
            </div>
        </div>
    );
};

export default EnhancedAdminPanel;
