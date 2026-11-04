import React, { useState, useEffect, useCallback } from 'react';
import { Pill } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { InfoCard } from './DashboardComponents';

// Dose history for an animal's medications (given / skipped / missed), from the backend's
// MedicationDoseEvent records. Owner-only: the endpoint is scoped to the signed-in user, so this
// is not rendered for public views. Shows nothing until at least one reminded dose exists.
const STATUS_STYLES = {
    given: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    skipped: 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary',
    missed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
};
const STATUS_LABELS = { given: 'Given', skipped: 'Skipped', missed: 'Missed', pending: 'Due' };

const formatWhen = (value) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const MedicationDoseHistory = ({ animalId }) => {
    const [doses, setDoses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const load = useCallback(async () => {
        if (!animalId) return;
        try {
            const res = await apiClient.get('/medication-doses/history', { params: { animalId_public: animalId, limit: 30 } });
            setDoses(Array.isArray(res.data?.doses) ? res.data.doses : []);
            setFailed(false);
        } catch (err) {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, [animalId]);

    useEffect(() => {
        setLoading(true);
        load();
        // Refresh when a dose is marked given from the banner while this tab is open.
        window.addEventListener('medication-dose-updated', load);
        return () => window.removeEventListener('medication-dose-updated', load);
    }, [load]);

    if (loading || (!doses.length && !failed)) return null;

    return (
        <InfoCard title="Medication Dose History" icon={<Pill size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
            {failed ? (
                <p className="text-sm text-gray-400 dark:text-dark-text-muted">Dose history could not be loaded.</p>
            ) : (
                <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                    {doses.map((dose) => (
                        <li key={dose.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-gray-700 dark:text-dark-text-secondary min-w-0">
                                <span className="font-medium">{dose.medicationName || 'Medication'}</span>
                                {dose.dose ? ` (${dose.dose})` : ''}
                                <span className="text-gray-500 dark:text-dark-text-muted"> scheduled {formatWhen(dose.scheduledAt)}</span>
                                {dose.status === 'given' && dose.administeredAt ? (
                                    <span className="text-gray-500 dark:text-dark-text-muted">, given {formatWhen(dose.administeredAt)}</span>
                                ) : null}
                                {dose.snoozeCount ? (
                                    <span className="text-gray-500 dark:text-dark-text-muted">, snoozed {dose.snoozeCount}x</span>
                                ) : null}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${STATUS_STYLES[dose.status] || STATUS_STYLES.pending}`}>
                                {STATUS_LABELS[dose.status] || dose.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </InfoCard>
    );
};

export default MedicationDoseHistory;
