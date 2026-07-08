import React, { useState, useEffect } from 'react';
import './NewsTickerBanner.css'; // Import the CSS file for animation

// Mock data for news titles. In a real application, this would be fetched from a backend.
const mockNewsTitles = [
  { id: 1, title: 'New Feature: Advanced Analytics Dashboard Released!', link: '/community/news/1' },
  { id: 2, title: 'Community Event: CritterTrack Annual Meetup - Register Now!', link: '/community/news/2' },
  { id: 3, title: 'Maintenance Alert: Scheduled Downtime on July 15th', link: '/community/news/3' },
  { id: 4, title: 'Tip of the Week: Optimize Your Animal Records for Better Insights', link: '/community/news/4' },
];

const NewsTickerBanner = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    setNews(mockNewsTitles);
  }, []);

  if (news.length === 0) {
    return null; // Don't render the banner if there's no news
  }

  return (
    <div className="w-full bg-purple-700 text-white text-sm py-1 overflow-hidden relative">
      <div className="news-ticker-container whitespace-nowrap">
        {news.map((item, index) => (
          <span key={item.id} className="inline-block px-4">
            <a href={item.link} className="hover:underline">
              {item.title}
            </a>
            {index < news.length - 1 && <span className="mx-2">|</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTickerBanner;