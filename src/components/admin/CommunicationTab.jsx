import React, { useState, useEffect } from 'react';
import './CommunicationTab.css';
import DatePicker from '../DatePicker';

export default function CommunicationTab({ API_BASE_URL, authToken }) {
    const [activeView, setActiveView] = useState('broadcast'); // broadcast, history, direct, poll-results, mod-conversations
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

    // Poll state
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollEndsAt, setPollEndsAt] = useState('');
    const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // History state
    const [broadcasts, setBroadcasts] = useState([]);
    const [total, setTotal] = useState(0);

    // Poll results state
    const [pollResults, setPollResults] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);

    // Direct message state
    const [targetUserId, setTargetUserId] = useState('');
    const [targetUserEmail, setTargetUserEmail] = useState('');
    const [directMessage, setDirectMessage] = useState('');
    
    // Moderator conversations state
    const [modConversations, setModConversations] = useState([]);
    const [selectedModConversation, setSelectedModConversation] = useState(null);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [newModMessage, setNewModMessage] = useState('');

    useEffect(() => {
        if (activeView === 'history') {
            fetchBroadcastHistory();
        } else if (activeView === 'poll-results') {
            fetchPollResults();
        } else if (activeView === 'mod-conversations') {
            fetchModConversations();
        }
    }, [activeView]);

    // Polling for mod conversations list when tab is active
    useEffect(() => {
        if (activeView !== 'mod-conversations') return;
        
        const interval = setInterval(() => {
            fetchModConversationsQuiet();
        }, 5000); // Poll every 5 seconds
        
        return () => clearInterval(interval);
    }, [activeView]);

    // Polling for specific conversation messages when viewing a conversation
    useEffect(() => {
        if (!selectedModConversation) return;
        
        const interval = setInterval(() => {
            fetchConversationMessagesQuiet(selectedModConversation.otherUserId);
        }, 3000); // Poll every 3 seconds for new messages
        
        return () => clearInterval(interval);
    }, [selectedModConversation]);

    const addPollOption = () => {
        if (pollOptions.length < 10) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const removePollOption = (index) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const updatePollOption = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const clearPollForm = () => {
        setPollQuestion('');
        setPollOptions(['', '']);
        setPollEndsAt('');
        setAllowMultipleChoices(false);
        setIsAnonymous(false);
    };

    const fetchBroadcastHistory = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/moderation/broadcasts?limit=20`, {
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

    const handleDeleteBroadcast = async (broadcastId) => {
        if (!window.confirm('Are you sure you want to delete this broadcast from history? This will also remove it from all users\' notifications. This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/moderation/broadcasts/${broadcastId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned invalid response. The endpoint may not be deployed.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete broadcast');
            }

            const notificationCount = data.deletedNotificationsCount || 0;
            setSuccess(`Broadcast deleted successfully. Removed from ${notificationCount} user notification(s).`);
            // Refresh the list
            fetchBroadcastHistory();
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchPollResults = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/moderation/polls`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Non-JSON response received:', await response.text());
                throw new Error('Server returned invalid response. Please ensure backend is running.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch poll results');
            }

            setPollResults(data.polls || []);
        } catch (err) {
            console.error('Poll results fetch error:', err);
            setError(err.message || 'Failed to load poll results');
            setPollResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation based on broadcast type
        if (broadcastType === 'poll') {
            if (!subject || !pollQuestion) {
                setError('Subject and poll question are required for polls');
                setLoading(false);
                return;
            }
            const validOptions = pollOptions.filter(opt => opt.trim() !== '');
            if (validOptions.length < 2) {
                setError('Poll must have at least 2 non-empty options');
                setLoading(false);
                return;
            }
        } else {
            if (!subject || !message) {
                setError('Subject and message are required');
                setLoading(false);
                return;
            }
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

        // Validate poll end time if provided
        let pollEndTime = null;
        if (broadcastType === 'poll' && pollEndsAt) {
            pollEndTime = new Date(pollEndsAt);
            if (pollEndTime <= new Date()) {
                setError('Poll end time must be in the future');
                setLoading(false);
                return;
            }
        }

        try {
            // Prepare payload based on broadcast type
            const payload = {
                title: subject,
                type: broadcastType,
                ...(scheduledFor && { scheduledFor: scheduledFor.toISOString() })
            };

            if (broadcastType === 'poll') {
                // Poll-specific payload
                payload.pollQuestion = pollQuestion;
                payload.pollOptions = pollOptions.filter(opt => opt.trim() !== '');
                payload.allowMultipleChoices = allowMultipleChoices;
                payload.isAnonymous = isAnonymous;
                if (pollEndTime) {
                    payload.pollEndsAt = pollEndTime.toISOString();
                }
            } else {
                // Regular broadcast payload
                payload.message = message;
            }

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
                setSuccess(`${broadcastType === 'poll' ? 'Poll' : 'Broadcast'} scheduled for ${scheduledFor.toLocaleString('en-GB')} - will be sent to ${data.recipientCount} users`);
            } else {
                setSuccess(`${broadcastType === 'poll' ? 'Poll' : 'Broadcast'} sent successfully to ${data.recipientCount} users!`);
            }
            
            // Reset form
            setSubject('');
            setMessage('');
            setBroadcastType('info');
            setScheduleEnabled(false);
            setScheduledDate('');
            setScheduledTime('');
            clearPollForm();

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
            // First, resolve the CTUID to backend user ID
            const resolveResponse = await fetch(`${API_BASE_URL}/messages/resolve/${targetUserId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!resolveResponse.ok) {
                const resolveData = await resolveResponse.json();
                throw new Error(resolveData.error || 'User not found');
            }

            const { userId: backendUserId } = await resolveResponse.json();

            // Send as a real direct message with admin override to bypass privacy settings
            const response = await fetch(`${API_BASE_URL}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    receiverId: backendUserId, // Use resolved backend ID
                    message: directMessage,
                    adminOverride: true, // Bypass privacy settings
                    isModeratorMessage: true // Mark as official moderator communication
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

            setSuccess('Direct message sent successfully! User can reply to continue the conversation.');
            setTargetUserId('');
            setTargetUserEmail('');
            setDirectMessage('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchModConversations = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/moderator-conversations`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch moderator conversations');
            }

            setModConversations(data.conversations || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Quiet versions for polling (don't set loading state to avoid UI flickering)
    const fetchModConversationsQuiet = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/moderator-conversations`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setModConversations(data.conversations || []);
            }
        } catch (err) {
            // Silently fail during polling
            console.error('Polling error for mod conversations:', err);
        }
    };

    const fetchConversationMessagesQuiet = async (otherUserId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/conversation/${otherUserId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setConversationMessages(data.messages || []);
            }
        } catch (err) {
            // Silently fail during polling
            console.error('Polling error for conversation messages:', err);
        }
    };

    const handleViewModConversation = async (conversationId, otherUserId) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/messages/conversation/${otherUserId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch conversation');
            }

            setConversationMessages(data.messages || []);
            setSelectedModConversation({ _id: conversationId, otherUserId, ...data });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendModMessage = async (e) => {
        e.preventDefault();
        if (!newModMessage.trim() || !selectedModConversation) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    receiverId: selectedModConversation.otherUserId,
                    message: newModMessage.trim(),
                    adminOverride: true,
                    isModeratorMessage: true
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setNewModMessage('');
            await handleViewModConversation(selectedModConversation._id, selectedModConversation.otherUserId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModConversation = async (conversationId, otherUserId) => {
        if (!window.confirm('Are you sure you want to close this conversation? This will delete all messages.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/close-conversation/${otherUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to close conversation');
            }

            setSuccess('Conversation closed successfully');
            setSelectedModConversation(null);
            setConversationMessages([]);
            await fetchModConversations();
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
                        className={activeView === 'poll-results' ? 'active' : ''}
                        onClick={() => setActiveView('poll-results')}
                    >
                        📊 Poll Results
                    </button>
                    <button
                        className={activeView === 'direct' ? 'active' : ''}
                        onClick={() => setActiveView('direct')}
                    >
                        ✉️ Direct Message
                    </button>
                    <button
                        className={activeView === 'mod-conversations' ? 'active' : ''}
                        onClick={() => setActiveView('mod-conversations')}
                    >
                        💬 Mod Conversations
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
                                <option value="poll">📊 Poll - Interactive survey</option>
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

                        {/* Poll Fields */}
                        {broadcastType === 'poll' ? (
                            <div className="poll-fields">
                                <div className="form-group">
                                    <label>Poll Question *</label>
                                    <input
                                        type="text"
                                        value={pollQuestion}
                                        onChange={(e) => setPollQuestion(e.target.value)}
                                        placeholder="What question do you want to ask?"
                                        disabled={loading}
                                        maxLength="200"
                                    />
                                    <span className="char-count">{pollQuestion.length}/200</span>
                                </div>

                                <div className="form-group">
                                    <label>Poll Options *</label>
                                    <div className="poll-options">
                                        {pollOptions.map((option, index) => (
                                            <div key={index} className="poll-option-row">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updatePollOption(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    disabled={loading}
                                                    maxLength="100"
                                                />
                                                {pollOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePollOption(index)}
                                                        className="remove-option-btn"
                                                        disabled={loading}
                                                    >
                                                        ❌
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {pollOptions.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={addPollOption}
                                                className="add-option-btn"
                                                disabled={loading}
                                            >
                                                ➕ Add Option
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Poll Settings</label>
                                    <div className="poll-settings">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={allowMultipleChoices}
                                                onChange={(e) => setAllowMultipleChoices(e.target.checked)}
                                                disabled={loading}
                                            />
                                            <span>☑️ Allow multiple choices</span>
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                disabled={loading}
                                            />
                                            <span>🔒 Anonymous voting</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Poll End Date/Time (optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={pollEndsAt}
                                        onChange={(e) => setPollEndsAt(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        disabled={loading}
                                    />
                                    <small>Leave empty for polls that don't expire</small>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Regular Message Field */}
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
                            </>
                        )}

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
                                    <DatePicker
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        minDate={new Date()}
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
                                        <strong>{broadcast.details?.title || 'Broadcast'}</strong>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="broadcast-date">
                                                {new Date(broadcast.createdAt).toLocaleString('en-GB')}
                                            </span>
                                            <button 
                                                onClick={() => handleDeleteBroadcast(broadcast._id)}
                                                className="delete-broadcast-btn"
                                                title="Delete broadcast"
                                                style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                                onMouseOut={(e) => e.target.style.background = '#ef4444'}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="broadcast-meta">
                                        <span>By: {broadcast.moderatorEmail}</span>
                                        <span>Recipients: {broadcast.details?.recipientCount || 0}</span>
                                        <span>Type: {broadcast.details?.type || 'info'}</span>
                                        {broadcast.details?.scheduled && (
                                            <span>Scheduled: {new Date(broadcast.details.scheduledFor).toLocaleString('en-GB')}</span>
                                        )}
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

            {/* Poll Results View */}
            {activeView === 'poll-results' && (
                <div className="poll-results-view">
                    <div className="info-card">
                        <h4>Poll Results</h4>
                        <p>View all poll broadcasts and their voting results.</p>
                    </div>

                    {loading ? (
                        <div className="loading">Loading poll results...</div>
                    ) : pollResults.length === 0 ? (
                        <div className="no-data">No polls found</div>
                    ) : (
                        <div className="polls-list">
                            {pollResults.map((poll, idx) => {
                                const totalVotes = poll.pollOptions?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
                                const hasEnded = poll.pollEndsAt && new Date() > new Date(poll.pollEndsAt);
                                
                                return (
                                    <div key={idx} className="poll-result-card">
                                        <div className="poll-header">
                                            <strong>{poll.title}</strong>
                                            <span className="poll-date">
                                                {new Date(poll.createdAt).toLocaleString('en-GB')}
                                            </span>
                                        </div>
                                        
                                        <div className="poll-question">
                                            <h4>{poll.pollQuestion}</h4>
                                        </div>
                                        
                                        <div className="poll-meta">
                                            <span>Total Votes: {totalVotes}</span>
                                            <span>Type: {poll.allowMultipleChoices ? 'Multiple Choice' : 'Single Choice'}</span>
                                            {poll.pollEndsAt && (
                                                <span className={hasEnded ? 'ended' : 'active'}>
                                                    {hasEnded ? '🔴 Ended' : '🟢 Active'} - {new Date(poll.pollEndsAt).toLocaleString('en-GB')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="poll-options-results">
                                            {poll.pollOptions?.map((option, optIdx) => {
                                                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                                                
                                                return (
                                                    <div key={optIdx} className="poll-option-result">
                                                        <div className="option-header">
                                                            <span className="option-text">{option.text}</span>
                                                            <span className="option-stats">
                                                                {option.votes || 0} votes ({percentage}%)
                                                            </span>
                                                        </div>
                                                        <div className="option-bar-container">
                                                            <div 
                                                                className="option-bar"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        {!poll.isAnonymous && option.voters && option.voters.length > 0 && (
                                                            <div className="voters-list">
                                                                <small>Voters: {option.voters.length} user{option.voters.length !== 1 ? 's' : ''}</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Direct Message View */}
            {activeView === 'direct' && (
                <div className="direct-message-view">
                    <div className="info-card">
                        <h4>Send Direct Message</h4>
                        <p>Send a direct message to a specific user. This creates a real conversation that allows the user to reply. Messages sent here bypass privacy settings.</p>
                    </div>

                    <form onSubmit={handleSendDirectMessage} className="direct-message-form">
                        <div className="form-group">
                            <label>User CTUID *</label>
                            <input
                                type="text"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value.toUpperCase())}
                                placeholder="e.g., CT-A1B2C3"
                                disabled={loading}
                            />
                            <small>The user's public CTUID (found in User Management tab)</small>
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

            {/* Moderator Conversations View */}
            {activeView === 'mod-conversations' && (
                <div className="mod-conversations-view">
                    {!selectedModConversation ? (
                        <>
                            <div className="info-card">
                                <h4>Moderator Message Conversations</h4>
                                <p>View and manage all conversations initiated by moderators. Messages appear to users as from "Moderator" but logs show which admin/mod sent them.</p>
                                <div className="conversation-controls">
                                    <button 
                                        className="btn-refresh"
                                        onClick={() => fetchModConversations()}
                                        disabled={loading}
                                        title="Refresh conversations (auto-refreshes every 5 seconds)"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading">Loading conversations...</div>
                            ) : modConversations.length === 0 ? (
                                <div className="no-results">No moderator conversations yet</div>
                            ) : (
                                <div className="conversations-list">
                                    {modConversations.map((conv) => (
                                        <div key={conv._id} className="conversation-card">
                                            <div className="conversation-header">
                                                <div className="conversation-user">
                                                    <strong>{conv.otherUser?.breederName || conv.otherUser?.personalName || `User ${conv.otherUserId}`}</strong>
                                                    <span className="user-id">{conv.otherUserId}</span>
                                                </div>
                                                <span className="last-message-date">
                                                    {new Date(conv.lastMessageAt).toLocaleString('en-GB')}
                                                </span>
                                            </div>
                                            <div className="conversation-details">
                                                <div className="last-message">
                                                    {conv.lastMessage?.substring(0, 100)}
                                                    {conv.lastMessage?.length > 100 ? '...' : ''}
                                                </div>
                                                <div className="conversation-meta">
                                                    <span>Messages: {conv.messageCount || 0}</span>
                                                    {conv.initiatedBy && (
                                                        <span className="initiated-by">Started by: {conv.initiatedBy}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="conversation-actions">
                                                <button 
                                                    className="btn-view"
                                                    onClick={() => handleViewModConversation(conv._id, conv.otherUserId)}
                                                >
                                                    📖 View
                                                </button>
                                                <button 
                                                    className="btn-close"
                                                    onClick={() => handleCloseModConversation(conv._id, conv.otherUserId)}
                                                >
                                                    🗑️ Close
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="conversation-thread">
                            <div className="thread-header">
                                <button 
                                    className="btn-back"
                                    onClick={() => {
                                        setSelectedModConversation(null);
                                        setConversationMessages([]);
                                        fetchModConversations();
                                    }}
                                >
                                    ← Back to Conversations
                                </button>
                                <div className="thread-info">
                                    <strong>{selectedModConversation.otherUser?.displayName || selectedModConversation.otherUser?.breederName || selectedModConversation.otherUser?.personalName || `User ${selectedModConversation.otherUserId}`}</strong>
                                    <span className="user-id">{selectedModConversation.otherUserId}</span>
                                </div>
                                <div className="thread-actions">
                                    <button 
                                        className="btn-refresh"
                                        onClick={() => fetchConversationMessagesQuiet(selectedModConversation.otherUserId)}
                                        disabled={loading}
                                        title="Refresh messages (auto-refreshes every 3 seconds)"
                                    >
                                        🔄
                                    </button>
                                    <button 
                                        className="btn-close-thread"
                                        onClick={() => handleCloseModConversation(selectedModConversation._id, selectedModConversation.otherUserId)}
                                    >
                                        🗑️ Close Conversation
                                    </button>
                                </div>
                            </div>

                            <div className="messages-container">
                                {conversationMessages.map((msg, idx) => (
                                    <div 
                                        key={msg._id || idx} 
                                        className={`message ${msg.senderId === selectedModConversation.otherUserId ? 'received' : 'sent'}`}
                                    >
                                        <div className="message-content">
                                            <div className="message-text">{msg.message}</div>
                                            <div className="message-meta">
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleString('en-GB')}
                                                </span>
                                                {msg.sentBy && (
                                                    <span className="sent-by-mod">
                                                        (Internal: Sent by {msg.sentBy})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendModMessage} className="reply-form">
                                <textarea
                                    value={newModMessage}
                                    onChange={(e) => setNewModMessage(e.target.value)}
                                    placeholder="Reply as Moderator..."
                                    disabled={loading}
                                    rows="3"
                                    maxLength="1000"
                                />
                                <div className="reply-actions">
                                    <span className="char-count">{newModMessage.length}/1000</span>
                                    <button type="submit" className="btn-send" disabled={loading || !newModMessage.trim()}>
                                        {loading ? 'Sending...' : '📤 Send Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
