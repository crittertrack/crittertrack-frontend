// Mirrors crittertrack-pedigree/utils/healthStatusSync.js: isInTreatment/healthStatus are
// derived from active medical records, not manually-set flags. The backend recomputes and
// persists both on every save; these helpers let the frontend preview/derive the same values
// locally (e.g. optimistic updates, live form edits).

import { isStatusPeriodActive } from './dateFormatter';

const parseArrayField = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export function hasActiveMedication(medications) {
    return parseArrayField(medications).some(m =>
        (!m.status || m.status === 'active') && (!m.stopDate || new Date(m.stopDate) >= new Date())
    );
}

export function hasActiveCriticalCondition(medicalConditions) {
    return parseArrayField(medicalConditions).some(c => c.status === 'active' && c.severity === 'critical');
}

export function computeIsInTreatment({ medications, medicalConditions }) {
    return hasActiveMedication(medications) || hasActiveCriticalCondition(medicalConditions);
}

// Per-type quarantine score deductions (see the Type/Reason dropdown in AnimalFormModalV2.jsx /
// AssignHealthStatusModal.jsx for the full option list) — mirrors
// crittertrack-pedigree/utils/healthStatusSync.js. Preventive types don't deduct at all;
// Contagious Disease and Aggression are weighted heaviest since they alone must reach Critical.
export const QUARANTINE_TYPE_PENALTIES = {
    'Preventive - New Arrival': 0,
    'Preventive - Intake': 0,
    'Medical - Illness/URI': 1.75,
    'Medical - Contagious Disease': 3.5,
    'Medical - Recovery': 1,
    'Behavioral - Aggression': 3.25,
    'Behavioral - Fear/Stress': 0.75,
    'Other': 1.6,
};
export const DEFAULT_QUARANTINE_PENALTY = 1.25; // No type selected yet, or an unrecognized value

export const HEALTH_STATUS_BADGE_COLORS = {
    Healthy: 'bg-green-100 text-green-800 border-green-200',
    Monitoring: 'bg-blue-100 text-blue-800 border-blue-200',
    Concern: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
};

export const HEALTH_STATUS_TEXT_COLORS = {
    Healthy: 'text-green-600',
    Monitoring: 'text-blue-600',
    Concern: 'text-yellow-600',
    Critical: 'text-red-600',
};

// Animals saved before the Excellent/Good/Fair/Poor/Critical -> Healthy/Monitoring/Concern/
// Critical rename still have old labels stored in healthStatus/healthStatusOverride. Remap on
// read instead of a DB migration — Poor and Critical both collapse into the new Critical tier.
const LEGACY_HEALTH_STATUS_MAP = {
    Excellent: 'Healthy',
    Good: 'Monitoring',
    Fair: 'Concern',
    Poor: 'Critical',
    Critical: 'Critical',
};
export function remapLegacyHealthStatus(status) {
    if (!status) return status;
    return LEGACY_HEALTH_STATUS_MAP[status] || status;
}

// Single source of truth for an animal's overall health status pill (Healthy/Monitoring/
// Concern/Critical), factoring in active quarantine, derived treatment, medication/condition
// counts, and allergies — mirrors crittertrack-pedigree/utils/healthStatusSync.js's
// computeHealthStatus. Accepts an animal-shaped object (or live form data with the same
// field names): quarantineDetails, medications, medicalConditions, allergies,
// healthStatusOverride.
export function calculateHealthStatus(animal) {
    const medications = parseArrayField(animal.medications);
    const conditions = parseArrayField(animal.medicalConditions);
    const allergies = parseArrayField(animal.allergies);
    const quarantine = animal.quarantineDetails || {};

    let score = 5; // Start at excellent
    const factors = [];

    // Quarantine assessment - only counts once the start date has arrived (and hasn't ended)
    if (isStatusPeriodActive(quarantine)) {
        const penalty = QUARANTINE_TYPE_PENALTIES[quarantine.type] ?? DEFAULT_QUARANTINE_PENALTY;
        score -= penalty;
        factors.push(quarantine.type ? `Active quarantine: ${quarantine.type}` : `${quarantine.status} status`);
    }

    // Treatment assessment - isInTreatment is derived from active medications/critical
    // conditions, so check that directly rather than any separate treatment period.
    if (computeIsInTreatment({ medications: animal.medications, medicalConditions: animal.medicalConditions })) {
        score -= 1.5;
        const activeMedication = medications.find(m =>
            (!m.status || m.status === 'active') && (!m.stopDate || new Date(m.stopDate) >= new Date())
        );
        factors.push(activeMedication ? `Under treatment: ${activeMedication.reason || activeMedication.name}` : 'Currently under treatment');
    }

    // Medications count
    if (medications.length > 0) {
        score -= Math.min(medications.length, 2); // Max 2 points deducted
        factors.push(`${medications.length} active medication(s)`);
    }

    // Conditions count
    if (conditions.length > 0) {
        score -= Math.min(conditions.length, 2);
        factors.push(`${conditions.length} medical condition(s)`);
    }

    // Allergies
    if (allergies.length > 2) {
        score -= 0.5;
        factors.push(`Multiple allergies (${allergies.length})`);
    }

    let calculatedStatus;
    if (score >= 4.5) calculatedStatus = 'Healthy';
    else if (score >= 3.5) calculatedStatus = 'Monitoring';
    else if (score >= 2.0) calculatedStatus = 'Concern';
    else calculatedStatus = 'Critical';

    const overrideStatus = remapLegacyHealthStatus(animal.healthStatusOverride);
    const status = overrideStatus || calculatedStatus;
    const isOverridden = !!overrideStatus;
    const badgeColor = HEALTH_STATUS_BADGE_COLORS[status] || HEALTH_STATUS_BADGE_COLORS.Healthy;

    return { status, calculatedStatus, badgeColor, score, factors, isOverridden };
}
