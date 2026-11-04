import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';

// Admin editor for per-species care-checklist templates. Owners apply a template to an animal from
// the animal form; applying COPIES the tasks, so edits here never change existing animals.
const inputClass = 'py-1.5 px-2 text-sm border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text';

const CareTemplatesTab = () => {
    const [speciesList, setSpeciesList] = useState([]);
    const [templates, setTemplates] = useState({});
    const [selected, setSelected] = useState('');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [speciesRes, templateRes] = await Promise.all([
                apiClient.get('/admin/species'),
                apiClient.get('/care-templates/admin/all'),
            ]);
            setSpeciesList((Array.isArray(speciesRes.data) ? speciesRes.data : []).map((s) => s.name).filter(Boolean));
            const byName = {};
            (templateRes.data?.templates || []).forEach((t) => { byName[t.species] = t; });
            setTemplates(byName);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load templates.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const choose = (name) => {
        setSelected(name);
        setMessage(null);
        setTasks((templates[name]?.tasks || []).map((t) => ({ ...t })));
    };

    const updateTask = (index, patch) => setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
    const addTask = () => setTasks((prev) => [...prev, { taskName: '', frequencyDays: '', notes: '' }]);
    const removeTask = (index) => setTasks((prev) => prev.filter((_, i) => i !== index));

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await apiClient.put(`/care-templates/admin/${encodeURIComponent(selected)}`, { tasks });
            setTemplates((prev) => ({ ...prev, [selected]: res.data }));
            setTasks(res.data.tasks.map((t) => ({ ...t })));
            setMessage({ type: 'success', text: `Saved the ${selected} template.` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save the template.' });
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!window.confirm(`Delete the ${selected} template? Animals that already used it keep their tasks.`)) return;
        setSaving(true);
        setMessage(null);
        try {
            await apiClient.delete(`/care-templates/admin/${encodeURIComponent(selected)}`);
            setTemplates((prev) => { const next = { ...prev }; delete next[selected]; return next; });
            setTasks([]);
            setMessage({ type: 'success', text: `Deleted the ${selected} template.` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete the template.' });
        } finally {
            setSaving(false);
        }
    };

    // Adds the built-in default checklist for species that have one and no template yet. Existing
    // templates are never changed, so it is safe to run again after adding species.
    const seedDefaults = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await apiClient.post('/care-templates/admin/seed-defaults');
            const { created = [], noDefault = [] } = res.data || {};
            await load();
            if (selected && created.includes(selected)) {
                // The open species just received its default: show it (it had no template, so
                // there is no saved work to lose; unsaved rows are replaced only if the editor is empty).
                const fresh = await apiClient.get(`/care-templates/species/${encodeURIComponent(selected)}`);
                setTasks((prev) => (prev.some((t) => t.taskName) ? prev : (fresh.data?.tasks || []).map((t) => ({ ...t }))));
            }
            const parts = [created.length
                ? `Added default templates for ${created.length} species: ${created.join(', ')}.`
                : 'Every species that has a built-in default already has a template.'];
            if (noDefault.length) parts.push(`No built-in default for: ${noDefault.join(', ')}. Add those by hand.`);
            setMessage({ type: 'success', text: parts.join(' ') });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add default templates.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center gap-2 text-gray-500 dark:text-dark-text-muted"><Loader2 className="animate-spin" size={18} /> Loading templates...</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text flex items-center gap-2"><ClipboardList size={20} /> Care Checklist Templates</h2>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
                    Define a default care checklist per species. Owners apply it to their animals from the animal form; it copies the tasks (skipping ones the animal already has), so later edits here do not change existing animals.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="care-template-species" className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Species</label>
                <select id="care-template-species" value={selected} onChange={(e) => choose(e.target.value)} className={inputClass}>
                    <option value="">Select a species...</option>
                    {speciesList.map((name) => (
                        <option key={name} value={name}>{name}{templates[name] ? ` (${templates[name].tasks.length} tasks)` : ''}</option>
                    ))}
                </select>
                <button type="button" onClick={seedDefaults} disabled={saving}
                    title="Creates the built-in checklist for species that have one and no template yet. Existing templates are not changed."
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text text-sm font-medium hover:bg-gray-300 disabled:opacity-50">
                    Add built-in defaults
                </button>
            </div>

            {selected && (
                <div className="space-y-3">
                    {tasks.length === 0 && <p className="text-sm text-gray-500 dark:text-dark-text-muted">No tasks yet for {selected}. Add the first one below.</p>}
                    {tasks.map((task, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_8rem_3fr_auto] gap-2 items-center">
                            <input type="text" value={task.taskName} onChange={(e) => updateTask(i, { taskName: e.target.value })}
                                placeholder="Task name (e.g., Mist enclosure)" aria-label={`Task ${i + 1} name`} className={inputClass} />
                            <input type="number" min="1" value={task.frequencyDays ?? ''} onChange={(e) => updateTask(i, { frequencyDays: e.target.value })}
                                placeholder="Every N days" aria-label={`Task ${i + 1} frequency in days`} className={inputClass} />
                            <input type="text" value={task.notes || ''} onChange={(e) => updateTask(i, { notes: e.target.value })}
                                placeholder="Notes (optional)" aria-label={`Task ${i + 1} notes`} className={inputClass} />
                            <button type="button" onClick={() => removeTask(i)} aria-label={`Remove task ${i + 1}`} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={addTask} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text text-sm font-medium hover:bg-gray-300"><Plus size={14} /> Add task</button>
                        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary-dark text-white text-sm font-medium hover:bg-primary-darker disabled:opacity-50"><Save size={14} /> {saving ? 'Saving...' : 'Save template'}</button>
                        {templates[selected] && (
                            <button type="button" onClick={remove} disabled={saving} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"><Trash2 size={14} /> Delete template</button>
                        )}
                    </div>
                </div>
            )}

            {message && (
                <p role="status" className={`text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{message.text}</p>
            )}
        </div>
    );
};

export default CareTemplatesTab;
