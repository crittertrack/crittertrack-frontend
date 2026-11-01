import React, { useCallback, useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { PedigreeChart } from '../../AnimalForm';
import DirectParentTree from '../../FamilyTree/DirectParentTree';

const PedigreesTab = ({ litter, onViewAnimal }) => {
    const [certView, setCertView] = useState(null);
    const [generations, setGenerations] = useState(4);
    const [treeError, setTreeError] = useState(false);
    const [treeAttempt, setTreeAttempt] = useState(0);
    const litterId = litter?.litter_id_public || litter?._id;
    const litterAsAnimal = useMemo(() => {
        if (!litter) return null;
        return {
            id_public: litter.litter_id_public || litter._id || litter.id,
            name: litter.breedingPairCodeName || litter.litter_id_public || litter._id || litter.id,
            gender: 'Unknown',
            sireId_public: litter.sireId_public || litter.sire?.id_public || litter.sireId || litter.sire?.id,
            damId_public: litter.damId_public || litter.dam?.id_public || litter.damId || litter.dam?.id,
            birthDate: litter.birthDate,
            imageUrl: litter.imageUrl || litter.photoUrl,
            status: undefined,
        };
    }, [litter]);
    const reportTreeError = useCallback(() => setTreeError(true), []);

    return (
        <div data-testid="tab-pedigrees" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Pedigree chart">
                    <button
                        type="button"
                        onClick={() => setCertView(certView === 'horizontal' ? null : 'horizontal')}
                        className="px-4 py-2 text-sm rounded-lg bg-primary dark:bg-dark-primary text-black border border-primary/40 hover:bg-primary/90 transition flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                        <ScrollText size={16} /> Open Horizontal Certificate
                    </button>
                    <button
                        type="button"
                        onClick={() => setCertView(certView === 'vertical' ? null : 'vertical')}
                        className="px-4 py-2 text-sm rounded-lg bg-accent hover:bg-accent/90 text-white border border-accent/40 transition flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                        <ScrollText size={16} /> Open Vertical Certificate
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <span>Generations</span>
                        <input type="range" min={1} max={6} value={generations} onChange={e => setGenerations(Number(e.target.value))} />
                        <span>{generations}</span>
                    </label>
                </div>
            </div>
            {litter && (
                <div className="w-full max-w-4xl mx-auto h-[70vh]">
                    <DirectParentTree
                        key={treeAttempt}
                        focusAnimalId={litterId}
                        focusAnimal={litterAsAnimal}
                        authToken={null}
                        maxDepth={generations}
                        onNodeClick={() => {}}
                        onViewAnimal={onViewAnimal}
                        onError={reportTreeError}
                    />
                </div>
            )}
            {treeError && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-2 text-sm text-red-600 dark:text-red-400">
                    <span>Some pedigree records could not be loaded.</span>
                    <button type="button" onClick={() => { setTreeError(false); setTreeAttempt(value => value + 1); }} className="underline">Retry</button>
                </div>
            )}
            {certView && (
                <PedigreeChart
                    litterId={litterId}
                    API_BASE_URL=""
                    authToken={null}
                    vertical={certView === 'vertical'}
                    onClose={() => setCertView(null)}
                    onViewAnimal={onViewAnimal}
                />
            )}
        </div>
    );
};

export default PedigreesTab;
