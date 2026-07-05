import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { BroadcastPoll } from './Banners';

const NewsAnnouncements = ({ API_BASE_URL, authToken }) => {
    const [items, setItems] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dismissedBroadcastIds] = useState(() => {
        try {
            const saved = localStorage.getItem('dismissedBroadcasts');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const fetchAnnouncements = async () => {
            if (!authToken) {
                setLoading(false);
                return;
            }
            try {
                // Fetch all notifications and filter for public broadcasts, similar to NotificationsHub
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const allNotifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];

                const publicBroadcasts = allNotifications.filter(n => {
                    const isPublicType = ['announcement', 'poll', 'info', 'broadcast'].includes(n.type);
                    const isNotUrgent = n.broadcastType !== 'warning' && n.broadcastType !== 'alert';
                    const isNotDismissed = !dismissedBroadcastIds.includes(n._id);
                    return isPublicType && isNotUrgent && isNotDismissed;
                });

                // Sort by creation date, newest first
                const sortedItems = publicBroadcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setItems(sortedItems);
            } catch (error) {
                console.error("Error fetching announcements & polls:", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [API_BASE_URL, authToken, dismissedBroadcastIds]);

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    if (loading) {
        return <div className="flex justify-center items-center py-16"><Loader2 className="animate-spin text-cyan-600" size={32} /></div>;
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="font-medium">No announcements right now.</p>
                <p className="text-sm">Check back later for updates!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const isExpanded = expandedItemId === item._id;
                const isPoll = item.broadcastType === 'poll' || item.type === 'poll';
                const title = isPoll ? (item.pollQuestion || item.title) : (item.title || 'Announcement');

                const toggleExpand = () => {
                    setExpandedItemId(isExpanded ? null : item._id);
                };

                return (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={toggleExpand}
                        >
                            <p className="text-sm font-bold text-gray-800 pr-2">{title}</p>
                            <div className="flex items-center gap-2 text-gray-500 flex-shrink-0">
                                <p className="text-xs font-medium">{formatTimeAgo(item.createdAt)}</p>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </div>
                        {isExpanded && (
                            <div className="p-3 border-t border-gray-200">
                                {isPoll ? (
                                    <BroadcastPoll broadcast={item} authToken={authToken} API_BASE_URL={API_BASE_URL} isEmbedded={true} />
                                ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.message || item.content || ''}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default NewsAnnouncements;