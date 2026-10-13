import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Cat, User } from 'lucide-react';
import SectionCard, { linkClass } from './SectionCard';
import { getRecentlyViewed } from '../../utils/recentlyViewed';

const PREVIEW = 5;

const RecentlyViewedSection = () => {
    const navigate = useNavigate();
    const [items] = useState(() => getRecentlyViewed());
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? items : items.slice(0, PREVIEW);

    return (
        <SectionCard
            title="Recently Viewed"
            icon={History}
            iconClass="text-primary-dark"
            action={items.length > PREVIEW && (
                <button type="button" onClick={() => setShowAll(v => !v)} className={linkClass}>
                    {showAll ? 'Show less' : 'View all →'}
                </button>
            )}
        >
            {items.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">Animals and breeders you open will show up here.</p>
            ) : (
                <ul className="space-y-1">
                    {visible.map(item => {
                        const isAnimal = item.type === 'animal';
                        return (
                            <li key={`${item.type}-${item.id}`}>
                                <button
                                    type="button"
                                    onClick={() => navigate(isAnimal ? `/animal/${item.id}` : `/user/${item.id}`)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition text-left"
                                >
                                    <span className={`w-11 h-11 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-gray-400 dark:text-dark-text-muted ${isAnimal ? 'rounded-lg' : 'rounded-full'}`}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                                        ) : isAnimal ? <Cat size={22} /> : <User size={22} />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-gray-800 dark:text-dark-text truncate">{item.name}</span>
                                        <span className="block text-xs text-gray-500 dark:text-dark-text-muted truncate">
                                            {isAnimal ? 'Animal' : 'Breeder'}{item.subtitle ? ` · ${item.subtitle}` : ''}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </SectionCard>
    );
};

export default RecentlyViewedSection;
