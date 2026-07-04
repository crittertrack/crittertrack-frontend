import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calculator, Dna, Target } from 'lucide-react';

const ToolsDropdown = ({ onLinkClick }) => {
  const linkClass = "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
      <Link to="/tutorials" className={linkClass} onClick={onLinkClick}>
        <BookOpen size={16} />
        <span>Tutorials</span>
      </Link>
      <Link to="/calculator" className={linkClass} onClick={onLinkClick}>
        <Calculator size={16} />
        <span>Genetics Calculator</span>
      </Link>
      <Link to="/coi" className={linkClass} onClick={onLinkClick}>
        <Dna size={16} />
        <span>COI Calculator</span>
      </Link>
      <Link to="/target" className={linkClass} onClick={onLinkClick}>
        <Target size={16} />
        <span>Target Outcome</span>
      </Link>
    </div>
  );
};

export default ToolsDropdown;