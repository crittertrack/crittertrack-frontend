import React, { useState, useEffect } from 'react';
import {
    X, Users, Settings, BarChart3, Mail, Shield, Lock, AlertTriangle,
    Loader2, Save, Plus, Trash2, Edit, Eye, Search, Download, Upload,
    ChevronDown, ChevronRight, CheckCircle, Clock, Flag, MessageSquare
} from 'lucide-react';
import ModOversightPanel from './moderation/ModOversightPanel';
import UserManagementTab from './admin/UserManagementTab';
import AuditLogTab from './admin/AuditLogTab';
import CommunicationTab from './admin/CommunicationTab';
import SystemSettingsTab from './admin/SystemSettingsTab';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Admin Panel Error:', error);
        console.error('Error Info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-red-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-red-200">
                        <div className="bg-red-600 text-white p-4 rounded-t-lg">
                            <h2 className="text-lg font-bold">Admin Panel Error</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-red-700 font-semibold mb-2">An error occurred:</p>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 text-red-900">
                                {this.state.error?.toString()}
                            </pre>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false });
                                    this.props.onClose?.();
                                }}
                                className="mt-4 w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                            >
                                Close Admin Panel
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const EnhancedAdminPanel = ({ isOpen, onClose, authToken, API_BASE_URL, userRole, userEmail, userId, username, skipAuthentication = false }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [adminPassword, setAdminPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(skipAuthentication);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(!skipAuthentication);
    const [showCodeRequestScreen, setShowCodeRequestScreen] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordAttempts, setPasswordAttempts] = useState(0);
    const [userDeviceInfo, setUserDeviceInfo] = useState(null);
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);
    const [requestingCode, setRequestingCode] = useState(false);
    const [codeRequestError, setCodeRequestError] = useState('');
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalAnimals: 0,
        pendingReports: 0,
        systemHealth: 'good',
        lastBackup: null
    });
    const [loading, setLoading] = useState(false);

    // Capture device information on mount
    useEffect(() => {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        setUserDeviceInfo(deviceInfo);
    }, []);

    // Load dashboard stats
    useEffect(() => {
        if (isAuthenticated && activeSection === 'dashboard') {
            fetchDashboardStats();
        }
    }, [isAuthenticated, activeSection]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setIsLoadingLogin(true);

        if (passwordAttempts >= 3) {
            setPasswordError('Too many failed attempts. Please close and reopen the admin panel.');
            setIsLoadingLogin(false);
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
                // Password verified - show code request screen instead of sending immediately
                setShowPasswordPrompt(false);
                setShowCodeRequestScreen(true);
                setAdminPassword('');
                setPasswordAttempts(0);
                await trackLoginAttempt(false, 'password_verified_awaiting_code_request');
            } else {
                setPasswordAttempts(prev => prev + 1);
                setPasswordError(`Incorrect admin password (${3 - passwordAttempts - 1} attempts remaining)`);
                // Track failed login attempt
                await trackLoginAttempt(false, 'password_incorrect');
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            setPasswordError('Error verifying password');
            // Track error
            await trackLoginAttempt(false, 'password_verification_error');
        } finally {
            setIsLoadingLogin(false);
        }
    };

    const trackLoginAttempt = async (success, status) => {
        try {
            if (!userDeviceInfo) return;

            const loginData = {
                username: username,
                userAgent: userDeviceInfo.userAgent,
                deviceInfo: {
                    platform: userDeviceInfo.platform,
                    language: userDeviceInfo.language,
                    screenResolution: userDeviceInfo.screenResolution,
                    timezone: userDeviceInfo.timezone
                },
                status: status,
                twoFactorPending: !success,
                timestamp: new Date().toISOString()
            };

            await fetch(`${API_BASE_URL}/admin/track-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(loginData)
            });
        } catch (error) {
            console.error('Error tracking login attempt:', error);
        }
    };

    const handleRequestCode = async () => {
        setCodeRequestError('');
        setRequestingCode(true);

        try {
            const sendCodeResponse = await fetch(`${API_BASE_URL}/admin/send-2fa-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    email: userEmail
                })
            });

            if (sendCodeResponse.ok) {
                // Code sent successfully - show 2FA screen
                setShow2FA(true);
                setShowCodeRequestScreen(false);
                await trackLoginAttempt(false, 'password_verified_2fa_code_sent');
            } else {
                const errorData = await sendCodeResponse.json();
                setCodeRequestError(`Failed to send verification code: ${errorData.error}`);
                await trackLoginAttempt(false, '2fa_code_send_failed');
            }
        } catch (codeError) {
            console.error('Error sending 2FA code:', codeError);
            setCodeRequestError('Failed to send verification code. Please try again.');
            await trackLoginAttempt(false, '2fa_code_send_error');
        } finally {
            setRequestingCode(false);
        }
    };

    const handle2FASuccess = async () => {
        // 2FA verification succeeded
        console.log('✓ 2FA verification successful, setting authenticated=true');
        setShow2FA(false);
        setIsAuthenticated(true);
        setShowPasswordPrompt(false);
        setActiveSection('dashboard');
        // Track successful login
        await trackLoginAttempt(true, 'success_2fa_verified');
    };

    const handle2FAClose = () => {
        setShow2FA(false);
        setShowPasswordPrompt(true);
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDashboardStats(data);
            } else {
                console.warn('Dashboard stats endpoint not available:', response.status);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Don't break the UI if stats fail to load
        }
    };

    // If not authenticated yet, show password/2FA screens
    if (!isAuthenticated) {
        console.log('[EnhancedAdminPanel] Not authenticated yet, showing auth screens');
        // 2FA Modal
        // TwoFactorAuth component deleted - 2FA now handled by ModerationAuthModal
        // if (show2FA) {
        //     ...
        // }

        // Code request screen (after password verification)
        if (showCodeRequestScreen) {
            console.log('[EnhancedAdminPanel] Showing code request screen');
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={24} />
                                <h2 className="text-xl font-bold">Password Verified</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-gray-700 font-medium mb-2">✓ Password verified successfully</p>
                                <p className="text-sm text-gray-600">Request your verification code to continue accessing the moderation panel.</p>
                            </div>

                            {codeRequestError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-600">{codeRequestError}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCodeRequestScreen(false);
                                        setShowPasswordPrompt(true);
                                        setCodeRequestError('');
                                    }}
                                    disabled={requestingCode}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRequestCode}
                                    disabled={requestingCode}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {requestingCode ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={16} />
                                            Request Code
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Password prompt
        if (showPasswordPrompt) {
            console.log('[EnhancedAdminPanel] Showing password prompt');
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
                                disabled={isLoadingLogin}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                autoFocus
                            />

                            {passwordError && (
                                <div className="text-sm text-red-600 font-medium">{passwordError}</div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoadingLogin}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoadingLogin}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoadingLogin ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Unlock'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
    }

    return (
        <ErrorBoundary onClose={onClose}>
            <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {console.log('[EnhancedAdminPanel] Rendering authenticated admin panel')}
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-6 flex items-center justify-between shadow-lg flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Shield size={24} className="sm:w-7 sm:h-7" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Moderation Panel</h2>
                        <p className="text-xs sm:text-sm text-red-100 mt-1 capitalize">Role: {userRole}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                    title="Close"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto flex-shrink-0">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'moderation', label: 'Reports', icon: AlertTriangle },
                    { id: 'communication', label: 'Communication', icon: Mail },
                    // Admin-only features
                    { id: 'users', label: 'Users', icon: Users, requiredRole: 'admin' },
                    { id: 'data-audit', label: 'Audit Log', icon: Lock, requiredRole: 'admin' },
                    { id: 'system-settings', label: 'Settings', icon: Settings, requiredRole: 'admin' }
                ].map(section => {
                    const Icon = section.icon;
                    const hasAccess = !section.requiredRole || userRole === section.requiredRole;
                    if (!hasAccess) return null;

                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition whitespace-nowrap text-sm sm:text-base ${
                                activeSection === section.id
                                    ? 'border-red-600 text-red-600 bg-white'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Icon size={18} />
                            <span className="font-medium">{section.label}</span>
                        </button>
                    );
                })}
            </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto"
