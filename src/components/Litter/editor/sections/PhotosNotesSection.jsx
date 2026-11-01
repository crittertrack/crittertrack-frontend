import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, Images, Star } from 'lucide-react';
import { FieldRow, SectionTitle, cardClass, inputClass, secondaryBtn } from '../fields';

const MAX_PHOTOS = 5;
const ACCEPT = 'image/png,image/jpeg';
const noop = () => {};

const imageUrl = (image) => typeof image === 'string' ? image : image?.url;
const imageKey = (image) => typeof image === 'string' ? null : image?.r2Key;

const PhotoMetadataFields = ({ value, onChange, linkedOffspring, coverName }) => (
    <div className="mt-3 space-y-3">
        <FieldRow label="Caption">
            <input
                type="text"
                maxLength={240}
                aria-label="Photo caption"
                className={inputClass}
                value={value.caption || ''}
                onChange={event => onChange({ caption: event.target.value })}
                placeholder="Add a caption"
            />
        </FieldRow>
        <FieldRow label="Capture date">
            <input
                type="date"
                aria-label="Photo capture date"
                className={inputClass}
                value={value.captureDate || ''}
                onChange={event => onChange({ captureDate: event.target.value })}
            />
        </FieldRow>
        <FieldRow label="Associated offspring">
            <select
                aria-label="Associated offspring"
                className={inputClass}
                value={value.offspringId_public || ''}
                onChange={event => onChange({ offspringId_public: event.target.value })}
            >
                <option value="">No offspring association</option>
                {value.offspringId_public && !linkedOffspring.some(animal => animal.id_public === value.offspringId_public) && (
                    <option value={value.offspringId_public}>Existing association ({value.offspringId_public})</option>
                )}
                {linkedOffspring.map(animal => (
                    <option key={animal.id_public} value={animal.id_public}>
                        {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')} ({animal.id_public})
                    </option>
                ))}
            </select>
        </FieldRow>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
            <input type="radio" name={coverName} checked={!!value.isCover} onChange={() => onChange({ isCover: true })} />
            Use as cover image
        </label>
    </div>
);

const metadataFrom = (image, isCover) => ({
        caption: image?.caption || '',
        captureDate: image?.captureDate || '',
        offspringId_public: image?.offspringId_public || '',
        isCover,
});
const sameMetadata = (left, right) => (
    left.caption === right.caption
    && left.captureDate === right.captureDate
    && left.offspringId_public === right.offspringId_public
    && left.isCover === right.isCover
);

const SavedPhotoCard = ({ image, index, isCover, linkedOffspring, onDelete, onSaveMetadata, onDirtyChange }) => {
    const [draft, setDraft] = useState(() => metadataFrom(image, isCover));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const r2Key = imageKey(image);

    useEffect(() => {
        const persisted = metadataFrom(image, isCover);
        setDraft(persisted);
        onDirtyChange(r2Key, false);
    }, [image, isCover, onDirtyChange, r2Key]);

    const updateDraft = (patch) => {
        const next = { ...draft, ...patch };
        setDraft(next);
        onDirtyChange(r2Key, !sameMetadata(next, metadataFrom(image, isCover)));
    };
    const save = async () => {
        if (!r2Key) return;
        setSaving(true);
        setError('');
        try {
            await onSaveMetadata(r2Key, draft);
            onDirtyChange(r2Key, false);
        } catch (saveError) {
            console.error('[LitterEditor] Failed to save litter photo details:', saveError);
            setError(saveError.response?.data?.message || 'Failed to save photo details.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-w-0">
            <div className="relative">
                <img src={imageUrl(image)} alt={draft.caption || `Litter gallery ${index + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                {isCover && (
                    <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                        <Star size={12} /> Cover
                    </span>
                )}
                {r2Key && (
                    <button type="button" aria-label="Delete photo" onClick={() => onDelete(r2Key)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            {r2Key ? (
                <>
                    <PhotoMetadataFields value={draft} onChange={updateDraft} linkedOffspring={linkedOffspring} coverName={`saved-cover-${index}`} />
                    <button type="button" disabled={saving} onClick={save} className={`${secondaryBtn} mt-2 w-full disabled:opacity-50`}>
                        {saving ? 'Saving…' : 'Save photo details'}
                    </button>
                </>
            ) : <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted">Details can’t be edited for this legacy photo.</p>}
            {error && <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
};

export default function PhotosNotesSection({
    form,
    setField,
    isEdit,
    savedImages,
    pendingImages,
    uploading,
    onUpload,
    onStage,
    onDeleteSaved,
    onRemovePending,
    onUpdatePending,
    onSaveImageMetadata,
    onPhotoMetadataDirtyChange = noop,
    linkedOffspring = [],
}) {
    const fileRef = useRef(null);
    const visibleSaved = savedImages.filter(i => i?.r2Key !== '__uploading__' || i?.url);
    const storedSaved = savedImages.filter(i => i?.r2Key !== '__uploading__');
    const hasSavedCover = storedSaved.some(i => typeof i === 'object' && i?.isCover);
    const count = isEdit ? storedSaved.length : pendingImages.length;

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (isEdit) onUpload(file); else onStage(file);
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                    <Images size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Photos & Notes</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Add photos and additional information about this litter.</p>
                </div>
            </div>
            <div className={cardClass}>
                <SectionTitle
                    title={`Photos (${count}/${MAX_PHOTOS})`}
                    description={isEdit ? 'Photos upload immediately. Save each photo’s details to apply changes.' : 'Photos and their details are saved when you create the litter.'}
                    icon={Images}
                    iconBg="bg-sky-100"
                    iconColor="text-sky-600"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isEdit && visibleSaved.map((img, i) => {
                        const cover = typeof img === 'object' && img?.isCover
                            ? true
                            : !hasSavedCover && i === 0;
                        if (img?.r2Key === '__uploading__') {
                            return (
                                <div key={img.url || i} className="relative">
                                    <img src={imageUrl(img)} alt={`Litter gallery ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg"><Loader2 className="animate-spin text-white" size={20} /></div>
                                </div>
                            );
                        }
                        return (
                            <SavedPhotoCard
                                key={imageKey(img) || imageUrl(img) || i}
                                image={img}
                                index={i}
                                isCover={cover}
                                linkedOffspring={linkedOffspring}
                                onDelete={onDeleteSaved}
                                onSaveMetadata={onSaveImageMetadata}
                                onDirtyChange={onPhotoMetadataDirtyChange}
                            />
                        );
                    })}
                    {!isEdit && pendingImages.map((item, idx) => (
                        <div key={item.previewUrl} className="min-w-0">
                            <div className="relative">
                                <img src={item.previewUrl} alt={`Staged upload ${idx + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                                <button type="button" aria-label="Remove photo" onClick={() => onRemovePending(idx)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <PhotoMetadataFields
                                value={item}
                                onChange={patch => onUpdatePending(idx, patch)}
                                linkedOffspring={linkedOffspring}
                                coverName="pending-cover-image"
                            />
                        </div>
                    ))}
                </div>
                {count < MAX_PHOTOS && (
                    <>
                        <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
                        <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className={`${secondaryBtn} flex items-center gap-2`}>
                            <Camera size={14} /> {uploading ? 'Uploading…' : 'Add photo'}
                        </button>
                        <p className="text-xs text-gray-400 dark:text-dark-text-muted">PNG or JPEG. Photos are compressed to fit the 500 KB limit.</p>
                    </>
                )}
            </div>

            <div className={cardClass}>
                <SectionTitle title="Notes" />
                <FieldRow>
                    <textarea
                        rows={5}
                        className={inputClass}
                        value={form.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                        placeholder="Additional notes about this litter..."
                    />
                </FieldRow>
            </div>
        </>
    );
}
