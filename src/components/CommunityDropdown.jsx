import React from 'react';
import { NavLink } from 'react-router-dom';
import { Star, Rss, BookUser, Users } from 'lucide-react';

const communityLinks = [
  { href: '/community', label: 'Overview', icon: <Users size={16} className="mr-2" />, end: true },
  { href: '/community/favorites', label: 'Favorites', icon: <Star size={16} className="mr-2" /> },
  { href: '/community/news', label: 'News', icon: <Rss size={16} className="mr-2" /> },
  { href: '/community/breeders', label: 'Breeders', icon: <BookUser size={16} className="mr-2" /> },
];

const CommunityDropdown = ({ onLinkClick }) => (
  <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-card-bg ring-1 ring-black dark:ring-dark-text ring-opacity-5 focus:outline-none py-1 z-10">
    {communityLinks.map((link) => (
      <NavLink
        key={link.href}
        to={link.href}
        end={link.end}
        onClick={onLinkClick}
        className={({ isActive }) =>
          `flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover ${
            isActive ? 'bg-gray-100 dark:bg-dark-surface font-semibold' : ''
          }`
        }
      >
        {link.icon}
        {link.label}
      </NavLink>
    ))}
  </div>
);

export default CommunityDropdown;
