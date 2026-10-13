import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import SectionCard, { linkClass } from './SectionCard';

const chip = 'text-xs font-semibold bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text px-2.5 py-1 rounded-full';

const FavoritesSummaryCard = ({ authToken, API_BASE_URL }) => {
    const [counts, setCounts] = useState({ animals: null, breeders: null });

    useEffect(() => {
        if (!authToken) return;
        Promise.all([
            apiClient.get('/favorites/animals').catch(() => null),
            apiClient.get('/favorites/users').catch(() => null),
        ]).then(([a, u]) => setCounts({
            animals: a ? (a.data || []).length : null,
            breeders: u ? (u.data || []).length : null,
        }));
    }, [authToken, API_BASE_URL]);

    return (
        <SectionCard title="Favorites" icon={Star} iconClass="text-purple-500">
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2">Your saved animals and breeders.</p>
            <div className="flex flex-wrap gap-2 mb-3">
                <span className={chip}>Animals{counts.animals !== null ? ` (${counts.animals})` : ''}</span>
                <span className={chip}>Breeders{counts.breeders !== null ? ` (${counts.breeders})` : ''}</span>
            </div>
            <Link to="/community/favorites" className={linkClass}>View favorites →</Link>
        </SectionCard>
    );
};

export default FavoritesSummaryCard;
