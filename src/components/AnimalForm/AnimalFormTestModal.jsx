import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft, ClipboardList, Dna, FileText, Home, Hospital, Images, Clock, Shield, Pill, Microscope, Stethoscope, Scissors, MessageSquare, AlertTriangle, Activity, Cat,
    Lock, Palette, PlusCircle, Save, Tag, Trash2, TreeDeciduous, Egg, Brain, Trophy, FileCheck, Scale, X, User, Heart, Eye, EyeOff, Edit, Users, HeartPulse,
    Hash, Sparkles, Ruler, Sprout, Key, FolderOpen, Globe, Leaf, UtensilsCrossed, Droplets,
    Thermometer, Feather, Medal, Target, Ban, Package, ScrollText, Link, Unlink, Baby, Bell, Plus, RotateCcw, Camera, Upload, Search, Star, ArrowRight,
    Loader2, ChevronDown, ChevronUp, ChevronRight, Info,
} from 'lucide-react';
import DatePicker from '../DatePicker';
import AnimalImageUpload from '../AnimalImageUpload';
import GeneticCodeBuilder from '../GeneticCodeBuilder';

const LoadingSpinner = ({ message = 'Loading...' }) => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
        <span className="text-gray-600">{message}</span>
    </div>
);

const AnimalImage = ({ src, alt = "Animal", className = "w-full h-full object-cover", iconSize = 24 }) => {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
        setImageError(false);
    }, [src]);

    const handleError = () => {
        setImageError(true);
    };

    if (!imageSrc || imageError) {
        return <Cat size={iconSize} className="text-gray-400" />;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onError={handleError}
            loading="lazy"
        />
    );
};

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

const getContactDisplayName = (contact) => {
    const personalName = contact?.personalName?.trim();
    const breederName = contact?.breederName?.trim();
    const prefix = contact?.prefix?.trim();
    const suffix = contact?.suffix?.trim();

    if (personalName && breederName) {
        return `${personalName} (${breederName})`;
    }
    if (personalName) {
        return [prefix, personalName, suffix].filter(Boolean).join(' ');
    }
    if (breederName) {
        return [prefix, breederName, suffix].filter(Boolean).join(' ');
    }
    return [prefix, personalName, suffix].filter(Boolean).join(' ') || 'Unnamed Contact';
};

