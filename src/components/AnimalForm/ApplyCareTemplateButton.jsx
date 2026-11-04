import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import apiClient from '../../utils/apiClient';

// "Apply species template" for the animal form's Care Tasks section. Fetches the admin-curated
// template for the animal's species and COPIES its tasks into the form's care tasks, skipping any
// the animal already has (by name). Nothing is saved until the form itself is saved.
const normalizeName = (name) => String(name || '').trim().toLowerCase();

const ApplyCareTemplateButton = ({ species, existingTasks, onApply }) => {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    const handleClick = async () => {
        if (!species) return;
        setBusy(true);
        setMessage('');
        try {
            const res = await apiClient.get(`/care-templates/species/${encodeURIComponent(species)}`);
            const templateTasks = res.data?.tasks || [];
            if (!templateTasks.length) {
                setMessage(`There is no care checklist template for ${species} yet.`);
                return;
            }
            const have = new Set((existingTasks || []).map((t) => normalizeName(t?.taskName)));
            const toAdd = [];
            templateTasks.forEach((t) => {
                const key = normalizeName(t.taskName);
                if (!key || have.has(key)) return;
                have.add(key);
                toAdd.push({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    taskName: t.taskName,
                    notes: t.notes || null,
                    frequencyDays: t.frequencyDays || null,
                    lastDoneDate: null,
                });
            });
            const skipped = templateTasks.length - toAdd.length;
            if (!toAdd.length) {
                setMessage('This animal already has every task from the template.');
                return;
            }
            onApply(toAdd);
            setMessage(`Added ${toAdd.length} task${toAdd.length === 1 ? '' : 's'}${skipped ? ` (${skipped} already present)` : ''}. Save the animal to keep them.`);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Could not load the template.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-1">
            <button type="button" onClick={handleClick} disabled={busy || !species}
                title={species ? `Add the ${species} care checklist` : 'Choose a species first'}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text text-xs font-medium hover:bg-gray-300 disabled:opacity-50">
                <ClipboardList size={14} /> {busy ? 'Loading...' : 'Apply species checklist template'}
            </button>
            {message && <p role="status" className="text-xs text-gray-600 dark:text-dark-text-secondary">{message}</p>}
        </div>
    );
};

export default ApplyCareTemplateButton;
