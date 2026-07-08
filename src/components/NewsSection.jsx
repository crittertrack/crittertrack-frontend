import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Rss, ChevronDown, ChevronUp } from 'lucide-react';
import { BroadcastPoll } from './Community/Banners';

const NewsItem = ({ item, isExpanded, onToggle, API_BASE_URL, authToken }) => {
    const isPoll = item.broadcastType === 'poll' || item.type === 'poll';
    const isAnnouncement = item.broadcastType === 'announcement' || item.type === 'announcement';
    const title = isPoll ? (item.pollQuestion || item.title) : (item.title || 'Announcement');

    const getCardStyles = () => {
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

    const styles = getCardStyles();

    return (
        <div className={`rounded-lg shadow-sm border overflow-hidden ${styles.card}`}>
            <div className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${styles.header}`} onClick={onToggle}>
                <h3 className={`font-semibold text-sm pr-2 ${styles.title}`}>{title}</h3>
                <div className={`flex items-center gap-2 flex-shrink-0 ${styles.meta}`}>
                    <p className="text-xs font-medium">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>
            {isExpanded && (
                 <div className={`p-3 border-t bg-white ${styles.border}`}>
                    {isPoll ? (
                        <BroadcastPoll broadcast={item} authToken={authToken} API_BASE_URL={API_BASE_URL} isEmbedded={true} />
                    ) : (
                        <>
                            <div className="text-xs text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: item.message || item.content }} />
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                                    Read more
                                </a>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const NewsSection = ({ API_BASE_URL, authToken }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [dismissedBroadcastIds] = useState(() => {
        try {
            const saved = localStorage.getItem('dismissedBroadcasts');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const fetchNews = async () => {
            if (!authToken) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const allNotifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];

                const publicBroadcasts = allNotifications.filter(n => {
                    const isPublicType = ['announcement', 'poll', 'info', 'broadcast'].includes(n.type);
                    const isNotUrgent = n.broadcastType !== 'warning' && n.broadcastType !== 'alert';
                    const isNotDismissed = !dismissedBroadcastIds.includes(n._id);
                    return isPublicType && isNotUrgent && isNotDismissed;
                });

                const sortedItems = publicBroadcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNews(sortedItems);
            } catch (err) {
                console.error('Failed to fetch news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [API_BASE_URL, authToken, dismissedBroadcastIds]);

    const toggleExpand = (itemId) => {
        setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 flex-shrink-0">
                <Rss className="text-orange-500" />
                News & Announcements
            </h2>
            <div className="flex-grow overflow-y-auto -mr-4 pr-4">
                {loading ? (
                    <div className="flex justify-center items-center py-8 h-full">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : news.length > 0 ? (
                    <div className="space-y-4">
                        {news.map(item => (
                            <NewsItem
                                key={item._id}
                                item={item}
                                isExpanded={expandedItemId === item._id}
                                onToggle={() => toggleExpand(item._id)}
                                API_BASE_URL={API_BASE_URL}
                                authToken={authToken}
                            />
                        ))}
                    </div>
                ) : <div className="text-center py-8 bg-gray-50 rounded-lg h-full flex items-center justify-center"><p className="text-gray-500">No news to display at the moment.</p></div>}
            </div>
        </div>
    );
};

export default NewsSection;