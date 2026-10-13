import React from 'react';
import { Rss } from 'lucide-react';
import NewsSection from '../NewsSection';

const CommunityNewsPage = ({ authToken, API_BASE_URL }) => (
    <div className="w-full p-4">
        <div className="bg-white dark:bg-dark-card-bg rounded-lg shadow-md overflow-hidden">
            <NewsSection API_BASE_URL={API_BASE_URL} authToken={authToken} />
        </div>
    </div>
);

export default CommunityNewsPage;