const ContactDisplayField = ({ label, value, onEdit }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</label>
        <div
            onClick={onEdit}
            className="mt-1 flex justify-between items-center p-2.5 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer hover:border-primary"
        >
            <span className={`text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>{value || `Click to assign ${label}`}</span>
            <Edit size={16} className="text-gray-400" />
        </div>
    </div>
);

const AssignContactModal = ({ isOpen, onClose, onSelect, target, API_BASE_URL, authToken }) => {
    if (!isOpen) return null;

    const [mode, setMode] = useState('user'); // 'user', 'contact', 'manual'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [manualName, setManualName] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    useEffect(() => {
        if (mode === 'contact' && contacts.length === 0) {
            setLoadingContacts(true);
            axios.get(`${API_BASE_URL}/contacts`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => setContacts(res.data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingContacts(false));
        }
    }, [mode, authToken, API_BASE_URL, contacts.length]);

    const handleUserSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=20`);
            setSearchResults(res.data || []);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Assign {target}</h3>
                </div>
                <div className="p-4 border-b flex gap-2">
                    <button onClick={() => setMode('user')} className={`px-3 py-1 text-sm rounded-full ${mode === 'user' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Search User</button>
                    <button onClick={() => setMode('contact')} className={`px-3 py-1 text-sm rounded-full ${mode === 'contact' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Select Contact</button>
                    <button onClick={() => setMode('manual')} className={`px-3 py-1 text-sm rounded-full ${mode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Manual Entry</button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {mode === 'user' && (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or CTU ID" className="w-full p-2 border rounded-md" onKeyPress={e => e.key === 'Enter' && handleUserSearch()} />
                                <button onClick={handleUserSearch} disabled={loading} className="p-2 bg-primary rounded-md disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : <Search />}</button>
                            </div>
                            <div className="space-y-1">
                                {searchResults.map(user => (
                                    <div key={user.id_public} onClick={() => onSelect({ name: user.breederName || user.personalName, userId: user.id_public })} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                        <p className="font-semibold">{user.breederName || user.personalName}</p>
                                        <p className="text-xs text-gray-500">{user.id_public}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === 'contact' && (
                        <div className="space-y-1">
                            {loadingContacts ? <Loader2 className="animate-spin" /> : contacts.map(contact => (
                                <div key={contact._id} onClick={() => onSelect({ name: getContactDisplayName(contact), userId: contact.linkedCTUID })} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                    <p className="font-semibold">{getContactDisplayName(contact)}</p>
                                    {contact.linkedCTUID && <p className="text-xs text-gray-500">{contact.linkedCTUID}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                    {mode === 'manual' && (
                        <div className="space-y-2">
                            <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder={`Enter ${target} name`} className="w-full p-2 border rounded-md" />
                            <button onClick={() => onSelect({ name: manualName })} className="w-full p-2 bg-primary rounded-md">Assign Name</button>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t">
                    <button onClick={onClose} className="w-full p-2 bg-gray-200 rounded-md">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const ParentSearchModal = ({
    title,
    currentId,
    onSelect,
    onClose,
    authToken,
    showModalMessage,
    API_BASE_URL,
    requiredGender,
    species
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [scope, setScope] = useState('both'); // 'local' | 'global' | 'both'

    const SearchResultItem = ({ animal, isGlobal }) => {
        const imgSrc = animal.imageUrl || animal.photoUrl || null;

        return (
            <div
                className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(animal)}
            >
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}
                    </p>
                </div>
                {isGlobal && <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>}
            </div>
        );
    };

    const handleSearch = async () => {
        setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();
        if (!trimmedSearchTerm) return;

        const idMatch = trimmedSearchTerm.match(/^\s*(?:CTC?[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        const idValue = isIdSearch ? `CTC${idMatch[1]}` : null;

        const genderQuery = requiredGender ? (Array.isArray(requiredGender) ? `&gender=${requiredGender.map(g => encodeURIComponent(g)).join('&gender=')}` : `&gender=${requiredGender}`) : '';
        const speciesQuery = species ? `&species=${encodeURIComponent(species)}` : '';

        setLoadingLocal(scope === 'local' || scope === 'both');
        setLoadingGlobal(scope === 'global' || scope === 'both');

        if (scope === 'local' || scope === 'both') {
            try {
                const localUrl = isIdSearch
                    ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${speciesQuery}`;
                const localResponse = await axios.get(localUrl, { headers: { Authorization: `Bearer ${authToken}` } });
                setLocalAnimals(localResponse.data.filter(a => a.id_public !== currentId));
            } catch (error) {
                showModalMessage('Search Error', 'Failed to search your animals.');
                setLocalAnimals([]);
            } finally {
                setLoadingLocal(false);
            }
        }

        if (scope === 'global' || scope === 'both') {
            try {
                const globalUrl = isIdSearch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${speciesQuery}`;
                const globalResponse = await axios.get(globalUrl);
                setGlobalAnimals(globalResponse.data.filter(a => a.id_public !== currentId));
            } catch (error) {
                setGlobalAnimals([]);
            } finally {
                setLoadingGlobal(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Search Scope:</span>
                        {['local', 'global', 'both'].map(s => (
                            <button key={s} type="button" onClick={() => setScope(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Search by Name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-lg"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loadingLocal || loadingGlobal || !searchTerm.trim()}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition flex items-center disabled:opacity-50"
                        >
                            {loadingLocal || loadingGlobal ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto space-y-4">
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}
                    {hasSearched && !loadingLocal && !loadingGlobal && localAnimals.length === 0 && globalAnimals.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No animals found.</p>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <button
                        onClick={() => onSelect(null)}
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnimalFormTestModal = ({
    formTitle = "Create New Animal",
    animalToEdit,
    species,
    initialValues,
    onSave,
    onCancel,
    onDelete,
    authToken,
    API_BASE_URL,
    showModalMessage,
    userProfile,
    speciesConfigs,
    GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'],
    STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Retired', 'Deceased', 'Rehomed', 'Unknown']
}) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignModalTarget, setAssignModalTarget] = useState(null); // 'breeder' or 'keeper'
    const [breederInfo, setBreederInfo] = useState(null);
    const [parentSearchModalOpen, setParentSearchModalOpen] = useState(false);
    const [parentSearchModalConfig, setParentSearchModalConfig] = useState({});
    const [newBreedingRecord, setNewBreedingRecord] = useState({
        breedingMethod: 'Unknown',
        matingDate: '',
        mate: '',
        mateAnimalId: null,
        outcome: 'Unknown',
        birthEventDate: '',
        litterSizeBorn: '',
        notes: ''
    });
    const [mateInfo, setMateInfo] = useState(null);
    const [newVaccination, setNewVaccination] = useState({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    const [newDeworming, setNewDeworming] = useState({ date: new Date().toISOString().substring(0, 10), medication: '', notes: '' });
    const [newParasiteControl, setNewParasiteControl] = useState({ date: new Date().toISOString().substring(0, 10), treatment: '', notes: '' });
    const [newProcedure, setNewProcedure] = useState({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    const [newLabResult, setNewLabResult] = useState({ date: new Date().toISOString().substring(0, 10), testName: '', result: '', notes: '' });
    const [newMedicalCondition, setNewMedicalCondition] = useState({ name: '', notes: '' });
    const [newAllergy, setNewAllergy] = useState({ name: '', notes: '' });
    const [newMedication, setNewMedication] = useState({ name: '', dose: '', notes: '', startDate: '', stopDate: '', intervalValue: '', intervalUnit: 'hours' });
    const [newVetVisit, setNewVetVisit] = useState({ date: new Date().toISOString().substring(0, 10), reason: '', notes: '' });
    const [newCareTaskName, setNewCareTaskName] = useState('');
    const [newCareTaskFreq, setNewCareTaskFreq] = useState('');
    const [newAnimalCareTaskName, setNewAnimalCareTaskName] = useState('');
    const [newAnimalCareTaskFreq, setNewAnimalCareTaskFreq] = useState('');
    const [newMilestoneLabel, setNewMilestoneLabel] = useState('');
    const [newMilestoneDate, setNewMilestoneDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [newMilestoneInterval, setNewMilestoneInterval] = useState('');
    const [newMilestoneUnit, setNewMilestoneUnit] = useState('week');
    const [newMeasurement, setNewMeasurement] = useState({ date: new Date().toISOString().substring(0, 10), weight: '', length: '', bcs: '', notes: '' });


    const [ownerInfo, setOwnerInfo] = useState(null);
    const [sectionsCollapsed, setSectionsCollapsed] = useState({
        identity: false,
        breederOwner: true,
        availability: true,
    });
    const [newIdentifier, setNewIdentifier] = useState({ title: '', value: '' });

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: (parseJsonArrayField(prev[field]) || []).filter((_, i) => i !== index)
        }));
    };

    const addVaccination = () => {
        if (!newVaccination.date || !newVaccination.name) {
            showModalMessage('Missing Data', 'Please enter at least a date and vaccination name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newVaccination.date,
            name: newVaccination.name,
            notes: newVaccination.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            vaccinations: [...(parseJsonArrayField(prev.vaccinations) || []), record]
        }));
        setNewVaccination({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    };

    const addDeworming = () => {
        if (!newDeworming.date || !newDeworming.medication) {
            showModalMessage('Missing Data', 'Please enter at least a date and medication.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newDeworming.date,
            medication: newDeworming.medication,
            notes: newDeworming.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            dewormingRecords: [...(parseJsonArrayField(prev.dewormingRecords) || []), record]
        }));
        setNewDeworming({ date: new Date().toISOString().substring(0, 10), medication: '', notes: '' });
    };

    const addMedicalProcedure = () => {
        if (!newProcedure.date || !newProcedure.name) {
            showModalMessage('Missing Data', 'Please enter at least a date and procedure name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newProcedure.date,
            name: newProcedure.name,
            notes: newProcedure.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            medicalProcedures: [...(parseJsonArrayField(prev.medicalProcedures) || []), record]
        }));
        setNewProcedure({ date: new Date().toISOString().substring(0, 10), name: '', notes: '' });
    };

    const addLabResult = () => {
        if (!newLabResult.date || !newLabResult.testName) {
            showModalMessage('Missing Data', 'Please enter at least a date and test name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newLabResult.date,
            testName: newLabResult.testName,
            result: newLabResult.result || '',
            notes: newLabResult.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            labResults: [...(parseJsonArrayField(prev.labResults) || []), record]
        }));
        setNewLabResult({ date: new Date().toISOString().substring(0, 10), testName: '', result: '', notes: '' });
    };

    const addMedicalCondition = () => {
        if (!newMedicalCondition.name) {
            showModalMessage('Missing Data', 'Please enter a condition name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            name: newMedicalCondition.name,
            notes: newMedicalCondition.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            medicalConditions: [...(parseJsonArrayField(prev.medicalConditions) || []), record]
        }));
        setNewMedicalCondition({ name: '', notes: '' });
    };

    const addAllergy = () => {
        if (!newAllergy.name) {
            showModalMessage('Missing Data', 'Please enter an allergy name.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            name: newAllergy.name,
            notes: newAllergy.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            allergies: [...(parseJsonArrayField(prev.allergies) || []), record]
        }));
        setNewAllergy({ name: '', notes: '' });
    };

    const addVetVisit = () => {
        if (!newVetVisit.date || !newVetVisit.reason) {
            showModalMessage('Missing Data', 'Please enter at least a date and visit reason.');
            return;
        }
        const record = {
            id: Date.now().toString(),
            date: newVetVisit.date,
            reason: newVetVisit.reason,
            notes: newVetVisit.notes || ''
        };
        setFormData(prev => ({
            ...prev,
            vetVisits: [...(parseJsonArrayField(prev.vetVisits) || []), record]
        }));
        setNewVetVisit({ date: new Date().toISOString().substring(0, 10), reason: '', notes: '' });
    };

    const addMilestone = () => {
        if (!newMilestoneLabel.trim() || !newMilestoneDate) return;
        const entry = {
            label: newMilestoneLabel.trim(),
            startDate: newMilestoneDate,
            interval: newMilestoneInterval ? Number(newMilestoneInterval) : null,
            intervalUnit: newMilestoneInterval ? newMilestoneUnit : null,
        };
        setFormData(prev => ({ ...prev, milestones: [...(prev.milestones || []), entry] }));
        setNewMilestoneLabel('');
        setNewMilestoneDate(new Date().toISOString().split('T')[0]);
        setNewMilestoneInterval('');
        setNewMilestoneUnit('week');
    };

    const addBreedingRecord = () => {
        const record = {
            id: Date.now().toString(),
            ...newBreedingRecord,
            mate: newBreedingRecord.mate || (mateInfo ? `${mateInfo.prefix || ''} ${mateInfo.name}`.trim() : null),
        };
        setFormData(prev => ({
            ...prev,
            breedingRecords: [...(parseJsonArrayField(prev.breedingRecords) || []), record]
        }));
        setNewBreedingRecord({
            breedingMethod: 'Unknown',
            matingDate: '',
            mate: '',
            mateAnimalId: null,
            outcome: 'Unknown',
            birthEventDate: '',
            litterSizeBorn: '',
            notes: ''
        });
        setMateInfo(null);
    };

    const clearMateSelection = () => {
        setNewBreedingRecord(prev => ({ ...prev, mateAnimalId: null, mate: '' }));
        setMateInfo(null);
    };

    const handleSelectMate = (animal) => {
        if (animal) {
            setMateInfo({
                id_public: animal.id_public,
                prefix: animal.prefix || '',
                suffix: animal.suffix || '',
                name: animal.name || '',
            });
            setNewBreedingRecord(prev => ({
                ...prev,
                mateAnimalId: animal.id_public,
                mate: '',
            }));
        } else {
            clearMateSelection();
        }
        setParentSearchModalOpen(false);
    };

    const toggleSection = (section) => {
        setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [tagInput, setTagInput] = useState('');

    const FormSection = ({ title, icon, children, initiallyOpen = false }) => {
        const [isOpen, setIsOpen] = useState(initiallyOpen);
        return (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5">{icon}{title}</h3>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isOpen && <div className="mt-3 pt-3 border-t space-y-3">{children}</div>}
            </div>
        );
    };

    const [formData, setFormData] = useState(
        animalToEdit ? {
            ...animalToEdit,
            species: animalToEdit.species,
            breederAssignedId: animalToEdit.breederAssignedId || animalToEdit.breederyId || animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            suffix: animalToEdit.suffix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || 'Unknown',
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            deceasedDate: animalToEdit.deceasedDate ? new Date(animalToEdit.deceasedDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
            earset: animalToEdit.earset || '',
            remarks: animalToEdit.remarks || '',
            tags: animalToEdit.tags || [],
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: animalToEdit.fatherId_public || animalToEdit.sireId_public || null,
            motherId_public: animalToEdit.motherId_public || animalToEdit.damId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            manualBreederName: animalToEdit.manualBreederName || '',
            ownerId_public: animalToEdit.ownerId_public || animalToEdit.ownerId || null,
            manualownerName: animalToEdit.manualownerName || animalToEdit.currentOwner || animalToEdit.currentOwnerDisplay || '',
            isDisplay: animalToEdit.isDisplay ?? false,
            coOwnership: animalToEdit.coOwnership || '',
            isForSale: animalToEdit.isForSale || false,
            salePriceCurrency: animalToEdit.salePriceCurrency || 'USD',
            salePriceAmount: animalToEdit.salePriceAmount || '',
            availableForBreeding: animalToEdit.availableForBreeding || false,
            studFeeCurrency: animalToEdit.studFeeCurrency || 'USD',
            studFeeAmount: animalToEdit.studFeeAmount || '',
            groupRole: animalToEdit.groupRole || '',
            isPregnant: animalToEdit.isPregnant || false,
            isNursing: animalToEdit.isNursing || false,
            isInMating: animalToEdit.isInMating || false,
            isQuarantine: animalToEdit.isQuarantine || false,
            isInTreatment: animalToEdit.isInTreatment || false,
            enclosureId: animalToEdit.enclosureId || '',
            lastFedDate: animalToEdit.lastFedDate ? new Date(animalToEdit.lastFedDate).toISOString().split('T')[0] : '',
            feedingFrequencyDays: animalToEdit.feedingFrequencyDays || '',
            lastMaintenanceDate: animalToEdit.lastMaintenanceDate ? new Date(animalToEdit.lastMaintenanceDate).toISOString().split('T')[0] : '',
            maintenanceFrequencyDays: animalToEdit.maintenanceFrequencyDays || '',
            careTasks: animalToEdit.careTasks || [],
            animalCareTasks: animalToEdit.animalCareTasks || [],
            milestones: (animalToEdit.milestones || []).map(m => ({
                ...m,
                startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '',
            })),
            isOwned: animalToEdit.isOwned ?? true,
            identifiers: parseJsonArrayField(animalToEdit.identifiers),
            microchipNumber: animalToEdit.microchipNumber || '',
            pedigreeRegistrationId: animalToEdit.pedigreeRegistrationId || '',
            colonyId: animalToEdit.colonyId || '',
            tattooId: animalToEdit.tattooId || '',
            ringId: animalToEdit.ringId || '',
            eartagNumber: animalToEdit.eartagNumber || '',
            breed: animalToEdit.breed || '',
            strain: animalToEdit.strain || '',
            coatPattern: animalToEdit.coatPattern || '',
            phenotype: animalToEdit.phenotype || '',
            morph: animalToEdit.morph || '',
            markings: animalToEdit.markings || '',
            eyeColor: animalToEdit.eyeColor || '',
            nailColor: animalToEdit.nailColor || '',
            size: animalToEdit.size || '',
            carrierTraits: animalToEdit.carrierTraits || '',
            bodyWeight: animalToEdit.bodyWeight || '',
            bodyLength: animalToEdit.bodyLength || '',
            heightAtWithers: animalToEdit.heightAtWithers || '',
            bodyConditionScore: animalToEdit.bodyConditionScore || '',
            origin: animalToEdit.origin || 'Captive-bred',
            isNeutered: animalToEdit.isNeutered || false,
            isInfertile: animalToEdit.isInfertile || false,
            heatStatus: animalToEdit.heatStatus || '',
            lastHeatDate: animalToEdit.lastHeatDate ? new Date(animalToEdit.lastHeatDate).toISOString().substring(0, 10) : '',
            ovulationDate: animalToEdit.ovulationDate ? new Date(animalToEdit.ovulationDate).toISOString().substring(0, 10) : '',
            matingDate: animalToEdit.matingDate || '',
            expectedDueDate: animalToEdit.expectedDueDate ? new Date(animalToEdit.expectedDueDate).toISOString().substring(0, 10) : '',
            litterCount: animalToEdit.litterCount || '',
            litterSizeBorn: animalToEdit.litterSizeBorn || '',
            litterSizeWeaned: animalToEdit.litterSizeWeaned || '',
            stillbornCount: animalToEdit.stillbornCount || '',
            nursingStartDate: animalToEdit.nursingStartDate ? new Date(animalToEdit.nursingStartDate).toISOString().substring(0, 10) : '',
            weaningDate: animalToEdit.weaningDate ? new Date(animalToEdit.weaningDate).toISOString().substring(0, 10) : '',
            isStudAnimal: animalToEdit.isStudAnimal || false,
            fertilityStatus: animalToEdit.fertilityStatus || 'Unknown',
            lastMatingDate: animalToEdit.lastMatingDate ? new Date(animalToEdit.lastMatingDate).toISOString().substring(0, 10) : '',
            successfulMatings: animalToEdit.successfulMatings || '',
            fertilityNotes: animalToEdit.fertilityNotes || '',
            isDamAnimal: animalToEdit.isDamAnimal || false,
            damFertilityStatus: animalToEdit.damFertilityStatus || 'Unknown',
            lastPregnancyDate: animalToEdit.lastPregnancyDate ? new Date(animalToEdit.lastPregnancyDate).toISOString().substring(0, 10) : '',
            offspringCount: animalToEdit.offspringCount || '',
            breedingRecords: parseJsonArrayField(animalToEdit.breedingRecords),
            damFertilityNotes: animalToEdit.damFertilityNotes || '',
            medicalConditions: parseJsonArrayField(animalToEdit.medicalConditions),
            allergies: parseJsonArrayField(animalToEdit.allergies),
            medications: parseJsonArrayField(animalToEdit.medications),
            vetVisits: parseJsonArrayField(animalToEdit.vetVisits),
            primaryVet: animalToEdit.primaryVet || '',
            dietType: animalToEdit.dietType || '',
            feedingSchedule: animalToEdit.feedingSchedule || '',
            supplements: animalToEdit.supplements || '',
            housingType: animalToEdit.housingType || '',
            bedding: animalToEdit.bedding || '',
            temperatureRange: animalToEdit.temperatureRange || '',
            humidity: animalToEdit.humidity || '',
            lighting: animalToEdit.lighting || '',
            noise: animalToEdit.noise || '',
            enrichment: animalToEdit.enrichment || '',
            temperament: animalToEdit.temperament || '',
            handlingTolerance: animalToEdit.handlingTolerance || '',
            socialStructure: animalToEdit.socialStructure || '',
            activityCycle: animalToEdit.activityCycle || '',
            lifeStage: animalToEdit.lifeStage || '',
            causeOfDeath: animalToEdit.causeOfDeath || '',
            necropsyResults: animalToEdit.necropsyResults || '',
            insurance: animalToEdit.insurance || '',
            legalStatus: animalToEdit.legalStatus || '',
            keeperHistory: animalToEdit.keeperHistory || [],
            showTitles: animalToEdit.showTitles || '',
            showRatings: animalToEdit.showRatings || '',
            judgeComments: animalToEdit.judgeComments || '',
            workingTitles: animalToEdit.workingTitles || '',
            performanceScores: animalToEdit.performanceScores || '',
            chestGirth: animalToEdit.chestGirth || '',
            adultWeight: animalToEdit.adultWeight || '',
            licenseNumber: animalToEdit.licenseNumber || '',
            licenseJurisdiction: animalToEdit.licenseJurisdiction || '',
            RingId: animalToEdit.RingId || '',
            estrusCycleLength: animalToEdit.estrusCycleLength || '',
            gestationLength: animalToEdit.gestationLength || '',
            artificialInseminationUsed: animalToEdit.artificialInseminationUsed || false,
            whelpingDate: animalToEdit.whelpingDate ? new Date(animalToEdit.whelpingDate).toISOString().substring(0, 10) : '',
            queeningDate: animalToEdit.queeningDate ? new Date(animalToEdit.queeningDate).toISOString().substring(0, 10) : '',
            deliveryMethod: animalToEdit.deliveryMethod || '',
            reproductiveComplications: animalToEdit.reproductiveComplications || '',
            reproductiveClearances: animalToEdit.reproductiveClearances || '',
            spayNeuterDate: animalToEdit.spayNeuterDate ? new Date(animalToEdit.spayNeuterDate).toISOString().substring(0, 10) : '',
            parasitePreventionSchedule: animalToEdit.parasitePreventionSchedule || '',
            heartwormStatus: animalToEdit.heartwormStatus || '',
            hipElbowScores: animalToEdit.hipElbowScores || '',
            geneticTestResults: animalToEdit.geneticTestResults || '',
            eyeClearance: animalToEdit.eyeClearance || '',
            cardiacClearance: animalToEdit.cardiacClearance || '',
            dentalRecords: animalToEdit.dentalRecords || '',
            chronicConditions: animalToEdit.chronicConditions || '',
            exerciseRequirements: animalToEdit.exerciseRequirements || '',
            dailyExerciseMinutes: animalToEdit.dailyExerciseMinutes || '',
            groomingNeeds: animalToEdit.groomingNeeds || '',
            sheddingLevel: animalToEdit.sheddingLevel || '',
            crateTrained: animalToEdit.crateTrained || false,
            litterTrained: animalToEdit.litterTrained || false,
            leashTrained: animalToEdit.leashTrained || false,
            freeFlightTrained: animalToEdit.freeFlightTrained || false,
            trainingLevel: animalToEdit.trainingLevel || '',
            trainingDisciplines: animalToEdit.trainingDisciplines || '',
            certifications: animalToEdit.certifications || '',
            workingRole: animalToEdit.workingRole || '',
            behavioralIssues: animalToEdit.behavioralIssues || '',
            biteHistory: animalToEdit.biteHistory || '',
            reactivityNotes: animalToEdit.reactivityNotes || '',
            endOfLifeCareNotes: animalToEdit.endOfLifeCareNotes || '',
            transferHistory: animalToEdit.transferHistory || '',
            breedingRestrictions: animalToEdit.breedingRestrictions || '',
            exportRestrictions: animalToEdit.exportRestrictions || '',
            purchaseDate: animalToEdit.purchaseDate ? new Date(animalToEdit.purchaseDate).toISOString().substring(0, 10) : '',
            purchaseLocation: animalToEdit.purchaseLocation || '',
            legalDocuments: animalToEdit.legalDocuments || [],
            growthRecords: parseJsonArrayField(animalToEdit.growthRecords),
            measurementUnits: animalToEdit.measurementUnits || { weight: 'g', length: 'cm' },
            healthStatus: animalToEdit.healthStatus || 'Unknown',
            quarantineStatus: animalToEdit.quarantineStatus || { active: false },
            vaccinations: parseJsonArrayField(animalToEdit.vaccinations),
            dewormingRecords: parseJsonArrayField(animalToEdit.dewormingRecords),
            parasiteControl: parseJsonArrayField(animalToEdit.parasiteControl),
            medicalProcedures: parseJsonArrayField(animalToEdit.medicalProcedures),
            labResults: parseJsonArrayField(animalToEdit.labResults || animalToEdit.laboratoryResults)
        } : {
            ...(initialValues || {}),
            species: species,
            breederAssignedId: '',
            prefix: '',
            suffix: '',
            name: '',
            gender: 'Unknown',
            birthDate: '',
            deceasedDate: '',
            status: 'Pet',
            color: '',
            coat: '',
            earset: '',
            remarks: '',
            tags: [],
            geneticCode: '',
            fatherId_public: null,
            motherId_public: null,
            breederId_public: null,
            manualownerName: '',
            groupRole: '',
            isPregnant: false,
            isNursing: false,
            isInMating: false,
            isQuarantine: false,
            isInTreatment: false,
            enclosureId: '',
            lastFedDate: '',
            feedingFrequencyDays: '',
            lastMaintenanceDate: '',
            maintenanceFrequencyDays: '',
            careTasks: [],
            animalCareTasks: [],
            milestones: [],
            breedingRole: 'both',
            isOwned: true,
            isDisplay: true,
            identifiers: [],
            microchipNumber: '',
            pedigreeRegistrationId: '',
            colonyId: '',
            breed: '',
            strain: '',
            coatPattern: '',
            phenotype: '',
            morph: '',
            markings: '',
            eyeColor: '',
            nailColor: '',
            size: '',
            carrierTraits: '',
            bodyWeight: '',
            bodyLength: '',
            heightAtWithers: '',
            bodyConditionScore: '',
            origin: 'Captive-bred',
            isNeutered: false,
            isInfertile: false,
            heatStatus: '',
            lastHeatDate: '',
            ovulationDate: '',
            matingDate: '',
            expectedDueDate: '',
            litterCount: '',
            litterSizeBorn: '',
            litterSizeWeaned: '',
            stillbornCount: '',
            nursingStartDate: '',
            weaningDate: '',
            isStudAnimal: false,
            availableForBreeding: false,
            studFeeCurrency: 'USD',
            studFeeAmount: '',
            isForSale: false,
            salePriceCurrency: 'USD',
            salePriceAmount: '',
            fertilityStatus: '',
            lastMatingDate: '',
            successfulMatings: '',
            fertilityNotes: '',
            isDamAnimal: false,
            damFertilityStatus: '',
            lastPregnancyDate: '',
            offspringCount: '',
            breedingRecords: [],
            damFertilityNotes: '',
            medicalConditions: '',
            allergies: '',
            medications: '',
            vetVisits: '',
            primaryVet: '',
            dietType: '',
            feedingSchedule: '',
            supplements: '',
            housingType: '',
            bedding: '',
            temperatureRange: '',
            humidity: '',
            lighting: '',
            noise: '',
            enrichment: '',
            temperament: '',
            handlingTolerance: '',
            socialStructure: '',
            activityCycle: '',
            lifeStage: '',
            causeOfDeath: '',
            necropsyResults: '',
            insurance: '',
            legalStatus: '',
            keeperHistory: [],
            showTitles: '',
            showRatings: '',
            judgeComments: '',
            workingTitles: '',
            performanceScores: '',
            chestGirth: '',
            adultWeight: '',
            licenseNumber: '',
            licenseJurisdiction: '',
            tattooId: '',
            RingId: '',
            eartagNumber: '',
            estrusCycleLength: '',
            gestationLength: '',
            artificialInseminationUsed: false,
            whelpingDate: '',
            queeningDate: '',
            deliveryMethod: '',
            reproductiveComplications: '',
            reproductiveClearances: '',
            spayNeuterDate: '',
            parasitePreventionSchedule: '',
            heartwormStatus: '',
            hipElbowScores: '',
            geneticTestResults: '',
            eyeClearance: '',
            cardiacClearance: '',
            dentalRecords: '',
            chronicConditions: '',
            exerciseRequirements: '',
            dailyExerciseMinutes: '',
            groomingNeeds: '',
            sheddingLevel: '',
            crateTrained: false,
            litterTrained: false,
            leashTrained: false,
            freeFlightTrained: false,
            trainingLevel: '',
            trainingDisciplines: '',
            certifications: '',
            workingRole: '',
            behavioralIssues: '',
            biteHistory: '',
            reactivityNotes: '',
            endOfLifeCareNotes: '',
            coOwnership: '',
            transferHistory: '',
            breedingRestrictions: '',
            exportRestrictions: '',
            purchaseDate: '',
            purchaseLocation: '',
            legalDocuments: [],
            growthRecords: [],
            measurementUnits: { weight: 'g', length: 'cm' },
            healthStatus: 'Unknown',
            quarantineStatus: { active: false },
            vaccinations: [],
            dewormingRecords: [],
            parasiteControl: [],
            medicalProcedures: [],
            labResults: [],
            ownerId_public: null,
            ringId: ''
        }
    );

    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        const initialImages = [];
        if (animalToEdit) {
            const primaryUrl = animalToEdit.imageUrl || animalToEdit.photoUrl;
            if (primaryUrl) {
                initialImages.push({ id: `existing-${primaryUrl}`, url: primaryUrl, file: null });
            }
            const extraUrls = (animalToEdit.extraImages || []).filter(url => url !== primaryUrl);
            extraUrls.forEach((url, index) => {
                initialImages.push({ id: `existing-${url}-${index}`, url: url, file: null });
            });
        }
        setGalleryImages(initialImages);
    }, [animalToEdit]);

    useEffect(() => {
        if (formData.breederId_public) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.breederId_public}&limit=1`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setBreederInfo(res.data[0]);
                    }
                })
                .catch(err => console.error('Failed to fetch breeder info', err));
        } else {
            setBreederInfo(null);
        }
    }, [formData.breederId_public, API_BASE_URL]);

    useEffect(() => {
        if (formData.ownerId_public) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.ownerId_public}&limit=1`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setOwnerInfo(res.data[0]);
                    }
                })
                .catch(err => console.error('Failed to fetch owner info', err));
        } else {
            setOwnerInfo(null);
        }
    }, [formData.ownerId_public, API_BASE_URL]);



    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: `new-${file.name}-${Date.now()}-${Math.random()}`,
                url: URL.createObjectURL(file),
                file: file,
            }));
            setGalleryImages(prevImages => [...prevImages, ...newFiles]);
        }
    };

    const setAsPrimaryImage = (id) => {
        setGalleryImages(prevImages => {
            const imageToMove = prevImages.find(img => img.id === id);
            if (!imageToMove) return prevImages;
            const otherImages = prevImages.filter(img => img.id !== id);
            return [imageToMove, ...otherImages];
        });
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'deceasedDate' && value) {
                updated.status = 'Deceased';
            }
            return updated;
        });
    };

    const handleSelectContact = (selection) => {
        if (assignModalTarget === 'breeder') {
            setFormData(prev => ({
                ...prev,
                breederId_public: selection.userId || null,
                manualBreederName: selection.name || '',
            }));
        } else if (assignModalTarget === 'owner') {
            setFormData(prev => ({
                ...prev,
                ownerId_public: selection.userId || null, // The new linked user ID
                manualownerName: selection.name || '', // The manual name, falls back for display
            }));
        }
        setAssignModalOpen(false);
        setAssignModalTarget(null);
    };

    const clearContactSelection = (target) => {
        if (target === 'breeder') {
            setFormData(prev => ({
                ...prev,
                breederId_public: null,
                manualBreederName: '',
            }));
            setBreederInfo(null);
        } else if (target === 'owner') {
            setFormData(prev => ({
                ...prev,
                ownerId_public: null,
                manualownerName: '',
            }));
            setOwnerInfo(null);
        }
    };

    const addIdentifier = () => {
        if (!newIdentifier.title.trim() || !newIdentifier.value.trim()) {
            showModalMessage('Missing Data', 'Please enter both a title and a value for the identifier.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            identifiers: [...(prev.identifiers || []), { ...newIdentifier }]
        }));
        setNewIdentifier({ title: '', value: '' });
    };

    const removeIdentifier = (index) => {
        setFormData(prev => ({
            ...prev,
            identifiers: (prev.identifiers || []).filter((_, i) => i !== index)
        }));
    };


    const deleteImage = (id) => {
        setGalleryImages(prevImages => prevImages.filter(img => img.id !== id));
    };

    const moveImage = (index, direction) => {
        setGalleryImages(prevImages => {
            const newImages = [...prevImages];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= newImages.length) {
                return newImages; // Out of bounds
            }

            // Swap elements
            [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

            return newImages;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const missingFields = [];
        if (!formData.name?.trim()) missingFields.push('Name (Dashboard tab)');
        if (!formData.species?.trim()) missingFields.push('Species (Dashboard tab)');
        if (!formData.gender?.trim()) missingFields.push('Gender (Dashboard tab)');
        if (!formData.status?.trim()) missingFields.push('Status (Dashboard tab)');

        if (missingFields.length > 0) {
            showModalMessage('Required Fields Missing', `Please fill in the following required fields:\n\n· ${missingFields.join('\n· ')}`);
            setLoading(false);
            return;
        }

        const method = animalToEdit ? 'put' : 'post';
        const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit.id_public}` : `${API_BASE_URL}/animals`;

        try {
            const newImagesToUpload = galleryImages.filter(img => img.file);
            const existingImageUrls = galleryImages.filter(img => !img.file).map(img => img.url);

            const uploadPromises = newImagesToUpload.map(img => {
                const fd = new FormData();
                fd.append('file', img.file);
                fd.append('type', 'animal');
                return axios.post(`${API_BASE_URL}/upload`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` }
                }).then(res => ({
                    id: img.id,
                    url: res.data.url
                }));
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const uploadedUrlMap = new Map(uploadedImages.map(img => [img.id, img.url]));

            const finalImageUrls = galleryImages.map(img => {
                return img.file ? uploadedUrlMap.get(img.id) : img.url;
            }).filter(Boolean);

            const primaryImageUrl = finalImageUrls[0] || null;
            const extraImages = finalImageUrls.slice(1);

            const payloadToSave = { ...formData };
            payloadToSave.imageUrl = primaryImageUrl;
            payloadToSave.photoUrl = primaryImageUrl;
            payloadToSave.extraImages = extraImages;

            // Serialize array fields
            const arrayFields = ['identifiers', 'vaccinations', 'dewormingRecords', 'parasiteControl', 'medicalProcedures', 'labResults', 'medicalConditions', 'allergies', 'medications', 'vetVisits', 'growthRecords', 'milestones', 'keeperHistory', 'legalDocuments', 'careTasks', 'animalCareTasks'];
            arrayFields.forEach(field => {
                if (Array.isArray(payloadToSave[field]) && payloadToSave[field].length > 0) {
                    payloadToSave[field] = JSON.stringify(payloadToSave[field]);
                } else if (Array.isArray(payloadToSave[field]) && payloadToSave[field].length === 0) {
                    payloadToSave[field] = null; // Send null for empty arrays
                }
            });

            if (Array.isArray(payloadToSave.identifiers)) {
                payloadToSave.identifiers = JSON.stringify(payloadToSave.identifiers);
            }

            if (galleryImages.length === 0) {
                payloadToSave.imageUrl = null;
                payloadToSave.photoUrl = null;
                payloadToSave.extraImages = [];
            }

            await onSave(method, url, payloadToSave);

            if (!animalToEdit) {
                window.dispatchEvent(new Event('animals-changed'));
                showModalMessage('Success', `Animal ${formData.name} successfully added!`);
            }
            onCancel();
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: Info },
        { id: 'identification', label: 'Identification', icon: Hash },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'health', label: 'Health', icon: HeartPulse },
        { id: 'care', label: 'Routine Care', icon: Droplets },
        { id: 'behavior', label: 'Behavior', icon: Brain },
        { id: 'breeding', label: 'Breeding', icon: Users },
        { id: 'pedigree', label: 'Pedigree', icon: Dna },
        { id: 'gallery', label: 'Gallery', icon: Images },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'records', label: 'Records', icon: FileText },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
            <AssignContactModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onSelect={handleSelectContact}
                target={assignModalTarget}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                userProfile={userProfile}
            />
            <form onSubmit={handleSubmit} className="bg-[#e1f2f5] rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-300 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-between">
                        <span>
                            <PlusCircle size={24} className="inline mr-2 text-primary" />
                            {formTitle}
                        </span>
                        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition duration-150 p-2 rounded-lg" title="Cancel">
                            <X size={24} />
                        </button>
                    </h2>
                </div>

                {/* Tabs */}
                <div className="bg-[#e1f2f5] z-10 border-b border-gray-300 px-6 py-2">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded border-2 transition-colors ${activeTab === tab.id ? 'bg-[#F2E4E9] text-black border-gray-300' : 'bg-white text-gray-600 hover:text-gray-800 border-gray-300'}`}
                                title={tab.label}
                            >
                                {React.createElement(tab.icon, { size: 15, className: `inline-block align-middle flex-shrink-0 mr-1 ${tab.color || ''}` })}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'dashboard' && ( // DASHBOARD
                            <div className="flex gap-4">
                                {/* Left Column: Image Upload */}
                                <div className="w-1/4 flex-shrink-0 flex flex-col gap-2">
                                    {(() => {
                                        const mainImage = galleryImages[0];
                                        const thumbnailImages = galleryImages.slice(1, 4);
                                        return (
                                            <>
                                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 relative group">
                                                    {mainImage ? (
                                                        <img src={mainImage.url} alt="Main animal" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-gray-400 flex flex-col items-center gap-2">
                                                            <Camera size={48} />
                                                            <span className="text-sm">No Image</span>
                                                        </div>
                                                    )}
                                                    {mainImage && (
                                                        <button type="button" onClick={() => deleteImage(mainImage.id)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {thumbnailImages.map(img => (
                                                        <button key={img.id} type="button" onClick={() => setAsPrimaryImage(img.id)} className="aspect-square rounded-md overflow-hidden border-2 border-gray-300 relative group focus:outline-none focus:ring-2 focus:ring-primary">
                                                            <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Set as primary">
                                                                <Star size={20} className="text-white" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {Array.from({ length: Math.max(0, 3 - thumbnailImages.length) }).map((_, i) => (
                                                        <div key={`placeholder-${i}`} className="aspect-square bg-gray-100 rounded-md border-2 border-gray-300" />
                                                    ))}
                                                    <label className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition">
                                                        <PlusCircle size={24} />
                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Right Column: Identity Fields */}
                                <div className="w-3/4 flex-1 flex flex-col gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Identity</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Prefix</label>
                                                <input type="text" name="prefix" value={formData.prefix} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Name*</label>
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Suffix</label>
                                                <input type="text" name="suffix" value={formData.suffix} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Gender*</label>
                                                <select name="gender" value={formData.gender} onChange={handleChange} required
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                                                <DatePicker name="birthDate" value={formData.birthDate} onChange={handleChange} maxDate={new Date()}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700">Status*</label>
                                                <select name="status" value={formData.status} onChange={handleChange} required
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-700">Remarks</label>
                                            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="General notes, observations, and records..." />
                                        </div>
                                    </div>

                                    {/* Breeder & Keeper */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('breederOwner')} className="w-full flex justify-between items-center text-left">
                                            <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><User size={16} />Breeder & Owner</h3>
                                            {sectionsCollapsed.breederOwner ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {!sectionsCollapsed.breederOwner && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <ContactDisplayField
                                                                label="Breeder"
                                                                value={breederInfo ? (breederInfo.breederName || breederInfo.personalName) : formData.manualBreederName}
                                                                onEdit={() => { setAssignModalTarget('breeder'); setAssignModalOpen(true); }}
                                                            />
                                                        </div>
                                                        {(breederInfo || formData.manualBreederName) && (
                                                            <button type="button" onClick={() => clearContactSelection('breeder')} className="text-gray-500 hover:text-red-500 transition p-1 mb-1" title="Clear Breeder">
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <ContactDisplayField
                                                                label="Owner"
                                                                value={ownerInfo ? (ownerInfo.breederName || ownerInfo.personalName) : formData.manualownerName}
                                                                onEdit={() => { setAssignModalTarget('owner'); setAssignModalOpen(true); }}
                                                            />
                                                        </div>
                                                        {(ownerInfo || formData.manualownerName) && (
                                                            <button type="button" onClick={() => clearContactSelection('owner')} className="text-gray-500 hover:text-red-500 transition p-1 mb-1" title="Clear Owner">
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700">Co-Ownership Details</label>
                                                        <textarea name="coOwnership" value={formData.coOwnership} onChange={handleChange} rows="2"
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                            placeholder="Co-owner name, terms, breeding rights, etc." />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Availability */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('availability')} className="w-full flex justify-between items-center text-left">
                                            <h3 className="text-base font-semibold text-gray-700">Availability</h3>
                                            {sectionsCollapsed.availability ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {!sectionsCollapsed.availability && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                {/* For Sale */}
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="isForSale" checked={formData.isForSale} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary rounded" />
                                                        <span className="text-xs font-medium text-gray-700">Available for Sale</span>
                                                    </label>
                                                    {formData.isForSale && (
                                                        <div className="flex gap-2 pl-6">
                                                            <select name="salePriceCurrency" value={formData.salePriceCurrency} onChange={handleChange} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs">
                                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                            </select>
                                                            <input type="number" name="salePriceAmount" value={formData.salePriceAmount} onChange={handleChange} disabled={formData.salePriceCurrency === 'Negotiable'} placeholder="Price" className="flex-1 py-1.5 px-2 border border-gray-300 rounded-md text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* For Stud */}
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="availableForBreeding" checked={formData.availableForBreeding} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary rounded" />
                                                        <span className="text-xs font-medium text-gray-700">Available for Stud/Breeding</span>
                                                    </label>
                                                    {formData.availableForBreeding && (
                                                        <div className="flex gap-2 pl-6">
                                                            <select name="studFeeCurrency" value={formData.studFeeCurrency} onChange={handleChange} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs">
                                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                            </select>
                                                            <input type="number" name="studFeeAmount" value={formData.studFeeAmount} onChange={handleChange} disabled={formData.studFeeCurrency === 'Negotiable'} placeholder="Fee" className="flex-1 py-1.5 px-2 border border-gray-300 rounded-md text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'identification' && (
                            <div className="space-y-4">
                                {/* Identification Numbers */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Breeder Assigned ID</label>
                                            <input type="text" name="breederAssignedId" value={formData.breederAssignedId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Microchip Number</label>
                                            <input type="text" name="microchipNumber" value={formData.microchipNumber || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Pedigree Registration ID</label>
                                            <input type="text" name="pedigreeRegistrationId" value={formData.pedigreeRegistrationId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Colony ID</label>
                                            <input type="text" name="colonyId" value={formData.colonyId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Tattoo ID</label>
                                            <input type="text" name="tattooId" value={formData.tattooId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Ring ID</label>
                                            <input type="text" name="ringId" value={formData.ringId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Ear Tag</label>
                                            <input type="text" name="eartagNumber" value={formData.eartagNumber || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    {/* Additional Identifiers */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Additional Identifiers</h4>
                                        {(formData.identifiers || []).map((identifier, index) => (
                                            <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-white border rounded-md">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input type="text" value={identifier.title} readOnly className="text-sm p-1 bg-gray-100 border-gray-200 rounded" />
                                                    <input type="text" value={identifier.value} readOnly className="text-sm p-1 bg-gray-100 border-gray-200 rounded" />
                                                </div>
                                                <button type="button" onClick={() => removeIdentifier(index)} className="p-1 text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 p-2 bg-white border border-dashed rounded-md">
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Identifier Title (e.g., DNA ID)"
                                                    value={newIdentifier.title}
                                                    onChange={(e) => setNewIdentifier({ ...newIdentifier, title: e.target.value })}
                                                    className="text-sm p-1 border-gray-300 rounded"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Identifier Value"
                                                    value={newIdentifier.value}
                                                    onChange={(e) => setNewIdentifier({ ...newIdentifier, value: e.target.value })}
                                                    className="text-sm p-1 border-gray-300 rounded"
                                                />
                                            </div>
                                            <button type="button" onClick={addIdentifier} className="p-1 text-green-600 hover:text-green-700">
                                                <PlusCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Classification */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Species</label>
                                            <input type="text" value={formData.species} disabled
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600" />
                                            <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Breed</label>
                                            <input type="text" name="breed" value={formData.breed || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Strain</label>
                                            <input type="text" name="strain" value={formData.strain || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="e.g., C57BL/6, Wistar, Syrian" />
                                        </div>
                                    </div>
                                </div>

                                {/* Origin */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2 mb-2"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                    <label className="block text-xs font-medium text-gray-700">Origin</label>
                                    <select name="origin" value={formData.origin || ''} onChange={handleChange}
                                        className="block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Origin</option>
                                        <option value="Captive-bred">Captive-bred</option>
                                        <option value="Wild-caught">Wild-caught</option>
                                        <option value="Rescue">Rescue</option>
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2 mb-2"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tags (Lines, Enclosures, etc)</label>
                                    <input type="text" placeholder="Type and press Enter or comma to add tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); const trimmed = tagInput.trim(); if (trimmed && !formData.tags.includes(trimmed)) { setFormData({ ...formData, tags: [...formData.tags, trimmed] }); setTagInput(''); } } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) { setFormData({ ...formData, tags: formData.tags.slice(0, -1) }); } }} onBlur={() => { const trimmed = tagInput.trim(); if (trimmed && !formData.tags.includes(trimmed)) { setFormData({ ...formData, tags: [...formData.tags, trimmed] }); setTagInput(''); } }} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    {formData.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.tags.map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center bg-primary text-black text-xs font-semibold px-3 py-1 rounded-full">
                                                    {tag}
                                                    <button type="button" onClick={() => { const newTags = formData.tags.filter((_, i) => i !== idx); setFormData({ ...formData, tags: newTags }); }} className="ml-2 text-black hover:text-gray-600"><Trash2 size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <FormSection title="Appearance" icon={<Palette size={16} />} initiallyOpen>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div><label className="block text-xs font-medium text-gray-700">Color</label><input type="text" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"/></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Coat Pattern</label><input type="text" name="coatPattern" value={formData.coatPattern} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"/></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Coat</label><input type="text" name="coat" value={formData.coat} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"/></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Markings</label><input type="text" name="markings" value={formData.markings} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"/></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Eye Color</label><input type="text" name="eyeColor" value={formData.eyeColor} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"/></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Carrier Traits</label><input type="text" name="carrierTraits" value={formData.carrierTraits} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md"/></div>
                                    </div>
                                </FormSection>
                                <FormSection title="Genetic Code" icon={<Dna size={16} />}>
                                    <GeneticCodeBuilder species={formData.species} gender={formData.gender} value={formData.geneticCode} onChange={(v) => setFormData(p => ({ ...p, geneticCode: v }))} />
                                </FormSection>
                                <FormSection title="Life Stage & Measurements" icon={<Ruler size={16} />}>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Life Stage</label>
                                        <select name="lifeStage" value={formData.lifeStage} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                            <option value="">Unknown</option><option value="Newborn">Newborn</option><option value="Juvenile">Juvenile</option><option value="Sub-Adult">Sub-Adult</option><option value="Adult">Adult</option><option value="Senior">Senior</option>
                                        </select>
                                    </div>
                                    {/* Growth records would go here */}
                                </FormSection>
                            </div>
                        )}

                        {activeTab === 'gallery' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Gallery Management</h3>
                                <p className="text-sm text-gray-500">
                                    Use the arrows to reorder images. The first image is the primary one. Click the star to move an image to the first position.
                                </p>
                                {galleryImages.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium">No images yet</p>
                                        <p className="text-xs mt-1">Add images using the uploader in the main section.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {galleryImages.map((img, index) => (
                                            <div key={img.id} className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-gray-100
                                                ${index === 0 ? 'border-primary' : 'border-gray-200'}`}>
                                                <img src={img.url} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAsPrimaryImage(img.id)}
                                                        className={`p-2 rounded-full transition-colors ${index === 0 ? 'bg-primary text-black' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                                        title="Set as primary image"
                                                    >
                                                        <Star size={18} fill={index === 0 ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'left')}
                                                            disabled={index === 0}
                                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                                                            title="Move left"
                                                        >
                                                            <ArrowLeft size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'right')}
                                                            disabled={index === galleryImages.length - 1}
                                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                                                            title="Move right"
                                                        >
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                    <button type="button" onClick={() => deleteImage(img.id)} className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600" title="Delete image">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1.5 py-0.5 font-bold">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Placeholder for other new tabs */}
                        {activeTab === 'health' && (
                            <div className="space-y-4">
                                <FormSection title="Preventive Care" icon={<Shield size={16} />} initiallyOpen>
                                    {/* Vaccinations */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Vaccinations</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newVaccination.date} onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newVaccination.name} onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })} placeholder="Vaccination Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newVaccination.notes} onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addVaccination} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Vaccination</button>
                                        </div>
                                        {(formData.vaccinations || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.name} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('vaccinations', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                    {/* Deworming */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Deworming</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newDeworming.date} onChange={(e) => setNewDeworming({ ...newDeworming, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newDeworming.medication} onChange={(e) => setNewDeworming({ ...newDeworming, medication: e.target.value })} placeholder="Medication" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newDeworming.notes} onChange={(e) => setNewDeworming({ ...newDeworming, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addDeworming} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Deworming</button>
                                        </div>
                                        {(formData.dewormingRecords || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.medication} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('dewormingRecords', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                </FormSection>

                                <FormSection title="Procedures & Diagnostics" icon={<Microscope size={16} />}>
                                    {/* Medical Procedures */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Medical Procedures</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newProcedure.date} onChange={(e) => setNewProcedure({ ...newProcedure, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newProcedure.name} onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })} placeholder="Procedure Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newProcedure.notes} onChange={(e) => setNewProcedure({ ...newProcedure, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addMedicalProcedure} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Procedure</button>
                                        </div>
                                        {(formData.medicalProcedures || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.name} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('medicalProcedures', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                    {/* Lab Results */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Lab Results</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newLabResult.date} onChange={(e) => setNewLabResult({ ...newLabResult, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newLabResult.testName} onChange={(e) => setNewLabResult({ ...newLabResult, testName: e.target.value })} placeholder="Test Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newLabResult.result} onChange={(e) => setNewLabResult({ ...newLabResult, result: e.target.value })} placeholder="Result" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addLabResult} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Lab Result</button>
                                        </div>
                                        {(formData.labResults || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.testName} - {rec.result}</span><button type="button" onClick={() => removeArrayItem('labResults', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                </FormSection>

                                <FormSection title="Active Medical Records" icon={<Pill size={16} />}>
                                    {/* Medical Conditions */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700">Medical Conditions</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <input type="text" value={newMedicalCondition.name} onChange={(e) => setNewMedicalCondition({ ...newMedicalCondition, name: e.target.value })} placeholder="Condition Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newMedicalCondition.notes} onChange={(e) => setNewMedicalCondition({ ...newMedicalCondition, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addMedicalCondition} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Condition</button>
                                        </div>
                                        {(formData.medicalConditions || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.name} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('medicalConditions', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                    {/* Allergies */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Allergies</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <input type="text" value={newAllergy.name} onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })} placeholder="Allergy Name" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newAllergy.notes} onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addAllergy} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Allergy</button>
                                        </div>
                                        {(formData.allergies || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.name} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('allergies', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                </FormSection>

                                <FormSection title="Veterinary Care" icon={<Stethoscope size={16} />}>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Primary Veterinarian</label>
                                        <input type="text" name="primaryVet" value={formData.primaryVet} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                    </div>
                                    {/* Vet Visits */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700">Veterinary Visits</h4>
                                        <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <DatePicker value={newVetVisit.date} onChange={(e) => setNewVetVisit({ ...newVetVisit, date: e.target.value })} className="py-1.5 px-2 text-sm" />
                                                <input type="text" value={newVetVisit.reason} onChange={(e) => setNewVetVisit({ ...newVetVisit, reason: e.target.value })} placeholder="Reason for visit" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                <input type="text" value={newVetVisit.notes} onChange={(e) => setNewVetVisit({ ...newVetVisit, notes: e.target.value })} placeholder="Notes" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            </div>
                                            <button type="button" onClick={addVetVisit} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Vet Visit</button>
                                        </div>
                                        {(formData.vetVisits || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.date}: {rec.reason} {rec.notes && `(${rec.notes})`}</span><button type="button" onClick={() => removeArrayItem('vetVisits', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                    </div>
                                </FormSection>

                                <FormSection title="End of Life" icon={<Scale size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Date of Death</label>
                                            <DatePicker name="deceasedDate" value={formData.deceasedDate} onChange={handleChange} maxDate={new Date()} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Cause of Death</label>
                                            <input type="text" name="causeOfDeath" value={formData.causeOfDeath} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Necropsy Results</label>
                                            <textarea name="necropsyResults" value={formData.necropsyResults} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'care' && (
                            <div className="space-y-4">
                                <FormSection title="Nutrition" icon={<UtensilsCrossed size={16} />} initiallyOpen>
                                    <div><label className="block text-xs font-medium text-gray-700">Diet Type</label><input type="text" name="dietType" value={formData.dietType} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Feeding Schedule</label><textarea name="feedingSchedule" value={formData.feedingSchedule} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Supplements</label><textarea name="supplements" value={formData.supplements} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                </FormSection>
                                <FormSection title="Housing & Environment" icon={<Home size={16} />}>
                                    <div><label className="block text-xs font-medium text-gray-700">Housing Type</label><input type="text" name="housingType" value={formData.housingType} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Bedding/Substrate</label><input type="text" name="bedding" value={formData.bedding} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Temperature Range</label><input type="text" name="temperatureRange" value={formData.temperatureRange} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Humidity</label><input type="text" name="humidity" value={formData.humidity} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                </FormSection>
                                <FormSection title="Grooming" icon={<Scissors size={16} />}>
                                    <div><label className="block text-xs font-medium text-gray-700">Grooming Needs</label><input type="text" name="groomingNeeds" value={formData.groomingNeeds} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Shedding Level</label><input type="text" name="sheddingLevel" value={formData.sheddingLevel} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'behavior' && (
                            <div className="space-y-4">
                                <FormSection title="Behavior & Temperament" icon={<MessageSquare size={16} />} initiallyOpen>
                                    <div><label className="block text-xs font-medium text-gray-700">Temperament</label><input type="text" name="temperament" value={formData.temperament} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Friendly, skittish, aggressive, calm" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Handling Tolerance</label><input type="text" name="handlingTolerance" value={formData.handlingTolerance} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Enjoys handling, tolerates briefly" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Social Structure</label><textarea name="socialStructure" value={formData.socialStructure} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Lives with 2 cage mates, solitary" /></div>
                                </FormSection>
                                <FormSection title="Activity & Training" icon={<Activity size={16} />}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Activity Cycle</label>
                                            <select name="activityCycle" value={formData.activityCycle} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option value="">Select...</option>
                                                <option value="Diurnal">Diurnal (day active)</option>
                                                <option value="Nocturnal">Nocturnal (night active)</option>
                                                <option value="Crepuscular">Crepuscular (dawn/dusk)</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-xs font-medium text-gray-700">Exercise Requirements</label><input type="text" name="exerciseRequirements" value={formData.exerciseRequirements} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                        <div><label className="block text-xs font-medium text-gray-700">Daily Exercise (min)</label><input type="number" name="dailyExerciseMinutes" value={formData.dailyExerciseMinutes} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    </div>
                                    <div><label className="block text-xs font-medium text-gray-700">Training Level</label><input type="text" name="trainingLevel" value={formData.trainingLevel} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Training Disciplines</label><input type="text" name="trainingDisciplines" value={formData.trainingDisciplines} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <label className="flex items-center gap-2"><input type="checkbox" name="crateTrained" checked={!!formData.crateTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Crate Trained</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="litterTrained" checked={!!formData.litterTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Litter Trained</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="leashTrained" checked={!!formData.leashTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Leash Trained</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="freeFlightTrained" checked={!!formData.freeFlightTrained} onChange={handleChange} className="form-checkbox h-4 w-4" /> Free-Flight Trained</label>
                                    </div>
                                </FormSection>
                                <FormSection title="Known Issues" icon={<AlertTriangle size={16} />}>
                                    <div><label className="block text-xs font-medium text-gray-700">Behavioral Issues</label><textarea name="behavioralIssues" value={formData.behavioralIssues} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="e.g., Resource guarding, separation anxiety" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Bite History</label><textarea name="biteHistory" value={formData.biteHistory} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Any bite incidents, context, and outcome" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Reactivity Notes</label><textarea name="reactivityNotes" value={formData.reactivityNotes} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" placeholder="Triggers, thresholds, management strategies" /></div>
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'breeding' && (
                            <div className="space-y-4">
                                <FormSection title="Add Breeding Record" icon={<Egg size={16} />} initiallyOpen>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Breeding Method</label>
                                            <select name="breedingMethod" value={newBreedingRecord.breedingMethod} onChange={(e) => setNewBreedingRecord(p => ({ ...p, breedingMethod: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option>Natural</option><option>AI</option><option>Assisted</option><option>Unknown</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Mating Date</label>
                                            <DatePicker value={newBreedingRecord.matingDate} onChange={(e) => setNewBreedingRecord(p => ({ ...p, matingDate: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Mate</label>
                                            {mateInfo ? (
                                                <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-white">
                                                    <span className="flex-1">{[mateInfo.prefix, mateInfo.name, mateInfo.suffix].filter(Boolean).join(' ')} ({mateInfo.id_public})</span>
                                                    <button type="button" onClick={clearMateSelection} className="text-red-500"><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input type="text" value={newBreedingRecord.mate} onChange={(e) => setNewBreedingRecord(p => ({ ...p, mate: e.target.value, mateAnimalId: null }))} placeholder="Enter mate name manually" className="flex-1 py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                                    <button type="button" onClick={() => { setParentSearchModalConfig({ title: 'Select Mate', onSelect: handleSelectMate, requiredGender: formData.gender === 'Male' ? ['Female', 'Intersex', 'Unknown'] : ['Male', 'Intersex', 'Unknown'] }); setParentSearchModalOpen(true); }} className="px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Select from DB</button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Outcome</label>
                                            <select name="outcome" value={newBreedingRecord.outcome} onChange={(e) => setNewBreedingRecord(p => ({ ...p, outcome: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md">
                                                <option>Successful</option><option>Unsuccessful</option><option>Pending</option><option>Unknown</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Birth/Lay Date</label>
                                            <DatePicker value={newBreedingRecord.birthEventDate} onChange={(e) => setNewBreedingRecord(p => ({ ...p, birthEventDate: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Litter Size</label>
                                            <input type="number" value={newBreedingRecord.litterSizeBorn} onChange={(e) => setNewBreedingRecord(p => ({ ...p, litterSizeBorn: e.target.value }))} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Notes</label>
                                            <textarea value={newBreedingRecord.notes} onChange={(e) => setNewBreedingRecord(p => ({ ...p, notes: e.target.value }))} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addBreedingRecord} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-sm font-medium mt-2">Add Breeding Record</button>
                                </FormSection>

                                <FormSection title="Breeding History" icon={<ClipboardList size={16} />}>
                                    {(formData.breedingRecords || []).length === 0 ? (
                                        <p className="text-sm text-gray-500">No breeding records yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {(formData.breedingRecords || []).map((rec, i) => (
                                                <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 text-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">Mate: {rec.mate || rec.mateAnimalId}</p>
                                                            <p className="text-xs text-gray-500">Mating Date: {rec.matingDate || 'N/A'}</p>
                                                        </div>
                                                        <button type="button" onClick={() => removeArrayItem('breedingRecords', i)}><Trash2 size={14} className="text-red-500" /></button>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t text-xs grid grid-cols-2 gap-1">
                                                        <p><strong>Outcome:</strong> {rec.outcome}</p>
                                                        <p><strong>Birth/Lay Date:</strong> {rec.birthEventDate || 'N/A'}</p>
                                                        <p><strong>Litter Size:</strong> {rec.litterSizeBorn || 'N/A'}</p>
                                                        <p><strong>Method:</strong> {rec.breedingMethod}</p>
                                                        {rec.notes && <p className="col-span-2"><strong>Notes:</strong> {rec.notes}</p>}
                                                    </div>
                                                    <div className="mt-2 flex gap-2">
                                                        <button type="button" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Create Litter</button>
                                                        <button type="button" className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Link Litter</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </FormSection>
                            </div>
                        )}
                        {activeTab === 'pedigree' && <div className="text-center p-8 bg-gray-50 rounded-lg">Pedigree Fields Go Here</div>}
                        {activeTab === 'timeline' && <div className="text-center p-8 bg-gray-50 rounded-lg">Timeline/Events Go Here</div>}
                        {activeTab === 'records' && (
                            <div className="space-y-4">
                                <FormSection title="Milestones" icon={<Bell size={16} />} initiallyOpen>
                                    <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input type="text" value={newMilestoneLabel} onChange={e => setNewMilestoneLabel(e.target.value)} placeholder="Milestone Label" className="py-1.5 px-2 text-sm border border-gray-300 rounded-md" />
                                            <DatePicker value={newMilestoneDate} onChange={(e) => setNewMilestoneDate(e.target.value)} className="py-1.5 px-2 text-sm" />
                                        </div>
                                        <button type="button" onClick={addMilestone} className="w-full px-3 py-1.5 bg-primary text-black rounded-md text-xs font-medium">Add Milestone</button>
                                    </div>
                                    {(formData.milestones || []).map((rec, i) => <div key={i} className="flex justify-between items-center text-xs p-1.5 bg-white rounded border"><span>{rec.startDate}: {rec.label}</span><button type="button" onClick={() => removeArrayItem('milestones', i)}><Trash2 size={14} className="text-red-500" /></button></div>)}
                                </FormSection>
                                <FormSection title="Show & Performance" icon={<Trophy size={16} />}>
                                    <div><label className="block text-xs font-medium text-gray-700">Show Titles</label><textarea name="showTitles" value={formData.showTitles} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Working Titles</label><textarea name="workingTitles" value={formData.workingTitles} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                </FormSection>
                                <FormSection title="Legal & Documentation" icon={<FileCheck size={16} />}>
                                    <div><label className="block text-xs font-medium text-gray-700">License Number</label><input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">License Jurisdiction</label><input type="text" name="licenseJurisdiction" value={formData.licenseJurisdiction} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Insurance</label><input type="text" name="insurance" value={formData.insurance} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Legal Status</label><input type="text" name="legalStatus" value={formData.legalStatus} onChange={handleChange} className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Breeding Restrictions</label><textarea name="breedingRestrictions" value={formData.breedingRestrictions} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700">Export Restrictions</label><textarea name="exportRestrictions" value={formData.exportRestrictions} onChange={handleChange} rows="2" className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md" /></div>
                                </FormSection>
                            </div>
                        )}
                    </div>
                </div>

                {parentSearchModalOpen && (
                    <ParentSearchModal
                        title={parentSearchModalConfig.title}
                        currentId={animalToEdit?.id_public}
                        onSelect={parentSearchModalConfig.onSelect}
                        onClose={() => setParentSearchModalOpen(false)}
                        authToken={authToken}
                        API_BASE_URL={API_BASE_URL}
                        showModalMessage={showModalMessage}
                        requiredGender={parentSearchModalConfig.requiredGender}
                        species={formData.species}
                    />
                )}
                {/* Footer */}
                <div className="p-6 border-t border-gray-300 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                                <ArrowLeft size={18} />
                                <span>Cancel</span>
                            </button>
                            {animalToEdit && onDelete && (
                                <button type="button" onClick={() => onDelete(animalToEdit.id_public)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2 disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>{loading ? 'Saving...' : 'Save Animal'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AnimalFormTestModal;