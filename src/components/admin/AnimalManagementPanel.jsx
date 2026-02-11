import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Filter, Eye, EyeOff, Trash2, Edit, AlertTriangle, 
    ChevronLeft, ChevronRight, X, ExternalLink, Image, User,
    RefreshCw, FileText
} from 'lucide-react';
import './AnimalManagementPanel.css';

export default function AnimalManagementPanel({ API_BASE_URL, authToken, userRole }) {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    
    // Filters
    const [search, setSearch] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [publicFilter, setPublicFilter] = useState('');
    const [reportsFilter, setReportsFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [speciesList, setSpeciesList] = useState([]);
    
    // Users list for owner transfer
    const [users, setUsers] = useState([]);
    
    // Modals
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Edit form
    const [editForm, setEditForm] = useState({});
    const [originalEditForm, setOriginalEditForm] = useState({}); // Store original values
    const [editReason, setEditReason] = useState('');
    const [actionReason, setActionReason] = useState('');
    
    // Owner and Breeder selection (Edit Modal)
    const [showOwnerSearch, setShowOwnerSearch] = useState(false);
    const [showBreederSearch, setShowBreederSearch] = useState(false);
    const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
    const [breederSearchQuery, setBreederSearchQuery] = useState('');
    const [ownerSearchResults, setOwnerSearchResults] = useState([]);
    const [breederSearchResults, setBreederSearchResults] = useState([]);
    
    // Owner Filter (Main Filters)
    const [showOwnerFilterDropdown, setShowOwnerFilterDropdown] = useState(false);
    const [ownerFilterSearchQuery, setOwnerFilterSearchQuery] = useState('');
    const [ownerFilterSearchResults, setOwnerFilterSearchResults] = useState([]);

    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
                search,
                species: speciesFilter,
                isPublic: publicFilter,
                hasReports: reportsFilter,
                owner: ownerFilter,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await fetch(`${API_BASE_URL}/admin/animals?${params}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Animal management endpoint not available');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch animals');

            setAnimals(data.animals || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            if (data.speciesList) setSpeciesList(data.speciesList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, authToken, page, search, speciesFilter, publicFilter, reportsFilter, ownerFilter]);

    useEffect(() => {
        fetchAnimals();
        fetchUsers();
    }, [fetchAnimals]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Users endpoint did not return JSON');
                return;
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            // Sort users by name for easier selection
            const sortedUsers = (data || []).sort((a, b) => {
                const nameA = a.personalName || a.username || a.email || '';
                const nameB = b.personalName || b.username || b.email || '';
                return nameA.localeCompare(nameB);
            });
            setUsers(sortedUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            // Don't throw - just log, so the panel still works without user dropdown
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchAnimals();
    };

    const openDetailModal = async (animal) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/animals/${animal._id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            setSelectedAnimal({ ...data.animal, reports: data.reports });
            setShowDetailModal(true);
        } catch (err) {
            setError(err.message || 'Failed to load animal details');
        }
    };

    const openEditModal = (animal) => {
        const formData = {
            name: animal.name || '',
            prefix: animal.prefix || '',
            suffix: animal.suffix || '',
            species: animal.species || '',
            gender: animal.gender || '',
            status: animal.status || '',
            remarks: animal.remarks || '',
            sireId_public: animal.sireId_public || '',
            damId_public: animal.damId_public || '',
            ownerId_public: animal.ownerId_public || '',
            breederId_public: animal.breederId_public || '',
            manualBreederName: animal.manualBreederName || '',
            // Ownership & Display
            isOwned: animal.isOwned ?? true,
            isDisplay: animal.isDisplay ?? false,
            currentOwner: animal.currentOwner || '',
            ownerName: animal.ownerName || '',
            // Dates
            birthDate: animal.birthDate ? new Date(animal.birthDate).toISOString().substring(0, 10) : '',
            deceasedDate: animal.deceasedDate ? new Date(animal.deceasedDate).toISOString().substring(0, 10) : '',
            // Appearance
            color: animal.color || '',
            coat: animal.coat || '',
            earset: animal.earset || '',
            coatPattern: animal.coatPattern || '',
            // Physical
            bodyWeight: animal.bodyWeight || '',
            bodyLength: animal.bodyLength || '',
            heightAtWithers: animal.heightAtWithers || '',
            bodyConditionScore: animal.bodyConditionScore || '',
            // Identification
            microchipNumber: animal.microchipNumber || '',
            pedigreeRegistrationId: animal.pedigreeRegistrationId || '',
            breed: animal.breed || '',
            strain: animal.strain || '',
            geneticCode: animal.geneticCode || '',
            origin: animal.origin || 'Captive-bred',
            // Health Status
            isNeutered: animal.isNeutered || false,
            isInfertile: animal.isInfertile || false,
            medicalConditions: animal.medicalConditions || '',
            allergies: animal.allergies || '',
            medications: animal.medications || '',
            vetVisits: animal.vetVisits || '',
            primaryVet: animal.primaryVet || '',
            // Care & Environment
            dietType: animal.dietType || '',
            feedingSchedule: animal.feedingSchedule || '',
            supplements: animal.supplements || '',
            housingType: animal.housingType || '',
            bedding: animal.bedding || '',
            temperatureRange: animal.temperatureRange || '',
            humidity: animal.humidity || '',
            lighting: animal.lighting || '',
            enrichment: animal.enrichment || '',
            // Behavior
            temperament: animal.temperament || '',
            handlingTolerance: animal.handlingTolerance || '',
            socialStructure: animal.socialStructure || '',
            activityCycle: animal.activityCycle || '',
            lifeStage: animal.lifeStage || '',
            // Breeding Status
            isPregnant: animal.isPregnant || false,
            isNursing: animal.isNursing || false,
            isInMating: animal.isInMating || false,
            breedingRole: animal.breedingRole || 'both',
            heatStatus: animal.heatStatus || '',
            lastHeatDate: animal.lastHeatDate ? new Date(animal.lastHeatDate).toISOString().substring(0, 10) : '',
            ovulationDate: animal.ovulationDate ? new Date(animal.ovulationDate).toISOString().substring(0, 10) : '',
            matingDates: animal.matingDates || '',
            expectedDueDate: animal.expectedDueDate ? new Date(animal.expectedDueDate).toISOString().substring(0, 10) : '',
            litterCount: animal.litterCount || '',
            nursingStartDate: animal.nursingStartDate ? new Date(animal.nursingStartDate).toISOString().substring(0, 10) : '',
            weaningDate: animal.weaningDate ? new Date(animal.weaningDate).toISOString().substring(0, 10) : '',
            // Stud/Fertility (sire role)
            isStudAnimal: animal.isStudAnimal || false,
            availableForBreeding: animal.availableForBreeding || false,
            studFeeCurrency: animal.studFeeCurrency || 'USD',
            studFeeAmount: animal.studFeeAmount || '',
            fertilityStatus: animal.fertilityStatus || 'Unknown',
            lastMatingDate: animal.lastMatingDate ? new Date(animal.lastMatingDate).toISOString().substring(0, 10) : '',
            successfulMatings: animal.successfulMatings || '',
            fertilityNotes: animal.fertilityNotes || '',
            // Dam/Fertility (dam role)
            isDamAnimal: animal.isDamAnimal || false,
            damFertilityStatus: animal.damFertilityStatus || 'Unknown',
            lastPregnancyDate: animal.lastPregnancyDate ? new Date(animal.lastPregnancyDate).toISOString().substring(0, 10) : '',
            offspringCount: animal.offspringCount || '',
            damFertilityNotes: animal.damFertilityNotes || '',
            // Sale fields
            isForSale: animal.isForSale || false,
            salePriceCurrency: animal.salePriceCurrency || 'USD',
            salePriceAmount: animal.salePriceAmount || '',
            // Show/Competition
            showTitles: animal.showTitles || '',
            showRatings: animal.showRatings || '',
            judgeComments: animal.judgeComments || '',
            workingTitles: animal.workingTitles || '',
            // Legal/Death
            causeOfDeath: animal.causeOfDeath || '',
            necropsyResults: animal.necropsyResults || '',
            insurance: animal.insurance || '',
            legalStatus: animal.legalStatus || ''
        };
        setEditForm(formData);
        setOriginalEditForm(formData); // Store original values for comparison
        setEditReason('');
        setSelectedAnimal(animal);
        setShowEditModal(true);
        setShowOwnerSearch(false);
        setShowBreederSearch(false);
        setOwnerSearchQuery('');
        setBreederSearchQuery('');
    };
    
    const searchUsers = async (query, type) => {
        if (!query.trim()) {
            if (type === 'owner') setOwnerSearchResults([]);
            else setBreederSearchResults([]);
            return;
        }
        
        try {
            const filtered = users.filter(user => {
                const searchText = query.toLowerCase();
                const personalName = (user.personalName || '').toLowerCase();
                const username = (user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                const idPublic = (user.id_public || '').toLowerCase();
                return personalName.includes(searchText) || 
                       username.includes(searchText) || 
                       email.includes(searchText) ||
                       idPublic.includes(searchText);
            }).slice(0, 10);
            
            if (type === 'owner') setOwnerSearchResults(filtered);
            else setBreederSearchResults(filtered);
        } catch (err) {
            console.error('Search error:', err);
        }
    };
    
    const selectOwner = (user) => {
        setEditForm(prev => ({ ...prev, ownerId_public: user.id_public }));
        setShowOwnerSearch(false);
        setOwnerSearchQuery('');
        setOwnerSearchResults([]);
    };
    
    const selectBreeder = (user) => {
        setEditForm(prev => ({ ...prev, breederId_public: user.id_public, manualBreederName: '' }));
        setShowBreederSearch(false);
        setBreederSearchQuery('');
        setBreederSearchResults([]);
    };
    
    const clearOwner = () => {
        setEditForm(prev => ({ ...prev, ownerId_public: '' }));
    };
    
    const clearBreeder = () => {
        setEditForm(prev => ({ ...prev, breederId_public: '', manualBreederName: '' }));
    };
    
    const getOwnerDisplay = () => {
        if (!editForm.ownerId_public) return 'Click to Select Owner';
        const owner = users.find(u => u.id_public === editForm.ownerId_public);
        if (!owner) return editForm.ownerId_public;
        return `${owner.personalName || owner.username || owner.email} (${owner.id_public})`;
    };
    
    const getBreederDisplay = () => {
        if (!editForm.breederId_public) return 'Click to Select Breeder';
        const breeder = users.find(u => u.id_public === editForm.breederId_public);
        if (!breeder) return editForm.breederId_public;
        return `${breeder.personalName || breeder.username || breeder.email} (${breeder.id_public})`;
    };
    
    const getOwnerFilterDisplay = () => {
        if (!ownerFilter) return 'All Owners';
        const owner = users.find(u => u.id_public === ownerFilter);
        if (!owner) return ownerFilter;
        return owner.personalName || owner.username || owner.email;
    };
    
    const searchOwnerFilter = (query) => {
        if (!query.trim()) {
            setOwnerFilterSearchResults([]);
            return;
        }
        const filtered = users.filter(user => {
            const searchText = query.toLowerCase();
            const personalName = (user.personalName || '').toLowerCase();
            const username = (user.username ||'').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const idPublic = (user.id_public || '').toLowerCase();
            return personalName.includes(searchText) || 
                   username.includes(searchText) || 
                   email.includes(searchText) ||
                   idPublic.includes(searchText);
        }).slice(0, 10);
        setOwnerFilterSearchResults(filtered);
    };
    
    const selectOwnerFilter = (user) => {
        setOwnerFilter(user.id_public);
        setShowOwnerFilterDropdown(false);
        setOwnerFilterSearchQuery('');
        setOwnerFilterSearchResults([]);
        setPage(1);
    };
    
    const clearOwnerFilter = () => {
        setOwnerFilter('');
        setPage(1);
    };

    const handleSaveEdit = async () => {
        if (!editReason.trim()) {
            setError('Please provide a reason for the edit');
            return;
        }

        // Only send fields that were actually changed
        const changedFields = {};
        for (const key in editForm) {
            if (editForm[key] !== originalEditForm[key]) {
                changedFields[key] = editForm[key];
            }
        }

        // If no fields were changed, show error
        if (Object.keys(changedFields).length === 0) {
            setError('No fields were modified');
            return;
        }

        // If owner is being changed, resolve ownerId (backend ObjectId)
        // The Animal model requires both ownerId (ObjectId) and ownerId_public (string)
        if (changedFields.ownerId_public) {
            const selectedUser = users.find(u => u.id_public === changedFields.ownerId_public);
            if (selectedUser) {
                changedFields.ownerId = selectedUser._id;
                // ownerId_public is already in changedFields from the form
                // Set animal as owned and public when owner changes
                changedFields.isOwned = true;
                changedFields.showOnPublicProfile = true;
            } else {
                setError('Selected owner not found');
                return;
            }
        }

        // Note: breederId_public is already in changedFields from the form
        // There is no breederId ObjectId field in the Animal model
        
        // If manual breeder name is being set, ensure breederId_public is cleared
        if (changedFields.manualBreederName && changedFields.manualBreederName.trim() !== '') {
            changedFields.breederId_public = null;
        }
        
        // If breeder user is being selected, ensure manualBreederName is cleared
        if (changedFields.breederId_public && changedFields.breederId_public.trim() !== '') {
            changedFields.manualBreederName = null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/moderation/content/animal/${selectedAnimal._id}/edit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    fieldEdits: changedFields,
                    reason: editReason
                })
            });

            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message);

            setSuccess('Animal updated successfully');
            setShowEditModal(false);
            fetchAnimals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update animal');
        }
    };

    const handleHideAnimal = async (animal) => {
        if (!actionReason.trim()) {
            setError('Please provide a reason');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/animals/${animal._id}/hide`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ reason: actionReason })
            });

            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Animal hidden from public view');
            setShowDetailModal(false);
            setActionReason('');
            fetchAnimals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to hide animal');
        }
    };

    const handleRemoveImage = async (animal) => {
        if (!actionReason.trim()) {
            setError('Please provide a reason');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/moderation/animals/${animal._id}/image`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ reason: actionReason })
            });

            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message);

            setSuccess('Animal image removed');
            setActionReason('');
            // Refresh detail view
            openDetailModal(animal);
            fetchAnimals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to remove image');
        }
    };

    const handleDeleteAnimal = async () => {
        if (!actionReason.trim()) {
            setError('Please provide a reason for deletion');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/animals/${selectedAnimal._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ reason: actionReason })
            });

            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Animal permanently deleted');
            setShowDeleteConfirm(false);
            setShowDetailModal(false);
            setActionReason('');
            fetchAnimals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to delete animal');
        }
    };

    const getAnimalOwnerDisplay = (animal) => {
        if (animal.ownerId?.personalName) {
            return `${animal.ownerId.personalName} (${animal.ownerId.id_public || animal.ownerId.email})`;
        }
        return animal.ownerId?.email || animal.ownerId_public || 'Unknown';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB');
    };

    return (
        <div className="animal-mgmt-container">
            <div className="animal-mgmt-header">
                <h2>Animal Management</h2>
                <p className="animal-mgmt-subtitle">Search and manage animal records</p>
            </div>

            {error && <div className="animal-mgmt-error">{error}</div>}
            {success && <div className="animal-mgmt-success">{success}</div>}

            {/* Search and Filters */}
            <div className="animal-mgmt-filters">
                <form onSubmit={handleSearch} className="animal-mgmt-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>

                <div className="animal-mgmt-filter-row">
                    <select 
                        value={speciesFilter} 
                        onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Species</option>
                        {speciesList.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select 
                        value={publicFilter} 
                        onChange={(e) => { setPublicFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Visibility</option>
                        <option value="true">Public Only</option>
                        <option value="false">Private Only</option>
                    </select>

                    <select 
                        value={reportsFilter} 
                        onChange={(e) => { setReportsFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Reports Status</option>
                        <option value="true">Has Pending Reports</option>
                        <option value="false">No Reports</option>
                    </select>

                    <div style={{ position: 'relative', minWidth: '180px' }}>
                        <div 
                            onClick={() => setShowOwnerFilterDropdown(!showOwnerFilterDropdown)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '14px'
                            }}
                        >
                            <span style={{ color: ownerFilter ? '#000' : '#666' }}>
                                {getOwnerFilterDisplay()}
                            </span>
                            {ownerFilter && (
                                <X 
                                    size={16} 
                                    onClick={(e) => { e.stopPropagation(); clearOwnerFilter(); }}
                                    style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '8px' }}
                                />
                            )}
                        </div>
                        {showOwnerFilterDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                marginTop: '4px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                zIndex: 1000,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}>
                                <input
                                    type="text"
                                    value={ownerFilterSearchQuery}
                                    onChange={(e) => {
                                        setOwnerFilterSearchQuery(e.target.value);
                                        searchOwnerFilter(e.target.value);
                                    }}
                                    placeholder="Search owners..."
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: 'none',
                                        borderBottom: '1px solid #eee',
                                        outline: 'none',
                                        fontSize: '14px'
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                    {(ownerFilterSearchQuery ? ownerFilterSearchResults : users.slice(0, 10)).map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => selectOwnerFilter(user)}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #eee',
                                                backgroundColor: ownerFilter === user.id_public ? '#f3f4f6' : '#fff',
                                                fontSize: '14px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = ownerFilter === user.id_public ? '#f3f4f6' : '#fff'}
                                        >
                                            <div style={{ fontWeight: '500' }}>
                                                {user.personalName || user.username || user.email}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                                {user.id_public}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        className="refresh-btn"
                        onClick={() => fetchAnimals()}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="animal-mgmt-results-info">
                Showing {animals.length} of {total} animals
            </div>

            {/* Animals Table */}
            <div className="animal-mgmt-table-container">
                <table className="animal-mgmt-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Species</th>
                            <th>Owner</th>
                            <th>Status</th>
                            <th>Public</th>
                            <th>Reports</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="animal-mgmt-loading">Loading...</td>
                            </tr>
                        ) : animals.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="animal-mgmt-empty">No animals found</td>
                            </tr>
                        ) : (
                            animals.map(animal => (
                                <tr key={animal._id} className={animal.pendingReports > 0 ? 'has-reports' : ''}>
                                    <td className="animal-id">{animal.id_public}</td>
                                    <td className="animal-name">
                                        {animal.prefix && <span className="prefix">{animal.prefix}</span>}
                                        {animal.name}
                                        {animal.suffix && <span className="suffix">{animal.suffix}</span>}
                                    </td>
                                    <td>{animal.species}</td>
                                    <td className="animal-owner">
                                        <span title={getAnimalOwnerDisplay(animal)}>
                                            {animal.ownerId?.personalName || animal.ownerId?.email?.split('@')[0] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>{animal.status || '-'}</td>
                                    <td>
                                        {animal.showOnPublicProfile ? (
                                            <span className="badge public">Public</span>
                                        ) : (
                                            <span className="badge private">Private</span>
                                        )}
                                    </td>
                                    <td>
                                        {animal.pendingReports > 0 ? (
                                            <span className="badge reports">{animal.pendingReports}</span>
                                        ) : '-'}
                                    </td>
                                    <td>{formatDate(animal.createdAt)}</td>
                                    <td className="animal-actions">
                                        <button 
                                            onClick={() => openDetailModal(animal)} 
                                            title="View Details"
                                            className="action-btn view"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(animal)} 
                                            title="Edit"
                                            className="action-btn edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="animal-mgmt-pagination">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedAnimal && (
                <div className="animal-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="animal-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header">
                            <h3>
                                {selectedAnimal.prefix && `${selectedAnimal.prefix} `}
                                {selectedAnimal.name}
                                {selectedAnimal.suffix && ` ${selectedAnimal.suffix}`}
                            </h3>
                            <span className="animal-modal-id">{selectedAnimal.id_public}</span>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="animal-modal-body">
                            {/* Image Section */}
                            {selectedAnimal.imageUrl && (
                                <div className="animal-detail-section">
                                    <h4>Image</h4>
                                    <div className="animal-image-preview">
                                        <img src={selectedAnimal.imageUrl} alt={selectedAnimal.name} />
                                        <div className="image-action-row">
                                            <input
                                                type="text"
                                                placeholder="Reason for removal..."
                                                value={actionReason}
                                                onChange={(e) => setActionReason(e.target.value)}
                                            />
                                            <button 
                                                className="btn-danger"
                                                onClick={() => handleRemoveImage(selectedAnimal)}
                                            >
                                                <Image size={14} /> Remove Image
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Basic Info */}
                            <div className="animal-detail-section">
                                <h4>Basic Information</h4>
                                <div className="detail-grid">
                                    <div><strong>Species:</strong> {selectedAnimal.species}</div>
                                    <div><strong>Gender:</strong> {selectedAnimal.gender}</div>
                                    <div><strong>Status:</strong> {selectedAnimal.status || '-'}</div>
                                    <div><strong>Created:</strong> {formatDate(selectedAnimal.createdAt)}</div>
                                </div>
                            </div>

                            {/* Ownership */}
                            <div className="animal-detail-section">
                                <h4>Ownership</h4>
                                <div className="detail-grid">
                                    <div>
                                        <strong>Current Owner:</strong>{' '}
                                        {selectedAnimal.ownerId?.personalName || selectedAnimal.ownerId?.email || 'Unknown'}
                                        {selectedAnimal.ownerId?.id_public && (
                                            <span className="owner-id"> ({selectedAnimal.ownerId.id_public})</span>
                                        )}
                                    </div>
                                    {selectedAnimal.originalOwnerId && selectedAnimal.originalOwnerId._id !== selectedAnimal.ownerId?._id && (
                                        <div>
                                            <strong>Original Breeder:</strong>{' '}
                                            {selectedAnimal.originalOwnerId.personalName || selectedAnimal.originalOwnerId.email}
                                        </div>
                                    )}
                                    {selectedAnimal.soldStatus && (
                                        <div><strong>Transfer Status:</strong> {selectedAnimal.soldStatus}</div>
                                    )}
                                </div>
                            </div>

                            {/* Lineage */}
                            <div className="animal-detail-section">
                                <h4>Lineage</h4>
                                <div className="detail-grid">
                                    <div><strong>Sire:</strong> {selectedAnimal.sireId_public || '-'}</div>
                                    <div><strong>Dam:</strong> {selectedAnimal.damId_public || '-'}</div>
                                </div>
                            </div>

                            {/* Remarks */}
                            {selectedAnimal.remarks && (
                                <div className="animal-detail-section">
                                    <h4>Remarks</h4>
                                    <p className="remarks-text">{selectedAnimal.remarks}</p>
                                </div>
                            )}

                            {/* Reports */}
                            {selectedAnimal.reports && selectedAnimal.reports.length > 0 && (
                                <div className="animal-detail-section reports-section">
                                    <h4><AlertTriangle size={16} /> Reports ({selectedAnimal.reports.length})</h4>
                                    <div className="reports-list">
                                        {selectedAnimal.reports.map(report => (
                                            <div key={report._id} className={`report-item ${report.status}`}>
                                                <div className="report-header">
                                                    <span className={`report-status ${report.status}`}>{report.status}</span>
                                                    <span className="report-date">{formatDate(report.createdAt)}</span>
                                                </div>
                                                <p className="report-reason">{report.reason}</p>
                                                <p className="report-by">
                                                    Reported by: {report.reporterId?.personalName || report.reporterId?.email || 'Unknown'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="animal-detail-section actions-section">
                                <h4>Actions</h4>
                                <div className="action-row">
                                    <input
                                        type="text"
                                        placeholder="Reason for action..."
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                        className="action-reason-input"
                                    />
                                </div>
                                <div className="action-buttons">
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => openEditModal(selectedAnimal)}
                                    >
                                        <Edit size={14} /> Edit Fields
                                    </button>
                                    {selectedAnimal.showOnPublicProfile && (
                                        <button 
                                            className="btn-warning"
                                            onClick={() => handleHideAnimal(selectedAnimal)}
                                        >
                                            <EyeOff size={14} /> Hide from Public
                                        </button>
                                    )}
                                    {userRole === 'admin' && (
                                        <button 
                                            className="btn-danger"
                                            onClick={() => setShowDeleteConfirm(true)}
                                        >
                                            <Trash2 size={14} /> Delete Animal
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedAnimal && (
                <div className="animal-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="animal-modal edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header">
                            <h3>Edit Animal: {selectedAnimal.id_public}</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="animal-modal-body">
                            <div className="edit-form" style={{maxHeight: '70vh', overflowY: 'auto', padding: '20px'}}>
                                {/* BASIC INFORMATION */}
                                <div className="form-section">
                                    <h4 className="section-title">Basic Information</h4>
                                    <div className="form-row">
                                        <label>Prefix</label>
                                        <input
                                            type="text"
                                            value={editForm.prefix || ''}
                                            onChange={(e) => setEditForm({...editForm, prefix: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Suffix</label>
                                        <input
                                            type="text"
                                            value={editForm.suffix || ''}
                                            onChange={(e) => setEditForm({...editForm, suffix: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Species</label>
                                        <input
                                            type="text"
                                            value={editForm.species || ''}
                                            onChange={(e) => setEditForm({...editForm, species: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Gender</label>
                                        <select
                                            value={editForm.gender || ''}
                                            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Intersex">Intersex</option>
                                            <option value="Unknown">Unknown</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Status</label>
                                        <select
                                            value={editForm.status || ''}
                                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                        >
                                            <option value="Pet">Pet</option>
                                            <option value="Breeder">Breeder</option>
                                            <option value="Available">Available</option>
                                            <option value="Booked">Booked</option>
                                            <option value="Retired">Retired</option>
                                            <option value="Deceased">Deceased</option>
                                            <option value="Rehomed">Rehomed</option>
                                            <option value="Unknown">Unknown</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Life Stage</label>
                                        <select
                                            value={editForm.lifeStage || ''}
                                            onChange={(e) => setEditForm({...editForm, lifeStage: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Newborn">Newborn</option>
                                            <option value="Kit/Pup">Kit/Pup</option>
                                            <option value="Juvenile">Juvenile</option>
                                            <option value="Adult">Adult</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Geriatric">Geriatric</option>
                                        </select>
                                    </div>
                                </div>

                                {/* DATES */}
                                <div className="form-section">
                                    <h4 className="section-title">Important Dates</h4>
                                    <div className="form-row">
                                        <label>Birth Date</label>
                                        <input
                                            type="date"
                                            value={editForm.birthDate || ''}
                                            onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Deceased Date</label>
                                        <input
                                            type="date"
                                            value={editForm.deceasedDate || ''}
                                            onChange={(e) => setEditForm({...editForm, deceasedDate: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* IDENTIFICATION */}
                                <div className="form-section">
                                    <h4 className="section-title">Identification & Genetics</h4>
                                    <div className="form-row">
                                        <label>Microchip Number</label>
                                        <input
                                            type="text"
                                            value={editForm.microchipNumber || ''}
                                            onChange={(e) => setEditForm({...editForm, microchipNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Pedigree Registration ID</label>
                                        <input
                                            type="text"
                                            value={editForm.pedigreeRegistrationId || ''}
                                            onChange={(e) => setEditForm({...editForm, pedigreeRegistrationId: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Genetic Code</label>
                                        <input
                                            type="text"
                                            value={editForm.geneticCode || ''}
                                            onChange={(e) => setEditForm({...editForm, geneticCode: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Breed</label>
                                        <input
                                            type="text"
                                            value={editForm.breed || ''}
                                            onChange={(e) => setEditForm({...editForm, breed: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Strain</label>
                                        <input
                                            type="text"
                                            value={editForm.strain || ''}
                                            onChange={(e) => setEditForm({...editForm, strain: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Origin</label>
                                        <select
                                            value={editForm.origin || ''}
                                            onChange={(e) => setEditForm({...editForm, origin: e.target.value})}
                                        >
                                            <option value="Captive-bred">Captive-bred</option>
                                            <option value="Wild-caught">Wild-caught</option>
                                            <option value="Rescued">Rescued</option>
                                            <option value="Unknown">Unknown</option>
                                        </select>
                                    </div>
                                </div>

                                {/* APPEARANCE */}
                                <div className="form-section">
                                    <h4 className="section-title">Appearance</h4>
                                    <div className="form-row">
                                        <label>Color</label>
                                        <input
                                            type="text"
                                            value={editForm.color || ''}
                                            onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Coat</label>
                                        <input
                                            type="text"
                                            value={editForm.coat || ''}
                                            onChange={(e) => setEditForm({...editForm, coat: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Coat Pattern</label>
                                        <input
                                            type="text"
                                            value={editForm.coatPattern || ''}
                                            onChange={(e) => setEditForm({...editForm, coatPattern: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Ear Set</label>
                                        <input
                                            type="text"
                                            value={editForm.earset || ''}
                                            onChange={(e) => setEditForm({...editForm, earset: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* PHYSICAL MEASUREMENTS */}
                                <div className="form-section">
                                    <h4 className="section-title">Physical Measurements</h4>
                                    <div className="form-row">
                                        <label>Body Weight</label>
                                        <input
                                            type="text"
                                            value={editForm.bodyWeight || ''}
                                            onChange={(e) => setEditForm({...editForm, bodyWeight: e.target.value})}
                                            placeholder="e.g., 2.5kg"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Body Length</label>
                                        <input
                                            type="text"
                                            value={editForm.bodyLength || ''}
                                            onChange={(e) => setEditForm({...editForm, bodyLength: e.target.value})}
                                            placeholder="e.g., 30cm"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Height at Withers</label>
                                        <input
                                            type="text"
                                            value={editForm.heightAtWithers || ''}
                                            onChange={(e) => setEditForm({...editForm, heightAtWithers: e.target.value})}
                                            placeholder="e.g., 25cm"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Body Condition Score</label>
                                        <select
                                            value={editForm.bodyConditionScore || ''}
                                            onChange={(e) => setEditForm({...editForm, bodyConditionScore: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            <option value="1">1 - Emaciated</option>
                                            <option value="2">2 - Underweight</option>
                                            <option value="3">3 - Ideal</option>
                                            <option value="4">4 - Overweight</option>
                                            <option value="5">5 - Obese</option>
                                        </select>
                                    </div>
                                </div>

                                {/* PARENTAGE */}
                                <div className="form-section">
                                    <h4 className="section-title">Parentage</h4>
                                    <div className="form-row">
                                        <label>Sire ID</label>
                                        <input
                                            type="text"
                                            value={editForm.sireId_public || ''}
                                            onChange={(e) => setEditForm({...editForm, sireId_public: e.target.value})}
                                            placeholder="CTC###"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Dam ID</label>
                                        <input
                                            type="text"
                                            value={editForm.damId_public || ''}
                                            onChange={(e) => setEditForm({...editForm, damId_public: e.target.value})}
                                            placeholder="CTC###"
                                        />
                                    </div>
                                </div>
                                <div className="form-row full-width">
                                    <label>Owner</label>
                                    <div style={{ position: 'relative' }}>
                                        <div 
                                            onClick={() => setShowOwnerSearch(!showOwnerSearch)}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ color: editForm.ownerId_public ? '#000' : '#999' }}>
                                                {getOwnerDisplay()}
                                            </span>
                                            {editForm.ownerId_public && (
                                                <X 
                                                    size={16} 
                                                    onClick={(e) => { e.stopPropagation(); clearOwner(); }}
                                                    style={{ color: '#ef4444', cursor: 'pointer' }}
                                                />
                                            )}
                                        </div>
                                        {showOwnerSearch && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                marginTop: '4px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}>
                                                <input
                                                    type="text"
                                                    value={ownerSearchQuery}
                                                    onChange={(e) => {
                                                        setOwnerSearchQuery(e.target.value);
                                                        searchUsers(e.target.value, 'owner');
                                                    }}
                                                    placeholder="Search users..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: 'none',
                                                        borderBottom: '1px solid #eee',
                                                        outline: 'none'
                                                    }}
                                                    autoFocus
                                                />
                                                <div>
                                                    {(ownerSearchQuery ? ownerSearchResults : users.slice(0, 10)).map(user => (
                                                        <div
                                                            key={user._id}
                                                            onClick={() => selectOwner(user)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #eee',
                                                                backgroundColor: editForm.ownerId_public === user.id_public ? '#f3f4f6' : '#fff'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = editForm.ownerId_public === user.id_public ? '#f3f4f6' : '#fff'}
                                                        >
                                                            <div style={{ fontWeight: '500' }}>
                                                                {user.personalName || user.username || user.email}
                                                            </div>
                                                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                                                {user.id_public}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row full-width">
                                    <label>Breeder (User)</label>
                                    <div style={{ position: 'relative' }}>
                                        <div 
                                            onClick={() => setShowBreederSearch(!showBreederSearch)}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ color: editForm.breederId_public ? '#000' : '#999' }}>
                                                {getBreederDisplay()}
                                            </span>
                                            {editForm.breederId_public && (
                                                <X 
                                                    size={16} 
                                                    onClick={(e) => { e.stopPropagation(); clearBreeder(); }}
                                                    style={{ color: '#ef4444', cursor: 'pointer' }}
                                                />
                                            )}
                                        </div>
                                        {showBreederSearch && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                marginTop: '4px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}>
                                                <input
                                                    type="text"
                                                    value={breederSearchQuery}
                                                    onChange={(e) => {
                                                        setBreederSearchQuery(e.target.value);
                                                        searchUsers(e.target.value, 'breeder');
                                                    }}
                                                    placeholder="Search users..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: 'none',
                                                        borderBottom: '1px solid #eee',
                                                        outline: 'none'
                                                    }}
                                                    autoFocus
                                                />
                                                <div>
                                                    {(breederSearchQuery ? breederSearchResults : users.slice(0, 10)).map(user => (
                                                        <div
                                                            key={user._id}
                                                            onClick={() => selectBreeder(user)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #eee',
                                                                backgroundColor: editForm.breederId_public === user.id_public ? '#f3f4f6' : '#fff'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = editForm.breederId_public === user.id_public ? '#f3f4f6' : '#fff'}
                                                        >
                                                            <div style={{ fontWeight: '500' }}>
                                                                {user.personalName || user.username || user.email}
                                                            </div>
                                                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                                                {user.id_public}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row full-width">
                                    <label>Or Manual Breeder Name</label>
                                    <input
                                        type="text"
                                        value={editForm.manualBreederName || ''}
                                        onChange={(e) => setEditForm({...editForm, manualBreederName: e.target.value, breederId_public: ''})}
                                        placeholder="Enter breeder name if not a registered user"
                                    />
                                </div>
                                
                                {/* OWNERSHIP */}
                                <div className="form-section">
                                    <h4 className="section-title">Ownership & Display</h4>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isOwned ?? true}
                                                onChange={(e) => setEditForm({...editForm, isOwned: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Currently Owned</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isDisplay ?? false}
                                                onChange={(e) => setEditForm({...editForm, isDisplay: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Display Animal (Show/Exhibition)</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label>Current Owner Name</label>
                                        <input
                                            type="text"
                                            value={editForm.currentOwner || ''}
                                            onChange={(e) => setEditForm({...editForm, currentOwner: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Owner Display Name</label>
                                        <input
                                            type="text"
                                            value={editForm.ownerName || ''}
                                            onChange={(e) => setEditForm({...editForm, ownerName: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* HEALTH STATUS */}
                                <div className="form-section">
                                    <h4 className="section-title">Health Status</h4>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isNeutered || false}
                                                onChange={(e) => setEditForm({...editForm, isNeutered: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Spayed/Neutered</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isInfertile || false}
                                                onChange={(e) => setEditForm({...editForm, isInfertile: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Infertile/Sterile</span>
                                        </label>
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Medical Conditions</label>
                                        <textarea
                                            value={editForm.medicalConditions || ''}
                                            onChange={(e) => setEditForm({...editForm, medicalConditions: e.target.value})}
                                            rows={3}
                                            placeholder="List any known medical conditions..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Allergies</label>
                                        <textarea
                                            value={editForm.allergies || ''}
                                            onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                                            rows={2}
                                            placeholder="List any known allergies..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Current Medications</label>
                                        <textarea
                                            value={editForm.medications || ''}
                                            onChange={(e) => setEditForm({...editForm, medications: e.target.value})}
                                            rows={2}
                                            placeholder="List current medications..."
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Primary Veterinarian</label>
                                        <input
                                            type="text"
                                            value={editForm.primaryVet || ''}
                                            onChange={(e) => setEditForm({...editForm, primaryVet: e.target.value})}
                                            placeholder="Vet clinic name"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Vet Visit History</label>
                                        <textarea
                                            value={editForm.vetVisits || ''}
                                            onChange={(e) => setEditForm({...editForm, vetVisits: e.target.value})}
                                            rows={3}
                                            placeholder="Recent vet visits and treatments..."
                                        />
                                    </div>
                                </div>

                                {/* CARE & ENVIRONMENT */}
                                <div className="form-section">
                                    <h4 className="section-title">Care & Environment</h4>
                                    <div className="form-row">
                                        <label>Diet Type</label>
                                        <input
                                            type="text"
                                            value={editForm.dietType || ''}
                                            onChange={(e) => setEditForm({...editForm, dietType: e.target.value})}
                                            placeholder="e.g., Commercial pellets, Natural diet"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Feeding Schedule</label>
                                        <textarea
                                            value={editForm.feedingSchedule || ''}
                                            onChange={(e) => setEditForm({...editForm, feedingSchedule: e.target.value})}
                                            rows={2}
                                            placeholder="Feeding times and amounts..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Supplements</label>
                                        <textarea
                                            value={editForm.supplements || ''}
                                            onChange={(e) => setEditForm({...editForm, supplements: e.target.value})}
                                            rows={2}
                                            placeholder="Vitamins, minerals, other supplements..."
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Housing Type</label>
                                        <input
                                            type="text"
                                            value={editForm.housingType || ''}
                                            onChange={(e) => setEditForm({...editForm, housingType: e.target.value})}
                                            placeholder="e.g., Cage, Hutch, Free-range"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Bedding</label>
                                        <input
                                            type="text"
                                            value={editForm.bedding || ''}
                                            onChange={(e) => setEditForm({...editForm, bedding: e.target.value})}
                                            placeholder="e.g., Wood shavings, Paper"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Temperature Range</label>
                                        <input
                                            type="text"
                                            value={editForm.temperatureRange || ''}
                                            onChange={(e) => setEditForm({...editForm, temperatureRange: e.target.value})}
                                            placeholder="e.g., 18-22°C"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Humidity</label>
                                        <input
                                            type="text"
                                            value={editForm.humidity || ''}
                                            onChange={(e) => setEditForm({...editForm, humidity: e.target.value})}
                                            placeholder="e.g., 50-60%"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Lighting</label>
                                        <input
                                            type="text"
                                            value={editForm.lighting || ''}
                                            onChange={(e) => setEditForm({...editForm, lighting: e.target.value})}
                                            placeholder="e.g., UV lamp, Natural light"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Environmental Enrichment</label>
                                        <textarea
                                            value={editForm.enrichment || ''}
                                            onChange={(e) => setEditForm({...editForm, enrichment: e.target.value})}
                                            rows={2}
                                            placeholder="Toys, activities, enrichment items..."
                                        />
                                    </div>
                                </div>

                                {/* BEHAVIOR */}
                                <div className="form-section">
                                    <h4 className="section-title">Behavior & Temperament</h4>
                                    <div className="form-row">
                                        <label>Temperament</label>
                                        <input
                                            type="text"
                                            value={editForm.temperament || ''}
                                            onChange={(e) => setEditForm({...editForm, temperament: e.target.value})}
                                            placeholder="e.g., Calm, Active, Aggressive"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Handling Tolerance</label>
                                        <select
                                            value={editForm.handlingTolerance || ''}
                                            onChange={(e) => setEditForm({...editForm, handlingTolerance: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Poor">Poor</option>
                                            <option value="Aggressive">Aggressive</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Social Structure</label>
                                        <input
                                            type="text"
                                            value={editForm.socialStructure || ''}
                                            onChange={(e) => setEditForm({...editForm, socialStructure: e.target.value})}
                                            placeholder="e.g., Solitary, Pair-bonded, Group"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Activity Cycle</label>
                                        <select
                                            value={editForm.activityCycle || ''}
                                            onChange={(e) => setEditForm({...editForm, activityCycle: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Diurnal">Diurnal (Day active)</option>
                                            <option value="Nocturnal">Nocturnal (Night active)</option>
                                            <option value="Crepuscular">Crepuscular (Dawn/Dusk active)</option>
                                            <option value="Cathemeral">Cathemeral (Variable)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* BREEDING STATUS */}
                                <div className="form-section">
                                    <h4 className="section-title">Breeding Status</h4>
                                    <div className="form-row">
                                        <label>Breeding Role</label>
                                        <select
                                            value={editForm.breedingRole || 'both'}
                                            onChange={(e) => setEditForm({...editForm, breedingRole: e.target.value})}
                                        >
                                            <option value="both">Both (Sire & Dam)</option>
                                            <option value="sire">Sire Only</option>
                                            <option value="dam">Dam Only</option>
                                            <option value="neither">Not for Breeding</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isPregnant || false}
                                                onChange={(e) => setEditForm({...editForm, isPregnant: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Currently Pregnant</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isNursing || false}
                                                onChange={(e) => setEditForm({...editForm, isNursing: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Currently Nursing</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isInMating || false}
                                                onChange={(e) => setEditForm({...editForm, isInMating: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Currently in Mating Process</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label>Heat Status</label>
                                        <select
                                            value={editForm.heatStatus || ''}
                                            onChange={(e) => setEditForm({...editForm, heatStatus: e.target.value})}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Not in heat">Not in heat</option>
                                            <option value="Pre-heat">Pre-heat</option>
                                            <option value="In heat">In heat</option>
                                            <option value="Post-heat">Post-heat</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Last Heat Date</label>
                                        <input
                                            type="date"
                                            value={editForm.lastHeatDate || ''}
                                            onChange={(e) => setEditForm({...editForm, lastHeatDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Expected Due Date</label>
                                        <input
                                            type="date"
                                            value={editForm.expectedDueDate || ''}
                                            onChange={(e) => setEditForm({...editForm, expectedDueDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Litter Count</label>
                                        <input
                                            type="number"
                                            value={editForm.litterCount || ''}
                                            onChange={(e) => setEditForm({...editForm, litterCount: e.target.value})}
                                            placeholder="Number of offspring"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Total Offspring Count</label>
                                        <input
                                            type="number"
                                            value={editForm.offspringCount || ''}
                                            onChange={(e) => setEditForm({...editForm, offspringCount: e.target.value})}
                                            placeholder="Lifetime offspring count"
                                        />
                                    </div>
                                </div>

                                {/* STUD/FERTILITY */}
                                <div className="form-section">
                                    <h4 className="section-title">Stud & Fertility</h4>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isStudAnimal || false}
                                                onChange={(e) => setEditForm({...editForm, isStudAnimal: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Available as Stud</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.availableForBreeding || false}
                                                onChange={(e) => setEditForm({...editForm, availableForBreeding: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Available for Breeding</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label>Stud Fee Currency</label>
                                        <select
                                            value={editForm.studFeeCurrency || 'USD'}
                                            onChange={(e) => setEditForm({...editForm, studFeeCurrency: e.target.value})}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Stud Fee Amount</label>
                                        <input
                                            type="number"
                                            value={editForm.studFeeAmount || ''}
                                            onChange={(e) => setEditForm({...editForm, studFeeAmount: e.target.value})}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Fertility Status</label>
                                        <select
                                            value={editForm.fertilityStatus || 'Unknown'}
                                            onChange={(e) => setEditForm({...editForm, fertilityStatus: e.target.value})}
                                        >
                                            <option value="Unknown">Unknown</option>
                                            <option value="Proven Fertile">Proven Fertile</option>
                                            <option value="Assumed Fertile">Assumed Fertile</option>
                                            <option value="Questionable">Questionable</option>
                                            <option value="Infertile">Infertile</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Last Mating Date</label>
                                        <input
                                            type="date"
                                            value={editForm.lastMatingDate || ''}
                                            onChange={(e) => setEditForm({...editForm, lastMatingDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Successful Matings</label>
                                        <input
                                            type="number"
                                            value={editForm.successfulMatings || ''}
                                            onChange={(e) => setEditForm({...editForm, successfulMatings: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Fertility Notes</label>
                                        <textarea
                                            value={editForm.fertilityNotes || ''}
                                            onChange={(e) => setEditForm({...editForm, fertilityNotes: e.target.value})}
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* SALE INFORMATION */}
                                <div className="form-section">
                                    <h4 className="section-title">Sale Information</h4>
                                    <div className="form-row">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isForSale || false}
                                                onChange={(e) => setEditForm({...editForm, isForSale: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Currently for Sale</span>
                                        </label>
                                    </div>
                                    <div className="form-row">
                                        <label>Sale Price Currency</label>
                                        <select
                                            value={editForm.salePriceCurrency || 'USD'}
                                            onChange={(e) => setEditForm({...editForm, salePriceCurrency: e.target.value})}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Sale Price Amount</label>
                                        <input
                                            type="number"
                                            value={editForm.salePriceAmount || ''}
                                            onChange={(e) => setEditForm({...editForm, salePriceAmount: e.target.value})}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* SHOW & COMPETITION */}
                                <div className="form-section">
                                    <h4 className="section-title">Show & Competition</h4>
                                    <div className="form-row full-width">
                                        <label>Show Titles</label>
                                        <textarea
                                            value={editForm.showTitles || ''}
                                            onChange={(e) => setEditForm({...editForm, showTitles: e.target.value})}
                                            rows={2}
                                            placeholder="Awards and titles earned..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Show Ratings</label>
                                        <textarea
                                            value={editForm.showRatings || ''}
                                            onChange={(e) => setEditForm({...editForm, showRatings: e.target.value})}
                                            rows={2}
                                            placeholder="Show ratings and scores..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Judge Comments</label>
                                        <textarea
                                            value={editForm.judgeComments || ''}
                                            onChange={(e) => setEditForm({...editForm, judgeComments: e.target.value})}
                                            rows={3}
                                            placeholder="Comments from judges..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Working Titles</label>
                                        <textarea
                                            value={editForm.workingTitles || ''}
                                            onChange={(e) => setEditForm({...editForm, workingTitles: e.target.value})}
                                            rows={2}
                                            placeholder="Working or performance titles..."
                                        />
                                    </div>
                                </div>

                                {/* LEGAL & DEATH */}
                                <div className="form-section">
                                    <h4 className="section-title">Legal & Death Information</h4>
                                    <div className="form-row">
                                        <label>Legal Status</label>
                                        <input
                                            type="text"
                                            value={editForm.legalStatus || ''}
                                            onChange={(e) => setEditForm({...editForm, legalStatus: e.target.value})}
                                            placeholder="Legal ownership status"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Insurance</label>
                                        <input
                                            type="text"
                                            value={editForm.insurance || ''}
                                            onChange={(e) => setEditForm({...editForm, insurance: e.target.value})}
                                            placeholder="Insurance information"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Cause of Death</label>
                                        <textarea
                                            value={editForm.causeOfDeath || ''}
                                            onChange={(e) => setEditForm({...editForm, causeOfDeath: e.target.value})}
                                            rows={2}
                                            placeholder="If deceased, cause of death..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Necropsy Results</label>
                                        <textarea
                                            value={editForm.necropsyResults || ''}
                                            onChange={(e) => setEditForm({...editForm, necropsyResults: e.target.value})}
                                            rows={3}
                                            placeholder="Post-mortem examination results..."
                                        />
                                    </div>
                                </div>

                                {/* NOTES & REMARKS */}
                                <div className="form-section">
                                    <h4 className="section-title">Notes & Remarks</h4>
                                    <div className="form-row full-width">
                                        <label>Remarks</label>
                                        <textarea
                                            value={editForm.remarks || ''}
                                            onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
                                            rows={4}
                                            placeholder="General notes and remarks..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.showOnPublicProfile || false}
                                                onChange={(e) => setEditForm({...editForm, showOnPublicProfile: e.target.checked})}
                                                style={{ width: 'auto', cursor: 'pointer' }}
                                            />
                                            <span>Show on Public Profile (Make Public)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="form-row full-width">
                                    <label>Reason for Edit *</label>
                                    <input
                                        type="text"
                                        value={editReason}
                                        onChange={(e) => setEditReason(e.target.value)}
                                        placeholder="Why are you making this edit?"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleSaveEdit}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="animal-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="animal-modal confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header danger">
                            <h3><Trash2 size={20} /> Confirm Deletion</h3>
                        </div>
                        <div className="animal-modal-body">
                            <p className="confirm-warning">
                                Are you sure you want to <strong>permanently delete</strong> this animal?
                            </p>
                            <p className="confirm-animal">
                                <strong>{selectedAnimal?.name}</strong> ({selectedAnimal?.id_public})
                            </p>
                            <p className="confirm-note">
                                This action cannot be undone. The animal will be removed from all records.
                            </p>
                            <div className="form-row full-width">
                                <label>Reason for Deletion *</label>
                                <input
                                    type="text"
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    placeholder="Why is this animal being deleted?"
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="btn-danger" onClick={handleDeleteAnimal}>
                                    Delete Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
