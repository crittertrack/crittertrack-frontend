import React, { useState } from 'react';
import { X, AlertCircle, Send, Loader2 } from 'lucide-react';

const AdminPanel = ({ isOpen, onClose, authToken, API_BASE_URL, showModalMessage }) => {
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationContent, setNotificationContent] = useState('');
    const [notificationType, setNotificationType] = useState('system');
    const [isSending, setIsSending] = useState(false);
    const [notificationsSent, setNotificationsSent] = useState(0);

    const handleSendNotification = async () => {
        if (!notificationTitle.trim() || !notificationContent.trim()) {
            showModalMessage('Error', 'Please fill in both title and content');
            return;
        }

        setIsSending(true);
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
                showModalMessage('Success', `System notification sent to ${data.notificationsSent || 0} users!`);
                setNotificationTitle('');
                setNotificationContent('');
                setNotificationType('system');
            } else {
                const error = await response.json();
                showModalMessage('Error', error.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            showModalMessage('Error', 'Failed to send notification. Check console for details.');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} />
                        <h2 className="text-2xl font-bold">Admin Panel</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold">System Notifications</p>
                            <p className="mt-1">Send critical notifications to all CritterTrack users about system updates, maintenance, bugs, or important announcements.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Notification Title *
                            </label>
                            <input
                                type="text"
                                value={notificationTitle}
                                onChange={(e) => setNotificationTitle(e.target.value)}
                                placeholder="e.g., Scheduled Maintenance Notice"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                disabled={isSending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Notification Type
                            </label>
                            <select
                                value={notificationType}
                                onChange={(e) => setNotificationType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                disabled={isSending}
                            >
                                <option value="system">System Update</option>
                                <option value="maintenance">Maintenance Notice</option>
                                <option value="bug">Bug Fix Notification</option>
                                <option value="feature">New Feature Announcement</option>
                                <option value="alert">Critical Alert</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Notification Content *
                            </label>
                            <textarea
                                value={notificationContent}
                                onChange={(e) => setNotificationContent(e.target.value)}
                                placeholder="Enter the full notification message. Be clear and concise about the issue or update."
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono text-sm"
                                disabled={isSending}
                            />
                        </div>

                        {notificationsSent > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    ✓ Last notification sent to <strong>{notificationsSent}</strong> users
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                            disabled={isSending}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendNotification}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={isSending || !notificationTitle.trim() || !notificationContent.trim()}
                        >
                            {isSending ? (
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
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
