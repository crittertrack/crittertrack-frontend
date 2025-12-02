import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw, User, ClipboardList, BookOpen, Settings, Mail, Globe, Egg, Milk, Search, X, Mars, Venus, Eye, EyeOff, Home, Heart, HeartOff, Bell, Check, XCircle } from 'lucide-react';

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


const ParentSearchModal = ({ 
    title, 
    currentId, 
    onSelect, 
    onClose, 
    authToken, 
    showModalMessage, 
    API_BASE_URL, 
    X, 
    Search, 
    Loader2, 
    LoadingSpinner,
    requiredGender, // Filter: e.g., 'Male' or 'Female'
    birthDate       // Filter: Date of the animal being bred
}) => {
    const [searchTerm, setSearchTerm] = useState('');
        const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [scope, setScope] = useState('both'); // 'local' | 'global' | 'both'
    
    // Simple component to render a list item
    const SearchResultItem = ({ animal, isGlobal }) => {
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        
        return (
            <div 
                className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50 cursor-pointer" 
                onClick={() => onSelect(animal)}
            >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {imgSrc ? (
                        <img src={imgSrc} alt={animal.name} className="w-full h-full object-cover" />
                    ) : (
                        <Cat size={24} className="text-gray-400" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
                    </p>
                    <p className="text-xs text-gray-500">CT{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} • {animal.gender} • {animal.status || 'Unknown'}
                    </p>
                </div>
                
                {/* Badge */}
                {isGlobal && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex-shrink-0">Global</span>}
            </div>
        );
    };

        const handleSearch = async () => {
            setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();

        if (!trimmedSearchTerm || trimmedSearchTerm.length < 1) {
            setLocalAnimals([]);
            setGlobalAnimals([]);
            showModalMessage('Search Info', 'Please enter a name or ID to search.');
            return;
        }

        // Detect ID searches (CT1234 or 1234)
        const idMatch = trimmedSearchTerm.match(/^\s*(?:CT[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        const idValue = isIdSearch ? idMatch[1] : null;

        // --- CONSTRUCT FILTER QUERIES ---
        const genderQuery = requiredGender ? `&gender=${requiredGender}` : '';
        const birthdateQuery = birthDate ? `&birthdateBefore=${birthDate}` : '';

        // Prepare promises depending on scope
        setLoadingLocal(scope === 'local' || scope === 'both');
        setLoadingGlobal(scope === 'global' || scope === 'both');

        // Local search
        if (scope === 'local' || scope === 'both') {
            try {
                const localUrl = isIdSearch
                    ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}`;

                const localResponse = await axios.get(localUrl, {
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
        } else {
            setLocalAnimals([]);
            setLoadingLocal(false);
        }

        // Global search
        if (scope === 'global' || scope === 'both') {
            try {
                const globalUrl = isIdSearch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}`;

                const globalResponse = await axios.get(globalUrl);
                const filteredGlobal = globalResponse.data.filter(a => a.id_public !== currentId);
                setGlobalAnimals(filteredGlobal);
            } catch (error) {
                console.error('Global Search Error:', error);
                setGlobalAnimals([]);
            } finally {
                setLoadingGlobal(false);
            }
        } else {
            setGlobalAnimals([]);
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

                {/* Scope Toggle + Search Bar (Manual Search) */}
                <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Search Scope:</span>
                        {['local','global','both'].map(s => (
                            <button key={s} onClick={() => setScope(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {s === 'both' ? 'Local + Global' : (s === 'local' ? 'Local' : 'Global')}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder={`Search by Name or ID (e.g., Minnie or CT2468)...`}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setHasSearched(false); }}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={(scope === 'local' || scope === 'both') && loadingLocal || (scope === 'global' || scope === 'both') && loadingGlobal || searchTerm.trim().length < 1}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                        >
                            { (loadingLocal || loadingGlobal) ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> }
                        </button>
                    </div>
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
                    {hasSearched && searchTerm.trim().length >= 1 && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && (
                        <p className="text-center text-gray-500 py-4">No animals found matching your search term or filters.</p>
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


const LocalAnimalSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage, API_BASE_URL, X, Search, Loader2, LoadingSpinner }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    
    // Simple component to render a list item (No isGlobal tag needed)
    const SearchResultItem = ({ animal }) => (
        <div 
            className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer" 
            onClick={() => onSelect(animal.id_public)}
        >
            <div>
                <p className="font-semibold text-gray-800">{animal.prefix} {animal.name} (CT{animal.id_public})</p>
                <p className="text-sm text-gray-600">
                    {animal.species} | {animal.gender} | {animal.status}
                </p>
            </div>
        </div>
    );

    const handleSearch = async () => {
        setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();
        
        if (!trimmedSearchTerm || trimmedSearchTerm.length < 3) {
            setLocalAnimals([]);
            showModalMessage('Search Info', 'Please enter at least 3 characters to search.');
            return;
        }

        // --- Search Local Animals Only ---
        setLoadingLocal(true);
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
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector (Local Animals Only)</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Search Bar (Manual Search) */}
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search your animals by Name (min 3 chars)..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setHasSearched(false); }}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loadingLocal || searchTerm.trim().length < 3}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loadingLocal ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 ? (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} />)}
                        </div>
                    ) : (
                        hasSearched && searchTerm.trim().length >= 3 && !loadingLocal && (
                            <p className="text-center text-gray-500 py-4">No local animals found matching your search term.</p>
                        )
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



const UserSearchModal = ({ onClose, showModalMessage, onSelectUser, API_BASE_URL, modalTarget }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('users'); // 'users' or 'animals'
    const [userResults, setUserResults] = useState([]);
    const [animalResults, setAnimalResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setUserResults([]);
            setAnimalResults([]);
            return;
        }

        setLoading(true);
        
        try {
            if (searchType === 'users') {
                // Search for users
                const url = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=50`;
                console.log('Fetching users from:', url);
                const response = await axios.get(url);
                console.log('User search response:', response.data);
                setUserResults(response.data || []);
                setAnimalResults([]);
            } else {
                // Search for animals globally
                const idMatch = searchTerm.trim().match(/^\s*(?:CT[- ]?)?(\d+)\s*$/i);
                const url = idMatch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idMatch[1])}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(searchTerm.trim())}`;
                console.log('Fetching animals from:', url);
                const response = await axios.get(url);
                console.log('Animal search response:', response.data);
                setAnimalResults(response.data || []);
                setUserResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            showModalMessage('Search Error', 'Failed to search. Please try again.');
            setUserResults([]);
            setAnimalResults([]);
        } finally {
            setLoading(false);
        }
    };

    const UserResultCard = ({ user }) => {
        const memberSince = user.createdAt 
            ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.createdAt))
            : (user.updatedAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.updatedAt)) : 'Unknown');
        
        // Determine display name(s)
        const showBothNames = user.showBreederName && user.personalName && user.breederName;
        const displayName = showBothNames 
            ? `${user.personalName} (${user.breederName})`
            : (user.showBreederName && user.breederName ? user.breederName : user.personalName || 'Anonymous Breeder');
        
        return (
            <div 
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150 cursor-pointer"
                onClick={() => {
                    if (onSelectUser) onSelectUser(user);
                }}
            >
                <div className="flex items-start space-x-3">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt={displayName} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User size={24} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <p className="text-lg font-semibold text-gray-800">
                            {displayName}
                        </p>
                        <p className="text-sm text-gray-600">
                            Public ID: <span className="font-mono text-accent">CT{user.id_public}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Member since {memberSince}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const AnimalResultCard = ({ animal }) => (
        <div 
            className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition duration-150 cursor-pointer"
            onClick={() => {
                // Will open view-only animal detail modal
                if (window.handleViewPublicAnimal) {
                    window.handleViewPublicAnimal(animal);
                }
            }}
        >
            <div className="flex items-start space-x-3">
                {animal.imageUrl || animal.photoUrl ? (
                    <img src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Cat size={24} className="text-gray-400" />
                    </div>
                )}
                <div className="flex-grow">
                    <p className="text-lg font-semibold text-gray-800">
                        {animal.prefix && `${animal.prefix} `}{animal.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        {animal.species} • {animal.gender} • <span className="font-mono">CT{animal.id_public}</span>
                    </p>
                    {animal.color && <p className="text-xs text-gray-500 mt-1">{animal.color}</p>}
                </div>
            </div>
        </div>
    );

    const results = searchType === 'users' ? userResults : animalResults;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Global Search 🔎</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Search Type Toggle - only show for pedigree (sire/dam), not for breeder */}
                {modalTarget !== 'breeder' && (
                    <div className="flex space-x-2 mb-4">
                        <button
                            onClick={() => { setSearchType('users'); setUserResults([]); setAnimalResults([]); }}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                                searchType === 'users' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <User size={16} className="inline mr-2" />
                            Users
                        </button>
                        <button
                            onClick={() => { setSearchType('animals'); setUserResults([]); setAnimalResults([]); }}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                                searchType === 'animals' 
                                    ? 'bg-primary text-black' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Cat size={16} className="inline mr-2" />
                            Animals
                        </button>
                    </div>
                )}

                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder={searchType === 'users' 
                            ? "Search by Name or ID (e.g., CT2468)..." 
                            : "Search by Name or ID (e.g., CT123)..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || searchTerm.trim().length < 2}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto space-y-4 divide-y divide-gray-100">
                    {loading ? <LoadingSpinner /> : results.length > 0 ? (
                        <div className="border rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 p-3 bg-gray-50 border-b">
                                {searchType === 'users' ? `Users (${results.length})` : `Animals (${results.length})`}
                            </h4>
                            {searchType === 'users' 
                                ? results.map(user => <UserResultCard key={user.id_public} user={user} />)
                                : results.map(animal => <AnimalResultCard key={animal.id_public} animal={animal} />)
                            }
                        </div>
                    ) : searchTerm && !loading ? (
                        <p className="text-center text-gray-500 py-4">
                            No {searchType === 'users' ? 'users' : 'animals'} found matching your search.
                        </p>
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            Enter a name or ID to search for {searchType === 'users' ? 'users' : 'animals'}.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Public Profile View Component - Shows a breeder's public animals
const PublicProfileView = ({ profile, onBack, onViewAnimal, API_BASE_URL }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicAnimals = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/public/animals/${profile.id_public}`);
                setAnimals(response.data || []);
            } catch (error) {
                console.error('Error fetching public animals:', error);
                setAnimals([]);
            } finally {
                setLoading(false);
            }
        };

        if (profile) {
            fetchPublicAnimals();
        }
    }, [profile, API_BASE_URL]);

    const memberSince = profile.createdAt 
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(profile.createdAt))
        : (profile.updatedAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(profile.updatedAt)) : 'Unknown');

    // Determine display name(s)
    const showBothNames = profile.showBreederName && profile.personalName && profile.breederName;
    const displayName = showBothNames 
        ? `${profile.personalName} (${profile.breederName})`
        : (profile.showBreederName && profile.breederName ? profile.breederName : profile.personalName || 'Anonymous Breeder');

    const groupedAnimals = animals.reduce((groups, animal) => {
        const species = animal.species || 'Unspecified';
        if (!groups[species]) groups[species] = [];
        groups[species].push(animal);
        return groups;
    }, {});

    return (
        <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back
                </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                {profile.profileImage ? (
                    <img src={profile.profileImage} alt={displayName} className="w-24 h-24 rounded-lg object-cover shadow-md" />
                ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center shadow-md">
                        <User size={48} className="text-gray-400" />
                    </div>
                )}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-gray-600">Public ID: <span className="font-mono text-accent">CT{profile.id_public}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Member since {memberSince}</p>
                </div>
            </div>

            {/* Public Animals */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Public Animals ({animals.length})</h3>
            {loading ? (
                <LoadingSpinner />
            ) : animals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Cat size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>This breeder has no public animals.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(groupedAnimals).sort().map(species => (
                        <div key={species} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                                <Cat size={20} className="mr-2" /> {species}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {groupedAnimals[species].map(animal => {
                                    const birth = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '';
                                    const imgSrc = animal.imageUrl || animal.photoUrl || null;
                                    
                                    return (
                                        <div key={animal.id_public} className="w-full flex justify-center">
                                            <div
                                                onClick={() => onViewAnimal(animal)}
                                                className="relative bg-white rounded-xl shadow-sm w-44 h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-3"
                                            >
                                                {/* Birthdate top-left */}
                                                {birth && (
                                                    <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                                        {birth}
                                                    </div>
                                                )}

                                                {/* Gender badge top-right */}
                                                {animal.gender && (
                                                    <div className="absolute top-2 right-2" title={animal.gender}>
                                                        {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-primary" /> : <Venus size={16} strokeWidth={2.5} className="text-accent" />}
                                                    </div>
                                                )}

                                                {/* Centered profile image */}
                                                <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                    {imgSrc ? (
                                                        <img src={imgSrc} alt={animal.name} className="w-24 h-24 object-cover rounded-md" />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                            <Cat size={36} />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Prefix / Name under image */}
                                                <div className="w-full text-center px-2 pb-1 mt-2">
                                                    <div className="text-sm font-semibold text-gray-800 truncate">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}</div>
                                                </div>

                                                {/* ID bottom-right */}
                                                <div className="w-full px-2 pb-2 flex justify-end">
                                                    <div className="text-xs text-gray-500">CT{animal.id_public}</div>
                                                </div>
                                                
                                                {/* Status bar at bottom */}
                                                <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                    <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// View-Only Animal Detail Modal
const ViewOnlyAnimalDetail = ({ animal, onClose, API_BASE_URL }) => {
    if (!animal) return null;

    const imgSrc = animal.imageUrl || animal.photoUrl || null;
    const birthDate = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'Unknown';

    // Only show remarks and genetic code if they are marked as public
    const showRemarks = animal.includeRemarks !== false && animal.remarks;
    const showGeneticCode = animal.includeGeneticCode !== false && animal.geneticCode;

    return (
        <div className="fixed inset-0 bg-accent/10 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-primary rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={onClose} 
                            className="flex items-center text-gray-600 hover:text-gray-800 transition"
                        >
                            <ArrowLeft size={18} className="mr-1" /> Back
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <X size={28} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Image with Name, ID, Species, Status below */}
                    <div className="w-full flex flex-col items-center">
                        {imgSrc && (
                            <img 
                                src={imgSrc} 
                                alt={animal.name} 
                                className="w-48 h-48 rounded-lg shadow-lg object-cover"
                            />
                        )}
                        <div className="mt-4 space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900 text-center">
                                {animal.prefix && `${animal.prefix} `}{animal.name}
                            </h2>
                            <p className="text-center">
                                <span className="text-base font-medium text-gray-700">CT{animal.id_public}</span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-base font-medium text-gray-700">{animal.species}</span>
                            </p>
                            {animal.status && (
                                <div className="flex justify-center">
                                    <div className="bg-gray-100 px-4 py-1 rounded border border-gray-300">
                                        <span className="text-xs font-medium text-gray-700">{animal.status}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Gender</p>
                                <p className="text-lg">{animal.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Birth Date</p>
                                <p className="text-lg">{birthDate}</p>
                            </div>
                            {animal.color && (
                                <div>
                                    <p className="text-sm text-gray-600">Color</p>
                                    <p className="text-lg">{animal.color}</p>
                                </div>
                            )}
                            {animal.coat && (
                                <div>
                                    <p className="text-sm text-gray-600">Coat</p>
                                    <p className="text-lg">{animal.coat}</p>
                                </div>
                            )}
                            {animal.breederyId && (
                                <div>
                                    <p className="text-sm text-gray-600">Breedery ID</p>
                                    <p className="text-lg">{animal.breederyId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Genetic Code (only if public) */}
                    {showGeneticCode && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Genetic Code</h3>
                            <p className="text-gray-700 font-mono">{animal.geneticCode}</p>
                        </div>
                    )}

                    {/* Remarks (only if public) */}
                    {showRemarks && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Remarks / Notes</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{animal.remarks}</p>
                        </div>
                    )}

                    {/* Breeder */}
                    {animal.breederId_public && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Breeder</h3>
                            <p className="text-gray-700">
                                <span className="font-mono text-accent">CT{animal.breederId_public}</span>
                            </p>
                        </div>
                    )}

                    {/* Parents */}
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ViewOnlyParentCard 
                                parentId={animal.fatherId_public || animal.sireId_public} 
                                parentType="Father"
                                API_BASE_URL={API_BASE_URL}
                            />
                            <ViewOnlyParentCard 
                                parentId={animal.motherId_public || animal.damId_public} 
                                parentType="Mother"
                                API_BASE_URL={API_BASE_URL}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// View-Only Parent Card Component
const ViewOnlyParentCard = ({ parentId, parentType, API_BASE_URL }) => {
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    React.useEffect(() => {
        if (!parentId) {
            setParentData(null);
            setNotFound(false);
            return;
        }

        const fetchParent = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                // Try fetching from global public animals database
                const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${parentId}`);
                if (publicResponse.data && publicResponse.data.length > 0) {
                    setParentData(publicResponse.data[0]);
                } else {
                    setNotFound(true);
                    setParentData(null);
                }
            } catch (error) {
                console.error(`Error fetching ${parentType}:`, error);
                setNotFound(true);
                setParentData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchParent();
    }, [parentId, parentType, API_BASE_URL]);

    if (!parentId || notFound) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No {parentType.toLowerCase()} recorded</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border-2 border-gray-300 rounded-lg p-4 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!parentData) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Loading {parentType.toLowerCase()} data...</p>
            </div>
        );
    }

    const imgSrc = parentData.imageUrl || parentData.photoUrl || null;

    return (
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <p className="text-xs font-semibold text-gray-600">{parentType}</p>
            </div>
            <div className="p-4">
                <div className="flex items-start space-x-3">
                    {imgSrc ? (
                        <img src={imgSrc} alt={parentData.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Cat size={32} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-800">
                            {parentData.prefix && `${parentData.prefix} `}{parentData.name}
                        </p>
                        <p className="text-xs text-gray-600 font-mono">CT{parentData.id_public}</p>
                        {parentData.status && (
                            <p className="text-xs text-gray-500 mt-1">{parentData.status}</p>
                        )}
                    </div>
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


// Small helper component for animal image selection/preview
const AnimalImageUpload = ({ imageUrl, onFileChange, disabled = false }) => (
    <div className="flex items-center space-x-4">
        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
            { imageUrl ? (
                <img src={imageUrl} alt="Animal" className="w-full h-full object-cover" />
            ) : (
                <Cat size={36} className="text-gray-400" />
            ) }
        </div>
        <div className="flex-1">
            <label className={`inline-flex items-center px-4 py-2 bg-primary text-black rounded-md cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}>
                Change Photo
                <input type="file" accept="image/*" onChange={onFileChange} disabled={disabled} className="hidden" />
            </label>
            <p className="text-sm text-gray-500 mt-2">Images are automatically compressed for upload.</p>
        </div>
    </div>
);


// Compress an image File in the browser by resizing it to fit within max dimensions
// and re-encoding to JPEG (or PNG for original PNG files). GIFs are returned as-is.
// Returns a Promise that resolves to a Blob.
async function compressImageFile(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) — the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    const img = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        image.src = url;
    });

    const origWidth = img.width;
    const origHeight = img.height;
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    // Calculate target size preserving aspect ratio
    if (origWidth > maxWidth || origHeight > maxHeight) {
        const widthRatio = maxWidth / origWidth;
        const heightRatio = maxHeight / origHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        targetWidth = Math.round(origWidth * ratio);
        targetHeight = Math.round(origHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    // Fill background white for JPEG to avoid black background on transparent PNGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Use PNG output for original PNGs to preserve transparency, otherwise JPEG
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    return blob || file;
}

// Compress an image File to be under `maxBytes` if possible.
// Tries decreasing quality first, then scales down dimensions and retries.
// Returns a Blob (best-effort). Throws if input isn't an image.
async function compressImageToMaxSize(file, maxBytes = 200 * 1024, opts = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) — the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    // Start with original dimensions limits from opts or defaults
    let { maxWidth = 1200, maxHeight = 1200, startQuality = 0.85, minQuality = 0.35, qualityStep = 0.05, minDimension = 200 } = opts;

    // Load original image to get dimensions
    const image = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        img.src = url;
    });

    let targetW = Math.min(image.width, maxWidth);
    let targetH = Math.min(image.height, maxHeight);

    // Helper to run compression with given dims and quality
    const tryCompress = async (w, h, quality) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
        return blob;
    };

    // First pass: try with decreasing quality at initial dimensions
    let quality = startQuality;
    while (quality >= minQuality) {
        const blob = await tryCompress(targetW, targetH, quality);
        if (!blob) break;
        if (blob.size <= maxBytes) return blob;
        quality -= qualityStep;
    }

    // Second pass: gradually reduce dimensions and retry quality sweep
    while (Math.max(targetW, targetH) > minDimension) {
        targetW = Math.max(Math.round(targetW * 0.8), minDimension);
        targetH = Math.max(Math.round(targetH * 0.8), minDimension);
        quality = startQuality;
        while (quality >= minQuality) {
            const blob = await tryCompress(targetW, targetH, quality);
            if (!blob) break;
            if (blob.size <= maxBytes) return blob;
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minDimension)
    const finalBlob = await tryCompress(minDimension, minDimension, minQuality);
    return finalBlob || file;
}

// Attempt to compress an image in a Web Worker (public/imageWorker.js).
// Returns a Blob on success, or null if worker not available or reports an error.
const compressImageWithWorker = (file, maxBytes = 200 * 1024, opts = {}) => {
    return new Promise((resolve, reject) => {
        // Try to create a worker pointing to the public folder path
        let worker;
        try {
            worker = new Worker('/imageWorker.js');
        } catch (e) {
            resolve(null); // Worker couldn't be created (e.g., bundler/public path issue)
            return;
        }

        const id = Math.random().toString(36).slice(2);

        const onMessage = (ev) => {
            if (!ev.data || ev.data.id !== id) return;
            if (ev.data.error) {
                worker.removeEventListener('message', onMessage);
                worker.terminate();
                resolve(null);
                return;
            }
            // Received blob
            const blob = ev.data.blob;
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(blob);
        };

        worker.addEventListener('message', onMessage);

        // Post file (structured clone) to worker
        try {
            worker.postMessage({ id, file, maxBytes, opts });
        } catch (e) {
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(null);
        }
    });
};


const AnimalForm = ({ 
    formTitle,             
    animalToEdit,          
    species,               
    onSave, 
    onCancel, 
    onDelete,              
    authToken,
    showModalMessage, 
    API_BASE_URL,          // Ensure these are passed from the parent component (App)
    X, 
    Search, 
    Loader2, 
    LoadingSpinner,
    PlusCircle, ArrowLeft, Save, Trash2,
    GENDER_OPTIONS, STATUS_OPTIONS,
    AnimalImageUpload // Assuming this component is defined elsewhere
}) => {
    
    // Initial state setup (using the passed props for options)
    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            breederyId: animalToEdit.breederyId || animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || GENDER_OPTIONS[0],
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
			earset: animalToEdit.earset || '', 
            remarks: animalToEdit.remarks || '',
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: animalToEdit.fatherId_public || null,
            motherId_public: animalToEdit.motherId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            ownerName: animalToEdit.ownerName || '',
            isPregnant: animalToEdit.isPregnant || false,
            isNursing: animalToEdit.isNursing || false,
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
        } : {
            species: species, 
            breederyId: '',
            prefix: '',
            name: '',
            gender: GENDER_OPTIONS[0],
            birthDate: '', 
            status: 'Pet',
            color: '',
            coat: '',
			earset: '', 
            remarks: '',
            geneticCode: '',
            fatherId_public: null,
            motherId_public: null,
            breederId_public: null,
            ownerName: '',
            isPregnant: false,
            isNursing: false,
            isOwned: true,
            isDisplay: false,
        }
    );
    // Keep a ref for immediate pedigree selection (avoids lost state if user selects then immediately saves)
    const pedigreeRef = useRef({ father: (animalToEdit && animalToEdit.fatherId_public) || null, mother: (animalToEdit && animalToEdit.motherId_public) || null });
    // Small cached info for selected parents so we can show name/prefix next to CTID
    const [fatherInfo, setFatherInfo] = useState(null); // { id_public, prefix, name }
    const [motherInfo, setMotherInfo] = useState(null);
    const [breederInfo, setBreederInfo] = useState(null); // { id_public, personalName, breederName, showBreederName }

    // Helper: fetch a summary for an animal by public id. Try local (authenticated) first, then global display.
    const fetchAnimalSummary = async (idPublic) => {
        if (!idPublic) return null;
        try {
            // Try local animals endpoint with auth (returns array)
            const localResp = await axios.get(`${API_BASE_URL}/animals?id_public=${encodeURIComponent(idPublic)}`, { headers: { Authorization: `Bearer ${authToken}` } });
            if (Array.isArray(localResp.data) && localResp.data.length > 0) {
                const a = localResp.data[0];
                return { id_public: a.id_public, prefix: a.prefix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            }
        } catch (err) {
            // ignore and try global
        }

        try {
            const globalResp = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idPublic)}`);
            if (Array.isArray(globalResp.data) && globalResp.data.length > 0) {
                const a = globalResp.data[0];
                return { id_public: a.id_public, prefix: a.prefix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            }
        } catch (err) {
            // ignore
        }
        return null;
    };

    // Helper: fetch breeder/user info by public id
    const fetchBreederInfo = async (idPublic) => {
        if (!idPublic) return null;
        try {
            const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${idPublic}&limit=1`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                const user = response.data[0];
                return {
                    id_public: user.id_public,
                    personalName: user.personalName || '',
                    breederName: user.breederName || '',
                    showBreederName: user.showBreederName || false
                };
            }
        } catch (err) {
            console.warn('Failed to fetch breeder info:', err);
        }
        return null;
    };
    const [loading, setLoading] = useState(false);
    const [modalTarget, setModalTarget] = useState(null); 
    const [animalImageFile, setAnimalImageFile] = useState(null);
    const [animalImagePreview, setAnimalImagePreview] = useState(animalToEdit?.imageUrl || animalToEdit?.photoUrl || null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
        const handleSelectPedigree = async (idOrAnimal) => {
            const id = idOrAnimal && typeof idOrAnimal === 'object' ? idOrAnimal.id_public : idOrAnimal;
            
            // Handle breeder selection differently
            if (modalTarget === 'breeder') {
                setFormData(prev => ({ ...prev, breederId_public: id }));
                if (idOrAnimal && typeof idOrAnimal === 'object') {
                    // User object from search
                    const user = idOrAnimal;
                    const info = {
                        id_public: user.id_public,
                        personalName: user.personalName || '',
                        breederName: user.breederName || '',
                        showBreederName: user.showBreederName || false
                    };
                    setBreederInfo(info);
                } else if (id) {
                    // Fetch user info
                    try {
                        const info = await fetchBreederInfo(id);
                        setBreederInfo(info);
                    } catch (err) {
                        console.warn('Failed to fetch breeder info', err);
                    }
                } else {
                    setBreederInfo(null);
                }
                setModalTarget(null);
                return;
            }
            
            // Handle parent selection
            const idKey = modalTarget === 'father' ? 'fatherId_public' : 'motherId_public';
            setFormData(prev => ({ ...prev, [idKey]: id }));
        // Update ref immediately so save uses the latest selection even if state update is pending
        if (modalTarget === 'father') {
            pedigreeRef.current.father = id;
        } else {
            pedigreeRef.current.mother = id;
        }

        // If caller passed the whole animal object, use it directly to avoid refetch
        if (idOrAnimal && typeof idOrAnimal === 'object') {
            const a = idOrAnimal;
            const info = { id_public: a.id_public, prefix: a.prefix || '', name: a.name || '', backendId: a._id || a.id_backend || null };
            if (modalTarget === 'father') {
                setFatherInfo(info);
                pedigreeRef.current.fatherBackendId = info.backendId;
            } else {
                setMotherInfo(info);
                pedigreeRef.current.motherBackendId = info.backendId;
            }
        } else if (id) {
            // Fetch a small summary for display (non-blocking for the user)
            try {
                console.debug('Selecting parent id:', id, 'for modalTarget:', modalTarget);
                const info = await fetchAnimalSummary(id);
                console.debug('Fetched parent summary:', info);
                if (modalTarget === 'father') {
                    setFatherInfo(info);
                    pedigreeRef.current.fatherBackendId = info?.backendId || null;
                }
                else {
                    setMotherInfo(info);
                    pedigreeRef.current.motherBackendId = info?.backendId || null;
                }
            } catch (err) {
                console.warn('Failed to fetch parent summary', err);
            }
        } else {
            // cleared selection
            if (modalTarget === 'father') setFatherInfo(null);
            else setMotherInfo(null);
        }

        setModalTarget(null);
    };

    // Clear a selected parent (father or mother)
    const clearParentSelection = (which) => {
        console.log(`[DEBUG] Clearing ${which} parent - Before:`, {
            formData: {
                fatherId_public: formData.fatherId_public,
                motherId_public: formData.motherId_public
            },
            pedigreeRef: {
                father: pedigreeRef.current.father,
                mother: pedigreeRef.current.mother,
                fatherBackendId: pedigreeRef.current.fatherBackendId,
                motherBackendId: pedigreeRef.current.motherBackendId
            }
        });
        
        if (which === 'father') {
            setFormData(prev => ({ ...prev, fatherId_public: null }));
            pedigreeRef.current.father = null;
            pedigreeRef.current.fatherBackendId = null;
            setFatherInfo(null);
        } else {
            setFormData(prev => ({ ...prev, motherId_public: null }));
            pedigreeRef.current.mother = null;
            pedigreeRef.current.motherBackendId = null;
            setMotherInfo(null);
        }
        
        console.log(`[DEBUG] Clearing ${which} parent - After:`, {
            pedigreeRef: {
                father: pedigreeRef.current.father,
                mother: pedigreeRef.current.mother,
                fatherBackendId: pedigreeRef.current.fatherBackendId,
                motherBackendId: pedigreeRef.current.motherBackendId
            }
        });
    };

    // Clear breeder selection
    const clearBreederSelection = () => {
        console.log('[DEBUG] Clearing breeder selection');
        setFormData(prev => ({ ...prev, breederId_public: null }));
        setBreederInfo(null);
    };

    // When editing an existing animal, initialize parent and breeder info
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (animalToEdit) {
                const fId = animalToEdit.fatherId_public || null;
                const mId = animalToEdit.motherId_public || null;
                const bId = animalToEdit.breederId_public || null;
                console.log('Loading parent info for animal:', animalToEdit.id_public, 'fatherId:', fId, 'motherId:', mId, 'breederId:', bId);
                if (fId) {
                    try {
                        const info = await fetchAnimalSummary(fId);
                        console.log('Fetched father info:', info, 'for fatherId:', fId);
                        if (mounted) setFatherInfo(info);
                    } catch (e) { console.error('Failed to fetch father info:', e); }
                }
                if (mId) {
                    try {
                        const info = await fetchAnimalSummary(mId);
                        console.log('Fetched mother info:', info, 'for motherId:', mId);
                        if (mounted) setMotherInfo(info);
                    } catch (e) { console.error('Failed to fetch mother info:', e); }
                }
                if (bId) {
                    try {
                        const info = await fetchBreederInfo(bId);
                        console.log('Fetched breeder info:', info, 'for breederId:', bId);
                        if (mounted) setBreederInfo(info);
                    } catch (e) { console.error('Failed to fetch breeder info:', e); }
                }
            }
        })();
        return () => { mounted = false; };
    }, [animalToEdit]);

    // Fetch parent info when parent IDs change (for newly selected parents)
    useEffect(() => {
        let mounted = true;
        (async () => {
            // Fetch father info if we have an ID and either no info or the ID changed
            if (formData.fatherId_public && (!fatherInfo || fatherInfo.id_public !== formData.fatherId_public)) {
                try {
                    const info = await fetchAnimalSummary(formData.fatherId_public);
                    console.log('Fetched father info from formData:', info);
                    if (mounted) setFatherInfo(info);
                } catch (e) { 
                    console.error('Failed to fetch father info:', e);
                    if (mounted) setFatherInfo(null);
                }
            } else if (!formData.fatherId_public && fatherInfo) {
                // Clear father info if ID was removed
                if (mounted) setFatherInfo(null);
            }
            
            // Fetch mother info if we have an ID and either no info or the ID changed
            if (formData.motherId_public && (!motherInfo || motherInfo.id_public !== formData.motherId_public)) {
                try {
                    const info = await fetchAnimalSummary(formData.motherId_public);
                    console.log('Fetched mother info from formData:', info);
                    if (mounted) setMotherInfo(info);
                } catch (e) { 
                    console.error('Failed to fetch mother info:', e);
                    if (mounted) setMotherInfo(null);
                }
            } else if (!formData.motherId_public && motherInfo) {
                // Clear mother info if ID was removed
                if (mounted) setMotherInfo(null);
            }
        })();
        return () => { mounted = false; };
    }, [formData.fatherId_public, formData.motherId_public, fatherInfo, motherInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const method = animalToEdit ? 'put' : 'post';
        const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit.id_public}` : `${API_BASE_URL}/animals`;

        try {
            // Upload animal image first (if selected)
                let uploadedFilename = null;
                if (animalImageFile) {
                try {
                    const fd = new FormData();
                    fd.append('file', animalImageFile);
                    fd.append('type', 'animal');
                    const uploadResp = await axios.post(`${API_BASE_URL}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` } });
                    console.debug('Animal image upload response:', uploadResp?.status, uploadResp?.data);
                    // Build payload explicitly instead of mutating state directly
                    if (uploadResp?.data?.url) {
                        formData.imageUrl = uploadResp.data.url;
                    }
                    if (uploadResp?.data?.filename) {
                        uploadedFilename = uploadResp.data.filename;
                    }
                } catch (uploadErr) {
                    console.error('Animal image upload failed:', uploadErr?.response?.data || uploadErr.message);
                    showModalMessage('Image Upload', 'Failed to upload animal image. The record will be saved without the image.');
                }
            }

            // Prepare explicit payload to send to the API and log it for debugging
            // Merge in any immediate pedigree selections stored in `pedigreeRef` to avoid race conditions
            const payloadToSave = { ...formData };
            
            // Determine final parent values (pedigreeRef takes precedence if set, otherwise use formData)
            const finalFatherId = pedigreeRef.current.father !== undefined ? pedigreeRef.current.father : formData.fatherId_public;
            const finalMotherId = pedigreeRef.current.mother !== undefined ? pedigreeRef.current.mother : formData.motherId_public;
            
            console.log('[DEBUG] Parent removal check:', {
                pedigreeRefFather: pedigreeRef.current.father,
                pedigreeRefMother: pedigreeRef.current.mother,
                formDataFather: formData.fatherId_public,
                formDataMother: formData.motherId_public,
                finalFatherId,
                finalMotherId
            });
            
            // include backend objectIds for parents when available (but not if null - clearing)
            if (pedigreeRef.current.fatherBackendId) {
                payloadToSave.father = pedigreeRef.current.fatherBackendId;
            } else if (finalFatherId === null) {
                payloadToSave.father = null;
            }
            if (pedigreeRef.current.motherBackendId) {
                payloadToSave.mother = pedigreeRef.current.motherBackendId;
            } else if (finalMotherId === null) {
                payloadToSave.mother = null;
            }
            
            payloadToSave.fatherId_public = finalFatherId;
            payloadToSave.motherId_public = finalMotherId;

            // Also include common alias fields and numeric conversions to match backend expectations
            const fVal = finalFatherId !== null && finalFatherId !== undefined ? Number(finalFatherId) : null;
            const mVal = finalMotherId !== null && finalMotherId !== undefined ? Number(finalMotherId) : null;
            
            // Always send father fields (even if null to clear)
            payloadToSave.fatherId = fVal;
            payloadToSave.father_id = fVal;
            payloadToSave.father_public = fVal;
            payloadToSave.sireId_public = fVal;
            
            // Always send mother fields (even if null to clear)
            payloadToSave.motherId = mVal;
            payloadToSave.mother_id = mVal;
            payloadToSave.mother_public = mVal;
            payloadToSave.damId_public = mVal;
            
            console.log('[DEBUG] Final payload parent fields:', {
                fatherId_public: payloadToSave.fatherId_public,
                motherId_public: payloadToSave.motherId_public,
                sireId_public: payloadToSave.sireId_public,
                damId_public: payloadToSave.damId_public
            });

            // If an image URL was set by the upload step, also populate common alternate keys
            // so backend implementations that expect different field names still receive the URL.
            const returnedUrl = payloadToSave.imageUrl || payloadToSave.photoUrl || payloadToSave.profileImage || payloadToSave.image_path || null;
            if (returnedUrl) {
                payloadToSave.imageUrl = payloadToSave.imageUrl || returnedUrl;
                payloadToSave.photoUrl = payloadToSave.photoUrl || returnedUrl;
                payloadToSave.profileImage = payloadToSave.profileImage || returnedUrl;
                payloadToSave.profileImageUrl = payloadToSave.profileImageUrl || returnedUrl;
                payloadToSave.image_path = payloadToSave.image_path || returnedUrl;
                payloadToSave.photo = payloadToSave.photo || returnedUrl;
                payloadToSave.image_url = payloadToSave.image_url || returnedUrl;
            }

            // Expose the final payload to the page for easy runtime inspection in DevTools
            try {
                try {
                    window.__lastAnimalPayload = payloadToSave;
                    console.debug('window.__lastAnimalPayload set (inspect in console)');
                } catch (exposeErr) {
                    console.warn('Could not set window.__lastAnimalPayload:', exposeErr);
                }
                console.debug('Animal payload about to be saved:', payloadToSave);

                await onSave(method, url, payloadToSave);
            } catch (saveErr) {
                // If we uploaded a file but the animal save failed, attempt cleanup to avoid orphan files.
                if (uploadedFilename) {
                    try {
                        await axios.delete(`${API_BASE_URL}/upload/${uploadedFilename}`, { headers: { Authorization: `Bearer ${authToken}` } });
                    } catch (cleanupErr) {
                        console.warn('Failed to cleanup uploaded file after save failure:', cleanupErr?.response?.data || cleanupErr.message);
                    }
                }
                throw saveErr;
            }

            // Notify other parts of the app that animals changed so lists refresh
            try { window.dispatchEvent(new Event('animals-changed')); } catch (e) { /* ignore */ }

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
    const requiredGender = modalTarget === 'father' ? 'Male' : 'Female';

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            {/* --- Parent Search Modal --- */}
            {modalTarget && modalTarget !== 'breeder' && ( 
                <ParentSearchModal
                    title={modalTarget === 'father' ? 'Sire' : 'Dam'} 
                    currentId={currentId} 
                    onSelect={handleSelectPedigree} 
                    onClose={() => setModalTarget(null)} 
                    authToken={authToken} 
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={requiredGender}
                    birthDate={formData.birthDate} 
                /> 
            )}

            {/* --- Breeder Search Modal --- */}
            {modalTarget === 'breeder' && (
                <UserSearchModal
                    onClose={() => setModalTarget(null)}
                    onSelectUser={handleSelectPedigree}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    modalTarget={modalTarget}
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
                {/* STATUS & PRIVACY FLAGS */}
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
                        {formData.gender === 'Female' && (
                            <>
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input type="checkbox" name="isPregnant" checked={formData.isPregnant} onChange={handleChange} 
                                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                    <span>Female is Pregnant 🥚</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input type="checkbox" name="isNursing" checked={formData.isNursing} onChange={handleChange} 
                                        className="h-4 w-4 bg-blue-600 text-white rounded border-gray-300 focus:ring-blue-600" />
                                    <span>Female is Nursing 🥛</span>
                                </label>
                            </>
                        )}
                    </div>
                </div>
                {/* ------------------------------------------- */}

                {/* Image Upload Placeholder */}
                <AnimalImageUpload imageUrl={animalImagePreview} onFileChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const original = e.target.files[0];
                        try {
                            // Compress to target <=200KB if possible. Prefer a Web Worker-based compressor
                            // (non-blocking) and fall back to the existing main-thread functions when unavailable.
                            let compressedBlob = null;

                            try {
                                compressedBlob = await compressImageWithWorker(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                            } catch (werr) {
                                console.warn('Worker compression failed unexpectedly:', werr);
                                compressedBlob = null;
                            }

                            if (!compressedBlob) {
                                // Worker not available or failed — fallback to main-thread compression
                                try {
                                    compressedBlob = await compressImageToMaxSize(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                                } catch (err) {
                                    console.warn('Compression-to-size failed, falling back to single-pass compress:', err);
                                    compressedBlob = await compressImageFile(original, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
                                }
                            }
                            // If compressImageFile returned the original File/Blob, wrap if needed
                            const mime = compressedBlob.type || original.type;
                            const baseName = original.name.replace(/\.[^/.]+$/, '');
                            const ext = mime === 'image/png' ? '.png' : '.jpg';
                            const compressedFile = new File([compressedBlob], `${baseName}${ext}`, { type: mime });
                            // Warn if we couldn't reach target size (best-effort)
                            if (compressedBlob.size > 200 * 1024) {
                                showModalMessage('Image Compression', 'Image was compressed but is still larger than 200KB. It will be uploaded but consider using a smaller image.');
                            }
                            setAnimalImageFile(compressedFile);
                            setAnimalImagePreview(URL.createObjectURL(compressedFile));
                        } catch (err) {
                            console.warn('Image compression failed, using original file', err);
                            setAnimalImageFile(original);
                            setAnimalImagePreview(URL.createObjectURL(original));
                        }
                    }
                }} disabled={loading} />

                {/* ------------------------------------------- */}
                {/* PRIMARY INPUT FIELDS (THE MISSING SECTION) */}
                {/* ------------------------------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg">
                    					
					{/* Breedery ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Breedery ID</label>
                        <input type="text" name="breederyId" value={formData.breederyId} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Prefix */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prefix</label>
                        <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name*</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <input type="text" name="color" value={formData.color} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Coat */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Coat</label>
                        <input type="text" name="coat" value={formData.coat} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
                    {/* --- NEW: EARSET ENTRY (CONDITIONAL ON SPECIES === 'Rat') --- */}
                    {formData.species === 'Rat' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Earset</label>
                            <input type="text" name="earset" value={formData.earset} onChange={handleChange} 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                        </div>
                    )}
                    
                    {/* Genetic Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Genetic Code</label>
                        <input type="text" name="geneticCode" value={formData.geneticCode} onChange={handleChange} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender*</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" >
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
					
					 {/* Birthdate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birthdate*</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
					
					{/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status*</label>
                        <select name="status" value={formData.status} onChange={handleChange} required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                {/* ------------------------------------------- */}

                {/* ------------------------------------------- */}
                {/* Pedigree Section */}
                {/* ------------------------------------------- */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Pedigree: Sire and Dam 🌳</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Sire (Father)</label>
                                <div 
                                    onClick={() => !loading && setModalTarget('father')}
                                    className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                                >
                                    <div className="flex items-center space-x-2 w-full">
                                    {formData.fatherId_public && fatherInfo ? (
                                        <span className="text-gray-800">
                                            {fatherInfo.prefix && `${fatherInfo.prefix} `}{fatherInfo.name}
                                        </span>
                                    ) : (
                                        <span className={formData.fatherId_public ? "text-gray-800 font-mono" : "text-gray-400"}>
                                            {formData.fatherId_public ? `CT${formData.fatherId_public}` : 'Click to Select Sire'}
                                        </span>
                                    )}
                                    {formData.fatherId_public && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); clearParentSelection('father'); }}
                                            title="Clear sire selection"
                                            className="text-sm text-red-500 hover:text-red-700 p-1 rounded"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                    </div>
                                </div>
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Dam (Mother)</label>
                            <div 
                                onClick={() => !loading && setModalTarget('mother')}
                                className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                            >
                                <div className="flex items-center space-x-2 w-full">
                                    {formData.motherId_public && motherInfo ? (
                                        <span className="text-gray-800">
                                            {motherInfo.prefix && `${motherInfo.prefix} `}{motherInfo.name}
                                        </span>
                                    ) : (
                                        <span className={formData.motherId_public ? "text-gray-800 font-mono" : "text-gray-400"}>
                                            {formData.motherId_public ? `CT${formData.motherId_public}` : 'Click to Select Dam'}
                                        </span>
                                    )}
                                    {formData.motherId_public && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); clearParentSelection('mother'); }}
                                            title="Clear dam selection"
                                            className="text-sm text-red-500 hover:text-red-700 p-1 rounded"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ------------------------------------------- */}

                {/* ------------------------------------------- */}
                {/* Breeder & Owner Section */}
                {/* ------------------------------------------- */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Breeder & Owner</h3>
                    <div className="space-y-4">
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Breeder</label>
                            <div 
                                onClick={() => !loading && setModalTarget('breeder')}
                                className="flex flex-col items-start p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition disabled:opacity-50"
                            >
                                <div className="flex items-center space-x-2 w-full">
                                    {formData.breederId_public && breederInfo ? (
                                        <span className="text-gray-800">
                                            {breederInfo.showBreederName && breederInfo.personalName && breederInfo.breederName 
                                                ? `${breederInfo.personalName} (${breederInfo.breederName})` 
                                                : (breederInfo.showBreederName && breederInfo.breederName 
                                                    ? breederInfo.breederName 
                                                    : breederInfo.personalName || 'Anonymous Breeder')}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">
                                            {formData.breederId_public ? 'Loading...' : 'Click to Select Breeder (defaults to you)'}
                                        </span>
                                    )}
                                    {formData.breederId_public && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); clearBreederSelection(); }}
                                            title="Clear breeder selection"
                                            className="text-sm text-red-500 hover:text-red-700 p-1 rounded"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-gray-600 mb-1'>Owner Name</label>
                            <input 
                                type="text" 
                                name="ownerName" 
                                value={formData.ownerName} 
                                onChange={handleChange}
                                placeholder="Leave empty to not display"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                            />
                            <p className="text-xs text-gray-500 mt-1">This field is only shown in your private view, not on public profiles.</p>
                        </div>
                    </div>
                </div>
                {/* ------------------------------------------- */}
                
                {/* Remarks */}
                <div className='mt-4'>
                    <label className="block text-sm font-medium text-gray-700">Remarks / Notes</label>
                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                </div>
                
                {/* Submit/Delete Buttons */}
                <div className="mt-8 flex justify-between items-center border-t pt-4">
                    <div className="flex space-x-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                            <ArrowLeft size={18} />
                            <span>Back to Profile</span>
                        </button>
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={(e) => {
                                    try {
                                        console.log('Save button clicked (frontend debug)');
                                        const form = e.target && e.target.closest ? e.target.closest('form') : document.querySelector('form');
                                        if (form) {
                                            console.log('form.checkValidity():', form.checkValidity());
                                            Array.from(form.elements).forEach(el => {
                                                if (el.willValidate && !el.checkValidity()) {
                                                    console.warn('INVALID FIELD:', el.name || el.id || el.placeholder, el.validity, el.value);
                                                }
                                            });
                                        }
                                    } catch (err) {
                                        console.error('Save-button debug failed', err);
                                    }
                                }}
                                className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                <span>{loading ? 'Saving...' : 'Save Animal'}</span>
                            </button>
                    </div>
                    {animalToEdit && onDelete && (
                        <button type="button" onClick={() => { if(window.confirm(`Are you sure you want to delete ${animalToEdit.name}? This action cannot be undone.`)) { onDelete(animalToEdit.id_public); } }} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2" > 
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

    const formattedCreationDate = userProfile.creationDate
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.creationDate))
        : 'N/A';
    
    const ProfileImage = () => {
        const img = userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image || null;
        if (img) {
            return (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
                    <img src={img} alt={userProfile.personalName} className="w-full h-full object-cover" />
                </div>
            );
        }

        return (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
                <User size={40} />
            </div>
        );
    };

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
                        CT{userProfile.id_public}
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
    const [profileImageURL, setProfileImageURL] = useState(
        userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image || null
    ); 
    const [profileLoading, setProfileLoading] = useState(false);

    // Keep local preview in sync when parent `userProfile` updates (e.g., after save)
    useEffect(() => {
        const img = userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image || null;
        setProfileImageURL(img);
    }, [userProfile]);

    const [email, setEmail] = useState(userProfile.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const original = e.target.files[0];
            try {
                const compressedBlob = await compressImageToMaxSize(original, 200 * 1024, { maxWidth: 1200, maxHeight: 1200, startQuality: 0.85 });
                const mime = compressedBlob.type || original.type;
                const baseName = original.name.replace(/\.[^/.]+$/, '');
                const ext = mime === 'image/png' ? '.png' : '.jpg';
                const compressedFile = new File([compressedBlob], `${baseName}${ext}`, { type: mime });
                if (compressedBlob.size > 200 * 1024) {
                    showModalMessage('Image Compression', 'Image was compressed but remains larger than 200KB. Consider using a smaller image for faster uploads.');
                }
                setProfileImageFile(compressedFile);
                setProfileImageURL(URL.createObjectURL(compressedFile));
            } catch (err) {
                console.warn('Profile image compression failed, using original file', err);
                setProfileImageFile(original);
                setProfileImageURL(URL.createObjectURL(original));
            }
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
            let uploadSucceeded = false;
            let uploadData = null;

            if (profileImageFile) {
                try {
                    const fd = new FormData();
                    fd.append('file', profileImageFile);
                    fd.append('type', 'profile');
                    console.log('Profile: attempting upload to', `${API_BASE_URL}/upload`);
                    const uploadResp = await axios.post(`${API_BASE_URL}/upload`, fd, { headers: { Authorization: `Bearer ${authToken}` } });
                    console.log('Profile upload response:', uploadResp.status, uploadResp.data);
                    if (uploadResp?.data) {
                        uploadData = uploadResp.data;
                        const returnedUrl = uploadResp.data.url || uploadResp.data.path || (uploadResp.data.data && (uploadResp.data.data.url || uploadResp.data.data.path));
                        if (returnedUrl) {
                            payload.profileImage = returnedUrl;
                            payload.profileImageUrl = returnedUrl;
                            payload.imageUrl = returnedUrl;
                            payload.avatarUrl = returnedUrl;
                            payload.profile_image = returnedUrl;
                            uploadSucceeded = true;
                        }
                    }
                } catch (uploadErr) {
                    console.error('Profile image upload failed:', uploadErr?.response?.data || uploadErr.message);
                    showModalMessage('Image Upload', 'Upload endpoint failed — will attempt fallback save (file included in profile PUT).');
                }
            }

            if (uploadSucceeded) {
                console.log('Profile: sending JSON profile update with image URL', payload.profileImageUrl);
                const resp = await axios.put(`${API_BASE_URL}/users/profile`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Try to obtain updated user object from response
                const updatedUser = resp?.data?.user || resp?.data || null;
                if (onSaveSuccess) await onSaveSuccess(updatedUser);
            } else if (profileImageFile) {
                try {
                    const form = new FormData();
                    form.append('profileImage', profileImageFile);
                    form.append('avatar', profileImageFile);
                    form.append('file', profileImageFile);
                    Object.keys(payload).forEach(k => {
                        if (payload[k] !== undefined && payload[k] !== null) form.append(k, payload[k]);
                    });
                    console.log('Profile: attempting multipart PUT to users/profile with form keys:', Array.from(form.keys()));
                    const profileResp = await axios.put(`${API_BASE_URL}/users/profile`, form, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    console.log('Profile multipart PUT response:', profileResp.status, profileResp.data);
                    const updatedUser = profileResp?.data?.user || profileResp?.data || null;
                    if (onSaveSuccess) await onSaveSuccess(updatedUser);
                } catch (fmErr) {
                    console.error('Profile multipart PUT failed:', fmErr?.response?.data || fmErr.message);
                    showModalMessage('Error', 'Failed to save profile with image. See console/network logs for details.');
                    throw fmErr;
                }
            } else {
                const resp = await axios.put(`${API_BASE_URL}/users/profile`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const updatedUser = resp?.data?.user || resp?.data || null;
                if (onSaveSuccess) await onSaveSuccess(updatedUser);
            }
            showModalMessage('Success', 'Profile information updated successfully.');
            // If onSaveSuccess wasn't called with an updatedUser above, call it now without args
            if (onSaveSuccess) await onSaveSuccess(); 
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

const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken, onProfileUpdated }) => {
    const [isEditing, setIsEditing] = useState(false);

    if (!userProfile) return <LoadingSpinner />;

    if (isEditing) {
        return (
            <ProfileEditForm 
                userProfile={userProfile} 
                showModalMessage={showModalMessage} 
                onSaveSuccess={(updatedUser) => { 
                    if (updatedUser && typeof onProfileUpdated === 'function') {
                        onProfileUpdated(updatedUser);
                    } else {
                        fetchUserProfile(authToken);
                    }
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
                    <p className="text-3xl font-extrabold text-accent">CT{userProfile.id_public}</p>
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

    const ParentCard = ({ parentId, parentType, authToken, API_BASE_URL, onViewAnimal }) => {
        const [parentData, setParentData] = React.useState(null);
        const [loading, setLoading] = React.useState(false);
        const [notFound, setNotFound] = React.useState(false);

        React.useEffect(() => {
            if (!parentId) {
                setParentData(null);
                setNotFound(false);
                return;
            }

            const fetchParent = async () => {
                setLoading(true);
                setNotFound(false);
                try {
                    // First try to fetch from user's own animals (they might own the parent)
                    try {
                        const ownedResponse = await axios.get(`${API_BASE_URL}/animals/${parentId}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        if (ownedResponse.data) {
                            setParentData(ownedResponse.data);
                            setLoading(false);
                            return;
                        }
                    } catch (ownedError) {
                        // Not in user's collection, try public database
                        console.log(`Parent CT${parentId} not in user's collection, trying public database`);
                    }

                    // Try fetching from global public animals database
                    const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${parentId}`);
                    if (publicResponse.data && publicResponse.data.length > 0) {
                        setParentData(publicResponse.data[0]);
                    } else {
                        // Animal not found in either collection - treat as if no parent recorded
                        console.warn(`Parent CT${parentId} not found in local or public collections`);
                        setNotFound(true);
                        setParentData(null);
                    }
                } catch (error) {
                    console.error(`Error fetching ${parentType}:`, error);
                    setNotFound(true);
                    setParentData(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchParent();
        }, [parentId, parentType, authToken, API_BASE_URL]);

    if (!parentId || notFound) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No {parentType} recorded</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border-2 border-gray-300 rounded-lg p-4 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!parentData) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Loading {parentType} data...</p>
            </div>
        );
    }

    const imgSrc = parentData.imageUrl || parentData.photoUrl || null;

    return (
        <div 
            className="border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewAnimal(parentData)}
        >
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <p className="text-xs font-semibold text-gray-600">{parentType}</p>
            </div>
            <div className="p-3 flex flex-col items-center">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-2">
                    {imgSrc ? (
                        <img src={imgSrc} alt={parentData.name} className="w-full h-full object-cover" />
                    ) : (
                        <Cat size={28} className="text-gray-400" />
                    )}
                </div>

                {/* Icon row */}
                <div className="flex justify-center items-center space-x-2 mb-2">
                    {parentData.isOwned ? (
                        <Heart size={12} className="text-black" />
                    ) : (
                        <HeartOff size={12} className="text-black" />
                    )}
                    {parentData.isDisplay ? (
                        <Eye size={12} className="text-black" />
                    ) : (
                        <EyeOff size={12} className="text-black" />
                    )}
                    {parentData.isPregnant && <Egg size={12} className="text-black" />}
                    {parentData.isNursing && <Milk size={12} className="text-black" />}
                </div>

                {/* Name */}
                <div className="text-center mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {parentData.prefix ? `${parentData.prefix} ` : ''}{parentData.name}
                    </p>
                </div>

                {/* ID */}
                <div className="text-center mb-2">
                    <p className="text-xs text-gray-500">CT{parentData.id_public}</p>
                </div>

                {/* Status bar */}
                <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700">{parentData.status || 'Unknown'}</p>
                </div>
            </div>
        </div>
    );
};

const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onViewAnimal, onSetCurrentView }) => {
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
                    const registry = (a.breederyId || a.registryCode || '').toString().toLowerCase();
                    const idPublic = (a.id_public || '').toString().toLowerCase();
                    return name.includes(term) || registry.includes(term) || idPublic.includes(term.replace(/^ct-?/,'').toLowerCase());
                });
            }

            // Enforce that males are excluded when pregnant or nursing filters are active
            if (statusFilterPregnant || statusFilterNursing) {
                data = data.filter(a => {
                    const gender = (a.gender || '').toString().toLowerCase();
                    return gender !== 'male';
                });
            }

            // Ensure only animals with the actual boolean flags are shown when those filters are enabled
            if (statusFilterPregnant) {
                data = data.filter(a => a.isPregnant === true);
            }
            if (statusFilterNursing) {
                data = data.filter(a => a.isNursing === true);
            }

            // Cache-bust any image URLs so updated uploads appear immediately
            data = data.map(a => {
                const img = a.imageUrl || a.photoUrl || null;
                if (img) {
                    const busted = img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`;
                    return { ...a, imageUrl: busted, photoUrl: busted };
                }
                return a;
            });

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

    // Refresh animals when other parts of the app signal a change (e.g., after upload/save)
    useEffect(() => {
        const handleAnimalsChanged = () => {
            try { fetchAnimals(); } catch (e) { /* ignore */ }
        };
        window.addEventListener('animals-changed', handleAnimalsChanged);
        return () => window.removeEventListener('animals-changed', handleAnimalsChanged);
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

    const AnimalCard = ({ animal, onEditAnimal }) => {
        const birth = animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '';
        const imgSrc = animal.imageUrl || animal.photoUrl || null;

        return (
            <div className="w-full flex justify-center">
                <div
                    onClick={() => onViewAnimal(animal)}
                    className="relative bg-white rounded-xl shadow-sm w-44 h-56 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-3"
                >
                    {/* Birthdate top-left */}
                    {birth && (
                        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                            {birth}
                        </div>
                    )}

                    {/* Gender badge top-right */}
                    {animal.gender && (
                        <div className={`absolute top-2 right-2`} title={animal.gender}>
                            {animal.gender === 'Male' ? <Mars size={16} strokeWidth={2.5} className="text-primary" /> : <Venus size={16} strokeWidth={2.5} className="text-accent" />}
                        </div>
                    )}

                    {/* Centered profile image */}
                    <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                        {imgSrc ? (
                            <img src={imgSrc} alt={animal.name} className="w-24 h-24 object-cover rounded-md" />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                <Cat size={36} />
                            </div>
                        )}
                    </div>
                    
                    {/* Icon row */}
                    <div className="w-full flex justify-center items-center space-x-2 py-1">
                        {animal.isOwned ? (
                            <Heart size={14} className="text-black" />
                        ) : (
                            <HeartOff size={14} className="text-black" />
                        )}
                        {animal.isDisplay ? (
                            <Eye size={14} className="text-black" />
                        ) : (
                            <EyeOff size={14} className="text-black" />
                        )}
                        {animal.isPregnant && <Egg size={14} className="text-black" />}
                        {animal.isNursing && <Milk size={14} className="text-black" />}
                    </div>
                    
                    {/* Prefix / Name under image */}
                    <div className="w-full text-center px-2 pb-1">
                        <div className="text-sm font-semibold text-gray-800 truncate">{animal.prefix ? `${animal.prefix} ` : ''}{animal.name}</div>
                    </div>

                    {/* Edit is available when viewing full card; remove inline edit icon from dashboard cards */}

                    {/* ID bottom-right */}
                    <div className="w-full px-2 pb-2 flex justify-end">
                        <div className="text-xs text-gray-500">CT{animal.id_public}</div>
                    </div>
                    
                    {/* Status bar at bottom */}
                    <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                        <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                    </div>
                </div>
            </div>
        );
    };

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
                            statusFilterPregnant ? 'bg-accent text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Egg size={16} /> <span>Pregnant</span>
                    </button>
                    <button onClick={handleFilterNursing}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${ 
                            statusFilterNursing ? 'bg-accent text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

// Notification Panel Component
const NotificationPanel = ({ authToken, API_BASE_URL, onClose, showModalMessage }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (notificationId) => {
        setProcessing(notificationId);
        try {
            await axios.post(`${API_BASE_URL}/notifications/${notificationId}/approve`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Approved', 'Request approved successfully');
            fetchNotifications();
        } catch (error) {
            console.error('Error approving notification:', error);
            showModalMessage('Error', 'Failed to approve request');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (notificationId) => {
        setProcessing(notificationId);
        try {
            await axios.post(`${API_BASE_URL}/notifications/${notificationId}/reject`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Rejected', 'Request rejected and link removed');
            fetchNotifications();
        } catch (error) {
            console.error('Error rejecting notification:', error);
            showModalMessage('Error', 'Failed to reject request');
        } finally {
            setProcessing(null);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const pendingNotifications = notifications.filter(n => n.status === 'pending');
    const otherNotifications = notifications.filter(n => n.status !== 'pending');

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                    ) : (
                        <>
                            {pendingNotifications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">Pending Requests</h4>
                                    {pendingNotifications.map(notification => (
                                        <div key={notification._id} className={`border rounded-lg p-4 mb-2 ${!notification.read ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                                            <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApprove(notification._id)}
                                                    disabled={processing === notification._id}
                                                    className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                >
                                                    <Check size={14} />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReject(notification._id)}
                                                    disabled={processing === notification._id}
                                                    className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                >
                                                    <XCircle size={14} />
                                                    <span>Reject</span>
                                                </button>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="text-xs text-gray-600 hover:text-gray-800 px-2"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {otherNotifications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">History</h4>
                                    {otherNotifications.map(notification => (
                                        <div key={notification._id} className="border rounded-lg p-4 mb-2 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-grow">
                                                    <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString()} • 
                                                        <span className={`ml-1 ${notification.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {notification.status}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(notification._id)}
                                                    className="text-gray-400 hover:text-red-600 ml-2"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
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
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const [showUserSearchModal, setShowUserSearchModal] = useState(false);
    const [viewingPublicProfile, setViewingPublicProfile] = useState(null);
    const [viewingPublicAnimal, setViewingPublicAnimal] = useState(null);
    const [viewAnimalBreederInfo, setViewAnimalBreederInfo] = useState(null);
    const [animalToView, setAnimalToView] = useState(null);

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
            // Normalize profile image keys for UI compatibility and add a cache-busting query
            const user = response.data || {};
            const img = user.profileImage || user.profileImageUrl || user.imageUrl || user.avatarUrl || user.avatar || user.profile_image || null;
            if (img) {
                const busted = img.includes('?') ? `${img}&t=${Date.now()}` : `${img}?t=${Date.now()}`;
                // prefer `profileImage` and also set `profileImageUrl` for backwards compatibility
                user.profileImage = busted;
                user.profileImageUrl = busted;
            }
            setUserProfile(user);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            showModalMessage('Authentication Error', 'Could not load user profile. Please log in again.');
            setAuthToken(null);
        }
    }, [showModalMessage]);

    // Fetch breeder info when viewing an animal
    useEffect(() => {
        const fetchViewBreederInfo = async () => {
            if (animalToView?.breederId_public && currentView === 'view-animal') {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=CT${animalToView.breederId_public}&limit=1`
                    );
                    if (response.data && response.data.length > 0) {
                        setViewAnimalBreederInfo(response.data[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch breeder info for view:', error);
                    setViewAnimalBreederInfo(null);
                }
            } else {
                setViewAnimalBreederInfo(null);
            }
        };
        fetchViewBreederInfo();
    }, [animalToView, currentView, API_BASE_URL]);

    const fetchNotificationCount = useCallback(async () => {
        if (!authToken) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setNotificationCount(response.data?.count || 0);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    }, [authToken]);

    useEffect(() => {
        if (authToken) {
            fetchNotificationCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotificationCount, 30000);
            return () => clearInterval(interval);
        }
    }, [authToken, fetchNotificationCount]);
	
    const handleLoginSuccess = (token) => {
        setAuthToken(token);
        try {
            localStorage.setItem('authToken', token);
        } catch (e) {
            console.warn('Could not persist authToken to localStorage', e);
        }
        setCurrentView('list');
        setIsRegister(false);
    };

    const handleEditAnimal = (animal) => {
        setAnimalToEdit(animal);
        setSpeciesToAdd(animal.species); 
        setCurrentView('edit-animal');
    };

    const handleViewAnimal = (animal) => {
        setAnimalToView(animal);
        setCurrentView('view-animal');
    };

    // Set up global handler for viewing public animals from search modal
    useEffect(() => {
        window.handleViewPublicAnimal = (animal) => {
            setViewingPublicAnimal(animal);
        };
        return () => {
            delete window.handleViewPublicAnimal;
        };
    }, []);

    const handleSaveAnimal = async (method, url, data) => {
        if (userProfile && !data.ownerId_public) {
            data.ownerId_public = userProfile.id_public;
        }
        try {
            console.debug('handleSaveAnimal called:', method, url, data);
            const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
            let response;
            if (method === 'post') {
                response = await axios.post(url, data, { headers });
            } else if (method === 'put') {
                response = await axios.put(url, data, { headers });
            }
            
            // After saving, if we were editing an animal, refetch it to get updated data
            if (method === 'put' && animalToEdit) {
                try {
                    const refreshedAnimal = await axios.get(`${API_BASE_URL}/animals/${animalToEdit.id_public}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setAnimalToView(refreshedAnimal.data);
                } catch (refreshError) {
                    console.error('Failed to refresh animal data after save:', refreshError);
                    // Still use the old data if refresh fails
                    setAnimalToView(animalToEdit);
                }
            }
            
            return response;
        } catch (error) {
            console.error('handleSaveAnimal error:', error.response?.data || error.message || error);
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
            case 'publicProfile':
                return (
                    <PublicProfileView 
                        profile={viewingPublicProfile}
                        onBack={() => { setViewingPublicProfile(null); setCurrentView('list'); }}
                        onViewAnimal={(animal) => setViewingPublicAnimal(animal)}
                        API_BASE_URL={API_BASE_URL}
                    />
                );
            case 'profile':
                return <ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} onProfileUpdated={setUserProfile} />;
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
                // If no species has been selected yet, show the selector first
                if (!speciesToAdd) {
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
                }

                // speciesToAdd is set — render the AnimalForm
                const addFormTitle = `Add New ${speciesToAdd}`;
                return (
                    <AnimalForm
                        formTitle={addFormTitle}
                        animalToEdit={null}
                        species={speciesToAdd}
                        onSave={handleSaveAnimal}
                        onCancel={() => { setCurrentView('list'); setSpeciesToAdd(null); }}
                        onDelete={null}
                        authToken={authToken}
                        showModalMessage={showModalMessage}
                        API_BASE_URL={API_BASE_URL}
                        X={X}
                        Search={Search}
                        Loader2={Loader2}
                        LoadingSpinner={LoadingSpinner}
                        PlusCircle={PlusCircle}
                        ArrowLeft={ArrowLeft}
                        Save={Save}
                        Trash2={Trash2}
                        GENDER_OPTIONS={GENDER_OPTIONS}
                        STATUS_OPTIONS={STATUS_OPTIONS}
                        AnimalImageUpload={AnimalImageUpload}
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
                        onCancel={() => { setAnimalToView(animalToEdit); setCurrentView('view-animal'); }} 
                        onDelete={handleDeleteAnimal}
                        authToken={authToken} 
                        showModalMessage={showModalMessage}
                        API_BASE_URL={API_BASE_URL}
                        X={X}
                        Search={Search}
                        Loader2={Loader2}
                        LoadingSpinner={LoadingSpinner}
                        PlusCircle={PlusCircle}
                        ArrowLeft={ArrowLeft}
                        Save={Save}
                        Trash2={Trash2}
                        GENDER_OPTIONS={GENDER_OPTIONS}
                        STATUS_OPTIONS={STATUS_OPTIONS}
                        AnimalImageUpload={AnimalImageUpload}
                    />
                );
            case 'view-animal':
                if (!animalToView) return null;
                const formattedBirthDate = animalToView.birthDate
                    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(animalToView.birthDate))
                    : '—';
                return (
                    <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-start justify-between mb-6">
                            <button onClick={() => setCurrentView('list')} className="flex items-center text-gray-600 hover:text-gray-800 font-medium">
                                <ArrowLeft size={20} className="mr-2" />
                                Back to Dashboard
                            </button>
                            <button onClick={() => { setAnimalToEdit(animalToView); setSpeciesToAdd(animalToView.species); setCurrentView('edit-animal'); }} className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg">Edit</button>
                        </div>

                        {/* Main Info Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <div className="flex items-start space-x-6">
                                <div>
                                    <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        { (animalToView.imageUrl || animalToView.photoUrl) ? (
                                            <img src={animalToView.imageUrl || animalToView.photoUrl} alt={animalToView.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Cat size={72} className="text-gray-400" />
                                        ) }
                                    </div>
                                    {/* Status bar */}
                                    <div className="w-40 bg-gray-200 py-2 text-center mt-2 rounded border-2 border-gray-400">
                                        <div className="text-sm font-semibold text-gray-800">{animalToView.status || 'Unknown'}</div>
                                    </div>
                                    {/* Icon row */}
                                    <div className="w-40 flex justify-center items-center space-x-3 py-2">
                                        {animalToView.isOwned ? (
                                            <Heart size={18} className="text-black" />
                                        ) : (
                                            <HeartOff size={18} className="text-black" />
                                        )}
                                        {animalToView.isDisplay ? (
                                            <Eye size={18} className="text-black" />
                                        ) : (
                                            <EyeOff size={18} className="text-black" />
                                        )}
                                        {animalToView.isPregnant && <Egg size={18} className="text-black" />}
                                        {animalToView.isNursing && <Milk size={18} className="text-black" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{animalToView.prefix ? `${animalToView.prefix} ` : ''}{animalToView.name}</h2>
                                    <p className="text-sm text-gray-600 mb-4">{animalToView.species} &nbsp; • &nbsp; CT{animalToView.id_public}</p>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                                        <div><strong>Gender:</strong> {animalToView.gender}</div>
                                        <div><strong>Color:</strong> {animalToView.color || '—'}</div>
                                        <div><strong>Coat:</strong> {animalToView.coat || '—'}</div>
                                        <div><strong>Breedery ID:</strong> {animalToView.breederyId || animalToView.registryCode || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Genetic Code Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Genetic Code</h3>
                            {animalToView.geneticCode ? (
                                <p className="text-gray-700 text-sm font-mono">{animalToView.geneticCode}</p>
                            ) : (
                                <p className="text-gray-500 text-sm italic">No genetic code recorded.</p>
                            )}
                        </div>

                        {/* Breeder & Owner Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Breeder & Owner</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                    <strong>Breeder:</strong>{' '}
                                    {animalToView.breederId_public ? (
                                        viewAnimalBreederInfo ? (
                                            <span>
                                                {viewAnimalBreederInfo.showBreederName && viewAnimalBreederInfo.personalName && viewAnimalBreederInfo.breederName 
                                                    ? `${viewAnimalBreederInfo.personalName} (${viewAnimalBreederInfo.breederName})` 
                                                    : (viewAnimalBreederInfo.showBreederName && viewAnimalBreederInfo.breederName 
                                                        ? viewAnimalBreederInfo.breederName 
                                                        : viewAnimalBreederInfo.personalName || 'Anonymous Breeder')}
                                            </span>
                                        ) : (
                                            <span className="font-mono text-accent">CT{animalToView.breederId_public}</span>
                                        )
                                    ) : (
                                        <span className="text-gray-500 italic">Not specified</span>
                                    )}
                                </div>
                                {animalToView.ownerName && (
                                    <div>
                                        <strong>Owner:</strong> {animalToView.ownerName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remarks / Notes Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Remarks / Notes</h3>
                            {animalToView.remarks ? (
                                <p className="text-gray-700 text-sm">{animalToView.remarks}</p>
                            ) : (
                                <p className="text-gray-500 text-sm italic">No remarks recorded.</p>
                            )}
                        </div>

                        {/* Parents Section */}
                        <div className="border-2 border-gray-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Parents</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Father Card */}
                                <ParentCard 
                                    parentId={animalToView.fatherId_public} 
                                    parentType="Father"
                                    authToken={authToken}
                                    API_BASE_URL={API_BASE_URL}
                                    onViewAnimal={handleViewAnimal}
                                />
                                {/* Mother Card */}
                                <ParentCard 
                                    parentId={animalToView.motherId_public} 
                                    parentType="Mother"
                                    authToken={authToken}
                                    API_BASE_URL={API_BASE_URL}
                                    onViewAnimal={handleViewAnimal}
                                />
                            </div>
                        </div>
                    </div>
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
                        onViewAnimal={handleViewAnimal}
                        onSetCurrentView={setCurrentView}
                    />
                );
        }
    };

    if (!authToken) {
        // Allow unauthenticated users to access search and genetics calculator
        const mainTitle = isRegister ? 'Create Account' : 'Welcome Back';
        
        // Handle public profile viewing for non-logged-in users
        if (viewingPublicProfile) {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    {viewingPublicAnimal && (
                        <ViewOnlyAnimalDetail 
                            animal={viewingPublicAnimal}
                            onClose={() => setViewingPublicAnimal(null)}
                            API_BASE_URL={API_BASE_URL}
                        />
                    )}
                    
                    <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                        <CustomAppLogo size="w-10 h-10" />
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => setShowUserSearchModal(true)}
                                className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                            >
                                <Search size={18} className="mr-1" /> Search
                            </button>
                            <button 
                                onClick={() => { setViewingPublicProfile(null); setCurrentView('auth'); }}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center"
                            >
                                <LogIn size={18} className="mr-1" /> Login
                            </button>
                        </div>
                    </header>
                    
                    {showUserSearchModal && (
                        <UserSearchModal 
                            onClose={() => setShowUserSearchModal(false)} 
                            showModalMessage={showModalMessage} 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => {
                                setShowUserSearchModal(false);
                                setViewingPublicProfile(user);
                            }}
                        />
                    )}
                    
                    <PublicProfileView 
                        profile={viewingPublicProfile}
                        onBack={() => { setViewingPublicProfile(null); setCurrentView('auth'); }}
                        onViewAnimal={(animal) => setViewingPublicAnimal(animal)}
                        API_BASE_URL={API_BASE_URL}
                    />
                </div>
            );
        }
        
        // Genetics calculator for non-logged-in users
        if (currentView === 'genetics-calculator') {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    
                    <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                        <CustomAppLogo size="w-10 h-10" />
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => setShowUserSearchModal(true)}
                                className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                            >
                                <Search size={18} className="mr-1" /> Search
                            </button>
                            <button 
                                onClick={() => setCurrentView('genetics-calculator')}
                                className="px-3 py-2 bg-primary text-black font-semibold rounded-lg transition flex items-center"
                            >
                                <Cat size={18} className="mr-1" /> Genetics
                            </button>
                            <button 
                                onClick={() => setCurrentView('auth')}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center"
                            >
                                <LogIn size={18} className="mr-1" /> Login
                            </button>
                        </div>
                    </header>
                    
                    {showUserSearchModal && (
                        <UserSearchModal 
                            onClose={() => setShowUserSearchModal(false)} 
                            showModalMessage={showModalMessage} 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => {
                                setShowUserSearchModal(false);
                                setViewingPublicProfile(user);
                            }}
                        />
                    )}
                    
                    {viewingPublicAnimal && (
                        <ViewOnlyAnimalDetail 
                            animal={viewingPublicAnimal}
                            onClose={() => setViewingPublicAnimal(null)}
                            API_BASE_URL={API_BASE_URL}
                        />
                    )}
                    
                    <GeneticsCalculatorPlaceholder onCancel={() => setCurrentView('auth')} />
                </div>
            );
        }
        
        // Default auth view with search button
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
                {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                
                {/* Public navigation header */}
                <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setShowUserSearchModal(true)}
                            className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                        >
                            <Search size={18} className="mr-1" /> Search
                        </button>
                        <button 
                            onClick={() => setCurrentView('genetics-calculator')}
                            className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                        >
                            <Cat size={18} className="mr-1" /> Genetics
                        </button>
                    </div>
                </header>
                
                {showUserSearchModal && (
                    <UserSearchModal 
                        onClose={() => setShowUserSearchModal(false)} 
                        showModalMessage={showModalMessage} 
                        API_BASE_URL={API_BASE_URL}
                        onSelectUser={(user) => {
                            setShowUserSearchModal(false);
                            setViewingPublicProfile(user);
                        }}
                    />
                )}
                
                {viewingPublicAnimal && (
                    <ViewOnlyAnimalDetail 
                        animal={viewingPublicAnimal}
                        onClose={() => setViewingPublicAnimal(null)}
                        API_BASE_URL={API_BASE_URL}
                    />
                )}
                
                <div className="flex flex-col items-center mb-4"> 
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
            {showUserSearchModal && (
                <UserSearchModal 
                    onClose={() => setShowUserSearchModal(false)} 
                    showModalMessage={showModalMessage} 
                    API_BASE_URL={API_BASE_URL}
                    onSelectUser={(user) => {
                        setShowUserSearchModal(false);
                        setViewingPublicProfile(user);
                        setCurrentView('publicProfile');
                    }}
                />
            )}
            {viewingPublicAnimal && (
                <ViewOnlyAnimalDetail 
                    animal={viewingPublicAnimal}
                    onClose={() => setViewingPublicAnimal(null)}
                    API_BASE_URL={API_BASE_URL}
                />
            )}
            
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
                        title="Search Users by Name or ID"
                    >
                        <Search size={20} className="mr-1 hidden sm:inline" />
                        <span className="text-sm hidden sm:inline">Search</span>
                        <Search size={20} className="sm:hidden" />
                    </button>

                    {/* Notification Bell */}
                    <button
                        onClick={() => {
                            setShowNotifications(true);
                            fetchNotificationCount();
                        }}
                        className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
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

            {showNotifications && (
                <NotificationPanel
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onClose={() => {
                        setShowNotifications(false);
                        fetchNotificationCount();
                    }}
                    showModalMessage={showModalMessage}
                />
            )}

            {currentView !== 'profile' && userProfile && <UserProfileCard userProfile={userProfile} />}

            <main className="w-full max-w-4xl flex-grow">
                {renderView()}
            </main>

            <footer className="w-full max-w-4xl mt-6 text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                &copy; {new Date().getFullYear()} CritterTrack Pedigree System.
            </footer>
        </div>
    );
};

export default App;