>
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

                                {/* Login Activity Tracking - DISABLED: Component deleted */}
                                {/* <div className="mt-8">
                                    {authToken && API_BASE_URL && (
                                        <React.Suspense fallback={<div className="text-gray-500">Loading login history...</div>}>
                                            <LoginTracking authToken={authToken} API_BASE_URL={API_BASE_URL} />
                                        </React.Suspense>
                                    )}
                                </div> */}
                            </div>
                        )}

                        {/* User Management */}
                        {activeSection === 'users' && (
                            <div className="p-8">
                                <UserManagementTab 
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Animal Management - DISABLED: Component deleted */}
                        {activeSection === 'animals' && (
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Animal Records</h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <p className="text-yellow-800">This feature is currently being rebuilt.</p>
                                </div>
                            </div>
                        )}

                        {/* Moderation Tools */}
                        {activeSection === 'moderation' && (
                            <ModOversightPanel
                                isOpen={true}
                                onClose={() => setActiveSection('dashboard')}
                                API_BASE_URL={API_BASE_URL}
                                authToken={authToken}
                                embedded={true}
                                onActionTaken={() => {
                                    // Refresh dashboard stats after action
                                    if (isAuthenticated) {
                                        fetchDashboardStats();
                                    }
                                }}
                            />
                        )}

                        {/* Data Audit */}
                        {activeSection === 'data-audit' && (
                            <div className="p-8">
                                <AuditLogTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* System Settings */}
                        {activeSection === 'system-settings' && (
                            <div className="p-8">
                                <SystemSettingsTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Reports - DISABLED: Component deleted */}
                        {activeSection === 'reports' && (
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Reports & Analytics</h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <p className="text-yellow-800">This feature is currently being rebuilt.</p>
                                </div>
                            </div>
                        )}

                        {/* Communication */}
                        {activeSection === 'communication' && (
                            <div className="p-8">
                                <CommunicationTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
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
