import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import { Users, Loader2 } from 'lucide-react';
import InfoButton from '../shared/InfoButton';
import RecentActivitySection from './RecentActivitySection';
import RecentlyViewedSection from './RecentlyViewedSection';
import RecentlyAddedAnimalsSection from './RecentlyAddedAnimalsSection';
import FavoritesSummaryCard from './FavoritesSummaryCard';

// Helper to check if a user has a publicly visible name
const hasVisibleName = (u) => (u.showBreederName && u.breederName) || (u.showPersonalName && u.personalName);

const CommunityPage = ({ authToken, API_BASE_URL, userProfile }) => {
    const [communityUsers, setCommunityUsers] = useState([]);
    const [recentActivityUsers, setRecentActivityUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch active community users and new users
    useEffect(() => {
        const fetchCommunityUsers = async () => {
            try {
                const response = await apiClient.get(`/public/users/active?minutes=60&limit=5`);
                let active = response.data || [];
                
                const clean = active.filter(u => u.id_public && u.accountStatus !== 'banned' && u.id_public !== 'CTU1' && hasVisibleName(u));
                
                setCommunityUsers(clean.slice(0, 5).map(u => ({ ...u, isActive: true })));
            } catch (error) {
                console.error('Error fetching community users:', error);
            }
        };

        const fetchNewUsers = async () => {
            try {
                const newUsersRes = await apiClient.get(`/public/users/newest?limit=25`).catch(() => ({ data: [] }));
                // Filter new users to only show public ones
                const publicUsers = (newUsersRes.data || []).filter(u => 
                    u.id_public && 
                    u.accountStatus !== 'banned' && 
                    u.id_public !== 'CTU1' && 
                    hasVisibleName(u)
                );
                setNewUsers(publicUsers.slice(0, 5));
            } catch (error) {
                console.error('Error fetching new users:', error);
            }
        };

        if (authToken) {
            Promise.all([fetchCommunityUsers(), fetchNewUsers()]).finally(() => setLoading(false));
            const interval = setInterval(fetchCommunityUsers, 120000); // Refresh active users every 2 minutes
            return () => clearInterval(interval);
        }
    }, [authToken, API_BASE_URL]);

    // Combine active and new users for the "Recent Activity" section
    useEffect(() => {
        // Define "new" as within the last 30 days
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        const monthlyNewUsers = newUsers.filter(u => new Date(u.createdAt) > oneMonthAgo);

        let usersForActivity = [];

        if (monthlyNewUsers.length > 0) {
            // We have new users. Show up to 3 active, then fill with new.
            const activeUsers = communityUsers.slice(0, 3);
            const activeUserIds = new Set(activeUsers.map(u => u.id_public));

            const newUsersNotActive = monthlyNewUsers.filter(u => !activeUserIds.has(u.id_public));
            const newUsersToShowCount = 5 - activeUsers.length;
            const newUsersToDisplay = newUsersNotActive.slice(0, newUsersToShowCount).map(u => ({ ...u, isNew: true }));

            usersForActivity = [...activeUsers, ...newUsersToDisplay];
        } else {
            // No new users in the last month, so just show up to 5 active users.
            usersForActivity = communityUsers.slice(0, 5);
        }

        setRecentActivityUsers(usersForActivity);
    }, [communityUsers, newUsers]);


    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                <Users size={32} className="text-primary" />
                Community
                <InfoButton title="Community" lessonId="community-overview">
                    <p>See who is active, jump back to what you viewed recently, discover newly published animals and open your favorites. Use the Community menu for News and the Breeders directory.</p>
                </InfoButton>
            </h1>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="space-y-4">
                    <RecentActivitySection users={recentActivityUsers} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <RecentlyViewedSection />
                        <FavoritesSummaryCard authToken={authToken} API_BASE_URL={API_BASE_URL} />
                    </div>
                    <RecentlyAddedAnimalsSection authToken={authToken} API_BASE_URL={API_BASE_URL} />
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
