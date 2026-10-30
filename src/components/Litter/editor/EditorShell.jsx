import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { reconcileLitterFormCounts } from './litterFormModel';
import {
    EMPTY_LITTER_FORM, formFromLitter, initialExtras, validateLitterForm, isFormDirty, countLinkedBySex,
} from './litterFormModel';
import {
    createLitter, updateLitter, uploadLitterImage, deleteLitterImage, imageErrorMessage,
} from './litterSave';
import IdentityParentsSection from './sections/IdentityParentsSection';
import DatesReproductionSection from './sections/DatesReproductionSection';
import MatingBirthSection from './sections/MatingBirthSection';
import StatsSection from './sections/StatsSection';
import OffspringSection from './sections/OffspringSection';
import PhotosNotesSection from './sections/PhotosNotesSection';
import ObjectivesSection from './sections/ObjectivesSection';

const SECTIONS = [
    { id: 'identity', label: 'Identity & parents' },
    { id: 'dates', label: 'Dates & status' },
    { id: 'mating', label: 'Mating & birth' },
    { id: 'stats', label: 'Statistics' },
    { id: 'offspring', label: 'Offspring' },
    { id: 'objectives', label: 'Breeding objectives' },
    { id: 'photos', label: 'Photos & notes' },
];

const EMPTY_CREATE_COUNTS = { males: 0, females: 0, unknown: 0 };

/**
 * Full-page create/edit form. `litter` is the stored litter when editing, or null when creating.
 * `onDone(litter)` is called after a successful save; `onCancel()` when the user backs out.
 */
