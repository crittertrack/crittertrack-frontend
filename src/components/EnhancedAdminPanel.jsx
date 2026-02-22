import React, { useState, useEffect } from 'react';
import {
    X, Users, Settings, BarChart3, Mail, Shield, AlertTriangle, Lock,
    Loader2, Save, Plus, Trash2, Edit, Eye, Search, Download, Upload,
    ChevronDown, ChevronRight, ChevronLeft, CheckCircle, Clock, Flag, MessageSquare, FileText,
    Bug, Dna, PawPrint, Wrench, Database, PanelLeftClose, PanelLeft, LogOut, Layers
} from 'lucide-react';
import ModOversightPanel from './moderation/ModOversightPanel';
import UserManagementPanel from './moderation/UserManagementPanel';
import AuditLogViewer from './moderation/AuditLogViewer';
import CommunicationTab from './admin/CommunicationTab';
import SystemSettingsTab from './admin/SystemSettingsTab';
import ModChatTab from './admin/ModChatTab';
import AnimalManagementPanel from './admin/AnimalManagementPanel';
import BugReportsTab from './admin/BugReportsTab';
import FeedbackTab from './admin/FeedbackTab';
import SpeciesManagementTab from './admin/SpeciesManagementTab';
import FieldTemplateManagement from './admin/FieldTemplateManagement';
import GeneticsBuilderTab from './admin/GeneticsBuilderTab';
import BackupManagementTab from './admin/BackupManagementTab';
import AnalyticsTab from './admin/AnalyticsTab';

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

