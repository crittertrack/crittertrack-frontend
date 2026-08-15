import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Search, Filter, Eye, EyeOff, Trash2, Edit, AlertTriangle, 
    ChevronLeft, ChevronRight, X, ExternalLink, Image, User,
    RefreshCw, FileText, Save, ArrowLeft, ArrowRight
} from 'lucide-react';
import AnimalModalV2 from '../AnimalDetail/AnimalModalV2';
import AnimalFormModalV2 from '../AnimalForm/AnimalFormModalV2';
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
    const [showHideConfirm, setShowHideConfirm] = useState(false);
    const [actionReason, setActionReason] = useState('');

    // Read-only detail view (Eye icon) image lightbox — AnimalModalV2 expects these as props.
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState('');

    // Admin edit flow (Edit icon): AnimalFormModalV2's "Continue" button hands off the built
    // payload here instead of saving directly, then we show a dedicated owner-change + reason
    // screen before anything is actually persisted.
    const [showOwnerChangeScreen, setShowOwnerChangeScreen] = useState(false);
    const [pendingFieldEdits, setPendingFieldEdits] = useState(null);
    const [newOwnerQuery, setNewOwnerQuery] = useState('');
    const [newOwnerResults, setNewOwnerResults] = useState([]);
    const [selectedNewOwner, setSelectedNewOwner] = useState(null);
    const [ownerChangeReason, setOwnerChangeReason] = useState('');
    const [treatAsTransfer, setTreatAsTransfer] = useState(false);
    const [savingOwnerChange, setSavingOwnerChange] = useState(false);
    // AnimalFormModalV2 always calls onCancel() right after a successful onSave() resolves
    // (normally to close the form) — we don't want that to happen when "Continue" is what
    // triggered it, only when the admin explicitly clicks Cancel/X. This ref lets the onCancel
    // handler tell the two situations apart without waiting on a state re-render.
    const skipNextCancelRef = useRef(false);
    
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

    useEffect(() => {
        const handleAnimalUpdated = (e) => {
            const updated = e.detail;
            if (!updated?.id_public) return;

            setAnimals(prev => {
                let changed = false;
                const next = prev.map(animal => {
                    if (animal.id_public !== updated.id_public) return animal;
                    changed = true;
                    return { ...animal, ...updated };
                });
                return changed ? next : prev;
            });

            setSelectedAnimal(prev => {
                if (!prev || prev.id_public !== updated.id_public) return prev;
                return { ...prev, ...updated };
            });
        };

        window.addEventListener('animal-updated', handleAnimalUpdated);
        return () => window.removeEventListener('animal-updated', handleAnimalUpdated);
    }, []);

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

    // Opens the real AnimalFormModalV2 for this animal (same form the owner would use), with its
    // Save button relabeled "Continue" — see handleAdminContinueEdit for what happens next.
    const openEditModal = (animal) => {
        setSelectedAnimal(animal);
        setShowOwnerChangeScreen(false);
        setPendingFieldEdits(null);
        setSelectedNewOwner(null);
        setNewOwnerQuery('');
        setNewOwnerResults([]);
        setOwnerChangeReason('');
        setTreatAsTransfer(false);
        setShowEditModal(true);
    };

    // ADMIN_EDIT_EXCLUDED_FIELDS: never let the generic form-diff touch ownership/identity fields —
    // those are only ever changed deliberately via the dedicated owner-change screen below.
    const ADMIN_EDIT_EXCLUDED_FIELDS = ['_id', 'id_public', 'creatorId', 'creatorId_public', '__v', 'createdAt', 'updatedAt'];

    // '', null, undefined, [] and {} are all treated as "nothing set" so e.g. a stringified-empty
    // array from one side and a null from the other don't register as a real change.
    const isEmptyForDiff = (value) => {
        if (value === undefined || value === null || value === '') return true;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    };

    const normalizeForDiff = (value) => {
        if (isEmptyForDiff(value)) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    // Custom `onSave` passed to AnimalFormModalV2. Instead of persisting anything, it diffs the
    // built payload against the form's own initial (pre-edit) snapshot — not the raw fetched
    // animal, whose dates/nested objects are shaped differently than what AnimalFormModalV2
    // normalizes them to, which used to make untouched fields falsely show up as "changed" — then
    // stashes the changed fields and switches the UI to the owner-change + reason screen.
    // skipNextCancelRef stops the form's own post-save onCancel() call (which normally closes the
    // modal) from also closing this new screen.
    const handleAdminContinueEdit = async (method, url, payloadToSave, initialFormData) => {
        const baseline = initialFormData || selectedAnimal;
        const edits = {};
        for (const key of Object.keys(payloadToSave)) {
            if (ADMIN_EDIT_EXCLUDED_FIELDS.includes(key)) continue;
            if (normalizeForDiff(payloadToSave[key]) !== normalizeForDiff(baseline?.[key])) {
                edits[key] = payloadToSave[key];
            }
        }
        setPendingFieldEdits(edits);
        skipNextCancelRef.current = true;
        setShowOwnerChangeScreen(true);
        // Nothing has been saved to the backend yet — return a stand-in response so
        // AnimalFormModalV2's own post-save bookkeeping (contact assignment sync) doesn't throw.
        return { data: { id_public: selectedAnimal?.id_public } };
    };

    const handleAdminEditCancel = () => {
        if (skipNextCancelRef.current) {
            // Fired automatically right after handleAdminContinueEdit resolved — not a real cancel.
            skipNextCancelRef.current = false;
            return;
        }
        setShowEditModal(false);
        setSelectedAnimal(null);
    };

    const searchNewOwner = (query) => {
        setNewOwnerQuery(query);
        if (!query.trim()) {
            setNewOwnerResults([]);
            return;
        }
        const searchText = query.toLowerCase();
        const filtered = users.filter(user => {
            const personalName = (user.personalName || '').toLowerCase();
            const username = (user.username || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const idPublic = (user.id_public || '').toLowerCase();
            return personalName.includes(searchText) ||
                   username.includes(searchText) ||
                   email.includes(searchText) ||
                   idPublic.includes(searchText);
        }).slice(0, 10);
        setNewOwnerResults(filtered);
    };

    const selectNewOwner = (user) => {
        setSelectedNewOwner(user);
        setNewOwnerQuery('');
        setNewOwnerResults([]);
    };

    // Final "Save" on the owner-change screen — the only point where anything is actually
    // persisted for the admin edit flow. Sends the diffed field edits plus (optionally) the new
    // owner, in one PATCH with one required reason.
    const handleFinalAdminSave = async () => {
        if (!ownerChangeReason.trim()) {
            setError('Please provide a reason for this change.');
            return;
        }

        const fieldEdits = { ...(pendingFieldEdits || {}) };
        if (selectedNewOwner) {
            fieldEdits.creatorId = selectedNewOwner._id;
            fieldEdits.creatorId_public = selectedNewOwner.id_public;
            fieldEdits.isOwned = true;
            fieldEdits.isDisplay = true;
        }

        if (Object.keys(fieldEdits).length === 0) {
            setError('No changes were made.');
            return;
        }

        setSavingOwnerChange(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/moderation/content/animal/${selectedAnimal._id}/edit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    fieldEdits,
                    reason: ownerChangeReason,
                    treatAsTransfer: !!selectedNewOwner && treatAsTransfer
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message || 'Failed to update animal');

            setSuccess('Animal updated successfully');
            setShowEditModal(false);
            setShowOwnerChangeScreen(false);
            setSelectedAnimal(null);
            setPendingFieldEdits(null);
            setSelectedNewOwner(null);
            setOwnerChangeReason('');
            setTreatAsTransfer(false);
            fetchAnimals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update animal');
        } finally {
            setSavingOwnerChange(false);
        }
    };

    // Lets the admin follow pedigree links (sire/dam/offspring) from inside the read-only view
    // modal, same as a real owner clicking through to a relative's page.
    const handleAdminViewAnimal = async (animal) => {
        if (!animal?.id_public) return;
        try {
            const response = await fetch(`${API_BASE_URL}/animals/any/${animal.id_public}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to load animal');
            const data = await response.json();
            setSelectedAnimal(data.animal || data);
        } catch (err) {
            console.error('Failed to load linked animal:', err);
            setError('Failed to load linked animal');
        }
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
            setShowHideConfirm(false);
            setActionReason('');
            fetchAnimals();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to hide animal');
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
        if (animal.creatorId?.personalName) {
            return `${animal.creatorId.personalName} (${animal.creatorId.id_public || animal.creatorId.email})`;
        }
        return animal.creatorId?.email || animal.creatorId_public || 'Unknown';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
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
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '14px'
                            }}
                        >
                            <span style={{ color: ownerFilter ? '#111827' : '#6b7280' }}>
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
                                border: '1px solid #d1d5db',
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
                                        borderBottom: '1px solid #f3f4f6',
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
                                                borderBottom: '1px solid #f3f4f6',
                                                backgroundColor: ownerFilter === user.id_public ? '#f3f4f6' : '#fff',
                                                fontSize: '14px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = ownerFilter === user.id_public ? '#f3f4f6' : '#fff'}
                                        >
                                            <div style={{ fontWeight: '500' }}>
                                                {user.personalName || user.username || user.email}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
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
                                            {animal.creatorId?.personalName || animal.creatorId?.email?.split('@')[0] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>{animal.status || '-'}</td>
                                    <td>
                                        {animal.isDisplay ? (
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
                                        {animal.isDisplay && (
                                            <button
                                                onClick={() => { setSelectedAnimal(animal); setActionReason(''); setShowHideConfirm(true); }}
                                                title="Hide from Public"
                                                className="action-btn"
                                            >
                                                <EyeOff size={16} />
                                            </button>
                                        )}
                                        {['admin', 'moderator'].includes(userRole) && (
                                            <button
                                                onClick={() => { setSelectedAnimal(animal); setActionReason(''); setShowDeleteConfirm(true); }}
                                                title="Delete Animal"
                                                className="action-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
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

            {/* Detail Modal (Eye icon) — the real AnimalModalV2, same component a user sees when
                clicking their own animal, with the mutating action props (edit/archive/transfer/
                add sibling) omitted so it renders as a faithful read-only replica for admins. */}
            {showDetailModal && selectedAnimal && (
                <AnimalModalV2
                    animal={selectedAnimal}
                    onClose={() => { setShowDetailModal(false); setSelectedAnimal(null); }}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                    onViewAnimal={handleAdminViewAnimal}
                    onUpdateAnimal={() => {}}
                    onToggleOwned={() => {}}
                    userProfile={null}
                    handleReturnTransferredAnimal={() => {}}
                    handleWithdrawTransfer={() => {}}
                    handleAcceptTransfer={() => {}}
                    handleRejectTransfer={() => {}}
                    breedingLineDefs={[]}
                    animalBreedingLines={{}}
                    toggleAnimalBreedingLine={undefined}
                    setAnimalBreedingLinesDirect={() => {}}
                    setShowImageModal={setShowImageModal}
                    setEnlargedImageUrl={setEnlargedImageUrl}
                />
            )}

            {/* Simple image lightbox for the read-only detail view's gallery, mirroring the
                enlarge-on-click behavior the real app provides via app.jsx. */}
            {showImageModal && enlargedImageUrl && (
                <div
                    className="animal-modal-overlay"
                    style={{ zIndex: 90 }}
                    onClick={() => setShowImageModal(false)}
                >
                    <img
                        src={enlargedImageUrl}
                        alt=""
                        style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Hide Confirmation */}
            {showHideConfirm && selectedAnimal && (
                <div className="animal-modal-overlay" onClick={() => setShowHideConfirm(false)}>
                    <div className="animal-modal confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header">
                            <h3><EyeOff size={20} /> Hide from Public</h3>
                        </div>
                        <div className="animal-modal-body">
                            <p className="confirm-animal">
                                <strong>{selectedAnimal.name}</strong> ({selectedAnimal.id_public})
                            </p>
                            <div className="form-row full-width">
                                <label>Reason for Hiding *</label>
                                <input
                                    type="text"
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    placeholder="Why is this animal being hidden from public view?"
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowHideConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={() => handleHideAnimal(selectedAnimal)}>
                                    Hide Animal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Edit icon) — the real AnimalFormModalV2, same form a user sees when
                clicking Edit on their own animal, but with its Save button relabeled "Continue".
                Clicking it doesn't save anything yet — handleAdminContinueEdit diffs the built
                payload and hands off to the owner-change + reason screen below. */}
            {showEditModal && selectedAnimal && !showOwnerChangeScreen && (
                <AnimalFormModalV2
                    formTitle={`Edit ${selectedAnimal.name} (Admin)`}
                    animalToEdit={selectedAnimal}
                    species={selectedAnimal.species}
                    onSave={handleAdminContinueEdit}
                    onCancel={handleAdminEditCancel}
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    showModalMessage={(title, message) => setError(`${title}: ${message}`)}
                    userProfile={null}
                    submitLabel="Continue"
                    submitIcon={<ArrowRight size={18} />}
                />
            )}

            {/* Owner-change + reason screen — the "second screen" reached via Continue. Lets the
                admin quick-change the animal's owner (optional) and requires a reason before the
                field edits (and any owner change) are actually persisted together in one save. */}
            {showOwnerChangeScreen && selectedAnimal && (
                <div className="animal-modal-overlay" onClick={() => { if (!savingOwnerChange) { setShowEditModal(false); setShowOwnerChangeScreen(false); setSelectedAnimal(null); } }}>
                    <div className="animal-modal confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="animal-modal-header">
                            <h3><Edit size={20} /> Confirm Changes: {selectedAnimal.name}</h3>
                        </div>
                        <div className="animal-modal-body">
                            {pendingFieldEdits && Object.keys(pendingFieldEdits).length > 0 ? (
                                <p className="confirm-note">
                                    {Object.keys(pendingFieldEdits).length} field{Object.keys(pendingFieldEdits).length === 1 ? '' : 's'} will be updated.
                                </p>
                            ) : (
                                <p className="confirm-note">No field changes were made — you can still change the owner below.</p>
                            )}

                            <div className="form-section">
                                <h4 className="section-title">Owner</h4>
                                <div className="form-row full-width">
                                    <label>Current Owner</label>
                                    <div className="owner-selector">
                                        <span className="selected-owner">
                                            {selectedNewOwner
                                                ? `${selectedNewOwner.personalName || selectedNewOwner.username || selectedNewOwner.email} (${selectedNewOwner.id_public}) — new`
                                                : getAnimalOwnerDisplay(selectedAnimal)}
                                        </span>
                                        {selectedNewOwner && (
                                            <div className="owner-actions">
                                                <button type="button" className="btn-small" onClick={() => setSelectedNewOwner(null)}>Undo</button>
                                            </div>
                                        )}
                                    </div>
                                    {!selectedNewOwner && (
                                        <div className="user-search">
                                            <input
                                                type="text"
                                                placeholder="Search users to reassign owner (leave blank to keep current owner)..."
                                                value={newOwnerQuery}
                                                onChange={(e) => searchNewOwner(e.target.value)}
                                            />
                                            {newOwnerResults.length > 0 && (
                                                <div className="search-results">
                                                    {newOwnerResults.map(user => (
                                                        <div key={user._id} className="search-result-item" onClick={() => selectNewOwner(user)}>
                                                            <span>{user.personalName || user.username || user.email}</span>
                                                            <span className="user-id">{user.id_public}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedNewOwner && (
                                    <div className="form-row full-width checkbox-row">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={treatAsTransfer}
                                                onChange={(e) => setTreatAsTransfer(e.target.checked)}
                                            />
                                            Treat as a full transfer (previous owner keeps view-only access via
                                            their Sold Animals archive, and becomes the animal's permanent
                                            Original Creator if not already set)
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="form-row full-width">
                                <label>Reason for Change *</label>
                                <input
                                    type="text"
                                    value={ownerChangeReason}
                                    onChange={(e) => setOwnerChangeReason(e.target.value)}
                                    placeholder="Why are these changes being made?"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn-secondary"
                                    disabled={savingOwnerChange}
                                    onClick={() => { setShowEditModal(false); setShowOwnerChangeScreen(false); setSelectedAnimal(null); }}
                                >
                                    <ArrowLeft size={14} /> Cancel
                                </button>
                                <button className="btn-primary" disabled={savingOwnerChange} onClick={handleFinalAdminSave}>
                                    <Save size={14} /> {savingOwnerChange ? 'Saving...' : 'Save'}
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
