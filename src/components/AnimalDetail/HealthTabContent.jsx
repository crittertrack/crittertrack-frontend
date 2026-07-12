import React from 'react';
import { Shield, Microscope, Pill, Stethoscope, Hospital } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { useDetailFieldTemplate, DetailJsonList } from './utils';
import { InfoCard, InfoItem, StructuredClearanceItem } from './DashboardComponents';

// Helper to parse fields that might be JSON strings or arrays
const parseHealthRecords = (data) => {
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
    const hasClearances = animal.spayNeuterDate || animal.heartwormStatus || animal.hipElbowScores || animal.eyeClearance || animal.cardiacClearance || animal.dentalRecords || animal.geneticTestResults || animal.chronicConditions;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
                <InfoCard title="Preventive Care" icon={<Shield size={18} className="text-gray-400" />}>
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
                            {medicalProcedures.length > 0 && <DetailJsonList label="Medical Procedures" data={medicalProcedures} renderItem={p => `${p.name} ${p.date ? `(${formatDate(p.date)})` : ''}`} />}
                            {labResults.length > 0 && <DetailJsonList label="Laboratory Results" data={labResults} renderItem={r => `${r.testName} - ${r.result} ${r.date ? `(${formatDate(r.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">No procedures or diagnostics recorded.</p>
                    )}
                </InfoCard>
            </div>

            <div className="space-y-6">
                <InfoCard title="Active Medical Records" icon={<Pill size={18} className="text-gray-400" />}>
                    {hasActiveRecords ? (
                         <>
                            {medicalConditions.length > 0 && <DetailJsonList label="Medical Conditions" data={medicalConditions} renderItem={item => `${item.condition || item.name}`} />}
                            {allergies.length > 0 && <DetailJsonList label="Allergies" data={allergies} renderItem={item => `${item.allergen || item.name}`} />}
                            {medications.length > 0 && <DetailJsonList label="Current Medications" data={medications} renderItem={item => `${item.medication || item.name}`} />}
                        </>
                    ) : (
                         <p className="text-sm text-gray-400">No active medical records.</p>
                    )}
                </InfoCard>

                <InfoCard title="Veterinary Care" icon={<Stethoscope size={18} className="text-gray-400" />}>
                    {hasVetCare ? (
                        <>
                            {animal.primaryVet && <InfoItem label="Primary Veterinarian" value={animal.primaryVet} />}
                            {vetVisits.length > 0 && <DetailJsonList label="Veterinary Visits" data={vetVisits} renderItem={v => `${v.reason} ${v.date ? `(${formatDate(v.date)})` : ''}`} />}
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">No veterinary information.</p>
                    )}
                </InfoCard>
            </div>

            <div className="space-y-6">
                 <InfoCard title="Health Clearances & Screening" icon={<Hospital size={18} className="text-gray-400" />}>
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
            </div>
        </div>
    );
};