import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    X, Home, Cat, MapPin, Thermometer, Droplets, Calendar, CheckCircle, PlusCircle,
    AlertCircle, Users, Wrench, MessageSquare, Clock, Edit, PlusCircle,
    Trash2, Loader2, ChevronDown, ChevronUp, Settings, BarChart2,
    Lightbulb, RefreshCw, Star, Info, Activity
} from 'lucide-react';
import AnimalImage from './shared/AnimalImage';
import { formatDate } from '../utils/dateFormatter';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Info },
    { id: 'animals', label: 'Animals', icon: Users },
    { id: 'environment', label: 'Environment', icon: Thermometer },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'history', label: 'History', icon: Clock },
];

const EnclosureDetailModal = ({
    isOpen,
    onClose,
    enclosure,
    animals,
    loadingAnimals,
    authToken,
    API_BASE_URL,
    showModalMessage,
    onRefresh,
    onViewAnimal,
    onEditEnclosure,
    assignableAnimals,
    onAssignAnimal,
    onUnassignAnimal,
}) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState([]);
    const [savingNote, setSavingNote] = useState(false);
    const [updatingTask, setUpdatingTask] = useState(null);
    const modalRef = useRef(null);
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const assignButtonRef = useRef(null);

    useEffect(() => {
        // Load notes from enclosure data
        setNotes(enclosure.notesHistory || []);
    }, [enclosure]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assignButtonRef.current && !assignButtonRef.current.contains(event.target)) {
                setShowAssignDropdown(false);
            }
        };
        if (showAssignDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Derived values
    const capacity = enclosure.capacity || 0;
    const currentAnimals = animals.length;
    const occupancyPct = capacity > 0 ? Math.round((currentAnimals / capacity) * 100) : 0;
    const cleaningTasks = enclosure.cleaningTasks || [];
    const speciesLabels = enclosure.speciesLabels || [];

    // Handle add note
    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        const noteEntry = {
            id: `note-${Date.now()}`,
            text: newNote.trim(),
            category: 'General',
            timestamp: new Date().toISOString(),
        };
        setSavingNote(true);
        try {
            // Update enclosure with new note
            const updatedNotes = [...notes, noteEntry];
            await axios.put(`${API_BASE_URL}/enclosures/${enclosure._id || enclosure.id}`, {
                notesHistory: updatedNotes,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setNotes(updatedNotes);
            setNewNote('');
            showModalMessage('Success', 'Note added.');
            onRefresh?.();
        } catch (err) {
            console.error('Failed to add note:', err);
            // Optimistically add note even if save fails
            setNotes([...notes, { ...noteEntry, pending: true }]);
            setNewNote('');
        } finally {
            setSavingNote(false);
        }
    };

    // Handle cleaning task completion
    const handleCompleteTask = async (taskIdx) => {
        setUpdatingTask(taskIdx);
        try {
            const updatedTasks = cleaningTasks.map((task, idx) => {
                if (idx === taskIdx) {
                    return { ...task, lastDoneDate: new Date().toISOString() };
                }
                return task;
            });
            await axios.put(`${API_BASE_URL}/enclosures/${enclosure._id || enclosure.id}`, {
                cleaningTasks: updatedTasks,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Task completed!');
            onRefresh?.();
        } catch (err) {
            console.error('Failed to update task:', err);
            showModalMessage('Error', 'Failed to update task.');
        } finally {
            setUpdatingTask(null);
        }
    };

    // Get task status
    const getTaskStatus = (task) => {
        if (!task.frequencyDays) return { color: 'text-gray-400', label: 'No schedule', overdue: false };
        if (!task.lastDoneDate) return { color: 'text-blue-600', label: 'Due now', overdue: false };
        const lastDone = new Date(task.lastDoneDate);
        const nextDue = new Date(lastDone);
        nextDue.setDate(nextDue.getDate() + task.frequencyDays);
        const today = new Date();
        if (nextDue < today) {
            const daysOver = Math.floor((today - nextDue) / (1000 * 60 * 60 * 24));
            return { color: 'text-red-600', label: `${daysOver}d overdue`, overdue: true };
        }
        const daysLeft = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
        return { color: 'text-green-600', label: `${daysLeft}d remaining`, overdue: false };
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                ref={modalRef}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="h-56 bg-gray-200 dark:bg-dark-surface-hover flex items-center justify-center relative rounded-t-xl overflow-hidden">
                    {enclosure.imageUrl ? (
                        <img src={enclosure.imageUrl} alt={enclosure.name} className="w-full h-full object-cover" />
                    ) : (
                        <Home size={64} className="text-gray-400 dark:text-dark-text-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{enclosure.name}</h2>
                        <p className="text-sm text-gray-200" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            {enclosure.enclosureType && `${enclosure.enclosureType} • `}
                            {enclosure.location || 'No location set'}
                        </p>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => { onEditEnclosure(enclosure); onClose(); }}
                            className="p-2 rounded-md hover:bg-white/20 text-white"
                            title="Edit Enclosure"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md hover:bg-white/20 text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex-shrink-0 flex gap-0.5 px-4 pt-2 pb-0 bg-gray-50 dark:bg-dark-surface border-b dark:border-dark-border overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-l border-r transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-white dark:bg-dark-surface text-primary border-gray-200 dark:border-dark-border -mb-[1px]'
                                    : 'bg-transparent text-gray-500 dark:text-dark-text-muted border-transparent hover:text-gray-700 dark:hover:text-dark-text'
                            }`}
                        >
                            {React.createElement(tab.icon, { size: 14 })}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    {/* ===== DASHBOARD TAB ===== */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-3">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-2 border border-gray-100 dark:border-dark-border">
                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Status</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${currentAnimals > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <span className="font-semibold text-sm text-gray-800 dark:text-dark-text">
                                            {currentAnimals > 0 ? 'Occupied' : 'Empty'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-2 border border-gray-100 dark:border-dark-border">
                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Occupancy</p>
                                    <p className={`text-base font-bold ${
                                        occupancyPct > 90 ? 'text-red-600' : occupancyPct > 70 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                        {currentAnimals}/{capacity} ({occupancyPct}%)
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-2 border border-gray-100 dark:border-dark-border">
                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Temperature</p>
                                    <p className="text-lg font-bold mt-0.5 text-gray-800 dark:text-dark-text">
                                        {enclosure.tempMin ? `${enclosure.tempMin}°` : '?'} - {enclosure.tempMax ? `${enclosure.tempMax}°` : '?'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-2 border border-gray-100 dark:border-dark-border">
                                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">Humidity</p>
                                    <p className="text-lg font-bold mt-0.5 text-gray-800 dark:text-dark-text">
                                        {enclosure.humidityMin ? `${enclosure.humidityMin}%` : '?'} - {enclosure.humidityMax ? `${enclosure.humidityMax}%` : '?'}
                                    </p>
                                </div>
                            </div>

                            {/* Occupancy Bar */}
                            <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-1">Occupancy</h4>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600 dark:text-dark-text"><Cat size={12} className="inline mr-1" />{currentAnimals} / {capacity} animals</span>
                                    <span className={`font-bold ${occupancyPct > 90 ? 'text-red-600' : occupancyPct > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {occupancyPct}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            occupancyPct > 90 ? 'bg-red-500' : occupancyPct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* General Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-1">Details</h4>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Type</span>
                                            <span className="text-gray-800 dark:text-dark-text">{enclosure.enclosureType || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Purpose</span>
                                            <span className="text-gray-800 dark:text-dark-text capitalize">{enclosure.purpose || 'General'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Location</span>
                                            <span className="text-gray-800 dark:text-dark-text">{enclosure.location || '—'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Dimensions</span>
                                            <span className="text-gray-800 dark:text-dark-text">
                                                {(() => {
                                                    const dims = enclosure.dimensions || enclosure.size;
                                                    if (typeof dims === 'object' && dims !== null) {
                                                        return `${dims.length || '?'}x${dims.width || '?'}x${dims.height || '?'} ${dims.unit || ''}`;
                                                    }
                                                    return dims || '—';
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Lighting</span>
                                               <span className="text-gray-800 dark:text-dark-text">
                                                {enclosure.lightsOnTime && enclosure.lightsOffTime ? (
                                                    enclosure.lightTimeFormat === '12h'
                                                        ? `${new Date('1970-01-01T' + enclosure.lightsOnTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date('1970-01-01T' + enclosure.lightsOffTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                                                        : `${enclosure.lightsOnTime} - ${enclosure.lightsOffTime}`
                                                ) : (enclosure.lightingSchedule || enclosure.lighting || '—')}
                                                </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cleaning Schedule */}
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-1">Cleaning</h4>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Last cleaned</span>
                                            <span className="text-gray-800 dark:text-dark-text">
                                                {enclosure.lastCleaned ? formatDate(enclosure.lastCleaned) : 'Never'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Next cleaning</span>
                                            <span className="text-gray-800 dark:text-dark-text">
                                                {enclosure.nextCleaning ? formatDate(enclosure.nextCleaning) : 'Not scheduled'}
                                            </span>
                                        </div>
                                        {cleaningTasks.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-dark-text-muted">Tasks</span>
                                                <span className="text-gray-800 dark:text-dark-text">{cleaningTasks.length} defined</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Species */}
                            {speciesLabels.length > 0 && (
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-1">Suitable Species</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {speciesLabels.map(label => (
                                            <span key={label} className="text-xs bg-primary/10 text-primary-dark px-2 py-1 rounded-full font-medium">
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {enclosure.notes && (
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-3 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-1">Description</h4>
                                    <p className="text-xs text-gray-700 dark:text-dark-text leading-relaxed">{enclosure.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== ANIMALS TAB ===== */}
                    {activeTab === 'animals' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 dark:text-dark-text">
                                    Occupants ({animals.length})
                                </h3>
                                <div className="relative" ref={assignButtonRef}>
                                    <button
                                        onClick={() => setShowAssignDropdown(prev => !prev)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
                                    >
                                        <PlusCircle size={14} />
                                        Assign Animal
                                    </button>
                                    {showAssignDropdown && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface-hover rounded-lg shadow-xl border dark:border-dark-border z-10 max-h-60 overflow-y-auto">
                                            {assignableAnimals.length === 0 ? (
                                                <p className="p-3 text-xs text-gray-500 dark:text-dark-text-muted">No unassigned animals available (or none match suitable species for this enclosure).</p>
                                            ) : (
                                                assignableAnimals.map(animal => (
                                                    <button
                                                        key={animal.id_public}
                                                        onClick={() => {
                                                            onAssignAnimal(animal, enclosure);
                                                            setShowAssignDropdown(false);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface"
                                                    >
                                                        <p className="font-medium">{animal.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">{animal.species} • {animal.id_public}</p>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {loadingAnimals ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-primary" />
                                </div>
                            ) : animals.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                                    <Cat size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No animals assigned to this enclosure.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {animals.map(animal => (
                                        <div
                                            key={animal._id || animal.id_public}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-100 dark:border-dark-border group"
                                        >
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-dark-surface rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={() => onViewAnimal?.(animal)}>
                                                <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" iconSize={18} />
                                            </div>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewAnimal?.(animal)}>
                                                <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">
                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                                                    {animal.species} • {animal.gender} • {animal.status || 'Unknown'}
                                                </p>
                                            </div>
                                            <span className="text-[11px] text-gray-400 dark:text-dark-text-muted">{animal.id_public}</span>
                                            <button
                                                onClick={() => onUnassignAnimal(animal)}
                                                className="p-2 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Unassign from enclosure"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== ENVIRONMENT TAB ===== */}
                    {activeTab === 'environment' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Temperature */}
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-4 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Thermometer size={14} /> Temperature Range
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{enclosure.tempMin || '?'}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-dark-text-muted">Min (°C)</p>
                                        </div>
                                        <span className="text-gray-300 dark:text-dark-text-muted text-xl">—</span>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-red-600">{enclosure.tempMax || '?'}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-dark-text-muted">Max (°C)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Humidity */}
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-4 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Droplets size={14} /> Humidity Range
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{enclosure.humidityMin || '?'}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-dark-text-muted">Min (%)</p>
                                        </div>
                                        <span className="text-gray-300 dark:text-dark-text-muted text-xl">—</span>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-red-600">{enclosure.humidityMax || '?'}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-dark-text-muted">Max (%)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lighting */}
                            <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-4 border border-gray-100 dark:border-dark-border">
                                <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Lightbulb size={14} /> Lighting Schedule
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-dark-text">
                                    {enclosure.lightsOnTime && enclosure.lightsOffTime
                                        ? `On at ${enclosure.lightsOnTime}, Off at ${enclosure.lightsOffTime}`
                                        : (enclosure.lightingSchedule || enclosure.lighting || 'Not specified')}
                                </p>
                            </div>

                            {/* Bedding / Substrate */}
                            {enclosure.bedding && (
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-4 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-2">Bedding / Substrate</h4>
                                    <p className="text-sm text-gray-700 dark:text-dark-text">{enclosure.bedding}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== MAINTENANCE TAB ===== */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-800 dark:text-dark-text">Cleaning & Maintenance Tasks</h3>
                            {cleaningTasks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                                    <Wrench size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No maintenance tasks defined.</p>
                                    <p className="text-xs mt-1">Add tasks in the enclosure editor.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {cleaningTasks.map((task, idx) => {
                                        const status = getTaskStatus(task);
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                    status.overdue
                                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                        : 'bg-gray-50 dark:bg-dark-surface-hover border-gray-100 dark:border-dark-border'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => handleCompleteTask(idx)}
                                                    disabled={updatingTask === idx}
                                                    className={`p-1.5 rounded-full transition-colors ${
                                                        status.overdue
                                                            ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40'
                                                            : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40'
                                                    }`}
                                                    title="Mark as done"
                                                >
                                                    {updatingTask === idx
                                                        ? <Loader2 size={16} className="animate-spin" />
                                                        : <CheckCircle size={16} />
                                                    }
                                                </button>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{task.taskName}</p>
                                                    {task.frequencyDays && (
                                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">Every {task.frequencyDays} days</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
                                                    {task.lastDoneDate && (
                                                        <p className="text-[10px] text-gray-400">
                                                            Last: {formatDate(task.lastDoneDate)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== NOTES TAB ===== */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Add note */}
                            <div className="flex gap-2">
                                <textarea
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    placeholder="Add a note about this enclosure..."
                                    rows={2}
                                    className="flex-1 p-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg resize-none bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={savingNote || !newNote.trim()}
                                    className="self-end px-3 py-2 bg-primary hover:bg-primary/90 text-black font-medium rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
                                >
                                    {savingNote ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                                    Add
                                </button>
                            </div>

                            {/* Notes list */}
                            {notes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-dark-text-muted">
                                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No notes yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {[...notes].reverse().map((note, idx) => (
                                        <div
                                            key={note.id || idx}
                                            className="p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-100 dark:border-dark-border"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[11px] font-medium text-gray-500 dark:text-dark-text-muted bg-gray-200 dark:bg-dark-border px-1.5 py-0.5 rounded">
                                                    {note.category || 'General'}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {note.timestamp ? formatDate(note.timestamp) : ''}
                                                    {note.pending && ' (pending save)'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-dark-text">{note.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== HISTORY TAB ===== */}
                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-800 dark:text-dark-text">Activity Log</h3>
                            <div className="text-center py-12 text-gray-500 dark:text-dark-text-muted">
                                <Clock size={40} className="mx-auto mb-3 opacity-50" />
                                <p>History tracking is coming soon.</p>
                                <p className="text-xs mt-1">Future updates will log all changes, cleaning events, and animal assignments here.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-surface">
                    <button
                        onClick={() => { onEditEnclosure(enclosure); onClose(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-dark-text-muted bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover"
                    >
                        <Edit size={14} />
                        Edit Enclosure
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium bg-gray-200 dark:bg-dark-surface-hover text-gray-600 dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-dark-border"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnclosureDetailModal;
