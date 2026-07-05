import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const NewsAnnouncements = ({ API_BASE_URL }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Assuming a public endpoint for announcements exists
                const response = await axios.get(`${API_BASE_URL}/public/broadcasts?type=announcement&active=true`);
                setAnnouncements(response.data || []);
            } catch (error) {
                console.error("Error fetching announcements:", error);
                setAnnouncements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [API_BASE_URL]);

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

    if (announcements.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="font-medium">No announcements right now.</p>
                <p className="text-sm">Check back later for updates!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {announcements.map(announcement => (
                <div key={announcement._id} className="bg-cyan-50/50 p-3 rounded-lg border border-cyan-200/60">
                    <p className="text-xs font-semibold text-cyan-700 mb-1">{formatTimeAgo(announcement.createdAt)}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                </div>
            ))}
        </div>
    );
};

export default NewsAnnouncements;