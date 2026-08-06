import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BookOpen, Search, ExternalLink, X, Loader2, Tag, ChevronDown, ChevronUp, Mail } from 'lucide-react';

const ResourcesPage = ({ API_BASE_URL }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [speciesQuery, setSpeciesQuery] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/public/resources`);
                setResources(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to fetch resources:', err);
                setError('Failed to load resources. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [API_BASE_URL]);

    const allSpecies = useMemo(() => {
        const set = new Set();
        resources.forEach(r => (r.species || []).forEach(s => set.add(s)));
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [resources]);

    const allTags = useMemo(() => {
        const set = new Set();
        resources.forEach(r => (r.tags || []).forEach(t => set.add(t)));
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [resources]);

    const allSubjects = useMemo(() => {
        const set = new Set();
        resources.forEach(r => { if (r.subject) set.add(r.subject); });
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [resources]);

    const allLanguages = useMemo(() => {
        const set = new Set();
        resources.forEach(r => { if (r.language) set.add(r.language); });
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [resources]);

    const speciesSuggestions = useMemo(() => {
        if (!speciesQuery.trim()) return [];
        const q = speciesQuery.toLowerCase();
        return allSpecies
            .filter(s => !selectedSpecies.includes(s) && s.toLowerCase().includes(q))
            .slice(0, 8);
    }, [speciesQuery, allSpecies, selectedSpecies]);

    const toggleTag = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const addSpecies = (species) => {
        setSelectedSpecies(prev => [...prev, species]);
        setSpeciesQuery('');
    };

    const removeSpecies = (species) => {
        setSelectedSpecies(prev => prev.filter(s => s !== species));
    };

    const toggleDescription = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const filteredResources = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return resources.filter(r => {
            const matchesSearch = !q ||
                r.title?.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q) ||
                (r.tags || []).some(t => t.includes(q));

            const matchesSpecies = selectedSpecies.length === 0 ||
                (r.species || []).length === 0 || // general resources always match
                (r.species || []).some(s => selectedSpecies.includes(s));

            const matchesTags = selectedTags.length === 0 ||
                (r.tags || []).some(t => selectedTags.includes(t));

            const matchesSubject = !selectedSubject || r.subject === selectedSubject;

            const matchesLanguage = !selectedLanguage || r.language === selectedLanguage;

            return matchesSearch && matchesSpecies && matchesTags && matchesSubject && matchesLanguage;
        });
    }, [resources, searchTerm, selectedSpecies, selectedTags, selectedSubject, selectedLanguage]);

    const hasActiveFilters = searchTerm || selectedSpecies.length > 0 || selectedTags.length > 0 || selectedSubject || selectedLanguage;

    const clearFilters = () => {
        setSearchTerm('');
        setSpeciesQuery('');
        setSelectedSpecies([]);
        setSelectedTags([]);
        setSelectedSubject('');
        setSelectedLanguage('');
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 dark:bg-dark-bg min-h-screen">
            <div className="bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-border rounded-lg shadow-sm p-4 sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                        <BookOpen className="text-accent" />
                        Helpful Resources
                    </h1>
                    <p className="text-gray-600 dark:text-dark-text-secondary mt-1">A curated directory of external links for care, health, genetics, and more.</p>
                </div>
                <a
                    href="mailto:CrittertrackOwner@gmail.com?subject=Resource%20Suggestion&body=I'd%20like%20to%20suggest%20a%20resource%20to%20add%3A%0D%0A%0D%0ATitle%3A%0D%0AURL%3A%0D%0ANotes%3A"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent dark:bg-dark-accent hover:bg-accent/80 dark:hover:bg-dark-accent/80 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
                >
                    <Mail size={16} />
                    Suggest a Resource
                </a>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg text-sm bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Species typeahead filter — a plain dropdown doesn't scale to 100+ species */}
            <div className="relative mb-3">
                <input
                    type="text"
                    placeholder="Filter by species..."
                    value={speciesQuery}
                    onChange={e => setSpeciesQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg text-sm bg-white dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {speciesSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-text-muted rounded-lg shadow-lg max-h-56 overflow-y-auto">
                        {speciesSuggestions.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => addSpecies(s)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedSpecies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedSpecies.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary/20 dark:bg-dark-primary/20 text-primary-dark dark:text-dark-primary rounded-full">
                            {s}
                            <button type="button" onClick={() => removeSpecies(s)} className="hover:text-red-600">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {(allSubjects.length > 0 || allLanguages.length > 0) && (
                <div className="flex flex-wrap gap-3 mb-3">
                    {allSubjects.length > 0 && (
                        <select
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg text-sm bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Subjects</option>
                            {allSubjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    )}
                    {allLanguages.length > 0 && (
                        <select
                            value={selectedLanguage}
                            onChange={e => setSelectedLanguage(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-dark-text-muted rounded-lg text-sm bg-white dark:bg-dark-card-bg dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Languages</option>
                            {allLanguages.map(language => (
                                <option key={language} value={language}>{language}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition ${
                                selectedTags.includes(tag)
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-surface-hover'
                            }`}
                        >
                            <Tag size={11} /> {tag}
                        </button>
                    ))}
                </div>
            )}

            {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text mb-4 underline">
                    Clear all filters
                </button>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={32} className="animate-spin text-gray-400 dark:text-dark-text-muted" />
                </div>
            ) : error ? (
                <p className="text-center text-red-500 py-16">{error}</p>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-dark-text-muted">
                    <BookOpen size={48} className="mx-auto mb-3 text-gray-300 dark:text-dark-border" />
                    <p className="text-sm font-medium">
                        {resources.length === 0 ? 'No resources have been added yet.' : 'No resources match your filters.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredResources.map(r => (
                        <a
                            key={r._id}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <h3 className="font-semibold text-gray-800 dark:text-dark-text">{r.title}</h3>
                                    {r.subject && (
                                        <span className="text-xs font-medium text-primary-dark dark:text-dark-primary">{r.subject}</span>
                                    )}
                                    {r.language && (
                                        <span className="text-xs font-medium text-gray-400 dark:text-dark-text-muted">[{r.language}]</span>
                                    )}
                                    {(r.species || []).map(s => (
                                        <span key={s} className="text-xs px-2 py-0.5 bg-primary/10 dark:bg-dark-primary/10 text-primary-dark dark:text-dark-primary rounded-full">{s}</span>
                                    ))}
                                </div>
                                <ExternalLink size={16} className="text-gray-400 dark:text-dark-text-muted flex-shrink-0 mt-0.5" />
                            </div>
                            {r.description && (
                                <>
                                    <button
                                        type="button"
                                        onClick={e => toggleDescription(r._id, e)}
                                        className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text mt-1.5"
                                    >
                                        {expandedIds.has(r._id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        {expandedIds.has(r._id) ? 'Hide description' : 'Show description'}
                                    </button>
                                    {expandedIds.has(r._id) && (
                                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">{r.description}</p>
                                    )}
                                </>
                            )}
                            {(r.tags || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(r.tags || []).map(t => (
                                        <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted rounded-full">{t}</span>
                                    ))}
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default ResourcesPage;
