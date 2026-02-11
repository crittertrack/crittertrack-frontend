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
            manualBreederName: animal.manualBreederName || ''
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

        // If owner is being changed, also set ownerId (backend ObjectId will be resolved)
        if (changedFields.ownerId_public) {
            const selectedUser = users.find(u => u.id_public === changedFields.ownerId_public);
            if (selectedUser) {
                changedFields.ownerId = selectedUser._id;
                // Set animal as owned and public when owner changes
                changedFields.isOwned = true;
                changedFields.showOnPublicProfile = true;
            } else {
                setError('Selected owner not found');
                return;
            }
        }

        // If breeder is being changed, also set breederId (backend ObjectId will be resolved)
        if (changedFields.breederId_public) {
            const selectedUser = users.find(u => u.id_public === changedFields.breederId_public);
            if (selectedUser) {
                changedFields.breederId = selectedUser._id;
            }
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
                            <div className="edit-form">
                                <div className="form-row">
                                    <label>Prefix</label>
                                    <input
                                        type="text"
                                        value={editForm.prefix}
                                        onChange={(e) => setEditForm({...editForm, prefix: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Suffix</label>
                                    <input
                                        type="text"
                                        value={editForm.suffix}
                                        onChange={(e) => setEditForm({...editForm, suffix: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Species</label>
                                    <input
                                        type="text"
                                        value={editForm.species}
                                        onChange={(e) => setEditForm({...editForm, species: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Gender</label>
                                    <select
                                        value={editForm.gender}
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
                                    <input
                                        type="text"
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Sire ID</label>
                                    <input
                                        type="text"
                                        value={editForm.sireId_public}
                                        onChange={(e) => setEditForm({...editForm, sireId_public: e.target.value})}
                                        placeholder="CTC###"
                                    />
                                </div>
                                <div className="form-row">
                                    <label>Dam ID</label>
                                    <input
                                        type="text"
                                        value={editForm.damId_public}
                                        onChange={(e) => setEditForm({...editForm, damId_public: e.target.value})}
                                        placeholder="CTC###"
                                    />
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
                                        value={editForm.manualBreederName}
                                        onChange={(e) => setEditForm({...editForm, manualBreederName: e.target.value, breederId_public: ''})}
                                        placeholder="Enter breeder name if not a registered user"
                                    />
                                </div>
                                <div className="form-row full-width">
                                    <label>Remarks</label>
                                    <textarea
                                        value={editForm.remarks}
                                        onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
                                        rows={3}
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
