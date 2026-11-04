import React from 'react';

// Dose time + reminders switch for the "add medication" form. Values live on the medication record
// (doseTime "HH:MM" in the owner's time zone, remindersEnabled). Reminders are on unless switched
// off, and only apply when the medication has a start date and an interval. Unset values are
// handled here, so callers don't need to include these keys when resetting the form.
const inputClass = 'py-1.5 px-2 text-sm border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text';

const MedicationReminderFields = ({ value, onChange }) => {
    const remindersOn = value.remindersEnabled !== false;
    return (
        <div className="space-y-1.5 p-2 rounded-md bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-dark-text-secondary">
                <input type="checkbox" checked={remindersOn}
                    onChange={(e) => onChange({ ...value, remindersEnabled: e.target.checked })}
                    className="rounded text-primary-dark focus:ring-primary-dark" />
                Remind me at each dose (push notification, with snooze)
            </label>
            {remindersOn && (
                <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="medication-dose-time" className="text-xs text-gray-600 dark:text-dark-text-secondary">First dose time</label>
                    <input id="medication-dose-time" type="time" value={value.doseTime || ''}
                        onChange={(e) => onChange({ ...value, doseTime: e.target.value })}
                        className={inputClass} />
                    <span className="text-xs text-gray-500 dark:text-dark-text-muted">
                        Needs a start date and an interval. Defaults to 08:00 if left empty.
                    </span>
                </div>
            )}
        </div>
    );
};

export default MedicationReminderFields;
