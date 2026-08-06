import React from 'react';
import { formatDate } from '../../utils/dateFormatter';

export const InfoCard = ({ title, icon, children, className = '', contentClassName = '' }) => (
    <div className={`bg-white dark:bg-dark-card-bg rounded-lg border border-gray-200 dark:border-dark-border shadow-sm flex flex-col h-full ${className}`}>
        {title && (
            <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-dark-border">
                {icon}
                <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text">{title}</h3>
            </div>
        )}
        <div className={`p-3 space-y-3 flex-1 ${contentClassName}`}>
            {children}
        </div>
    </div>
);

export const InfoItem = ({ label, value, children, compact = false }) => (
    <div>
        <dt className={`${compact ? 'text-[9px] sm:text-xs' : 'text-xs'} font-semibold uppercase tracking-wider text-gray-600 dark:text-dark-text-secondary`}>{label}</dt>
        <dd className={`${compact ? 'text-[11px] sm:text-xs' : 'text-xs'} font-medium text-gray-900 dark:text-dark-text`}>{children || value || <span className="text-gray-500 dark:text-dark-text-muted">N/A</span>}</dd>
    </div>
);

export const TimelineItem = ({ icon, title, description, date }) => (
    <div className="flex items-start gap-4">
        <div className="bg-gray-100 dark:bg-dark-surface rounded-full p-2 text-gray-500 dark:text-dark-text-muted">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{title}</p>
            <p className="text-xs text-gray-700 dark:text-dark-text-secondary">{description}</p>
            <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">{formatDate(date)}</p>
        </div>
    </div>
);

export const StructuredClearanceItem = ({ test, score, date, certId, notes }) => (
    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/60">
        <div className="flex justify-between items-start">
            <p className="font-semibold text-sm text-gray-800 dark:text-dark-text">{test}</p>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold px-2 py-0.5 rounded-full">{score}</span>
        </div>
        <div className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1 space-y-0.5">
            <div><span className="font-medium">Date:</span> {formatDate(date)}</div>
            {certId && <div><span className="font-medium">ID:</span> <span className="font-mono text-xs">{certId}</span></div>}
            {notes && <div className="italic text-gray-500 dark:text-dark-text-muted mt-1">{notes}</div>}
        </div>
    </div>
);

export const StructuredTitleItem = ({ title, org, date }) => (
    <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border">
        <p className="font-semibold text-sm text-gray-800 dark:text-dark-text">{title}</p>
        <div className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
            <span>{org}</span>
            {date && <span className="ml-2">{formatDate(date)}</span>}
        </div>
    </div>
);