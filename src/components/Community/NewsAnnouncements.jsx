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

    const getCardStyles = (item) => {
        const isPoll = item.broadcastType === 'poll' || item.type === 'poll';
        const isAnnouncement = item.broadcastType === 'announcement' || item.type === 'announcement';

        if (isPoll) {
            return {
                card: 'bg-cyan-50 border-cyan-200',
                header: 'hover:bg-cyan-100',
                title: 'text-cyan-800',
                meta: 'text-cyan-600',
                border: 'border-cyan-200',
            };
        }
        if (isAnnouncement) {
            return {
                card: 'bg-purple-50 border-purple-200',
                header: 'hover:bg-purple-100',
                title: 'text-purple-800',
                meta: 'text-purple-600',
                border: 'border-purple-200',
            };
        }
        // Default to info style
        return { card: 'bg-blue-50 border-blue-200', header: 'hover:bg-blue-100', title: 'text-blue-800', meta: 'text-blue-600', border: 'border-blue-200' };
    };

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
                const styles = getCardStyles(item);

                const toggleExpand = () => {
                    setExpandedItemId(isExpanded ? null : item._id);
                };

                return (
                    <div key={item._id} className={`rounded-lg shadow-sm border overflow-hidden ${styles.card}`}>
                        <div 
                            className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${styles.header}`}
                            onClick={toggleExpand}
                        >
                            <p className={`text-sm font-bold pr-2 ${styles.title}`}>{title}</p>
                            <div className={`flex items-center gap-2 flex-shrink-0 ${styles.meta}`}>
                                <p className="text-xs font-medium">{formatTimeAgo(item.createdAt)}</p>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </div>
                        {isExpanded && (
                            <div className={`p-3 border-t bg-white ${styles.border}`}>
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