export default function EditorShell({
    litter,
    onDone,
    onCancel,
    userProfile,
    authToken,
    API_BASE_URL,
    showModalMessage,
    speciesOptions = [],
}) {
    const isEdit = !!litter;

    const baseline = useMemo(() => (litter ? formFromLitter(litter) : { ...EMPTY_LITTER_FORM }), [litter]);
    const [form, setForm] = useState(baseline);
    const [extras, setExtras] = useState(litter ? initialExtras(litter) : { matingExtra: false, birthExtra: false, weaningExtra: false });
    const [section, setSection] = useState('identity');
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const savingRef = useRef(false); // blocks double-submit even before the state update lands

    const [myAnimals, setMyAnimals] = useState([]);
    const [animalsLoaded, setAnimalsLoaded] = useState(false);
    const [sireAnimal, setSireAnimal] = useState(litter?.sire || null);
    const [damAnimal, setDamAnimal] = useState(litter?.dam || null);
    const [createCounts, setCreateCounts] = useState(EMPTY_CREATE_COUNTS);
    const [savedImages, setSavedImages] = useState(litter?.images || []);
    const [pendingImages, setPendingImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const setFields = useCallback((patch) => setForm(fd => ({ ...fd, ...patch })), []);
    const setField = useCallback((key, value) => setForm(fd => ({ ...fd, [key]: value })), []);

    useEffect(() => {
        let cancelled = false;
        apiClient.get('/animals')
            .then(r => { if (!cancelled) setMyAnimals(Array.isArray(r.data) ? r.data : []); })
            .catch(() => { if (!cancelled) setMyAnimals([]); })
            .finally(() => { if (!cancelled) setAnimalsLoaded(true); });
        return () => { cancelled = true; };
    }, []);

    // Prefer the full animal record (has deceasedDate) over the trimmed copy on the litter.
    const sire = useMemo(() => myAnimals.find(a => a.id_public === form.sireId_public) || sireAnimal, [myAnimals, form.sireId_public, sireAnimal]);
    const dam = useMemo(() => myAnimals.find(a => a.id_public === form.damId_public) || damAnimal, [myAnimals, form.damId_public, damAnimal]);

    const errors = useMemo(() => validateLitterForm(form, { sire, dam }), [form, sire, dam]);
    const hasErrors = Object.keys(errors).length > 0;
    const dirty = isFormDirty(form, baseline) || pendingImages.length > 0
        || (createCounts.males || createCounts.females || createCounts.unknown);

    const linkedCounts = useMemo(() => countLinkedBySex(myAnimals, form.linkedOffspringIds), [myAnimals, form.linkedOffspringIds]);
    const warnings = useMemo(() => reconcileLitterFormCounts(form, myAnimals.filter(a => (form.linkedOffspringIds || []).includes(a.id_public))).warnings, [form, myAnimals]);

    // Unsaved-changes guard. BrowserRouter has no useBlocker, so cover tab close/refresh here and
    // the in-app Back/Cancel buttons below.
    useEffect(() => {
        if (!dirty || saving) return undefined;
        const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty, saving]);

    useEffect(() => () => pendingImages.forEach(p => URL.revokeObjectURL(p.previewUrl)), []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelectParent = (role, animal) => {
        const key = role === 'sire' ? 'sireId_public' : 'damId_public';
        setForm(fd => ({ ...fd, [key]: animal?.id_public || '', species: fd.species || animal?.species || '' }));
        (role === 'sire' ? setSireAnimal : setDamAnimal)(animal || null);
    };

    // Changing species clears both parents (the pickers filter by species).
    const handleSelectSpecies = (name) => {
        setForm(fd => ({ ...fd, species: name, sireId_public: '', damId_public: '' }));
        setSireAnimal(null);
        setDamAnimal(null);
    };

    const stagePhoto = (file) => {
        if (pendingImages.length >= 5) return showModalMessage('Error', 'Maximum of 5 images per litter');
        return setPendingImages(prev => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
    };
    const removePending = (idx) => setPendingImages(prev => {
        URL.revokeObjectURL(prev[idx]?.previewUrl);
        return prev.filter((_, i) => i !== idx);
    });

    const uploadPhoto = async (file) => {
        if (savedImages.filter(i => i.r2Key !== '__uploading__').length >= 5) {
            return showModalMessage('Error', 'Maximum of 5 images per litter');
        }
        const preview = URL.createObjectURL(file);
        setSavedImages(prev => [...prev, { url: preview, r2Key: '__uploading__' }]);
        setUploading(true);
        try {
            setSavedImages(await uploadLitterImage(litter._id, file));
        } catch (err) {
            setSavedImages(prev => prev.filter(i => i.r2Key !== '__uploading__'));
            showModalMessage('Error', imageErrorMessage(err, 'Failed to upload image'));
        } finally {
            URL.revokeObjectURL(preview);
            setUploading(false);
        }
        return undefined;
    };

    const deletePhoto = async (r2Key) => {
        try {
            setSavedImages(await deleteLitterImage(litter._id, r2Key));
        } catch (err) {
            showModalMessage('Error', err.response?.data?.message || 'Failed to delete image');
        }
    };

    // Jump to the first section with a problem so the message is actually visible.
    const sectionForErrors = (errs) => {
        if (errs.sireId_public || errs.damId_public) return 'identity';
        if (errs.birthDate || errs.matingDate) return 'dates';
        return null;
    };

    const handleSave = async () => {
        if (savingRef.current) return;
        setSubmitted(true);
        if (hasErrors) {
            const target = sectionForErrors(errors);
            if (target) setSection(target);
            showModalMessage('Error', Object.values(errors)[0]);
            return;
        }
        savingRef.current = true;
        setSaving(true);
        try {
            const ctx = {
                myAnimals, pendingImages, createCounts, sire, dam, userProfile, authToken, API_BASE_URL,
                litterId: litter?._id, original: litter,
            };
            const result = isEdit ? await updateLitter(form, ctx) : await createLitter(form, ctx);
            if (result.status === 'cancelled') return;
            pendingImages.forEach(p => URL.revokeObjectURL(p.previewUrl));
            if (result.failedOffspring) {
                showModalMessage('Warning', `${result.failedOffspring} placeholder animal(s) could not be created. The litter was saved.`);
            } else {
                showModalMessage('Success', result.message);
            }
            onDone(result.litter || litter, result.status);
        } catch (err) {
            console.error('Error saving litter:', err);
            showModalMessage('Error', err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} litter`);
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (saving) return;
        if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
        onCancel();
    };

    // "Select a sire." style messages only appear after a save attempt; cross-field conflicts
    // (mixed species, dam deceased, birth before mating) show live.
    const visibleErrors = useMemo(() => {
        if (submitted) return errors;
        return Object.fromEntries(Object.entries(errors).filter(([, msg]) => !msg.startsWith('Select a')));
    }, [errors, submitted]);

    const sectionHasError = (id) => (
        (id === 'identity' && (visibleErrors.sireId_public || visibleErrors.damId_public))
        || (id === 'dates' && (visibleErrors.birthDate || visibleErrors.matingDate))
    );

    const renderSection = () => {
        switch (section) {
            case 'identity':
                return (
                    <IdentityParentsSection
                        form={form} setField={setField} errors={visibleErrors} isEdit={isEdit}
                        sire={sire} dam={dam} onSelectParent={handleSelectParent} onSelectSpecies={handleSelectSpecies}
                        speciesOptions={speciesOptions} authToken={authToken} API_BASE_URL={API_BASE_URL} showModalMessage={showModalMessage}
                    />
                );
            case 'dates':
                return (
                    <DatesReproductionSection
                        form={form} setField={setField} setFields={setFields} errors={visibleErrors} original={litter}
                        autoCalcAvailable={!!userProfile?.autoCalcAvailable}
                        autoCalcDueDate={userProfile?.uiPreferences?.autoCalcDueDate !== false}
                        autoCalcWeaningDate={userProfile?.uiPreferences?.autoCalcWeaningDate !== false}
                    />
                );
            case 'mating':
                return <MatingBirthSection form={form} setField={setField} setFields={setFields} extras={extras} setExtras={setExtras} />;
            case 'stats':
                return <StatsSection form={form} setForm={setForm} setField={setField} linkedCounts={linkedCounts} warnings={warnings} />;
            case 'offspring':
                return (
                    <OffspringSection
                        form={form} setForm={setForm} myAnimals={myAnimals} animalsLoaded={animalsLoaded}
                        linkedCounts={linkedCounts} createCounts={createCounts} setCreateCounts={setCreateCounts}
                    />
                );
            case 'objectives':
                return <ObjectivesSection form={form} setField={setField} />;
            default:
                return (
                    <PhotosNotesSection
                        form={form} setField={setField} isEdit={isEdit} savedImages={savedImages} pendingImages={pendingImages}
                        uploading={uploading} onUpload={uploadPhoto} onStage={stagePhoto}
                        onDeleteSaved={deletePhoto} onRemovePending={removePending}
                    />
                );
        }
    };

    const index = SECTIONS.findIndex(s => s.id === section);

    const navBtn = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm';

    return (
        <div className="w-full max-w-5xl mx-auto p-4 pb-28" data-testid="litter-editor">
            <div className="flex items-center gap-3 mb-4">
                <button type="button" onClick={handleCancel} className="p-2 rounded-lg border border-gray-300 dark:border-dark-border" aria-label="Back">
                    <ArrowLeft size={16} />
                </button>
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">{isEdit ? 'Edit litter' : 'New litter'}</h1>
                    {isEdit && <div className="text-xs text-gray-500 dark:text-dark-text-muted">{litter.litter_id_public}</div>}
                </div>
            </div>

            <div className="md:hidden mb-4">
                <select
                    aria-label="Section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card-bg text-sm"
                >
                    {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}{sectionHasError(s.id) ? ' ⚠' : ''}</option>)}
                </select>
            </div>

            <div className="md:flex md:gap-6">
                <nav className="hidden md:block w-52 shrink-0 space-y-1" aria-label="Editor sections">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setSection(s.id)}
                            aria-current={section === s.id ? 'step' : undefined}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${section === s.id ? 'bg-primary dark:bg-dark-primary text-black font-medium' : 'text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface'}`}
                        >
                            {s.label}
                            {sectionHasError(s.id) && <span className="text-red-600" aria-label="has errors">●</span>}
                        </button>
                    ))}
                </nav>
                <div className="flex-1 min-w-0">{renderSection()}</div>
            </div>

            <div className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <button type="button" disabled={index <= 0} onClick={() => setSection(SECTIONS[index - 1].id)} className={`${navBtn} disabled:opacity-40`}>Previous</button>
                        <button type="button" disabled={index >= SECTIONS.length - 1} onClick={() => setSection(SECTIONS[index + 1].id)} className={`${navBtn} disabled:opacity-40`}>Next</button>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleCancel} disabled={saving} className={navBtn}>Cancel</button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || uploading}
                            className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-black text-sm font-medium flex items-center gap-1 shadow-md disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create litter'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
