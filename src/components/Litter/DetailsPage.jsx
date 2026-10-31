import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { ArrowLeft, Edit, Eye, EyeOff, Loader2, Mars, Venus, Download, ChevronDown, ScrollText } from 'lucide-react';
import { deriveStoredStatus } from '../../utils/litterStatus';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';
import OverviewTab from './details/OverviewTab';
import GeneticsTab from './details/GeneticsTab';
import OffspringTab from './details/OffspringTab';
import { PedigreeChart } from '../AnimalForm';
import DirectParentTree from '../FamilyTree/DirectParentTree';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'genetics', label: 'Genetics & Compatibility' },
    { id: 'offspring', label: 'Offspring' },
    { id: 'pedigrees', label: 'Pedigrees' },
    { id: 'gallery', label: 'Gallery' },
];

const cardClass = 'rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4';

const PedigreesTab = ({ litter, onViewAnimal }) => {
    const [certView, setCertView] = useState(null); // null | 'horizontal' | 'vertical'
    const [generations, setGenerations] = useState(4);
    const sireId = litter?.sireId_public || litter?.sire?.id_public;
    const damId = litter?.damId_public || litter?.dam?.id_public;
    const litterId = litter?.litter_id_public || litter?._id;

    // Build a clean animal-shaped object for the litter so DirectParentTree
    // (designed for animals) can render it as the focus node without choking
    // on the litter's nested sire/dam objects.
    const litterAsAnimal = useMemo(() => {
        if (!litter) return null;
        const animal = {
            id_public: litter.litter_id_public || litter._id || litter.id,
            name: litter.breedingPairCodeName || litter.litter_id_public || litter._id || litter.id,
            gender: 'Unknown',
            sireId_public: litter.sireId_public || litter.sire?.id_public || litter.sireId || litter.sire?.id,
            damId_public: litter.damId_public || litter.dam?.id_public || litter.damId || litter.dam?.id,
            birthDate: litter.birthDate,
            imageUrl: litter.imageUrl || litter.photoUrl,
            status: undefined,
        };
        return animal;
    }, [litter]);

    const toggleCert = (view) => () => setCertView(certView === view ? null : view);

    return (
        <div data-testid="tab-pedigrees" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Pedigree chart">
                    <button
                        type="button"
                        onClick={toggleCert('horizontal')}
                        className="px-4 py-2 text-sm rounded-lg bg-primary dark:bg-dark-primary text-black border border-primary/40 hover:bg-primary/90 transition flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                        <ScrollText size={16} /> Open Horizontal Certificate
                    </button>
                    <button
                        type="button"
                        onClick={toggleCert('vertical')}
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

            {/* Inline tree — identical to DirectParentTree, litter as focus */}
            {litter && (
                <div className="w-full max-w-4xl mx-auto h-[70vh]">
                    <DirectParentTree
                        focusAnimalId={litterId}
                        focusAnimal={litterAsAnimal}
                        authToken={null}
                        maxDepth={generations}
                        onNodeClick={() => {}}
                        onViewAnimal={onViewAnimal}
                    />
                </div>
            )}

            {/* Modal: horizontal / vertical certificate chart (same as normal animal charts) */}
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
const GalleryTab = ({ images }) => {
    if (!images.length) return <div className="py-8 text-center text-sm text-gray-500 dark:text-dark-text-muted">No photos have been added to this litter.</div>;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img, i) => (
                <a key={img.r2Key || img.url || i} href={img.url} target="_blank" rel="noreferrer">
                    <img src={img.url} alt={`Litter gallery ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                </a>
            ))}
        </div>
    );
};

const LitterDetailsPage = ({ showModalMessage, onViewAnimal, handleViewAnimal, breedingLineDefs = [], animalBreedingLines = {} }) => {
    const navigate = useNavigate();
    // /litters/:ctlId (canonical) and /litter/:ctilid (legacy alias) both render this page.
    const { ctlId, ctilid: legacyId } = useParams();
    const ctilid = ctlId || legacyId;
    const [searchParams, setSearchParams] = useSearchParams();
    const [litter, setLitter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const daysSinceLitterBirth = litter && litter.birthDate
        ? Math.floor((new Date() - new Date(litter.birthDate)) / (1000 * 60 * 60 * 24))
        : 0;

    // Determine if "Mark Weaned" button should show
    // - Litter must be nursing (not yet weaned)
    // - Within 90-day boundary from litter birth date
    // - weaningDate NOT yet set (per your "date=confirmed" workflow
    const showWeanedButton = !!litter && !!litter.isNursing && daysSinceLitterBirth <= 90 && !litter.weaningConfirmed;

    // Button onClick - sets BOTH fields (your workflow)
    const handleMarkAsMated = async (litter) => {
        if (!litter.sireId_public || !litter.damId_public) {
            if (showModalMessage) showModalMessage('Error', 'This litter needs both a sire and a dam before it can be marked as mated.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        try {
            await apiClient.put(`/litters/${litter._id}`, { matingDate: today, isPlanned: false });
            await load();
            window.dispatchEvent(new Event('animals-changed'));
        } catch (err) {
            if (showModalMessage) showModalMessage('Error', 'Failed to mark as mated.');
        }
    };
    const handleMarkAsPregnant = async (litter) => {
        if (!litter.damId_public) {
            if (showModalMessage) showModalMessage('Error', 'This litter has no dam assigned.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        try {
            await Promise.all([
                apiClient.put(`/litters/${litter._id}`, { pregnancyDate: today }),
                apiClient.put(`/animals/${litter.damId_public}`, { isPregnant: true, isInMating: false }),
            ]);
            await load();
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: litter.damId_public, isPregnant: true, isInMating: false } }));
        } catch (err) {
            if (showModalMessage) showModalMessage('Error', 'Failed to mark dam as pregnant.');
        }
    };
    const handleMarkAsBorn = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await apiClient.put(`/litters/${litter._id}`, { birthDate: today });
            try { await apiClient.put(`/animals/${litter.damId_public}`, { isPregnant: false, isNursing: true }); } catch {}
            await load();
        } catch (err) {
            if (showModalMessage) showModalMessage('Error', 'Failed to mark as born.');
        }
    };
    const handleMarkAsWeaned = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await apiClient.put(`/litters/${litter._id}`, { weaningDate: today, weaningConfirmed: true });
            await load();
        } catch (err) {
            if (showModalMessage) showModalMessage('Error', 'Failed to mark as weaned.');
        }
    };
    const handleMarkWeaned = handleMarkAsWeaned;
    const handleQuickAction = (litter, action) => {
        const st = status;
        if (action === 'mated' && st === 'planned') return handleMarkAsMated(litter);
        if (action === 'pregnant' && st === 'mated') return handleMarkAsPregnant(litter);
        if (action === 'born' && st === 'pregnant') return handleMarkAsBorn(litter);
        if (action === 'weaned' && st === 'born') return handleMarkWeaned(litter);
    };
    const [offspring, setOffspring] = useState([]);
    const [offspringLoading, setOffspringLoading] = useState(true);

    const viewAnimal = onViewAnimal || handleViewAnimal;
    const requestedTab = searchParams.get('tab');
    const activeTab = TABS.some(t => t.id === requestedTab) ? requestedTab : 'overview';

    const load = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(ctilid)}`);
            setLitter(res.data);
        } catch (err) {
            if (err?.response?.status === 404) setNotFound(true);
            else if (showModalMessage) showModalMessage('Error', 'Failed to load this litter.');
            setLitter(null);
        } finally {
            setLoading(false);
        }
        setOffspringLoading(true);
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(ctilid)}/offspring`);
            setOffspring(Array.isArray(res.data) ? res.data : []);
        } catch {
            setOffspring([]);
        } finally {
            setOffspringLoading(false);
        }
    }, [ctilid, showModalMessage]);

    useEffect(() => { load(); }, [load]);

    const status = useMemo(() => deriveStoredStatus(litter), [litter]);
    const images = Array.isArray(litter?.images) ? litter.images.filter(i => i && i.url) : [];

    const setTab = (id) => {
        const next = new URLSearchParams(searchParams);
        if (id === 'overview') next.delete('tab'); else next.set('tab', id);
        setSearchParams(next, { replace: true });
    };

    const toggleVisibility = async () => {
        const next = !litter.isDisplayLitter;
        setLitter(prev => ({ ...prev, isDisplayLitter: next }));
        try {
            await apiClient.put(`/litters/${litter._id}`, { isDisplayLitter: next });
        } catch {
            setLitter(prev => ({ ...prev, isDisplayLitter: !next }));
            if (showModalMessage) showModalMessage('Error', 'Failed to update visibility.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-500"><Loader2 className="animate-spin mr-2" size={20} /> Loading litter…</div>;
    }

    if (notFound || !litter) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center space-y-3">
                <p className="text-gray-700 dark:text-dark-text">{notFound ? 'This litter could not be found.' : 'This litter could not be loaded.'}</p>
                <button type="button" onClick={() => navigate('/litters')} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm">Back to litters</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
        <div className="bg-white dark:bg-dark-card-bg border border-transparent dark:border-dark-text-muted rounded-xl shadow-lg p-3 sm:p-6 space-y-5" data-testid="litter-details">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate('/litters')}
                        className="shrink-0 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center gap-1.5"
                    >
                        <ArrowLeft size={16} /> Back to Overview
                    </button>
                    <h1 className="min-w-0 truncate text-lg font-semibold text-gray-900 dark:text-dark-text" data-testid="litter-title">
                        {litter.breedingPairCodeName
                            ? <>{litter.breedingPairCodeName}{litter.litter_id_public && <span className="font-normal text-gray-500 dark:text-dark-text-muted"> / {litter.litter_id_public}</span>}</>
                            : litter.litter_id_public}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleVisibility}
                        title={litter.isDisplayLitter ? 'Public — click to make private' : 'Private — click to make public'}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-dark-surface ${litter.isDisplayLitter ? 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-500' : 'border-gray-300 dark:border-dark-border text-gray-600 dark:text-dark-text-secondary'}`}
                    >
                        {litter.isDisplayLitter ? <Eye size={16} /> : <EyeOff size={16} />}
                        {litter.isDisplayLitter ? 'Public' : 'Private'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/litters/${encodeURIComponent(litter.litter_id_public)}/edit`)}
                        className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-black text-sm font-medium flex items-center gap-1.5 shadow-sm"
                    >
                        <Edit size={14} /> Edit litter
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-dark-border" role="tablist">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === t.id}
                        onClick={() => setTab(t.id)}
                        className={`shrink-0 px-4 py-2 text-sm font-medium -mb-px border-b-2 ${activeTab === t.id ? 'border-primary dark:border-dark-primary text-gray-900 dark:text-dark-text' : 'border-transparent text-gray-500 dark:text-dark-text-muted hover:text-gray-700'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <OverviewTab
                    litter={litter}
                    status={status}
                    offspring={offspring}
                    offspringLoading={offspringLoading}
                    onView={viewAnimal}
                    onEdit={() => navigate(`/litters/${encodeURIComponent(litter.litter_id_public)}/edit`)}
                    breedingLineDefs={breedingLineDefs}
                    animalBreedingLines={animalBreedingLines}
                    showWeanedButton={showWeanedButton}
                    handleMarkWeaned={handleMarkWeaned}
                    handleQuickAction={handleQuickAction}
                />
            )}
            {/* Placeholder tabs — intentionally empty for now. */}
            {activeTab === 'genetics' && <GeneticsTab litter={litter} breedingLineDefs={breedingLineDefs} animalBreedingLines={animalBreedingLines} />}
            {activeTab === 'pedigrees' && <PedigreesTab litter={litter} onViewAnimal={viewAnimal} />}
            {activeTab === 'offspring' && <OffspringTab offspring={offspring} loading={offspringLoading} onView={viewAnimal} animalBreedingLines={animalBreedingLines} breedingLineDefs={breedingLineDefs} />}
            {activeTab === 'gallery' && <GalleryTab images={images} />}
        </div>
        </div>
    );
};

export default LitterDetailsPage;
