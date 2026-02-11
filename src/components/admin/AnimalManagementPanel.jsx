import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Filter, Eye, EyeOff, Trash2, Edit, AlertTriangle, 
    ChevronLeft, ChevronRight, X, ExternalLink, Image, User,
    RefreshCw, FileText
} from 'lucide-react';
import './AnimalManagementPanel.css';
import './AnimalManagementTabs.css';

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
    
    // Modal tabs
    const [viewActiveTab, setViewActiveTab] = useState('overview');
    const [editActiveTab, setEditActiveTab] = useState('overview');
    
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
            // Basic identification
            breederyId: animal.breederyId || animal.registryCode || '',
            tags: animal.tags || [],
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
            // Physical Measurements
            bodyWeight: animal.bodyWeight || '',
            bodyLength: animal.bodyLength || '',
            heightAtWithers: animal.heightAtWithers || '',
            bodyConditionScore: animal.bodyConditionScore || '',
            chestGirth: animal.chestGirth || '',
            adultWeight: animal.adultWeight || '',
            // Identification
            microchipNumber: animal.microchipNumber || '',
            pedigreeRegistrationId: animal.pedigreeRegistrationId || '',
            breed: animal.breed || '',
            strain: animal.strain || '',
            geneticCode: animal.geneticCode || '',
            origin: animal.origin || 'Captive-bred',
            // Dog/Cat specific identification
            licenseNumber: animal.licenseNumber || '',
            licenseJurisdiction: animal.licenseJurisdiction || '',
            rabiesTagNumber: animal.rabiesTagNumber || '',
            tattooId: animal.tattooId || '',
            akcRegistrationNumber: animal.akcRegistrationNumber || '',
            fciRegistrationNumber: animal.fciRegistrationNumber || '',
            cfaRegistrationNumber: animal.cfaRegistrationNumber || '',
            workingRegistryIds: animal.workingRegistryIds || '',
            // Health Status
            isNeutered: animal.isNeutered || false,
            isInfertile: animal.isInfertile || false,
            spayNeuterDate: animal.spayNeuterDate ? new Date(animal.spayNeuterDate).toISOString().substring(0, 10) : '',
            medicalConditions: animal.medicalConditions || '',
            allergies: animal.allergies || '',
            medications: animal.medications || '',
            vetVisits: animal.vetVisits || '',
            primaryVet: animal.primaryVet || '',
            chronicConditions: animal.chronicConditions || '',
            parasitePreventionSchedule: animal.parasitePreventionSchedule || '',
            heartwormStatus: animal.heartwormStatus || '',
            hipElbowScores: animal.hipElbowScores || '',
            geneticTestResults: animal.geneticTestResults || '',
            eyeClearance: animal.eyeClearance || '',
            cardiacClearance: animal.cardiacClearance || '',
            dentalRecords: animal.dentalRecords || '',
            // Care & Environment
            dietType: animal.dietType || '',
            feedingSchedule: animal.feedingSchedule || '',
            supplements: animal.supplements || '',
            housingType: animal.housingType || '',
            bedding: animal.bedding || '',
            temperatureRange: animal.temperatureRange || '',
            humidity: animal.humidity || '',
            lighting: animal.lighting || '',
            noise: animal.noise || '',
            enrichment: animal.enrichment || '',
            // Dog/Cat specific husbandry
            exerciseRequirements: animal.exerciseRequirements || '',
            dailyExerciseMinutes: animal.dailyExerciseMinutes || '',
            groomingNeeds: animal.groomingNeeds || '',
            sheddingLevel: animal.sheddingLevel || '',
            crateTrained: animal.crateTrained || false,
            litterTrained: animal.litterTrained || false,
            leashTrained: animal.leashTrained || false,
            // Behavior
            temperament: animal.temperament || '',
            handlingTolerance: animal.handlingTolerance || '',
            socialStructure: animal.socialStructure || '',
            activityCycle: animal.activityCycle || '',
            lifeStage: animal.lifeStage || '',
            // Training & Behavior
            trainingLevel: animal.trainingLevel || '',
            trainingDisciplines: animal.trainingDisciplines || '',
            certifications: animal.certifications || '',
            workingRole: animal.workingRole || '',
            behavioralIssues: animal.behavioralIssues || '',
            biteHistory: animal.biteHistory || '',
            reactivityNotes: animal.reactivityNotes || '',
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
            // Reproduction specific
            estrusCycleLength: animal.estrusCycleLength || '',
            gestationLength: animal.gestationLength || '',
            artificialInseminationUsed: animal.artificialInseminationUsed || false,
            whelpingDate: animal.whelpingDate ? new Date(animal.whelpingDate).toISOString().substring(0, 10) : '',
            queeningDate: animal.queeningDate ? new Date(animal.queeningDate).toISOString().substring(0, 10) : '',
            deliveryMethod: animal.deliveryMethod || '',
            reproductiveComplications: animal.reproductiveComplications || '',
            reproductiveClearances: animal.reproductiveClearances || '',
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
            performanceScores: animal.performanceScores || '',
            // Legal/Death
            causeOfDeath: animal.causeOfDeath || '',
            necropsyResults: animal.necropsyResults || '',
            insurance: animal.insurance || '',
            legalStatus: animal.legalStatus || '',
            endOfLifeCareNotes: animal.endOfLifeCareNotes || '',
            coOwnership: animal.coOwnership || '',
            transferHistory: animal.transferHistory || '',
            breedingRestrictions: animal.breedingRestrictions || '',
            exportRestrictions: animal.exportRestrictions || '',
            ownershipHistory: animal.ownershipHistory || []
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
                    <div className="animal-modal large-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header">
                            <div className="modal-title-section">
                                <h3>
                                    {selectedAnimal.prefix && `${selectedAnimal.prefix} `}
                                    {selectedAnimal.name}
                                    {selectedAnimal.suffix && ` ${selectedAnimal.suffix}`}
                                </h3>
                                <span className="animal-modal-id">{selectedAnimal.id_public}</span>
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="modal-tabs">
                            <div className="modal-tabs-row">
                                <button 
                                    className={`tab ${viewActiveTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('overview')}
                                >
                                    📋 Overview
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'status' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('status')}
                                >
                                    🔒 Status
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'physical' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('physical')}
                                >
                                    🎨 Physical
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'identification' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('identification')}
                                >
                                    🏷️ Identification
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'lineage' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('lineage')}
                                >
                                    🌳 Lineage
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'breeding' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('breeding')}
                                >
                                    🫘 Breeding
                                </button>
                            </div>
                            <div className="modal-tabs-row">
                                <button 
                                    className={`tab ${viewActiveTab === 'health' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('health')}
                                >
                                    🏥 Health
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'husbandry' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('husbandry')}
                                >
                                    🏠 Husbandry
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'behavior' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('behavior')}
                                >
                                    🧠 Behavior
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'records' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('records')}
                                >
                                    📝 Records
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'endoflife' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('endoflife')}
                                >
                                    ⚖️ End of Life
                                </button>
                                <button 
                                    className={`tab ${viewActiveTab === 'reports' ? 'active' : ''}`}
                                    onClick={() => setViewActiveTab('reports')}
                                >
                                    ⚠️ Reports
                                </button>
                            </div>
                        </div>

                        <div className="animal-modal-body">
                            <div className="tab-content scrollable-content">
                                {/* Overview Tab */}
                                {viewActiveTab === 'overview' && (
                                    <div className="tab-panel">
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

                                        <div className="animal-detail-section">
                                            <h4>Basic Information</h4>
                                            <div className="detail-grid">
                                                <div><strong>Species:</strong> {selectedAnimal.species || '-'}</div>
                                                <div><strong>Breed:</strong> {selectedAnimal.breed || '-'}</div>
                                                <div><strong>Strain:</strong> {selectedAnimal.strain || '-'}</div>
                                                <div><strong>Gender:</strong> {selectedAnimal.gender || '-'}</div>
                                                <div><strong>Status:</strong> {selectedAnimal.status || '-'}</div>
                                                <div><strong>Life Stage:</strong> {selectedAnimal.lifeStage || '-'}</div>
                                                <div><strong>Birth Date:</strong> {selectedAnimal.birthDate ? formatDate(selectedAnimal.birthDate) : '-'}</div>
                                                <div><strong>Deceased Date:</strong> {selectedAnimal.deceasedDate ? formatDate(selectedAnimal.deceasedDate) : '-'}</div>
                                                <div><strong>Created:</strong> {formatDate(selectedAnimal.createdAt)}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Variety</h4>
                                            <div className="detail-grid">
                                                <div><strong>Variety:</strong> {[selectedAnimal.color, selectedAnimal.coatPattern, selectedAnimal.coat, selectedAnimal.earset].filter(Boolean).join(' ') || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Genetic Code</h4>
                                            <p style={{fontFamily: 'monospace', wordBreak: 'break-all'}}>{selectedAnimal.geneticCode || '-'}</p>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Availability</h4>
                                            <div className="detail-grid">
                                                <div><strong>For Sale:</strong> {selectedAnimal.isForSale ? 'Yes' : 'No'}</div>
                                                {selectedAnimal.isForSale && (
                                                    <div><strong>Sale Price:</strong> {selectedAnimal.salePriceAmount || 'Negotiable'} {selectedAnimal.currency}</div>
                                                )}
                                                <div><strong>Available for Stud:</strong> {selectedAnimal.availableForBreeding ? 'Yes' : 'No'}</div>
                                                {selectedAnimal.availableForBreeding && (
                                                    <div><strong>Stud Fee:</strong> {selectedAnimal.studFeeAmount || 'Negotiable'} {selectedAnimal.currency}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Breeder</h4>
                                            <div className="detail-grid">
                                                <div><strong>Original Breeder:</strong> {selectedAnimal.originalOwnerId?.personalName || selectedAnimal.originalOwnerId?.email || selectedAnimal.manualBreederName || selectedAnimal.breederId_public || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Identification Numbers</h4>
                                            <div className="detail-grid">
                                                <div><strong>CritterTrack ID:</strong> {selectedAnimal.id_public || '-'}</div>
                                                <div><strong>Identification:</strong> {selectedAnimal.breederyId || '-'}</div>
                                                <div><strong>Microchip:</strong> {selectedAnimal.microchipNumber || '-'}</div>
                                                <div><strong>Pedigree Reg ID:</strong> {selectedAnimal.pedigreeRegistrationId || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Parents</h4>
                                            <div className="detail-grid">
                                                <div><strong>Sire:</strong> {selectedAnimal.fatherId_public || selectedAnimal.sireId_public || '-'}</div>
                                                <div><strong>Dam:</strong> {selectedAnimal.motherId_public || selectedAnimal.damId_public || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Remarks</h4>
                                            <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.remarks || '-'}</p>
                                        </div>

                                        {selectedAnimal.tags && selectedAnimal.tags.length > 0 && (
                                            <div className="animal-detail-section">
                                                <h4>Tags</h4>
                                                <div className="tags-container">
                                                    {selectedAnimal.tags.map((tag, idx) => (
                                                        <span key={idx} className="tag-badge">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Status Tab */}
                                {viewActiveTab === 'status' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Ownership</h4>
                                            <div className="detail-grid">
                                                <div><strong>Currently Owned:</strong> {selectedAnimal.isOwned ? 'Yes' : 'No'}</div>
                                                <div><strong>Breeder:</strong> {selectedAnimal.originalOwnerId?.personalName || selectedAnimal.originalOwnerId?.email || selectedAnimal.manualBreederName || selectedAnimal.breederId_public || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Current Owner</h4>
                                            <div className="detail-grid">
                                                <div><strong>Owner:</strong> {selectedAnimal.ownerId?.personalName || selectedAnimal.ownerId?.email || '-'}</div>
                                                <div><strong>Owner ID:</strong> {selectedAnimal.ownerId?.id_public || '-'}</div>
                                                {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && selectedAnimal.coOwnership && (
                                                    <div><strong>Co-Ownership:</strong> <span style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.coOwnership}</span></div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Availability for Sale or Stud</h4>
                                            <div className="detail-grid">
                                                <div><strong>For Sale:</strong> {selectedAnimal.isForSale ? 'Yes' : 'No'}</div>
                                                {selectedAnimal.isForSale && (
                                                    <div><strong>Sale Price:</strong> {selectedAnimal.salePriceAmount || 'Negotiable'} {selectedAnimal.currency}</div>
                                                )}
                                                <div><strong>For Stud:</strong> {selectedAnimal.availableForBreeding ? 'Yes' : 'No'}</div>
                                                {selectedAnimal.availableForBreeding && (
                                                    <div><strong>Stud Fee:</strong> {selectedAnimal.studFeeAmount || 'Negotiable'} {selectedAnimal.currency}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Physical Tab */}
                                {viewActiveTab === 'physical' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Variety</h4>
                                            <div className="detail-grid">
                                                <div><strong>Variety:</strong> {[selectedAnimal.color, selectedAnimal.coatPattern, selectedAnimal.coat, selectedAnimal.earset].filter(Boolean).join(' ') || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Genetic Code</h4>
                                            <p style={{fontFamily: 'monospace', wordBreak: 'break-all'}}>{selectedAnimal.geneticCode || '-'}</p>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Life Stage</h4>
                                            <div className="detail-grid">
                                                <div>{selectedAnimal.lifeStage || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Measurements</h4>
                                            <div className="detail-grid">
                                                <div><strong>Weight:</strong> {selectedAnimal.bodyWeight || '-'}</div>
                                                <div><strong>Length:</strong> {selectedAnimal.bodyLength || '-'}</div>
                                                <div><strong>Height:</strong> {selectedAnimal.heightAtWithers || '-'}</div>
                                                <div><strong>Body Condition:</strong> {selectedAnimal.bodyConditionScore || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Identification Tab */}
                                {viewActiveTab === 'identification' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Identification Numbers</h4>
                                            <div className="detail-grid">
                                                <div><strong>CritterTrack ID:</strong> {selectedAnimal.id_public || '-'}</div>
                                                <div><strong>Identification:</strong> {selectedAnimal.breederyId || '-'}</div>
                                                <div><strong>Microchip Number:</strong> {selectedAnimal.microchipNumber || '-'}</div>
                                                <div><strong>Pedigree Registration ID:</strong> {selectedAnimal.pedigreeRegistrationId || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Classification</h4>
                                            <div className="detail-grid">
                                                <div><strong>Species:</strong> {selectedAnimal.species || '-'}</div>
                                                <div><strong>Breed:</strong> {selectedAnimal.breed || '-'}</div>
                                                <div><strong>Strain:</strong> {selectedAnimal.strain || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Tags</h4>
                                            <div className="tags-container">
                                                {selectedAnimal.tags?.length > 0 ? (
                                                    selectedAnimal.tags.map((tag, idx) => (
                                                        <span key={idx} className="tag-badge">{tag}</span>
                                                    ))
                                                ) : '-'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lineage Tab */}
                                {viewActiveTab === 'lineage' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Pedigree: Sire and Dam</h4>
                                            <div className="detail-grid">
                                                <div><strong>Sire:</strong> {selectedAnimal.fatherId_public || selectedAnimal.sireId_public || '-'}</div>
                                                <div><strong>Dam:</strong> {selectedAnimal.motherId_public || selectedAnimal.damId_public || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Origin</h4>
                                            <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.origin || '-'}</p>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Ownership History</h4>
                                            <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.transferHistory || '-'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Breeding Tab */}
                                {viewActiveTab === 'breeding' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Reproductive Status</h4>
                                            <div className="detail-grid">
                                                <div><strong>Neutered/Spayed:</strong> {selectedAnimal.isNeutered ? 'Yes' : 'No'}</div>
                                                <div><strong>Infertile:</strong> {selectedAnimal.isInfertile ? 'Yes' : 'No'}</div>
                                                {!selectedAnimal.isNeutered && !selectedAnimal.isInfertile && (
                                                    <div><strong>In Mating:</strong> {selectedAnimal.isInMating ? 'Yes' : 'No'}</div>
                                                )}
                                                {['Female', 'Intersex', 'Unknown'].includes(selectedAnimal.gender) && !selectedAnimal.isNeutered && (
                                                    <>
                                                        <div><strong>Pregnant:</strong> {selectedAnimal.isPregnant ? 'Yes' : 'No'}</div>
                                                        <div><strong>Nursing:</strong> {selectedAnimal.isNursing ? 'Yes' : 'No'}</div>
                                                    </>
                                                )}
                                                {selectedAnimal.gender === 'Male' && !selectedAnimal.isNeutered && !selectedAnimal.isInfertile && (
                                                    <div><strong>Stud Animal:</strong> {selectedAnimal.isStudAnimal ? 'Yes' : 'No'}</div>
                                                )}
                                                {selectedAnimal.gender === 'Female' && !selectedAnimal.isNeutered && !selectedAnimal.isInfertile && (
                                                    <div><strong>Breeding Dam:</strong> {selectedAnimal.isDamAnimal ? 'Yes' : 'No'}</div>
                                                )}
                                            </div>
                                        </div>

                                        {['Female', 'Intersex', 'Unknown'].includes(selectedAnimal.gender) && !selectedAnimal.isNeutered && (
                                            <div className="animal-detail-section">
                                                <h4>Estrus/Cycle</h4>
                                                <div className="detail-grid">
                                                    <div><strong>Heat Status:</strong> {selectedAnimal.heatStatus || '-'}</div>
                                                    <div><strong>Last Heat Date:</strong> {selectedAnimal.lastHeatDate ? formatDate(selectedAnimal.lastHeatDate) : '-'}</div>
                                                    <div><strong>Ovulation Date:</strong> {selectedAnimal.ovulationDate ? formatDate(selectedAnimal.ovulationDate) : '-'}</div>
                                                    {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && (
                                                        <div><strong>Estrus Cycle Length:</strong> {selectedAnimal.estrusCycleLength ? `${selectedAnimal.estrusCycleLength} days` : '-'}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!selectedAnimal.isNeutered && !selectedAnimal.isInfertile && (
                                            <div className="animal-detail-section">
                                                <h4>Mating</h4>
                                                <div className="detail-grid">
                                                    <div><strong>Mating Date:</strong> {selectedAnimal.matingDates ? formatDate(selectedAnimal.matingDates) : '-'}</div>
                                                    <div><strong>Expected Due Date:</strong> {selectedAnimal.expectedDueDate ? formatDate(selectedAnimal.expectedDueDate) : '-'}</div>
                                                    {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && (
                                                        <div><strong>Artificial Insemination:</strong> {selectedAnimal.artificialInseminationUsed ? 'Yes' : 'No'}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!selectedAnimal.isNeutered && !selectedAnimal.isInfertile && ['Male', 'Intersex', 'Unknown'].includes(selectedAnimal.gender) && (
                                            <div className="animal-detail-section">
                                                <h4>Stud Information</h4>
                                                <div className="detail-grid">
                                                    <div><strong>Fertility Status:</strong> {selectedAnimal.fertilityStatus || '-'}</div>
                                                    <div><strong>Successful Matings:</strong> {selectedAnimal.successfulMatings || '-'}</div>
                                                </div>
                                                {selectedAnimal.fertilityNotes && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Notes:</strong> {selectedAnimal.fertilityNotes}</p>
                                                )}
                                                {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && selectedAnimal.reproductiveClearances && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Reproductive Clearances:</strong> {selectedAnimal.reproductiveClearances}</p>
                                                )}
                                                {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && selectedAnimal.reproductiveComplications && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Reproductive Complications:</strong> {selectedAnimal.reproductiveComplications}</p>
                                                )}
                                            </div>
                                        )}

                                        {!selectedAnimal.isNeutered && !selectedAnimal.isInfertile && ['Female', 'Intersex', 'Unknown'].includes(selectedAnimal.gender) && (
                                            <div className="animal-detail-section">
                                                <h4>Dam Information</h4>
                                                <div className="detail-grid">
                                                    <div><strong>Dam Fertility Status:</strong> {selectedAnimal.damFertilityStatus || selectedAnimal.fertilityStatus || '-'}</div>
                                                    {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && (
                                                        <>
                                                            <div><strong>Gestation Length:</strong> {selectedAnimal.gestationLength ? `${selectedAnimal.gestationLength} days` : '-'}</div>
                                                            <div><strong>Delivery Method:</strong> {selectedAnimal.deliveryMethod || '-'}</div>
                                                        </>
                                                    )}
                                                    {selectedAnimal.species?.toLowerCase() === 'dog' && selectedAnimal.whelpingDate && (
                                                        <div><strong>Whelping Date:</strong> {formatDate(selectedAnimal.whelpingDate)}</div>
                                                    )}
                                                    {selectedAnimal.species?.toLowerCase() === 'cat' && selectedAnimal.queeningDate && (
                                                        <div><strong>Queening Date:</strong> {formatDate(selectedAnimal.queeningDate)}</div>
                                                    )}
                                                </div>
                                                {selectedAnimal.damFertilityNotes && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Notes:</strong> {selectedAnimal.damFertilityNotes}</p>
                                                )}
                                                {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && selectedAnimal.reproductiveClearances && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Reproductive Clearances:</strong> {selectedAnimal.reproductiveClearances}</p>
                                                )}
                                                {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && selectedAnimal.reproductiveComplications && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Reproductive Complications:</strong> {selectedAnimal.reproductiveComplications}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="animal-detail-section">
                                            <h4>Breeding History</h4>
                                            <div className="detail-grid">
                                                {['Male', 'Intersex', 'Unknown'].includes(selectedAnimal.gender) && (
                                                    <>
                                                        <div><strong>Last Mating Date:</strong> {selectedAnimal.lastMatingDate ? formatDate(selectedAnimal.lastMatingDate) : '-'}</div>
                                                        <div><strong>Successful Matings:</strong> {selectedAnimal.successfulMatings || '-'}</div>
                                                    </>
                                                )}
                                                {['Female', 'Intersex', 'Unknown'].includes(selectedAnimal.gender) && (
                                                    <>
                                                        <div><strong>Last Pregnancy Date:</strong> {selectedAnimal.lastPregnancyDate ? formatDate(selectedAnimal.lastPregnancyDate) : '-'}</div>
                                                        <div><strong>Litter Count:</strong> {selectedAnimal.litterCount || '-'}</div>
                                                    </>
                                                )}
                                                <div><strong>Total Offspring:</strong> {selectedAnimal.offspringCount || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Health Tab */}
                                {viewActiveTab === 'health' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Preventive Care</h4>
                                            <div className="detail-grid">
                                                <div><strong>Vaccinations:</strong> {selectedAnimal.vaccinations || '-'}</div>
                                                <div><strong>Deworming Records:</strong> {selectedAnimal.dewormingRecords || '-'}</div>
                                                <div><strong>Parasite Control:</strong> {selectedAnimal.parasiteControl || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Procedures & Diagnostics</h4>
                                            <div className="detail-grid">
                                                <div>
                                                    <strong>Medical Procedures:</strong>
                                                    {(() => {
                                                        try {
                                                            const procedures = JSON.parse(selectedAnimal.medicalProcedures);
                                                            if (Array.isArray(procedures) && procedures.length > 0) {
                                                                return (
                                                                    <ul>
                                                                        {procedures.map((proc, idx) => (
                                                                            <li key={idx}>{proc.name} - {formatDate(proc.date)} - {proc.notes}</li>
                                                                        ))}
                                                                    </ul>
                                                                );
                                                            }
                                                            return ' -';
                                                        } catch {
                                                            return ' -';
                                                        }
                                                    })()}
                                                </div>
                                                <div><strong>Laboratory Results:</strong> {selectedAnimal.laboratoryResults || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Active Medical Records</h4>
                                            <div className="detail-grid">
                                                <div><strong>Medical Conditions:</strong> <span style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.medicalConditions || '-'}</span></div>
                                                <div><strong>Allergies:</strong> {selectedAnimal.allergies || '-'}</div>
                                                <div><strong>Current Medications:</strong> {selectedAnimal.medications || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Veterinary Care</h4>
                                            <div className="detail-grid">
                                                <div><strong>Primary Veterinarian:</strong> {selectedAnimal.primaryVet || '-'}</div>
                                                <div>
                                                    <strong>Veterinary Visits:</strong>
                                                    {(() => {
                                                        try {
                                                            const visits = JSON.parse(selectedAnimal.vetVisits);
                                                            if (Array.isArray(visits) && visits.length > 0) {
                                                                return (
                                                                    <ul>
                                                                        {visits.map((visit, idx) => (
                                                                            <li key={idx}>{visit.reason} - {formatDate(visit.date)} - {visit.notes}</li>
                                                                        ))}
                                                                    </ul>
                                                                );
                                                            }
                                                            return ' -';
                                                        } catch {
                                                            return ' -';
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Husbandry Tab */}
                                {viewActiveTab === 'husbandry' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Nutrition</h4>
                                            <div className="detail-grid">
                                                <div><strong>Diet Type:</strong> {selectedAnimal.dietType || '-'}</div>
                                                <div><strong>Feeding Schedule:</strong> {selectedAnimal.feedingSchedule || '-'}</div>
                                                <div><strong>Supplements:</strong> {selectedAnimal.supplements || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Husbandry</h4>
                                            <div className="detail-grid">
                                                <div><strong>Housing Type:</strong> {selectedAnimal.housingType || '-'}</div>
                                                <div><strong>Bedding:</strong> {selectedAnimal.bedding || '-'}</div>
                                                <div><strong>Enrichment:</strong> {selectedAnimal.enrichment || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Environment</h4>
                                            <div className="detail-grid">
                                                <div><strong>Temperature Range:</strong> {selectedAnimal.temperatureRange || '-'}</div>
                                                <div><strong>Humidity:</strong> {selectedAnimal.humidity || '-'}</div>
                                                <div><strong>Lighting:</strong> {selectedAnimal.lighting || '-'}</div>
                                                <div><strong>Noise Level:</strong> {selectedAnimal.noise || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Behavior Tab */}
                                {viewActiveTab === 'behavior' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Behavior</h4>
                                            <div className="detail-grid">
                                                <div><strong>Temperament:</strong> {selectedAnimal.temperament || '-'}</div>
                                                <div><strong>Handling Tolerance:</strong> {selectedAnimal.handlingTolerance || '-'}</div>
                                                <div><strong>Social Structure:</strong> {selectedAnimal.socialStructure || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Activity</h4>
                                            <div className="detail-grid">
                                                <div><strong>Activity Cycle:</strong> {selectedAnimal.activityCycle || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Records Tab */}
                                {viewActiveTab === 'records' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Remarks & Notes</h4>
                                            <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.remarks || '-'}</p>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Show Titles & Ratings</h4>
                                            <div className="detail-grid">
                                                <div><strong>Show Titles:</strong> {selectedAnimal.showTitles || '-'}</div>
                                                <div><strong>Show Ratings:</strong> {selectedAnimal.showRatings || '-'}</div>
                                                <div><strong>Judge Comments:</strong> <span style={{whiteSpace: 'pre-wrap'}}>{selectedAnimal.judgeComments || '-'}</span></div>
                                            </div>
                                        </div>

                                        {selectedAnimal.species?.toLowerCase() === 'dog' && (
                                            <div className="animal-detail-section">
                                                <h4>Working & Performance</h4>
                                                <div className="detail-grid">
                                                    <div><strong>Working Titles:</strong> {selectedAnimal.workingTitles || '-'}</div>
                                                    <div><strong>Performance Scores:</strong> {selectedAnimal.performanceScores || '-'}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* End of Life Tab */}
                                {viewActiveTab === 'endoflife' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Information</h4>
                                            <div className="detail-grid">
                                                <div><strong>Deceased Date:</strong> {selectedAnimal.deceasedDate ? formatDate(selectedAnimal.deceasedDate) : '-'}</div>
                                                <div><strong>Cause of Death:</strong> {selectedAnimal.causeOfDeath || '-'}</div>
                                                <div><strong>Necropsy Results:</strong> {selectedAnimal.necropsyResults || '-'}</div>
                                            </div>
                                            {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && selectedAnimal.endOfLifeCareNotes && (
                                                <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>End of Life Care Notes:</strong> {selectedAnimal.endOfLifeCareNotes}</p>
                                            )}
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Legal/Administrative</h4>
                                            <div className="detail-grid">
                                                <div><strong>Insurance:</strong> {selectedAnimal.insurance || '-'}</div>
                                                <div><strong>Legal Status:</strong> {selectedAnimal.legalStatus || '-'}</div>
                                            </div>
                                        </div>

                                        {['dog', 'cat'].includes(selectedAnimal.species?.toLowerCase()) && (selectedAnimal.breedingRestrictions || selectedAnimal.exportRestrictions) && (
                                            <div className="animal-detail-section">
                                                <h4>Restrictions</h4>
                                                {selectedAnimal.breedingRestrictions && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Breeding Restrictions:</strong> {selectedAnimal.breedingRestrictions}</p>
                                                )}
                                                {selectedAnimal.exportRestrictions && (
                                                    <p className="remarks-text" style={{whiteSpace: 'pre-wrap'}}><strong>Export Restrictions:</strong> {selectedAnimal.exportRestrictions}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reports Tab */}
                                {viewActiveTab === 'reports' && (
                                    <div className="tab-panel">
                                        {selectedAnimal.reports && selectedAnimal.reports.length > 0 ? (
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
                                        ) : (
                                            <div className="animal-detail-section">
                                                <p className="no-data">No reports for this animal.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="animal-modal-footer">
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
            )}

            {/* Edit Modal */}
            {showEditModal && selectedAnimal && (
                <div className="animal-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="animal-modal large-modal edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header">
                            <div className="modal-title-section">
                                <h3>Edit Animal: {selectedAnimal.id_public}</h3>
                            </div>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="modal-tabs">
                            <div className="modal-tabs-row">
                                <button 
                                    className={`tab ${editActiveTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('overview')}
                                >
                                    📋 Overview
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'status' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('status')}
                                >
                                    🔒 Status
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'physical' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('physical')}
                                >
                                    🎨 Physical
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'identification' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('identification')}
                                >
                                    🏷️ Identification
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'lineage' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('lineage')}
                                >
                                    🌳 Lineage
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'breeding' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('breeding')}
                                >
                                    🫘 Breeding
                                </button>
                            </div>
                            <div className="modal-tabs-row">
                                <button 
                                    className={`tab ${editActiveTab === 'health' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('health')}
                                >
                                    🏥 Health
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'husbandry' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('husbandry')}
                                >
                                    🏠 Husbandry
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'behavior' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('behavior')}
                                >
                                    🧠 Behavior
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'records' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('records')}
                                >
                                    📝 Records
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'endoflife' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('endoflife')}
                                >
                                    ⚖️ End of Life
                                </button>
                                <button 
                                    className={`tab ${editActiveTab === 'show' ? 'active' : ''}`}
                                    onClick={() => setEditActiveTab('show')}
                                >
                                    🏆 Show
                                </button>
                            </div>
                        </div>

                        <div className="animal-modal-body">
                            <div className="tab-content scrollable-content">

                            {/* Tab 1: Overview */}
                            {editActiveTab === 'overview' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Identity</h4>
                                            <div className="form-row">
                                                <label>Prefix</label>
                                                <input type="text" value={editForm.prefix || ''} onChange={(e) => setEditForm({...editForm, prefix: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Name *</label>
                                                <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                                            </div>
                                            <div className="form-row">
                                                <label>Suffix</label>
                                                <input type="text" value={editForm.suffix || ''} onChange={(e) => setEditForm({...editForm, suffix: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Species</label>
                                                <input type="text" value={editForm.species || ''} onChange={(e) => setEditForm({...editForm, species: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Breed</label>
                                                <input type="text" value={editForm.breed || ''} onChange={(e) => setEditForm({...editForm, breed: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Strain</label>
                                                <input type="text" value={editForm.strain || ''} onChange={(e) => setEditForm({...editForm, strain: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Gender</label>
                                                <select value={editForm.gender || ''} onChange={(e) => setEditForm({...editForm, gender: e.target.value})}>
                                                    <option value="">Select...</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Intersex">Intersex</option>
                                                    <option value="Unknown">Unknown</option>
                                                </select>
                                            </div>
                                            <div className="form-row">
                                                <label>Life Stage</label>
                                                <select value={editForm.lifeStage || ''} onChange={(e) => setEditForm({...editForm, lifeStage: e.target.value})}>
                                                    <option value="">Select...</option>
                                                    <option value="Newborn">Newborn</option>
                                                    <option value="Juvenile">Juvenile</option>
                                                    <option value="Adult">Adult</option>
                                                    <option value="Senior">Senior</option>
                                                    <option value="Unknown">Unknown</option>
                                                </select>
                                            </div>
                                            <div className="form-row">
                                                <label>Status</label>
                                                <select value={editForm.status || ''} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                                                    <option value="">Select...</option>
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
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Important Dates</h4>
                                            <div className="form-row">
                                                <label>Birth Date</label>
                                                <input type="date" value={editForm.birthDate || ''} onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Deceased Date</label>
                                                <input type="date" value={editForm.deceasedDate || ''} onChange={(e) => setEditForm({...editForm, deceasedDate: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Remarks</h4>
                                            <div className="form-row full-width">
                                                <label>Remarks</label>
                                                <textarea rows={4} value={editForm.remarks || ''} onChange={(e) => setEditForm({...editForm, remarks: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Status */}
                            {editActiveTab === 'status' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Ownership</h4>
                                            <div className="form-row">
                                                <label className="checkbox-label">
                                                    <input type="checkbox" checked={editForm.isOwned || false} onChange={(e) => setEditForm({...editForm, isOwned: e.target.checked})} />
                                                    Currently Owned
                                                </label>
                                            </div>
                                            <div className="form-row">
                                                <label>Owner Name</label>
                                                <input type="text" value={editForm.currentOwner || ''} onChange={(e) => setEditForm({...editForm, currentOwner: e.target.value})} placeholder="Name of current owner" />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Owner Transfer</h4>
                                            <div className="form-row full-width">
                                                <label>Current Owner</label>
                                                <div className="owner-selector">
                                                    <span className="selected-owner">{getOwnerDisplay()}</span>
                                                    <div className="owner-actions">
                                                        <button type="button" className="btn-small" onClick={() => setShowOwnerSearch(!showOwnerSearch)}>
                                                            {showOwnerSearch ? 'Cancel' : 'Change'}
                                                        </button>
                                                        {editForm.ownerId_public && (
                                                            <button type="button" className="btn-small btn-danger" onClick={clearOwner}>Clear</button>
                                                        )}
                                                    </div>
                                                </div>
                                                {showOwnerSearch && (
                                                    <div className="user-search">
                                                        <input
                                                            type="text"
                                                            placeholder="Search users by name, email, or ID..."
                                                            value={ownerSearchQuery}
                                                            onChange={(e) => { setOwnerSearchQuery(e.target.value); searchUsers(e.target.value, 'owner'); }}
                                                        />
                                                        {ownerSearchResults.length > 0 && (
                                                            <div className="search-results">
                                                                {ownerSearchResults.map(user => (
                                                                    <div key={user._id} className="search-result-item" onClick={() => selectOwner(user)}>
                                                                        <span>{user.personalName || user.username || user.email}</span>
                                                                        <span className="user-id">{user.id_public}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Breeder</h4>
                                            <div className="form-row full-width">
                                                <label>Current Breeder</label>
                                                <div className="owner-selector">
                                                    <span className="selected-owner">{getBreederDisplay()}</span>
                                                    <div className="owner-actions">
                                                        <button type="button" className="btn-small" onClick={() => setShowBreederSearch(!showBreederSearch)}>
                                                            {showBreederSearch ? 'Cancel' : 'Change'}
                                                        </button>
                                                        {editForm.breederId_public && (
                                                            <button type="button" className="btn-small btn-danger" onClick={clearBreeder}>Clear</button>
                                                        )}
                                                    </div>
                                                </div>
                                                {showBreederSearch && (
                                                    <div className="user-search">
                                                        <input
                                                            type="text"
                                                            placeholder="Search users by name, email, or ID..."
                                                            value={breederSearchQuery}
                                                            onChange={(e) => { setBreederSearchQuery(e.target.value); searchUsers(e.target.value, 'breeder'); }}
                                                        />
                                                        {breederSearchResults.length > 0 && (
                                                            <div className="search-results">
                                                                {breederSearchResults.map(user => (
                                                                    <div key={user._id} className="search-result-item" onClick={() => selectBreeder(user)}>
                                                                        <span>{user.personalName || user.username || user.email}</span>
                                                                        <span className="user-id">{user.id_public}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="form-row">
                                                <label>Manual Breeder Name</label>
                                                <input type="text" value={editForm.manualBreederName || ''} onChange={(e) => setEditForm({...editForm, manualBreederName: e.target.value})} placeholder="Enter breeder name (if not a registered user)" />
                                            </div>
                                        </div>

                                        {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                            <div className="form-section">
                                                <h4 className="section-title">Co-Ownership</h4>
                                                <div className="form-row full-width">
                                                    <label>Co-Ownership</label>
                                                    <textarea rows={2} value={editForm.coOwnership || ''} onChange={(e) => setEditForm({...editForm, coOwnership: e.target.value})} placeholder="Co-owner name, terms, breeding rights" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-section">
                                            <h4 className="section-title">Availability for Sale or Stud</h4>
                                            <div className="form-row">
                                                <label className="checkbox-label">
                                                    <input type="checkbox" checked={editForm.isForSale || false} onChange={(e) => setEditForm({...editForm, isForSale: e.target.checked})} />
                                                    For Sale
                                                </label>
                                            </div>
                                            {editForm.isForSale && (
                                                <>
                                                    <div className="form-row">
                                                        <label>Sale Price Currency</label>
                                                        <select value={editForm.salePriceCurrency || ''} onChange={(e) => setEditForm({...editForm, salePriceCurrency: e.target.value})}>
                                                            <option value="">Select...</option>
                                                            <option value="USD">USD</option>
                                                            <option value="EUR">EUR</option>
                                                            <option value="GBP">GBP</option>
                                                            <option value="CAD">CAD</option>
                                                            <option value="AUD">AUD</option>
                                                            <option value="JPY">JPY</option>
                                                            <option value="Negotiable">Negotiable</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-row">
                                                        <label>Sale Price Amount</label>
                                                        <input type="number" min="0" step="0.01" value={editForm.salePriceAmount || ''} onChange={(e) => setEditForm({...editForm, salePriceAmount: e.target.value})} disabled={editForm.salePriceCurrency === 'Negotiable'} />
                                                    </div>
                                                </>
                                            )}
                                            <div className="form-row">
                                                <label className="checkbox-label">
                                                    <input type="checkbox" checked={editForm.availableForBreeding || false} onChange={(e) => setEditForm({...editForm, availableForBreeding: e.target.checked})} />
                                                    Available for Stud
                                                </label>
                                            </div>
                                            {editForm.availableForBreeding && (
                                                <>
                                                    <div className="form-row">
                                                        <label>Stud Fee Currency</label>
                                                        <select value={editForm.studFeeCurrency || ''} onChange={(e) => setEditForm({...editForm, studFeeCurrency: e.target.value})}>
                                                            <option value="">Select...</option>
                                                            <option value="USD">USD</option>
                                                            <option value="EUR">EUR</option>
                                                            <option value="GBP">GBP</option>
                                                            <option value="CAD">CAD</option>
                                                            <option value="AUD">AUD</option>
                                                            <option value="JPY">JPY</option>
                                                            <option value="Negotiable">Negotiable</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-row">
                                                        <label>Stud Fee Amount</label>
                                                        <input type="number" min="0" step="0.01" value={editForm.studFeeAmount || ''} onChange={(e) => setEditForm({...editForm, studFeeAmount: e.target.value})} disabled={editForm.studFeeCurrency === 'Negotiable'} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Physical */}
                            {editActiveTab === 'physical' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Appearance</h4>
                                            <div className="form-row">
                                                <label>Color</label>
                                                <input type="text" value={editForm.color || ''} onChange={(e) => setEditForm({...editForm, color: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Pattern</label>
                                                <input type="text" value={editForm.coatPattern || ''} onChange={(e) => setEditForm({...editForm, coatPattern: e.target.value})} placeholder="e.g., Solid, Hooded, Brindle" />
                                            </div>
                                            <div className="form-row">
                                                <label>Coat Type</label>
                                                <input type="text" value={editForm.coat || ''} onChange={(e) => setEditForm({...editForm, coat: e.target.value})} placeholder="e.g., Short, Long, Rex" />
                                            </div>
                                            <div className="form-row">
                                                <label>Earset</label>
                                                <input type="text" value={editForm.earset || ''} onChange={(e) => setEditForm({...editForm, earset: e.target.value})} placeholder="e.g., Standard, Dumbo" />
                                            </div>
                                            <div className="form-row">
                                                <label>Eye Color</label>
                                                <input type="text" value={editForm.eyeColor || ''} onChange={(e) => setEditForm({...editForm, eyeColor: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Genetic Code</h4>
                                            <div className="form-row full-width">
                                                <label>Genetic Code</label>
                                                <textarea rows={2} value={editForm.geneticCode || ''} onChange={(e) => setEditForm({...editForm, geneticCode: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Life Stage</h4>
                                            <div className="form-row">
                                                <label>Life Stage</label>
                                                <select value={editForm.lifeStage || ''} onChange={(e) => setEditForm({...editForm, lifeStage: e.target.value})}>
                                                    <option value="">Select...</option>
                                                    <option value="Newborn">Newborn</option>
                                                    <option value="Juvenile">Juvenile</option>
                                                    <option value="Adult">Adult</option>
                                                    <option value="Senior">Senior</option>
                                                    <option value="Unknown">Unknown</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Measurements</h4>
                                            <div className="form-row">
                                                <label>Body Weight</label>
                                                <input type="text" value={editForm.bodyWeight || ''} onChange={(e) => setEditForm({...editForm, bodyWeight: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Body Length</label>
                                                <input type="text" value={editForm.bodyLength || ''} onChange={(e) => setEditForm({...editForm, bodyLength: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Height at Withers</label>
                                                <input type="text" value={editForm.heightAtWithers || ''} onChange={(e) => setEditForm({...editForm, heightAtWithers: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Body Condition Score</label>
                                                <input type="text" value={editForm.bodyConditionScore || ''} onChange={(e) => setEditForm({...editForm, bodyConditionScore: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Markings & Description</h4>
                                            <div className="form-row">
                                                <label>Markings</label>
                                                <input type="text" value={editForm.markings || ''} onChange={(e) => setEditForm({...editForm, markings: e.target.value})} placeholder="Notable markings" />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Markings Description</label>
                                                <textarea rows={3} value={editForm.markingsDescription || ''} onChange={(e) => setEditForm({...editForm, markingsDescription: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Physical Description</label>
                                                <textarea rows={4} value={editForm.physicalDescription || ''} onChange={(e) => setEditForm({...editForm, physicalDescription: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Identification */}
                            {editActiveTab === 'identification' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Identification Numbers</h4>
                                            <div className="form-row">
                                                <label>Registry/Breeder ID</label>
                                                <input type="text" value={editForm.breederyId || ''} onChange={(e) => setEditForm({...editForm, breederyId: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Microchip Number</label>
                                                <input type="text" value={editForm.microchipNumber || ''} onChange={(e) => setEditForm({...editForm, microchipNumber: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Pedigree Registration ID</label>
                                                <input type="text" value={editForm.pedigreeRegistrationId || ''} onChange={(e) => setEditForm({...editForm, pedigreeRegistrationId: e.target.value})} />
                                            </div>
                                        </div>

                                        {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                            <div className="form-section">
                                                <h4 className="section-title">Dog/Cat Specific IDs</h4>
                                                <div className="form-row">
                                                    <label>License Number</label>
                                                    <input type="text" value={editForm.licenseNumber || ''} onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})} placeholder="City/County license #" />
                                                </div>
                                                <div className="form-row">
                                                    <label>License Jurisdiction</label>
                                                    <input type="text" value={editForm.licenseJurisdiction || ''} onChange={(e) => setEditForm({...editForm, licenseJurisdiction: e.target.value})} placeholder="e.g., Los Angeles County" />
                                                </div>
                                                <div className="form-row">
                                                    <label>Rabies Tag Number</label>
                                                    <input type="text" value={editForm.rabiesTagNumber || ''} onChange={(e) => setEditForm({...editForm, rabiesTagNumber: e.target.value})} />
                                                </div>
                                                <div className="form-row">
                                                    <label>Tattoo ID</label>
                                                    <input type="text" value={editForm.tattooId || ''} onChange={(e) => setEditForm({...editForm, tattooId: e.target.value})} />
                                                </div>
                                                {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'dog' && (
                                                    <>
                                                        <div className="form-row">
                                                            <label>AKC Registration #</label>
                                                            <input type="text" value={editForm.akcRegistrationNumber || ''} onChange={(e) => setEditForm({...editForm, akcRegistrationNumber: e.target.value})} />
                                                        </div>
                                                        <div className="form-row">
                                                            <label>FCI Registration #</label>
                                                            <input type="text" value={editForm.fciRegistrationNumber || ''} onChange={(e) => setEditForm({...editForm, fciRegistrationNumber: e.target.value})} />
                                                        </div>
                                                    </>
                                                )}
                                                {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'cat' && (
                                                    <div className="form-row">
                                                        <label>CFA Registration #</label>
                                                        <input type="text" value={editForm.cfaRegistrationNumber || ''} onChange={(e) => setEditForm({...editForm, cfaRegistrationNumber: e.target.value})} />
                                                    </div>
                                                )}
                                                <div className="form-row">
                                                    <label>Working Registry IDs</label>
                                                    <input type="text" value={editForm.workingRegistryIds || ''} onChange={(e) => setEditForm({...editForm, workingRegistryIds: e.target.value})} placeholder="Herding, Hunting, Service registrations" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-section">
                                            <h4 className="section-title">Classification</h4>
                                            <div className="form-row">
                                                <label>Species</label>
                                                <input type="text" value={editForm.species || ''} disabled />
                                            </div>
                                            <div className="form-row">
                                                <label>Breed</label>
                                                <input type="text" value={editForm.breed || ''} onChange={(e) => setEditForm({...editForm, breed: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Strain</label>
                                                <input type="text" value={editForm.strain || ''} onChange={(e) => setEditForm({...editForm, strain: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Tags</h4>
                                            <div className="form-row full-width">
                                                <label>Tags</label>
                                                <div className="tags-container">
                                                    {editForm.tags?.map((tag, idx) => (
                                                        <span key={idx} className="tag-badge">
                                                            {tag}
                                                            <button type="button" onClick={() => setEditForm({...editForm, tags: editForm.tags.filter((_, i) => i !== idx)})}>×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Type a tag and press Enter..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.target.value.trim();
                                                            if (val) {
                                                                setEditForm({...editForm, tags: [...(editForm.tags || []), val]});
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 5: Lineage */}
                            {editActiveTab === 'lineage' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Pedigree: Sire and Dam</h4>
                                            <div className="form-row">
                                                <label>Sire (Father) ID</label>
                                                <input type="text" value={editForm.sireId_public || editForm.fatherId_public || ''} onChange={(e) => setEditForm({...editForm, sireId_public: e.target.value, fatherId_public: e.target.value})} placeholder="Father's public ID" />
                                            </div>
                                            <div className="form-row">
                                                <label>Dam (Mother) ID</label>
                                                <input type="text" value={editForm.damId_public || editForm.motherId_public || ''} onChange={(e) => setEditForm({...editForm, damId_public: e.target.value, motherId_public: e.target.value})} placeholder="Mother's public ID" />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Origin</h4>
                                            <div className="form-row">
                                                <label>Origin</label>
                                                <select value={editForm.origin || ''} onChange={(e) => setEditForm({...editForm, origin: e.target.value})}>
                                                    <option value="">Select...</option>
                                                    <option value="Captive-bred">Captive-bred</option>
                                                    <option value="Wild-caught">Wild-caught</option>
                                                    <option value="Rescue">Rescue</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Ownership History</h4>
                                            <div className="form-row full-width">
                                                <label>Transfer History</label>
                                                <textarea rows={3} value={editForm.transferHistory || ''} onChange={(e) => setEditForm({...editForm, transferHistory: e.target.value})} placeholder="History of ownership transfers..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 6: Breeding */}
                            {editActiveTab === 'breeding' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Reproductive Status</h4>
                                            <div className="form-row">
                                                <label className="checkbox-label">
                                                    <input type="checkbox" checked={editForm.isNeutered || false} onChange={(e) => setEditForm({...editForm, isNeutered: e.target.checked})} />
                                                    Neutered/Spayed
                                                </label>
                                            </div>
                                            <div className="form-row">
                                                <label className="checkbox-label">
                                                    <input type="checkbox" checked={editForm.isInfertile || false} onChange={(e) => setEditForm({...editForm, isInfertile: e.target.checked})} />
                                                    Infertile
                                                </label>
                                            </div>
                                            {!editForm.isNeutered && !editForm.isInfertile && (
                                                <div className="form-row">
                                                    <label className="checkbox-label">
                                                        <input type="checkbox" checked={editForm.isInMating || false} onChange={(e) => setEditForm({...editForm, isInMating: e.target.checked})} />
                                                        In Mating
                                                    </label>
                                                </div>
                                            )}
                                            {['Female', 'Intersex', 'Unknown'].includes(editForm.gender) && !editForm.isNeutered && !editForm.isInfertile && (
                                                <div className="form-row">
                                                    <label className="checkbox-label">
                                                        <input type="checkbox" checked={editForm.isPregnant || false} onChange={(e) => setEditForm({...editForm, isPregnant: e.target.checked})} />
                                                        Pregnant
                                                    </label>
                                                </div>
                                            )}
                                            {['Female', 'Intersex', 'Unknown'].includes(editForm.gender) && (
                                                <div className="form-row">
                                                    <label className="checkbox-label">
                                                        <input type="checkbox" checked={editForm.isNursing || false} onChange={(e) => setEditForm({...editForm, isNursing: e.target.checked})} />
                                                        Nursing
                                                    </label>
                                                </div>
                                            )}
                                            {editForm.gender === 'Male' && !editForm.isNeutered && !editForm.isInfertile && (
                                                <div className="form-row">
                                                    <label className="checkbox-label">
                                                        <input type="checkbox" checked={editForm.isStudAnimal || false} onChange={(e) => setEditForm({...editForm, isStudAnimal: e.target.checked})} />
                                                        Stud Animal
                                                    </label>
                                                </div>
                                            )}
                                            {editForm.gender === 'Female' && !editForm.isNeutered && !editForm.isInfertile && (
                                                <div className="form-row">
                                                    <label className="checkbox-label">
                                                        <input type="checkbox" checked={editForm.isDamAnimal || false} onChange={(e) => setEditForm({...editForm, isDamAnimal: e.target.checked})} />
                                                        Breeding Dam
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        {['Female', 'Intersex', 'Unknown'].includes(editForm.gender) && !editForm.isNeutered && (
                                            <div className="form-section">
                                                <h4 className="section-title">Estrus/Cycle</h4>
                                                <div className="form-row">
                                                    <label>Heat Status</label>
                                                    <select value={editForm.heatStatus || ''} onChange={(e) => setEditForm({...editForm, heatStatus: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="Pre-estrus">Pre-estrus</option>
                                                        <option value="Estrus">Estrus</option>
                                                        <option value="Post-estrus">Post-estrus</option>
                                                        <option value="Anestrus">Anestrus</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label>Last Heat Date</label>
                                                    <input type="date" value={editForm.lastHeatDate || ''} onChange={(e) => setEditForm({...editForm, lastHeatDate: e.target.value})} />
                                                </div>
                                                <div className="form-row">
                                                    <label>Ovulation Date</label>
                                                    <input type="date" value={editForm.ovulationDate || ''} onChange={(e) => setEditForm({...editForm, ovulationDate: e.target.value})} />
                                                </div>
                                                {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                                    <div className="form-row">
                                                        <label>Estrus Cycle Length (days)</label>
                                                        <input type="number" value={editForm.estrusCycleLength || ''} onChange={(e) => setEditForm({...editForm, estrusCycleLength: e.target.value})} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!editForm.isNeutered && !editForm.isInfertile && (
                                            <div className="form-section">
                                                <h4 className="section-title">Mating</h4>
                                                <div className="form-row">
                                                    <label>Mating Date</label>
                                                    <input type="date" value={editForm.matingDates || ''} onChange={(e) => setEditForm({...editForm, matingDates: e.target.value})} />
                                                </div>
                                                <div className="form-row">
                                                    <label>Expected Due Date</label>
                                                    <input type="date" value={editForm.expectedDueDate || ''} onChange={(e) => setEditForm({...editForm, expectedDueDate: e.target.value})} />
                                                </div>
                                                {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                                    <div className="form-row">
                                                        <label className="checkbox-label">
                                                            <input type="checkbox" checked={editForm.artificialInseminationUsed || false} onChange={(e) => setEditForm({...editForm, artificialInseminationUsed: e.target.checked})} />
                                                            Artificial Insemination
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {['Male', 'Intersex', 'Unknown'].includes(editForm.gender) && !editForm.isNeutered && !editForm.isInfertile && (
                                            <div className="form-section">
                                                <h4 className="section-title">Stud Information</h4>
                                                <div className="form-row">
                                                    <label>Sire Fertility Status</label>
                                                    <select value={editForm.fertilityStatus || ''} onChange={(e) => setEditForm({...editForm, fertilityStatus: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="Unknown">Unknown</option>
                                                        <option value="Fertile">Fertile</option>
                                                        <option value="Subfertile">Subfertile</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label>Successful Matings</label>
                                                    <input type="number" min="0" value={editForm.successfulMatings || ''} onChange={(e) => setEditForm({...editForm, successfulMatings: e.target.value})} />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Fertility Notes</label>
                                                    <textarea rows={3} value={editForm.fertilityNotes || ''} onChange={(e) => setEditForm({...editForm, fertilityNotes: e.target.value})} />
                                                </div>
                                                {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                                    <>
                                                        <div className="form-row full-width">
                                                            <label>Reproductive Clearances</label>
                                                            <textarea rows={2} value={editForm.reproductiveClearances || ''} onChange={(e) => setEditForm({...editForm, reproductiveClearances: e.target.value})} />
                                                        </div>
                                                        <div className="form-row full-width">
                                                            <label>Reproductive Complications</label>
                                                            <textarea rows={2} value={editForm.reproductiveComplications || ''} onChange={(e) => setEditForm({...editForm, reproductiveComplications: e.target.value})} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {['Female', 'Intersex', 'Unknown'].includes(editForm.gender) && !editForm.isNeutered && !editForm.isInfertile && (
                                            <div className="form-section">
                                                <h4 className="section-title">Dam Information</h4>
                                                <div className="form-row">
                                                    <label>Dam Fertility Status</label>
                                                    <select value={editForm.damFertilityStatus || ''} onChange={(e) => setEditForm({...editForm, damFertilityStatus: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="Unknown">Unknown</option>
                                                        <option value="Fertile">Fertile</option>
                                                        <option value="Subfertile">Subfertile</option>
                                                    </select>
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Dam Fertility Notes</label>
                                                    <textarea rows={3} value={editForm.damFertilityNotes || ''} onChange={(e) => setEditForm({...editForm, damFertilityNotes: e.target.value})} />
                                                </div>
                                                {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                                    <>
                                                        <div className="form-row">
                                                            <label>Gestation Length (days)</label>
                                                            <input type="number" value={editForm.gestationLength || ''} onChange={(e) => setEditForm({...editForm, gestationLength: e.target.value})} />
                                                        </div>
                                                        <div className="form-row">
                                                            <label>Delivery Method</label>
                                                            <select value={editForm.deliveryMethod || ''} onChange={(e) => setEditForm({...editForm, deliveryMethod: e.target.value})}>
                                                                <option value="">Select...</option>
                                                                <option value="Natural">Natural</option>
                                                                <option value="C-Section">C-Section</option>
                                                                <option value="Assisted">Assisted</option>
                                                            </select>
                                                        </div>
                                                        {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'dog' && (
                                                            <div className="form-row">
                                                                <label>Whelping Date</label>
                                                                <input type="date" value={editForm.whelpingDate || ''} onChange={(e) => setEditForm({...editForm, whelpingDate: e.target.value})} />
                                                            </div>
                                                        )}
                                                        {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'cat' && (
                                                            <div className="form-row">
                                                                <label>Queening Date</label>
                                                                <input type="date" value={editForm.queeningDate || ''} onChange={(e) => setEditForm({...editForm, queeningDate: e.target.value})} />
                                                            </div>
                                                        )}
                                                        <div className="form-row full-width">
                                                            <label>Reproductive Clearances</label>
                                                            <textarea rows={2} value={editForm.reproductiveClearances || ''} onChange={(e) => setEditForm({...editForm, reproductiveClearances: e.target.value})} />
                                                        </div>
                                                        <div className="form-row full-width">
                                                            <label>Reproductive Complications</label>
                                                            <textarea rows={2} value={editForm.reproductiveComplications || ''} onChange={(e) => setEditForm({...editForm, reproductiveComplications: e.target.value})} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <div className="form-section">
                                            <h4 className="section-title">Breeding History</h4>
                                            {['Male', 'Intersex', 'Unknown'].includes(editForm.gender) && (
                                                <>
                                                    <div className="form-row">
                                                        <label>Last Mating Date</label>
                                                        <input type="date" value={editForm.lastMatingDate || ''} onChange={(e) => setEditForm({...editForm, lastMatingDate: e.target.value})} />
                                                    </div>
                                                    <div className="form-row">
                                                        <label>Successful Matings</label>
                                                        <input type="number" min="0" value={editForm.successfulMatings || ''} onChange={(e) => setEditForm({...editForm, successfulMatings: e.target.value})} />
                                                    </div>
                                                </>
                                            )}
                                            {['Female', 'Intersex', 'Unknown'].includes(editForm.gender) && (
                                                <>
                                                    <div className="form-row">
                                                        <label>Last Pregnancy Date</label>
                                                        <input type="date" value={editForm.lastPregnancyDate || ''} onChange={(e) => setEditForm({...editForm, lastPregnancyDate: e.target.value})} />
                                                    </div>
                                                    <div className="form-row">
                                                        <label>Litter Count</label>
                                                        <input type="number" min="0" value={editForm.litterCount || ''} onChange={(e) => setEditForm({...editForm, litterCount: e.target.value})} />
                                                    </div>
                                                </>
                                            )}
                                            <div className="form-row">
                                                <label>Total Offspring</label>
                                                <input type="number" min="0" value={editForm.offspringCount || ''} onChange={(e) => setEditForm({...editForm, offspringCount: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 7: Health */}
                            {editActiveTab === 'health' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Health Status</h4>
                                            <div className="form-row">
                                                <label>Health Status</label>
                                                <input type="text" value={editForm.healthStatus || ''} onChange={(e) => setEditForm({...editForm, healthStatus: e.target.value})} placeholder="Overall health condition" />
                                            </div>
                                            <div className="form-row">
                                                <label>Health Issues</label>
                                                <input type="text" value={editForm.healthIssues || ''} onChange={(e) => setEditForm({...editForm, healthIssues: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Preventive Care</h4>
                                            <div className="form-row full-width">
                                                <label>Vaccinations</label>
                                                <textarea rows={3} value={editForm.vaccinations || ''} onChange={(e) => setEditForm({...editForm, vaccinations: e.target.value})} placeholder="Vaccination records..." />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Deworming Records</label>
                                                <textarea rows={3} value={editForm.dewormingRecords || ''} onChange={(e) => setEditForm({...editForm, dewormingRecords: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Parasite Control</label>
                                                <textarea rows={2} value={editForm.parasiteControl || ''} onChange={(e) => setEditForm({...editForm, parasiteControl: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Parasite Prevention Schedule</label>
                                                <textarea rows={2} value={editForm.parasitePreventionSchedule || ''} onChange={(e) => setEditForm({...editForm, parasitePreventionSchedule: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Medical Records</h4>
                                            <div className="form-row full-width">
                                                <label>Medical Conditions</label>
                                                <textarea rows={3} value={editForm.medicalConditions || ''} onChange={(e) => setEditForm({...editForm, medicalConditions: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Allergies</label>
                                                <textarea rows={2} value={editForm.allergies || ''} onChange={(e) => setEditForm({...editForm, allergies: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Current Medications</label>
                                                <textarea rows={2} value={editForm.medications || ''} onChange={(e) => setEditForm({...editForm, medications: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Medical History</label>
                                                <textarea rows={3} value={editForm.medicalHistory || ''} onChange={(e) => setEditForm({...editForm, medicalHistory: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Chronic Conditions</label>
                                                <textarea rows={2} value={editForm.chronicConditions || ''} onChange={(e) => setEditForm({...editForm, chronicConditions: e.target.value})} />
                                            </div>
                                        </div>

                                        {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                            <div className="form-section">
                                                <h4 className="section-title">Health Clearances & Screening</h4>
                                                <div className="form-row">
                                                    <label>Spay/Neuter Date</label>
                                                    <input type="date" value={editForm.spayNeuterDate || ''} onChange={(e) => setEditForm({...editForm, spayNeuterDate: e.target.value})} />
                                                </div>
                                                <div className="form-row">
                                                    <label>Heartworm Status</label>
                                                    <select value={editForm.heartwormStatus || ''} onChange={(e) => setEditForm({...editForm, heartwormStatus: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="Negative">Negative</option>
                                                        <option value="Positive">Positive</option>
                                                        <option value="On Prevention">On Prevention</option>
                                                        <option value="Unknown">Unknown</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label>Hip/Elbow Scores</label>
                                                    <input type="text" value={editForm.hipElbowScores || ''} onChange={(e) => setEditForm({...editForm, hipElbowScores: e.target.value})} placeholder="e.g., OFA Good, PennHIP 0.32" />
                                                </div>
                                                <div className="form-row">
                                                    <label>Eye Clearance</label>
                                                    <input type="text" value={editForm.eyeClearance || ''} onChange={(e) => setEditForm({...editForm, eyeClearance: e.target.value})} placeholder="e.g., CAER Clear 2024" />
                                                </div>
                                                <div className="form-row">
                                                    <label>Cardiac Clearance</label>
                                                    <input type="text" value={editForm.cardiacClearance || ''} onChange={(e) => setEditForm({...editForm, cardiacClearance: e.target.value})} placeholder="e.g., OFA Cardiac Normal" />
                                                </div>
                                                <div className="form-row">
                                                    <label>Dental Records</label>
                                                    <input type="text" value={editForm.dentalRecords || ''} onChange={(e) => setEditForm({...editForm, dentalRecords: e.target.value})} placeholder="e.g., Last cleaning 01/2024" />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Genetic Test Results</label>
                                                    <textarea rows={2} value={editForm.geneticTestResults || ''} onChange={(e) => setEditForm({...editForm, geneticTestResults: e.target.value})} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-section">
                                            <h4 className="section-title">Veterinary Care</h4>
                                            <div className="form-row">
                                                <label>Primary Veterinarian</label>
                                                <input type="text" value={editForm.primaryVet || ''} onChange={(e) => setEditForm({...editForm, primaryVet: e.target.value})} placeholder="e.g., Dr. Smith, ABC Veterinary Clinic" />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Vet Visits</label>
                                                <textarea rows={3} value={editForm.vetVisits || ''} onChange={(e) => setEditForm({...editForm, vetVisits: e.target.value})} placeholder="Veterinary visit records..." />
                                            </div>
                                            <div className="form-row">
                                                <label>Laboratory Results</label>
                                                <input type="text" value={editForm.laboratoryResults || ''} onChange={(e) => setEditForm({...editForm, laboratoryResults: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 8: Husbandry */}
                            {editActiveTab === 'husbandry' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Nutrition</h4>
                                            <div className="form-row full-width">
                                                <label>Diet Type</label>
                                                <textarea rows={3} value={editForm.dietType || ''} onChange={(e) => setEditForm({...editForm, dietType: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Feeding Schedule</label>
                                                <textarea rows={3} value={editForm.feedingSchedule || ''} onChange={(e) => setEditForm({...editForm, feedingSchedule: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Supplements</label>
                                                <textarea rows={2} value={editForm.supplements || ''} onChange={(e) => setEditForm({...editForm, supplements: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Husbandry</h4>
                                            <div className="form-row full-width">
                                                <label>Housing Type</label>
                                                <textarea rows={3} value={editForm.housingType || ''} onChange={(e) => setEditForm({...editForm, housingType: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Bedding</label>
                                                <textarea rows={2} value={editForm.bedding || ''} onChange={(e) => setEditForm({...editForm, bedding: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Enrichment</label>
                                                <textarea rows={2} value={editForm.enrichment || ''} onChange={(e) => setEditForm({...editForm, enrichment: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Environment</h4>
                                            <div className="form-row">
                                                <label>Temperature Range</label>
                                                <input type="text" value={editForm.temperatureRange || ''} onChange={(e) => setEditForm({...editForm, temperatureRange: e.target.value})} placeholder="e.g. 20-24°C" />
                                            </div>
                                            <div className="form-row">
                                                <label>Humidity</label>
                                                <input type="text" value={editForm.humidity || ''} onChange={(e) => setEditForm({...editForm, humidity: e.target.value})} placeholder="e.g. 40-60%" />
                                            </div>
                                            <div className="form-row">
                                                <label>Lighting</label>
                                                <input type="text" value={editForm.lighting || ''} onChange={(e) => setEditForm({...editForm, lighting: e.target.value})} />
                                            </div>
                                            <div className="form-row">
                                                <label>Noise Level</label>
                                                <input type="text" value={editForm.noise || ''} onChange={(e) => setEditForm({...editForm, noise: e.target.value})} />
                                            </div>
                                        </div>

                                        {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                            <div className="form-section">
                                                <h4 className="section-title">Exercise & Grooming</h4>
                                                <div className="form-row">
                                                    <label>Exercise Requirements</label>
                                                    <select value={editForm.exerciseRequirements || ''} onChange={(e) => setEditForm({...editForm, exerciseRequirements: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Moderate">Moderate</option>
                                                        <option value="High">High</option>
                                                        <option value="Very High">Very High</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label>Daily Exercise (minutes)</label>
                                                    <input type="number" value={editForm.dailyExerciseMinutes || ''} onChange={(e) => setEditForm({...editForm, dailyExerciseMinutes: e.target.value})} />
                                                </div>
                                                <div className="form-row">
                                                    <label>Grooming Needs</label>
                                                    <select value={editForm.groomingNeeds || ''} onChange={(e) => setEditForm({...editForm, groomingNeeds: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Moderate">Moderate</option>
                                                        <option value="High">High</option>
                                                        <option value="Professional">Professional</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label>Shedding Level</label>
                                                    <select value={editForm.sheddingLevel || ''} onChange={(e) => setEditForm({...editForm, sheddingLevel: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="None">None</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Moderate">Moderate</option>
                                                        <option value="Heavy">Heavy</option>
                                                        <option value="Seasonal">Seasonal</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label className="checkbox-label">
                                                        <input type="checkbox" checked={editForm.crateTrained || false} onChange={(e) => setEditForm({...editForm, crateTrained: e.target.checked})} />
                                                        Crate Trained
                                                    </label>
                                                </div>
                                                {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'cat' && (
                                                    <div className="form-row">
                                                        <label className="checkbox-label">
                                                            <input type="checkbox" checked={editForm.litterTrained || false} onChange={(e) => setEditForm({...editForm, litterTrained: e.target.checked})} />
                                                            Litter Trained
                                                        </label>
                                                    </div>
                                                )}
                                                {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'dog' && (
                                                    <div className="form-row">
                                                        <label className="checkbox-label">
                                                            <input type="checkbox" checked={editForm.leashTrained || false} onChange={(e) => setEditForm({...editForm, leashTrained: e.target.checked})} />
                                                            Leash Trained
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 9: Behavior */}
                            {editActiveTab === 'behavior' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Behavior</h4>
                                            <div className="form-row full-width">
                                                <label>Temperament</label>
                                                <textarea rows={3} value={editForm.temperament || ''} onChange={(e) => setEditForm({...editForm, temperament: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Handling Tolerance</label>
                                                <textarea rows={2} value={editForm.handlingTolerance || ''} onChange={(e) => setEditForm({...editForm, handlingTolerance: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Social Structure</label>
                                                <textarea rows={2} value={editForm.socialStructure || ''} onChange={(e) => setEditForm({...editForm, socialStructure: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Activity</h4>
                                            <div className="form-row">
                                                <label>Activity Cycle</label>
                                                <select value={editForm.activityCycle || ''} onChange={(e) => setEditForm({...editForm, activityCycle: e.target.value})}>
                                                    <option value="">Select...</option>
                                                    <option value="Diurnal">Diurnal</option>
                                                    <option value="Nocturnal">Nocturnal</option>
                                                    <option value="Crepuscular">Crepuscular</option>
                                                </select>
                                            </div>
                                        </div>

                                        {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                            <div className="form-section">
                                                <h4 className="section-title">Training & Working</h4>
                                                <div className="form-row">
                                                    <label>Training Level</label>
                                                    <select value={editForm.trainingLevel || ''} onChange={(e) => setEditForm({...editForm, trainingLevel: e.target.value})}>
                                                        <option value="">Select...</option>
                                                        <option value="None">None</option>
                                                        <option value="Basic">Basic</option>
                                                        <option value="Intermediate">Intermediate</option>
                                                        <option value="Advanced">Advanced</option>
                                                        <option value="Competition">Competition</option>
                                                    </select>
                                                </div>
                                                <div className="form-row">
                                                    <label>Training Disciplines</label>
                                                    <input type="text" value={editForm.trainingDisciplines || ''} onChange={(e) => setEditForm({...editForm, trainingDisciplines: e.target.value})} />
                                                </div>
                                                <div className="form-row">
                                                    <label>Working Role</label>
                                                    <input type="text" value={editForm.workingRole || ''} onChange={(e) => setEditForm({...editForm, workingRole: e.target.value})} />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Certifications</label>
                                                    <textarea rows={2} value={editForm.certifications || ''} onChange={(e) => setEditForm({...editForm, certifications: e.target.value})} />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Behavioral Issues</label>
                                                    <textarea rows={2} value={editForm.behavioralIssues || ''} onChange={(e) => setEditForm({...editForm, behavioralIssues: e.target.value})} />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Bite History</label>
                                                    <textarea rows={2} value={editForm.biteHistory || ''} onChange={(e) => setEditForm({...editForm, biteHistory: e.target.value})} />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Reactivity Notes</label>
                                                    <textarea rows={2} value={editForm.reactivityNotes || ''} onChange={(e) => setEditForm({...editForm, reactivityNotes: e.target.value})} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 10: Records */}
                            {editActiveTab === 'records' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Remarks & Notes</h4>
                                            <div className="form-row full-width">
                                                <label>Remarks</label>
                                                <textarea rows={5} value={editForm.remarks || ''} onChange={(e) => setEditForm({...editForm, remarks: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 11: End of Life */}
                            {editActiveTab === 'endoflife' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">End of Life</h4>
                                            <div className="form-row">
                                                <label>Date of Death</label>
                                                <input type="date" value={editForm.deceasedDate || ''} onChange={(e) => setEditForm({...editForm, deceasedDate: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Cause of Death</label>
                                                <textarea rows={2} value={editForm.causeOfDeath || ''} onChange={(e) => setEditForm({...editForm, causeOfDeath: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Necropsy Results</label>
                                                <textarea rows={3} value={editForm.necropsyResults || ''} onChange={(e) => setEditForm({...editForm, necropsyResults: e.target.value})} />
                                            </div>
                                            {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                                <div className="form-row full-width">
                                                    <label>End of Life Care Notes</label>
                                                    <textarea rows={2} value={editForm.endOfLifeCareNotes || ''} onChange={(e) => setEditForm({...editForm, endOfLifeCareNotes: e.target.value})} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-section">
                                            <h4 className="section-title">Legal / Administrative</h4>
                                            <div className="form-row full-width">
                                                <label>Insurance</label>
                                                <textarea rows={2} value={editForm.insurance || ''} onChange={(e) => setEditForm({...editForm, insurance: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Legal Status</label>
                                                <textarea rows={2} value={editForm.legalStatus || ''} onChange={(e) => setEditForm({...editForm, legalStatus: e.target.value})} />
                                            </div>
                                            {['dog', 'cat'].includes(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) && (
                                                <>
                                                    <div className="form-row full-width">
                                                        <label>Breeding Restrictions</label>
                                                        <textarea rows={2} value={editForm.breedingRestrictions || ''} onChange={(e) => setEditForm({...editForm, breedingRestrictions: e.target.value})} />
                                                    </div>
                                                    <div className="form-row full-width">
                                                        <label>Export Restrictions</label>
                                                        <textarea rows={2} value={editForm.exportRestrictions || ''} onChange={(e) => setEditForm({...editForm, exportRestrictions: e.target.value})} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 12: Show */}
                            {editActiveTab === 'show' && (
                                <div className="tab-panel">
                                    <div className="edit-form">
                                        <div className="form-section">
                                            <h4 className="section-title">Show Titles & Ratings</h4>
                                            <div className="form-row full-width">
                                                <label>Show Titles</label>
                                                <textarea rows={3} value={editForm.showTitles || ''} onChange={(e) => setEditForm({...editForm, showTitles: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Show Ratings</label>
                                                <textarea rows={3} value={editForm.showRatings || ''} onChange={(e) => setEditForm({...editForm, showRatings: e.target.value})} />
                                            </div>
                                            <div className="form-row full-width">
                                                <label>Judge Comments</label>
                                                <textarea rows={4} value={editForm.judgeComments || ''} onChange={(e) => setEditForm({...editForm, judgeComments: e.target.value})} />
                                            </div>
                                        </div>

                                        {(editForm.species?.toLowerCase() || selectedAnimal.species?.toLowerCase()) === 'dog' && (
                                            <div className="form-section">
                                                <h4 className="section-title">Working & Performance</h4>
                                                <div className="form-row full-width">
                                                    <label>Working Titles</label>
                                                    <textarea rows={3} value={editForm.workingTitles || ''} onChange={(e) => setEditForm({...editForm, workingTitles: e.target.value})} />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Performance Scores</label>
                                                    <textarea rows={3} value={editForm.performanceScores || ''} onChange={(e) => setEditForm({...editForm, performanceScores: e.target.value})} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            </div>

                            {/* Edit Reason (shown on all tabs) */}
                            <div className="edit-form">
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
