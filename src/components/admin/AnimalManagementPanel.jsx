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
    const [viewActiveTab, setViewActiveTab] = useState('basic');
    const [editActiveTab, setEditActiveTab] = useState('basic');
    
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
                            <button 
                                className={`tab ${viewActiveTab === 'basic' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('basic')}
                            >
                                Basic Info
                            </button>
                            <button 
                                className={`tab ${viewActiveTab === 'physical' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('physical')}
                            >
                                Physical
                            </button>
                            <button 
                                className={`tab ${viewActiveTab === 'health' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('health')}
                            >
                                Health
                            </button>
                            <button 
                                className={`tab ${viewActiveTab === 'breeding' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('breeding')}
                            >
                                Breeding
                            </button>
                            <button 
                                className={`tab ${viewActiveTab === 'performance' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('performance')}
                            >
                                Performance
                            </button>
                            <button 
                                className={`tab ${viewActiveTab === 'legal' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('legal')}
                            >
                                Legal
                            </button>
                            <button 
                                className={`tab ${viewActiveTab === 'reports' ? 'active' : ''}`}
                                onClick={() => setViewActiveTab('reports')}
                            >
                                Reports
                            </button>
                        </div>

                        <div className="animal-modal-body">
                            <div className="tab-content scrollable-content">
                                {/* Basic Info Tab */}
                                {viewActiveTab === 'basic' && (
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
                                                <div><strong>Gender:</strong> {selectedAnimal.gender || '-'}</div>
                                                <div><strong>Status:</strong> {selectedAnimal.status || '-'}</div>
                                                <div><strong>Life Stage:</strong> {selectedAnimal.lifeStage || '-'}</div>
                                                <div><strong>Birth Date:</strong> {selectedAnimal.birthDate ? formatDate(selectedAnimal.birthDate) : '-'}</div>
                                                <div><strong>Deceased Date:</strong> {selectedAnimal.deceasedDate ? formatDate(selectedAnimal.deceasedDate) : '-'}</div>
                                                <div><strong>Created:</strong> {formatDate(selectedAnimal.createdAt)}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Identification</h4>
                                            <div className="detail-grid">
                                                <div><strong>Registry ID:</strong> {selectedAnimal.breederyId || '-'}</div>
                                                <div><strong>Microchip:</strong> {selectedAnimal.microchipNumber || '-'}</div>
                                                <div><strong>Pedigree ID:</strong> {selectedAnimal.pedigreeRegistrationId || '-'}</div>
                                                <div><strong>Genetic Code:</strong> {selectedAnimal.geneticCode || '-'}</div>
                                            </div>
                                        </div>

                                        <div className="animal-detail-section">
                                            <h4>Lineage</h4>
                                            <div className="detail-grid">
                                                <div><strong>Sire:</strong> {selectedAnimal.sireId_public || '-'}</div>
                                                <div><strong>Dam:</strong> {selectedAnimal.damId_public || '-'}</div>
                                            </div>
                                        </div>

                                        {selectedAnimal.remarks && (
                                            <div className="animal-detail-section">
                                                <h4>Remarks</h4>
                                                <p className="remarks-text">{selectedAnimal.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Physical Tab */}
                                {viewActiveTab === 'physical' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Physical Characteristics</h4>
                                            <div className="detail-grid">
                                                <div><strong>Color:</strong> {selectedAnimal.color || '-'}</div>
                                                <div><strong>Pattern:</strong> {selectedAnimal.pattern || '-'}</div>
                                                <div><strong>Eye Color:</strong> {selectedAnimal.eyeColor || '-'}</div>
                                                <div><strong>Weight:</strong> {selectedAnimal.weight ? `${selectedAnimal.weight} ${selectedAnimal.weightUnit || ''}` : '-'}</div>
                                                <div><strong>Height:</strong> {selectedAnimal.height ? `${selectedAnimal.height} ${selectedAnimal.heightUnit || ''}` : '-'}</div>
                                                <div><strong>Length:</strong> {selectedAnimal.length ? `${selectedAnimal.length} ${selectedAnimal.lengthUnit || ''}` : '-'}</div>
                                            </div>
                                        </div>

                                        {selectedAnimal.physicalDescription && (
                                            <div className="animal-detail-section">
                                                <h4>Physical Description</h4>
                                                <p className="remarks-text">{selectedAnimal.physicalDescription}</p>
                                            </div>
                                        )}

                                        {(selectedAnimal.markings || selectedAnimal.markingsDescription) && (
                                            <div className="animal-detail-section">
                                                <h4>Markings & Distinctive Features</h4>
                                                {selectedAnimal.markings && (
                                                    <div><strong>Markings:</strong> {selectedAnimal.markings}</div>
                                                )}
                                                {selectedAnimal.markingsDescription && (
                                                    <p className="remarks-text">{selectedAnimal.markingsDescription}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Health Tab */}
                                {viewActiveTab === 'health' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Health Status</h4>
                                            <div className="detail-grid">
                                                <div><strong>Spay/Neuter:</strong> {selectedAnimal.spayNeuterDate ? `Yes - ${formatDate(selectedAnimal.spayNeuterDate)}` : 'No'}</div>
                                                <div><strong>Health Status:</strong> {selectedAnimal.healthStatus || '-'}</div>
                                                <div><strong>Health Issues:</strong> {selectedAnimal.healthIssues || '-'}</div>
                                            </div>
                                        </div>

                                        {(selectedAnimal.geneticTestResults || selectedAnimal.healthClearances) && (
                                            <div className="animal-detail-section">
                                                <h4>Genetic Testing & Clearances</h4>
                                                {selectedAnimal.geneticTestResults && (
                                                    <div className="detail-item">
                                                        <strong>Genetic Test Results:</strong>
                                                        <p className="remarks-text">{selectedAnimal.geneticTestResults}</p>
                                                    </div>
                                                )}
                                                {selectedAnimal.healthClearances && (
                                                    <div className="detail-item">
                                                        <strong>Health Clearances:</strong>
                                                        <p className="remarks-text">{selectedAnimal.healthClearances}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedAnimal.medicalHistory && (
                                            <div className="animal-detail-section">
                                                <h4>Medical History</h4>
                                                <p className="remarks-text">{selectedAnimal.medicalHistory}</p>
                                            </div>
                                        )}

                                        {selectedAnimal.dietRequirements && (
                                            <div className="animal-detail-section">
                                                <h4>Diet & Care</h4>
                                                <p className="remarks-text">{selectedAnimal.dietRequirements}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Breeding Tab */}
                                {viewActiveTab === 'breeding' && (
                                    <div className="tab-panel">
                                        <div className="animal-detail-section">
                                            <h4>Breeding Information</h4>
                                            <div className="detail-grid">
                                                <div><strong>Breeding Rights:</strong> {selectedAnimal.breedingRights || '-'}</div>
                                                <div><strong>Breeding Quality:</strong> {selectedAnimal.breedingQuality || '-'}</div>
                                                <div><strong>Breeding Status:</strong> {selectedAnimal.breedingStatus || '-'}</div>
                                            </div>
                                        </div>

                                        {(selectedAnimal.progenyCount || selectedAnimal.litterHistory) && (
                                            <div className="animal-detail-section">
                                                <h4>Reproductive History</h4>
                                                {selectedAnimal.progenyCount && (
                                                    <div><strong>Progeny Count:</strong> {selectedAnimal.progenyCount}</div>
                                                )}
                                                {selectedAnimal.litterHistory && (
                                                    <div className="detail-item">
                                                        <strong>Litter History:</strong>
                                                        <p className="remarks-text">{selectedAnimal.litterHistory}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedAnimal.breedingRestrictions && (
                                            <div className="animal-detail-section">
                                                <h4>Breeding Restrictions</h4>
                                                <p className="remarks-text">{selectedAnimal.breedingRestrictions}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Performance Tab */}
                                {viewActiveTab === 'performance' && (
                                    <div className="tab-panel">
                                        {(selectedAnimal.showTitles || selectedAnimal.showRatings) && (
                                            <div className="animal-detail-section">
                                                <h4>Show Achievements</h4>
                                                {selectedAnimal.showTitles && (
                                                    <div className="detail-item">
                                                        <strong>Show Titles:</strong>
                                                        <p className="remarks-text">{selectedAnimal.showTitles}</p>
                                                    </div>
                                                )}
                                                {selectedAnimal.showRatings && (
                                                    <div className="detail-item">
                                                        <strong>Show Ratings:</strong>
                                                        <p className="remarks-text">{selectedAnimal.showRatings}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(selectedAnimal.workingTitles || selectedAnimal.performanceScores) && (
                                            <div className="animal-detail-section">
                                                <h4>Working & Performance</h4>
                                                {selectedAnimal.workingTitles && (
                                                    <div className="detail-item">
                                                        <strong>Working Titles:</strong>
                                                        <p className="remarks-text">{selectedAnimal.workingTitles}</p>
                                                    </div>
                                                )}
                                                {selectedAnimal.performanceScores && (
                                                    <div className="detail-item">
                                                        <strong>Performance Scores:</strong>
                                                        <p className="remarks-text">{selectedAnimal.performanceScores}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedAnimal.temperament && (
                                            <div className="animal-detail-section">
                                                <h4>Temperament</h4>
                                                <p className="remarks-text">{selectedAnimal.temperament}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Legal Tab */}
                                {viewActiveTab === 'legal' && (
                                    <div className="tab-panel">
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

                                        {(selectedAnimal.coOwnership || selectedAnimal.transferHistory) && (
                                            <div className="animal-detail-section">
                                                <h4>Ownership History</h4>
                                                {selectedAnimal.coOwnership && (
                                                    <div className="detail-item">
                                                        <strong>Co-ownership:</strong>
                                                        <p className="remarks-text">{selectedAnimal.coOwnership}</p>
                                                    </div>
                                                )}
                                                {selectedAnimal.transferHistory && (
                                                    <div className="detail-item">
                                                        <strong>Transfer History:</strong>
                                                        <p className="remarks-text">{selectedAnimal.transferHistory}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(selectedAnimal.legalStatus || selectedAnimal.insurance) && (
                                            <div className="animal-detail-section">
                                                <h4>Legal Status</h4>
                                                <div className="detail-grid">
                                                    <div><strong>Legal Status:</strong> {selectedAnimal.legalStatus || '-'}</div>
                                                    <div><strong>Insurance:</strong> {selectedAnimal.insurance || '-'}</div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedAnimal.exportRestrictions && (
                                            <div className="animal-detail-section">
                                                <h4>Restrictions</h4>
                                                <p className="remarks-text">{selectedAnimal.exportRestrictions}</p>
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
                            <button 
                                className={`tab ${editActiveTab === 'basic' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('basic')}
                            >
                                Basic Info
                            </button>
                            <button 
                                className={`tab ${editActiveTab === 'physical' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('physical')}
                            >
                                Physical
                            </button>
                            <button 
                                className={`tab ${editActiveTab === 'health' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('health')}
                            >
                                Health
                            </button>
                            <button 
                                className={`tab ${editActiveTab === 'breeding' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('breeding')}
                            >
                                Breeding
                            </button>
                            <button 
                                className={`tab ${editActiveTab === 'care' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('care')}
                            >
                                Care
                            </button>
                            <button 
                                className={`tab ${editActiveTab === 'performance' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('performance')}
                            >
                                Performance
                            </button>
                            <button 
                                className={`tab ${editActiveTab === 'legal' ? 'active' : ''}`}
                                onClick={() => setEditActiveTab('legal')}
                            >
                                Legal
                            </button>
                        </div>

                        <div className="animal-modal-body">
                            <div className="tab-content scrollable-content">
                                {/* Basic Info Tab */}
                                {editActiveTab === 'basic' && (
                                    <div className="tab-panel">
                                        <div className="edit-form">
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
                                                    <label>Breed</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.breed || ''}
                                                        onChange={(e) => setEditForm({...editForm, breed: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <label>Gender</label>
                                                    <select
                                                        value={editForm.gender || ''}
                                                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                                    >
                                                        <option value="">Select...</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Intersex">Intersex</option>
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
                                                <h4 className="section-title">Identification</h4>
                                                <div className="form-row">
                                                    <label>Registry/Breeder ID</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.breederyId || ''}
                                                        onChange={(e) => setEditForm({...editForm, breederyId: e.target.value})}
                                                        placeholder="Registry or breeder identification code"
                                                    />
                                                </div>
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
                                            </div>

                                            {/* LINEAGE */}
                                            <div className="form-section">
                                                <h4 className="section-title">Lineage</h4>
                                                <div className="form-row">
                                                    <label>Sire (Father) ID</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.sireId_public || ''}
                                                        onChange={(e) => setEditForm({...editForm, sireId_public: e.target.value})}
                                                        placeholder="Father's ID"
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <label>Dam (Mother) ID</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.damId_public || ''}
                                                        onChange={(e) => setEditForm({...editForm, damId_public: e.target.value})}
                                                        placeholder="Mother's ID"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Physical Tab */}
                                {editActiveTab === 'physical' && (
                                    <div className="tab-panel">
                                        <div className="edit-form">
                                            {/* PHYSICAL CHARACTERISTICS */}
                                            <div className="form-section">
                                                <h4 className="section-title">Physical Characteristics</h4>
                                                <div className="form-row">
                                                    <label>Color</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.color || ''}
                                                        onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <label>Pattern</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.pattern || ''}
                                                        onChange={(e) => setEditForm({...editForm, pattern: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <label>Eye Color</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.eyeColor || ''}
                                                        onChange={(e) => setEditForm({...editForm, eyeColor: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <label>Weight</label>
                                                    <div className="measurement-row">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={editForm.weight || ''}
                                                            onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                                                            placeholder="0.0"
                                                        />
                                                        <select
                                                            value={editForm.weightUnit || 'kg'}
                                                            onChange={(e) => setEditForm({...editForm, weightUnit: e.target.value})}
                                                        >
                                                            <option value="kg">kg</option>
                                                            <option value="lb">lb</option>
                                                            <option value="g">g</option>
                                                            <option value="oz">oz</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <label>Height</label>
                                                    <div className="measurement-row">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={editForm.height || ''}
                                                            onChange={(e) => setEditForm({...editForm, height: e.target.value})}
                                                            placeholder="0.0"
                                                        />
                                                        <select
                                                            value={editForm.heightUnit || 'cm'}
                                                            onChange={(e) => setEditForm({...editForm, heightUnit: e.target.value})}
                                                        >
                                                            <option value="cm">cm</option>
                                                            <option value="in">in</option>
                                                            <option value="mm">mm</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <label>Length</label>
                                                    <div className="measurement-row">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={editForm.length || ''}
                                                            onChange={(e) => setEditForm({...editForm, length: e.target.value})}
                                                            placeholder="0.0"
                                                        />
                                                        <select
                                                            value={editForm.lengthUnit || 'cm'}
                                                            onChange={(e) => setEditForm({...editForm, lengthUnit: e.target.value})}
                                                        >
                                                            <option value="cm">cm</option>
                                                            <option value="in">in</option>
                                                            <option value="mm">mm</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* MARKINGS & DESCRIPTION */}
                                            <div className="form-section">
                                                <h4 className="section-title">Markings & Description</h4>
                                                <div className="form-row">
                                                    <label>Markings</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.markings || ''}
                                                        onChange={(e) => setEditForm({...editForm, markings: e.target.value})}
                                                        placeholder="Notable markings or distinctive features"
                                                    />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Markings Description</label>
                                                    <textarea
                                                        value={editForm.markingsDescription || ''}
                                                        onChange={(e) => setEditForm({...editForm, markingsDescription: e.target.value})}
                                                        rows={3}
                                                        placeholder="Detailed description of markings..."
                                                    />
                                                </div>
                                                <div className="form-row full-width">
                                                    <label>Physical Description</label>
                                                    <textarea
                                                        value={editForm.physicalDescription || ''}
                                                        onChange={(e) => setEditForm({...editForm, physicalDescription: e.target.value})}
                                                        rows={4}
                                                        placeholder="Overall physical description..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                    {/* Health Tab */}
                    {editActiveTab === 'health' && (
                        <div className="tab-panel">
                            <div className="edit-form">
                                <div className="form-section">
                                    <h4 className="section-title">Health Status & Medical</h4>
                                    <div className="form-row">
                                        <label>Health Status</label>
                                        <input
                                            type="text"
                                            value={editForm.healthStatus || ''}
                                            onChange={(e) => setEditForm({...editForm, healthStatus: e.target.value})}
                                            placeholder="Overall health condition"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Vaccination Records</label>
                                        <textarea
                                            value={editForm.vaccinationRecords || ''}
                                            onChange={(e) => setEditForm({...editForm, vaccinationRecords: e.target.value})}
                                            rows={3}
                                            placeholder="Vaccination history and schedule..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Medical History</label>
                                        <textarea
                                            value={editForm.medicalHistory || ''}
                                            onChange={(e) => setEditForm({...editForm, medicalHistory: e.target.value})}
                                            rows={4}
                                            placeholder="Past illnesses, surgeries, treatments..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Current Medications</label>
                                        <textarea
                                            value={editForm.currentMedications || ''}
                                            onChange={(e) => setEditForm({...editForm, currentMedications: e.target.value})}
                                            rows={3}
                                            placeholder="Current medications, dosages, schedules..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Allergies</label>
                                        <textarea
                                            value={editForm.allergies || ''}
                                            onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                                            rows={2}
                                            placeholder="Known allergies or sensitivities..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Veterinarian Contact</label>
                                        <textarea
                                            value={editForm.veterinarianContact || ''}
                                            onChange={(e) => setEditForm({...editForm, veterinarianContact: e.target.value})}
                                            rows={2}
                                            placeholder="Primary veterinarian name, clinic, contact info..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Breeding Tab */}
                    {editActiveTab === 'breeding' && (
                        <div className="tab-panel">
                            <div className="edit-form">
                                <div className="form-section">
                                    <h4 className="section-title">Breeding & Reproduction</h4>
                                    <div className="form-row">
                                        <label>Reproductive Status</label>
                                        <select
                                            value={editForm.reproductiveStatus || ''}
                                            onChange={(e) => setEditForm({...editForm, reproductiveStatus: e.target.value})}
                                        >
                                            <option value="">Select Status...</option>
                                            <option value="intact">Intact</option>
                                            <option value="neutered">Neutered/Spayed</option>
                                            <option value="breeding">Active Breeding</option>
                                            <option value="retired">Retired from Breeding</option>
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <label>Breeding Status</label>
                                        <input
                                            type="text"
                                            value={editForm.breedingStatus || ''}
                                            onChange={(e) => setEditForm({...editForm, breedingStatus: e.target.value})}
                                            placeholder="Current breeding status"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Breeding History</label>
                                        <textarea
                                            value={editForm.breedingHistory || ''}
                                            onChange={(e) => setEditForm({...editForm, breedingHistory: e.target.value})}
                                            rows={4}
                                            placeholder="Past breeding pairings, offspring, breeding notes..."
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Stud Fee</label>
                                        <input
                                            type="number"
                                            value={editForm.studFee || ''}
                                            onChange={(e) => setEditForm({...editForm, studFee: e.target.value})}
                                            step="0.01"
                                            placeholder="Breeding fee"
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Breeding Availability</label>
                                        <textarea
                                            value={editForm.breedingAvailability || ''}
                                            onChange={(e) => setEditForm({...editForm, breedingAvailability: e.target.value})}
                                            rows={2}
                                            placeholder="Available for breeding, conditions, restrictions..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Care Tab */}
                    {editActiveTab === 'care' && (
                        <div className="tab-panel">
                            <div className="edit-form">
                                <div className="form-section">
                                    <h4 className="section-title">Care & Environment</h4>
                                    <div className="form-row full-width">
                                        <label>Diet/Nutrition</label>
                                        <textarea
                                            value={editForm.diet || ''}
                                            onChange={(e) => setEditForm({...editForm, diet: e.target.value})}
                                            rows={3}
                                            placeholder="Feeding schedule, food types, dietary needs..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Habitat/Housing</label>
                                        <textarea
                                            value={editForm.habitat || ''}
                                            onChange={(e) => setEditForm({...editForm, habitat: e.target.value})}
                                            rows={3}
                                            placeholder="Enclosure type, size, environmental conditions..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Special Care Requirements</label>
                                        <textarea
                                            value={editForm.specialCareRequirements || ''}
                                            onChange={(e) => setEditForm({...editForm, specialCareRequirements: e.target.value})}
                                            rows={3}
                                            placeholder="Special handling, environmental needs, care instructions..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Temperament</label>
                                        <textarea
                                            value={editForm.temperament || ''}
                                            onChange={(e) => setEditForm({...editForm, temperament: e.target.value})}
                                            rows={3}
                                            placeholder="Personality traits, behavioral characteristics..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Behavioral Notes</label>
                                        <textarea
                                            value={editForm.behavioralNotes || ''}
                                            onChange={(e) => setEditForm({...editForm, behavioralNotes: e.target.value})}
                                            rows={3}
                                            placeholder="Behavioral observations, quirks, preferences..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {editActiveTab === 'performance' && (
                        <div className="tab-panel">
                            <div className="edit-form">
                                <div className="form-section">
                                    <h4 className="section-title">Show & Competition</h4>
                                    <div className="form-row full-width">
                                        <label>Show Record</label>
                                        <textarea
                                            value={editForm.showRecord || ''}
                                            onChange={(e) => setEditForm({...editForm, showRecord: e.target.value})}
                                            rows={4}
                                            placeholder="Competition history, placements, wins..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Titles & Awards</label>
                                        <textarea
                                            value={editForm.titlesAwards || ''}
                                            onChange={(e) => setEditForm({...editForm, titlesAwards: e.target.value})}
                                            rows={3}
                                            placeholder="Championships, certifications, awards earned..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Performance Scores</label>
                                        <textarea
                                            value={editForm.performanceScores || ''}
                                            onChange={(e) => setEditForm({...editForm, performanceScores: e.target.value})}
                                            rows={2}
                                            placeholder="Competition scores, performance metrics..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legal Tab */}
                    {editActiveTab === 'legal' && (
                        <div className="tab-panel">
                            <div className="edit-form">
                                <div className="form-section">
                                    <h4 className="section-title">Legal & Ownership</h4>
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
                                        <label>Co-ownership</label>
                                        <textarea
                                            value={editForm.coOwnership || ''}
                                            onChange={(e) => setEditForm({...editForm, coOwnership: e.target.value})}
                                            rows={2}
                                            placeholder="Co-ownership agreements, shared ownership details..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Transfer History</label>
                                        <textarea
                                            value={editForm.transferHistory || ''}
                                            onChange={(e) => setEditForm({...editForm, transferHistory: e.target.value})}
                                            rows={3}
                                            placeholder="History of ownership transfers..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Breeding Restrictions</label>
                                        <textarea
                                            value={editForm.breedingRestrictions || ''}
                                            onChange={(e) => setEditForm({...editForm, breedingRestrictions: e.target.value})}
                                            rows={2}
                                            placeholder="Contractual breeding limitations, agreements..."
                                        />
                                    </div>
                                    <div className="form-row full-width">
                                        <label>Export Restrictions</label>
                                        <textarea
                                            value={editForm.exportRestrictions || ''}
                                            onChange={(e) => setEditForm({...editForm, exportRestrictions: e.target.value})}
                                            rows={2}
                                            placeholder="International transfer restrictions..."
                                        />
                                    </div>
                                </div>
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
