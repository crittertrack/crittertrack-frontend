import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';

// Settings for medication dose reminders: default snooze length, how long before an unanswered dose
// is recorded as missed, and the OPT-IN final-alert email (off by default). These never override the
// push notification categories: the "Health & medical alerts" toggle above still silences push and
// the escalation email.
const selectClass = 'py-1 px-2 text-sm border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text';

const MedicationReminderSettings = () => {
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/medication-doses/settings').then((res) => setSettings(res.data)).catch(() => setError('Could not load reminder settings.'));
    }, []);

    const update = async (patch) => {
        const previous = settings;
        setSettings((prev) => ({ ...prev, ...patch }));
        setError('');
        try {
            const res = await apiClient.put('/medication-doses/settings', patch);
            setSettings(res.data);
        } catch (err) {
            setSettings(previous);
            setError(err.response?.data?.message || 'Could not save that setting.');
        }
    };

    if (!settings) return error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null;

    return (
        <div className="space-y-2 pl-2 pt-2">
            <p className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Medication dose reminders</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-dark-text-secondary">
                <label htmlFor="med-snooze-minutes">Snooze for</label>
                <select id="med-snooze-minutes" className={selectClass} value={settings.snoozeMinutes}
                    onChange={(e) => update({ snoozeMinutes: Number(e.target.value) })}>
                    {settings.options.snoozeMinutes.map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
                <span className="text-xs text-gray-500 dark:text-dark-text-muted">(up to {settings.options.maxSnoozes} times per dose)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-dark-text-secondary">
                <label htmlFor="med-missed-after">Record a dose as missed after</label>
                <select id="med-missed-after" className={selectClass} value={settings.missedAfterMinutes}
                    onChange={(e) => update({ missedAfterMinutes: Number(e.target.value) })}>
                    {settings.options.missedAfterMinutes.map((m) => <option key={m} value={m}>{m / 60} hour{m === 60 ? '' : 's'}</option>)}
                </select>
            </div>
            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-dark-text-secondary">
                <input type="checkbox" checked={settings.emailEscalation}
                    onChange={(e) => update({ emailEscalation: e.target.checked })}
                    className="rounded text-primary-dark focus:ring-primary-dark" />
                <span>Also email me if a dose is still unanswered at the final reminder (off by default; respects the Health alerts toggle)</span>
            </label>
            {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};

export default MedicationReminderSettings;
