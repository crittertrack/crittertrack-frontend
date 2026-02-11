import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, RefreshCw, MessageSquare } from 'lucide-react';
import './ModChatTab.css';

export default function ModChatTab({ API_BASE_URL, authToken, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(() => {
            fetchMessages(true); // silent refresh
        }, 10000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const fetchMessages = async (silent = false) => {
        if (!silent) setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/mod-chat?limit=50`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Silently fail if endpoint not available yet
                if (!silent) setLoading(false);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch messages');
            }

            setMessages(data.messages || []);
            setHasMore(data.hasMore || false);
            
            // Scroll to bottom on initial load
            if (!silent) {
                setTimeout(() => scrollToBottom(), 100);
            }
        } catch (err) {
            if (!silent) setError(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/mod-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ message: newMessage.trim() })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Endpoint returned non-JSON (status: ${response.status})`);
            }

            const data = await response.json();
            console.log('Mod chat response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setMessages(prev => [...prev, data.message]);
            setNewMessage('');
            setTimeout(() => scrollToBottom(), 100);
        } catch (err) {
            console.error('Mod chat error:', err);
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/mod-chat/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Silently fail if endpoint not available yet
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete message');
            }

            setMessages(prev => prev.filter(m => m._id !== messageId));
        } catch (err) {
            setError(err.message);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) return time;
        if (isYesterday) return `Yesterday ${time}`;
        return `${date.toLocaleDateString('en-GB')} ${time}`;
    };

    const getRoleBadge = (role) => {
        if (role === 'admin') return <span className="mod-chat-role-badge admin">Admin</span>;
        if (role === 'moderator') return <span className="mod-chat-role-badge moderator">Mod</span>;
        return null;
    };

    return (
        <div className="mod-chat-container">
            <div className="mod-chat-header">
                <div className="mod-chat-title">
                    <MessageSquare size={20} />
                    <h3>Mod Team Chat</h3>
                </div>
                <div className="mod-chat-controls">
                    <label className="auto-refresh-toggle">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span>Auto-refresh</span>
                    </label>
                    <button 
                        className="refresh-btn"
                        onClick={() => fetchMessages()}
                        disabled={loading}
                        title="Refresh messages"
                    >
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mod-chat-error">
                    {error}
                </div>
            )}

            <div className="mod-chat-messages" ref={chatContainerRef}>
                {loading && messages.length === 0 ? (
                    <div className="mod-chat-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="mod-chat-empty">
                        <MessageSquare size={48} />
                        <p>No messages yet</p>
                        <span>Start the conversation!</span>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => {
                            const isOwnMessage = msg.senderId?._id === currentUserId || msg.senderId?.id_public === currentUserId;
                            const showDateSeparator = index === 0 || 
                                new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1]?.createdAt).toDateString();

                            return (
                                <React.Fragment key={msg._id}>
                                    {showDateSeparator && (
                                        <div className="mod-chat-date-separator">
                                            <span>{new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                    <div className={`mod-chat-message ${isOwnMessage ? 'own' : ''}`}>
                                        <div className="mod-chat-message-header">
                                            <span className="mod-chat-sender">
                                                {msg.senderId?.personalName || msg.senderId?.email || 'Unknown'}
                                            </span>
                                            {getRoleBadge(msg.senderId?.role)}
                                            <span className="mod-chat-time">{formatTime(msg.createdAt)}</span>
                                            {isOwnMessage && (
                                                <button 
                                                    className="mod-chat-delete-btn"
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                    title="Delete message"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="mod-chat-message-content">
                                            {msg.message}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <form className="mod-chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    disabled={sending}
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim() || sending}
                    title="Send message"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