// Collapsible Section Component for Sidebar
const CollapsibleSection = ({ 
    title, 
    icon: SectionIcon, 
    isExpanded, 
    onToggle, 
    sidebarCollapsed, 
    items, 
    activeSection, 
    setActiveSection,
    userRole 
}) => {
    // Filter items based on role
    const accessibleItems = items.filter(item => !item.requiredRole || userRole === item.requiredRole);
    
    // Check if any item in this section is active
    const hasActiveItem = accessibleItems.some(item => item.id === activeSection);

    if (accessibleItems.length === 0) return null;

    // When sidebar is collapsed, show only icons in a vertical list on hover
    if (sidebarCollapsed) {
        return (
            <div className="relative group">
                <button
                    onClick={onToggle}
                    title={title}
                    className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition ${
                        hasActiveItem ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <SectionIcon size={20} />
                </button>
                {/* Tooltip with items on hover */}
                <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48">
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                            {title}
                        </div>
                        {accessibleItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${
                                        activeSection === item.id
                                            ? 'bg-red-50 text-red-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-0.5">
            {/* Section Header */}
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                    hasActiveItem ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center gap-2">
                    <SectionIcon size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
                </div>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {/* Section Items */}
            {isExpanded && (
                <div className="ml-2 pl-2 border-l-2 border-gray-200 space-y-0.5">
                    {accessibleItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition whitespace-nowrap ${
                                    activeSection === item.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={18} className="flex-shrink-0" />
                                <span className="font-medium text-left text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const EnhancedAdminPanel = ({ isOpen, onClose, authToken, API_BASE_URL, userRole, userEmail, userId, username, skipAuthentication = false }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        moderation: true,
        admin: true,
        configuration: true
    });
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
        newModReplies: 0,
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
            // Fetch dashboard stats
            const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            // Fetch backup data for consistent "Last Backup" timing
            const backupResponse = await fetch(`${API_BASE_URL}/api/admin/backups`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            let dashboardData = {};
            let backupData = {};
            
            if (dashboardResponse.ok) {
                dashboardData = await dashboardResponse.json();
            } else {
                console.warn('Dashboard stats endpoint not available:', dashboardResponse.status);
            }
            
            if (backupResponse.ok) {
                backupData = await backupResponse.json();
            } else {
                console.warn('Backup endpoint not available:', backupResponse.status);
            }
            
            // Merge data, prioritizing backup endpoint for lastBackup time
            setDashboardStats({
                ...dashboardData,
                lastBackup: backupData.lastAutoBackup || dashboardData.lastBackup
            });
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
            <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
            {console.log('[EnhancedAdminPanel] Rendering authenticated admin panel')}
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <Shield size={28} />
                    <div>
                        <h2 className="text-3xl font-bold">CritterTrack Moderation Panel</h2>
                        <p className="text-sm text-red-100 mt-1 capitalize">Role: {userRole}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('moderationAuthenticated');
                            onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition text-lg"
                        title="Close"
                    >
                        <X size={28} />
                    </button>
                </div>
            </div>
                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div 
                        className={`bg-gray-50 border-r border-gray-200 overflow-y-auto transition-all duration-300 flex flex-col ${
                            sidebarCollapsed ? 'w-16' : 'w-72'
                        }`}
                    >
                        {/* Collapse Toggle Button */}
                        <div className={`p-2 border-b border-gray-200 flex ${sidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-500 hover:text-gray-700"
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                            </button>
                        </div>
                        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
                            {/* Dashboard - standalone */}
                            <button
                                onClick={() => setActiveSection('dashboard')}
                                title={sidebarCollapsed ? 'Dashboard' : undefined}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition whitespace-nowrap ${
                                    activeSection === 'dashboard'
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <BarChart3 size={20} className="flex-shrink-0" />
                                {!sidebarCollapsed && <span className="font-medium text-left text-sm">Dashboard</span>}
                            </button>

                            {/* Moderation Section */}
                            <CollapsibleSection
                                title="Moderation"
                                icon={Shield}
                                isExpanded={expandedSections.moderation}
                                onToggle={() => setExpandedSections(prev => ({ ...prev, moderation: !prev.moderation }))}
                                sidebarCollapsed={sidebarCollapsed}
                                items={[
                                    { id: 'mod-chat', label: 'Mod Team Chat', icon: MessageSquare },
                                    { id: 'moderation', label: 'Reports', icon: AlertTriangle },
                                    { id: 'user-management', label: 'User Management', icon: Users },
                                    { id: 'animals', label: 'Animal Management', icon: Shield },
                                    { id: 'communication', label: 'Communication', icon: Mail }
                                ]}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                                userRole={userRole}
                            />

                            {/* Admin Section */}
                            <CollapsibleSection
                                title="Admin"
                                icon={Lock}
                                isExpanded={expandedSections.admin}
                                onToggle={() => setExpandedSections(prev => ({ ...prev, admin: !prev.admin }))}
                                sidebarCollapsed={sidebarCollapsed}
                                items={[
                                    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
                                    { id: 'bug-reports', label: 'Bug Reports', icon: Bug },
                                    { id: 'backup-management', label: 'Backup Management', icon: Database, requiredRole: 'admin' },
                                    { id: 'reports', label: 'Analytics', icon: BarChart3 }
                                ]}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                                userRole={userRole}
                            />

                            {/* Configuration Section */}
                            <CollapsibleSection
                                title="Configuration"
                                icon={Settings}
                                isExpanded={expandedSections.configuration}
                                onToggle={() => setExpandedSections(prev => ({ ...prev, configuration: !prev.configuration }))}
                                sidebarCollapsed={sidebarCollapsed}
                                items={[
                                    { id: 'species-management', label: 'Species Management', icon: PawPrint, requiredRole: 'admin' },
                                    { id: 'field-templates', label: 'Field Templates', icon: Layers, requiredRole: 'admin' },
                                    { id: 'feedback', label: 'Calculator Feedback', icon: Dna },
                                    { id: 'genetics-builder', label: 'Genetics Builder', icon: Wrench, requiredRole: 'admin' },
                                    { id: 'system-settings', label: 'System Settings', icon: Settings, requiredRole: 'admin' }
                                ]}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                                userRole={userRole}
                            />
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Dashboard */}
                        {activeSection === 'dashboard' && (
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                                    <StatCard label="Total Users" value={dashboardStats.totalUsers} icon={Users} />
                                    <StatCard label="Currently Active" value={dashboardStats.activeUsers} icon={Users} />
                                    <StatCard label="Total Animals" value={dashboardStats.totalAnimals} icon={Shield} />
                                    <StatCard label="Pending Reports" value={dashboardStats.pendingReports} icon={AlertTriangle} color="red" />
                                    <StatCard label="New Mod Replies" value={dashboardStats.newModReplies} icon={MessageSquare} color="blue" />
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
                                                ? new Date(dashboardStats.lastBackup).toLocaleString('en-GB')
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

                        {/* Animal Management */}
                        {activeSection === 'animals' && (
                            <div className="p-8">
                                <AnimalManagementPanel 
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                    userRole={localStorage.getItem('userRole')}
                                />
                            </div>
                        )}

                        {/* Moderation Tools */}
                        {activeSection === 'moderation' && (
                            <div className="p-8">
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
                            </div>
                        )}

                        {/* User Management Panel */}
                        {activeSection === 'user-management' && (
                            <div className="p-8">
                                <UserManagementPanel />
                            </div>
                        )}

                        {/* Audit Logs */}
                        {activeSection === 'audit-logs' && (
                            <div className="p-8">
                                <AuditLogViewer />
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

                        {/* Bug Reports */}
                        {activeSection === 'bug-reports' && (
                            <div className="p-8">
                                <BugReportsTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Calculator Feedback */}
                        {activeSection === 'feedback' && (
                            <div className="p-8">
                                <FeedbackTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Species Management */}
                        {activeSection === 'species-management' && (
                            <div className="p-8">
                                <SpeciesManagementTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Field Templates */}
                        {activeSection === 'field-templates' && (
                            <div className="p-8">
                                <FieldTemplateManagement
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Genetics Builder */}
                        {activeSection === 'genetics-builder' && (
                            <div className="p-8">
                                <GeneticsBuilderTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Backup Management */}
                        {activeSection === 'backup-management' && (
                            <div className="p-8">
                                <BackupManagementTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Reports - DISABLED: Component deleted */}
                        {activeSection === 'reports' && (
                            <div className="p-8">
                                <AnalyticsTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                />
                            </div>
                        )}

                        {/* Mod Team Chat */}
                        {activeSection === 'mod-chat' && (
                            <div className="p-8">
                                <ModChatTab
                                    API_BASE_URL={API_BASE_URL}
                                    authToken={authToken}
                                    currentUserId={userId}
                                />
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
