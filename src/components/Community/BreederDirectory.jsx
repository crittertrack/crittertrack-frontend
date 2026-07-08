import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Loader2, Search, X } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import { getCountryFlag, getCountryName } from '../../utils/locationUtils';

const BreederCard = ({ user, navigate }) => {
    const displayName = (user.showBreederName && user.breederName)
        ? user.breederName
        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');

    const speciesList = useMemo(() => {
        if (!user.speciesBred || user.speciesBred.length === 0) return 'No species listed';
        return user.speciesBred.map(s => s.species).join(', ');
    }, [user.speciesBred]);

    return (
        <div 
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3 flex flex-col"
            onClick={() => navigate(`/user/${user.id_public}`)}
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Users size={20} />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.id_public}</p>
                </div>
            </div>
            <div className="flex-grow">
                <p className="text-xs text-gray-500 font-medium mb-1">Breeds:</p>
                <p className="text-xs text-gray-700 line-clamp-2">{speciesList}</p>
            </div>
            {user.country && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <span className={`${getCountryFlag(user.country)} w-4 h-3`}></span>
                    <span>{getCountryName(user.country)}</span>
                </div>
            )}
        </div>
    );
};

const BreederDirectory = ({ authToken, API_BASE_URL }) => {
    const navigate = useNavigate();
    const [breeders, setBreeders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [availableCountries, setAvailableCountries] = useState([]);

    useEffect(() => {
        const fetchDirectoryData = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (speciesFilter) params.append('species', speciesFilter);
                if (countryFilter) params.append('country', countryFilter);

                const response = await axios.get(`${API_BASE_URL}/public/breeders?${params.toString()}`);
                setBreeders(response.data.users || []);
                setAvailableSpecies(response.data.filterOptions?.species || []);
                setAvailableCountries(response.data.filterOptions?.countries || []);
            } catch (error) {
                console.error("Error fetching breeder directory:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDirectoryData();
    }, [searchTerm, speciesFilter, countryFilter, API_BASE_URL]);

    const hasFilters = searchTerm || speciesFilter || countryFilter;

    return (
        <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-primary" />
                        Breeder Directory
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 mb-4 flex-shrink-0">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                </div>
                <select value={speciesFilter} onChange={e => setSpeciesFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                    <option value="">All Species</option>
                    {availableSpecies.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                    <option value="">All Countries</option>
                    {availableCountries.map(c => <option key={c} value={c}>{getCountryName(c)}</option>)}
                </select>
                {hasFilters && (
                    <button onClick={() => { setSearchTerm(''); setSpeciesFilter(''); setCountryFilter(''); }} className="sm:col-span-3 text-sm text-red-600 hover:text-red-800 flex items-center justify-center gap-1">
                        <X size={14} /> Clear Filters
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto -mr-4 pr-4">
                {loading ? (
                    <div className="flex justify-center items-center py-12 h-full">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : breeders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 h-full flex flex-col items-center justify-center">
                        <p className="font-medium">No breeders found.</p>
                        {hasFilters && <p className="text-sm mt-1">Try adjusting your filters.</p>}
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1">
                        {breeders.map(user => (
                            <BreederCard key={user.id_public} user={user} navigate={navigate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BreederDirectory;