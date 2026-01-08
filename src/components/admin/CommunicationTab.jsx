import React, { useState, useEffect } from 'react';
import './CommunicationTab.css';

export default function CommunicationTab({ API_BASE_URL, authToken }) {
    const [activeView, setActiveView] = useState('broadcast'); // broadcast, history, direct
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Broadcast state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [recipientType, setRecipientType] = useState('all');
    const [country, setCountry] = useState('');
    const [broadcastType, setBroadcastType] = useState('info');
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    // History state
    const [broadcasts, setBroadcasts] = useState([]);
    const [total, setTotal] = useState(0);

    // Direct message state
    const [targetUserId, setTargetUserId] = useState('');
    const [targetUserEmail, setTargetUserEmail] = useState('');
    const [directMessage, setDirectMessage] = useState('');

    useEffect(() => {
        if (activeView === 'history') {
            fetchBroadcastHistory();
        }
    }, [activeView]);

    const fetchBroadcastHistory = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/broadcast-history?limit=20`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Broadcast history endpoint not available');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch broadcasts');
            }

            setBroadcasts(data.broadcasts || []);
            setTotal(data.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!subject || !message) {
            setError('Subject and message are required');
            setLoading(false);
            return;
        }

        // Validate scheduled time if enabled
        let scheduledFor = null;
        if (scheduleEnabled) {
            if (!scheduledDate || !scheduledTime) {
                setError('Please select both date and time for scheduling');
                setLoading(false);
                return;
            }
            scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
            if (scheduledFor <= new Date()) {
                setError('Scheduled time must be in the future');
                setLoading(false);
                return;
            }
        }

        try {
            // Use moderation endpoint which supports scheduling and emails
            const payload = {
                title: subject,
                message,
                type: broadcastType,
                ...(scheduledFor && { scheduledFor: scheduledFor.toISOString() })
            };

            const response = await fetch(`${API_BASE_URL}/moderation/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Broadcast endpoint not available');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send broadcast');
            }

            if (scheduledFor) {
                setSuccess(`Broadcast scheduled for ${scheduledFor.toLocaleString()} - will be sent to ${data.recipientCount} users`);
            } else {
                setSuccess(`Broadcast sent successfully to ${data.recipientCount} users!`);
            }
            
            // Reset form
            setSubject('');
            setMessage('');
            setBroadcastType('info');
            setScheduleEnabled(false);
            setScheduledDate('');
            setScheduledTime('');

            // Refresh history
            if (activeView === 'history') {
                fetchBroadcastHistory();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendDirectMessage = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!targetUserId || !directMessage) {
            setError('User ID and message are required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/message-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    userId: targetUserId,
                    message: directMessage
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Direct message endpoint not available');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setSuccess('Message sent successfully!');
            setTargetUserId('');
            setTargetUserEmail('');
            setDirectMessage('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="communication-tab">
            <div className="tab-header">
                <h3>Communication</h3>
                <div className="view-switcher">
                    <button
                        className={activeView === 'broadcast' ? 'active' : ''}
                        onClick={() => setActiveView('broadcast')}
                    >
                        📢 Broadcast
                    </button>
                    <button
                        className={activeView === 'history' ? 'active' : ''}
                        onClick={() => setActiveView('history')}
                    >
                        📋 History
                    </button>
                    <button
                        className={activeView === 'direct' ? 'active' : ''}
                        onClick={() => setActiveView('direct')}
                    >
                        ✉️ Direct Message
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    ✓ {success}
                </div>
            )}

            {/* Broadcast View */}
            {activeView === 'broadcast' && (
                <div className="broadcast-view">
                    <div className="info-card">
                        <h4>Send Announcement</h4>
                        <p>Broadcast messages are sent as in-app notifications and emails to all active users.</p>
                    </div>

                    <form onSubmit={handleSendBroadcast} className="broadcast-form">
                        <div className="form-group">
                            <label>Broadcast Type *</label>
                            <select
                                value={broadcastType}
                                onChange={(e) => setBroadcastType(e.target.value)}
                                disabled={loading}
                            >
                                <option value="info">ℹ️ Info - General information</option>
                                <option value="announcement">📢 Announcement - Important news</option>
                                <option value="warning">⚠️ Warning - Action may be required</option>
                                <option value="alert">🚨 Alert - Urgent message</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Subject / Title *</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief subject line..."
                                disabled={loading}
                                maxLength="100"
                            />
                            <span className="char-count">{subject.length}/100</span>
                        </div>

                        <div className="form-group">
                            <label>Message *</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Your announcement message..."
                                disabled={loading}
                                rows="6"
                                maxLength="1000"
                            />
                            <span className="char-count">{message.length}/1000</span>
                        </div>

                        <div className="form-group schedule-toggle">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={scheduleEnabled}
                                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                                    disabled={loading}
                                />
                                <span>📅 Schedule for later</span>
                            </label>
                        </div>

                        {scheduleEnabled && (
                            <div className="schedule-fields">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time *</label>
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <p className="schedule-note">
                                    ⏰ Broadcast will be sent automatically at the scheduled time.
                                    The cron job checks every minute.
                                </p>
                            </div>
                        )}

                        <button type="submit" className="btn-send" disabled={loading}>
                            {loading ? 'Sending...' : scheduleEnabled ? '📅 Schedule Broadcast' : '📢 Send Now'}
                        </button>
                    </form>
                </div>
            )}

            {/* History View */}
            {activeView === 'history' && (
                <div className="history-view">
                    <div className="history-header">
                        <h4>Broadcast History</h4>
                        <button onClick={fetchBroadcastHistory} disabled={loading}>
                            🔄 Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading history...</div>
                    ) : broadcasts.length === 0 ? (
                        <div className="no-results">No broadcasts sent yet</div>
                    ) : (
                        <div className="broadcasts-list">
                            {broadcasts.map((broadcast, idx) => (
                                <div key={idx} className="broadcast-card">
                                    <div className="broadcast-header">
                                        <strong>{broadcast.details?.subject || 'Broadcast'}</strong>
                                        <span className="broadcast-date">
                                            {new Date(broadcast.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="broadcast-meta">
                                        <span>By: {broadcast.moderatorEmail}</span>
                                        <span>Recipients: {broadcast.details?.recipientCount || 0}</span>
                                        <span>Type: {broadcast.details?.recipientType || 'unknown'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {total > 20 && (
                        <div className="pagination-info">
                            Showing 20 of {total} broadcasts
                        </div>
                    )}
                </div>
            )}

            {/* Direct Message View */}
            {activeView === 'direct' && (
                <div className="direct-message-view">
                    <div className="info-card">
                        <h4>Send Direct Message</h4>
                        <p>Send a notification message to a specific user. You can get the User ID from the User Management tab.</p>
                    </div>

                    <form onSubmit={handleSendDirectMessage} className="direct-message-form">
                        <div className="form-group">
                            <label>User ID * (MongoDB ObjectId)</label>
                            <input
                                type="text"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                placeholder="e.g., 507f1f77bcf86cd799439011"
                                disabled={loading}
                            />
                            <small>Find User ID in the User Management tab</small>
                        </div>

                        <div className="form-group">
                            <label>Message *</label>
                            <textarea
                                value={directMessage}
                                onChange={(e) => setDirectMessage(e.target.value)}
                                placeholder="Your message to the user..."
                                disabled={loading}
                                rows="6"
                                maxLength="1000"
                            />
                            <span className="char-count">{directMessage.length}/1000</span>
                        </div>

                        <button type="submit" className="btn-send" disabled={loading}>
                            {loading ? 'Sending...' : '✉️ Send Message'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
