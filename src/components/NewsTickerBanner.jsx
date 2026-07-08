import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
        const response = await axios.get(`${API_BASE_URL}/news`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setNews(response.data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError(err);
        // Optionally, fall back to mock data or display a message
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [authToken, API_BASE_URL]);

  if (loading || error || news.length === 0) {
    return null; // Don't render the banner if there's no news
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white text-sm py-1 overflow-hidden relative">
      <div className="news-ticker-container whitespace-nowrap">
        {news.map((item, index) => (
          <span key={item.id} className="inline-block px-4">
            <button
              onClick={() => navigate('/community')}
              className="hover:underline bg-transparent border-none text-white p-0 cursor-pointer"
            >
              {item.title}
            </button>
            {index < news.length - 1 && <span className="mx-2">|</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTickerBanner;