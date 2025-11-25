import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw, User, ClipboardList, BookOpen, Settings, Mail, Globe, Egg, Milk, Search, X } from 'lucide-react';

// --- Global Constants ---
const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api';

// UPDATED: 'Breeding' changed to 'Breeder'
const GENDER_OPTIONS = ['Male', 'Female'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Retired', 'Deceased']; 

// NEW: Default Species Options
const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Rat', 'Hamster'];

// UPDATED: Removed SPECIES_OPTIONS constant here.

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

// --- Helper Components ---

// Simple message box to replace alerts and confirmation prompts
const ModalMessage = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button 
        onClick={onClose} 
        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold py-2 rounded-lg transition duration-150 shadow-md"
      >
        Close
      </button>
    </div>
  </div>
);

// Custom logo component updated to render an image from the public folder
const CustomAppLogo = ({ size = "w-10 h-10" }) => (
  <img 
    src="/logo.png" 
    alt="Crittertrack Logo" 
    className={`${size} shadow-md`} 
  />
);

// Loading Indicator
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

// --- Component: Profile Image Placeholder ---
const ProfileImagePlaceholder = ({ url, onFileChange, disabled }) => (
    <div className="flex flex-col items-center space-y-3">
        <div 
            className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner cursor-pointer" 
            onClick={() => !disabled && document.getElementById('profileImageInput').click()}
        >
            {url ? (
                <img src={url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <User size={50} />
            )}
        </div>
        <input 
            id="profileImageInput" 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={onFileChange} 
            disabled={disabled}
        />
        <button 
            type="button" 
            onClick={() => !disabled && document.getElementById('profileImageInput').click()}
            disabled={disabled}
            className="text-sm text-primary hover:text-primary-dark transition duration-150 disabled:opacity-50"
        >
            {url ? "Change Image" : "Upload Image"}
        </button>
    </div>
);

// --- Component: Animal Image Upload (NEW) ---
const AnimalImageUpload = ({ imageUrl, onFileChange, disabled }) => (
    <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-gray-50">
        <h4 className="font-semibold text-gray-700">Animal Photo (Optional)</h4>
        <div 
            className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner cursor-pointer" 
            onClick={() => !disabled && document.getElementById('animalImageInput').click()}
        >
            {imageUrl ? (
                <img src={imageUrl} alt="Animal" className="w-full h-full object-cover" />
            ) : (
                <Cat size={60} />
            )}
        </div>
        <input 
            id="animalImageInput" 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={onFileChange} 
            disabled={disabled}
        />
        <button 
            type="button" 
            onClick={() => !disabled && document.getElementById('animalImageInput').click()}
            disabled={disabled}
            className="text-sm text-primary hover:text-primary-dark transition duration-150 disabled:opacity-50"
        >
            {imageUrl ? "Change Image" : "Upload Image"}
        </button>
    </div>
);


// --- Pedigree Search Modal (NEW) ---
const PedigreeSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    
    // Simple component to render a list item
    const SearchResultItem = ({ animal, isGlobal }) => (
        <div className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(animal.id_public)}>
            <div>
                <p className="font-semibold text-gray-800">{animal.prefix} {animal.name} (CT-{animal.id_public})</p>
                <p className="text-sm text-gray-600">
                    {animal.species} | {animal.gender} | {animal.status}
                </p>
            </div>
            {isGlobal && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Global Breeder</span>}
        </div>
    );

    const handleSearch = async () => {
        if (!searchTerm) {
            setLocalAnimals([]);
            setGlobalAnimals([]);
            return;
        }

        // 1. Search Local Animals
        setLoadingLocal(true);
        try {
            const localResponse = await axios.get(`${API_BASE_URL}/animals?name=${searchTerm}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Filter out current animal and ensure status is compatible (e.g., not Deceased)
            const filteredLocal = localResponse.data.filter(a => a.id_public !== currentId);
            setLocalAnimals(filteredLocal);
        } catch (error) {
            showModalMessage('Search Error', 'Failed to search your animals.');
            setLocalAnimals([]);
        } finally {
            setLoadingLocal(false);
        }

        // 2. Search Global Display Animals
        setLoadingGlobal(true);
        try {
            // Assuming an endpoint for global search that filters for 'display' status
            const globalResponse = await axios.get(`${API_BASE_URL}/global/animals?name=${searchTerm}&display=true`);
            const filteredGlobal = globalResponse.data.filter(a => a.id_public !== currentId);
            setGlobalAnimals(filteredGlobal);
        } catch (error) {
            // Silently fail if global search isn't implemented or fails
            setGlobalAnimals([]);
        } finally {
            setLoadingGlobal(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Search Bar */}
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search by Animal Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loadingLocal || loadingGlobal}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loadingLocal || loadingGlobal ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner /> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    
                    {/* Global Results */}
                    {loadingGlobal ? <LoadingSpinner /> : globalAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Display Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}

                    {searchTerm && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && (
                        <p className="text-center text-gray-500 py-4">No animals found matching your search term.</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <button 
                        onClick={() => onSelect(null)} 
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear {title} ID
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Component: Species Manager (NEW) ---
const SpeciesManager = ({ speciesOptions, setSpeciesOptions, onCancel, showModalMessage }) => {
    const [newSpeciesName, setNewSpeciesName] = useState('');
    
    // Filter out defaults to only allow managing custom species
    const customSpecies = speciesOptions.filter(s => !DEFAULT_SPECIES_OPTIONS.includes(s));
    
    // New species is considered custom, so we add it only to the custom list
    const handleAddSpecies = (e) => {
        e.preventDefault();
        const trimmedName = newSpeciesName.trim();
        if (trimmedName && !speciesOptions.includes(trimmedName)) {
            setSpeciesOptions(prev => [...prev, trimmedName]);
            setNewSpeciesName('');
            showModalMessage('Success', `Custom species "${trimmedName}" added.`);
        } else if (speciesOptions.includes(trimmedName)) {
            showModalMessage('Warning', `Species "${trimmedName}" already exists.`);
        }
    };

    const handleDeleteSpecies = (speciesToDelete) => {
        if (window.confirm(`Are you sure you want to delete the custom species "${speciesToDelete}"? This action cannot be undone.`)) {
            setSpeciesOptions(prev => prev.filter(s => s !== speciesToDelete));
            showModalMessage('Deleted', `Species "${speciesToDelete}" has been removed.`);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings size={20} className="mr-2 text-primary-dark" />
                Manage Custom Species
            </h2>

            {/* Add New Species Form */}
            <form onSubmit={handleAddSpecies} className="flex space-x-3 mb-6 p-4 border rounded-lg bg-gray-50">
                <input
                    type="text"
                    placeholder="Enter new species name..."
                    value={newSpeciesName}
                    onChange={(e) => setNewSpeciesName(e.target.value)}
                    required
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                />
                <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center"
                >
                    <PlusCircle size={18} className="mr-2" /> Add
                </button>
            </form>

            {/* Species List */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Your Species List</h3>
                
                {/* Default Species (Cannot be deleted) */}
                {DEFAULT_SPECIES_OPTIONS.map(species => (
                    <div key={species} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                        <span className="font-medium text-gray-600">{species} (Default)</span>
                        <span className="text-sm text-gray-400">Locked</span>
                    </div>
                ))}

                {/* Custom Species (Can be deleted) */}
                {customSpecies.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No custom species added yet.</p>
                ) : (
                    customSpecies.map(species => (
                        <div key={species} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                            <span className="font-medium text-gray-800">{species}</span>
                            <button
                                onClick={() => handleDeleteSpecies(species)}
                                className="text-red-500 hover:text-red-700 p-1 transition"
                                title="Delete Custom Species"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button
                    onClick={onCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to Selector
                </button>
            </div>
        </div>
    );
};


// --- Component: Species Selector (NEW) ---
const SpeciesSelector = ({ speciesOptions, onSelectSpecies, onManageSpecies }) => (
    <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <Cat size={24} className="mr-3 text-primary-dark" />
            Select Species for New Animal
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {speciesOptions.map(species => (
                <button
                    key={species}
                    onClick={() => onSelectSpecies(species)}
                    className="p-6 border-2 border-primary-dark text-lg font-semibold text-gray-800 rounded-lg hover:bg-primary/50 transition duration-150 shadow-md bg-primary"
                >
                    {species}
                </button>
            ))}
        </div>

        <div className="mt-8 border-t pt-4">
            <button
                onClick={onManageSpecies}
                className="text-primary-dark hover:text-primary transition duration-150 font-medium flex items-center"
            >
                <Settings size={18} className="mr-2" /> Add/Delete Custom Species
            </button>
        </div>
    </div>
);


// --- Component: Animal List (Stub) ---
const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onSetCurrentView }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(''); 
    const [nameFilter, setNameFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState(''); 
    const [statusFilterPregnant, setStatusFilterPregnant] = useState(false);
    const [statusFilterNursing, setStatusFilterNursing] = useState(false);
    
    // NEW FILTER STATE
    const [ownedFilter, setOwnedFilter] = useState('owned'); // 'all' or 'owned'

    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        try {
            let params = [];
            
            if (statusFilter) {
                params.push(`status=${statusFilter}`);
            }
            if (genderFilter) {
                params.push(`gender=${genderFilter}`);
            }
            if (nameFilter) {
                params.push(`name=${encodeURIComponent(nameFilter)}`);
            }
            if (statusFilterPregnant) {
                params.push(`isPregnant=true`);
            }
            if (statusFilterNursing) {
                params.push(`isNursing=true`);
            }
            
            // NEW: Add owned filter
            if (ownedFilter === 'owned') {
                params.push(`isOwned=true`);
            }

            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            
            const url = `${API_BASE_URL}/animals${queryString}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setAnimals(response.data);
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessage('Error', 'Failed to fetch animal list.');
        } finally {
            setLoading(false);
        }
    }, [authToken, statusFilter, genderFilter, nameFilter, statusFilterPregnant, statusFilterNursing, ownedFilter, showModalMessage]); // Added new filters to dependencies

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

    // NEW: Function to group animals by species
    const groupedAnimals = useMemo(() => {
        return animals.reduce((groups, animal) => {
            const species = animal.species || 'Unspecified Species';
            if (!groups[species]) {
                groups[species] = [];
            }
            groups[species].push(animal);
            return groups;
        }, {});
    }, [animals]);
    
    const speciesNames = Object.keys(groupedAnimals).sort();


    const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
    const handleNameFilterChange = (e) => setNameFilter(e.target.value);
    const handleGenderFilterChange = (gender) => setGenderFilter(gender);
    
    const handleFilterPregnant = () => {
        setStatusFilterPregnant(prev => !prev);
        if (!statusFilterPregnant) {
            setStatusFilterNursing(false); 
        }
    };

    const handleFilterNursing = () => {
        setStatusFilterNursing(prev => !prev);
        if (!statusFilterNursing) {
            setStatusFilterPregnant(false);
        }
    };


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ClipboardList size={24} className="mr-3 text-primary-dark" />
                My Animals
            </h2>

            <div className="space-y-4 mb-6 p-4 border border-gray-100 rounded-lg bg-gray-50">
                
                <div className="flex justify-between items-center space-x-4">
                    {/* 1. Owned/All Filter Toggles (NEW) */}
                    <div className="flex space-x-2">
                        {['Owned', 'All'].map(option => {
                            const value = option.toLowerCase();
                            const isSelected = ownedFilter === value;
                            return (
                                <button
                                    key={value}
                                    onClick={() => setOwnedFilter(value)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${
                                        isSelected 
                                            ? 'bg-primary-dark text-black' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {/* Add New Animal button now redirects to the species selector */}
                    <button
                        // UPDATED: Now sets the view to 'select-species'
                        onClick={() => onSetCurrentView('select-species')}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1 whitespace-nowrap"
                    >
                        <PlusCircle size={18} />
                        <span>Add New Animal</span>
                    </button>
                </div>
                
                {/* 2. Gender Filter Buttons (All/Male/Female) */}
                <div className="flex space-x-2 pt-2 border-t border-gray-200">
                    <span className='text-sm font-medium text-gray-700 self-center'>Gender:</span>
                    {['All', ...GENDER_OPTIONS].map(gender => {
                        const value = gender === 'All' ? '' : gender;
                        const isCurrentSelected = genderFilter === value;
                        
                        let selectedClasses = isCurrentSelected 
                                            ? (gender === 'Male' ? 'bg-primary text-black' : gender === 'Female' ? 'bg-accent text-white' : 'bg-primary-dark text-black')
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                        
                        return (
                            <button
                                key={gender}
                                onClick={() => handleGenderFilterChange(value)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${selectedClasses}`}
                            >
                                {gender}
                            </button>
                        );
                    })}
                </div>

                {/* 3. Breeding Status Filters */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200"> 
                    <span className='text-sm font-medium text-gray-700 self-center mr-2'>Breeding Status:</span>
                    
                    {/* Pregnant Filter Button */}
                    <button
                        onClick={handleFilterPregnant}
                        className={`px-3 py-1 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${
                            statusFilterPregnant 
                                ? 'bg-accent text-white hover:bg-accent/80'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Egg size={16} />
                        <span>Pregnant</span>
                    </button>
                    
                    {/* Nursing Filter Button */}
                    <button
                        onClick={handleFilterNursing}
                        className={`px-3 py-1 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${
                            statusFilterNursing
                                ? 'bg-primary text-black hover:bg-primary-dark'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Milk size={16} />
                        <span>Nursing</span>
                    </button>
                </div>
                
                {/* 4. Status Filter Dropdown and Name Search */}
                <div className="flex space-x-4">
                    
                    {/* Status Filter Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-1/3 min-w-[150px]"
                    >
                        <option value="">All Statuses</option> 
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    {/* Name Search Input */}
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={nameFilter}
                        onChange={handleNameFilterChange}
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition flex-grow"
                    />
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="space-y-6">
                    {Object.keys(groupedAnimals).length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No animals found matching the filters.</p>
                    ) : (
                        speciesNames.map(species => (
                            <div key={species} className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
                                
                                {/* Species Header */}
                                <div className="bg-primary-dark p-3">
                                    <h3 className="text-xl font-bold text-black">{species}</h3>
                                </div>
                                
                                {/* Animal Cards for this species */}
                                <div className="p-4 space-y-3 bg-white">
                                    {groupedAnimals[species].map(animal => (
                                        <div key={animal._id} className="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 transition">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <p className="text-xl font-semibold text-gray-800">
                                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {animal.gender} | {animal.status} | ID: **CT-{animal.id_public}**
                                                    </p>
                                                    <div className='flex items-center space-x-2 mt-1'>
                                                        {animal.isOwned && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Owned</span>
                                                        )}
                                                        {animal.isDisplay && (
                                                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium">Display</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Visual Icons */}
                                                {animal.isPregnant && (
                                                    <div className="p-1 bg-accent/20 text-accent rounded-full" title="Pregnant">
                                                        <Egg size={18} />
                                                    </div>
                                                )}
                                                {animal.isNursing && (
                                                    <div className="p-1 bg-blue-100 text-blue-600 rounded-full" title="Nursing">
                                                        <Milk size={18} />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onEditAnimal(animal)}
                                                className="text-primary hover:text-primary-dark p-2 rounded-full transition"
                                            >
                                                <Edit size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- Component: Add/Edit Animal (Stub) ---
const AnimalForm = ({ animalToEdit, onSave, onCancel, showModalMessage, authToken, species }) => {
    // State to hold the current ID for the PedigreeSearchModal
    const [modalTarget, setModalTarget] = useState(null); // 'father' or 'mother'

    const [formData, setFormData] = useState({
        species: species, // FIXED: Locked to the species passed by prop
        prefix: animalToEdit?.prefix || '',
        name: animalToEdit?.name || '',
        gender: animalToEdit?.gender || GENDER_OPTIONS[0],
        birthDate: animalToEdit?.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
        status: animalToEdit?.status || STATUS_OPTIONS[0],
        color: animalToEdit?.color || '',
        coat: animalToEdit?.coat || '',
        remarks: animalToEdit?.remarks || '',
        geneticCode: animalToEdit?.geneticCode || '',
        fatherId_public: animalToEdit?.fatherId_public || null,
        motherId_public: animalToEdit?.motherId_public || null,
        isPregnant: animalToEdit?.isPregnant || false,
        isNursing: animalToEdit?.isNursing || false,
        // NEW TOGGLES
        isDisplay: animalToEdit?.isDisplay || false,
        isOwned: animalToEdit?.isOwned ?? true, // Default to owned for new animals
    });
    const [loading, setLoading] = useState(false);
    
    // Animal Image State (Stub for file and preview)
    const [animalImageFile, setAnimalImageFile] = useState(null);
    const [animalImageURL, setAnimalImageURL] = useState(animalToEdit?.imageUrl || null);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            const isChecked = checked;
            setFormData(prev => {
                if (name === 'isPregnant' && isChecked) {
                    return { ...prev, isPregnant: isChecked, isNursing: false };
                }
                if (name === 'isNursing' && isChecked) {
                    return { ...prev, isNursing: isChecked, isPregnant: false };
                }
                return { ...prev, [name]: isChecked };
            });
        } else if (name === 'gender') {
            const newFormData = { ...formData, [name]: value };
            if (value === 'Male') {
                newFormData.isPregnant = false;
                newFormData.isNursing = false;
            }
            setFormData(newFormData);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAnimalImageFile(file);
            setAnimalImageURL(URL.createObjectURL(file));
        }
    };

    const handleSelectPedigree = (id) => {
        if (modalTarget === 'father') {
            setFormData(prev => ({ ...prev, fatherId_public: id }));
        } else if (modalTarget === 'mother') {
            setFormData(prev => ({ ...prev, motherId_public: id }));
        }
        setModalTarget(null); // Close modal
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = animalToEdit ? 'put' : 'post';
            const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit._id}` : `${API_BASE_URL}/animals`;

            // Prepare payload (excluding file for now, handling image upload separately/later)
            const payload = {
                ...formData,
                fatherId_public: formData.fatherId_public || null, // Ensure null if cleared
                motherId_public: formData.motherId_public || null,
            };

            await onSave(method, url, payload);
            showModalMessage('Success', `Animal ${animalToEdit ? 'updated' : 'added'} successfully!`);
            onCancel(); 
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };

    const title = animalToEdit ? `Edit: ${animalToEdit.prefix || ''} ${animalToEdit.name}` : 'Add New Animal';
    const currentId = animalToEdit?.id_public;

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            {modalTarget && (
                <PedigreeSearchModal
                    title={modalTarget === 'father' ? 'Sire' : 'Dam'}
                    currentId={currentId}
                    onSelect={handleSelectPedigree}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                />
            )}
            
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Cat size={24} className="mr-3 text-primary-dark" />
                {title}
            </h2>
            
            <div className="text-lg font-semibold text-accent mb-4 p-3 border border-accent rounded-lg bg-accent/10">
                Species: **{species}** (Cannot be changed)
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Image and Basic Details */}
                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
                    <AnimalImageUpload 
                        imageUrl={animalImageURL} 
                        onFileChange={handleImageChange}
                        disabled={loading}
                    />
                    
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input
                            type="text"
                            name="prefix"
                            placeholder="Prefix (Optional)"
                            value={formData.prefix}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg sm:col-span-1"
                        />
                        <input
                            type="text"
                            name="name"
                            placeholder="Name *"
                            value={formData.name}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg sm:col-span-2"
                            required
                        />
                        
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        >
                            {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <input
                            type="date"
                            name="birthDate"
                            placeholder="Birth Date *"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. Ownership & Display Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 sm:col-span-3 border-b pb-2">Record Settings</h3>
                    
                    {/* Owned/Unowned Toggle (NEW) */}
                    <label className="flex items-center space-x-3 text-gray-700">
                        <input
                            type="checkbox"
                            name="isOwned"
                            checked={formData.isOwned}
                            onChange={handleChange}
                            className="rounded text-green-500 focus:ring-green-500 w-5 h-5"
                            disabled={loading}
                        />
                        <span className="font-medium">Owned Animal (Default: On)</span>
                    </label>

                    {/* Display Toggle (NEW) */}
                    <label className="flex items-center space-x-3 text-gray-700">
                        <input
                            type="checkbox"
                            name="isDisplay"
                            checked={formData.isDisplay}
                            onChange={handleChange}
                            className="rounded text-indigo-500 focus:ring-indigo-500 w-5 h-5"
                            disabled={loading}
                        />
                        <span className="font-medium">Public Display Animal</span>
                    </label>

                    {/* Breeding Status Checkboxes */}
                    {(formData.gender === 'Female' && formData.status === 'Breeder') && (
                        <>
                            <label className="flex items-center space-x-2 text-gray-700">
                                <input type="checkbox" name="isPregnant" checked={formData.isPregnant} onChange={handleChange} className="rounded text-accent focus:ring-accent" disabled={loading} />
                                <span className="flex items-center space-x-1"><Egg size={18} className="text-accent" /><span>Pregnant</span></span>
                            </label>
                            <label className="flex items-center space-x-2 text-gray-700">
                                <input type="checkbox" name="isNursing" checked={formData.isNursing} onChange={handleChange} className="rounded text-blue-500 focus:ring-blue-500" disabled={loading} />
                                <span className="flex items-center space-x-1"><Milk size={18} className="text-blue-500" /><span>Nursing</span></span>
                            </label>
                        </>
                    )}
                </div>


                {/* 3. Pedigree Info (Search Modals) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 md:col-span-2 border-b pb-2">Pedigree</h3>
                    
                    {/* Sire (Father) Selector */}
                    <div className='flex flex-col'>
                        <label className='text-sm font-medium text-gray-600 mb-1'>Sire (Father) ID (Optional)</label>
                        <div 
                            onClick={() => setModalTarget('father')}
                            className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition"
                        >
                            <span className={formData.fatherId_public ? "text-gray-800" : "text-gray-400"}>
                                {formData.fatherId_public ? `CT-${formData.fatherId_public}` : 'Click to Search...'}
                            </span>
                            <Search size={18} className="text-gray-400" />
                        </div>
                    </div>
                    
                    {/* Dam (Mother) Selector */}
                    <div className='flex flex-col'>
                        <label className='text-sm font-medium text-gray-600 mb-1'>Dam (Mother) ID (Optional)</label>
                        <div 
                            onClick={() => setModalTarget('mother')}
                            className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition"
                        >
                            <span className={formData.motherId_public ? "text-gray-800" : "text-gray-400"}>
                                {formData.motherId_public ? `CT-${formData.motherId_public}` : 'Click to Search...'}
                            </span>
                            <Search size={18} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* 4. Appearance & Genetics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="color" placeholder="Color" value={formData.color} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg" />
                    <input type="text" name="coat" placeholder="Coat Type" value={formData.coat} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg" />
                    <input type="text" name="geneticCode" placeholder="Genetic Code (Optional)" value={formData.geneticCode} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg" />
                </div>

                {/* 5. Remarks */}
                <textarea
                    name="remarks"
                    placeholder="Remarks/Notes (Optional)"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />

                {/* 6. Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        {animalToEdit ? 'Save Changes' : 'Add Animal'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Component: User Profile Card (Existing, placed on Dashboard) ---
const UserProfileCard = ({ userProfile }) => {
    if (!userProfile) return null;

    const formattedCreationDate = userProfile.createdAt 
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.createdAt))
        : 'N/A';
    
    // Placeholder for profile image
    const ProfileImage = () => (
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
            <User size={40} />
        </div>
    );

    const isPersonalNameVisible = userProfile.showPersonalName ?? true;
    const isBreederNameVisible = userProfile.showBreederName ?? false;


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <ProfileImage />

            <div className="flex-grow text-center sm:text-left">
                
                {/* Personal Name */}
                {isPersonalNameVisible && (
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {userProfile.personalName}
                    </h3>
                )}
                
                {/* Breeder Name */}
                {(isBreederNameVisible && userProfile.breederName) && (
                    <div className="text-xl text-gray-700 font-semibold">
                        {userProfile.breederName}
                    </div>
                )}

                {/* Fallback if both names are hidden */}
                {(!isPersonalNameVisible && !isBreederNameVisible) && (
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">
                        (Name Hidden)
                    </h3>
                )}

                {/* Contact Info (Email and Website) */}
                <div className="mt-4 space-y-1 text-sm text-gray-700">
                    {/* Email */}
                    {((userProfile.showEmailPublic ?? false)) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Mail size={16} className="text-gray-500" />
                            <a href={`mailto:${userProfile.email}`} className="text-gray-700 hover:text-primary transition duration-150">
                                {userProfile.email}
                            </a>
                        </div>
                    )}
                    
                    {/* Website */}
                    {(userProfile.websiteURL && userProfile.showWebsiteURL) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Globe size={16} className="text-gray-500" />
                            <a 
                                href={userProfile.websiteURL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary-dark hover:underline transition duration-150 truncate max-w-full sm:max-w-xs"
                            >
                                {userProfile.websiteURL.replace(/https?:\/\/(www.)?/, '')}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full sm:w-auto sm:text-right space-y-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-6">
                
                {/* ID color is now text-accent (darker pink) */}
                <div className="mb-2"> 
                    <span className="text-2xl font-extrabold text-accent">
                        CT-{userProfile.id_public}
                    </span>
                </div>

                <div className="text-sm text-gray-600">
                    <span className="font-semibold">Member Since:</span> {formattedCreationDate}
                </div>
            </div>
        </div>
    );
};

// --- Component: Profile Edit Form (Existing) ---
const ProfileEditForm = ({ userProfile, showModalMessage, onSaveSuccess, onCancel, authToken }) => {
    // Form states for profile data (to be sent to /users/profile)
    const [personalName, setPersonalName] = useState(userProfile.personalName);
    const [breederName, setBreederName] = useState(userProfile.breederName || '');
    const [showPersonalName, setShowPersonalName] = useState(userProfile.showPersonalName ?? true); 
    const [showBreederName, setShowBreederName] = useState(userProfile.showBreederName ?? false); 
    const [websiteURL, setWebsiteURL] = useState(userProfile.websiteURL || '');
    const [showWebsiteURL, setShowWebsiteURL] = useState(userProfile.showWebsiteURL ?? false);
    const [showEmailPublic, setShowEmailPublic] = useState(userProfile.showEmailPublic ?? false); 

    const [profileImageFile, setProfileImageFile] = useState(null); 
    const [profileImageURL, setProfileImageURL] = useState(null); 
    const [profileLoading, setProfileLoading] = useState(false);

    // Form states for security data (separate updates)
    const [email, setEmail] = useState(userProfile.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Helper for profile image preview
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            setProfileImageURL(URL.createObjectURL(file));
        }
    };

    // 1. Handle Profile Info Update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        
        const payload = {
            personalName: personalName,
            breederName: breederName || null,
            showPersonalName: showPersonalName,
            showBreederName: showBreederName,
            websiteURL: websiteURL || null,
            showWebsiteURL: websiteURL ? showWebsiteURL : false,
            showEmailPublic: showEmailPublic,
        };

        try {
            await axios.put(`${API_BASE_URL}/users/profile`, payload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Profile information updated successfully.');
            await onSaveSuccess(); // Refresh user profile data in App
        } catch (error) {
            console.error('Profile Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update profile information.');
        } finally {
            setProfileLoading(false);
        }
    };

    // 2. Handle Email Update
    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        if (email === userProfile.email) {
            showModalMessage('Info', 'Email is already set to this value.');
            return;
        }

        setSecurityLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/auth/change-email`, { newEmail: email }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Email Changed', 'Your email has been updated. You may need to log in again with the new email.');
            await onSaveSuccess(); // Refresh user profile data in App
        } catch (error) {
            console.error('Email Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update email address.');
            setEmail(userProfile.email); // Revert on failure
        } finally {
            setSecurityLoading(false);
        }
    };
    
    // 3. Handle Password Update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showModalMessage('Warning', 'All password fields are required to change your password.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showModalMessage('Warning', 'New password and confirmation do not match.');
            return;
        }

        setPasswordLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Your password has been changed successfully. You will need to re-login with the new password.');
            
            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

        } catch (error) {
            console.error('Password Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to change password. Check your current password.');
        } finally {
            setPasswordLoading(false);
        }
    };


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Settings size={24} className="mr-3 text-primary-dark" />
                    Edit Profile
                </h2>
                <button
                    onClick={onCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                    disabled={profileLoading || securityLoading || passwordLoading}
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to Profile
                </button>
            </div>


            {/* 1. Personal & Breeder Info Form */}
            <form onSubmit={handleProfileUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">General Information</h3>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <ProfileImagePlaceholder 
                        url={profileImageURL} 
                        onFileChange={handleImageChange}
                        disabled={profileLoading}
                    />

                    <div className="flex-grow space-y-4 w-full">
                        <input
                            type="text"
                            placeholder="Personal Name *"
                            value={personalName}
                            onChange={(e) => setPersonalName(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            disabled={profileLoading}
                        />
                        <input
                            type="text"
                            placeholder="Breeder Name (Optional)"
                            value={breederName}
                            onChange={(e) => setBreederName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            disabled={profileLoading}
                        />
                        
                        <input
                            type="url"
                            name="websiteURL"
                            placeholder="Website URL (Optional) e.g., https://example.com"
                            value={websiteURL}
                            onChange={(e) => setWebsiteURL(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            disabled={profileLoading}
                        />


                        {/* VISIBILITY TOGGLES */}
                        <div className="pt-2 space-y-2">
                            <h4 className="text-base font-medium text-gray-800 pt-2 border-t border-gray-200">Public Profile Visibility:</h4>
                            
                            {/* Personal Name Toggle */}
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={showPersonalName}
                                    onChange={(e) => setShowPersonalName(e.target.checked)}
                                    className="rounded text-primary-dark focus:ring-primary-dark"
                                    disabled={profileLoading}
                                />
                                <span>Display **Personal Name** on your public profile card.</span>
                            </label>
                            
                            {/* Breeder Name Toggle */}
                            {breederName && (
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={showBreederName}
                                        onChange={(e) => setShowBreederName(e.target.checked)}
                                        className="rounded text-primary-dark focus:ring-primary-dark"
                                        disabled={profileLoading}
                                    />
                                    <span>Display **Breeder Name** on your public profile card.</span>
                                </label>
                            )}
                            
                            {/* Email Public Toggle */}
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={showEmailPublic}
                                    onChange={(e) => setShowEmailPublic(e.target.checked)}
                                    className="rounded text-primary-dark focus:ring-primary-dark"
                                    disabled={profileLoading}
                                />
                                <span>Display **Email Address** on your public profile card.</span>
                            </label>

                            {/* Website URL Toggle */}
                            {websiteURL && (
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={showWebsiteURL}
                                        onChange={(e) => setShowWebsiteURL(e.target.checked)}
                                        className="rounded text-primary-dark focus:ring-primary-dark"
                                        disabled={profileLoading}
                                    />
                                    <span>Display **Website URL** on your public profile card.</span>
                                </label>
                            )}
                        </div>
                        
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {profileLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Save Profile Info
                    </button>
                </div>
            </form>
            
            {/* 2. Email Update Form */}
            <form onSubmit={handleEmailUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Change Email</h3>
                <input
                    type="email"
                    placeholder="New Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={securityLoading}
                />
                
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={securityLoading}
                        className="bg-primary-dark hover:bg-primary text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {securityLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <RefreshCw size={20} className="mr-2" />}
                        Update Email
                    </button>
                </div>
            </form>
            
            {/* 3. Password Update Form */}
            <form onSubmit={handlePasswordUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                <input
                    type="password"
                    placeholder="Current Password *"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={passwordLoading}
                />
                <input
                    type="password"
                    placeholder="New Password *"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={passwordLoading}
                />
                <input
                    type="password"
                    placeholder="Confirm New Password *"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={passwordLoading}
                />
                
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-primary-dark hover:bg-primary text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {passwordLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Set New Password
                    </button>
                </div>
            </form>

        </div>
    );
};

// --- Component: Profile View (Container/View Mode - Existing) ---
const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken }) => {
    const [isEditing, setIsEditing] = useState(false);

    if (!userProfile) return <LoadingSpinner />;

    if (isEditing) {
        return (
            <ProfileEditForm 
                userProfile={userProfile}
                showModalMessage={showModalMessage}
                onSaveSuccess={() => {
                    fetchUserProfile(authToken); // Refresh data
                    setIsEditing(false); // Go back to view mode after save
                }}
                onCancel={() => setIsEditing(false)}
                authToken={authToken}
            />
        );
    }
    
    // View Mode
    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings size={24} className="mr-3 text-primary-dark" />
                Profile Settings
            </h2>
            <div className="space-y-4">
                
                {/* Public Visibility Status Box */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700 mb-2">Public Visibility Status</p>
                    
                    {/* Personal Name Status */}
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Personal Name ({userProfile.personalName})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            (userProfile.showPersonalName ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showPersonalName ?? true) ? 'Visible' : 'Hidden'}
                        </span>
                    </div>

                    {/* Breeder Name Status */}
                    {userProfile.breederName && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                            <span className="text-base text-gray-800">Breeder Name ({userProfile.breederName})</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                userProfile.showBreederName ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {userProfile.showBreederName ? 'Visible' : 'Hidden'}
                            </span>
                        </div>
                    )}

                    {/* Email Status */}
                    <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                        <span className="text-base text-gray-800">Email Address ({userProfile.email})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            (userProfile.showEmailPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showEmailPublic ?? false) ? 'Visible' : 'Hidden'}
                        </span>
                    </div>

                    {/* Website URL Status (only if URL is set) */}
                    {userProfile.websiteURL && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                            <span className="text-base text-gray-800">Website URL ({userProfile.websiteURL})</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                userProfile.showWebsiteURL ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {userProfile.showWebsiteURL ? 'Visible' : 'Hidden'}
                            </span>
                        </div>
                    )}
                    
                </div>

                {/* Updated ID display (Settings View) */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    <p className="text-3xl font-extrabold text-accent">CT-{userProfile.id_public}</p> 
                </div>
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center"
            >
                <Edit size={20} className="mr-2" /> Edit Profile
            </button>
        </div>
    );
};

// --- Component: User Authentication (Login/Register - Existing) ---
const AuthView = ({ onLoginSuccess, showModalMessage, isRegister, setIsRegister, mainTitle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personalName, setPersonalName] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    const payload = isRegister 
        ? { email, password, personalName } 
        : { email, password };

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      
      if (isRegister) {
        showModalMessage('Registration Success', 'Your account has been created. Please log in.');
        setIsRegister(false); // Switch to login view after success
      } else {
        onLoginSuccess(response.data.token);
      }
    } catch (error) {
      console.error('Authentication Error:', error.response?.data || error.message);
      showModalMessage(
        isRegister ? 'Registration Failed' : 'Login Failed', 
        error.response?.data?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    // Card for the login/register form
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
      
      {/* Title is now inside the card */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          {mainTitle}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Name input - mandatory only for registration */}
        {isRegister && (
            <input
                type="text"
                placeholder="Your Personal Name *" 
                value={personalName}
                onChange={(e) => setPersonalName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
        )}

        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (isRegister ? <><UserPlus size={20} className="mr-2" /> Register</> : <><LogIn size={20} className="mr-2" /> Log In</>)}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsRegister(!isRegister)} // Uses prop setter
          className="text-sm text-gray-500 hover:text-primary transition duration-150"
        >
          {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register Here"}
        </button>
      </div>
    </div>
  );
};


// --- Component: Main Application ---
const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userProfile, setUserProfile] = useState(null);
  
  // UPDATED: 'select-species' is the new default for adding an animal
  const [currentView, setCurrentView] = useState('list'); 
  const [animalToEdit, setAnimalToEdit] = useState(null);
  
  // NEW: Species state for the new animal to be passed to AnimalForm
  const [speciesToAdd, setSpeciesToAdd] = useState(null); 
  // NEW: Species Options state (initialized with defaults)
  const [speciesOptions, setSpeciesOptions] = useState(DEFAULT_SPECIES_OPTIONS); 

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
  const [isRegister, setIsRegister] = useState(false); 

  // IDLE TIMER REFS
  const timeoutRef = useRef(null);
  const activeEvents = ['mousemove', 'keydown', 'scroll', 'click'];


  // Centralized Modal Handler
  const showModalMessage = useCallback((title, message) => {
    setModalMessage({ title, message });
    setShowModal(true);
  }, []);

  // Logout Handler (must be defined early)
  const handleLogout = useCallback((isIdle = false) => {
    setAuthToken(null);
    setUserProfile(null);
    setCurrentView('list');
    showModalMessage(
        'Logged Out', 
        isIdle ? 'You have been logged out due to 15 minutes of inactivity.' : 'You have been successfully logged out.'
    );
  }, [showModalMessage]);

  // Function to reset the idle timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    if (authToken) {
        timeoutRef.current = setTimeout(() => {
            handleLogout(true); // Auto-logout due to idle
        }, IDLE_TIMEOUT_MS);
    }
  }, [authToken, handleLogout]);

  // Effect for setting up event listeners for idle tracking
  useEffect(() => {
    if (authToken) {
        resetTimer(); 
        const eventHandler = () => resetTimer();
        activeEvents.forEach(event => {
            window.addEventListener(event, eventHandler);
        });
        return () => {
            clearTimeout(timeoutRef.current);
            activeEvents.forEach(event => {
                window.removeEventListener(event, eventHandler);
            });
        };
    } else {
        clearTimeout(timeoutRef.current);
    }
  }, [authToken, resetTimer]); 

  // Set the default axios authorization header
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem('authToken', authToken);
      fetchUserProfile(authToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
      setUserProfile(null);
      setCurrentView('list');
    }
  }, [authToken]);


  const fetchUserProfile = useCallback(async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(response.data); 
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        showModalMessage('Authentication Error', 'Could not load user profile. Please log in again.');
        setAuthToken(null);
    }
  }, [showModalMessage]);


  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    setCurrentView('list');
    setIsRegister(false);
  };


  const handleEditAnimal = (animal) => {
    setAnimalToEdit(animal);
    setSpeciesToAdd(animal.species); // Pre-set species for the edit screen
    setCurrentView('edit-animal');
  };

  const handleSaveAnimal = async (method, url, data) => {
    if (method === 'post') {
        await axios.post(url, data);
    } else if (method === 'put') {
        await axios.put(url, data);
    }
  };


  const renderView = () => {
    switch (currentView) {
      case 'profile':
        // Assuming ProfileView and ProfileEditForm are correctly defined
        return <ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} />;
        
      case 'select-species':
        return (
            <SpeciesSelector
                speciesOptions={speciesOptions}
                onSelectSpecies={(species) => {
                    setSpeciesToAdd(species);
                    setCurrentView('add-animal');
                }}
                onManageSpecies={() => setCurrentView('manage-species')}
            />
        );

      case 'manage-species':
        return (
            <SpeciesManager
                speciesOptions={speciesOptions}
                setSpeciesOptions={setSpeciesOptions}
                onCancel={() => setCurrentView('select-species')}
                showModalMessage={showModalMessage}
            />
        );

      case 'add-animal':
        if (!speciesToAdd) {
            // Safety check: if somehow we reached here without species, go back
            setCurrentView('select-species');
            return null;
        }
        return (
          <AnimalForm 
            onSave={handleSaveAnimal} 
            onCancel={() => setCurrentView('list')} 
            showModalMessage={showModalMessage} 
            authToken={authToken}
            species={speciesToAdd} // Pass the selected species
          />
        );
      case 'edit-animal':
        if (!animalToEdit || !speciesToAdd) {
             setCurrentView('list');
             return null;
        }
        return (
          <AnimalForm 
            animalToEdit={animalToEdit}
            onSave={handleSaveAnimal} 
            onCancel={() => setCurrentView('list')} 
            showModalMessage={showModalMessage} 
            authToken={authToken}
            species={speciesToAdd} // Pass the species of the animal being edited
          />
        );
      case 'litters':
        return (
          <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <BookOpen size={24} className="mr-3 text-primary-dark" />
                Litter Management
            </h2>
            <p className="text-gray-600">Litter management features are currently under development.</p>
          </div>
        );
      case 'list':
      default:
        return (
          <AnimalList
            authToken={authToken}
            showModalMessage={showModalMessage}
            onEditAnimal={handleEditAnimal}
            onSetCurrentView={setCurrentView}
          />
        );
    }
  };
  
  // Conditional rendering for the logged out state
  if (!authToken) {
      const mainTitle = isRegister ? 'Create Account' : 'Welcome Back';
      
      return (
          <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
              {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
              
              <div className="flex flex-col items-center mb-4 -mt-16"> 
                  <CustomAppLogo size="w-32 h-32" /> 
              </div>

              <AuthView 
                  onLoginSuccess={handleLoginSuccess} 
                  showModalMessage={showModalMessage} 
                  isRegister={isRegister} 
                  setIsRegister={setIsRegister} 
                  mainTitle={mainTitle}
              />
          </div>
      );
  }

  // Logged-in Dashboard Layout (RESTORED)
  const displayName = userProfile?.showBreederName && userProfile?.breederName 
    ? userProfile.breederName 
    : userProfile?.personalName || 'User';

  return (
    <div className="min-h-screen bg-page-bg p-6 flex flex-col items-center font-sans">
      {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
      
      {/* 1. Header (Dashboard Card) */}
      <header className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="flex items-center space-x-2">
            <CustomAppLogo size="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">Crittertrack Dashboard</h1>
        </div>

        {/* Navigation and Logout buttons are only shown when logged in */}
        <div className='flex items-center space-x-4'>
            <span className='text-gray-600 text-sm hidden sm:block'>
                Welcome back, <span className='font-semibold text-gray-800'>{displayName}</span>
            </span>
            
            <nav className="flex space-x-2">
                <button
                    onClick={() => setCurrentView('list')}
                    title="Animals"
                    className={`p-2 rounded-lg transition duration-150 ${currentView === 'list' ? 'bg-primary shadow-inner text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <Cat size={20} />
                </button>
                <button
                    onClick={() => setCurrentView('litters')}
                    title="Litters"
                    className={`p-2 rounded-lg transition duration-150 ${currentView === 'litters' ? 'bg-primary shadow-inner text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} />
                </button>
                <button
                    onClick={() => setCurrentView('profile')}
                    title="Profile"
                    className={`p-2 rounded-lg transition duration-150 ${currentView === 'profile' ? 'bg-primary shadow-inner text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <User size={20} />
                </button>
            </nav>

            <button
                onClick={() => handleLogout(false)} 
                title="Log Out"
                className="bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
            >
                <LogOut size={18} className="hidden sm:inline" />
                <span className="text-sm">Logout</span>
            </button>
        </div>
      </header>

      {/* 2. User Profile Summary Card (Not shown on the Profile page itself) */}
      {currentView !== 'profile' && userProfile && <UserProfileCard userProfile={userProfile} />}

      {/* 3. Main Content Area */}
      <main className="w-full max-w-4xl flex-grow">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mt-6 text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} Crittertrack Pedigree System.
      </footer>
    </div>
  );
};

export default App;