import React from 'react';
import { NavLink } from 'react-router-dom';
import { Cat, FolderOpen, Home, BookOpen } from 'lucide-react';

// Full-width bottom bar shown only in Lite mode (see docs/lite-web-toggle-brainstorm.md),
// replacing the legacy top-header nav rows. Labels/order mirror crittertrack-lite's own
// BottomNav.jsx; icons are the full site's existing choices for these concepts (Decision #7).
const NAV_ITEMS = [
    { to: '/', label: 'Animals', icon: Cat, end: true },
    { to: '/collections', label: 'Collections', icon: FolderOpen },
    { to: '/enclosures', label: 'Enclosures', icon: Home },
    { to: '/litters', label: 'Litters', icon: BookOpen },
];

const LiteBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card-bg border-t-2 border-gray-300 dark:border-dark-border flex items-stretch z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                    `flex-1 flex flex-col items-center justify-center gap-1 py-3.5 text-xs font-medium transition ${
                        isActive ? 'text-primary dark:text-dark-primary' : 'text-gray-500 dark:text-dark-text-muted'
                    }`
                }
            >
                <Icon size={20} />
                {label}
            </NavLink>
        ))}
    </nav>
);

export default LiteBottomNav;
