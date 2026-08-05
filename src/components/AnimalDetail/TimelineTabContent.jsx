import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Calendar, Clock, Star, MessageSquare, Heart, Stethoscope, Droplets, Shield, Users, User, Target, Trash2, Trophy, UtensilsCrossed, FileEdit } from 'lucide-react';
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

export const getEventIcon = (type) => {
    const icons = {
        'health': <Stethoscope size={14} className="text-blue-500" />,
        'breeding': <Heart size={14} className="text-pink-500" />,
        'ownership': <User size={14} className="text-slate-500" />,
        'keeper': <User size={14} className="text-slate-500" />,
        'show': <Trophy size={14} className="text-amber-500" />,
        'milestones': <Target size={14} className="text-purple-500" />,
        'status': <Calendar size={14} className="text-gray-600" />,
        'feeding': <UtensilsCrossed size={14} className="text-green-600" />,
        'care': <Droplets size={14} className="text-blue-600" />,
        'field': <FileEdit size={14} className="text-gray-500" />
    };
    return icons[type] || <Calendar size={14} className="text-gray-400" />;
};

// Turns a raw AnimalLog value into readable text for timeline descriptions.
const formatLogValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T|$)/.test(value)) return formatDate(value) || value;
    if (typeof value === 'object') return null;
    return String(value);
};

// Converts a single AnimalLog document into a timeline event (one card per log entry).
const logToTimelineEvent = (log) => {
    const parts = log.changes.map(c => {
        const newVal = formatLogValue(c.newValue);
        const oldVal = formatLogValue(c.oldValue);
        if (c.field === 'lastFedDate') return null; // covered by the card title itself
        if (oldVal && newVal) return `${c.label}: ${oldVal} → ${newVal}`;
        if (newVal === 'Completed' || newVal === 'Skipped') return `${c.label}: **${newVal}**`;
        return `${c.label}${newVal ? `: ${newVal}` : ''}`;
    }).filter(Boolean);

    const titles = {
        feeding: log.changes.some(c => c.field === 'lastFedDate' && c.label === 'Feeding Skipped') ? 'Feeding Skipped' : 'Fed',
        care: 'Care Schedule Updated',
        field: 'Record Updated'
    };

    return {
        id: `animallog-${log._id}`,
        type: log.category,
        date: log.createdAt,
        title: titles[log.category] || 'Animal Log',
        description: parts.join('; ') || undefined
    };
};

