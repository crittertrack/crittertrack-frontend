import React, { useState, useEffect, useMemo } from 'react';
import { Send, ChevronDown, Search, X } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { SpeciesPickerModal } from '../Modals/SpeciesModals';
import { MAX_DAYS, validateSuggestion, buildSuggestionBody, withoutCovered } from '../../utils/speciesValuesSuggestion';

// Help Center -> "Suggest values for a species". Sends a species plus a gestation and/or weaning
// duration (in days) to the moderation panel (Calculator Feedback tab) for a moderator to judge.
// At least one of the two durations is required.
const FIELD = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-border dark:bg-dark-card-bg dark:text-dark-text';

const SpeciesValuesSuggestion = ({ speciesOptions = [], showModalMessage }) => {
    const [species, setSpecies] = useState('');
    const [gestationDays, setGestationDays] = useState('');
    const [weaningDays, setWeaningDays] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    // Species that already have both values can't be picked. If this list fails to load the picker
    // just shows everything; the server rejects covered species either way.
    const [covered, setCovered] = useState([]);
    useEffect(() => {
        let cancelled = false;
        apiClient.get('/species/auto-calc-covered')
            .then((res) => { if (!cancelled && Array.isArray(res.data)) setCovered(res.data); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);
    const pickable = useMemo(() => withoutCovered(speciesOptions, covered), [speciesOptions, covered]);

    const values = { species, gestationDays, weaningDays };
    const canSend = !validateSuggestion(values) && !sending;

    const submit = async (e) => {
        e.preventDefault();
        const problem = validateSuggestion(values);
        if (problem) { setError(problem); return; }
        setError('');
        setSending(true);
        try {
            await apiClient.post('/feedback/species-values', buildSuggestionBody(values));
            setSent(true);
            setSpecies(''); setGestationDays(''); setWeaningDays('');
            if (showModalMessage) showModalMessage('Suggestion sent', 'Thank you! A moderator will review these values.');
        } catch (err) {
            setError(err?.response?.data?.error || 'Could not send your suggestion. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const daysInput = (id, label, hint, value, setValue, placeholder) => (
        <div>
            <label htmlFor={id} className="mb-1 block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">{label}</label>
            <input id={id} type="number" inputMode="numeric" min="1" max={MAX_DAYS} step="1" value={value}
                onChange={(e) => { setValue(e.target.value); setSent(false); setError(''); }} className={FIELD} placeholder={placeholder} />
            <p className="mt-1 text-[11px] text-gray-500 dark:text-dark-text-muted">{hint}</p>
        </div>
    );

    return (
        <section id="suggest-species-values" className="mt-6 scroll-mt-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
            <h3 className="text-sm font-bold text-gray-900 dark:text-dark-text">Suggest values for a species</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-dark-text-secondary">
                Don't see your species in the lists above? Pick it and tell us its gestation and/or weaning length in days. A moderator reviews every suggestion before anything is added.
            </p>

            <form onSubmit={submit} className="mt-3 space-y-3" noValidate>
                <div>
                    <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Species</span>
                    <button type="button" onClick={() => setShowPicker(true)} aria-label="Select species" className={`${FIELD} flex items-center justify-between text-left`}>
                        {species ? <span className="font-medium">{species}</span> : <span className="text-gray-400 dark:text-dark-text-muted">Click to select a species...</span>}
                        <ChevronDown size={16} className="text-gray-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {daysInput('sv-gestation', 'Gestation (days)', 'Mating to birth', gestationDays, setGestationDays, 'e.g. 63')}
                    {daysInput('sv-weaning', 'Weaning (days)', 'Birth to weaning', weaningDays, setWeaningDays, 'e.g. 21')}
                </div>

                <p className="text-[11px] text-gray-500 dark:text-dark-text-muted">Fill in at least one of the two.</p>
                {error && <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
                {sent && !error && <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Sent for review. You can suggest another species.</p>}

                <button type="submit" disabled={!canSend}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-black transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-primary">
                    <Send size={14} /> {sending ? 'Sending...' : 'Send for review'}
                </button>
            </form>

            {showPicker && (
                <SpeciesPickerModal
                    speciesOptions={pickable}
                    onSelect={(name) => { setSpecies(name); setError(''); setSent(false); setShowPicker(false); }}
                    onClose={() => setShowPicker(false)}
                    X={X}
                    Search={Search}
                />
            )}
        </section>
    );
};

export default SpeciesValuesSuggestion;
