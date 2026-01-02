import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Send, Loader2, Lock, Bell, Radio, Power, CheckCircle } from 'lucide-react';

const AdminPanel = ({ isOpen, onClose, authToken, API_BASE_URL, showModalMessage, onMaintenanceModeChange }) => {
    const [adminPassword, setAdminPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Already authenticated via moderation login
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // Skip password prompt
    const [passwordError, setPasswordError] = useState('');
    const [passwordAttempts, setPasswordAttempts] = useState(0);
    
    // Tab navigation
    const [activeTab, setActiveTab] = useState('notifications'); // 'notifications', 'messages', 'urgent', 'maintenance'
    
    // Notification states
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationContent, setNotificationContent] = useState('');
    const [notificationType, setNotificationType] = useState('system');
    const [isSendingNotification, setIsSendingNotification] = useState(false);
    const [notificationsSent, setNotificationsSent] = useState(0);
    
    // Message states
    const [messageContent, setMessageContent] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [messagesSent, setMessagesSent] = useState(0);
    
    // Urgent notification states
    const [urgentTitle, setUrgentTitle] = useState('');
    const [urgentContent, setUrgentContent] = useState('');
    const [isSendingUrgent, setIsSendingUrgent] = useState(false);
    
    // Maintenance mode states
    const [maintenanceActive, setMaintenanceActive] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('System Maintenance in Progress');
    const [isToggelingMaintenance, setIsTogglingMaintenance] = useState(false);
    const [maintenanceStatus, setMaintenanceStatus] = useState(null);

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
                // Fetch current maintenance status
                fetchMaintenanceStatus();
            } else {
                setPasswordAttempts(prev => prev + 1);
                setPasswordError(`Incorrect admin password (${3 - passwordAttempts - 1} attempts remaining)`);
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            setPasswordError('Error verifying password');
        }
    };

    const fetchMaintenanceStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/maintenance-status`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMaintenanceActive(data.active || false);
                setMaintenanceMessage(data.message || 'System Maintenance in Progress');
                setMaintenanceStatus(data);
            }
        } catch (error) {
            console.error('Error fetching maintenance status:', error);
        }
    };

    // Fetch maintenance status when panel opens
    useEffect(() => {
        if (isOpen) {
            setShowPasswordPrompt(false); // Ensure password prompt is hidden
            setIsAuthenticated(true); // Ensure authenticated state
            if (isAuthenticated) {
                fetchMaintenanceStatus();
            }
        }
    }, [isOpen]);

    const handleSendNotification = async () => {
        if (!notificationTitle.trim() || !notificationContent.trim()) {
            showModalMessage('Error', 'Please fill in both title and content');
            return;
        }

        setIsSendingNotification(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/send-system-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: notificationTitle,
                    content: notificationContent,
                    type: notificationType
                })
            });

            if (response.ok) {
                const data = await response.json();
                setNotificationsSent(data.notificationsSent || 0);
                showModalMessage('Success', `Notification sent to ${data.notificationsSent || 0} users!`);
                setNotificationTitle('');
                setNotificationContent('');
            } else {
                const error = await response.json();
                showModalMessage('Error', error.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            showModalMessage('Error', 'Failed to send notification');
        } finally {
            setIsSendingNotification(false);
        }
    };

    const handleSendMessages = async () => {
        if (!messageContent.trim()) {
            showModalMessage('Error', 'Please enter a message');
            return;
        }

        setIsSendingMessage(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/send-messages-to-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ content: messageContent })
            });

            if (response.ok) {
                const data = await response.json();
                setMessagesSent(data.messagesSent || 0);
                showModalMessage('Success', `Message sent to ${data.messagesSent || 0} users!`);
                setMessageContent('');
            } else {
                const error = await response.json();
                showModalMessage('Error', error.message || 'Failed to send messages');
            }
        } catch (error) {
            console.error('Error sending messages:', error);
            showModalMessage('Error', 'Failed to send messages');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleSendUrgentNotification = async () => {
        if (!urgentTitle.trim() || !urgentContent.trim()) {
            showModalMessage('Error', 'Please fill in both title and content');
            return;
        }

        setIsSendingUrgent(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/send-urgent-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: urgentTitle,
                    content: urgentContent
                })
            });

            if (response.ok) {
                const data = await response.json();
                showModalMessage('Success', `Urgent notification shown to ${data.usersNotified || 0} active users!`);
                setUrgentTitle('');
                setUrgentContent('');
            } else {
                const error = await response.json();
                showModalMessage('Error', error.message || 'Failed to send urgent notification');
            }
        } catch (error) {
            console.error('Error sending urgent notification:', error);
            showModalMessage('Error', 'Failed to send urgent notification');
        } finally {
            setIsSendingUrgent(false);
        }
    };

    const handleToggleMaintenance = async () => {
        setIsTogglingMaintenance(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/toggle-maintenance-mode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    active: !maintenanceActive,
                    message: maintenanceMessage
                })
            });

            if (response.ok) {
                const newState = !maintenanceActive;
                setMaintenanceActive(newState);
                onMaintenanceModeChange?.(newState);
                
                if (newState) {
                    showModalMessage('Success', 'Maintenance mode ACTIVATED. All users except CTU1 will be logged out and prevented from logging in.');
                } else {
                    showModalMessage('Success', 'Maintenance mode deactivated. Users can now log in normally.');
                }
            } else {
                const error = await response.json();
                showModalMessage('Error', error.message || 'Failed to toggle maintenance mode');
            }
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            showModalMessage('Error', 'Failed to toggle maintenance mode');
        } finally {
            setIsTogglingMaintenance(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setShowPasswordPrompt(true);
        setAdminPassword('');
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
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} />
                        <h2 className="text-2xl font-bold">Admin Control Panel</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                            title="Logout from admin"
                        >
                            <Lock size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b bg-gray-50 sticky top-16">
                    <div className="flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex-1 px-4 py-3 font-medium text-sm whitespace-nowrap transition ${
                                activeTab === 'notifications'
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Bell size={16} className="inline mr-2" />
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`flex-1 px-4 py-3 font-medium text-sm whitespace-nowrap transition ${
                                activeTab === 'messages'
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Broadcast Messages
                        </button>
                        <button
                            onClick={() => setActiveTab('urgent')}
                            className={`flex-1 px-4 py-3 font-medium text-sm whitespace-nowrap transition ${
                                activeTab === 'urgent'
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Radio size={16} className="inline mr-2" />
                            Urgent Alert
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`flex-1 px-4 py-3 font-medium text-sm whitespace-nowrap transition ${
                                activeTab === 'maintenance'
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Power size={16} className="inline mr-2" />
                            Maintenance
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                <Bell size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold">System Notifications</p>
                                    <p className="mt-1">Send notifications to users' notification center (non-intrusive)</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notification Title *
                                </label>
                                <input
                                    type="text"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="e.g., Scheduled Maintenance Notice"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    disabled={isSendingNotification}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notification Type
                                </label>
                                <select
                                    value={notificationType}
                                    onChange={(e) => setNotificationType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    disabled={isSendingNotification}
                                >
                                    <option value="system">System Update</option>
                                    <option value="maintenance">Maintenance Notice</option>
                                    <option value="bug">Bug Fix</option>
                                    <option value="feature">New Feature</option>
                                    <option value="alert">Alert</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notification Content *
                                </label>
                                <textarea
                                    value={notificationContent}
                                    onChange={(e) => setNotificationContent(e.target.value)}
                                    placeholder="Enter notification message..."
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono text-sm"
                                    disabled={isSendingNotification}
                                />
                            </div>

                            {notificationsSent > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        ✓ Last notification sent to <strong>{notificationsSent}</strong> users
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSendNotification}
                                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={isSendingNotification || !notificationTitle.trim() || !notificationContent.trim()}
                            >
                                {isSendingNotification ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send to All Users
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
                                <AlertCircle size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-purple-800">
                                    <p className="font-semibold">Broadcast Messages</p>
                                    <p className="mt-1">Send direct messages to all users from admin account (appears in their messages)</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message Content *
                                </label>
                                <textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Enter message to send to all users..."
                                    rows={8}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono text-sm"
                                    disabled={isSendingMessage}
                                />
                            </div>

                            {messagesSent > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-800">
                                        ✓ Last message sent to <strong>{messagesSent}</strong> users
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSendMessages}
                                className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={isSendingMessage || !messageContent.trim()}
                            >
                                {isSendingMessage ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send to All Users
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Urgent Tab */}
                    {activeTab === 'urgent' && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex gap-3">
                                <Radio size={20} className="text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                                <div className="text-sm text-red-800">
                                    <p className="font-semibold">⚠️ Urgent On-Screen Alert</p>
                                    <p className="mt-1">Shows directly on screen for all active users immediately (intrusive)</p>
                                    <p className="mt-2 text-xs font-mono">Use only for critical incidents</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alert Title (Short & Urgent) *
                                </label>
                                <input
                                    type="text"
                                    value={urgentTitle}
                                    onChange={(e) => setUrgentTitle(e.target.value)}
                                    placeholder="e.g., SYSTEM UNDER ATTACK - Immediate Action Required"
                                    maxLength={100}
                                    className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                    disabled={isSendingUrgent}
                                />
                                <p className="text-xs text-gray-500 mt-1">{urgentTitle.length}/100 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alert Content (What users should know) *
                                </label>
                                <textarea
                                    value={urgentContent}
                                    onChange={(e) => setUrgentContent(e.target.value)}
                                    placeholder="Explain the situation clearly and what users should do..."
                                    rows={6}
                                    className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 font-mono text-sm"
                                    disabled={isSendingUrgent}
                                />
                            </div>

                            <button
                                onClick={handleSendUrgentNotification}
                                className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-red-800"
                                disabled={isSendingUrgent || !urgentTitle.trim() || !urgentContent.trim()}
                            >
                                {isSendingUrgent ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Sending Alert...
                                    </>
                                ) : (
                                    <>
                                        <Radio size={18} />
                                        SEND URGENT ALERT NOW
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-4">
                            <div className={`border-2 rounded-lg p-4 flex gap-3 ${
                                maintenanceActive 
                                    ? 'bg-red-50 border-red-300' 
                                    : 'bg-green-50 border-green-300'
                            }`}>
                                <Power size={20} className={`flex-shrink-0 mt-0.5 ${
                                    maintenanceActive ? 'text-red-600' : 'text-green-600'
                                }`} />
                                <div className={`text-sm ${maintenanceActive ? 'text-red-800' : 'text-green-800'}`}>
                                    <p className="font-semibold">
                                        {maintenanceActive ? '🔴 MAINTENANCE MODE IS ACTIVE' : '🟢 System is normal'}
                                    </p>
                                    <p className="mt-1">
                                        {maintenanceActive 
                                            ? 'All users except CTU1 are logged out and cannot login' 
                                            : 'Users can login normally'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Maintenance Message (shown on login screen)
                                </label>
                                <textarea
                                    value={maintenanceMessage}
                                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                                    placeholder="Enter maintenance message..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    disabled={isToggelingMaintenance}
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>When activated:</strong> All active users will see an urgent alert and be logged out. New logins will be blocked with maintenance message.
                                </p>
                            </div>

                            <button
                                onClick={handleToggleMaintenance}
                                className={`w-full px-4 py-3 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                                    maintenanceActive
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                                disabled={isToggelingMaintenance}
                            >
                                {isToggelingMaintenance ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Toggling...
                                    </>
                                ) : (
                                    <>
                                        <Power size={18} />
                                        {maintenanceActive ? 'Deactivate Maintenance Mode' : 'Activate Maintenance Mode'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;

