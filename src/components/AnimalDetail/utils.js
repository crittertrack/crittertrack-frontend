import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Heart, Cat, EyeOff, Eye, Hourglass, Bean, Milk, Loader2, ChevronDown, ChevronRight, Mars, Venus, VenusAndMars, Circle } from 'lucide-react';
import { formatDate, formatDateShort, litterAge } from '../../utils/dateFormatter';
import { getCurrencySymbol, getCountryFlag, getCountryName } from '../../utils/locationUtils';
import { getSpeciesLatinName } from '../../utils/speciesUtils';

// Hook to fetch field template for species
export const useDetailFieldTemplate = (species, API_BASE_URL) => {
    const [fieldTemplate, setFieldTemplate] = useState(null);
    
    useEffect(() => {
        if (!species || !API_BASE_URL) {
            setFieldTemplate(null);
            return;
        }

        const fetchTemplate = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/species/with-template/${species}`);
                if (response.data && response.data.fieldTemplate) {
                    setFieldTemplate(response.data.fieldTemplate);
                }
            } catch (error) {
                console.error('Error fetching field template:', error);
                setFieldTemplate(null);
            }
        };

        fetchTemplate();
    }, [species, API_BASE_URL]);

    const getLabel = useCallback((key, defaultLabel) => {
        if (!fieldTemplate?.fields || !fieldTemplate.fields[key]) {
            return defaultLabel;
        }
        const field = fieldTemplate.fields[key];
        if (field.customLabel && field.customLabel.trim()) {
            return field.customLabel;
        }
        return field.label || defaultLabel;
    }, [fieldTemplate]);

    return { fieldTemplate, getLabel };
};

// Utility to safely parse JSON fields
export const parseJsonField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

// Component to render lists of items from parsed JSON
export const DetailJsonList = ({ label, data, renderItem }) => {
    const parsed = parseJsonField(data);
    if (!parsed || parsed.length === 0) return null;
    
    return (
        <div>
            <span className="text-gray-600 text-sm font-semibold">{label}:</span>
            <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                {parsed.map((item, i) => (
                    <li key={i} className="text-gray-700">
                        {renderItem(item)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Function to compute relationships from animal collection
export const computeRelationships = (animal, collection = []) => {
    if (!animal) return [];
    
    const relationships = [];
    const uniqueIds = new Set();
    
    // Find all animals that mention this animal as a relative
    collection.forEach(a => {
        if (a.id_public === animal.id_public) return;
        if (uniqueIds.has(a.id_public)) return;
        
        let rel = null;
        
        // Parent-level relationships
        if (a.id_public === animal.sireId_public || a.id_public === animal.fatherId_public) {
            rel = `${a.gender === 'Male' ? 'Sire' : 'Father'}`;
        } else if (a.id_public === animal.damId_public || a.id_public === animal.motherId_public) {
            rel = `${a.gender === 'Female' ? 'Dam' : 'Mother'}`;
        }
        
        // Offspring relationships
        else if (animal.sireId_public && a.sireId_public === animal.id_public) {
            rel = `${a.gender === 'Female' ? 'Daughter' : 'Son'}`;
        } else if (animal.damId_public && a.damId_public === animal.id_public) {
            rel = `${a.gender === 'Female' ? 'Daughter' : 'Son'}`;
        }
        
        if (rel) {
            relationships.push({ animal: a, rel });
            uniqueIds.add(a.id_public);
        }
    });
    
    return relationships.sort((a, b) => {
        const relOrder = { 'Sire': 0, 'Father': 0, 'Dam': 1, 'Mother': 1, 'Son': 2, 'Daughter': 2 };
        const orderA = relOrder[a.rel] ?? 999;
        const orderB = relOrder[b.rel] ?? 999;
        return orderA - orderB;
    });
};

// View-Only Parent Card Component
export const ViewOnlyParentCard = ({ parentId, parentType, API_BASE_URL, onViewAnimal, authToken }) => {
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [foundViaOwned, setFoundViaOwned] = useState(false);

    useEffect(() => {
        if (!parentId) {
            setParentData(null);
            setNotFound(false);
            setFoundViaOwned(false);
            return;
        }

        const fetchParent = async () => {
            setLoading(true);
            setNotFound(false);
            setFoundViaOwned(false);
            try {
                // If authToken is available, try fetching from owned animals first
                if (authToken) {
                    try {
                        const ownedResponse = await axios.get(`${API_BASE_URL}/animals/${parentId}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        if (ownedResponse.data) {
                            // Found in user's own animals – always show, even if private
                            setParentData(ownedResponse.data);
                            setFoundViaOwned(true);
                            setLoading(false);
                            return;
                        }
                    } catch (ownedError) {
                        // Not in owned animals, try /animals/any for sold/transferred animals
                        try {
                            const anyResponse = await axios.get(`${API_BASE_URL}/animals/any/${parentId}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            if (anyResponse.data) {
                                // Found via related (not owned) – respect isPrivate flag
                                setParentData(anyResponse.data);
                                setLoading(false);
                                return;
                            }
                        } catch (anyError) {
                            console.log(`${parentType} not in owned or related animals, checking public database`);
                        }
                    }
                }

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
    }, [parentId, parentType, API_BASE_URL, authToken]);

    if (!parentId) {
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

    if (notFound || (!foundViaOwned && !parentData?.showOnPublicProfile)) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <EyeOff size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm font-semibold">Private {parentType}</p>
                <p className="text-xs text-gray-400 mt-0.5">This animal is not public</p>
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
        <div 
            className="border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewAnimal && onViewAnimal(parentData)}
        >
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
                        <p className="text-xs text-gray-600 font-mono">{parentData.id_public}</p>
                        {parentData.variety && (
                            <p className="text-xs text-gray-500 mt-1">{parentData.variety}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Parent Mini Card Component for Offspring Section
export const ParentMiniCard = ({ parent, label, onViewAnimal }) => {
    if (!parent) {
        return (
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200" style={{ width: 'auto', minWidth: '180px' }}>
                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    <Cat size={20} className="text-gray-400" />
                </div>
                <div className="flex-grow">
                    <p className="text-xs text-gray-500 italic">{label} unknown</p>
                </div>
            </div>
        );
    }

    // Determine if the parent is clickable (owned by user or public)
    const isClickable = !parent.isHidden;

    return (
        <div 
            className={`flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200 ${isClickable ? 'cursor-pointer hover:bg-gray-100' : 'opacity-75'} transition`}
            style={{ width: 'auto', minWidth: '180px' }}
            onClick={isClickable ? (() => onViewAnimal && onViewAnimal(parent)) : undefined}
        >
            <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {parent.imageUrl || parent.photoUrl ? (
                    <img 
                        src={parent.imageUrl || parent.photoUrl} 
                        alt={parent.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Cat size={20} className="text-gray-400" />
                )}
            </div>
            <div className="flex items-center space-x-1 flex-grow">
                {parent.gender && (
                    <div>
                        {parent.gender === 'Male' 
                            ? <Mars size={12} strokeWidth={2.5} className="text-primary" /> 
                            : <Venus size={12} strokeWidth={2.5} className="text-accent" />
                        }
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                        {parent.prefix && `${parent.prefix} `}
                        {parent.name}
                    </p>
                    <p className="text-xs text-gray-600 font-mono">
                        {parent.id_public}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Offspring Section Component - shows offspring grouped by litter
export const OffspringSection = ({ animalId, API_BASE_URL, authToken = null, onViewAnimal }) => {
    const [offspring, setOffspring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentAnimal, setCurrentAnimal] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!animalId) return;
            
            setLoading(true);
            try {
                const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
                
                // Fetch offspring - only available for authenticated users
                if (authToken) {
                    const offspringEndpoint = `${API_BASE_URL}/animals/${animalId}/offspring`;
                    const offspringResponse = await axios.get(offspringEndpoint, { headers });
                    setOffspring(offspringResponse.data || []);
                    
                    // Fetch current animal to know which parent we are
                    try {
                        const animalResponse = await axios.get(
                            `${API_BASE_URL}/animals/any/${animalId}`,
                            { headers }
                        );
                        setCurrentAnimal(animalResponse.data);
                    } catch (err) {
                        console.error('Error fetching current animal:', err);
                    }
                } else {
                    // For unauthenticated users, offspring data is not available via API
                    // The backend doesn't expose a public offspring endpoint for privacy reasons
                    setOffspring([]);
                    
                    // Still fetch the current animal for display
                    try {
                        const publicResponse = await axios.get(
                            `${API_BASE_URL}/public/global/animals?id_public=${animalId}`
                        );
                        setCurrentAnimal(publicResponse.data?.[0] || null);
                    } catch (err) {
                        console.error('Error fetching current animal:', err);
                    }
                }
            } catch (error) {
                console.error('Error fetching offspring:', error);
                setOffspring([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [animalId, API_BASE_URL, authToken]);

    return (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Offspring</h3>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            ) : (!offspring || offspring.length === 0) ? (
                <p className="text-gray-500 text-sm italic">Offspring are not public or no offspring recorded.</p>
            ) : (
                <div className="space-y-6">
                    {offspring.map((litter, index) => (
                    <div key={litter.litterId || index} className="border-2 border-gray-200 rounded-lg p-4">
                        {/* Parent Cards at Top - Centered on desktop, stacked on mobile */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 justify-center">
                            {/* Father Card */}
                            {(litter.sireId_public || litter.otherParentType === 'sire') && (
                                <ParentMiniCard 
                                    parent={litter.otherParentType === 'sire' ? litter.otherParent : currentAnimal}
                                    label="Father"
                                    onViewAnimal={onViewAnimal}
                                />
                            )}
                            
                            {/* Mother Card */}
                            {(litter.damId_public || litter.otherParentType === 'dam') && (
                                <ParentMiniCard 
                                    parent={litter.otherParentType === 'dam' ? litter.otherParent : currentAnimal}
                                    label="Mother"
                                    onViewAnimal={onViewAnimal}
                                />
                            )}
                        </div>

                        {/* Litter Info - Centered */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 inline-block">
                                {litter.litter_id_public && (
                                    <p className="text-xs font-mono bg-gray-300 text-gray-800 px-2 py-1 rounded mb-2 text-center">
                                        {litter.litter_id_public}
                                    </p>
                                )}
                                {litter.litterName && (
                                    <p className="text-sm font-semibold text-gray-800 text-center mb-1">
                                        {litter.litterName}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>Born: {formatDate(litter.birthDate)}</span>
                                    {litter.numberBorn && (
                                        <>
                                            <span></span>
                                            <span>{litter.numberBorn} born</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Offspring Animals */}
                        {litter.offspring && litter.offspring.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {litter.offspring.map((animal) => (
                                    <div
                                        key={animal.id_public}
                                        onClick={() => onViewAnimal && onViewAnimal(animal)}
                                        className="relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-md transition border border-gray-300 pt-2"
                                    >
                                        {/* Birthdate top-left */}
                                        {animal.birthDate && (
                                            <div className="absolute top-1.5 left-1.5 text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">
                                                {formatDate(animal.birthDate)}
                                            </div>
                                        )}

                                        {/* Gender badge top-right */}
                                        {animal.gender && (
                                            <div className="absolute top-1.5 right-1.5">
                                                {animal.gender === 'Male' 
                                                    ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> 
                                                    : <Venus size={14} strokeWidth={2.5} className="text-accent" />
                                                }
                                            </div>
                                        )}

                                        {/* Profile image */}
                                        <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                            {animal.imageUrl || animal.photoUrl ? (
                                                <img 
                                                    src={animal.imageUrl || animal.photoUrl} 
                                                    alt={animal.name} 
                                                    className="w-20 h-20 object-cover rounded-md" 
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                    <Cat size={32} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Icon row - only show if authenticated (local view) */}
                                        {authToken && (
                                            <div className="w-full flex justify-center items-center space-x-2 py-1">
                                                {animal.isOwned ? (
                                                    <Heart size={12} className="text-black" />
                                                ) : (
                                                    <Heart size={12} className="text-black" stroke="currentColor" fill="none" />
                                                )}
                                                {(animal.showOnPublicProfile !== undefined ? animal.showOnPublicProfile : true) ? (
                                                    <Eye size={12} className="text-black" />
                                                ) : (
                                                    <EyeOff size={12} className="text-black" />
                                                )}
                                                {animal.isInMating && <Hourglass size={12} className="text-black" />}
                                                {animal.isPregnant && <Bean size={12} className="text-black" />}
                                                {animal.isNursing && <Milk size={12} className="text-black" />}
                                            </div>
                                        )}
                                        
                                        {/* Name */}
                                        <div className="w-full text-center px-2 pb-1">
                                            <div className="text-sm font-semibold text-gray-800 truncate">
                                                {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                            </div>
                                        </div>

                                        {/* ID bottom-right */}
                                        <div className="w-full px-2 pb-2 flex justify-end">
                                            <div className="text-xs text-gray-500">{animal.id_public}</div>
                                        </div>
                                        
                                        {/* Status bar */}
                                        <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                            <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No offspring recorded in this litter.</p>
                        )}
                    </div>
                ))}
                </div>
            )}
        </div>
    );
};
