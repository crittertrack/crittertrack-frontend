import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { BroadcastPoll } from './Banners';

const NewsAnnouncements = ({ API_BASE_URL, authToken }) => {
    const [items, setItems] = useState([]);
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
            {items.map(item => {
                if (item.type === 'poll') {
                    return (
                        <BroadcastPoll 
                            key={item._id} 
                            broadcast={item} 
                            authToken={authToken} 
                            API_BASE_URL={API_BASE_URL} 
                            isEmbedded={true} 
                        />
                    );
                }
                // Default to announcement rendering
                return (
                    <div key={item._id} className="bg-cyan-50/50 p-3 rounded-lg border border-cyan-200/60">
                        <p className="text-xs font-semibold text-cyan-700 mb-1">{formatTimeAgo(item.createdAt)}</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default NewsAnnouncements;