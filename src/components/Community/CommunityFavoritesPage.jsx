import React from 'react';
import MyFeed from './MyFeed';

// Full Favorites page (Favorite Animals + Favorite Breeders with search), opened from the
// Community overview's Favorites card or the Community menu.
const CommunityFavoritesPage = ({ authToken, API_BASE_URL }) => (
    <div className="w-full max-w-3xl mx-auto p-4">
        <MyFeed authToken={authToken} API_BASE_URL={API_BASE_URL} />
    </div>
);

export default CommunityFavoritesPage;
