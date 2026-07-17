import React from 'react';
import { Trophy, Medal, Target } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { InfoCard, InfoItem, StructuredTitleItem } from './DashboardComponents';

export const ShowTabContent = ({ animal }) => {
    const hasShowData = animal.showTitles || animal.showRatings || animal.judgeComments;
    const hasWorkData = animal.workingTitles || animal.performanceScores;
    const hasAnyData = hasShowData || hasWorkData;

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <Trophy size={48} className="mb-2" />
                <p className="text-sm">No show or performance records.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Show Titles & Ratings" icon={<Medal size={18} className="text-gray-400" />}>
                {hasShowData ? (
                    <div className="space-y-3">
                        {animal.showTitles && <InfoItem label="Titles (Legacy)" value={animal.showTitles} />}
                        {animal.showRatings && <InfoItem label="Ratings (Legacy)" value={animal.showRatings} />}
                        {animal.judgeComments && <InfoItem label="Judge Comments (Legacy)"><p className="whitespace-pre-wrap">{animal.judgeComments}</p></InfoItem>}
                    </div>
                ) : <p className="text-sm text-gray-400">No show titles or ratings recorded.</p>}
            </InfoCard>
            <InfoCard title="Working & Performance" icon={<Target size={18} className="text-gray-400" />}>
                {hasWorkData ? (
                    <dl className="space-y-4">
                        {animal.workingTitles && <InfoItem label="Working Titles" value={animal.workingTitles} />}
                        {animal.performanceScores && <InfoItem label="Performance Scores" value={animal.performanceScores} />}
                    </dl>
                ) : <p className="text-sm text-gray-400">No working or performance records.</p>}
            </InfoCard>
        </div>
    );
};