import React from 'react';
import { FileText } from 'lucide-react';

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
        <div className="space-y-6 max-w-4xl mx-auto">
            {notes.map((note, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        {note.title}
                    </h3>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
            ))}
        </div>
    );
};