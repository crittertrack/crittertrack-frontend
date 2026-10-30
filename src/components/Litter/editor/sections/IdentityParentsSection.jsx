import React, { useState } from 'react';
import { Loader2, Mars, Venus, X, Search } from 'lucide-react';
import { ParentSearchModal } from '../../../Modals/SearchModals';
import { SpeciesPickerModal } from '../../../Modals/SpeciesModals';
import { formatAnimalDisplayName } from '../../../../utils/animalDisplayName';
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
        <div className={cardClass}>
            <SectionTitle title="Identity & parents" description="Name the pairing and choose the sire and dam." />

            <FieldRow label="Pair / litter name" hint="Optional. A short name to recognise this pairing.">
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
        </div>
    );
}
