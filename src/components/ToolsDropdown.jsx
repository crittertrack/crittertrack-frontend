import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calculator, Dna, BookOpen, Target, TreeDeciduous } from 'lucide-react';

const toolLinks = [
  {
    href: '/tutorials',
    label: 'Tutorials',
    icon: <BookOpen size={16} className="mr-2" />,
  },
  {
    href: '/calculator',
    label: 'Offspring Calculator',
    icon: <Calculator size={16} className="mr-2" />,
  },
  {
    href: '/coi',
    label: 'COI Calculator',
    icon: <Dna size={16} className="mr-2" />,
  },
  {
    href: '/target',
    label: 'Target Outcome',
    icon: <Target size={16} className="mr-2" />,
  },
  {
    href: '/pedigree',
    label: 'Family Tree',
    icon: <TreeDeciduous size={16} className="mr-2" />,
  },
];

const ToolsDropdown = ({ onLinkClick }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark-card-bg ring-1 ring-black ring-opacity-5 dark:ring-dark-text-muted focus:outline-none py-1 z-10">
      {toolLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover ${
              isActive ? 'bg-gray-100 dark:bg-dark-card-bg font-semibold dark:text-dark-text' : ''
            }`
          }
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export default ToolsDropdown;
