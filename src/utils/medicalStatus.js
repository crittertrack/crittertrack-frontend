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

export const HEALTH_STATUS_BADGE_COLORS = {
    Excellent: 'bg-green-100 text-green-800 border-green-200',
    Good: 'bg-blue-100 text-blue-800 border-blue-200',
    Fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Poor: 'bg-orange-100 text-orange-800 border-orange-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
};

export const HEALTH_STATUS_TEXT_COLORS = {
    Excellent: 'text-green-600',
    Good: 'text-blue-600',
    Fair: 'text-yellow-600',
    Poor: 'text-orange-600',
    Critical: 'text-red-600',
};

// Single source of truth for an animal's overall health status pill (Excellent/Good/Fair/
// Poor/Critical), factoring in active quarantine, derived treatment, medication/condition
// counts, and allergies — mirrors crittertrack-pedigree/utils/healthStatusSync.js's
// computeHealthStatus. Accepts an animal-shaped object (or live form data with the same
// field names): quarantineDetails, medications, medicalConditions, allergies,
// healthStatusOverride.
export function calculateHealthStatus(animal) {
    const medications = parseArrayField(animal.medications);
    const conditions = parseArrayField(animal.medicalConditions);
    const allergies = parseArrayField(animal.allergies);
    const quarantine = animal.quarantineDetails || {};
    const treatment = animal.treatmentDetails || {};

    let score = 5; // Start at excellent
    const factors = [];

    // Quarantine assessment - only counts once the start date has arrived (and hasn't ended)
    if (isStatusPeriodActive(quarantine)) {
        const qType = quarantine.type || 'unknown';
        if (qType.includes('Medical') || qType.includes('Illness') || qType.includes('Disease')) {
            score -= 2;
            factors.push('Active medical quarantine');
        } else if (qType.includes('Preventive') || qType.includes('New')) {
            score -= 1;
            factors.push('Preventive quarantine (new arrival)');
        } else {
            score -= 1.5;
            factors.push(`${quarantine.status} status`);
        }
    }

    // Treatment assessment - isInTreatment is derived from active medications/critical
    // conditions (not the treatmentDetails period itself), so check that directly.
    if (computeIsInTreatment({ medications: animal.medications, medicalConditions: animal.medicalConditions })) {
        score -= 1.5;
        factors.push(treatment.type ? `Under treatment: ${treatment.type}` : 'Currently under treatment');
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
    if (score >= 4.5) calculatedStatus = 'Excellent';
    else if (score >= 3.5) calculatedStatus = 'Good';
    else if (score >= 2.5) calculatedStatus = 'Fair';
    else if (score >= 1.5) calculatedStatus = 'Poor';
    else calculatedStatus = 'Critical';

    const status = animal.healthStatusOverride || calculatedStatus;
    const isOverridden = !!animal.healthStatusOverride;
    const badgeColor = HEALTH_STATUS_BADGE_COLORS[status] || HEALTH_STATUS_BADGE_COLORS.Excellent;

    return { status, calculatedStatus, badgeColor, score, factors, isOverridden };
}
