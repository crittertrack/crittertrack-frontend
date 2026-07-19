import React from 'react';
import { Calendar, Clock, Star, MessageSquare, Heart, Stethoscope, Droplets, Shield, Users, User, Target, Trash2, Trophy } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    }
    return Array.isArray(data) ? data : [];
};

const getEventIcon = (type) => {
    const icons = {
        'health': <Stethoscope size={14} className="text-blue-500" />,
        'breeding': <Heart size={14} className="text-red-500" />,
        'ownership': <User size={14} className="text-slate-500" />,
        'keeper': <User size={14} className="text-slate-500" />,
        'show': <Trophy size={14} className="text-amber-500" />,
        'milestones': <Target size={14} className="text-purple-500" />,
        'status': <Calendar size={14} className="text-gray-600" />
    };
    return icons[type] || <Calendar size={14} className="text-gray-400" />;
};

const TimelineEvent = ({ event, notes, isPinned }) => (
    <div className="relative pl-10 pb-6 group">
        {/* Vertical line */}
        <div className="absolute top-3 left-4 -ml-px h-full w-0.5 bg-purple-500 group-last:hidden"></div>
        {/* Icon */}
        <div className="flex items-center absolute top-0 left-0">
            <div className={`rounded-full h-9 w-9 flex items-center justify-center ring-4 shadow-sm ${
                isPinned ? 'bg-yellow-300 text-yellow-800 ring-yellow-100' : 'bg-white text-gray-700 ring-gray-100 border border-gray-300'
            }`}>
                {isPinned ? <Star size={14} fill="currentColor" /> : getEventIcon(event.type)}
            </div>
        </div>
        {/* Content */}
        <div className="ml-2 bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 mb-1">
                <div>
                    <p className={`font-semibold text-sm ${isPinned ? 'text-yellow-800' : 'text-gray-900'}`}>
                        {event.title}
                        {isPinned && <Star size={12} className="inline ml-1" fill="currentColor" />}
                    </p>
                    <p className={`text-xs font-medium capitalize ${isPinned ? 'text-yellow-700' : 'text-gray-600'}`}>{event.type}</p>
                </div>
                <time className="text-xs font-medium text-gray-600 whitespace-nowrap">{formatDate(event.date)}</time>
            </div>
            {event.description && <p className="text-xs text-gray-700 mb-2">{event.description}</p>}
            {notes && notes.length > 0 && (
                <div className="mt-2 space-y-1">
                    {notes.map(note => (
                        <div key={note.id} className="text-xs bg-blue-50 p-2 rounded border border-blue-300">
                            <div className="flex gap-1 mb-1 items-center text-blue-800 font-medium">
                                <MessageSquare size={12} />
                                <span>Note</span>
                            </div>
                            <p className="text-gray-800">{note.noteText}</p>
                            <p className="text-gray-600 text-[10px] mt-1">{formatDate(note.dateAdded)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export const TimelineTabContent = ({ animal }) => {
    const timelineNotes = parseJsonArrayField(animal.timelineNotes) || [];
    const pinnedEvents = parseJsonArrayField(animal.pinnedEvents) || [];
    const milestones = parseJsonArrayField(animal.milestones) || [];

    // Aggregate all timeline events
    const aggregateAllEvents = () => {
        const events = [];
        
        // Milestones
        milestones.forEach((m, idx) => {
            if (m?.startDate) {
                events.push({
                    id: m.id || `milestone-${m.startDate}-${idx}`,
                    type: 'milestones',
                    date: m.startDate,
                    title: m.label || 'Milestone',
                    description: m.description || ''
                });
            }
        });

        // Health events
        if (animal.quarantineDetails?.startDate) {
            events.push({
                id: 'quarantine-' + animal.quarantineDetails.startDate,
                type: 'health',
                date: animal.quarantineDetails.startDate,
                title: 'Quarantine Started',
                description: animal.quarantineDetails.reason || 'Quarantine'
            });
        }

        if (animal.spayNeuterDate) {
            events.push({
                id: 'spay-neuter-' + animal.spayNeuterDate,
                type: 'health',
                date: animal.spayNeuterDate,
                title: 'Spay/Neuter Surgery',
                description: 'Surgical sterilization'
            });
        }

        (parseJsonArrayField(animal.vetVisits) || []).forEach((visit, idx) => {
            if (visit?.date) {
                events.push({
                    id: `vet-${visit.date}-${idx}`,
                    type: 'health',
                    date: visit.date,
                    title: 'Vet Visit',
                    description: visit.reason || 'Veterinary visit'
                });
            }
        });

        (parseJsonArrayField(animal.vaccinations) || []).forEach((vacc, idx) => {
            if (vacc?.date) {
                events.push({
                    id: `vacc-${vacc.date}-${idx}`,
                    type: 'health',
                    date: vacc.date,
                    title: 'Vaccination',
                    description: vacc.name || 'Vaccination'
                });
            }
        });

        (parseJsonArrayField(animal.medicalProcedures) || []).forEach((proc, idx) => {
            if (proc?.date) {
                events.push({
                    id: `proc-${proc.date}-${idx}`,
                    type: 'health',
                    date: proc.date,
                    title: 'Medical Procedure',
                    description: proc.name || proc.procedure || 'Procedure'
                });
            }
        });

        (parseJsonArrayField(animal.labResults) || []).forEach((lab, idx) => {
            if (lab?.date) {
                events.push({
                    id: `lab-${lab.date}-${idx}`,
                    type: 'health',
                    date: lab.date,
                    title: 'Lab Results',
                    description: lab.testName || lab.name || 'Lab test'
                });
            }
        });

        (parseJsonArrayField(animal.dewormingRecords) || []).forEach((deworming, idx) => {
            if (deworming?.date) {
                events.push({
                    id: `deworming-${deworming.date}-${idx}`,
                    type: 'health',
                    date: deworming.date,
                    title: 'Deworming Treatment',
                    description: deworming.type || 'Deworming'
                });
            }
        });

        (parseJsonArrayField(animal.parasiteControl) || []).forEach((parasite, idx) => {
            if (parasite?.date) {
                events.push({
                    id: `parasite-${parasite.date}-${idx}`,
                    type: 'health',
                    date: parasite.date,
                    title: 'Parasite Prevention',
                    description: parasite.type || 'Parasite control'
                });
            }
        });

        // Breeding events
        if (animal.lastHeatDate) {
            events.push({
                id: 'last-heat-' + animal.lastHeatDate,
                type: 'breeding',
                date: animal.lastHeatDate,
                title: 'Heat Cycle',
                description: 'Last estrus cycle'
            });
        }

        if (animal.lastReproductiveEventDate) {
            events.push({
                id: 'last-repro-' + animal.lastReproductiveEventDate,
                type: 'breeding',
                date: animal.lastReproductiveEventDate,
                title: 'Reproductive Event',
                description: 'Last reproductive event'
            });
        }

        if (animal.lastMatingDate) {
            events.push({
                id: 'last-mating-' + animal.lastMatingDate,
                type: 'breeding',
                date: animal.lastMatingDate,
                title: 'Last Mating',
                description: 'Previous mating event'
            });
        }

        if (animal.lastConceptionDate) {
            events.push({
                id: 'last-conception-' + animal.lastConceptionDate,
                type: 'breeding',
                date: animal.lastConceptionDate,
                title: 'Conception',
                description: 'Successful conception'
            });
        }

        if (animal.matingDate) {
            events.push({
                id: 'mating-' + animal.matingDate,
                type: 'breeding',
                date: animal.matingDate,
                title: 'Mating',
                description: 'Animal mating date'
            });
        }

        if (animal.expectedDueDate) {
            events.push({
                id: 'expected-delivery-' + animal.expectedDueDate,
                type: 'breeding',
                date: animal.expectedDueDate,
                title: 'Expected Delivery',
                description: 'Expected delivery/birth date'
            });
        }

        if (animal.developmentPeriodStart) {
            events.push({
                id: 'dev-start-' + animal.developmentPeriodStart,
                type: 'breeding',
                date: animal.developmentPeriodStart,
                title: 'Development Period Started',
                description: 'Pregnancy/development period beginning'
            });
        }

        if (animal.nursingStartDate) {
            events.push({
                id: 'nursing-start-' + animal.nursingStartDate,
                type: 'breeding',
                date: animal.nursingStartDate,
                title: 'Nursing Started',
                description: 'Nursing period began'
            });
        }

        if (animal.weaningDate) {
            events.push({
                id: 'weaning-' + animal.weaningDate,
                type: 'breeding',
                date: animal.weaningDate,
                title: 'Weaning',
                description: 'Offspring weaning date'
            });
        }

        if (animal.lastPregnancyDate) {
            events.push({
                id: 'last-pregnancy-' + animal.lastPregnancyDate,
                type: 'breeding',
                date: animal.lastPregnancyDate,
                title: 'Last Pregnancy',
                description: 'Previous pregnancy occurrence'
            });
        }

        (parseJsonArrayField(animal.breedingRecords) || []).forEach((record, idx) => {
            if (record?.birthEventDate) {
                events.push({
                    id: `birth-${record.birthEventDate}-${idx}`,
                    type: 'breeding',
                    date: record.birthEventDate,
                    title: 'Birth/Hatching Event',
                    description: `Litter size: ${record.litterSizeBorn || 'Unknown'}`
                });
            }
        });

        // Ownership events
        (animal.ownershipHistory || []).forEach((ownership, idx) => {
            if (ownership?.startDate) {
                events.push({
                    id: `ownership-${ownership.startDate}-${idx}`,
                    type: 'ownership',
                    date: ownership.startDate,
                    title: 'Keeper Changed',
                    description: `New keeper: ${ownership.ownerName || 'Unknown'}`
                });
            }
        });

        if (animal.purchaseDate) {
            events.push({
                id: 'purchase-' + animal.purchaseDate,
                type: 'ownership',
                date: animal.purchaseDate,
                title: 'Animal Purchased',
                description: `Purchased for: ${animal.purchasePrice ? `$${animal.purchasePrice}` : 'Unknown price'}`
            });
        }

        if (animal.saleDate) {
            events.push({
                id: 'sale-' + animal.saleDate,
                type: 'ownership',
                date: animal.saleDate,
                title: 'Animal Sold',
                description: `Sold for: ${animal.salePrice ? `$${animal.salePrice}` : 'Unknown price'}`
            });
        }

        // Show events
        (parseJsonArrayField(animal.shows) || []).forEach((show, idx) => {
            if (show?.date) {
                const titleText = show.titleEarned ? ` - ${show.titleEarned}` : '';
                const scoreText = show.score ? ` (${show.score})` : '';
                events.push({
                    id: `show-${show.date}-${idx}`,
                    type: 'show',
                    date: show.date,
                    title: `Show: ${show.showName}${titleText}`,
                    description: `Judge: ${show.judgeName || 'Unknown'}${scoreText}${show.judgeComments ? ` - ${show.judgeComments}` : ''}`
                });
            }
        });

        // Status changes
        if (animal.dateOfDeath) {
            events.push({
                id: 'death-' + animal.dateOfDeath,
                type: 'status',
                date: animal.dateOfDeath,
                title: 'Animal Deceased',
                description: `Status: ${animal.status || 'Deceased'}`
            });
        }

        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const allEvents = aggregateAllEvents();
    const pinnedEventsList = allEvents.filter(e => pinnedEvents.includes(e.id));
    const regularEventsList = allEvents.filter(e => !pinnedEvents.includes(e.id));

    if (allEvents.length === 0) {
        return (
            <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center h-64 text-gray-400">
                <Calendar size={48} className="mb-2" />
                <p className="text-sm">No timeline events recorded.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Clock size={18} className="inline-block align-middle mr-2" /> 
                Animal Timeline
            </h3>

            <div className="max-w-3xl mx-auto space-y-4">
                {/* Pinned Events */}
                {pinnedEventsList.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h4 className="text-sm font-semibold text-yellow-900 uppercase mb-4 flex items-center gap-2">
                            <Star size={14} fill="currentColor" /> Pinned Events
                        </h4>
                        <div className="space-y-3">
                            {pinnedEventsList.map((event) => (
                                <TimelineEvent 
                                    key={event.id} 
                                    event={event}
                                    notes={timelineNotes.filter(n => n.eventId === event.id)}
                                    isPinned={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Events */}
                {regularEventsList.length > 0 && (
                    <div>
                        {pinnedEventsList.length > 0 && (
                            <h4 className="text-sm font-semibold text-gray-800 uppercase mb-4">All Events</h4>
                        )}
                        <div className="space-y-3">
                            {regularEventsList.map((event) => (
                                <TimelineEvent 
                                    key={event.id} 
                                    event={event}
                                    notes={timelineNotes.filter(n => n.eventId === event.id)}
                                    isPinned={false}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};