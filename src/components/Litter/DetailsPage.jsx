import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { ArrowLeft, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { deriveStoredStatus } from '../../utils/litterStatus';
import OverviewTab from './details/OverviewTab';
const GeneticsTab = React.lazy(() => import('./details/GeneticsTab'));
const OffspringTab = React.lazy(() => import('./details/OffspringTab'));
const PedigreesTab = React.lazy(() => import('./details/PedigreesTab'));
const GalleryTab = React.lazy(() => import('./details/GalleryTab'));

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'genetics', label: 'Genetics & Compatibility' },
    { id: 'offspring', label: 'Offspring' },
    { id: 'pedigrees', label: 'Pedigrees' },
    { id: 'gallery', label: 'Gallery' },
];

const TabLoading = () => (
    <div role="status" className="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-dark-text-muted">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading tab…
    </div>
);

const TabError = ({ message, onRetry }) => (
    <div role="alert" className="py-8 text-center space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        <button type="button" onClick={onRetry} className="px-3 py-1.5 rounded border text-sm">Retry</button>
    </div>
);

const LitterDetailsPage = ({ showModalMessage, onViewAnimal, handleViewAnimal, breedingLineDefs = [], animalBreedingLines = {}, speciesOptions = [] }) => {
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
    const [offspringStatus, setOffspringStatus] = useState('idle');
    const [offspringError, setOffspringError] = useState('');
    const [geneticsSummary, setGeneticsSummary] = useState(null);
    const [geneticsStatus, setGeneticsStatus] = useState('idle');
    const [geneticsError, setGeneticsError] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryStatus, setGalleryStatus] = useState('idle');
    const [galleryError, setGalleryError] = useState('');

    const viewAnimal = onViewAnimal || handleViewAnimal;
    const requestedTab = searchParams.get('tab');
    const activeTab = TABS.some(t => t.id === requestedTab) ? requestedTab : 'overview';

    const load = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(ctilid)}?view=overview`);
            setLitter(res.data);
            return true;
        } catch (err) {
            console.error('[LitterDetailsPage] Failed to load litter:', err);
            if (err?.response?.status === 404) setNotFound(true);
            else if (showModalMessage) showModalMessage('Error', 'Failed to load this litter.');
            setLitter(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, [ctilid, showModalMessage]);

    useEffect(() => { load(); }, [load]);

    const loadOffspring = useCallback(async (retry = false) => {
        if (!retry && offspringStatus !== 'idle') return offspringStatus === 'loaded';
        setOffspringStatus('loading');
        setOffspringError('');
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(ctilid)}/offspring`);
            if (!Array.isArray(res.data)) throw new Error('The offspring response was invalid.');
            setOffspring(res.data);
            setOffspringStatus('loaded');
            return true;
        } catch (err) {
            console.error('[LitterDetailsPage] Failed to load litter offspring:', err);
            setOffspringError(err.response?.data?.message || 'Failed to load this litter’s offspring.');
            setOffspringStatus('error');
            return false;
        }
    }, [ctilid, offspringStatus]);

    const loadGeneticsSummary = useCallback(async (retry = false) => {
        if (!retry && geneticsStatus !== 'idle') return geneticsStatus === 'loaded';
        setGeneticsStatus('loading');
        setGeneticsError('');
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(ctilid)}/genetics-summary`);
            setGeneticsSummary(res.data || {});
            setGeneticsStatus('loaded');
            return true;
        } catch (err) {
            console.error('[LitterDetailsPage] Failed to load genetics summary:', err);
            setGeneticsError(err.response?.data?.message || 'Failed to load genetics data.');
            setGeneticsStatus('error');
            return false;
        }
    }, [ctilid, geneticsStatus]);

    const loadGallery = useCallback(async (retry = false) => {
        if (!retry && galleryStatus !== 'idle') return galleryStatus === 'loaded';
        setGalleryStatus('loading');
        setGalleryError('');
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(ctilid)}/gallery`);
            if (!Array.isArray(res.data)) throw new Error('The gallery response was invalid.');
            setGalleryImages(res.data);
            setGalleryStatus('loaded');
            return true;
        } catch (err) {
            console.error('[LitterDetailsPage] Failed to load litter gallery:', err);
            setGalleryError(err.response?.data?.message || 'Failed to load this litter’s photos.');
            setGalleryStatus('error');
            return false;
        }
    }, [ctilid, galleryStatus]);

    useEffect(() => {
        if (!litter) return;
        if (activeTab === 'offspring') loadOffspring();
        if (activeTab === 'genetics') {
            loadGeneticsSummary();
            loadOffspring();
        }
        if (activeTab === 'gallery') loadGallery();
    }, [activeTab, litter, loadOffspring, loadGeneticsSummary, loadGallery]);

    const refreshLitterAndOffspring = useCallback(async () => {
        const litterLoaded = await load();
        const offspringLoaded = await loadOffspring(true);
        return litterLoaded && offspringLoaded;
    }, [load, loadOffspring]);

    const status = useMemo(() => deriveStoredStatus(litter), [litter]);
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

    const handleUnlinkOffspring = async (animal) => {
        const animalId = animal?.id_public;
        if (!animalId || !litter?._id) {
            showModalMessage?.('Error', 'Could not unlink this animal because its ID or litter ID is missing.');
            return;
        }
        if (!window.confirm(`Remove ${animal.name || animalId} from this litter? The animal record will not be deleted.`)) return;

        try {
            await apiClient.put(`/litters/${encodeURIComponent(litter._id)}`, {
                offspringIds_public: (litter.offspringIds_public || []).filter(id => id !== animalId),
            });
            const refreshed = await refreshLitterAndOffspring();
            if (refreshed) showModalMessage?.('Success', 'Offspring unlinked from the litter. The animal record was not deleted.');
            else showModalMessage?.('Error', 'Offspring was unlinked, but the litter views could not be refreshed.');
        } catch (err) {
            console.error('[LitterDetailsPage] Failed to unlink offspring:', err);
            showModalMessage?.('Error', err.response?.data?.message || 'Failed to unlink offspring from this litter.');
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
                    speciesOptions={speciesOptions}
                    onView={viewAnimal}
                    onEdit={() => navigate(`/litters/${encodeURIComponent(litter.litter_id_public)}/edit`)}
                    breedingLineDefs={breedingLineDefs}
                    animalBreedingLines={animalBreedingLines}
                    showWeanedButton={showWeanedButton}
                    handleMarkWeaned={handleMarkWeaned}
                    handleQuickAction={handleQuickAction}
                />
            )}
            {activeTab === 'genetics' && (
                geneticsStatus === 'error' || offspringStatus === 'error'
                    ? <TabError
                        message={geneticsStatus === 'error' ? geneticsError : offspringError}
                        onRetry={() => {
                            if (geneticsStatus === 'error') loadGeneticsSummary(true);
                            if (offspringStatus === 'error') loadOffspring(true);
                        }}
                    />
                    : geneticsStatus !== 'loaded' || offspringStatus !== 'loaded'
                        ? <TabLoading />
                        : <React.Suspense fallback={<TabLoading />}>
                            <GeneticsTab
                                litter={{ ...litter, ...geneticsSummary }}
                                offspring={offspring}
                                breedingLineDefs={breedingLineDefs}
                                animalBreedingLines={animalBreedingLines}
                            />
                        </React.Suspense>
            )}
            {activeTab === 'pedigrees' && (
                <React.Suspense fallback={<TabLoading />}>
                    <PedigreesTab litter={litter} onViewAnimal={viewAnimal} />
                </React.Suspense>
            )}
            {activeTab === 'offspring' && (
                offspringStatus === 'error'
                    ? <TabError message={offspringError} onRetry={() => loadOffspring(true)} />
                    : <React.Suspense fallback={<TabLoading />}>
                        <OffspringTab
                            litter={litter}
                            offspring={offspring}
                            loading={offspringStatus !== 'loaded'}
                            onView={viewAnimal}
                            onOffspringChanged={refreshLitterAndOffspring}
                            onUnlink={handleUnlinkOffspring}
                            animalBreedingLines={animalBreedingLines}
                            breedingLineDefs={breedingLineDefs}
                            speciesOptions={speciesOptions}
                        />
                    </React.Suspense>
            )}
            {activeTab === 'gallery' && (
                galleryStatus === 'error'
                    ? <TabError message={galleryError} onRetry={() => loadGallery(true)} />
                    : galleryStatus !== 'loaded'
                        ? <TabLoading />
                        : <React.Suspense fallback={<TabLoading />}>
                            <GalleryTab images={galleryImages} />
                        </React.Suspense>
            )}
        </div>
        </div>
    );
};

export default LitterDetailsPage;
