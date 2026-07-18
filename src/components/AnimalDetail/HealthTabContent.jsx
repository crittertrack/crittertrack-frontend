import React from 'react';
import { Shield, Microscope, HeartPulse, Stethoscope, AlertTriangle, Activity, Scale } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useDetailFieldTemplate, DetailJsonList } from './utils';
import { InfoCard, InfoItem, StructuredClearanceItem } from './DashboardComponents';

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
        'Good': 'bg-green-100 text-green-800',
        'Under Observation': 'bg-yellow-100 text-yellow-800',
        'Under Treatment': 'bg-blue-100 text-blue-800',
        'Quarantined': 'bg-orange-100 text-orange-800',
        'Critical': 'bg-red-100 text-red-800',
        'Unknown': 'bg-gray-100 text-gray-800',
    };
    const style = statusStyles[status] || statusStyles['Unknown'];
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${style}`}>{status}</span>;
};

export const HealthTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const vaccinations = parseHealthRecords(animal.vaccinations);
    const dewormingRecords = parseHealthRecords(animal.dewormingRecords);
    const parasiteControl = parseHealthRecords(animal.parasiteControl);
    const medicalProcedures = parseHealthRecords(animal.medicalProcedures);
    const labResults = parseHealthRecords(animal.labResults || animal.laboratoryResults);
    const medicalConditions = parseHealthRecords(animal.medicalConditions);
    const allergies = parseHealthRecords(animal.allergies);
    const medications = parseHealthRecords(animal.medications);
    const vetVisits = parseHealthRecords(animal.vetVisits);

    const hasPreventiveCare = vaccinations.length > 0 || dewormingRecords.length > 0 || parasiteControl.length > 0 || animal.parasitePreventionSchedule;
    const hasProcedures = medicalProcedures.length > 0 || labResults.length > 0;
    const hasActiveRecords = medicalConditions.length > 0 || allergies.length > 0 || medications.length > 0;
    const hasVetCare = animal.primaryVet || vetVisits.length > 0;
    const hasClearances = animal.healthStatus || animal.spayNeuterDate || animal.heartwormStatus || animal.hipElbowScores || animal.eyeClearance || animal.cardiacClearance || animal.dentalRecords || animal.geneticTestResults || animal.chronicConditions;

    // Check for active medical situations based on the proposed data model
    const isQuarantined = animal.quarantineStatus?.active === true;
    const hasActiveMedication = medications.some(m => m.status === 'active');
    const hasActiveCriticalCondition = medicalConditions.some(c => c.status === 'active' && c.severity === 'critical');
    const isUnderTreatment = hasActiveMedication || hasActiveCriticalCondition;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
                <InfoCard title="Health Status & Preventive Care" icon={<Shield size={18} className="text-gray-400" />}>
                    <div className="pb-3 border-b border-gray-200 space-y-3">
                        <InfoItem label="Overall Health Status">
                            <StatusIndicator status={animal.healthStatus || 'Unknown'} />
                        </InfoItem>
                        {isQuarantined && (
                            <div className="flex items-center gap-2 p-2 bg-orange-50 border-l-4 border-orange-400">
                                <AlertTriangle size={16} className="text-orange-500" />
                                <div className="text-xs">
                                    <p className="font-semibold text-orange-700">Quarantined</p>
                                    <p className="text-gray-600">{animal.quarantineStatus.reason || 'No reason specified'}</p>
                                    {animal.quarantineStatus.endDate && <p className="text-gray-500">Until: {formatDate(animal.quarantineStatus.endDate)}</p>}
                                </div>
                            </div>
                        )}
                        {isUnderTreatment && !isQuarantined && (
                             <div className="flex items-center gap-2 p-2 bg-blue-50 border-l-4 border-blue-400">
                                <Activity size={16} className="text-blue-500" />
                                <p className="text-xs font-semibold text-blue-700">Under Active Treatment</p>
                            </div>
                        )}
                    </div>
                    {hasPreventiveCare ? (
                        <>
                            {vaccinations.length > 0 && <DetailJsonList label={getLabel('vaccinations', 'Vaccinations')} data={vaccinations} renderItem={v => `${v.name} ${v.date ? `(${formatDate(v.date)})` : ''}`} />}
                            {dewormingRecords.length > 0 && <DetailJsonList label="Deworming Records" data={dewormingRecords} renderItem={r => `${r.medication} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                            {parasiteControl.length > 0 && <DetailJsonList label="Parasite Control" data={parasiteControl} renderItem={r => `${r.treatment} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                            {animal.parasitePreventionSchedule && <InfoItem label={getLabel('parasitePreventionSchedule', 'Parasite Prevention Schedule')} value={animal.parasitePreventionSchedule} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">No preventive care records.</p>
                    )}
                </InfoCard>

                <InfoCard title="Procedures & Diagnostics" icon={<Microscope size={18} className="text-gray-400" />}>
                    {hasProcedures ? (
                        <>
                            {medicalProcedures.length > 0 && <DetailJsonList label="Medical Procedures" data={medicalProcedures.filter(Boolean)} renderItem={p => `${p.name} ${p.date ? `(${formatDate(p.date)})` : ''}`} />}
                            {labResults.length > 0 && <DetailJsonList label="Laboratory Results" data={labResults.filter(Boolean)} renderItem={r => `${r.testName} - ${r.result} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">No procedures or diagnostics recorded.</p>
                    )}
                </InfoCard>
            </div>

            <div className="space-y-6">
                <InfoCard title="Active Medical Records" icon={<HeartPulse size={18} className="text-gray-400" />}>
                    {hasActiveRecords ? (
                         <>
                            {medicalConditions.length > 0 && <DetailJsonList label="Medical Conditions" data={medicalConditions.filter(Boolean)} renderItem={item => `${item.condition || item.name}`} />}
                            {allergies.length > 0 && <DetailJsonList label="Allergies" data={allergies.filter(Boolean)} renderItem={item => `${item.allergen || item.name}`} />}
                            {medications.length > 0 && <DetailJsonList label="Current Medications" data={medications.filter(Boolean)} renderItem={item => `${item.medication || item.name}`} />}
                        </>
                    ) : (
                         <p className="text-sm text-gray-400">No active medical records.</p>
                    )}
                </InfoCard>

                <InfoCard title="Veterinary Care" icon={<Stethoscope size={18} className="text-gray-400" />}>
                    {hasVetCare ? (
                        <>
                            {animal.primaryVet && <InfoItem label="Primary Veterinarian" value={animal.primaryVet} />}
                            {vetVisits.length > 0 && <DetailJsonList label="Veterinary Visits" data={vetVisits.filter(Boolean)} renderItem={v => `${v.reason} ${v.date ? `(${formatDate(v.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">No veterinary information.</p>
                    )}
                </InfoCard>
            </div>

            <div className="space-y-6">
                 <InfoCard title="Health Clearances & Screening" icon={<HeartPulse size={18} className="text-gray-400" />}>
                    {!hasClearances ? (
                        <p className="text-sm text-gray-400">No health clearances recorded.</p>
                    ) : (
                        <div className="space-y-3">
                            {animal.spayNeuterDate && <InfoItem label={getLabel('spayNeuterDate', 'Spay/Neuter Date')} value={formatDate(animal.spayNeuterDate)} />}
                            {animal.heartwormStatus && <InfoItem label={getLabel('heartwormStatus', 'Heartworm Status')} value={animal.heartwormStatus} />}
                            {animal.hipElbowScores && <InfoItem label="Hip/Elbow Scores (Legacy)" value={animal.hipElbowScores} />}
                            {animal.eyeClearance && <InfoItem label="Eye Clearance (Legacy)" value={animal.eyeClearance} />}
                            {animal.cardiacClearance && <InfoItem label="Cardiac Clearance (Legacy)" value={animal.cardiacClearance} />}
                            {animal.dentalRecords && <InfoItem label="Dental Records (Legacy)" value={animal.dentalRecords} />}
                            {animal.geneticTestResults && <InfoItem label="Genetic Test Results (Legacy)" value={animal.geneticTestResults} />}
                            {animal.chronicConditions && <InfoItem label="Chronic Conditions (Legacy)" value={animal.chronicConditions} />}
                            
                            <p className="text-xs text-gray-400 pt-2 border-t">Future structured clearances (example):</p>
                            <StructuredClearanceItem test="OFA Hips" score="Excellent" date="2026-05-10" certId="XX-12345E24M-VPI" />
                            <InfoItem label="Public Health Panel Link"><a href="#" className="text-primary hover:underline text-sm">View on OFA.org (example)</a></InfoItem>
                        </div>
                    )}
                </InfoCard>
                {/* End of Life Card */}
                <InfoCard title="End of Life Information" icon={<Scale size={18} className="text-gray-400" />}>
                    {(animal.deceasedDate || animal.causeOfDeath || animal.necropsyResults || animal.endOfLifeCareNotes) ? (
                        <div className="space-y-3">
                            {animal.deceasedDate && <InfoItem label="Deceased Date" value={formatDate(animal.deceasedDate)} />}
                            {animal.causeOfDeath && <InfoItem label="Cause of Death" value={animal.causeOfDeath} />}
                            {animal.necropsyResults && <InfoItem label="Necropsy Results" value={animal.necropsyResults} />}
                            {animal.endOfLifeCareNotes && <InfoItem label={getLabel('endOfLifeCareNotes', 'End of Life Care Notes')}>
                                <p className="whitespace-pre-wrap">{animal.endOfLifeCareNotes}</p>
                            </InfoItem>}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No end of life information recorded.</p>
                    )}
                </InfoCard>
            </div>
        </div>
    );
};