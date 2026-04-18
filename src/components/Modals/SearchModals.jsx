import React, { useState } from 'react';
import axios from 'axios';
import { X, Search, Loader2, User, Cat } from 'lucide-react';
import AnimalImage from '../shared/AnimalImage';
import { getSpeciesLatinName } from '../../utils/speciesUtils';
import { getDonationBadge, DonationBadge } from '../../utils/donationUtils';

// ==================== PARENT SEARCH MODAL ====================
const ParentSearchModal = ({ 
    title, 
    currentId, 
    onSelect, 
    onClose, 
    authToken, 
    showModalMessage, 
    API_BASE_URL, 
    X: XIcon, 
    Search: SearchIcon, 
    Loader2: LoaderIcon, 
    LoadingSpinner,
    requiredGender, // Filter: e.g., 'Male' or 'Female'
    birthDate,      // Filter: Date of the animal being bred
    species         // Filter: Species of the animal being bred
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
                    <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                
                {/* Info */}
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}
                    </p>
                    {getSpeciesLatinName(animal.species) && (
                        <p className="text-xs italic text-gray-500">{getSpeciesLatinName(animal.species)}</p>
                    )}
                </div>
                
                {/* Badge */}
                {isGlobal && <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>}
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

        // Detect ID searches (CTC1234, CT1234, or 1234)
        const idMatch = trimmedSearchTerm.match(/^\s*(?:CTC?[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        // Send full CTC format (CTC1234) instead of just numeric portion (1234)
        const idValue = isIdSearch ? `CTC${idMatch[1]}` : null;

        // --- CONSTRUCT FILTER QUERIES ---
        const genderQuery = requiredGender 
            ? (Array.isArray(requiredGender) 
                ? `&gender=${requiredGender.map(g => encodeURIComponent(g)).join('&gender=')}`
                : `&gender=${requiredGender}`)
            : '';
        const birthdateQuery = birthDate ? `&birthdateBefore=${birthDate}` : '';
        const speciesQuery = species ? `&species=${encodeURIComponent(species)}` : '';

        // Prepare promises depending on scope
        setLoadingLocal(scope === 'local' || scope === 'both');
        setLoadingGlobal(scope === 'global' || scope === 'both');

        // Local search
        if (scope === 'local' || scope === 'both') {
            try {
                const localUrl = isIdSearch
                    ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;

                const localResponse = await axios.get(localUrl, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Filter out current animal and females deceased before offspring birth date
                const filteredLocal = localResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // Only check deceased date for females (dams must be alive at offspring birth)
                    // Males (sires) can be deceased as long as they mated before death
                    if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Dam died before offspring born
                    }
                    return true;
                });
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
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;

                const globalResponse = await axios.get(globalUrl);
                // Filter out current animal and females deceased before offspring birth date
                const filteredGlobal = globalResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // Only check deceased date for females (dams must be alive at offspring birth)
                    // Males (sires) can be deceased as long as they mated before death
                    if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Dam died before offspring born
                    }
                    return true;
                });
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
                            disabled={((scope === 'local' || scope === 'both') && loadingLocal) || ((scope === 'global' || scope === 'both') && loadingGlobal) || searchTerm.trim().length < 1}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                        >
                            { (loadingLocal || loadingGlobal) ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> }
                        </button>
                    </div>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <div className="text-center text-gray-500">Searching your animals...</div> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    
                    {/* Global Results */}
                    {loadingGlobal ? <div className="text-center text-gray-500">Searching global animals...</div> : globalAnimals.length > 0 && (
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

// ==================== LOCAL ANIMAL SEARCH MODAL ====================
const LocalAnimalSearchModal = ({ title, currentId, onSelect, onClose, authToken, showModalMessage, API_BASE_URL, genderFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    
    // Simple component to render a list item (No isGlobal tag needed)
    const SearchResultItem = ({ animal }) => (
        <div 
            className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer" 
            onClick={() => onSelect(animal)}
        >
            <div>
                <p className="font-semibold text-gray-800">{animal.prefix} {animal.name}{animal.suffix && ` ${animal.suffix}`} ({animal.id_public})</p>
                <p className="text-sm text-gray-600">
                    {animal.species} | {animal.gender} | {animal.status}
                </p>
                {getSpeciesLatinName(animal.species) && (
                    <p className="text-xs italic text-gray-500">{getSpeciesLatinName(animal.species)}</p>
                )}
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
            let filteredLocal = localResponse.data.filter(a => a.id_public !== currentId);
            
            // Apply gender filter if specified
            if (genderFilter) {
                if (Array.isArray(genderFilter)) {
                    filteredLocal = filteredLocal.filter(a => genderFilter.includes(a.gender));
                } else {
                    filteredLocal = filteredLocal.filter(a => a.gender === genderFilter);
                }
            }
            
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
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
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
                    {loadingLocal ? <div className="text-center text-gray-500">Searching your animals...</div> : localAnimals.length > 0 ? (
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

// ==================== USER SEARCH MODAL ====================
const UserSearchModal = ({ onClose, showModalMessage, onSelectUser, API_BASE_URL, modalTarget, userProfile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('users'); // 'users' or 'animals'
    const [userResults, setUserResults] = useState([]);
    const [animalResults, setAnimalResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setUserResults([]);
            setAnimalResults([]);
            setHasSearched(false);
            return;
        }

        setHasSearched(true);
        setLoading(true);
        
        try {
            if (searchType === 'users') {
                // Search for users
                const trimmedTerm = searchTerm.trim();
                const numericMatch = trimmedTerm.match(/(\d+)/);
                const numericId = numericMatch ? numericMatch[1] : null;
                
                // Check if it's a user ID pattern (CTU or just numbers)
                const hasCTU = /CTU/i.test(trimmedTerm);
                const isNumericOnly = /^\d+$/.test(trimmedTerm);
                
                let searchQuery = trimmedTerm;
                if ((hasCTU || isNumericOnly) && numericId) {
                    searchQuery = `CTU${numericId}`;
                }
                
                const url = `${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchQuery)}&limit=50`;
                const response = await axios.get(url);
                
                // Filter out completely anonymous users (both names hidden/unavailable)
                const filteredUsers = (response.data || []).filter(user => {
                    const showPersonalName = user.showPersonalName ?? false;
                    const showBreederName = user.showBreederName ?? false;
                    const hasPersonalName = showPersonalName && user.personalName;
                    const hasBreederName = showBreederName && user.breederName;
                    
                    // Only include users who have at least one name visible
                    return hasPersonalName || hasBreederName;
                });
                
                setUserResults(filteredUsers);
                setAnimalResults([]);
            } else {
                // Search for animals globally
                const trimmedTerm = searchTerm.trim();
                const numericMatch = trimmedTerm.match(/(\d+)/);
                const numericId = numericMatch ? numericMatch[1] : null;
                
                // Check if it's an animal ID pattern (CTC, CT, or just numbers)
                const hasCTC = /CTC/i.test(trimmedTerm);
                const hasCT = /^CT[- ]?\d+$/i.test(trimmedTerm);
                const isNumericOnly = /^\d+$/.test(trimmedTerm);
                
                let url;
                if ((hasCTC || hasCT || isNumericOnly) && numericId) {
                    // Format the ID as CTCXXX
                    url = `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(`CTC${numericId}`)}`;
                } else {
                    url = `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedTerm)}&species=${encodeURIComponent(trimmedTerm)}`;
                }
                const response = await axios.get(url);
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
            ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.createdAt))
            : (user.updatedAt ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.updatedAt)) : null);
        
        // Determine display name(s) - respect privacy settings
        const showPersonalName = user.showPersonalName ?? false;
        const showBreederName = user.showBreederName ?? false;
        
        let displayName;
        if (showBreederName && showPersonalName && user.personalName && user.breederName) {
            displayName = `${user.personalName} (${user.breederName})`;
        } else if (showBreederName && user.breederName) {
            displayName = user.breederName;
        } else if (showPersonalName && user.personalName) {
            displayName = user.personalName;
        } else {
            displayName = 'Anonymous Breeder';
        }
        
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
                        <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {displayName}
                            <DonationBadge badge={getDonationBadge(user)} size="sm" />
                        </p>
                        <p className="text-sm text-gray-600">
                            Public ID: <span className="font-mono text-accent">{user.id_public}</span>
                        </p>
                        {memberSince && (
                            <p className="text-xs text-gray-500 mt-1">
                                Member since {memberSince}
                            </p>
                        )}
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
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <AnimalImage src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-800">
                            {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        {animal.species} &bull; {animal.gender} &bull; <span className="font-mono">{animal.id_public}</span>
                    </p>
                    {animal.color && <p className="text-xs text-gray-500 mt-1">{animal.color}</p>}
                    {(animal.manualBreederName || animal.breederName) && (
                        <p className="text-xs text-gray-500 mt-1">
                            Breeder: {animal.manualBreederName || animal.breederName}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const results = searchType === 'users' ? userResults : animalResults;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">Global Search <Search size={18} className="flex-shrink-0" /></h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Search Type Toggle - only show for pedigree (sire/dam), not for breeder */}
                {modalTarget !== 'breeder' && (
                    <div className="flex space-x-2 mb-4">
                        <button
                            onClick={() => { setSearchType('users'); setUserResults([]); setAnimalResults([]); setHasSearched(false); }}
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
                            onClick={() => { setSearchType('animals'); setUserResults([]); setAnimalResults([]); setHasSearched(false); }}
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
                    {modalTarget === 'breeder' && userProfile && (
                        <div className="border rounded-lg bg-white shadow-sm mb-4">
                            <h4 className="font-bold text-gray-700 p-3 bg-primary/20 border-b">
                                Your Profile
                            </h4>
                            <UserResultCard user={userProfile} />
                        </div>
                    )}
                    {loading ? <div className="text-center text-gray-500">Searching...</div> : results.length > 0 ? (
                        <div className="border rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 p-3 bg-gray-50 border-b">
                                {searchType === 'users' ? `Users (${results.length})` : `Animals (${results.length})`}
                            </h4>
                            {searchType === 'users' 
                                ? results.map(user => <UserResultCard key={user.id_public} user={user} />)
                                : results.map(animal => <AnimalResultCard key={animal.id_public} animal={animal} />)
                            }
                        </div>
                    ) : hasSearched && !loading ? (
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

export { ParentSearchModal, LocalAnimalSearchModal, UserSearchModal };
