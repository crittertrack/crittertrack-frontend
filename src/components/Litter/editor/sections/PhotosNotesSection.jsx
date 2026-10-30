import React, { useRef } from 'react';
import { Camera, Loader2, Trash2, Images } from 'lucide-react';
import { FieldRow, SectionTitle, cardClass, inputClass, secondaryBtn } from '../fields';

const MAX_PHOTOS = 5;
const ACCEPT = 'image/png,image/jpeg';

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
}) {
    const fileRef = useRef(null);
    const visibleSaved = savedImages.filter(i => i.r2Key !== '__uploading__' || i.url);
    const count = isEdit ? savedImages.filter(i => i.r2Key !== '__uploading__').length : pendingImages.length;

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
                    description={isEdit ? 'Photos upload immediately.' : 'Photos are uploaded when you save the litter.'}
                    icon={Images}
                    iconBg="bg-sky-100"
                    iconColor="text-sky-600"
                />
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {isEdit && visibleSaved.map((img, i) => (
                        <div key={img.r2Key || img.url || i} className="relative">
                            <img src={img.url} alt={`Litter gallery ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                            {img.r2Key === '__uploading__' ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg"><Loader2 className="animate-spin text-white" size={20} /></div>
                            ) : (
                                <button type="button" aria-label="Delete photo" onClick={() => onDeleteSaved(img.r2Key)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white"><Trash2 size={14} /></button>
                            )}
                        </div>
                    ))}
                    {!isEdit && pendingImages.map((item, idx) => (
                        <div key={item.previewUrl} className="relative">
                            <img src={item.previewUrl} alt={`Staged upload ${idx + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                            <button type="button" aria-label="Remove photo" onClick={() => onRemovePending(idx)} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white"><Trash2 size={14} /></button>
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
