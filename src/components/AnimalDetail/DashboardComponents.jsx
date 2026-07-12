import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';

export const InfoCard = ({ title, icon, children, className = '', contentClassName = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full ${className}`}>
        {title && (
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                {icon}
                <h3 className="text-md font-semibold text-gray-700">{title}</h3>
            </div>
        )}
        <div className={`p-4 space-y-4 flex-1 ${contentClassName}`}>
            {children}
        </div>
    </div>
);

export const InfoItem = ({ label, value, children }) => (
    <div>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-sm font-medium text-gray-800">{children || value || <span className="text-gray-400">N/A</span>}</dd>
    </div>
);

export const TimelineItem = ({ icon, title, description, date }) => (
    <div className="flex items-start gap-4">
        <div className="bg-gray-100 rounded-full p-2 text-gray-500">
            {icon}
        </div>
        <div className="flex-1">
            <p className="font-medium text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(date)}</p>
        </div>
    </div>
);

export const StructuredClearanceItem = ({ test, score, date, certId }) => (
    <div className="p-3 bg-gray-50 rounded-lg border">
        <div className="flex justify-between items-start">
            <p className="font-semibold text-sm text-gray-800">{test}</p>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">{score}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
            <span>{formatDate(date)}</span>
            {certId && <span className="ml-2 font-mono">#{certId}</span>}
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