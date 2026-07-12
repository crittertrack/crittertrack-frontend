import React from 'react';
import { Trophy, Medal, Target } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { InfoCard, InfoItem, StructuredTitleItem } from './shared/DashboardComponents';

export const ShowTabContent = ({ animal }) => {
    const hasShowData = animal.showTitles || animal.showRatings || animal.judgeComments;
    const hasWorkData = animal.workingTitles || animal.performanceScores;
    const hasAnyData = hasShowData || hasWorkData;

    if (!hasAnyData) {
        return null; // Don't render the card if there's no data
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasShowData && (
                <InfoCard title="Show Titles & Ratings" icon={<Medal size={18} className="text-gray-400" />}>
                    <div className="space-y-3">
                        {animal.showTitles && <InfoItem label="Titles (Legacy)" value={animal.showTitles} />}
                        {animal.showRatings && <InfoItem label="Ratings (Legacy)" value={animal.showRatings} />}
                        {animal.judgeComments && <InfoItem label="Judge Comments (Legacy)"><p className="whitespace-pre-wrap">{animal.judgeComments}</p></InfoItem>}
                        
                        <p className="text-xs text-gray-400 pt-2 border-t">Future structured titles (example):</p>
                        <StructuredTitleItem title="Grand Champion (GCH)" org="CFA" date="2026-07-04" />
                    </div>
                </InfoCard>
            )}
            {hasWorkData && (
                <InfoCard title="Working & Performance" icon={<Target size={18} className="text-gray-400" />}>
                    <dl className="space-y-4">
                        {animal.workingTitles && <InfoItem label="Working Titles" value={animal.workingTitles} />}
                        {animal.performanceScores && <InfoItem label="Performance Scores" value={animal.performanceScores} />}
                    </dl>
                </InfoCard>
            )}
        </div>
    );
};