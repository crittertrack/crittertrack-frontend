import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, Loader2, Bell, Users } from 'lucide-react';

const Communication = ({ authToken, API_BASE_URL, userRole }) => {
    const [view, setView] = useState('broadcast'); // 'broadcast', 'templates', 'moderator-chat'
    const [message, setMessage] = useState('');
    const [recipientType, setRecipientType] = useState('all'); // 'all', 'users', 'mods'
    const [sending, setSending] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [messagesSent, setMessagesSent] = useState(0);
    const [moderatorChat, setModeratorChat] = useState([]);

    useEffect(() => {
        fetchTemplates();
        if (userRole === 'admin' || userRole === 'moderator') {
            fetchModeratorChat();
        }
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/email-templates`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchModeratorChat = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/moderator-chat`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setModeratorChat(data);
            }
        } catch (error) {
            console.error('Error fetching moderator chat:', error);
        }
    };

    const handleSendBroadcast = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        setSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/send-broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    message,
                    recipientType,
                    type: 'announcement'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessagesSent(data.sentTo || 0);
                alert(`Message sent to ${data.sentTo || 0} users`);
                setMessage('');
            }
        } catch (error) {
            console.error('Error sending broadcast:', error);
            alert('Error sending broadcast');
        } finally {
            setSending(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName || !templateContent) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/email-templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: templateName,
                    content: templateContent
                })
            });

            if (response.ok) {
                fetchTemplates();
                setTemplateName('');
                setTemplateContent('');
                setShowTemplateForm(false);
                alert('Template saved');
            }
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Delete this template?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/email-templates/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                fetchTemplates();
            }
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    return (
        <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Communication Tools</h3>

            {/* View Selector */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { id: 'broadcast', label: 'Broadcast Messages', icon: Mail },
                    { id: 'templates', label: 'Email Templates', icon: Mail },
                    ...(userRole === 'admin' || userRole === 'moderator' 
                        ? [{ id: 'moderator-chat', label: 'Moderator Chat', icon: MessageSquare }] 
                        : [])
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`px-4 py-3 font-medium border-b-2 transition flex items-center gap-2 ${
                            view === tab.id
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Broadcast Messages */}
            {view === 'broadcast' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Send Broadcast Message</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Send to:
                            </label>
                            <select
                                value={recipientType}
                                onChange={(e) => setRecipientType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active Users Only</option>
                                <option value="moderators">Moderators Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Message *
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message..."
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> This message will be sent as an in-app notification and email to selected users.
                            </p>
                        </div>

                        <button
                            onClick={handleSendBroadcast}
                            disabled={sending}
                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Broadcast
                                </>
                            )}
                        </button>

                        {messagesSent > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    ✓ Message sent to {messagesSent} users
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Email Templates */}
            {view === 'templates' && (
                <div className="space-y-6">
                    <button
                        onClick={() => setShowTemplateForm(!showTemplateForm)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Create New Template
                    </button>

                    {showTemplateForm && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="Template Name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                                <textarea
                                    value={templateContent}
                                    onChange={(e) => setTemplateContent(e.target.value)}
                                    placeholder="Template Content"
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveTemplate}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Save Template
                                    </button>
                                    <button
                                        onClick={() => setShowTemplateForm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(template => (
                            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <h5 className="font-bold text-gray-800 mb-2">{template.name}</h5>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                        Use
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Moderator Chat */}
            {view === 'moderator-chat' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Moderator Chat</h4>
                    <div className="bg-gray-50 rounded-lg h-96 p-4 overflow-y-auto mb-4 flex flex-col space-y-4">
                        {moderatorChat.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">No messages yet</p>
                        ) : (
                            moderatorChat.map((msg, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{msg.author}</p>
                                        <p className="text-sm text-gray-700">{msg.content}</p>
                                        <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                        />
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Communication;
