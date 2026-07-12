import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const TimelineEvent = ({ icon, title, date, children }) => (
    <div className="relative pl-10 pb-8 group">
        {/* Vertical line */}
        <div className="absolute top-2 left-4 -ml-px h-full w-0.5 bg-gray-200 group-last:hidden"></div>
        {/* Icon */}
        <div className="flex items-center absolute top-0 left-0">
            <div className="bg-gray-200 text-gray-600 rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-white">
                {icon}
            </div>
        </div>
        {/* Content */}
        <div className="ml-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-1">
                <p className="font-semibold text-gray-800">{title}</p>
                <time className="text-xs text-gray-400 sm:ml-4 whitespace-nowrap">{formatDate(date)}</time>
            </div>
            {children && <div className="text-sm text-gray-600">{children}</div>}
        </div>
    </div>
);

export const TimelineTabContent = ({ animal }) => {
    const milestones = (animal.milestones || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    if (milestones.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <Calendar size={48} className="mb-2" />
                <p className="text-sm">No timeline events recorded.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {milestones.map((event, index) => (
                <TimelineEvent key={index} icon={<Calendar size={16} />} title={event.label} date={event.startDate} />
            ))}
        </div>
    );
};