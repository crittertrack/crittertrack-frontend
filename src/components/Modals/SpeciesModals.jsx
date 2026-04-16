import React, { useState } from 'react';
import axios from 'axios';
import { X, Search, Loader2, Settings, PlusCircle, ArrowLeft, Mail, Globe, Lock, Star, Cat, Turtle, Bird, Worm, Fish, Bug, PawPrint } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

// ==================== SPECIES PICKER MODAL ====================
const SpeciesPickerModal = ({ speciesOptions, onSelect, onClose, X: XIcon, Search: SearchIcon }) => {
    const categories = ['All', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('speciesFavorites') || '[]'); } catch { return []; }
    });

    const toggleFavorite = (e, name) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
            localStorage.setItem('speciesFavorites', JSON.stringify(next));
            // Dispatch custom event for backend sync
            window.dispatchEvent(new CustomEvent('speciesFavoritesChanged', { detail: next }));
            return next;
        });
    };

    const filtered = speciesOptions
        .filter(s => {
            const matchesCat = cat === 'All' || s.category === cat;
            const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.latinName && s.latinName.toLowerCase().includes(search.toLowerCase()));
            return matchesCat && matchesSearch;
        })
        .sort((a, b) => {
            const aFav = favorites.includes(a.name);
            const bFav = favorites.includes(b.name);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return a.name.localeCompare(b.name);
        });

    const favCount = filtered.filter(s => favorites.includes(s.name)).length;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Mammal': return <Cat size={12} />;
            case 'Reptile': return <Turtle size={12} />;
            case 'Bird': return <Bird size={12} />;
            case 'Amphibian': return <Worm size={12} />;
            case 'Fish': return <Fish size={12} />;
            case 'Invertebrate': return <Bug size={12} />;
            case 'Other': return <PawPrint size={12} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">Select Species</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
                </div>

                {/* Search + Category */}
                <div className="p-4 border-b flex-shrink-0 space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or latin name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCat(c)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                                    cat === c ? 'bg-primary text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Species grid */}
                <div className="flex-grow overflow-y-auto p-4">
                    {favCount > 0 && !search && (
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Star size={11} className="fill-current" /> Favourites
                        </p>
                    )}
                    {filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No species found.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filtered.map((s, idx) => {
                                const isFav = favorites.includes(s.name);
                                const prevFav = idx > 0 && favorites.includes(filtered[idx - 1].name);
                                const showDivider = !search && !isFav && prevFav;
                                return (
                                    <React.Fragment key={s._id || s.name}>
                                        {showDivider && (
                                            <div className="col-span-full border-t border-gray-200 my-1" />
                                        )}
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(s.name)}
                                                className={`w-full h-20 flex flex-col items-start justify-center p-2 border-2 rounded-lg text-left transition hover:shadow-md relative ${
                                                    isFav
                                                        ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                                                        : s.isDefault
                                                        ? 'border-primary bg-primary/10 hover:bg-primary/20'
                                                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="font-medium text-sm text-gray-800 leading-tight pr-5 line-clamp-1">
                                                    {s.name}
                                                </span>
                                                {s.latinName && (
                                                    <span className="text-xs italic text-gray-500 mt-0.5 leading-tight line-clamp-1">{s.latinName}</span>
                                                )}
                                                {s.category && (
                                                    <span className="absolute bottom-1 left-2 text-gray-400">
                                                        {getCategoryIcon(s.category)}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={e => toggleFavorite(e, s.name)}
                                                title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                                                className={`absolute top-2 right-2 transition ${isFav ? 'text-amber-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'}`}
                                            >
                                                <Star size={13} className={isFav ? 'fill-current' : ''} />
                                            </button>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-3 flex-shrink-0 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{filtered.length} species{favCount > 0 ? ` – ${favCount} favourited` : ''}</span>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};

// ==================== SPECIES MANAGER ====================
const SpeciesManager = ({ speciesOptions, setSpeciesOptions, onCancel, showModalMessage, authToken, API_BASE_URL }) => {
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [newSpeciesLatinName, setNewSpeciesLatinName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Other');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSpecies, setFeedbackSpecies] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    
    const categories = ['Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
    
    // Filter species by category and search
    const filteredSpecies = speciesOptions.filter(s => {
        const matchesCategory = categoryFilter === 'All' || (s.category && s.category === categoryFilter);
        const matchesSearch = !searchTerm || (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    
    const handleAddSpecies = async (e) => {
        e.preventDefault();
        const trimmedName = newSpeciesName.trim();
        if (!trimmedName) return;
        
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/species`,
                { 
                    name: trimmedName, 
                    latinName: newSpeciesLatinName.trim() || null,
                    category: selectedCategory 
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            // Add to local state
            setSpeciesOptions(prev => [...prev, response.data.species]);
            setNewSpeciesName('');
            setNewSpeciesLatinName('');
            showModalMessage('Success', `Species "${trimmedName}" added and is now available to all users!`);
        } catch (error) {
            if (error.response?.status === 409) {
                showModalMessage('Already Exists', `Species "${error.response.data.existing?.name || trimmedName}" already exists.`);
            } else {
                console.error('Failed to add species:', error);
                showModalMessage('Error', 'Failed to add species. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackSpecies || !feedbackText.trim()) return;
        
        setFeedbackSubmitting(true);
        try {
            await axios.post(
                `${API_BASE_URL}/feedback/species`,
                {
                    species: feedbackSpecies,
                    feedback: feedbackText.trim(),
                    type: 'species-customization'
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            showModalMessage('Feedback Sent', 'Thank you! Your feedback will help us improve species customization.');
            setShowFeedbackModal(false);
            setFeedbackSpecies('');
            setFeedbackText('');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            showModalMessage('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Settings size={20} className="mr-2 text-primary-dark" />
                    Manage Species (Global for All Users)
                </h2>
                <button
                    onClick={onCancel}
                    data-tutorial-target="back-to-selector-btn"
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back
                </button>
            </div>

            <form onSubmit={handleAddSpecies} className="mb-6 p-3 sm:p-4 border rounded-lg bg-gray-50 space-y-3 overflow-x-hidden">
                <div className="flex flex-col space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                        <input
                            type="text"
                            placeholder="Enter species name..."
                            value={newSpeciesName}
                            onChange={(e) => setNewSpeciesName(e.target.value)}
                            required
                            disabled={loading}
                            data-tutorial-target="species-name-input"
                            className="flex-grow p-2 border border-gray-300 rounded-lg box-border min-w-0"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={loading}
                            data-tutorial-target="species-category-dropdown"
                            className="p-2 border border-gray-300 rounded-lg box-border sm:flex-shrink-0 sm:w-auto w-full"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter latin/scientific name... (optional, e.g., Mus musculus)"
                        value={newSpeciesLatinName}
                        onChange={(e) => setNewSpeciesLatinName(e.target.value)}
                        disabled={loading}
                        data-tutorial-target="species-latin-input"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} className="mr-2" />}
                        {loading ? 'Adding...' : 'Add'}
                    </button>
                </div>
                <p className="text-xs text-gray-500"><Globe size={12} className="inline-block align-middle mr-1" /> Species you add will be available to all users globally! Include the scientific name if known. </p>
            </form>

            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:space-x-3 overflow-x-hidden">
                <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg box-border min-w-0"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg box-border sm:flex-shrink-0 sm:w-auto w-full"
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Available Species ({filteredSpecies.length})</h3>
                
                {filteredSpecies.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No species found matching your filters.</p>
                ) : (
                    filteredSpecies.map(species => (
                        <div key={species._id || species.name} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                            <div>
                                <span className="font-medium text-gray-800">{species.name}</span>
                                {species.latinName && (
                                    <div className="text-xs italic text-gray-600">{species.latinName}</div>
                                )}
                                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{species.category}</span>
                                {species.isDefault && <span className="ml-2 text-xs bg-primary text-black px-2 py-1 rounded">Default</span>}
                            </div>
                            {species.isDefault ? (
                                <span className="text-sm text-gray-400 flex items-center gap-1"><Lock size={14} /> Locked</span>
                            ) : (
                                <span className="text-xs text-gray-500">Added by community</span>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-6 border-t pt-4">
                <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex items-center text-purple-600 hover:text-purple-700 transition font-medium"
                >
                    <Mail size={18} className="mr-1" /> Request Species Customization
                </button>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Request Species Customization</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Let us know if a species needs different or additional fields (e.g., "Morph" instead of "Color/Coat" for snakes, or missing fields like "Pattern")
                        </p>
                        
                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                                <select
                                    value={feedbackSpecies}
                                    onChange={(e) => setFeedbackSpecies(e.target.value)}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select a species...</option>
                                    {speciesOptions.map(s => (
                                        <option key={s._id || s.name} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    What fields need to be different or added?
                                </label>
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder='Example: For snakes, replace "Color" and "Coat" with "Morph", and add a "Pattern" field'
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setFeedbackSpecies('');
                                        setFeedbackText('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={feedbackSubmitting}
                                    className="flex-1 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {feedbackSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Mail size={18} className="mr-2" />}
                                    {feedbackSubmitting ? 'Sending...' : 'Send Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== SPECIES SELECTOR ====================
const SpeciesSelector = ({ speciesOptions, onSelectSpecies, onManageSpecies, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter }) => {
    const categories = ['All', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];

    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('speciesFavorites') || '[]'); } catch { return []; }
    });

    const toggleFavorite = (e, name) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
            localStorage.setItem('speciesFavorites', JSON.stringify(next));
            // Dispatch custom event for backend sync
            window.dispatchEvent(new CustomEvent('speciesFavoritesChanged', { detail: next }));
            return next;
        });
    };

    // Filter species by category and search
    const filteredSpecies = speciesOptions.filter(s => {
        const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
        const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    // Sort: favorites first, then defaults, then alphabetical
    const sortedSpecies = [...filteredSpecies].sort((a, b) => {
        const aFav = favorites.includes(a.name);
        const bFav = favorites.includes(b.name);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
    });

    const favCount = sortedSpecies.filter(s => favorites.includes(s.name)).length;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Mammal': return <Cat size={14} />;
            case 'Reptile': return <Turtle size={14} />;
            case 'Bird': return <Bird size={14} />;
            case 'Amphibian': return <Worm size={14} />;
            case 'Fish': return <Fish size={14} />;
            case 'Invertebrate': return <Bug size={14} />;
            case 'Other': return <PawPrint size={14} />;
            default: return null;
        }
    };
    
    return (
        <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow-lg" data-tutorial-target="species-selector">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Cat size={24} className="mr-3 text-primary-dark" />
                Select Species for New Animal
            </h2>
            
            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800">
                    <span className="italic">Theraphosidae sp.</span> Some default species are intentionally broad. Add your exact species when possible. Missing fields can be requested via species customization.
                </p>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3" data-tutorial-target="species-search-section">
                <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    data-tutorial-target="species-search-input"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full sm:w-40 flex-shrink-0"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {favCount === 0 && !searchTerm && (
                <p className="text-xs text-gray-400 mb-2">Tip: click the <Star size={11} className="inline-block align-middle" /> on any card to favourite a species.</p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 max-h-96 overflow-y-auto" data-tutorial-target="default-species-section">
                {favCount > 0 && !searchTerm && (
                    <p className="col-span-full text-xs font-semibold text-amber-600 uppercase tracking-wide flex flex-wrap items-center gap-x-1 gap-y-0.5">
                        <Star size={11} className="fill-current shrink-0" />
                        <span>Favourites – click</span>
                        <Star size={11} className="fill-current shrink-0" />
                        <span>on any card to pin it here</span>
                    </p>
                )}
                {sortedSpecies.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 p-4">No species found matching your filters.</p>
                ) : (
                    sortedSpecies.map((species, idx) => {
                        const isFav = favorites.includes(species.name);
                        const prevFav = idx > 0 && favorites.includes(sortedSpecies[idx - 1].name);
                        const showDivider = !searchTerm && !isFav && prevFav;
                        return (
                            <React.Fragment key={species._id || species.name}>
                                {showDivider && <div className="col-span-full border-t border-gray-200 my-1" />}
                                <div className="relative group">
                                    <button
                                        onClick={() => onSelectSpecies(species.name)}
                                        data-tutorial-target={species.name === 'Fancy Mouse' ? 'species-fancy-mouse' : undefined}
                                        className={`w-full h-24 p-3 border-2 text-sm font-semibold rounded-lg transition duration-150 shadow-md relative text-center flex flex-col items-center justify-center ${
                                            isFav
                                                ? 'border-amber-400 bg-amber-50 text-gray-800 hover:bg-amber-100'
                                                : species.isDefault 
                                                ? 'border-primary-dark bg-primary text-gray-800 hover:bg-primary/80' 
                                                : 'border-accent bg-accent text-white hover:bg-accent/80'
                                        }`}
                                    >
                                        <span className="line-clamp-2">{species.name}</span>
                                        {species.latinName && (
                                            <p className={`text-xs italic mt-1 line-clamp-1 ${isFav || species.isDefault ? 'text-gray-600' : 'text-white/80'}`}>{species.latinName}</p>
                                        )}
                                        {species.category && (
                                            <span className={`absolute top-2 left-2 ${isFav || species.isDefault ? 'text-gray-400' : 'text-white/60'}`}>
                                                {getCategoryIcon(species.category)}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => toggleFavorite(e, species.name)}
                                        title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                                        className={`absolute bottom-2 right-2 transition z-10 ${isFav ? 'text-amber-400 opacity-100' : 'text-gray-400 opacity-100 hover:text-amber-400'}`}
                                    >
                                        <Star size={14} className={isFav ? 'fill-current' : ''} />
                                    </button>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
            </div>

            <div className="mt-8 border-t pt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    <span className="font-semibold">{sortedSpecies.length}</span> species available{favCount > 0 ? <span className="ml-2 text-amber-600 font-medium">– {favCount} favourited</span> : ''}
                </p>
                <button
                    data-tutorial-target="add-species-btn"
                    onClick={onManageSpecies}
                    className="text-primary-dark hover:text-primary transition duration-150 font-medium flex items-center"
                >
                    <Settings size={18} className="mr-2" /> Add New Species
                </button>
            </div>
        </div>
    );
};

export { SpeciesPickerModal, SpeciesManager, SpeciesSelector };
