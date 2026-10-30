import React, { useState } from 'react';
import { Loader2, Mars, Venus, X, Search, UsersRound, Tag, HeartHandshake, ClipboardList } from 'lucide-react';
import { ParentSearchModal } from '../../../Modals/SearchModals';
import { SpeciesPickerModal } from '../../../Modals/SpeciesModals';
import { formatAnimalDisplayName } from '../../../../utils/animalDisplayName';
import { formatDate } from '../../../../utils/dateFormatter';
import { FieldRow, SectionTitle, cardClass, inputClass, secondaryBtn } from '../fields';

const Spinner = () => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="text-gray-600 dark:text-dark-text-secondary">Loading...</span>
    </div>
);

const ParentPicker = ({ role, icon, animal, id, locked, error, onPick, onClear }) => (
    <FieldRow label={role} required={!locked} error={error} hint={locked ? 'Locked — parents can’t change once a litter exists.' : undefined}>
        <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={locked}
                onClick={onPick}
                className={`${inputClass} flex items-center gap-2 text-left ${locked ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {icon}
                <span className="truncate">
                    {animal ? `${formatAnimalDisplayName(animal)} (${animal.id_public})` : id || `Select ${role.toLowerCase()}…`}
                </span>
            </button>
            {!locked && id && (
                <button type="button" onClick={onClear} className={secondaryBtn} aria-label={`Clear ${role}`}><X size={14} /></button>
            )}
        </div>
    </FieldRow>
);

export default function IdentityParentsSection({
    form,
    setField,
    errors,
    isEdit,
    sire,
    dam,
    onSelectParent,
    onSelectSpecies,
    speciesOptions,
    authToken,
    API_BASE_URL,
    showModalMessage,
}) {
    const [picker, setPicker] = useState(null); // 'sire' | 'dam' | 'species' | null

    return (
        <>
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                <UsersRound size={24} />
            </div>
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Identity & Parents</h1>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">Identify the litter, select its species, and assign the parents.</p>
            </div>
        </div>

            {/* Litter Details */}
            <div className="bg-white dark:bg-dark-card-bg rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <Tag size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-dark-text">Litter Details</h2>
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">Basic information used to identify this litter.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow label="Litter Name / Identifier" hint="Optional. A short name to recognise this pairing.">
                        <input
                            type="text"
                            className={inputClass}
                            value={form.breedingPairCodeName}
                            onChange={(e) => setField('breedingPairCodeName', e.target.value)}
                            maxLength={80}
                        />
                    </FieldRow>
                    <FieldRow label="Species" required={!isEdit} hint={isEdit ? 'Locked — cannot change on edit.' : 'Choose a species to filter the sire and dam search.'}>
                        <button
                            type="button"
                            disabled={isEdit}
                            onClick={() => setPicker('species')}
                            className={`${inputClass} text-left ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {form.species || 'Select species…'}
                        </button>
                    </FieldRow>
                </div>
            </div>

            {/* Parents */}
            <div className="bg-white dark:bg-dark-card-bg rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                        <HeartHandshake size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-dark-text">Parents</h2>
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">Select the sire and dam for this litter.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ParentPicker
                        role="Sire"
                        icon={<Mars size={14} className="text-blue-500 shrink-0" />}
                        animal={sire}
                        id={form.sireId_public}
                        locked={isEdit}
                        error={errors.sireId_public}
                        onPick={() => setPicker('sire')}
                        onClear={() => onSelectParent('sire', null)}
                    />
                    <ParentPicker
                        role="Dam"
                        icon={<Venus size={14} className="text-pink-500 shrink-0" />}
                        animal={dam}
                        id={form.damId_public}
                        locked={isEdit}
                        error={errors.damId_public}
                        onPick={() => setPicker('dam')}
                        onClear={() => onSelectParent('dam', null)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[sire, dam].map((animal, i) => animal ? (
                        <div key={i} className="border border-gray-200 dark:border-dark-border rounded-lg p-3 flex gap-3 relative">
                            <div className="w-20 h-20 shrink-0 bg-gray-100 dark:bg-dark-surface rounded overflow-hidden">
                                {(animal.images?.[0]?.url || animal.image_url || animal.photo) ? <img src={animal.images?.[0]?.url || animal.image_url || animal.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>}
                            </div>
                            <div className="min-w-0 flex-1 text-xs space-y-1">
                                <div className="font-medium text-gray-900 dark:text-dark-text flex items-center gap-1">{animal.gender === 'Male' ? <Mars size={12} className="text-blue-500" /> : animal.gender === 'Female' ? <Venus size={12} className="text-pink-500" /> : null}{formatAnimalDisplayName(animal)}</div>
                                <div className="text-gray-500 dark:text-dark-text-muted absolute bottom-2 right-2">{animal.id_public}</div>
                                <div className="text-gray-500 dark:text-dark-text-muted">Born: {animal.birthDate || animal.birth_date ? formatDate(animal.birthDate || animal.birth_date) : '—'}</div>
                                <div className="text-gray-500 dark:text-dark-text-muted">Variety: {animal.variety || '—'}</div>
                                <div className="text-gray-500 dark:text-dark-text-muted">Genetics: {animal.genetics || '—'}</div>
                            </div>
                        </div>
                    ) : null)}
                </div>
            </div>
            {/* Quick Reference */}
            <div className="bg-white dark:bg-dark-card-bg rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <ClipboardList size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-dark-text">Quick Reference</h2>
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">Keep useful pairing information close at hand.</p>
                    </div>
                </div>
                <FieldRow label="Pairing Notes">
                    <textarea rows={3} className={inputClass} value={form.pairingNotes || ''} onChange={(e) => setField('pairingNotes', e.target.value)} />
                </FieldRow>
                <FieldRow label="Tags">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(form.tags || []).map((t, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                {t}
                                <button type="button" onClick={() => setField('tags', (form.tags || []).filter((_, j) => j !== i))}><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Add tag and press Enter"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const v = e.target.value.trim();
                                if (v) {
                                    setField('tags', [...(form.tags || []), v]);
                                    e.target.value = '';
                                }
                            }
                        }}
                    />
                </FieldRow>
            </div>


            {picker === 'species' && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions}
                    onSelect={(name) => { onSelectSpecies(name); setPicker(null); }}
                    onClose={() => setPicker(null)}
                    X={X}
                    Search={Search}
                />
            )}
            {(picker === 'sire' || picker === 'dam') && (
                <ParentSearchModal
                    title={picker === 'sire' ? 'Select Sire' : 'Select Dam'}
                    onSelect={(animal) => { onSelectParent(picker, animal); setPicker(null); }}
                    onClose={() => setPicker(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={Spinner}
                    requiredGender={picker === 'sire' ? ['Male', 'Intersex', 'Mixed', 'Unknown'] : ['Female', 'Intersex', 'Mixed', 'Unknown']}
                    species={form.species || undefined}
                />
            )}
        </>
    );
}
