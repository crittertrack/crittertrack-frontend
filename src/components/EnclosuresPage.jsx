import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Home, Search, PlusCircle, X, Loader2, Edit, Trash2, Cat, MapPin,
    Thermometer, Droplets, Calendar, CheckCircle, AlertCircle, RefreshCw,
    ChevronDown, ChevronUp, BarChart2, Users, Wrench, MessageSquare, Clock,
    Settings, Archive, ArrowUpDown, Sparkles
} from 'lucide-react';
import AnimalImage from './shared/AnimalImage';
import EnclosureModal from './EnclosureModal';
import EnclosureDetailModal from './EnclosureDetailModal';
import { formatDate } from '../utils/dateFormatter';

const EnclosuresPage = ({
    authToken,
    API_BASE_URL,
    showModalMessage,
    userProfile,
    onViewAnimal,
}) => {
    const [enclosures, setEnclosures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'occupied' | 'empty'
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'occupancy' | 'lastCleaned'

    // EnclosureModal state
    const [showEnclosureModal, setShowEnclosureModal] = useState(false);
    const [editingEnclosureId, setEditingEnclosureId] = useState(null);
    const [enclosureFormData, setEnclosureFormData] = useState({
        name: '', enclosureType: '', location: '', capacity: '', dimensions: '',
        purpose: 'general', tempMin: '', tempMax: '', humidityMin: '', humidityMax: '',
        lightingSchedule: '', notes: '', imageUrl: '', tags: [], speciesLabels: [],
        cleaningTasks: []
    });
    const [enclosureSaving, setEnclosureSaving] = useState(false);
    const [enclosureImageFile, setEnclosureImageFile] = useState(null);
    const [enclosureImagePreview, setEnclosureImagePreview] = useState(null);
    const [newEnclosureTag, setNewEnclosureTag] = useState('');
    const [newEnclosureSpeciesLabel, setNewEnclosureSpeciesLabel] = useState('');
    const [newCleaningTaskName, setNewCleaningTaskName] = useState('');
    const [newCleaningTaskFreq, setNewCleaningTaskFreq] = useState('');

    // Detail modal state
    const [selectedEnclosure, setSelectedEnclosure] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [enclosureAnimals, setEnclosureAnimals] = useState([]);
    const [loadingAnimals, setLoadingAnimals] = useState(false);
    const [allSpecies, setAllSpecies] = useState([]);

    // Fetch enclosures
    const fetchEnclosures = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/enclosures`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setEnclosures(response.data || []);
        } catch (err) {
            console.error('Failed to fetch enclosures:', err);
            showModalMessage('Error', 'Failed to load enclosures. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, authToken, showModalMessage]);

    useEffect(() => {
        fetchEnclosures();
    }, [fetchEnclosures]);

    useEffect(() => {
        const buildSpeciesList = async () => {
            if (!authToken || !userProfile) return;
            try {
                // 1. Fetch species from user's animals
                const response = await axios.get(`${API_BASE_URL}/animals`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    params: { fields: 'species', limit: 5000 } // Get all species
                });
                const animalSpecies = (response.data || []).map(a => a.species).filter(Boolean);

                // 2. Get species from user's favorites
                const favoriteSpecies = userProfile.favoriteSpecies || [];

                // 3. Get species already used in other enclosures
                const enclosureSpecies = enclosures.flatMap(e => e.speciesLabels || []);

                const combined = [...new Set([...favoriteSpecies, ...animalSpecies, ...enclosureSpecies])].sort();
                setAllSpecies(combined);
            } catch (err) {
                console.error('Failed to fetch user species list:', err);
            }
        };
        buildSpeciesList();
    }, [authToken, API_BASE_URL, userProfile, enclosures]);

    // Open create modal
    const handleOpenCreate = () => {
        setEditingEnclosureId(null);
        setEnclosureFormData({
            name: '', enclosureType: '', location: '', capacity: '', dimensions: '',
            purpose: 'general', tempMin: '', tempMax: '', humidityMin: '', humidityMax: '',
            lightingSchedule: '', notes: '', imageUrl: '', tags: [], speciesLabels: [],
            cleaningTasks: []
        });
        setEnclosureImageFile(null);
        setEnclosureImagePreview(null);
        setShowEnclosureModal(true);
    };

    // Open edit modal
    const handleOpenEdit = (enclosure) => {
        setEditingEnclosureId(enclosure._id || enclosure.id);
        setEnclosureFormData({
            name: enclosure.name || '',
            enclosureType: enclosure.enclosureType || enclosure.roomType || '',
            purpose: enclosure.purpose || 'general',
            location: enclosure.location || '',
            capacity: enclosure.capacity || '',
            dimensions: enclosure.dimensions || enclosure.size || '',
            tempMin: enclosure.tempMin ?? enclosure.temperatureRange?.min ?? '',
            tempMax: enclosure.tempMax ?? enclosure.temperatureRange?.max ?? '',
            humidityMin: enclosure.humidityMin ?? enclosure.humidityRange?.min ?? '',
            humidityMax: enclosure.humidityMax ?? enclosure.humidityRange?.max ?? '',
            lightingSchedule: enclosure.lightingSchedule || enclosure.lighting || '',
            notes: enclosure.notes || enclosure.description || '',
            imageUrl: enclosure.imageUrl || '',
            tags: enclosure.tags || [],
            speciesLabels: enclosure.speciesLabels || [],
            cleaningTasks: enclosure.cleaningTasks || [],
        });
        setEnclosureImagePreview(enclosure.imageUrl || null);
        setEnclosureImageFile(null);
        setShowEnclosureModal(true);
    };

    // Save enclosure (create or update)
    const handleSaveEnclosure = async () => {
        if (!enclosureFormData.name.trim()) {
            showModalMessage('Validation Error', 'Enclosure name is required.');
            return;
        }
        setEnclosureSaving(true);
        try {
            const payload = {
                name: enclosureFormData.name.trim(),
                enclosureType: enclosureFormData.enclosureType.trim(),
                purpose: enclosureFormData.purpose,
                location: enclosureFormData.location.trim(),
                size: enclosureFormData.dimensions.trim(),
                capacity: enclosureFormData.capacity ? Number(enclosureFormData.capacity) : undefined,
                notes: enclosureFormData.notes.trim(),
                cleaningTasks: enclosureFormData.cleaningTasks,
                tags: enclosureFormData.tags,
                speciesLabels: enclosureFormData.speciesLabels,
            };

            if (editingEnclosureId) {
                await axios.put(`${API_BASE_URL}/enclosures/${editingEnclosureId}`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                showModalMessage('Success', 'Enclosure updated successfully!');
            } else {
                await axios.post(`${API_BASE_URL}/enclosures`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                showModalMessage('Success', 'Enclosure created successfully!');
            }
            setShowEnclosureModal(false);
            fetchEnclosures();
        } catch (err) {
            console.error('Failed to save enclosure:', err);
            showModalMessage('Error', err.response?.data?.message || 'Failed to save enclosure.');
        } finally {
            setEnclosureSaving(false);
        }
    };

    // Delete enclosure
    const handleDeleteEnclosure = async (encId) => {
        if (!window.confirm('Are you sure you want to delete this enclosure? Animals assigned to it will be unlinked.')) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/enclosures/${encId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Enclosure deleted.');
            fetchEnclosures();
        } catch (err) {
            console.error('Failed to delete enclosure:', err);
            showModalMessage('Error', 'Failed to delete enclosure.');
        }
    };

    // Mark cleaned — update next cleaning date
    const handleMarkCleaned = async (enc) => {
        const today = new Date().toISOString();
        try {
            await axios.put(`${API_BASE_URL}/enclosures/${enc._id || enc.id}`, {
                lastCleaned: today,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', `${enc.name} marked as cleaned!`);
            fetchEnclosures();
        } catch (err) {
            console.error('Failed to mark cleaned:', err);
            showModalMessage('Error', 'Failed to update cleaning status.');
        }
    };

    // Open detail modal
    const handleOpenDetail = async (enclosure) => {
        setSelectedEnclosure(enclosure);
        setShowDetailModal(true);
        // Fetch animals assigned to this enclosure
        setLoadingAnimals(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/animals?enclosureId=${enclosure._id || enclosure.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setEnclosureAnimals(response.data || []);
        } catch (err) {
            console.error('Failed to fetch enclosure animals:', err);
            setEnclosureAnimals([]);
        } finally {
            setLoadingAnimals(false);
        }
    };

    // Enclosure tag handlers
    const handleEnclosureTagAdd = () => {
        if (!newEnclosureTag.trim()) return;
        setEnclosureFormData(p => ({ ...p, tags: [...new Set([...(p.tags || []), newEnclosureTag.trim()])] }));
        setNewEnclosureTag('');
    };
    const handleEnclosureTagRemove = (tag) => {
        setEnclosureFormData(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tag) }));
    };
    const handleEnclosureSpeciesLabelAdd = (speciesToAdd) => {
        if (!speciesToAdd || !speciesToAdd.trim()) return;
        if (enclosureFormData.speciesLabels.includes(speciesToAdd)) return; // Avoid duplicates
        setEnclosureFormData(p => ({ ...p, speciesLabels: [...new Set([...(p.speciesLabels || []), speciesToAdd.trim()])] }));
    };
    const handleEnclosureSpeciesLabelRemove = (label) => {
        setEnclosureFormData(p => ({ ...p, speciesLabels: (p.speciesLabels || []).filter(l => l !== label) }));
    };

    // Derive computed fields
    const derivedEnclosures = enclosures.map(enc => {
        const capacity = enc.capacity || enc.size || 0;
        const currentAnimals = enc.currentAnimals ?? (typeof enc.currentAnimals === 'number' ? enc.currentAnimals : 0);
        const occupancyPct = capacity > 0 ? Math.round((currentAnimals / capacity) * 100) : 0;

        // Count overdue cleaning tasks
        const cleaningTasks = enc.cleaningTasks || [];
        const today = new Date();
        const overdueTasks = cleaningTasks.filter(task => {
            if (!task.lastDoneDate && task.frequencyDays) return true;
            if (task.lastDoneDate && task.frequencyDays) {
                const nextDue = new Date(task.lastDoneDate);
                nextDue.setDate(nextDue.getDate() + task.frequencyDays);
                return nextDue < today;
            }
            return false;
        });

        return {
            ...enc,
            capacity,
            currentAnimals,
            occupancyPct,
            overdueTasks,
            isOccupied: currentAnimals > 0,
        };
    });

    // Filter & sort
    const filteredEnclosures = derivedEnclosures
        .filter(enc => {
            if (statusFilter === 'occupied' && !enc.isOccupied) return false;
            if (statusFilter === 'empty' && enc.isOccupied) return false;
            const term = searchTerm.toLowerCase();
            if (term && !enc.name?.toLowerCase().includes(term) &&
                !enc.enclosureType?.toLowerCase().includes(term) &&
                !enc.location?.toLowerCase().includes(term)) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'occupancy') return b.occupancyPct - a.occupancyPct;
            if (sortBy === 'lastCleaned') {
                const aDate = a.lastCleaned ? new Date(a.lastCleaned) : new Date(0);
                const bDate = b.lastCleaned ? new Date(b.lastCleaned) : new Date(0);
                return aDate - bDate;
            }
            return (a.name || '').localeCompare(b.name || '');
        });

    const totalAnimals = derivedEnclosures.reduce((sum, e) => sum + e.currentAnimals, 0);
    const totalCapacity = derivedEnclosures.reduce((sum, e) => sum + e.capacity, 0);
    const totalOccupancyPct = totalCapacity > 0 ? Math.round((totalAnimals / totalCapacity) * 100) : 0;

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-3 border border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Enclosures</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-dark-text">{enclosures.length}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-3 border border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Total Animals</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-dark-text">{totalAnimals}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-3 border border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Total Capacity</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-dark-text">{totalCapacity}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-3 border border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Occupancy</p>
                    <p className={`text-xl font-bold ${totalOccupancyPct > 90 ? 'text-red-600' : totalOccupancyPct > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {totalOccupancyPct}%
                    </p>
                </div>
            </div>

            {/* Search / Filter / Action Bar */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4 border border-gray-100 dark:border-dark-border mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search enclosures by name, type, location..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-1.5">
                        {['all', 'occupied', 'empty'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    statusFilter === f
                                        ? 'bg-primary text-black'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-text cursor-pointer"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="occupancy">Sort: Occupancy</option>
                            <option value="lastCleaned">Sort: Last Cleaned</option>
                        </select>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors text-sm"
                    >
                        <PlusCircle size={16} />
                        Add Enclosure
                    </button>
                </div>
            </div>

            {/* Enclosure Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : filteredEnclosures.length === 0 ? (
                <div className="text-center py-16">
                    <Home size={48} className="mx-auto mb-3 text-gray-300 dark:text-dark-text-muted" />
                    <p className="text-gray-500 dark:text-dark-text-muted font-medium">
                        {searchTerm ? 'No enclosures match your search.' : 'No enclosures yet. Create your first one!'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={handleOpenCreate}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <PlusCircle size={16} />
                            Create Enclosure
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEnclosures.map(enclosure => (
                        <div
                            key={enclosure._id || enclosure.id}
                            className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            {/* Card Image */}
                            <div
                                className="h-32 bg-gray-100 dark:bg-dark-surface-hover relative cursor-pointer overflow-hidden"
                                onClick={() => handleOpenDetail(enclosure)}
                            >
                                {enclosure.imageUrl ? (
                                    <img src={enclosure.imageUrl} alt={enclosure.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Home size={40} className="text-gray-300 dark:text-dark-text-muted" />
                                    </div>
                                )}
                                {/* Status Pill */}
                                <div className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shadow-sm ${
                                    enclosure.isOccupied
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                    {enclosure.isOccupied ? 'Occupied' : 'Empty'}
                                </div>
                                {/* Quick Actions */}
                                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(enclosure); }}
                                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm text-gray-700"
                                        title="Edit"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkCleaned(enclosure); }}
                                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm text-green-700"
                                        title="Mark Cleaned"
                                    >
                                        <CheckCircle size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-3 cursor-pointer" onClick={() => handleOpenDetail(enclosure)}>
                                {/* Name */}
                                <h3 className="font-semibold text-gray-800 dark:text-dark-text text-sm truncate">{enclosure.name}</h3>
                                
                                {/* Type & Location */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                                    {enclosure.enclosureType && (
                                        <span className="flex items-center gap-1">
                                            <Settings size={12} />
                                            {enclosure.enclosureType}
                                        </span>
                                    )}
                                    {enclosure.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            {enclosure.location}
                                        </span>
                                    )}
                                </div>

                                {/* Occupancy Bar */}
                                <div className="mt-2.5">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500 dark:text-dark-text-muted">
                                            <Cat size={12} className="inline mr-0.5" />
                                            {enclosure.currentAnimals}/{enclosure.capacity || '∞'}
                                        </span>
                                        <span className={`font-semibold ${
                                            enclosure.occupancyPct > 90 ? 'text-red-600' :
                                            enclosure.occupancyPct > 70 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {enclosure.occupancyPct}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                enclosure.occupancyPct > 90 ? 'bg-red-500' :
                                                enclosure.occupancyPct > 70 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(enclosure.occupancyPct, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Environment Info */}
                                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-gray-400 dark:text-dark-text-muted">
                                    {(enclosure.tempMin || enclosure.tempMax) && (
                                        <span className="flex items-center gap-0.5">
                                            <Thermometer size={10} />
                                            {enclosure.tempMin || '?'} - {enclosure.tempMax || '?'}°
                                        </span>
                                    )}
                                    {(enclosure.humidityMin || enclosure.humidityMax) && (
                                        <span className="flex items-center gap-0.5">
                                            <Droplets size={10} />
                                            {enclosure.humidityMin || '?'} - {enclosure.humidityMax || '?'}%
                                        </span>
                                    )}
                                </div>

                                {/* Cleaning Status */}
                                {enclosure.lastCleaned && (
                                    <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 dark:text-dark-text-muted">
                                        <Calendar size={10} />
                                        Last cleaned: {formatDate(enclosure.lastCleaned)}
                                    </div>
                                )}

                                {/* Overdue Tasks Warning */}
                                {enclosure.overdueTasks && enclosure.overdueTasks.length > 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-[11px] text-red-500 bg-red-50 dark:bg-red-900/20 rounded px-1.5 py-0.5">
                                        <AlertCircle size={10} />
                                        {enclosure.overdueTasks.length} maintenance task{enclosure.overdueTasks.length > 1 ? 's' : ''} due
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Enclosure Create/Edit Modal */}
            {showEnclosureModal && (
                <EnclosureModal
                    isOpen={showEnclosureModal}
                    onClose={() => setShowEnclosureModal(false)}
                    enclosureFormData={enclosureFormData}
                    setEnclosureFormData={setEnclosureFormData}
                    editingEnclosureId={editingEnclosureId}
                    setEditingEnclosureId={setEditingEnclosureId}
                    handleSaveEnclosure={handleSaveEnclosure}
                    enclosureSaving={enclosureSaving}
                    enclosureImageFile={enclosureImageFile}
                    setEnclosureImageFile={setEnclosureImageFile}
                    enclosureImagePreview={enclosureImagePreview}
                    setEnclosureImagePreview={setEnclosureImagePreview}
                    newEnclosureTag={newEnclosureTag}
                    setNewEnclosureTag={setNewEnclosureTag}
                    handleEnclosureTagAdd={handleEnclosureTagAdd}
                    handleEnclosureTagRemove={handleEnclosureTagRemove}
                    newEnclosureSpeciesLabel={newEnclosureSpeciesLabel}
                    setNewEnclosureSpeciesLabel={setNewEnclosureSpeciesLabel}
                    allSpecies={allSpecies}
                    handleEnclosureSpeciesLabelAdd={handleEnclosureSpeciesLabelAdd}
                    handleEnclosureSpeciesLabelRemove={handleEnclosureSpeciesLabelRemove}
                    newCleaningTaskName={newCleaningTaskName}
                    setNewCleaningTaskName={setNewCleaningTaskName}
                    newCleaningTaskFreq={newCleaningTaskFreq}
                    setNewCleaningTaskFreq={setNewCleaningTaskFreq}
                />
            )}

            {/* Enclosure Detail Modal */}
            {showDetailModal && selectedEnclosure && (
                <EnclosureDetailModal
                    isOpen={showDetailModal}
                    onClose={() => { setShowDetailModal(false); setSelectedEnclosure(null); setEnclosureAnimals([]); }}
                    enclosure={selectedEnclosure}
                    animals={enclosureAnimals}
                    loadingAnimals={loadingAnimals}
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    showModalMessage={showModalMessage}
                    onRefresh={fetchEnclosures}
                    onViewAnimal={onViewAnimal}
                    onEditEnclosure={handleOpenEdit}
                />
            )}
        </div>
    );
};

export default EnclosuresPage;
