import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Text input + dropdown hybrid ("combobox"): lets the user pick an existing option OR type a
// brand-new value that isn't in the list yet (ZooEasy-style appearance field pattern). The
// caller is responsible for persisting new values (e.g. on animal save) — this component only
// handles the picking/typing UI, it never calls any API itself.
const ComboBoxField = ({ value, onChange, options = [], placeholder = '', className = '', id, name }) => {
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);

    const normalizedValue = (value || '').toLowerCase();
    const filteredOptions = normalizedValue
        ? options.filter(opt => opt.toLowerCase().includes(normalizedValue))
        : options;

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

    const selectOption = (opt) => {
        onChange(opt);
        setOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && open && highlightedIndex >= 0) {
            e.preventDefault();
            selectOption(filteredOptions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={value || ''}
                    onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlightedIndex(-1); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={className || 'mt-1 block w-full py-1.5 px-2 pr-7 text-sm border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text shadow-sm focus:ring-primary focus:border-primary'}
                />
                <button
                    type="button"
                    onClick={() => setOpen(prev => !prev)}
                    tabIndex={-1}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                >
                    <ChevronDown size={14} />
                </button>
            </div>
            {open && filteredOptions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-dark-card-bg border border-gray-300 dark:border-dark-border rounded-md shadow-lg text-sm">
                    {filteredOptions.map((opt, idx) => (
                        <li
                            key={opt}
                            onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`px-2 py-1.5 cursor-pointer ${idx === highlightedIndex ? 'bg-primary/20 dark:bg-dark-primary/20' : 'hover:bg-gray-100 dark:hover:bg-dark-surface-hover'} text-gray-900 dark:text-dark-text`}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ComboBoxField;
