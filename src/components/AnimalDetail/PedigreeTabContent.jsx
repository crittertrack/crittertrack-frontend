import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ScrollText, Mars, Venus } from 'lucide-react';
import { PedigreeChart } from '../AnimalForm';

export const PedigreeTabContent = ({ animal, API_BASE_URL, authToken, onViewAnimal }) => {
    const [generations, setGenerations] = useState(4); // Default to 4 generations for inline view
    const [isVerticalView, setIsVerticalView] = useState(false); // Default to horizontal
    const [mpLoading, setMpLoading] = useState(false); // State for manual pedigree data loading
    const [mpEnrichedData, setMpEnrichedData] = useState(null); // Enriched manual pedigree data
    const [showHorizCert, setShowHorizCert] = useState(false);
    const [showVertCert, setShowVertCert] = useState(false);

    useEffect(() => {
        if (!animal?.id_public) return;

        let cancelled = false;
        setMpLoading(true);

        const fetchAncestry = async () => {
            const manual = animal?.manualPedigree || {};
            
            const toSlot = (a) => {
                if (!a) return null;
                const variety = ['color','coatPattern','coat','earset','phenotype','morph','markings'].map(k => a[k]).filter(Boolean).join(' ');
                return { 
                    mode: 'ctc', 
                    ctcId: a.id_public || '', 
                    prefix: a.prefix || '', 
                    name: a.name || '', 
                    suffix: a.suffix || '', 
                    variety, 
                    genCode: a.geneticCode || '', 
                    birthDate: a.birthDate ? String(a.birthDate).slice(0,10) : '', 
                    deceasedDate: a.deceasedDate ? String(a.deceasedDate).slice(0,10) : '', 
                    breederName: a.breederName || a.manualBreederName || '', 
                    gender: a.gender || '', 
                    imageUrl: a.imageUrl || a.photoUrl || '', 
                    notes: '' 
                };
            };

            const fetchOne = async (id) => {
                if (!id) return null;
                try {
                    const r = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                    return r.data || null;
                } catch {
                    return null;
                }
            };

            // Fetch up to 3 generations
            const [sire, dam] = await Promise.all([
                fetchOne(animal?.sireId_public || animal?.fatherId_public),
                fetchOne(animal?.damId_public  || animal?.motherId_public),
            ]);
            if (cancelled) return;

            const [ss, sd, ds, dd] = await Promise.all([
                fetchOne(sire?.sireId_public || sire?.fatherId_public),
                fetchOne(sire?.damId_public  || sire?.motherId_public),
                fetchOne(dam?.sireId_public  || dam?.fatherId_public),
                fetchOne(dam?.damId_public   || dam?.motherId_public),
            ]);
            if (cancelled) return;

            const [sss, ssd, sds, sdd, dss, dsd, dds, ddd] = await Promise.all([
                fetchOne(ss?.sireId_public || ss?.fatherId_public), fetchOne(ss?.damId_public  || ss?.motherId_public),
                fetchOne(sd?.sireId_public || sd?.fatherId_public), fetchOne(sd?.damId_public  || sd?.motherId_public),
                fetchOne(ds?.sireId_public || ds?.fatherId_public), fetchOne(ds?.damId_public  || ds?.motherId_public),
                fetchOne(dd?.sireId_public || dd?.fatherId_public), fetchOne(dd?.damId_public  || dd?.motherId_public),
            ]);
            if (cancelled) return;

            const seeded = {
                ...(sire && { sire: toSlot(sire) }), ...(dam && { dam: toSlot(dam) }),
                ...(ss && { sireSire: toSlot(ss) }), ...(sd && { sireDam: toSlot(sd) }),
                ...(ds && { damSire: toSlot(ds) }), ...(dd && { damDam: toSlot(dd) }),
                ...(sss && { sireSireSire: toSlot(sss) }), ...(ssd && { sireSireDam: toSlot(ssd) }),
                ...(sds && { sireDamSire: toSlot(sds) }), ...(sdd && { sireDamDam: toSlot(sdd) }),
                ...(dss && { damSireSire: toSlot(dss) }), ...(dsd && { damSireDam: toSlot(dsd) }),
                ...(dds && { damDamSire: toSlot(dds) }), ...(ddd && { damDamDam: toSlot(ddd) }),
            };

            const merged = { ...manual, ...seeded };

            if (!cancelled) {
                setMpEnrichedData(merged);
                setMpLoading(false);
            }
        };

        fetchAncestry();

        return () => { cancelled = true; };
    }, [animal, API_BASE_URL, authToken]);

    if (mpLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Loading Ancestry...</span>
                </div>
            </div>
        );
    }

    const emptySlot = () => ({ mode: 'manual', ctcId: '', prefix: '', name: '', suffix: '', variety: '', genCode: '', birthDate: '', breederName: '', gender: '', imageUrl: '', notes: '' });
    const getSlot = (slotKey) => mpEnrichedData?.[slotKey] || animal?.manualPedigree?.[slotKey] || emptySlot();

    const renderSlot = (slotKey, label) => {
        const d = getSlot(slotKey);
        const hasData = d && (d.ctcId || Object.entries(d).some(([fk, v]) => fk !== 'mode' && v && String(v).trim()));
        const fullName = [d.prefix, d.name, d.suffix].filter(Boolean).join(' ');
        const slotGender = (slotKey === 'sire' || slotKey.endsWith('Sire')) ? 'Male' : 'Female';
        const isSire = slotGender === 'Male';
        const GIcon = isSire ? Mars : Venus;
        const gColor = isSire ? 'text-blue-400' : 'text-pink-400';
        const handleSlotClick = d.ctcId && onViewAnimal ? async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/animals/any/${encodeURIComponent(d.ctcId)}`, { headers: { Authorization: `Bearer ${authToken}` } });
                if (res.data) onViewAnimal(res.data);
            } catch { /* not accessible */ }
        } : undefined;
        return (
            <div key={slotKey} onClick={handleSlotClick} className={`rounded-lg border-2 p-3 h-full relative ${handleSlotClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${hasData ? (isSire ? 'border-blue-200 bg-blue-50/40' : 'border-pink-200 bg-pink-50/40') : 'border-dashed border-gray-200 bg-gray-50'}`}>
                <div className={`flex items-center gap-1 mb-1.5 ${isSire ? 'text-blue-400' : 'text-pink-400'}`}>
                    <GIcon size={11} className={`flex-shrink-0 ${gColor}`} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                </div>
                {hasData ? (
                    <div className="flex gap-2.5">
                        {d.imageUrl && <img src={d.imageUrl} alt={fullName} className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200 self-start" />}
                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                            {fullName && <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight">{fullName}</p>}
                            {d.variety && <p className="text-[9px] sm:text-[11px] text-gray-500">{d.variety}</p>}
                            {d.genCode && <p className="text-[9px] sm:text-[11px] font-mono text-indigo-600">{d.genCode}</p>}
                            {d.birthDate && <p className="text-[9px] sm:text-[11px] text-gray-400">{formatDate(d.birthDate)}</p>}
                            {d.deceasedDate && <p className="text-[9px] sm:text-[11px] text-red-600 font-semibold">† {formatDate(d.deceasedDate)}</p>}
                            {d.breederName && <p className="text-[9px] sm:text-[11px] text-gray-500 italic">{d.breederName}</p>}
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2.5">
                        <div className="flex-1 min-w-0 space-y-0.5 pb-4">
                            <p className="text-[11px] text-gray-300 italic">•</p>
                        </div>
                    </div>
                )}
                {d.ctcId && <p className="absolute bottom-1.5 right-2 text-[10px] font-mono text-gray-800">{d.ctcId}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                <button onClick={() => setShowHorizCert(true)} className="px-4 py-2 text-sm rounded-lg bg-primary text-black border border-primary/40 hover:bg-primary/90 transition flex items-center gap-1.5 font-semibold shadow-sm">
                    <ScrollText size={16} /> Open Horizontal Certificate
                </button>
                <button onClick={() => setShowVertCert(true)} className="px-4 py-2 text-sm rounded-lg bg-accent hover:bg-accent/90 text-white border border-accent/40 transition flex items-center gap-1.5 font-semibold shadow-sm">
                    <ScrollText size={16} /> Open Vertical Certificate
                </button>
                {/* Orientation Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Orientation:</span>
                    <button
                        type="button"
                        onClick={() => setIsVerticalView(false)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${!isVerticalView ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Horizontal
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsVerticalView(true)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${isVerticalView ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Vertical
                    </button>
                </div>

                {/* Generations Slider */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Generations:</span>
                    <input
                        type="range"
                        min={1}
                        max={isVerticalView ? 3 : 4} // Max 3 for vertical, 4 for horizontal
                        step={1}
                        value={generations}
                        onChange={e => setGenerations(Number(e.target.value))}
                        className="w-24 accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-bold w-4">{generations}</span>
                </div>
            </div>
            {showHorizCert && <PedigreeChart animalId={animal.id_public} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => setShowHorizCert(false)} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />}
            {showVertCert && <PedigreeChart vertical animalId={animal.id_public} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => setShowVertCert(false)} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />}
            <div className="text-center text-gray-400 text-sm pt-4">
                <p>Use the buttons above to view the interactive pedigree chart.</p>
                <p className="text-xs mt-1">The full pedigree is best viewed on a larger screen.</p>
            </div>
            <div className="mt-6 space-y-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Parents (Gen 1)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {renderSlot('sire', 'Sire')}
                        {renderSlot('dam', 'Dam')}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Grandparents (Gen 2)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {renderSlot('sireSire', 'Paternal Grandsire')}
                        {renderSlot('sireDam', 'Paternal Granddam')}
                        {renderSlot('damSire', 'Maternal Grandsire')}
                        {renderSlot('damDam', 'Maternal Granddam')}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Great-Grandparents (Gen 3)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {renderSlot('sireSireSire', 'PGS Great Grandsire')}
                            {renderSlot('sireDamSire', 'PGD Great Grandsire')}
                            {renderSlot('damSireSire', 'MGS Great Grandsire')}
                            {renderSlot('damDamSire', 'MGD Great Grandsire')}
                            {renderSlot('sireSireDam', 'PGS Great Granddam')}
                            {renderSlot('sireDamDam', 'PGD Great Granddam')}
                            {renderSlot('damSireDam', 'MGS Great Granddam')}
                            {renderSlot('damDamDam', 'MGD Great Granddam')} 
                    </div>
                </div>
            </div>
        </div>
    );
};