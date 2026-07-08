import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Rss } from 'lucide-react';

const NewsItem = ({ item }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-md text-gray-800 mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500 mb-2">
                {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="text-sm text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
            {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                    Read more
                </a>
            )}
        </div>
    );
};

const NewsSection = ({ API_BASE_URL, authToken }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            if (!authToken) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE_URL}/news`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                // Assuming the API returns news sorted by date descending
                setNews(response.data || []);
            } catch (err) {
                console.error('Failed to fetch news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [API_BASE_URL, authToken]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Rss className="text-orange-500" />
                News & Announcements
            </h2>
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : news.length > 0 ? (
                <div className="space-y-4">{news.map(item => <NewsItem key={item.id} item={item} />)}</div>
            ) : <div className="text-center py-8 bg-gray-50 rounded-lg"><p className="text-gray-500">No news to display at the moment.</p></div>}
        </div>
    );
};

export default NewsSection;