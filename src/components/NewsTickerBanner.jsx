import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Rss, BarChart2, Info, Heart } from 'lucide-react';
import './NewsTickerBanner.css';

const NewsTickerBanner = ({ authToken, API_BASE_URL }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        
        const dismissedBroadcasts = JSON.parse(localStorage.getItem('dismissedBroadcasts') || '[]');

        const publicBroadcasts = allNotifications.filter(n => {
            const isPublicType = ['announcement', 'poll', 'info', 'broadcast'].includes(n.type);
            const isNotUrgent = n.broadcastType !== 'warning' && n.broadcastType !== 'alert';
            const isNotDismissed = !dismissedBroadcasts.includes(n._id);
            return isPublicType && isNotUrgent && isNotDismissed;
        });

        const sortedItems = publicBroadcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setNews(sortedItems.slice(0, 5)); // Show latest 5 items in the ticker
      } catch (err) {
        console.error('Failed to fetch news for ticker:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [authToken, API_BASE_URL]);

  if (loading || error || news.length === 0) {
    return null; // Don't render the banner if there's no news
  }

  const getBroadcastIcon = (item) => {
    const isPoll = item.broadcastType === 'poll' || item.type === 'poll';
    const isAnnouncement = item.broadcastType === 'announcement' || item.type === 'announcement';

    if (isPoll) {
        return <BarChart2 size={14} className="inline-block mr-1.5 text-cyan-300 flex-shrink-0" />;
    }
    if (isAnnouncement) {
        return <Rss size={14} className="inline-block mr-1.5 text-purple-300 flex-shrink-0" />;
    }
    // Default to info
    return <Info size={14} className="inline-block mr-1.5 text-blue-300 flex-shrink-0" />;
  };

  const animationDuration = (news.length + 1) * 10; // 10 seconds per item

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white text-sm py-1 overflow-hidden relative rounded-lg">
      <div 
        className="news-ticker-container whitespace-nowrap"
        style={{ animationDuration: `${animationDuration}s` }}
      >
        <span className="inline-flex items-center px-4 font-semibold">
          <a
            href="https://ko-fi.com/crittertrack"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center"
          >
            <Heart size={14} className="inline-block mr-1.5 text-pink-400 fill-current" />
            Support CritterTrack on Ko-fi!
          </a>
          <span className="mx-4">|</span>
        </span>
        {news.map((item, index) => (
          <span key={item._id} className="inline-flex items-center px-4">
            <button
              onClick={() => navigate('/community')}
              className="hover:underline bg-transparent border-none text-white p-0 cursor-pointer flex items-center"
            >
              {getBroadcastIcon(item)}
              {item.pollQuestion || item.title}
            </button>
            {index < news.length - 1 && <span className="mx-2">|</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTickerBanner;