import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Loader2, MessageSquare, User, ArrowLeft, Ban, Flag, Trash2 } from 'lucide-react';
import { DonationBadge, getDonationBadge } from '../../utils/donationUtils';

// ==================== MESSAGES VIEW ====================
const MessagesView = ({ authToken, API_BASE_URL, onClose, showModalMessage, selectedConversation, setSelectedConversation, userProfile }) => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const prevMessageCountRef = useRef(0);
    const prevConversationRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        
        // Poll for new conversations every 5 seconds
        const interval = setInterval(() => {
            fetchConversations();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.otherUserId);
        }
    }, [selectedConversation]);

    useEffect(() => {
        // Poll for new messages every 3 seconds when a conversation is open
        if (!selectedConversation) return;
        
        const interval = setInterval(() => {
            fetchMessages(selectedConversation.otherUserId);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    useEffect(() => {
        // Scroll to bottom only when switching conversation or when new messages arrive
        const conversationChanged = prevConversationRef.current !== selectedConversation?.otherUserId;
        const newMessagesArrived = messages.length > prevMessageCountRef.current;
        if (conversationChanged || newMessagesArrived) {
            messagesEndRef.current?.scrollIntoView({ behavior: conversationChanged ? 'auto' : 'smooth' });
        }
        prevMessageCountRef.current = messages.length;
        prevConversationRef.current = selectedConversation?.otherUserId;
    }, [messages, selectedConversation]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setConversations(response.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/conversation/${otherUserId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            showModalMessage && showModalMessage('Error', 'Failed to load messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            await axios.post(`${API_BASE_URL}/messages/send`, {
                receiverId: selectedConversation.otherUserId,
                message: newMessage.trim()
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setNewMessage('');
            await fetchMessages(selectedConversation.otherUserId);
            await fetchConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            showModalMessage && showModalMessage('Error', error.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getDisplayName = (user) => {
        if (!user) return 'Unknown User';
        return (user.showBreederName && user.breederName) 
            ? user.breederName 
            : (user.showPersonalName ? user.personalName : `User ${user.id_public}`);
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            await fetchMessages(selectedConversation.otherUserId);
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to delete message');
        }
    };

    const handleDeleteConversation = async () => {
        if (!window.confirm('Delete entire conversation? This cannot be undone.')) return;
        try {
            await axios.delete(`${API_BASE_URL}/messages/conversation/${selectedConversation.otherUserId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSelectedConversation(null);
            await fetchConversations();
            showModalMessage && showModalMessage('Success', 'Conversation deleted');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to delete conversation');
        }
    };

    const handleBlockUser = async () => {
        if (!window.confirm(`Block ${getDisplayName(selectedConversation.otherUser)}?`)) return;
        try {
            await axios.post(`${API_BASE_URL}/messages/block/${selectedConversation.otherUserId}`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSelectedConversation(null);
            await fetchConversations();
            showModalMessage && showModalMessage('Success', 'User blocked');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to block user');
        }
    };

    const handleReportConversation = async () => {
        const reason = window.prompt('Why are you reporting this conversation? (max 1000 characters)');
        if (!reason) return;
        if (reason.length > 1000) {
            showModalMessage && showModalMessage('Error', 'Report reason too long');
            return;
        }
        try {
            // Get messages from the last 24 hours
            const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
            const recentMessages = messages
                .filter(msg => new Date(msg.createdAt).getTime() > twentyFourHoursAgo)
                .map(msg => ({
                    messageId: msg._id,
                    senderId: msg.senderId,
                    message: msg.message,
                    createdAt: msg.createdAt
                }));
            
            await axios.post(`${API_BASE_URL}/reports/message`, {
                conversationUserId: selectedConversation.otherUserId,
                reportedUserId: selectedConversation.otherUserId,
                reason: reason.trim(),
                recentMessages: recentMessages
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage && showModalMessage('Success', 'Report submitted to support team');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to submit report');
        }
    };

    const handleReportMessage = async (messageId, messageContent) => {
        const reason = window.prompt(`Why are you reporting this message?\n\n"${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}"\n\n(max 1000 characters)`);
        if (!reason) return;
        if (reason.length > 1000) {
            showModalMessage && showModalMessage('Error', 'Report reason too long');
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/reports/message`, {
                messageId: messageId,
                reportedUserId: selectedConversation.otherUserId,
                reason: reason.trim()
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage && showModalMessage('Success', 'Message reported to support team');
        } catch (error) {
            showModalMessage && showModalMessage('Error', 'Failed to submit report');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
        } else if (diffInHours < 168) { // Less than a week
            return date.toLocaleDateString('en-GB', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] sm:h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-2 sm:p-4 border-b">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-1 sm:gap-2">
                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                        Messages
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition p-1">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Conversations List - Hidden on mobile when conversation selected */}
                    <div className={`${selectedConversation ? 'hidden sm:flex' : 'flex'} sm:w-1/3 w-full border-r overflow-y-auto flex-col`}>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-gray-400 w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-3 sm:p-4 text-center text-gray-500">
                                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm sm:text-base">No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.conversationId}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-2 sm:p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                                        selectedConversation?.conversationId === conv.conversationId ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                            {conv.otherUser?.profileImage ? (
                                                <img src={conv.otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-sm truncate flex items-center gap-1">
                                                    {getDisplayName(conv.otherUser)}
                                                    <DonationBadge badge={getDonationBadge(conv.otherUser)} size="xs" />
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                            <p className="text-xs text-gray-400">{formatTime(conv.lastMessageDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Messages Thread */}
                    <div className="flex-1 flex flex-col">
                        {!selectedConversation ? (
                            <div className="flex items-center justify-center h-full text-gray-400 px-4">
                                <div className="text-center">
                                    <MessageSquare size={64} className="mx-auto mb-4 text-gray-200" />
                                    <p>Select a conversation to view messages</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Conversation Header */}
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedConversation(null)}
                                                className="sm:hidden text-gray-600 hover:text-gray-800 transition"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                {selectedConversation.otherUser?.profileImage ? (
                                                    <img src={selectedConversation.otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold flex items-center gap-2">
                                                    {getDisplayName(selectedConversation.otherUser)}
                                                    <DonationBadge badge={getDonationBadge(selectedConversation.otherUser)} size="xs" />
                                                </p>
                                                <p className="text-xs text-gray-500">{selectedConversation.otherUser?.id_public}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleBlockUser}
                                                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                                                title="Block user"
                                            >
                                                <Ban size={18} />
                                            </button>
                                            <button
                                                onClick={handleReportConversation}
                                                className="p-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition"
                                                title="Report conversation"
                                            >
                                                <Flag size={18} />
                                            </button>
                                            <button
                                                onClick={handleDeleteConversation}
                                                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                                                title="Delete conversation"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map(msg => {
                                            const isSentByMe = msg.senderId.toString() === selectedConversation.otherUserId ? false : true;
                                            return (
                                                <div key={msg._id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} group`}>
                                                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                        isSentByMe 
                                                            ? 'bg-blue-500 text-white' 
                                                            : 'bg-gray-200 text-gray-800'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                                        <div className="flex items-center justify-between gap-2 mt-1">
                                                            <p className={`text-xs ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                {formatTime(msg.createdAt)}
                                                            </p>
                                                            {isSentByMe ? (
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white hover:bg-opacity-20 rounded"
                                                                    title="Delete message"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleReportMessage(msg._id, msg.message)}
                                                                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-gray-300 rounded"
                                                                    title="Report message"
                                                                >
                                                                    <Flag size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Send Message Form */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                                    {userProfile?.allowMessages === false ? (
                                        <div className="text-center py-2 text-sm text-gray-500">
                                            You have disabled messages. Enable them in your profile settings to send messages.
                                        </div>
                                    ) : selectedConversation.otherUser?.allowMessages === false ? (
                                        <div className="text-center py-2 text-sm text-gray-500">
                                            This user has disabled messages
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {sending ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={16} />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Send'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { MessagesView };
