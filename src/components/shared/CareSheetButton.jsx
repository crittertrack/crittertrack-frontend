import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { buildAnimalCareSheet, buildEnclosureCareSheet, printCareSheet } from '../../utils/careSheetPrint';

const CareSheetButton = ({ type, animal, enclosure, enclosureInfo, animals = [], compact = false }) => {
    const [error, setError] = useState('');

    const handlePrint = () => {
        try {
            const sheet = type === 'enclosure'
                ? buildEnclosureCareSheet(enclosure, animals)
                : buildAnimalCareSheet(animal, enclosureInfo);
            printCareSheet(sheet);
            setError('');
        } catch (printError) {
            console.error('Failed to open printable care sheet:', printError);
            setError(printError.message || 'Could not open the printable care sheet.');
        }
    };

    return (
        <div className="relative inline-flex flex-col items-end">
            <button
                type="button"
                onClick={handlePrint}
                className={compact
                    ? 'p-2 bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-300 dark:hover:bg-dark-surface-hover transition'
                    : 'px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg font-semibold transition flex items-center gap-2'}
                title="Print care sheet"
                aria-label="Print care sheet"
            >
                <ClipboardList size={compact ? 16 : 18} />
                {!compact && 'Care Sheet'}
            </button>
            {error && (
                <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-56 rounded bg-red-50 p-2 text-xs text-red-700 shadow dark:bg-red-900/80 dark:text-red-200">
                    {error}
                </span>
            )}
        </div>
    );
};

export default CareSheetButton;
