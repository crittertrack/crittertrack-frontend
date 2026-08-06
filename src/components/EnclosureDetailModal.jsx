import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    X, Home, Cat, MapPin, Thermometer, Droplets, Calendar, CheckCircle, PlusCircle,
    AlertCircle, Users, Wrench, MessageSquare, Clock, Edit, Package, ClipboardList, Utensils,
    Trash2, Loader2, ChevronDown, ChevronUp, Settings, BarChart2, Search,
    Lightbulb, RefreshCw, Star, Info, Activity, Plus
} from 'lucide-react';
import AnimalImage from './shared/AnimalImage';
import { formatDate, parseLocalDate } from '../utils/dateFormatter';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Info },
    { id: 'animals', label: 'Animals', icon: Users },
    { id: 'environment', label: 'Environment', icon: Thermometer },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'history', label: 'History', icon: Clock },
];

const AnimalPickerModal = ({ animals, onSelect, onClose, title, X, Search }) => {
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredAnimals = animals.filter(animal => {
        if (genderFilter && animal.gender !== genderFilter) return false;
        if (statusFilter && animal.status !== statusFilter) return false;

        if (!search) return true;

        const searchTerm = search.toLowerCase();
        return (
            animal.name?.toLowerCase().includes(searchTerm) ||
            animal.id_public?.toLowerCase().includes(searchTerm) ||
            animal.species?.toLowerCase().includes(searchTerm) ||
            animal.status?.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[450]">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b dark:border-dark-border p-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">{title || 'Select Animal'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-dark-text-muted dark:hover:text-dark-text"><X size={22} /></button>
                </div>

                {/* Search & Filters */}
                <div className="p-4 border-b dark:border-dark-border flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, species, or status..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface-hover focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface-hover focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Intersex">Intersex</option>
                                <option value="Mixed">Mixed</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface-hover focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Pet">Pet</option>
                                <option value="Growout">Growout</option>
                                <option value="Breeder">Breeder</option>
                                <option value="Booked">Booked</option>
                                <option value="Retired">Retired</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Animal List */}
                <div className="flex-grow overflow-y-auto p-2">
                    {filteredAnimals.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-dark-text-muted py-8">No unassigned animals found.</p>
                    ) : (
                        <div className="space-y-1">
                            {filteredAnimals.map(animal => (
                                <button
                                    key={animal.id_public}
                                    onClick={() => onSelect(animal)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
                                >
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-dark-surface rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" iconSize={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">
                                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                                            {animal.species} • {animal.gender} • {animal.id_public}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EnclosureDetailModal = ({
    isOpen,
    onClose,
    enclosure,
    animals,
    loadingAnimals,
    authToken,
    API_BASE_URL,
    onRefresh,
    onViewAnimal,
    onEditEnclosure,
    assignableAnimals,
    onAssignAnimal,
    onUnassignAnimal,
    showModalMessage,
    onLogEnclosureHistory,
    userProfile,
}) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState([]);
    const [savingNote, setSavingNote] = useState(false);
    const [updatingTask, setUpdatingTask] = useState(null);
    const modalRef = useRef(null);
    const [showAnimalPicker, setShowAnimalPicker] = useState(false);

    const TASK_TYPE_STYLES = {
        Cleaning: { icon: <Wrench size={12} className="text-amber-700" />, color: 'text-amber-700' },
        Maintenance: { icon: <Settings size={12} className="text-orange-700" />, color: 'text-orange-700' },
        Feeding: { icon: <Utensils size={12} className="text-red-700" />, color: 'text-red-700' },
        Other: { icon: <Info size={12} className="text-gray-600" />, color: 'text-gray-600' },
    };

    const formatValue = (val) => {
        if (val === null || val === undefined || val === '') return 'empty';
        if (Array.isArray(val)) {
            if (val.length === 0) return 'empty';
            return val.join(', ');
        }
        if (typeof val === 'object') {
            try { return JSON.stringify(val); } catch { return 'empty'; }
        }
        return String(val);
    };

    const HistoryItem = ({ item }) => {
        const { action, details, userName, timestamp, text } = item;
    
        const ICONS = { // NOSONAR
            create: <Plus size={14} className="text-green-500" />,
            update: <Edit size={14} className="text-blue-500" />,
            assign_animal: <Plus size={14} className="text-green-500" />,
            unassign_animal: <Trash2 size={14} className="text-red-500" />,
            task_complete: <CheckCircle size={14} className="text-teal-500" />,
            task_added: <Plus size={14} className="text-green-500" />,
            task_removed: <Trash2 size={14} className="text-red-500" />,
            note: <MessageSquare size={14} className="text-gray-500" />,
            note_removed: <Trash2 size={14} className="text-red-500" />,
            default: <Info size={14} className="text-gray-500" />
        };
    
        let content;
        let icon;
    
        if (item.type === 'note') {
            icon = ICONS.note;
            content = (
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Note Added</p>
                    <p className="text-sm text-gray-700 dark:text-dark-text mt-1">{text}</p>
                </div>
            );
        } else {
            let normalizedAction = action;
            if (action === 'enclosure_create') normalizedAction = 'create';
            else if (action === 'enclosure_update') normalizedAction = 'update';
            else if (action === 'enclosure_assign') normalizedAction = 'assign_animal';
            else if (action === 'enclosure_unassign') normalizedAction = 'unassign_animal';
            else if (action === 'enclosure_task_done') normalizedAction = 'task_complete';
 
            icon = ICONS[normalizedAction] || ICONS.default;
            let actionText;
            switch (normalizedAction) {
                case 'create':
                    actionText = <>Enclosure created</>;
                    break;
                case 'update':
                    if (item._singleChange) {
                        const change = item._singleChange;
                        actionText = <>Updated <span className="font-medium">{change.label || change.field}</span> from "{formatValue(change.oldValue)}" to "{formatValue(change.newValue)}"</>;
                    } else {
                        actionText = <>Updated enclosure</>;
                    }
                    break;
                case 'assign_animal':
                    const assignedAnimalName = [details.prefix, details.animalName, details.suffix].filter(Boolean).join(' ');
                    actionText = <>Assigned animal <strong>{assignedAnimalName}</strong> ({details.animalId})</>;
                    break;
                case 'unassign_animal':
                    const unassignedAnimalName = [details.prefix, details.animalName, details.suffix].filter(Boolean).join(' ');
                    actionText = <>Unassigned animal <strong>{unassignedAnimalName}</strong> ({details.animalId})</>;
                    break;
                case 'task_complete':
                    actionText = <>Completed task: <strong>{details.taskName}</strong></>;
                    break;
                case 'task_added':
                    actionText = <>Added task: <strong>{details.taskName}</strong></>;
                    break;
                case 'task_removed':
                    actionText = <>Removed task: <strong>{details.taskName}</strong></>;
                    break;
                case 'note_removed':
                    actionText = <>Note removed</>;
                    break;
                default:
                    const formattedAction = action.replace(/_/g, ' ');
                    actionText = <>{formattedAction.charAt(0).toUpperCase() + formattedAction.slice(1)}</>;
            }
            content = ( <div className="flex-1"> <p className="text-sm text-gray-700 dark:text-dark-text">{actionText}</p> </div> );
        }
    
        return ( <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-100 dark:border-dark-border"> <div className="mt-1">{icon}</div> {content} <div className="text-xs text-gray-400 dark:text-dark-text-muted flex-shrink-0 mt-1">{formatDate(timestamp)}</div> </div> );
    };

    const sortedCleaningTasks = useMemo(() => {
        const tasks = enclosure.cleaningTasks || [];
        if (tasks.length === 0) return [];

        const getDaysUntilDue = (task) => {
            if (!task.frequencyDays && !task.frequency) return Infinity; // No schedule, sort last
            if (!task.lastDoneDate) return -Infinity; // Never done, due now, sort first

            const lastDone = parseLocalDate(task.lastDoneDate);
            const nextDue = new Date(lastDone);
            const frequencyInDays = task.frequencyDays || (task.frequencyUnit === 'weeks' ? task.frequency * 7 : task.frequencyUnit === 'months' ? task.frequency * 30 : task.frequency);
            nextDue.setDate(nextDue.getDate() + frequencyInDays);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            nextDue.setHours(0, 0, 0, 0);

            return (nextDue - today) / (1000 * 60 * 60 * 24);
        };

        return [...tasks].sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b));
    }, [enclosure.cleaningTasks]);

    const combinedHistory = useMemo(() => {
        const ALLOWED_ENCLOSURE_ACTIONS = [
            'create',
            'enclosure_create',
            'update',
            'enclosure_update',
            'assign_animal',
            'enclosure_assign',
            'unassign_animal',
            'enclosure_unassign',
            'task_added',
            'task_removed',
            'task_complete',
            'enclosure_task_done',
            'note_removed',
        ];
        const activity = (enclosure.history || []).flatMap(h => {
            if (!ALLOWED_ENCLOSURE_ACTIONS.includes(h.action)) return [];
            // Expand update entries: create one entry per field change
            if ((h.action === 'update' || h.action === 'enclosure_update') && h.details?.changes?.length > 0) {
                return h.details.changes.map(change => ({
                    ...h,
                    type: 'activity',
                    _singleChange: change,
                }));
            }
            return [{ ...h, type: 'activity' }];
        });
        const notes = (enclosure.notesHistory || []).map(n => ({ ...n, type: 'note' }));
        
        return [...activity, ...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [enclosure.history, enclosure.notesHistory]);

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

    if (!isOpen) return null;

    // Derived values
    const capacity = enclosure.capacity || 0;
    const currentAnimals = animals.length;
    const occupancyPct = capacity > 0 ? Math.round((currentAnimals / capacity) * 100) : 0;
    const cleaningTasks = enclosure.cleaningTasks || [];
    const speciesLabels = enclosure.speciesLabels || [];

    // Handle delete a single note from notesHistory via PATCH $pull
    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            await axios.patch(`${API_BASE_URL}/enclosures/${enclosure._id || enclosure.id}`, {
                $pull: { notesHistory: { id: noteId } }
            }, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }
            });
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

// Handle add note — uses PATCH $push to append to notesHistory
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
            // Use PATCH with $push so only the notesHistory array is updated
            // (PUT would replace all fields and miss notesHistory entirely)
            await axios.patch(`${API_BASE_URL}/enclosures/${enclosure._id || enclosure.id}`, {
                $push: { notesHistory: noteEntry }
            }, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }
            });
            setNotes([...notes, noteEntry]);
            setNewNote('');
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
    const handleCompleteTask = async (task) => {
        if (!task || !task._id || !userProfile) return;
        setUpdatingTask(task._id);
        try {
            const taskIndex = enclosure.cleaningTasks.findIndex(t => t._id === task._id);
            if (taskIndex === -1) {
                showModalMessage?.('Error', 'Task not found.');
                setUpdatingTask(null);
                return;
            }

            const updatedTasks = [...enclosure.cleaningTasks];
            updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], lastDoneDate: new Date().toISOString() };

            const historyEntry = {
                timestamp: new Date().toISOString(),
                userId: userProfile._id,
                userName: userProfile.personalName || userProfile.breederName,
                action: 'task_complete',
                details: { taskName: task.taskName, taskType: task.type || 'Other' }
            };

            // Use PATCH (now supported on backend) for partial updates
            await axios.patch(`${API_BASE_URL}/enclosures/${enclosure._id}`, {
                cleaningTasks: updatedTasks,
                $push: { history: historyEntry }
            }, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }
            });
            onRefresh?.();
        } catch (err) {
            console.error('Failed to update task:', err);
            showModalMessage?.('Error', 'Failed to update task.');
        } finally {
            setUpdatingTask(null);
        }
    };

    // Get task status - assumes frequency is in days for now
    const getTaskStatus = (task) => {
        if (!task.frequencyDays && !task.frequency) return { color: 'text-gray-400', label: 'No schedule', overdue: false };
        if (!task.lastDoneDate) return { color: 'text-red-600', label: 'Due now', overdue: true };

        const lastDone = parseLocalDate(task.lastDoneDate);
        const nextDue = new Date(lastDone);
        const frequencyInDays = task.frequencyDays || (task.frequencyUnit === 'weeks' ? task.frequency * 7 : task.frequencyUnit === 'months' ? task.frequency * 30 : task.frequency);
        nextDue.setDate(nextDue.getDate() + frequencyInDays);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDue.setHours(0, 0, 0, 0);

        if (nextDue < today) {
            const daysOver = Math.floor((today - nextDue) / (1000 * 60 * 60 * 24));
            return { color: 'text-red-600', label: `${daysOver}d overdue`, overdue: true };
        }
        const daysLeft = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
        return { color: 'text-green-600', label: `${daysLeft}d remaining`, overdue: false };
    };


    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60" onClick={onClose}>
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
                            {enclosure.locationName || enclosure.location || 'No location set'}
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
                <div className="flex-shrink-0 flex flex-wrap gap-0.5 px-4 pt-2 pb-0 bg-gray-50 dark:bg-dark-card-bg border-b dark:border-dark-text-muted">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-l border-r transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-white dark:bg-dark-card-bg text-primary dark:text-dark-text border-gray-200 dark:border-dark-text-muted -mb-[1px]'
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
                                      <div className="text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Type</span>
                                            <span className="text-gray-800 dark:text-dark-text">{enclosure.enclosureType || '—'}</span>
                                        </div>
                                         <div className="flex justify-between pt-1 mt-1 border-t dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Purpose</span>
                                            <span className="text-gray-800 dark:text-dark-text capitalize">{enclosure.purpose || 'General'}</span>
                                        </div>
                                        {enclosure.purposeDescription && (
                                            <div className="flex justify-between items-start pt-1 mt-1 border-t dark:border-dark-border">
                                                <span className="text-gray-500 dark:text-dark-text-muted">Description</span>
                                                <span className="text-gray-800 dark:text-dark-text text-right ml-2">{enclosure.purposeDescription}</span>
                                            </div>
                                        )}
                                         <div className="flex justify-between pt-1 mt-1 border-t dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Location</span>
                                              <span className="text-gray-800 dark:text-dark-text">{enclosure.locationName || enclosure.location || '—'}</span>
                                        </div>
                                        {enclosure.location?.address && (
                                            <div className="flex justify-between items-start pt-1 mt-1 border-t dark:border-dark-border">
                                                <span className="text-gray-500 dark:text-dark-text-muted">Address</span>
                                                <span className="text-gray-800 dark:text-dark-text text-right ml-2 text-xs">
                                                    {Object.values(enclosure.location.address).filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-1 mt-1 border-t dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Dimensions</span>
                                            <span className="text-gray-800 dark:text-dark-text">
                                                {(() => {
                                                    const dims = enclosure.dimensions;
                                                    if (typeof dims === 'object' && dims !== null) {
                                                        return `${dims.length || '?'}x${dims.width || '?'}x${dims.height || '?'} ${dims.unit || 'in'}`;
                                                    }
                                                    return dims || '—';
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-1 mt-1 border-t dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-dark-text-muted">Lighting</span>
                                               <span className="text-gray-800 dark:text-dark-text">
                                                {enclosure.lightsOnTime && enclosure.lightsOffTime ? (
                                                    enclosure.lightTimeFormat === '12h'
                                                        ? `${new Date('1970-01-01T' + enclosure.lightsOnTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date('1970-01-01T' + enclosure.lightsOffTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                                                        : `${enclosure.lightsOnTime} - ${enclosure.lightsOffTime}`
                                                ) : (enclosure.lightingSchedule || enclosure.lighting || '—')}
                                                </span>
                                        </div>
                                        {enclosure.lightingType && (
                                            <div className="flex justify-between items-start pt-1 mt-1 border-t dark:border-dark-border">
                                                <span className="text-gray-500 dark:text-dark-text-muted">Lighting Type</span>
                                                <span className="text-gray-800 dark:text-dark-text text-right ml-2">{enclosure.lightingType}</span>
                                            </div>
                                        )}
                                        {enclosure.bedding && (
                                            <div className="flex justify-between items-start pt-1 mt-1 border-t dark:border-dark-border">
                                                <span className="text-gray-500 dark:text-dark-text-muted">Bedding</span>
                                                <span className="text-gray-800 dark:text-dark-text text-right ml-2">{enclosure.bedding}</span>
                                            </div>
                                        )}
                                        {enclosure.enrichment && (
                                            <div className="flex justify-between items-start pt-1 mt-1 border-t dark:border-dark-border"><span className="text-gray-500 dark:text-dark-text-muted">Enrichment</span><span className="text-gray-800 dark:text-dark-text text-right ml-2">{enclosure.enrichment}</span></div>
                                        )}
                                    </div>
                                </div>

                                {/* Cleaning Schedule */}
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-3 border border-gray-100 dark:border-dark-border col-span-1 sm:col-span-1">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-2">Upcoming Tasks</h4>
                                    <div className="space-y-3">
                                        {sortedCleaningTasks.length > 0 ? sortedCleaningTasks.slice(0, 3).map((task, idx) => {
                                            const status = getTaskStatus(task);
                                            return (
                                                <div key={task._id || idx}>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{task.taskName}</p>
                                                        <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-dark-text-muted flex items-center gap-3 flex-wrap mt-0.5">                                                        {task.type && (() => {
                                                            const type = task.type || 'Other';
                                                            const Icon = TASK_TYPE_STYLES[type]?.icon || TASK_TYPE_STYLES['Other'].icon;
                                                            return (
                                                                <span className={`flex items-center gap-1 font-semibold ${TASK_TYPE_STYLES[type]?.color || TASK_TYPE_STYLES['Other'].color}`}>
                                                                    {Icon}
                                                                    {type}
                                                                </span>
                                                            );
                                                        })()}
                                                        {(task.frequencyDays || task.frequency) && (
                                                            <span className="flex items-center gap-1">
                                                                <RefreshCw size={11} /> Every {task.frequencyDays || task.frequency} {task.frequencyUnit || 'days'}
                                                            </span>
                                                        )}
                                                        {task.assignedSupplies && task.assignedSupplies.length > 0 && (
                                                            <span className="flex items-center gap-1" title={task.assignedSupplies.map(s => `${s.quantity} x ${s.supplyName}`).join(', ')}>
                                                                <Package size={12} />
                                                                {task.assignedSupplies.length === 1
                                                                    ? `${task.assignedSupplies[0].quantity} x ${task.assignedSupplies[0].supplyName}`
                                                                    : `${task.assignedSupplies.length} supplies`
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {task.lastDoneDate && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            Last: {formatDate(task.lastDoneDate)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center text-gray-400 py-2 text-xs">
                                                No scheduled tasks.
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
                                <button
                                    onClick={() => setShowAnimalPicker(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary dark:bg-dark-primary rounded-lg hover:bg-primary/90"
                                >
                                    <PlusCircle size={14} />
                                    Assign Animal
                                </button>
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
                                    <Lightbulb size={14} /> Lighting
                                </h4>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-700 dark:text-dark-text">
                                        <span className="font-semibold">Schedule: </span>
                                        {enclosure.lightsOnTime && enclosure.lightsOffTime
                                            ? `On at ${enclosure.lightsOnTime}, Off at ${enclosure.lightsOffTime}`
                                            : (enclosure.lightingSchedule || enclosure.lighting || 'Not specified')}
                                    </p>
                                    {enclosure.lightingType && (
                                        <p className="text-gray-700 dark:text-dark-text">
                                            <span className="font-semibold">Type: </span>{enclosure.lightingType}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bedding / Substrate */}
                            {enclosure.bedding && (
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-4 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Package size={14} /> Bedding / Substrate</h4>
                                    <p className="text-sm text-gray-700 dark:text-dark-text">{enclosure.bedding}</p>
                                </div>
                            )}

                            {/* Enrichment */}
                            {enclosure.enrichment && (
                                <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-lg p-4 border border-gray-100 dark:border-dark-border">
                                    <h4 className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity size={14} /> Enrichment</h4>
                                    <p className="text-sm text-gray-700 dark:text-dark-text">{enclosure.enrichment}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== TASKS TAB ===== */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-800 dark:text-dark-text">Tasks</h3>
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
                                                key={task._id || idx}
                                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                    status.overdue
                                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                        : 'bg-gray-50 dark:bg-dark-surface-hover border-gray-100 dark:border-dark-border'
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{task.taskName}</p>
                                                    <div className="text-xs text-gray-500 dark:text-dark-text-muted flex items-center gap-3 flex-wrap mt-1">                                                        {task.type && (() => {
                                                            const type = task.type || 'Other';
                                                            const Icon = TASK_TYPE_STYLES[type]?.icon || TASK_TYPE_STYLES['Other'].icon;
                                                            return (
                                                                <span className={`flex items-center gap-1 font-semibold ${TASK_TYPE_STYLES[type]?.color || TASK_TYPE_STYLES['Other'].color}`}>
                                                                    {Icon}
                                                                    {type}
                                                                </span>
                                                            );
                                                        })()}
                                                        {(task.frequencyDays || task.frequency) && (
                                                            <span className="flex items-center gap-1">
                                                                <RefreshCw size={11} /> Every {task.frequencyDays || task.frequency} {task.frequencyUnit || 'days'}
                                                            </span>
                                                        )}
                                                        {task.assignedSupplies && task.assignedSupplies.length > 0 && (
                                                            <span className="flex items-center gap-1" title={task.assignedSupplies.map(s => `${s.quantity} x ${s.supplyName}`).join(', ')}>
                                                                <Package size={12} />
                                                                {task.assignedSupplies.length === 1
                                                                    ? `${task.assignedSupplies[0].quantity} x ${task.assignedSupplies[0].supplyName}`
                                                                    : `${task.assignedSupplies.length} supplies`
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    {task.notes && <p className="text-xs text-gray-400 italic mt-1">{task.notes}</p>}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
                                                    {task.lastDoneDate && (
                                                        <p className="text-[10px] text-gray-400">
                                                            Last: {formatDate(task.lastDoneDate)}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleCompleteTask(task)}
                                                    disabled={updatingTask === task._id}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                        status.overdue
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                                                    }`}
                                                    title="Mark as done"
                                                >
                                                    {updatingTask === task._id
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <CheckCircle size={14} />
                                                    }
                                                    Done
                                                </button>
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
                                    className="self-end px-3 py-2 bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-medium rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
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
                                            className="p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-100 dark:border-dark-border group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[11px] font-medium text-gray-500 dark:text-dark-text-muted bg-gray-200 dark:bg-dark-border px-1.5 py-0.5 rounded">
                                                    {note.category || 'General'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] text-gray-400">
                                                        {note.timestamp ? formatDate(note.timestamp) : ''}
                                                        {note.pending && ' (pending save)'}
                                                    </span>
                                                    {!note.pending && (
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="p-1 rounded text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Delete note"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
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
                            {combinedHistory.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-dark-text-muted">
                                    <Clock size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No activity has been logged for this enclosure yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {combinedHistory.map(item => <HistoryItem key={item.id || item.timestamp} item={item} />)}
                                </div>
                            )}
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

                {showAnimalPicker && (
                    <AnimalPickerModal
                        animals={assignableAnimals}
                        onSelect={(animal) => {
                            const willExceedCapacity = capacity > 0 && currentAnimals + 1 > capacity;
                            const confirmed = !willExceedCapacity || window.confirm(`This enclosure has a capacity of ${capacity}, but will have ${currentAnimals + 1} occupants. Are you sure you want to assign this animal?`);

                            if (confirmed) {
                                onAssignAnimal(animal, enclosure);
                            }

                            setShowAnimalPicker(false);
                        }}
                        onClose={() => setShowAnimalPicker(false)}
                        title="Assign Animal to Enclosure"
                        X={X}
                        Search={Search}
                    />
                )}
            </div>
        </div>
    );
};

export default EnclosureDetailModal;
