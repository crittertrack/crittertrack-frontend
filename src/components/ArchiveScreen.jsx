import React from 'react';
import { ChevronLeft, RefreshCw, Archive, ArrowLeftRight, ChevronDown, ChevronUp, Cat, Loader2 } from 'lucide-react';
import axios from 'axios';

const AnimalImage = ({ src, alt, className, iconSize = 20 }) => {
    return src ? (
        <img src={src} alt={alt} className={className} />
    ) : (
        <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
            <Cat size={iconSize} className="text-gray-400" />
        </div>
    );
};

const ArchiveScreen = ({
    onBack,
    archiveLoading,
    archivedAnimals,
    soldTransferredAnimals,
    soldOwnerFilter,
    setSoldOwnerFilter,
    archiveArchivedCollapsed,
    setArchiveArchivedCollapsed,
    collapsedMgmtSections,
    setCollapsedMgmtSections,
    onViewAnimal,
    getSpeciesDisplayName,
    formatDateShort,
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
            await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/unarchive`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
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
                <div className="space-y-6">
                    {/* Sold/Transferred Animals Section */}
                    {soldTransferredAnimals.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <SectionHeader 
                                sectionKey="soldTransferred"
                                icon={<ArrowLeftRight size={18} className="text-orange-600" />}
                                title="Sold / Transferred" 
                                count={soldTransferredAnimals.length} 
                                bgClass="bg-orange-50"
                            />
                            {!collapsedMgmtSections['soldTransferred'] && (() => {
                                // Build unique owner list for dropdown
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
                    )}

                    {/* Archived Animals Section */}
                    {archivedAnimals.length > 0 && (
                        <div className="space-y-3">
                            <button
                                onClick={() => setArchiveArchivedCollapsed(!archiveArchivedCollapsed)}
                                className="w-full flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition"
                            >
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${archiveArchivedCollapsed ? '-rotate-90' : ''}`} />
                                <h4 className="font-semibold text-gray-700">Archived Animals</h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{archivedAnimals.length}</span>
                            </button>
                            {!archiveArchivedCollapsed && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {archivedAnimals.map(animal => (
                                        <div key={animal.id_public} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition">
                                            <div className="flex items-start gap-2">
                                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                    <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" iconSize={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                                        {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{animal.species} • {animal.gender || 'Unknown'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    onClick={() => handleUnarchive(animal)}
                                                    className="flex-1 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                                                >
                                                    Unarchive
                                                </button>
                                                <button
                                                    onClick={() => onViewAnimal(animal)}
                                                    className="flex-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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