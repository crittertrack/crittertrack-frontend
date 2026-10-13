import React, { useState, useEffect } from 'react';
import { Rss, X, ChevronRight } from 'lucide-react';
import apiClient from '../utils/apiClient';
import { renderRichText } from '../utils/richText';

const formatDate = (value) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Logged-out landing page: shows the single most recent news article's title.
// Clicking it opens the full article in a modal.
const LatestNewsCard = () => {
    const [article, setArticle] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        apiClient.get('/public/news?limit=1')
            .then(res => {
                const first = Array.isArray(res.data) ? res.data[0] : null;
                if (!cancelled && first) setArticle(first);
            })
            .catch(error => console.error('Failed to fetch latest news:', error));
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    // No article (or still loading / request failed): render nothing instead of an empty card
    if (!article) return null;

    // Plain-text teaser: drop heading markers, bullets, bold/italic markers and [text](url) syntax
    const preview = String(article.message || '')
        .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')
        .replace(/^\s{0,3}#{1,3}\s+/gm, '')
        .replace(/^\s*-\s+/gm, '')
        .replace(/\*\*|\*|_/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex min-h-[7.5rem] w-full items-start gap-3 rounded-xl bg-white p-4 text-left shadow-lg transition hover:bg-gray-50 dark:bg-dark-card-bg dark:hover:bg-dark-surface-hover"
            >
                <span className="mt-0.5 flex-shrink-0 rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                    <Rss size={18} className="text-orange-500" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-text-muted">
                        Latest News{formatDate(article.createdAt) ? ` · ${formatDate(article.createdAt)}` : ''}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm font-bold text-gray-800 dark:text-dark-text">{article.title}</span>
                    {preview && (
                        <span className="mt-1 line-clamp-3 block text-xs leading-snug text-gray-600 dark:text-dark-text-secondary">{preview}</span>
                    )}
                    <span className="mt-2 block text-xs font-semibold text-primary-dark dark:text-dark-primary">Read full article →</span>
                </span>
                <ChevronRight size={18} className="mt-1 flex-shrink-0 text-gray-400 dark:text-dark-text-muted" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={article.title}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-dark-card-bg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-5 sm:p-6 dark:border-dark-border">
                            <div className="min-w-0">
                                <h2 className="break-words text-xl font-bold text-gray-800 sm:text-2xl dark:text-dark-text">{article.title}</h2>
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted">{formatDate(article.createdAt)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                                className="flex-shrink-0 rounded p-1 text-gray-500 transition hover:bg-gray-100 dark:text-dark-text-muted dark:hover:bg-dark-surface-hover"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5 text-base leading-relaxed text-gray-700 sm:p-6 dark:text-dark-text-secondary">
                            {renderRichText(article.message)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LatestNewsCard;
