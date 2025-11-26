import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw, User, ClipboardList, BookOpen, Settings, Mail, Globe, Egg, Milk, Search, X } from 'lucide-react';

const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api';

const GENDER_OPTIONS = ['Male', 'Female'];
const STATUS_OPTIONS = ['Pet', 'Breeder', 'Available', 'Retired', 'Deceased', 'Rehomed']; 

const DEFAULT_SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster'];

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

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

const CustomAppLogo = ({ size = "w-10 h-10" }) => (
  <img 
    src="/logo.png" 
    alt="Crittertrack Logo" 
    className={`${size} shadow-md`} 
  />
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

// (Removed unused `AnimalListItem` component to reduce redundancy)

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


// (Removed `PedigreeSearchModal`; consolidated search handling uses `ParentSearchModal`)

// --- Pedigree Search Modal (Parent Selector - MANUAL SEARCH) ---
const ParentSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage, API_BASE_URL, X, Search, Loader2, LoadingSpinner }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    
    // Simple component to render a list item
    const SearchResultItem = ({ animal, isGlobal }) => (
        <div 
            className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer" 
            onClick={() => onSelect(animal.id_public)}
        >
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
        const trimmedSearchTerm = searchTerm.trim();
        
        // Enforce a minimum of 3 characters for search
        if (!trimmedSearchTerm || trimmedSearchTerm.length < 3) {
            setLocalAnimals([]);
            setGlobalAnimals([]);
            showModalMessage('Search Info', 'Please enter at least 3 characters to search.');
            return;
        }

        // Set loading states before fetching
        setLoadingLocal(true);
        setLoadingGlobal(true);

        // --- 1. Search Local Animals ---
        try {
            const localResponse = await axios.get(`${API_BASE_URL}/animals?name=${trimmedSearchTerm}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const filteredLocal = localResponse.data.filter(a => a.id_public !== currentId);
            setLocalAnimals(filteredLocal);
        } catch (error) {
            console.error('Local Search Error:', error);
            showModalMessage('Search Error', 'Failed to search your animals.');
            setLocalAnimals([]);
        } finally {
            setLoadingLocal(false);
        }

        // --- 2. Search Global Display Animals ---
        try {
            const globalResponse = await axios.get(`${API_BASE_URL}/global/animals?name=${trimmedSearchTerm}&display=true`);
            const filteredGlobal = globalResponse.data.filter(a => a.id_public !== currentId);
            setGlobalAnimals(filteredGlobal);
        } catch (error) {
            console.error('Global Search Error:', error);
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

                {/* Search Bar (Manual Search) */}
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search by Animal Name (min 3 chars)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        // Removed onKeyPress event to enforce manual search
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loadingLocal || loadingGlobal || searchTerm.trim().length < 3}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loadingLocal || loadingGlobal ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    
                    {/* Global Results */}
                    {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Display Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}
                    
                    {/* Updated no results check */}
                    {searchTerm.trim().length >= 3 && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && (
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

// (Removed `LocalAnimalSearchModal` and unused `Dashboard` component to simplify file.)



const UserSearchModal = ({ onClose, showModalMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm) {
            setResults([]);
            return;
        }

        setLoading(true);
        
        // STUB: This is a frontend stub for the backend API call
        // In a real application, this would call an API like:
        // await axios.get(`${API_BASE_URL}/global/users?query=${searchTerm}`);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        // Mock Data based on the search query
        const query = searchTerm.toLowerCase();
        const mockData = [
            { id_public: '2468', personalName: 'Jane Doe', breederName: 'Whisker Haven', email: 'jane@example.com', websiteURL: 'http://whiskerhaven.com', isDisplay: true },
            { id_public: '1357', personalName: 'John Smith', breederName: 'Ratty Ranch', email: 'john@example.com', websiteURL: null, isDisplay: false },
            { id_public: '9999', personalName: 'Anonymous Breeder', breederName: null, email: null, websiteURL: 'http://pet-lines.net', isDisplay: true },
        ].filter(user => 
            user.personalName.toLowerCase().includes(query) || 
            user.breederName?.toLowerCase().includes(query) ||
            user.id_public.includes(query)
        );
        
        setResults(mockData);
        setLoading(false);
    };

    const UserResultCard = ({ user }) => (
        <div className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150">
            <p className="text-lg font-semibold text-gray-800 flex items-center">
                <User size={18} className="mr-2 text-primary-dark" />
                {user.personalName} 
                {user.breederName && (
                    <span className='ml-2 text-sm font-normal text-gray-500'>({user.breederName})</span>
                )}
            </p>
            <p className="text-sm text-gray-600 ml-5">
                Public ID: <span className="font-mono text-accent">CT-{user.id_public}</span>
            </p>
            <div className="flex items-center space-x-4 mt-2 ml-5 text-sm">
                {user.email && (
                    <div className="flex items-center space-x-1 text-gray-600">
                        <Mail size={14} />
                        <span>Email available</span>
                    </div>
                )}
                {user.websiteURL && (
                    <div className="flex items-center space-x-1 text-gray-600">
                        <Globe size={14} />
                        <a href={user.websiteURL} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Global Breeder Search 🔎</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search by Name, Breeder Name, or ID (e.g., CT-2468)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-4 divide-y divide-gray-100">
                    {loading ? <LoadingSpinner /> : results.length > 0 ? (
                        <div className="border rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 p-3 bg-gray-50 border-b">Public Profiles ({results.length})</h4>
                            {results.map(user => <UserResultCard key={user.id_public} user={user} />)}
                        </div>
                    ) : searchTerm && !loading ? (
                        <p className="text-center text-gray-500 py-4">No public breeder profiles found matching your search.</p>
                    ) : (
                        <p className="text-center text-gray-500 py-4">Enter a name or ID to search for other breeders.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const GeneticsCalculatorPlaceholder = ({ onCancel }) => (
    <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <div className='flex items-center'>
                <Cat size={24} className="mr-3 text-primary-dark" />
                Mouse Genetics Calculator 🧬
            </div>
            <button 
                onClick={onCancel} 
                className="flex items-center text-gray-600 hover:text-gray-800 transition"
            >
                <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
            </button>
        </h2>
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-2">Genetics Calculator - Coming Soon!</p>
            <p className="text-gray-600">This tool will allow you to predict the coat color and genetic outcomes of mating pairs for mice.</p>
        </div>
    </div>
);

const SpeciesManager = ({ speciesOptions, setSpeciesOptions, onCancel, showModalMessage }) => {
    const [newSpeciesName, setNewSpeciesName] = useState('');
    
    const customSpecies = speciesOptions.filter(s => !DEFAULT_SPECIES_OPTIONS.includes(s));
    
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

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Your Species List</h3>
                
                {DEFAULT_SPECIES_OPTIONS.map(species => (
                    <div key={species} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                        <span className="font-medium text-gray-600">{species} (Default)</span>
                        <span className="text-sm text-gray-400">Locked</span>
                    </div>
                ))}

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


const AnimalForm = ({ 
    formTitle,             
    animalToEdit,          
    species,               
    onSave, 
    onCancel, 
    onDelete,              
    authToken,
    showModalMessage, 
}) => {
    
    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            registryCode: animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || GENDER_OPTIONS[0],
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || STATUS_OPTIONS[0],
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
            remarks: animalToEdit.remarks || '',
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: animalToEdit.fatherId_public || null,
            motherId_public: animalToEdit.motherId_public || null,
            isPregnant: animalToEdit.isPregnant || false,
            isNursing: animalToEdit.isNursing || false,
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
        } : {
            species: species, 
            registryCode: '',
            prefix: '',
            name: '',
            gender: GENDER_OPTIONS[0],
            birthDate: '', 
            status: STATUS_OPTIONS[0],
            color: '',
            coat: '',
            remarks: '',
            geneticCode: '',
            fatherId_public: null,
            motherId_public: null,
            isPregnant: false,
            isNursing: false,
            isOwned: true,
            isDisplay: false,
        }
    );
    const [loading, setLoading] = useState(false);
    const [modalTarget, setModalTarget] = useState(null); 

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSelectPedigree = (id) => {
        if (modalTarget === 'father') {
            setFormData(prev => ({ ...prev, fatherId_public: id }));
        } else if (modalTarget === 'mother') {
            setFormData(prev => ({ ...prev, motherId_public: id }));
        }
        setModalTarget(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const method = animalToEdit ? 'put' : 'post';
        const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit.id_public}` : `${API_BASE_URL}/animals`;

        try {
            await onSave(method, url, formData);
            
            showModalMessage('Success', `Animal ${formData.name} successfully ${animalToEdit ? 'updated' : 'added'}!`);
            onCancel(); 
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };
    
    const currentId = animalToEdit?.id_public;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            {modalTarget && ( 
                <ParentSearchModal // <-- THIS IS THE CORRECTED LINE
                    title={modalTarget === 'father' ? 'Sire' : 'Dam'} 
                    currentId={currentId} 
                    onSelect={handleSelectPedigree} 
                    onClose={() => setModalTarget(null)} 
                    authToken={authToken} 
                    showModalMessage={showModalMessage}
                /> 
            )}

            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <span>
                    <PlusCircle size={24} className="inline mr-2 text-primary" /> 
                    {formTitle}
                </span>
                <button 
                    onClick={onCancel} 
                    className="text-gray-500 hover:text-gray-700 transition duration-150 p-2 rounded-lg"
                    title="Back to List"
                >
                    <ArrowLeft size={24} />
                </button>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ------------------------------------------- */}
                {/* ALL STATUS & PRIVACY FLAGS (MOVED TO TOP) */}
                {/* ------------------------------------------- */}
                <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">Status & Privacy Flags</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" name="isOwned" checked={formData.isOwned} onChange={handleChange} 
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span>Currently Owned by me</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" name="isDisplay" checked={formData.isDisplay} onChange={handleChange} 
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span>Share on public profile</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" name="isPregnant" checked={formData.isPregnant} onChange={handleChange} 
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span>Female is Pregnant 🥚</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" name="isNursing" checked={formData.isNursing} onChange={handleChange} 
                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span>Female is Nursing 🥛</span>
                        </label>
                    </div>
                </div>
                {/* ------------------------------------------- */}
                
                <AnimalImageUpload imageUrl={null} onFileChange={() => showModalMessage('Stub', 'Image Upload Stub')} disabled={loading} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Prefix </label>
                        <input name="prefix" value={formData.prefix} onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Name * </label>
                        <input name="name" value={formData.name} onChange={handleChange} required
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Registry Code </label>
                        <input name="registryCode" value={formData.registryCode} onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Gender * </label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full bg-white" >
                            {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Status * </label>
                        <select name="status" value={formData.status} onChange={handleChange} required
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full bg-white" >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Birth Date </label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Color </label>
                        <input name="color" value={formData.color} onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Coat </label>
                        <input name="coat" value={formData.coat} onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div> 
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Genetic/Colour Code (Optional) </label>
                        <input name="geneticCode" value={formData.geneticCode} onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Remarks/Notes (Optional) </label>
                        <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-full" />
                    </div>
                </div>
                
                {/* ------------------------------------------- */}
                {/* Pedigree Section (Unchanged) */}
                {/* ------------------------------------------- */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Pedigree: Sire and Dam 🌳</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Sire (Father) ID (Optional)</label>
                            <div onClick={() => !loading && setModalTarget('father')} 
                                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50" >
                                <span className={formData.fatherId_public ? "text-gray-800" : "text-gray-400"}>
                                    {formData.fatherId_public ? `CT-${formData.fatherId_public}` : 'Click to Select Sire'}
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Dam (Mother) ID (Optional)</label>
                            <div onClick={() => !loading && setModalTarget('mother')}
                                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50" >
                                <span className={formData.motherId_public ? "text-gray-800" : "text-gray-400"}>
                                    {formData.motherId_public ? `CT-${formData.motherId_public}` : 'Click to Select Dam'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ------------------------------------------- */}
                
                {/* Removed the now-empty Privacy Settings section */}

                <div className="mt-8 flex justify-between items-center border-t pt-4">
                    <div className="flex space-x-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>{loading ? 'Saving...' : 'Save Animal'}</span>
                        </button>
                    </div>

                    {animalToEdit && onDelete && (
                        <button 
                            type="button" 
                            onClick={() => { 
                                if(window.confirm(`Are you sure you want to delete ${animalToEdit.name}? This action cannot be undone.`)) {
                                    onDelete(animalToEdit.id_public);
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2"
                        >
                            <Trash2 size={18} />
                            <span>Delete</span>
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const UserProfileCard = ({ userProfile }) => {
    if (!userProfile) return null;

    const formattedCreationDate = userProfile.createdAt 
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.createdAt))
        : 'N/A';
    
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
                
                {isPersonalNameVisible && (
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {userProfile.personalName}
                    </h3>
                )}
                
                {(isBreederNameVisible && userProfile.breederName) && (
                    <div className="text-xl text-gray-700 font-semibold">
                        {userProfile.breederName}
                    </div>
                )}

                {(!isPersonalNameVisible && !isBreederNameVisible) && (
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">
                        (Name Hidden)
                    </h3>
                )}

                <div className="mt-4 space-y-1 text-sm text-gray-700">
                    {((userProfile.showEmailPublic ?? false)) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Mail size={16} className="text-gray-500" />
                            <a href={`mailto:${userProfile.email}`} className="text-gray-700 hover:text-primary transition duration-150">
                                {userProfile.email}
                            </a>
                        </div>
                    )}
                    
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

const ProfileEditForm = ({ userProfile, showModalMessage, onSaveSuccess, onCancel, authToken }) => {
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

    const [email, setEmail] = useState(userProfile.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            setProfileImageURL(URL.createObjectURL(file));
        }
    };

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
            await onSaveSuccess(); 
        } catch (error) {
            console.error('Profile Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update profile information.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        if (email === userProfile.email) {
            showModalMessage('Info', 'Email is already set to this value.');
            return;
        }
        setSecurityLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/auth/change-email`, { newEmail: email }, { headers: { Authorization: `Bearer ${authToken}` } });
            showModalMessage('Email Changed', 'Your email has been updated. You may need to log in again with the new email.');
            await onSaveSuccess(); 
        } catch (error) {
            console.error('Email Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update email address.');
            setEmail(userProfile.email); 
        } finally {
            setSecurityLoading(false);
        }
    };

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
            await axios.put(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${authToken}` } });
            showModalMessage('Success', 'Your password has been changed successfully. You will need to re-login with the new password.');
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
            
            <form onSubmit={handleProfileUpdate} className="space-y-6 mb-8 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Public Profile Information</h3>
                
                <ProfileImagePlaceholder 
                    url={profileImageURL} 
                    onFileChange={handleImageChange} 
                    disabled={profileLoading} 
                />

                <div className="space-y-4">
                    <input type="text" name="personalName" placeholder="Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={profileLoading} />
                    <input type="text" name="breederName" placeholder="Breeder Name (Optional)" value={breederName} onChange={(e) => setBreederName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={profileLoading} />
                    <input type="url" name="websiteURL" placeholder="Website URL (Optional) e.g., https://example.com" value={websiteURL} onChange={(e) => setWebsiteURL(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={profileLoading} />

                    <div className="pt-2 space-y-2">
                        <h4 className="text-base font-medium text-gray-800 pt-2 border-t border-gray-200">Public Profile Visibility:</h4>
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showPersonalName} onChange={(e) => setShowPersonalName(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Display **Personal Name** on your public profile card.</span>
                        </label>
                        
                        {breederName && (
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" checked={showBreederName} onChange={(e) => setShowBreederName(e.target.checked)} 
                                    className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                                <span>Display **Breeder Name** on your public profile card.</span>
                            </label>
                        )}
                        
                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showEmailPublic} onChange={(e) => setShowEmailPublic(e.target.checked)} 
                                className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                            <span>Display **Email Address** on your public profile card.</span>
                        </label>
                        
                        {websiteURL && (
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" checked={showWebsiteURL} onChange={(e) => setShowWebsiteURL(e.target.checked)} 
                                    className="rounded text-primary-dark focus:ring-primary-dark" disabled={profileLoading} />
                                <span>Display **Website URL** on your public profile card.</span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={profileLoading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {profileLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Save Profile Info
                    </button>
                </div>
            </form>
            
            <form onSubmit={handleEmailUpdate} className="space-y-4 mb-8 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Email Address</h3>
                <input type="email" placeholder="New Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={securityLoading} />
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={securityLoading} 
                        className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {securityLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Mail size={20} className="mr-2" />}
                        Update Email
                    </button>
                </div>
            </form>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Password</h3>
                <input type="password" placeholder="Current Password *" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={passwordLoading} />
                <input type="password" placeholder="New Password *" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={passwordLoading} />
                <input type="password" placeholder="Confirm New Password *" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" disabled={passwordLoading} />
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={passwordLoading}
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

const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken }) => {
    const [isEditing, setIsEditing] = useState(false);

    if (!userProfile) return <LoadingSpinner />;

    if (isEditing) {
        return (
            <ProfileEditForm 
                userProfile={userProfile} 
                showModalMessage={showModalMessage} 
                onSaveSuccess={() => { 
                    fetchUserProfile(authToken); 
                    setIsEditing(false); 
                }} 
                onCancel={() => setIsEditing(false)} 
                authToken={authToken} 
            />
        );
    }

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings size={24} className="mr-3 text-primary-dark" />
                Profile Settings
            </h2>
            <div className="space-y-4">
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700 mb-2">Public Visibility Status</p>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Personal Name ({userProfile.personalName})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showPersonalName ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showPersonalName ?? true) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Breeder Name ({userProfile.breederName || 'N/A'})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showBreederName ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showBreederName ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Website URL ({userProfile.websiteURL || 'N/A'})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showWebsiteURL ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showWebsiteURL ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Email Address ({userProfile.email})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ 
                            (userProfile.showEmailPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showEmailPublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>

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

const AuthView = ({ onLoginSuccess, showModalMessage, isRegister, setIsRegister, mainTitle }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [personalName, setPersonalName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const endpoint = isRegister ? '/auth/register' : '/auth/login';
        const payload = isRegister ? { email, password, personalName } : { email, password };
        
        try {
            const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
            
            if (isRegister) {
                showModalMessage('Registration Success', 'Your account has been created. Please log in.');
                setIsRegister(false); 
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
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {mainTitle}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {isRegister && (
                    <input type="text" placeholder="Your Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                )}
                
                <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                <input type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                
                 <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (isRegister ? <><UserPlus size={20} className="mr-2" /> Register</> : <><LogIn size={20} className="mr-2" /> Log In</>)}
        </button>
            </form>
            
            <div className="mt-6 text-center">
    <button type="button" onClick={() => setIsRegister(prev => !prev)}
        className="text-sm text-accent hover:text-accent/80 transition duration-150 font-medium"
    >
        {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register Here"}
    </button>
            </div>
        </div>
    );
};

const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onSetCurrentView }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    // Manual search: `searchInput` is the controlled input, `appliedNameFilter` is sent to the API
    const [searchInput, setSearchInput] = useState('');
    const [appliedNameFilter, setAppliedNameFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilterPregnant, setStatusFilterPregnant] = useState(false);
    const [statusFilterNursing, setStatusFilterNursing] = useState(false);
    const [ownedFilter, setOwnedFilter] = useState('owned');
    
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
            if (appliedNameFilter) {
                params.push(`name=${encodeURIComponent(appliedNameFilter)}`);
            }
            if (statusFilterPregnant) {
                params.push(`isPregnant=true`);
            }
            if (statusFilterNursing) {
                params.push(`isNursing=true`);
            }
            if (ownedFilter === 'owned') {
                params.push(`isOwned=true`);
            }
            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            const url = `${API_BASE_URL}/animals${queryString}`;

            const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
            let data = response.data || [];
            // Client-side fallback filtering in case the API doesn't apply the `name` filter reliably
            if (appliedNameFilter) {
                const term = appliedNameFilter.toLowerCase();
                data = data.filter(a => {
                    const name = (a.name || '').toString().toLowerCase();
                    const registry = (a.registryCode || '').toString().toLowerCase();
                    const idPublic = (a.id_public || '').toString().toLowerCase();
                    return name.includes(term) || registry.includes(term) || idPublic.includes(term.replace(/^ct-?/,'').toLowerCase());
                });
            }
            setAnimals(data);
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessage('Error', 'Failed to fetch animal list.');
        } finally {
            setLoading(false);
        }
    }, [authToken, statusFilter, genderFilter, appliedNameFilter, statusFilterPregnant, statusFilterNursing, ownedFilter, showModalMessage]);

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

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
    const handleSearchInputChange = (e) => setSearchInput(e.target.value);
    const handleGenderFilterChange = (gender) => setGenderFilter(gender);
    const handleFilterPregnant = () => { setStatusFilterPregnant(prev => !prev); setStatusFilterNursing(false); };
    const handleFilterNursing = () => { setStatusFilterNursing(prev => !prev); setStatusFilterPregnant(false); };
    
    const handleRefresh = () => {
        fetchAnimals();
    };

    const triggerSearch = () => {
        const term = searchInput.trim();
        if (!term) {
            // empty -> clear filter and fetch all
            setAppliedNameFilter('');
            return;
        }
        if (term.length < 3) {
            showModalMessage('Search Info', 'Please enter at least 3 characters to search.');
            return;
        }
        setAppliedNameFilter(term);
    };

    const AnimalCard = ({ animal, onEditAnimal }) => (
        <div className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150">
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
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Public</span>
                        )}
                    </div>
                </div>
                {animal.isPregnant && (
                    <div className="p-1 bg-accent/20 text-accent rounded-full" title="Pregnant">
                        <Egg size={18} />
                    </div>
                )}
                {animal.isNursing && (
                    <div className="p-1 bg-blue-100 text-primary rounded-full" title="Nursing">
                        <Milk size={18} />
                    </div>
                )}
            </div>
            <button onClick={() => onEditAnimal(animal)} className="text-primary hover:text-primary-dark p-2 rounded-full transition" >
                <Edit size={20} />
            </button>
        </div>
    );

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className='flex items-center'>
                    <ClipboardList size={24} className="mr-3 text-primary-dark" />
                    My Animals ({animals.length})
                </div>
                <button 
                    onClick={handleRefresh} 
                    disabled={loading}
                    className="text-gray-600 hover:text-primary transition disabled:opacity-50 flex items-center"
                    title="Refresh List"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </button>
            </h2>

            <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Search by Animal Name..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyPress={(e) => { if (e.key === 'Enter') triggerSearch(); }}
                        className="flex-grow p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition"
                        disabled={loading}
                    />
                    <button
                        onClick={triggerSearch}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
                        title="Search"
                    >
                        <Search size={18} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                    <button 
                        onClick={() => onSetCurrentView('select-species')} 
                        className="bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1 whitespace-nowrap"
                    >
                        <PlusCircle size={18} /> <span>Add Animal</span>
                    </button>
                </div>

                <div className="flex space-x-4 pt-2 border-t border-gray-200">
                    <select value={statusFilter} onChange={handleStatusFilterChange} 
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-1/3 min-w-[150px]"
                    >
                        <option value="">All</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    
                    <div className="flex space-x-2 flex-grow items-center">
                        <span className='text-sm font-medium text-gray-700'>Gender:</span>
                        {['All', ...GENDER_OPTIONS].map(gender => {
                            const value = gender === 'All' ? '' : gender;
                            const isCurrentSelected = genderFilter === value;
                            let selectedClasses = isCurrentSelected ? (gender === 'Male' ? 'bg-primary text-black' : gender === 'Female' ? 'bg-accent text-white' : 'bg-primary-dark text-black') : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                            
                            return (
                                <button key={gender} onClick={() => handleGenderFilterChange(value)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${selectedClasses}`}
                                >
                                    {gender}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center space-x-4 pt-2 border-t border-gray-200">
                    <span className='text-sm font-medium text-gray-700'>Filter By:</span>
                    
                    {['Owned', 'All'].map(option => {
                        const value = option.toLowerCase();
                        const isSelected = ownedFilter === value;
                        return (
                            <button key={value} onClick={() => setOwnedFilter(value)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${ 
                                    isSelected ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}

                    <button onClick={handleFilterPregnant}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                            statusFilterPregnant ? 'bg-accent text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Egg size={16} /> <span>Pregnant</span>
                    </button>
                    <button onClick={handleFilterNursing}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                            statusFilterNursing ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Milk size={16} /> <span>Nursing</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : animals.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Cat size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">No animals found.</p>
                    <p className="text-gray-500">Try adjusting your filters or add a new animal!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {speciesNames.map(species => (
                        <div key={species} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <h3 className="text-lg font-bold bg-gray-100 p-4 border-b text-gray-700">
                                {species} ({groupedAnimals[species].length})
                            </h3>
                            <div className="divide-y divide-gray-100">
                                {groupedAnimals[species].map(animal => (
                                    <AnimalCard key={animal.id_public} animal={animal} onEditAnimal={onEditAnimal} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [userProfile, setUserProfile] = useState(null);
    const [currentView, setCurrentView] = useState('list'); 
    const [animalToEdit, setAnimalToEdit] = useState(null);
    const [speciesToAdd, setSpeciesToAdd] = useState(null); 
    const [speciesOptions, setSpeciesOptions] = useState(DEFAULT_SPECIES_OPTIONS); 
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
    const [isRegister, setIsRegister] = useState(false); 

    const [showUserSearchModal, setShowUserSearchModal] = useState(false);

    const timeoutRef = useRef(null);
    const activeEvents = ['mousemove', 'keydown', 'scroll', 'click'];

    const showModalMessage = useCallback((title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    }, []);

    const handleLogout = useCallback((expired = false) => {
        setAuthToken(null);
        setUserProfile(null);
        setCurrentView('auth');
        localStorage.removeItem('authToken');
        if (expired) {
            showModalMessage('Session Expired', 'You were logged out due to 15 minutes of inactivity.');
        }
    }, [showModalMessage]);

    const resetIdleTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (authToken) {
                handleLogout(true);
            }
        }, IDLE_TIMEOUT_MS);
    }, [authToken, handleLogout]);

     useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            resetIdleTimer();

            activeEvents.forEach(event => window.addEventListener(event, resetIdleTimer));
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            activeEvents.forEach(event => window.removeEventListener(event, resetIdleTimer));
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            activeEvents.forEach(event => window.removeEventListener(event, resetIdleTimer));
        };
    }, [authToken, resetIdleTimer]);


        useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
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
            const response = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
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
        setSpeciesToAdd(animal.species); 
        setCurrentView('edit-animal');
    };

    const handleSaveAnimal = async (method, url, data) => {
        if (userProfile && !data.ownerId_public) {
            data.ownerId_public = userProfile.id_public;
        }
        try {
            if (method === 'post') {
                await axios.post(url, data);
            } else if (method === 'put') {
                await axios.put(url, data);
            }
        } catch (error) {
            throw error;
        }
    };

        const handleDeleteAnimal = async (id_public) => {
        try {
            await axios.delete(`${API_BASE_URL}/animals/${id_public}`);
            setCurrentView('list');
            showModalMessage('Success', `Animal with ID ${id_public} has been successfully deleted.`);
        } catch (error) {
            console.error('Failed to delete animal:', error);
            showModalMessage('Error', `Failed to delete animal: ${error.response?.data?.message || error.message}`);
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'profile':
                return <ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} />;
            case 'select-species':
                const speciesList = speciesOptions.join('/');
                const selectorTitle = `Add New ${speciesList}/Custom`;
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
                const addFormTitle = `Add New ${speciesToAdd}`;
                return (
                    <AnimalForm 
                        formTitle={addFormTitle} 
                        animalToEdit={null} 
                        species={speciesToAdd} 
                        onSave={handleSaveAnimal} 
                        onCancel={() => setCurrentView('list')} 
                        onDelete={null} 
                        authToken={authToken} 
                        showModalMessage={showModalMessage}
                    />
                );
            case 'edit-animal':
                const editFormTitle = `Edit ${animalToEdit.name}`;
                return (
                    <AnimalForm 
                        formTitle={editFormTitle} 
                        animalToEdit={animalToEdit} 
                        species={animalToEdit.species} 
                        onSave={handleSaveAnimal} 
                        onCancel={() => setCurrentView('list')} 
                        onDelete={handleDeleteAnimal}
                        authToken={authToken} 
                        showModalMessage={showModalMessage}
                    />
                );
            case 'genetics-calculator': // NEW VIEW CASE
                return (
                    <GeneticsCalculatorPlaceholder
                        onCancel={() => setCurrentView('list')}
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

     return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
            {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
            {showUserSearchModal && <UserSearchModal onClose={() => setShowUserSearchModal(false)} showModalMessage={showModalMessage} />} {/* NEW: User Search Modal */}
            
            <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                
                <nav className="flex space-x-2 sm:space-x-4">
                    <button onClick={() => setCurrentView('list')} className={`px-2 py-2 sm:px-4 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <ClipboardList size={18} className="inline mr-1 hidden sm:inline" /> Animals
                    </button>
                    <button onClick={() => setCurrentView('litters')} className={`px-2 py-2 sm:px-4 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <BookOpen size={18} className="inline mr-1 hidden sm:inline" /> Litters
                    </button>
                    {/* NEW: Genetics Calculator Link */}
                    <button onClick={() => setCurrentView('genetics-calculator')} className={`px-2 py-2 sm:px-4 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Cat size={18} className="inline mr-1 hidden sm:inline" /> Genetics
                    </button>
                    <button onClick={() => setCurrentView('profile')} className={`px-2 py-2 sm:px-4 text-sm font-medium rounded-lg transition duration-150 ${currentView === 'profile' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <User size={18} className="inline mr-1 hidden sm:inline" /> Profile
                    </button>
                </nav>

                <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* NEW: Search Button to launch UserSearchModal */}
                    <button 
                        onClick={() => setShowUserSearchModal(true)} 
                        className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                        title="Search Breeders by Name or ID"
                    >
                        <Search size={20} className="mr-1 hidden sm:inline" />
                        <span className="text-sm hidden sm:inline">Search</span>
                        <Search size={20} className="sm:hidden" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handleLogout(false)} 
                            title="Log Out"
                            className="bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
                        >
                            <LogOut size={18} className="hidden sm:inline" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {currentView !== 'profile' && userProfile && <UserProfileCard userProfile={userProfile} />}

            <main className="w-full max-w-4xl flex-grow">
                {renderView()}
            </main>

            <footer className="w-full max-w-4xl mt-6 text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                &copy; {new Date().getFullYear()} Crittertrack Pedigree System.
            </footer>
        </div>
    );
};

export default App;