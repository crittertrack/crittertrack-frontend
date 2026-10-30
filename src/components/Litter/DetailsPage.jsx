import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import { ArrowLeft, Edit, Loader2, Mars, Venus } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { deriveStoredStatus, LITTER_STATUS_LABELS } from '../../utils/litterStatus';
import { formatAnimalDisplayName } from '../../utils/animalDisplayName';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'offspring', label: 'Offspring' },
    { id: 'gallery', label: 'Gallery' },
];

const STATUS_BADGE_BG = {
    planned: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    mated: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    pregnant: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    born: 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text',
};

const cardClass = 'rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4';

const Field = ({ label, value }) => (
    <div className="flex justify-between gap-3 py-1 text-sm border-b border-gray-100 dark:border-dark-border last:border-0">
        <span className="text-gray-500 dark:text-dark-text-muted">{label}</span>
        <span className="text-gray-900 dark:text-dark-text text-right">{value}</span>
    </div>
);

const hasValue = (v) => v !== null && v !== undefined && v !== '';
const dateOrDash = (d) => (d ? formatDate(d) : '—');

const ParentCard = ({ role, icon, animal, fallbackId, onView }) => (
    <div className={cardClass}>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-text-muted mb-2">{icon} {role}</div>
        {animal || fallbackId ? (
            <button
                type="button"
                onClick={() => onView && onView(animal || { id_public: fallbackId })}
                className="flex items-center gap-3 text-left w-full hover:opacity-80"
            >
                {(animal?.imageUrl || animal?.photoUrl) && (
                    <img src={animal.imageUrl || animal.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                    <div className="font-medium text-gray-900 dark:text-dark-text truncate">
                        {animal ? formatAnimalDisplayName(animal) : fallbackId}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                        {fallbackId || animal?.id_public}{animal?.species ? ` · ${animal.species}` : ''}
                    </div>
                </div>
            </button>
        ) : (
            <div className="text-sm text-gray-400 dark:text-dark-text-muted">Unknown</div>
        )}
    </div>
);

const OverviewTab = ({ litter, status, onView }) => {
    const males = litter.maleCount ?? 0;
    const females = litter.femaleCount ?? 0;
    const unknown = litter.unknownCount ?? 0;
    const born = litter.litterSizeBorn ?? litter.numberBorn ?? (males + females + unknown);
    const weaned = litter.litterSizeWeaned ?? litter.numberWeaned;
    const stillborn = litter.stillbornCount ?? litter.stillborn;
    const losses = litter.lossesCount ?? litter.losses;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ParentCard role="Sire" icon={<Mars size={14} className="text-blue-500" />} animal={litter.sire} fallbackId={litter.sireId_public} onView={onView} />
                <ParentCard role="Dam" icon={<Venus size={14} className="text-pink-500" />} animal={litter.dam} fallbackId={litter.damId_public} onView={onView} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={cardClass}>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Timeline</h3>
                    <Field label="Mating" value={dateOrDash(litter.matingDate || litter.pairingDate)} />
                    <Field label="Pregnancy confirmed" value={dateOrDash(litter.pregnancyDate)} />
                    <Field label="Expected due" value={dateOrDash(litter.expectedDueDate)} />
                    <Field label="Birth" value={litter.birthDateUnknown ? 'Born, date unknown' : dateOrDash(litter.birthDate)} />
                    <Field label="Weaning" value={`${dateOrDash(litter.weaningDate)}${litter.weaningConfirmed ? ' (confirmed)' : ''}`} />
                </div>

                <div className={cardClass}>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Litter stats</h3>
                    <Field label="Born" value={hasValue(born) ? born : '—'} />
                    <Field label="Males / Females / Unknown" value={`${males} / ${females} / ${unknown}`} />
                    {hasValue(weaned) && <Field label="Weaned" value={weaned} />}
                    {hasValue(stillborn) && <Field label="Stillborn" value={stillborn} />}
                    {hasValue(losses) && <Field label="Losses" value={losses} />}
                    {litter.hasCulls && hasValue(litter.cullsCount) && <Field label="Culls" value={litter.cullsCount} />}
                    <Field label="Inbreeding (COI)" value={litter.inbreedingCoefficient != null ? `${Number(litter.inbreedingCoefficient).toFixed(2)}%` : '—'} />
                </div>
            </div>

            <div className={cardClass}>
                <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Breeding details</h3>
                {hasValue(litter.breedingMethod) && litter.breedingMethod !== 'Unknown' && <Field label="Method" value={litter.breedingMethod} />}
                {hasValue(litter.breedingConditionAtTime) && <Field label="Condition at mating" value={litter.breedingConditionAtTime} />}
                {hasValue(litter.outcome) && litter.outcome !== 'Unknown' && <Field label="Outcome" value={litter.outcome} />}
                {hasValue(litter.birthMethod) && <Field label="Birth method" value={litter.birthMethod} />}
                {hasValue(litter.birthComplications) && <Field label="Complications" value={litter.birthComplications} />}
                {litter.pregnancyLost && <Field label="Pregnancy lost" value={litter.pregnancyLostReason || 'Yes'} />}
                <Field label="Visibility" value={litter.isDisplayLitter ? 'Public' : 'Private'} />
                {status === 'planned' && <Field label="Status" value="Planned — no mating recorded yet" />}
            </div>

            {hasValue(litter.notes) && (
                <div className={cardClass}>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Notes</h3>
                    <p className="text-sm text-gray-700 dark:text-dark-text whitespace-pre-wrap">{litter.notes}</p>
                </div>
            )}
        </div>
    );
};

const OffspringTab = ({ offspring, loading, onView }) => {
    if (loading) return <div className="flex items-center py-8 text-gray-500"><Loader2 className="animate-spin mr-2" size={18} /> Loading offspring…</div>;
    if (!offspring.length) return <div className="py-8 text-center text-sm text-gray-500 dark:text-dark-text-muted">No offspring are linked to this litter yet.</div>;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {offspring.map(a => (
                <button
                    key={a.id_public || a._id}
                    type="button"
                    onClick={() => onView && onView(a)}
                    className={`${cardClass} flex items-center gap-3 text-left hover:opacity-80`}
                >
                    {(a.imageUrl || a.photoUrl) ? (
                        <img src={a.imageUrl || a.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-surface" />
                    )}
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-dark-text truncate">{formatAnimalDisplayName(a)}</div>
                        <div className="text-xs text-gray-500 dark:text-dark-text-muted">{a.id_public}{a.gender ? ` · ${a.gender}` : ''}</div>
                    </div>
                </button>
            ))}
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

const LitterDetailsPage = ({ showModalMessage, onViewAnimal, handleViewAnimal }) => {
    const navigate = useNavigate();
    // /litters/:ctlId (canonical) and /litter/:ctilid (legacy alias) both render this page.
    const { ctlId, ctilid: legacyId } = useParams();
    const ctilid = ctlId || legacyId;
    const [searchParams, setSearchParams] = useSearchParams();
    const [litter, setLitter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
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
        <div className="w-full max-w-5xl mx-auto p-4 space-y-4" data-testid="litter-details">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button type="button" onClick={() => navigate('/litters')} className="p-2 rounded-lg border border-gray-300 dark:border-dark-border" aria-label="Back to litters">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text truncate">{litter.breedingPairCodeName || litter.litter_id_public}</h1>
                        <div className="text-xs text-gray-500 dark:text-dark-text-muted">{litter.litter_id_public}</div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_BG[status] || STATUS_BADGE_BG.born}`}>
                        {LITTER_STATUS_LABELS[status] || status}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(`/litters/${encodeURIComponent(litter.litter_id_public)}/edit${activeTab !== 'overview' ? `?tab=${activeTab}` : ''}`)}
                    className="px-4 py-2 rounded-lg bg-primary dark:bg-dark-primary text-black text-sm font-medium flex items-center gap-1 shadow-md"
                >
                    <Edit size={14} /> Edit
                </button>
            </div>

            <div className="flex gap-1 border-b border-gray-200 dark:border-dark-border">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${activeTab === t.id ? 'border-primary dark:border-dark-primary text-gray-900 dark:text-dark-text' : 'border-transparent text-gray-500 dark:text-dark-text-muted'}`}
                    >
                        {t.label}{t.id === 'offspring' && !offspringLoading ? ` (${offspring.length})` : ''}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && <OverviewTab litter={litter} status={status} onView={viewAnimal} />}
            {activeTab === 'offspring' && <OffspringTab offspring={offspring} loading={offspringLoading} onView={viewAnimal} />}
            {activeTab === 'gallery' && <GalleryTab images={images} />}
        </div>
    );
};

export default LitterDetailsPage;
