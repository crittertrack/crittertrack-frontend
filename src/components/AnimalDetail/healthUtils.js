/**
 * Determines an animal's health status based on its active medical records.
 * This function assumes an enhanced data model where medical records have a `status`
 * and `severity` field, and a top-level `quarantineStatus` object exists.
 *
 * @param {object} animal - The animal object.
 * @returns {string} The calculated health status (e.g., 'Quarantined', 'Under Treatment', 'Good').
 */
export function determineHealthStatus(animal) {
  if (!animal) return 'Unknown';

  const medicalConditions = Array.isArray(animal.medicalConditions) ? animal.medicalConditions : [];
  const medications = Array.isArray(animal.medications) ? animal.medications : [];

  // Rule 1: Quarantine is the highest priority status.
  if (animal.quarantineStatus?.active) {
    return 'Quarantined';
  }

  // Rule 2: Active critical conditions or any active medications imply "Under Treatment".
  const hasActiveCriticalCondition = medicalConditions.some(
    c => c.status === 'active' && c.severity === 'critical'
  );
  const hasActiveMedication = medications.some(m => m.status === 'active');

  if (hasActiveCriticalCondition || hasActiveMedication) {
    return 'Under Treatment';
  }

  // Rule 3: Any other active (non-critical) condition means "Under Observation".
  if (medicalConditions.some(c => c.status === 'active')) {
    return 'Under Observation';
  }

  // Default healthy status.
  return 'Good';
}