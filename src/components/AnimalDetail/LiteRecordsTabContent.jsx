// Lite's "Records" tab — READ-ONLY, matching how the Full frontend treats RecordsTabContent.
//
// This lives in the view modal (LiteAnimalModal). Editing these records belongs in the edit
// form, not here: the modal's Edit button opens the form, whose Health tab is where vet
// visits, medications, vaccinations, deworming, conditions and allergies are added, edited
// and removed. Keeping editors in the view would let records change without going through the
// edit form's validation, dirty-tracking and Save Animal flow.
//
// Scope rationale for which record types belong here: crittertrack-lite/RECORDS_SCOPE.md.
import React from 'react';
import { InfoCard } from './DashboardComponents';
import { IdentificationNumbersCard } from './IdentificationTabContent';
import { AppearanceTabContent } from './AppearanceTabContent';
import { Stethoscope, Pill, Syringe, Bug, HeartPulse, AlertTriangle } from 'lucide-react';

// Records arrays are stored as arrays but can arrive JSON-encoded (mirrors the parsers used
// by HealthTabContent / IdentificationTabContent, since some import paths write them as strings).
const parseRecords = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

const str = (v) => (v !== null && v !== undefined && String(v).trim() ? String(v).trim() : null);
const fmtDate = (v) => (v ? String(v).slice(0, 10) : null);
const join = (...parts) => parts.filter(Boolean).join(' — ') || null;

// Field names mirror the add-handlers in AnimalFormModalV2 so anything written from the edit
// form displays correctly here.
const RecordList = ({ title, icon, records, primary, secondary, emptyText }) => (
    <InfoCard title={title} icon={icon}>
        {records.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-dark-text-muted">{emptyText}</p>
        ) : (
            <ul className="space-y-2">
                {records.map((r, i) => {
                    const label = primary(r);
                    if (!label) return null;
                    const sub = secondary(r);
                    return (
                        <li key={i} className="flex items-baseline justify-between gap-3 text-xs border-b border-gray-100 dark:border-dark-text-muted last:border-0 pb-1.5 last:pb-0">
                            <span className="text-gray-800 dark:text-dark-text font-medium min-w-0 truncate">{label}</span>
                            {sub && <span className="text-gray-500 dark:text-dark-text-muted text-right shrink-0">{sub}</span>}
                        </li>
                    );
                })}
            </ul>
        )}
    </InfoCard>
);

export const LiteRecordsTabContent = ({ animal, API_BASE_URL, authToken }) => {
    if (!animal) return null;
    return (
        <div className="space-y-6">
            <IdentificationNumbersCard animal={animal} />

            <AppearanceTabContent animal={animal} API_BASE_URL={API_BASE_URL} authToken={authToken} />

            <RecordList
                title="Veterinary Visits"
                icon={<Stethoscope size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                records={parseRecords(animal.vetVisits)}
                emptyText="No vet visits recorded."
                primary={(v) => str(v.reason) || str(v.name) || str(v.vetName) || str(v.clinic)}
                secondary={(v) => join(fmtDate(v.date || v.visitDate), str(v.notes))}
            />

            <RecordList
                title="Medications"
                icon={<Pill size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                records={parseRecords(animal.medications)}
                emptyText="No medications recorded."
                primary={(m) => str(m.name) || str(m.medication)}
                secondary={(m) => join(str(m.dose), str(m.reason), fmtDate(m.startDate))}
            />

            <RecordList
                title="Vaccinations"
                icon={<Syringe size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                records={parseRecords(animal.vaccinations)}
                emptyText="No vaccinations recorded."
                primary={(v) => str(v.name) || str(v.vaccine)}
                secondary={(v) => join(fmtDate(v.date), str(v.notes))}
            />

            <RecordList
                title="Deworming"
                icon={<Bug size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                records={parseRecords(animal.dewormingRecords)}
                emptyText="No deworming recorded."
                primary={(d) => str(d.medication) || str(d.name) || str(d.product)}
                secondary={(d) => join(fmtDate(d.date), str(d.notes))}
            />

            <RecordList
                title="Medical Conditions"
                icon={<HeartPulse size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                records={parseRecords(animal.medicalConditions)}
                emptyText="No medical conditions recorded."
                primary={(c) => str(c.name) || str(c.condition)}
                secondary={(c) => join(str(c.status), str(c.severity), str(c.notes))}
            />

            <RecordList
                title="Allergies"
                icon={<AlertTriangle size={18} className="text-gray-400 dark:text-dark-text-muted" />}
                records={parseRecords(animal.allergies)}
                emptyText="No allergies recorded."
                primary={(a) => str(a.name) || str(a.allergen)}
                secondary={(a) => str(a.notes)}
            />
        </div>
    );
};

export default LiteRecordsTabContent;
