import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ScrollText } from 'lucide-react';
import { PedigreeChart } from '../AnimalForm';

export const PedigreeTabContent = ({ animal, API_BASE_URL, authToken, onViewAnimal }) => {
    const [mpLoading, setMpLoading] = useState(false);
    const [mpEnrichedData, setMpEnrichedData] = useState(null);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 flex-wrap">
                <button onClick={() => setShowHorizCert(true)} className="px-4 py-2 text-sm rounded-lg bg-primary text-black border border-primary/40 hover:bg-primary/90 transition flex items-center gap-1.5 font-semibold shadow-sm">
                    <ScrollText size={16} /> Open Horizontal Certificate
                </button>
                <button onClick={() => setShowVertCert(true)} className="px-4 py-2 text-sm rounded-lg bg-accent hover:bg-accent/90 text-white border border-accent/40 transition flex items-center gap-1.5 font-semibold shadow-sm">
                    <ScrollText size={16} /> Open Vertical Certificate
                </button>
            </div>

            {showHorizCert && <PedigreeChart animalId={animal.id_public} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => setShowHorizCert(false)} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />}
            {showVertCert && <PedigreeChart vertical animalId={animal.id_public} API_BASE_URL={API_BASE_URL} authToken={authToken} onClose={() => setShowVertCert(false)} manualData={mpEnrichedData} onViewAnimal={onViewAnimal} />}

            <div className="text-center text-gray-400 text-sm pt-4">
                <p>Use the buttons above to view the interactive pedigree chart.</p>
                <p className="text-xs mt-1">The full pedigree is best viewed on a larger screen.</p>
            </div>
        </div>
    );
};