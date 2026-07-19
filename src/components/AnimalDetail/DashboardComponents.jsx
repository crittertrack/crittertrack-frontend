import React from 'react';
import { formatDate } from '../../utils/dateFormatter';

export const InfoCard = ({ title, icon, children, className = '', contentClassName = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full ${className}`}>
        {title && (
            <div className="flex items-center gap-3 p-3 border-b border-gray-200">
                {icon}
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            </div>
        )}
        <div className={`p-3 space-y-3 flex-1 ${contentClassName}`}>
            {children}
        </div>
    </div>
);

export const InfoItem = ({ label, value, children }) => (
    <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</dt>
        <dd className="text-xs font-medium text-gray-900">{children || value || <span className="text-gray-500">N/A</span>}</dd>
    </div>
);

export const TimelineItem = ({ icon, title, description, date }) => (
    <div className="flex items-start gap-4">
        <div className="bg-gray-100 rounded-full p-2 text-gray-500">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-700">{description}</p>
            <p className="text-xs text-gray-600 mt-0.5">{formatDate(date)}</p>
        </div>
    </div>
);

export const StructuredClearanceItem = ({ test, score, date, certId, notes }) => (
    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex justify-between items-start">
            <p className="font-semibold text-sm text-gray-800">{test}</p>
            <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">{score}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            <div><span className="font-medium">Date:</span> {formatDate(date)}</div>
            {certId && <div><span className="font-medium">ID:</span> <span className="font-mono text-xs">{certId}</span></div>}
            {notes && <div className="italic text-gray-500 mt-1">{notes}</div>}
        </div>
    </div>
);

export const StructuredTitleItem = ({ title, org, date }) => (
    <div className="p-3 bg-gray-50 rounded-lg border">
        <p className="font-semibold text-sm text-gray-800">{title}</p>
        <div className="text-xs text-gray-500 mt-1">
            <span>{org}</span>
            {date && <span className="ml-2">{formatDate(date)}</span>}
        </div>
    </div>
);