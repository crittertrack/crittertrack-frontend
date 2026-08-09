import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

// Small page-header "info" button — click to reveal a short contextual hint popover,
// click outside (or the X) to close it. Reused across page headers app-wide.
const InfoButton = ({ children, title, align = 'right', className = '' }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="p-1.5 rounded-full text-gray-400 dark:text-dark-text-muted hover:text-primary-dark dark:hover:text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition"
                title="Page info"
                aria-label="Page info"
            >
                <Info size={18} />
            </button>
            {open && (
                <div className={`absolute z-50 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-3 ${align === 'right' ? 'right-0' : 'left-0'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        {title && <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-text">{title}</h4>}
                        <button onClick={() => setOpen(false)} className="p-0.5 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text ml-auto -mt-0.5 -mr-0.5" aria-label="Close">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-dark-text-secondary leading-relaxed space-y-1.5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfoButton;
