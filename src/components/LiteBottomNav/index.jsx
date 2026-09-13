import React from 'react';
import { Cat, FolderOpen, Home, BookOpen } from 'lucide-react';

// Full-width bottom nav shown only in Lite mode (desktop/PWA web only — caller gates this).
// Mirrors crittertrack-lite's own BottomNav.jsx (same 4 destinations/order/labels), but reuses
// the full website's own existing icons for each, per this codebase's icons-source-of-truth rule.
const NAV_ITEMS = [
    { key: 'list', label: 'Animals', icon: Cat, path: '/' },
    { key: 'collections', label: 'Collections', icon: FolderOpen, path: '/', animalView: 'collections' },
    { key: 'enclosures', label: 'Enclosures', icon: Home, path: '/', animalView: 'enclosures' },
    { key: 'litters', label: 'Litters', icon: BookOpen, path: '/litters' },
];

const LiteBottomNav = ({ navigate, currentView, currentAnimalView }) => {
    const isActive = (item) => {
        if (item.path === '/litters') return currentView === 'litters';
        if (item.animalView) return currentView === 'list' && currentAnimalView === item.animalView;
        return currentView === 'list' && currentAnimalView === 'list';
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card-bg border-t border-gray-200 dark:border-dark-text-muted flex items-stretch z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                    <button
                        key={item.key}
                        onClick={() => navigate(item.path, item.animalView ? { state: { animalView: item.animalView } } : undefined)}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition duration-150 ${
                            active ? 'text-primary-dark dark:text-dark-primary' : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text'
                        }`}
                    >
                        <Icon size={20} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default LiteBottomNav;
