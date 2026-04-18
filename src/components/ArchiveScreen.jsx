import React from 'react';
import { ChevronLeft, RefreshCw, Archive, ArrowLeftRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const ArchiveScreen = ({
    onBack,
    archiveLoading,
    archivedAnimals,
    soldTransferredAnimals,
    soldOwnerFilter,
    setSoldOwnerFilter,
    collapsedMgmtSections,
    setCollapsedMgmtSections,
    navigate,
    authToken,
    API_BASE_URL,
    showModalMessage,
    fetchArchiveData,
    fetchAnimals,
    MgmtAnimalCard,
    SectionHeader
}) => {
    const handleUnarchive = async (animal) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/unarchive`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: res.data || { id_public: animal.id_public, isArchived: false } }));
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
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
                <button
                    onClick={fetchArchiveData}
                    disabled={archiveLoading}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                >
                    <RefreshCw size={12} />
                    Refresh
                </button>
            </div>

            <div className="flex items-center gap-2">
                <Archive size={18} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Archive</h3>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {archivedAnimals.length + soldTransferredAnimals.length} animal{(archivedAnimals.length + soldTransferredAnimals.length) !== 1 ? 's' : ''}
                </span>
            </div>

            {archiveLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">

                    {/* -- SOLD / TRANSFERRED -------------------------------- */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <SectionHeader
                            sectionKey="soldTransferred"
                            icon={<ArrowLeftRight size={18} className="text-orange-600" />}
                            title="Sold / Transferred"
                            count={soldTransferredAnimals.length}
                            bgClass="bg-orange-50"
                        />
                        {!collapsedMgmtSections['soldTransferred'] && (() => {
                            const soldOwners = [...new Map(
                                soldTransferredAnimals
                                    .filter(a => a.ownerName)
                                    .map(a => [a.ownerId_public || a.ownerName, { key: a.ownerId_public || a.ownerName, label: a.ownerName }])
                            ).values()].sort((a, b) => a.label.localeCompare(b.label));
                            const filteredSoldList = soldOwnerFilter
                                ? soldTransferredAnimals.filter(a => (a.ownerId_public || a.ownerName) === soldOwnerFilter)
                                : soldTransferredAnimals;
                            return (
                                <div className="p-3 space-y-2">
                                    {soldTransferredAnimals.length === 0
                                        ? <div className="text-sm text-gray-400 text-center py-4">No sold or transferred animals.</div>
                                        : <>
                                            {soldOwners.length > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Filter by recipient:</span>
                                                    <select
                                                        value={soldOwnerFilter}
                                                        onChange={e => setSoldOwnerFilter(e.target.value)}
                                                        className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
                                                    >
                                                        <option value="">All recipients ({soldTransferredAnimals.length})</option>
                                                        {soldOwners.map(o => (
                                                            <option key={o.key} value={o.key}>
                                                                {o.label} ({soldTransferredAnimals.filter(a => (a.ownerId_public || a.ownerName) === o.key).length})
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
                                                            a.ownerName ? (
                                                                <button
                                                                    className="flex items-center gap-1.5 shrink-0 min-w-0 hover:opacity-80 transition-opacity"
                                                                    title={`View profile: ${a.ownerName}`}
                                                                    onClick={e => { e.stopPropagation(); if (a.ownerIdPublic) navigate(`/user/${a.ownerIdPublic}`); }}
                                                                >
                                                                    {a.ownerAvatar
                                                                        ? <img src={a.ownerAvatar} alt={a.ownerName} className="w-5 h-5 rounded-full object-cover shrink-0 border border-orange-200" />
                                                                        : <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 text-[10px] font-bold flex items-center justify-center shrink-0">{a.ownerName.charAt(0).toUpperCase()}</span>
                                                                    }
                                                                    <span className="text-xs text-orange-700 font-medium max-w-[110px] truncate whitespace-nowrap">{a.ownerName}</span>
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
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <SectionHeader
                            sectionKey="archived"
                            icon={<Archive size={18} className="text-gray-600" />}
                            title="Archived Animals"
                            count={archivedAnimals.length}
                            bgClass="bg-gray-50"
                        />
                        {!collapsedMgmtSections['archived'] && (
                            <div className="p-3 space-y-1.5">
                                {archivedAnimals.length === 0
                                    ? <div className="text-sm text-gray-400 text-center py-4">No archived animals.</div>
                                    : archivedAnimals.map(a => (
                                        <MgmtAnimalCard
                                            key={a._id || a.id_public}
                                            animal={a}
                                            extras={
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleUnarchive(a); }}
                                                    className="text-xs px-2 py-0.5 rounded font-medium border bg-blue-500 text-white hover:bg-blue-600 border-blue-500 whitespace-nowrap"
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
                        <div className="text-center py-16 text-gray-400">
                            <Archive size={48} className="mx-auto mb-3 text-gray-300" />
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