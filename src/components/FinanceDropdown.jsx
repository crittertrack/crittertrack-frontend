import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package } from 'lucide-react';

const FinanceDropdown = ({ onLinkClick }) => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        if (onLinkClick) {
            onLinkClick();
        }
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
            <button onClick={() => handleNavigate('/budget')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                <DollarSign size={15} /> Budget
            </button>
            <button onClick={() => handleNavigate('/supplies')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                <Package size={15} /> Supplies
            </button>
        </div>
    );
};

export default FinanceDropdown;