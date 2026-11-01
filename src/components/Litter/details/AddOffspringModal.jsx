import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { getLitterAppearanceFields } from '../../../utils/litterSpeciesPresentation';

const AddOffspringModal = ({ open, onClose, litter, offspring = [], onComplete, speciesOptions = [] }) => {
    const [mode, setMode] = useState('quick');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('Unknown');
    const [appearance, setAppearance] = useState({});
    const [animals, setAnimals] = useState([]);
    const [animalsLoading, setAnimalsLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const animalsRequestStarted = useRef(false);

    const species = litter?.species || litter?.sire?.species || litter?.dam?.species || '';
    const appearanceFields = getLitterAppearanceFields(species, speciesOptions);
    const linkedIds = useMemo(() => new Set([
        ...(litter?.offspringIds_public || []),
        ...(offspring || []).map(animal => animal.id_public),
    ].filter(Boolean)), [litter?.offspringIds_public, offspring]);
    const candidates = useMemo(() => {
        const query = search.trim().toLowerCase();
        return animals.filter(animal => (
            animal.id_public &&
            !linkedIds.has(animal.id_public) &&
            (!species || animal.species === species) &&
            (!query || `${animal.name || ''} ${animal.id_public} ${animal.species || ''}`.toLowerCase().includes(query))
        ));
    }, [animals, linkedIds, search, species]);

    useEffect(() => {
        if (!open || mode !== 'link' || animals.length || animalsRequestStarted.current) return;
        let cancelled = false;
        animalsRequestStarted.current = true;
        setAnimalsLoading(true);
        setError('');
        apiClient.get('/animals')
            .then(res => {
                if (!Array.isArray(res.data)) throw new Error('Animal list response was invalid.');
                if (!cancelled) setAnimals(res.data);
            })
            .catch(err => {
                if (!cancelled) {
                    animalsRequestStarted.current = false;
                    setError(err.response?.data?.message || err.message || 'Failed to load animals.');
                }
            })
            .finally(() => {
                if (!cancelled) setAnimalsLoading(false);
            });
        return () => {
            cancelled = true;
            animalsRequestStarted.current = false;
        };
    }, [open, mode, animals.length]);

    if (!open) return null;

    const countsFor = (linkedAnimals, linkedCount) => {
        const maleCount = linkedAnimals.filter(animal => animal.gender === 'Male').length;
        const femaleCount = linkedAnimals.filter(animal => animal.gender === 'Female').length;
        const unknownCount = linkedAnimals.length - maleCount - femaleCount;
        const litterSizeBorn = Math.max(Number(litter.litterSizeBorn || litter.numberBorn || 0), linkedCount);
        return { maleCount, femaleCount, unknownCount, litterSizeBorn, numberBorn: litterSizeBorn };
    };

    const saveAnimalLink = async (animal, isNew = false) => {
        const animalId = animal.id_public;
        if (!animalId || !litter?._id) {
            setError('This animal or litter is missing an ID, so it cannot be linked.');
            return;
        }
        if (species && animal.species !== species) {
            setError(`Only ${species} animals can be linked to this litter.`);
            return;
        }
        setSavingId(animalId);
        setError('');
        try {
            const existing = offspring || [];
            const existingIds = [...new Set([
                ...(litter.offspringIds_public || []),
                ...existing.map(item => item.id_public),
            ].filter(Boolean))];
            const linkedAnimals = [...existing, animal];
            if (!isNew) {
                await apiClient.put(`/animals/${encodeURIComponent(animalId)}`, {
                    sireId_public: litter.sireId_public || litter.sire?.id_public || null,
                    damId_public: litter.damId_public || litter.dam?.id_public || null,
                });
            }
            await apiClient.put(`/litters/${encodeURIComponent(litter._id)}`, {
                offspringIds_public: [...new Set([...existingIds, animalId])],
                ...countsFor(linkedAnimals, existingIds.length + 1),
            });
            await onComplete?.(animal);
            onClose();
        } catch (err) {
            console.error('[AddOffspringModal]', err);
            setError(err.response?.data?.message || (isNew
                ? 'The animal was created, but it could not be linked to this litter.'
                : 'Failed to link this animal to the litter.'));
        } finally {
            setSavingId(null);
        }
    };

    const handleQuickAdd = async (event) => {
        event.preventDefault();
        if (!name.trim()) {
            setError('Enter a name for the offspring.');
            return;
        }
        if (!species) {
            setError('The litter does not have a species. Add the species to the litter or its parents before creating offspring.');
            return;
        }
        const animal = {
            name: name.trim(),
            species,
            gender,
            birthDate: litter.birthDate || undefined,
            status: 'Pet',
            sireId_public: litter.sireId_public || litter.sire?.id_public || null,
            damId_public: litter.damId_public || litter.dam?.id_public || null,
            color: appearance.color?.trim() || null,
            coat: appearance.coat?.trim() || null,
            ...Object.fromEntries(appearanceFields
                .filter(({ key }) => !['color', 'coat'].includes(key) && appearance[key]?.trim())
                .map(({ key }) => [key, appearance[key].trim()])),
            isOwned: true,
        };
        setSavingId('new');
        setError('');
        try {
            const res = await apiClient.post('/animals', animal);
            if (!res.data?.id_public) throw new Error('Animal was created without a public ID.');
            await saveAnimalLink(res.data, true);
        } catch (err) {
            console.error('[AddOffspringModal]', err);
            setError(err.response?.data?.message || err.message || 'Failed to create offspring.');
            setSavingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="add-offspring-title">
            <div className="bg-white dark:bg-dark-card-bg rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
                <div className="flex items-center justify-between">
                    <h2 id="add-offspring-title" className="text-base font-semibold">Add Offspring</h2>
                    <button type="button" onClick={onClose} className="px-2 py-1 text-sm">Close</button>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => { setMode('quick'); setError(''); }} className={`px-3 py-1 text-sm rounded ${mode === 'quick' ? 'bg-primary text-black' : 'border'}`}>Quick Add</button>
                    <button type="button" onClick={() => { setMode('link'); setError(''); }} className={`px-3 py-1 text-sm rounded ${mode === 'link' ? 'bg-primary text-black' : 'border'}`}>Quick Link</button>
                </div>
                {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                {mode === 'quick' ? (
                    <form onSubmit={handleQuickAdd} className="space-y-3">
                        <label className="block text-xs font-medium">
                            Name *
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="mt-1 w-full border rounded px-2 py-1 text-sm" required />
                        </label>
                        <label className="block text-xs font-medium">
                            Gender
                            <select value={gender} onChange={e => setGender(e.target.value)} className="mt-1 w-full border rounded px-2 py-1 text-sm">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Intersex">Intersex</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </label>
                        {appearanceFields.map(({ key, label }) => (
                            <label key={key} className="block text-xs font-medium">
                                {label}
                                <input
                                    aria-label={label}
                                    value={appearance[key] || ''}
                                    onChange={event => setAppearance(current => ({ ...current, [key]: event.target.value }))}
                                    placeholder={label}
                                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                                />
                            </label>
                        ))}
                        <p className="text-xs text-gray-500">Species, birth date, sire, and dam are taken from this litter.</p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-3 py-1 text-sm">Cancel</button>
                            <button type="submit" disabled={savingId !== null} className="px-3 py-1 text-sm rounded bg-primary text-black disabled:opacity-50">
                                {savingId === 'new' ? <Loader2 className="inline animate-spin" size={14} /> : 'Add'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search animals" aria-label="Search animals" className="w-full border rounded px-2 py-1 text-sm" />
                        <div className="max-h-60 overflow-auto space-y-2">
                            {animalsLoading ? (
                                <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin" size={16} /> Loading animals…</p>
                            ) : candidates.length ? candidates.map(animal => (
                                <div key={animal.id_public} className="flex items-center justify-between border rounded px-2 py-1 text-sm">
                                    <span>{animal.name || animal.id_public} <span className="text-xs text-gray-500">{animal.species}</span></span>
                                    <button type="button" disabled={savingId !== null} onClick={() => saveAnimalLink(animal)} className="text-xs text-primary disabled:opacity-50">
                                        {savingId === animal.id_public ? <Loader2 className="animate-spin" size={14} /> : 'Link'}
                                    </button>
                                </div>
                            )) : !error && <p className="text-sm text-gray-500">No unlinked animals found.</p>}
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="px-3 py-1 text-sm">Done</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddOffspringModal;
