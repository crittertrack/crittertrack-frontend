import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, RefreshCw, Archive, ArrowLeftRight, Loader2, Search, X } from 'lucide-react';
import axios from 'axios';
import InfoButton from './shared/InfoButton';

const ArchiveScreen = ({
    onBack,
    soldOwnerFilter,
    setSoldOwnerFilter,
    collapsedMgmtSections,
    setCollapsedMgmtSections,
    navigate,
    authToken,
    API_BASE_URL,
    showModalMessage,
    fetchAnimals,
    MgmtAnimalCard,
    SectionHeader
}) => {
    const [archivedAnimals, setArchivedAnimals] = useState([]);
    const [soldTransferredAnimals, setSoldTransferredAnimals] = useState([]);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchArchiveData = useCallback(async () => {
        if (!authToken) return;
        setArchiveLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/animals/archived`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const data = response.data || {};

            const archived = Array.isArray(data.archived) ? data.archived : Object.values(data.archived || {});
            const soldTransferred = Array.isArray(data.soldTransferred) ? data.soldTransferred : Object.values(data.soldTransferred || {});

            setArchivedAnimals(archived);
            setSoldTransferredAnimals(soldTransferred);
        } catch (error) {
            console.error('Failed to fetch archive data:', error);
            setArchivedAnimals([]);
            setSoldTransferredAnimals([]);
        } finally {
            setArchiveLoading(false);
        }
    }, [authToken, API_BASE_URL]);

    useEffect(() => { fetchArchiveData(); }, [fetchArchiveData]);

    const matchesSearch = useCallback((animal, query) => {
        if (!query) return true;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return [animal.name, animal.prefix, animal.suffix, animal.id_public, animal.species, animal.manualownerName]
            .filter(Boolean)
            .some(field => field.toLowerCase().includes(q));
    }, []);

    const filteredArchivedAnimals = useMemo(
        () => archivedAnimals.filter(a => matchesSearch(a, searchQuery)),
        [archivedAnimals, searchQuery, matchesSearch]
    );
    const filteredSoldTransferredAnimals = useMemo(
        () => soldTransferredAnimals.filter(a => matchesSearch(a, searchQuery)),
        [soldTransferredAnimals, searchQuery, matchesSearch]
    );

    const handleUnarchive = async (animal) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { archived: false }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const updatedAnimal = res.data?.animal || res.data || { ...animal, archived: false };
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: updatedAnimal }));
            window.dispatchEvent(new Event('animals-changed'));
            showModalMessage('Success', 'Animal unarchived');
            fetchArchiveData();
            fetchAnimals();
        } catch (err) {
            showModalMessage('Error', err.response?.data?.message || 'Failed to unarchive');
        }
    };

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text transition"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
                <button
                    onClick={fetchArchiveData}
                    disabled={archiveLoading}
                    className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary transition disabled:opacity-50"
                >
                    <RefreshCw size={12} />
                    Refresh
                </button>
            </div>

            <div className="flex items-center gap-2">
                <Archive size={18} className="text-gray-600 dark:text-dark-text-secondary" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Archive</h3>
                <span className="text-xs bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary px-2 py-0.5 rounded-full">
                    {archivedAnimals.length + soldTransferredAnimals.length} animal{(archivedAnimals.length + soldTransferredAnimals.length) !== 1 ? 's' : ''}
                </span>
                <InfoButton title="Archive" lessonId="archive-overview">
                    <p>Archived animals are hidden from your main lists but kept on record. Sold/Transferred animals are ones you no longer own but can still view for history.</p>
                    <p>Use "Unarchive" to bring an archived animal back into your active lists.</p>
                </InfoButton>
            </div>

            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, prefix/suffix, or ID..."
                    className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-dark-text-muted focus:ring-2 focus:ring-purple-300 dark:focus:ring-dark-accent-purple focus:border-purple-400 dark:focus:border-dark-accent-purple"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary"
                        title="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {archiveLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-gray-400 dark:text-dark-text-muted" />
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">

                    {/* -- SOLD / TRANSFERRED -------------------------------- */}
                    <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
                        <SectionHeader
                            sectionKey="soldTransferred"
                            icon={<ArrowLeftRight size={18} className="text-orange-600 dark:text-orange-400" />}
                            title="Sold / Transferred"
                            count={filteredSoldTransferredAnimals.length}
                            bgClass="bg-orange-50 dark:bg-orange-900/20"
                        />
                        {!collapsedMgmtSections['soldTransferred'] && (() => {
                            const soldOwners = [...new Map(
                                filteredSoldTransferredAnimals
                                    .filter(a => a.manualownerName)
                                    .map(a => [a.creatorId_public || a.manualownerName, { key: a.creatorId_public || a.manualownerName, label: a.manualownerName }])
                            ).values()].sort((a, b) => a.label.localeCompare(b.label));
                            const filteredSoldList = soldOwnerFilter
                                ? filteredSoldTransferredAnimals.filter(a => (a.creatorId_public || a.manualownerName) === soldOwnerFilter)
                                : filteredSoldTransferredAnimals;
                            return (
                                <div className="p-3 space-y-2">
                                    {filteredSoldTransferredAnimals.length === 0
                                        ? <div className="text-sm text-gray-400 dark:text-dark-text-muted text-center py-4">{searchQuery ? 'No matching sold or transferred animals.' : 'No sold or transferred animals.'}</div>
                                        : <>
                                            {soldOwners.length > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary whitespace-nowrap">Filter by recipient:</span>
                                                    <select
                                                        value={soldOwnerFilter}
                                                        onChange={e => setSoldOwnerFilter(e.target.value)}
                                                        className="flex-1 text-xs border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 focus:border-orange-400 dark:focus:border-orange-600 bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text"
                                                    >
                                                        <option value="">All recipients ({filteredSoldTransferredAnimals.length})</option>
                                                        {soldOwners.map(o => (
                                                            <option key={o.key} value={o.key}>
                                                                {o.label} ({filteredSoldTransferredAnimals.filter(a => (a.creatorId_public || a.manualownerName) === o.key).length})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                {filteredSoldList.map(a => (
                                                    <MgmtAnimalCard
                                                        key={a._id || a.id_public}
                                                        animal={a}
                                                        extras={
                                                            a.manualownerName ? (
                                                                <button
                                                                    className="flex items-center gap-1.5 shrink-0 min-w-0 hover:opacity-80 transition-opacity"
                                                                    title={`View profile: ${a.manualownerName}`}
                                                                    onClick={e => { e.stopPropagation(); if (a.creatorIdPublic) navigate(`/user/${a.creatorIdPublic}`); }}
                                                                >
                                                                    {a.ownerAvatar
                                                                        ? <img src={a.ownerAvatar} alt={a.manualownerName} className="w-5 h-5 rounded-full object-cover shrink-0 border border-orange-200 dark:border-orange-700/60" />
                                                                        : <span className="w-5 h-5 rounded-full bg-orange-200 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[10px] font-bold flex items-center justify-center shrink-0">{a.manualownerName.charAt(0).toUpperCase()}</span>
                                                                    }
                                                                    <span className="text-xs text-orange-700 dark:text-orange-300 font-medium max-w-[110px] truncate whitespace-nowrap">{a.manualownerName}</span>
                                                                </button>
                                                            ) : null
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    }
                                </div>
                            );
                        })()}
                    </div>

                    {/* -- ARCHIVED ANIMALS -------------------------------- */}
                    <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden shadow-sm">
                        <SectionHeader
                            sectionKey="archived"
                            icon={<Archive size={18} className="text-gray-600 dark:text-dark-text-secondary" />}
                            title="Archived Animals"
                            count={filteredArchivedAnimals.length}
                            bgClass="bg-gray-50 dark:bg-dark-surface"
                        />
                        {!collapsedMgmtSections['archived'] && (
                            <div className="p-3 space-y-1.5">
                                {filteredArchivedAnimals.length === 0
                                    ? <div className="text-sm text-gray-400 dark:text-dark-text-muted text-center py-4">{searchQuery ? 'No matching archived animals.' : 'No archived animals.'}</div>
                                    : filteredArchivedAnimals.map(a => (
                                        <MgmtAnimalCard
                                            key={a._id || a.id_public}
                                            animal={a}
                                            extras={
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleUnarchive(a); }}
                                                    className="text-xs px-2 py-0.5 rounded font-medium border bg-blue-500 dark:bg-dark-info-blue text-white hover:bg-blue-600 dark:hover:bg-dark-info-blue-hover border-blue-500 dark:border-dark-info-blue whitespace-nowrap"
                                                >
                                                    Unarchive
                                                </button>
                                            }
                                        />
                                    ))
                                }
                            </div>
                        )}
                    </div>

                    {archivedAnimals.length === 0 && soldTransferredAnimals.length === 0 && (
                        <div className="text-center py-16 text-gray-400 dark:text-dark-text-muted">
                            <Archive size={48} className="mx-auto mb-3 text-gray-300 dark:text-dark-border" />
                            <p className="text-sm font-medium">No archived or transferred animals</p>
                            <p className="text-xs mt-1">Animals you archive will appear here</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ArchiveScreen;