import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import { Heart, Loader2, Gem, Flame } from 'lucide-react';

// Public "credits" list of Ko-fi supporters who chose to be shown publicly, driven by the
// backend's /kofi/supporters endpoint (see crittertrack-pedigree/routes/kofiRoutes.js).
const SupportersPage = () => {
    const [supporters, setSupporters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSupporters = async () => {
            try {
                const response = await apiClient.get('/kofi/supporters');
                setSupporters(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Failed to fetch supporters:', err);
                setError('Failed to load supporters. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchSupporters();
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-dark-card-bg p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-3 rounded-full">
                    <Heart size={32} className="text-white fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Our Supporters</h1>
                    <p className="text-gray-500 dark:text-dark-text-muted text-sm">Everyone who's helped keep CritterTrack running</p>
                </div>
            </div>

            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mt-4 mb-6">
                Thank you to every one of our supporters, whether listed here or not — this list only
                includes supporters who chose to be shown publicly on Ko-fi.
            </p>

            {loading && (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="animate-spin text-primary dark:text-dark-primary" size={32} />
                </div>
            )}

            {!loading && error && (
                <p className="text-center text-red-500 py-8">{error}</p>
            )}

            {!loading && !error && supporters.length === 0 && (
                <div className="text-center py-16 text-gray-400 dark:text-dark-text-muted border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg">
                    <p className="font-medium">No public supporters yet.</p>
                    <p className="text-sm">Be the first to show up here!</p>
                </div>
            )}

            {!loading && !error && supporters.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {supporters.map((supporter, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface"
                        >
                            {supporter.isSubscription ? (
                                <span className="bg-gradient-to-r from-blue-400 to-pink-500 p-1.5 rounded-full flex-shrink-0">
                                    <Gem size={14} className="text-white" />
                                </span>
                            ) : (
                                <span className="bg-gradient-to-r from-green-400 to-blue-500 p-1.5 rounded-full flex-shrink-0">
                                    <Flame size={14} className="text-white" />
                                </span>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-dark-text truncate">{supporter.name}</p>
                                {supporter.tierName && (
                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{supporter.tierName}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-8 text-center">
                <a
                    href="https://ko-fi.com/crittertrack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md"
                >
                    <Heart size={18} />
                    Support on Ko-fi
                </a>
            </div>
        </div>
    );
};

export default SupportersPage;