// Renders **marker**-wrapped segments (e.g. "Fed: **Completed**") as bold text.
export const renderBoldText = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((segment, i) => (
    segment.startsWith('**') && segment.endsWith('**')
        ? <strong key={i}>{segment.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{segment}</React.Fragment>
));

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
                <p className={`font-semibold text-sm ${isPinned ? 'text-yellow-800' : 'text-gray-900'}`}>
                    {event.title}
                    {isPinned && <Star size={12} className="inline ml-1" fill="currentColor" />}
                </p>
                <time className="text-xs font-medium text-gray-600 whitespace-nowrap">{formatDate(event.date)}</time>
            </div>
            {event.description && <p className="text-xs text-gray-700 mb-2">{renderBoldText(event.description)}</p>}
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

// Aggregate all timeline events for a single animal, given its already-fetched AnimalLog docs.
// Standalone (not a hook/component) so other views (e.g. the Dashboard tab's "Recent Activity"
// preview) can share the exact same event list instead of maintaining their own duplicated logic.
const aggregateAnimalTimelineEvents = (animal, animalLogs) => {
        const events = [];
        const milestones = parseJsonArrayField(animal.milestones) || [];

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
                id: 'quarantine-start-' + animal.quarantineDetails.startDate,
                type: 'health',
                date: animal.quarantineDetails.startDate,
                title: 'Quarantine Started',
                description: animal.quarantineDetails.reason || 'Quarantine'
            });
        }

        if (animal.quarantineDetails?.endDate && animal.quarantineDetails.status === 'None') {
            events.push({
                id: 'quarantine-end-' + animal.quarantineDetails.endDate,
                type: 'health',
                date: animal.quarantineDetails.endDate,
                title: 'Quarantine Ended',
                description: animal.quarantineDetails.reason || 'Quarantine'
            });
        }

        (parseJsonArrayField(animal.quarantineHistory) || []).forEach((period, idx) => {
            if (period?.startDate) {
                events.push({
                    id: `quarantine-hist-start-${period.startDate}-${idx}`,
                    type: 'health',
                    date: period.startDate,
                    title: 'Quarantine Started',
                    description: period.reason || 'Quarantine'
                });
            }
            if (period?.endDate) {
                events.push({
                    id: `quarantine-hist-end-${period.endDate}-${idx}`,
                    type: 'health',
                    date: period.endDate,
                    title: 'Quarantine Ended',
                    description: period.reason || 'Quarantine'
                });
            }
        });

        // Treatment periods are now defined entirely by medications (see below) rather than a
        // separate treatmentDetails period.
        (parseJsonArrayField(animal.medications) || []).forEach((med, idx) => {
            if (!med) return;
            if (med.startDate) {
                events.push({
                    id: `med-start-${med.id || idx}-${med.startDate}`,
                    type: 'health',
                    date: med.startDate,
                    title: `Medication Started: ${med.name || 'Medication'}`,
                    description: [med.reason, med.dose ? `Dose: ${med.dose}` : null].filter(Boolean).join(' — ') || 'Medication started'
                });
            }
            (med.administrations || []).forEach((admin, aIdx) => {
                if (admin?.date) {
                    events.push({
                        id: `med-admin-${med.id || idx}-${aIdx}-${admin.date}`,
                        type: 'health',
                        date: admin.date,
                        title: `Treatment Performed: ${med.name || 'Medication'}`,
                        description: med.dose ? `Dose administered: ${med.dose}` : 'Scheduled dose administered'
                    });
                }
            });
            if (med.stopDate) {
                events.push({
                    id: `med-stop-${med.id || idx}-${med.stopDate}`,
                    type: 'health',
                    date: med.stopDate,
                    title: `Medication Finished: ${med.name || 'Medication'}`,
                    description: med.reason || 'Medication course ended'
                });
            }
        });

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

        // Feeding/care/field edit entries from the AnimalLog collection
        animalLogs.forEach(log => events.push(logToTimelineEvent(log)));

        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Fetches an animal's AnimalLog entries and returns the fully-aggregated, sorted timeline event
// list (derived events + logged actions). Shared by TimelineTabContent and any other view that
// needs the same data (e.g. a "Recent Activity" preview of the last N events).
export const useAnimalTimelineEvents = (animal, API_BASE_URL, authToken) => {
    const [animalLogs, setAnimalLogs] = useState([]);

    useEffect(() => {
        // Skip entirely for guest/unauthenticated views (public marketplace pages) — the
        // endpoint requires a valid token anyway, so this avoids a guaranteed 401 on every load.
        if (!animal?.id_public || !API_BASE_URL || !authToken) return;
        let cancelled = false;
        axios.get(`${API_BASE_URL}/animals/${animal.id_public}/logs`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => { if (!cancelled) setAnimalLogs(Array.isArray(res.data) ? res.data : []); })
            .catch(err => console.error('Failed to fetch animal logs for timeline:', err));
        return () => { cancelled = true; };
    }, [animal?.id_public, API_BASE_URL, authToken]);

    return useMemo(() => aggregateAnimalTimelineEvents(animal, animalLogs), [animal, animalLogs]);
};

export const TimelineTabContent = ({ animal, API_BASE_URL, authToken }) => {
    const timelineNotes = parseJsonArrayField(animal.timelineNotes) || [];
    const pinnedEvents = parseJsonArrayField(animal.pinnedEvents) || [];
    const allEvents = useAnimalTimelineEvents(animal, API_BASE_URL, authToken);
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