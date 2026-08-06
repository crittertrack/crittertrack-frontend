import React from 'react';
import { Shield, Microscope, HeartPulse, Stethoscope, AlertTriangle, Activity, Scale } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { computeIsInTreatment, remapLegacyHealthStatus } from '../../utils/medicalStatus';
import { DetailJsonList } from './utils';
import { InfoCard, InfoItem, StructuredClearanceItem } from './DashboardComponents';
import { isFieldHiddenForSpecies } from '../../utils/speciesFieldTemplates';

// Helper to parse fields that might be JSON strings or arrays
const parseHealthRecords = (data) => {
    if (!data) return [];
    let records = [];
    if (typeof data === 'string') {
        try {
            records = JSON.parse(data);
        } catch (e) {
            return [];
        }
    } else {
        records = data;
    }
    if (Array.isArray(records)) return records.filter(Boolean); // Filter out null/undefined entries
    return [];
};

// New component for status
const StatusIndicator = ({ status }) => {
    const statusStyles = {
        'Healthy': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
        'Monitoring': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        'Concern': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        'Under Observation': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        'Under Treatment': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        'Quarantined': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
        'Critical': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        'Unknown': 'bg-gray-100 dark:bg-dark-surface text-gray-800 dark:text-dark-text',
    };
    const style = statusStyles[status] || statusStyles['Unknown'];
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${style}`}>{status}</span>;
};

export const HealthTabContent = ({ animal }) => {
    const species = animal.species;
    const hidden = (field) => isFieldHiddenForSpecies(field, species);

    const vaccinations = hidden('vaccinations') ? [] : parseHealthRecords(animal.vaccinations);
    const dewormingRecords = hidden('dewormingRecords') ? [] : parseHealthRecords(animal.dewormingRecords);
    const parasiteControl = parseHealthRecords(animal.parasiteControl);
    const medicalProcedures = parseHealthRecords(animal.medicalProcedures);
    const labResults = parseHealthRecords(animal.labResults || animal.laboratoryResults);
    const medicalConditions = parseHealthRecords(animal.medicalConditions);
    const allergies = hidden('allergies') ? [] : parseHealthRecords(animal.allergies);
    const medications = parseHealthRecords(animal.medications);
    const vetVisits = parseHealthRecords(animal.vetVisits);

    const hasPreventiveCare = vaccinations.length > 0 || dewormingRecords.length > 0 || parasiteControl.length > 0 || animal.parasitePreventionSchedule;
    const hasProcedures = medicalProcedures.length > 0 || labResults.length > 0;
    const hasActiveRecords = medicalConditions.length > 0 || allergies.length > 0 || medications.length > 0;
    const hasVetCare = animal.primaryVet || vetVisits.length > 0;
    const hasClearances = animal.healthStatus || (!hidden('spayNeuterDate') && animal.spayNeuterDate) || (!hidden('heartwormStatus') && animal.heartwormStatus) || (!hidden('hipElbowScores') && animal.hipElbowScores) || (!hidden('eyeClearance') && animal.eyeClearance) || (!hidden('cardiacClearance') && animal.cardiacClearance) || (!hidden('dentalRecords') && animal.dentalRecords) || animal.geneticTestResults || animal.chronicConditions;

    // Check for active medical situations based on the proposed data model
    const isQuarantined = animal.quarantineStatus?.active === true;
    // isInTreatment is derived from active medications/critical conditions (see medicalStatus.js),
    // matching the same computation the backend persists on animal.isInTreatment.
    const isUnderTreatment = computeIsInTreatment({ medications: animal.medications, medicalConditions: animal.medicalConditions });

    // healthStatus is derived server-side from quarantine/treatment/medications/conditions/
    // allergies (see utils/healthStatusSync.js's computeHealthStatus) \u2014 healthStatusOverride,
    // if set, takes precedence, same as the header pill in AnimalModalV2/ViewAnimalModalV2.
    const calculatedHealthStatus = remapLegacyHealthStatus(animal.healthStatusOverride || animal.healthStatus) || 'Healthy';

    return (
        <div className="space-y-6">
                <InfoCard title="Health Status & Preventive Care" icon={<Shield size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    <div className="pb-3 border-b border-gray-200 dark:border-dark-border space-y-3">
                        <InfoItem label="Overall Health Status">
                            <StatusIndicator status={calculatedHealthStatus} />
                        </InfoItem>
                        {animal.healthStatusOverride && (
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400">
                                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Health Status Override</p>
                                <p className="text-sm text-purple-900">{animal.healthStatusOverride}</p>
                                {animal.healthStatusOverrideNotes && <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{animal.healthStatusOverrideNotes}</p>}
                            </div>
                        )}
                        {isQuarantined && (
                            <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400">
                                <AlertTriangle size={16} className="text-orange-500" />
                                <div className="text-xs">
                                    <p className="font-semibold text-orange-700 dark:text-orange-300">⚠️ Currently Quarantined</p>
                                    <p className="text-gray-600 dark:text-dark-text-secondary">{animal.quarantineStatus.reason || 'No reason specified'}</p>
                                    {animal.quarantineStatus.endDate && <p className="text-gray-500 dark:text-dark-text-muted">Until: {formatDate(animal.quarantineStatus.endDate)}</p>}
                                </div>
                            </div>
                        )}
                        {isUnderTreatment && !isQuarantined && (
                             <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400">
                                <Activity size={16} className="text-blue-500" />
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Under Active Treatment</p>
                            </div>
                        )}
                    </div>
                    {hasPreventiveCare ? (
                        <>
                            {animal.parasitePreventionSchedule && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded mb-4">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">📅 Upcoming Prevention Schedule</p>
                                    <p className="text-sm text-blue-900">{animal.parasitePreventionSchedule}</p>
                                </div>
                            )}
                            {vaccinations.length > 0 && <DetailJsonList label="Vaccinations" data={vaccinations} renderItem={v => `${v.name} ${v.date ? `(${formatDate(v.date)})` : ''}`} />}
                            {dewormingRecords.length > 0 && <DetailJsonList label="Deworming Records" data={dewormingRecords} renderItem={r => `${r.medication} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                            {parasiteControl.length > 0 && <DetailJsonList label="Parasite Control" data={parasiteControl} renderItem={r => `${r.treatment} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-dark-text-muted">No preventive care records.</p>
                    )}

                    {/* Quarantine Details - Inside Health Status Card */}
                    {(() => {
                        if (animal.quarantineDetails || animal.quarantineStatus) {
                            const quarantine = animal.quarantineDetails || animal.quarantineStatus || {};
                            const status = quarantine.status || (quarantine.active ? 'Quarantine' : 'None');
                            
                            if (!status || status === 'None') {
                                return null;
                            }
                            
                            return (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-3">Quarantine Information</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <InfoItem label="Status" value={status} />
                                        {(quarantine.type || quarantine.reason) && (
                                            <InfoItem label="Type/Reason" value={quarantine.type || quarantine.reason || 'Not specified'} />
                                        )}
                                        {quarantine.reason && (
                                            <InfoItem label="Details" value={quarantine.reason} />
                                        )}
                                        {quarantine.startDate && (
                                            <InfoItem label="Start Date" value={formatDate(quarantine.startDate)} />
                                        )}
                                        {quarantine.endDate && (
                                            <InfoItem label="End Date" value={formatDate(quarantine.endDate)} />
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </InfoCard>

                {/* Quarantine Information - REMOVED - Now inside Health Status Card */}

                <InfoCard title="Procedures & Diagnostics" icon={<Microscope size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    {hasProcedures ? (
                        <>
                            {medicalProcedures.length > 0 && <DetailJsonList label="Medical Procedures" data={medicalProcedures.filter(Boolean)} renderItem={p => `${p.name} ${p.date ? `(${formatDate(p.date)})` : ''}`} />}
                            {labResults.length > 0 && <DetailJsonList label="Laboratory Results" data={labResults.filter(Boolean)} renderItem={r => `${r.testName} - ${r.result} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-dark-text-muted">No procedures or diagnostics recorded.</p>
                    )}
                </InfoCard>
            <InfoCard title="Active Medical Records" icon={<HeartPulse size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    {hasActiveRecords ? (
                         <>
                            {medicalConditions.length > 0 && <DetailJsonList label="Medical Conditions" data={medicalConditions.filter(Boolean)} renderItem={item => `${item.condition || item.name}`} />}
                            {allergies.length > 0 && <DetailJsonList label="Allergies" data={allergies.filter(Boolean)} renderItem={item => `${item.allergen || item.name}`} />}
                            {medications.length > 0 && <DetailJsonList label="Current Medications" data={medications.filter(Boolean)} renderItem={item => {
                                const parts = [item.name || item.medication];
                                if (item.reason) parts.push(item.reason);
                                if (item.dose) parts.push(item.dose);
                                if (item.intervalValue && item.intervalUnit) parts.push(`every ${item.intervalValue} ${item.intervalUnit}`);
                                if (item.startDate) parts.push(`from ${formatDate(item.startDate)}`);
                                if (item.stopDate) parts.push(`to ${formatDate(item.stopDate)}`);
                                let text = parts.filter(Boolean).join(' \u2013 ');
                                if (item.notes) text += ` (${item.notes})`;
                                return text;
                            }} />}
                        </>
                    ) : (
                         <p className="text-sm text-gray-400 dark:text-dark-text-muted">No active medical records.</p>
                    )}
                </InfoCard>
            <InfoCard title="Veterinary Care" icon={<Stethoscope size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    {hasVetCare ? (
                        <>
                            {animal.primaryVet && <InfoItem label="Primary Veterinarian" value={animal.primaryVet} />}
                            {vetVisits.length > 0 && <DetailJsonList label="Veterinary Visits" data={vetVisits.filter(Boolean)} renderItem={v => `${v.reason} ${v.date ? `(${formatDate(v.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-dark-text-muted">No veterinary information.</p>
                    )}
                </InfoCard>
            <InfoCard title="Health Clearances & Screening" icon={<HeartPulse size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    {!hasClearances && (!animal.healthClearances || animal.healthClearances.length === 0) ? (
                        <p className="text-sm text-gray-400 dark:text-dark-text-muted">No health clearances recorded.</p>
                    ) : (
                        <div className="space-y-3">
                            {/* Structured Health Clearances */}
                            {animal.healthClearances && animal.healthClearances.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-dark-text-secondary uppercase">Clearances</p>
                                    {animal.healthClearances.map((clearance, i) => (
                                        <StructuredClearanceItem 
                                            key={i}
                                            test={clearance.clearanceType} 
                                            score={clearance.result} 
                                            date={clearance.dateIssued} 
                                            certId={clearance.certificateId}
                                            notes={clearance.notes}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Legacy Fields */}
                            {((!hidden('spayNeuterDate') && animal.spayNeuterDate) || (!hidden('heartwormStatus') && animal.heartwormStatus) || (!hidden('hipElbowScores') && animal.hipElbowScores) || (!hidden('eyeClearance') && animal.eyeClearance) ||
                              (!hidden('cardiacClearance') && animal.cardiacClearance) || (!hidden('dentalRecords') && animal.dentalRecords) || animal.geneticTestResults || animal.chronicConditions) && (
                                <div className="pt-2 border-t">
                                    {!hidden('spayNeuterDate') && animal.spayNeuterDate && <InfoItem label="Spay/Neuter Date" value={formatDate(animal.spayNeuterDate)} />}
                                    {!hidden('heartwormStatus') && animal.heartwormStatus && <InfoItem label="Heartworm Status" value={animal.heartwormStatus} />}
                                    {!hidden('hipElbowScores') && animal.hipElbowScores && <InfoItem label="Hip/Elbow Scores" value={animal.hipElbowScores} />}
                                    {!hidden('eyeClearance') && animal.eyeClearance && <InfoItem label="Eye Clearance" value={animal.eyeClearance} />}
                                    {!hidden('cardiacClearance') && animal.cardiacClearance && <InfoItem label="Cardiac Clearance" value={animal.cardiacClearance} />}
                                    {!hidden('dentalRecords') && animal.dentalRecords && <InfoItem label="Dental Records" value={animal.dentalRecords} />}
                                    {animal.geneticTestResults && <InfoItem label="Genetic Test Results" value={animal.geneticTestResults} />}
                                    {animal.chronicConditions && <InfoItem label="Chronic Conditions" value={animal.chronicConditions} />}
                                </div>
                            )}
                        </div>
                    )}
                </InfoCard>
                {/* End of Life Card */}
                <InfoCard title="End of Life Information" icon={<Scale size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    {(animal.deceasedDate || animal.causeOfDeath || animal.necropsyResults || animal.endOfLifeCareNotes) ? (
                        <div className="space-y-3">
                            {animal.deceasedDate && <InfoItem label="Deceased Date" value={formatDate(animal.deceasedDate)} />}
                            {animal.causeOfDeath && <InfoItem label="Cause of Death" value={animal.causeOfDeath} />}
                            {animal.necropsyResults && <InfoItem label="Necropsy Results" value={animal.necropsyResults} />}
                            {animal.endOfLifeCareNotes && <InfoItem label="End of Life Care Notes">
                                <p className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</p>
                            </InfoItem>}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-dark-text-muted">No end of life information recorded.</p>
                    )}
                </InfoCard>
            </div>
    );
};