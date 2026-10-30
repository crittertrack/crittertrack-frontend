import React, { useState } from 'react';

const AddOffspringModal = ({ open, onClose, ownedAnimals = [], litter = null }) => {
    const [mode, setMode] = useState('quick');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [color, setColor] = useState('');
    const [coat, setCoat] = useState('');
    if (!open) return null;
    const candidates = ownedAnimals.filter(a => !a.litterId && (litter?.sireId_public ? a.sireId_public === litter.sireId_public : true));
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-dark-card-bg rounded-lg p-4 w-96 space-y-3">
                <div className="flex gap-2">
                    <button type="button" onClick={() => setMode('quick')} className={`px-3 py-1 text-sm rounded ${mode === 'quick' ? 'bg-primary text-black' : 'border'}`}>Quick Add</button>
                    <button type="button" onClick={() => setMode('link')} className={`px-3 py-1 text-sm rounded ${mode === 'link' ? 'bg-primary text-black' : 'border'}`}>Quick Link</button>
                </div>
                {mode === 'quick' ? (
                    <>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full border rounded px-2 py-1 text-sm" />
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
                            <option value="">Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                        <input value={color} onChange={e => setColor(e.target.value)} placeholder="Color" className="w-full border rounded px-2 py-1 text-sm" />
                        <input value={coat} onChange={e => setCoat(e.target.value)} placeholder="Coat" className="w-full border rounded px-2 py-1 text-sm" />
                        <p className="text-xs text-gray-500">Species, birth date, sire, dam auto-assigned from litter.</p>
                    </>
                ) : (
                    <div className="max-h-60 overflow-auto space-y-2">
                        {candidates.length ? candidates.map(a => (
                            <div key={a.id_public} className="flex items-center justify-between border rounded px-2 py-1 text-sm">
                                <span>{a.name}</span>
                                <button type="button" className="text-xs text-primary">Link</button>
                            </div>
                        )) : <p className="text-sm text-gray-500">No matching unlinked animals.</p>}
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-3 py-1 text-sm">Cancel</button>
                    <button type="button" onClick={onClose} className="px-3 py-1 text-sm rounded bg-primary text-black">{mode === 'quick' ? 'Add' : 'Done'}</button>
                </div>
            </div>
        </div>
    );
};

export default AddOffspringModal;