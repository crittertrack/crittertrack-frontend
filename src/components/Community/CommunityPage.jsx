import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, User, ScrollText } from 'lucide-react';
import MyFeed from './MyFeed';
import BreederDirectory from '../PublicProfile/BreederDirectory';
import NewsSection from '../NewsSection';

// Helper to check if a user has a publicly visible name
const hasVisibleName = (u) => (u.showBreederName && u.breederName) || (u.showPersonalName && u.personalName);

const CommunityPage = ({ authToken, API_BASE_URL, userProfile }) => {
    const navigate = useNavigate();
    const [communityUsers, setCommunityUsers] = useState([]);
    const [recentActivityUsers, setRecentActivityUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch active community users and new users
    useEffect(() => {
        const fetchCommunityUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/users/active?minutes=60&limit=5`);
                let active = response.data || [];
                
                const clean = active.filter(u => u.id_public && u.accountStatus !== 'banned' && u.id_public !== 'CTU1' && hasVisibleName(u));
                
                setCommunityUsers(clean.slice(0, 5).map(u => ({ ...u, isActive: true })));
            } catch (error) {
                console.error('Error fetching community users:', error);
            }
        };

        const fetchNewUsers = async () => {
            try {
                const newUsersRes = await axios.get(`${API_BASE_URL}/public/users/newest?limit=25`).catch(() => ({ data: [] }));
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
        // Take 2 most active users
        const active = communityUsers.slice(0, 2);
        const activeIds = new Set(active.map(u => u.id_public));

        // Take 3 newest users that are not in the active list
        const newFiltered = newUsers.filter(u => !activeIds.has(u.id_public)).slice(0, 3);

        // Add a flag to distinguish new users for the badge
        const newWithFlag = newFiltered.map(u => ({ ...u, isNew: true }));

        setRecentActivityUsers([...active, ...newWithFlag]);
    }, [communityUsers, newUsers]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users size={32} className="text-primary" />
                Community
            </h1>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* MyFeed component is temporarily disabled for WIP */}

                    {/* Recent Activity Section */}
                    {recentActivityUsers.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Users size={20} className="text-primary-dark" />
                                Recent Activity
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {recentActivityUsers.map(user => {
                                    const displayName = (user.showBreederName && user.breederName)
                                        ? user.breederName
                                        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                                    return (
                                        <div
                                            key={user.id_public}
                                            className="relative bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer text-center"
                                            onClick={() => navigate(`/user/${user.id_public}`)}
                                        >
                                            {user.isActive && (
                                                <span className="absolute top-2 right-2 w-3 h-3 bg-green-400 border-2 border-white rounded-full" title="Active now" />
                                            )}
                                            <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden mx-auto mb-2">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User size={28} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-semibold text-sm text-gray-800 break-words line-clamp-2 leading-tight">{displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.id_public}</p>
                                            {user.isNew && !user.isActive && (
                                                <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">NEW</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* News and Breeder Directory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {/* News Section */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
                            <NewsSection API_BASE_URL={API_BASE_URL} authToken={authToken} />
                        </div>

                        {/* Breeder Directory Section */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
                            <BreederDirectory
                                authToken={authToken}
                                API_BASE_URL={API_BASE_URL}
                            />
                        </div>
                        {/* My Feed Section */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <MyFeed authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
