import React from 'react';
import { FileText } from 'lucide-react';
import { InfoCard } from './DashboardComponents';

export const NotesTabContent = ({ animal }) => {
    const notes = [
        { title: 'Handling Notes', content: animal.handlingNotes },
        { title: 'Socialization Notes', content: animal.socializationNotes },
        { title: 'Special Care Requirements', content: animal.specialCareRequirements },
    ].filter(note => note.content);

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <FileText size={48} className="mb-2" />
                <p className="text-sm">No notes available for this animal.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => (
                <InfoCard key={index} title={note.title} icon={<FileText size={18} className="text-gray-400" />}>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </InfoCard>
            ))}
        </div>
    );
};