import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, X, GraduationCap } from 'lucide-react';

// Small page-header "info" button — click to reveal a short contextual hint popover,
// click outside (or the X) to close it. Reused across page headers app-wide.
// Default align="left" expands the popover rightward from the trigger, since triggers
// sit near the start of a header row — right-aligning it would push it off-screen.
// variant="light" is for use on colored/gradient headers (e.g. white text) where the
// default muted-gray trigger icon wouldn't have enough contrast.
// lessonId (optional) links to a matching lesson id in tutorialLessonsNew.js — shows a
// "View related tutorial" action that jumps straight to it on the Tutorials page.
const InfoButton = ({ children, title, align = 'left', variant = 'default', className = '', lessonId }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();

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

    const goToLesson = () => {
        setOpen(false);
        navigate(`/tutorials?lesson=${encodeURIComponent(lessonId)}`);
    };

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className={variant === 'light'
                    ? 'p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition'
                    : 'p-1.5 rounded-full text-gray-400 dark:text-dark-text-muted hover:text-primary-dark dark:hover:text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition'}
                title="Page info"
                aria-label="Page info"
            >
                <Info size={18} />
            </button>
            {open && (
                <div className={`absolute z-50 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-3 font-normal ${align === 'right' ? 'right-0' : 'left-0'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        {title && <h4 className="text-sm font-semibold text-gray-800 dark:text-dark-text">{title}</h4>}
                        <button onClick={() => setOpen(false)} className="p-0.5 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text ml-auto -mt-0.5 -mr-0.5" aria-label="Close">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-dark-text-secondary leading-relaxed space-y-1.5">
                        {children}
                    </div>
                    {lessonId && (
                        <button
                            type="button"
                            onClick={goToLesson}
                            className="mt-2.5 pt-2 border-t border-gray-100 dark:border-dark-border w-full flex items-center gap-1.5 text-xs font-semibold text-primary-dark dark:text-dark-primary hover:underline"
                        >
                            <GraduationCap size={14} />
                            View related tutorial
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default InfoButton;
