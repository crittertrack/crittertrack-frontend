import React, { useState, useEffect } from 'react';
import { 
    PawPrint, RefreshCw, Search, Plus, Trash2, X, 
    AlertCircle, Loader2, Tag, Edit2, Save, Database
} from 'lucide-react';
import './SpeciesManagementTab.css';

const CATEGORIES = ['Rodent', 'Reptile', 'Bird', 'Fish', 'Amphibian', 'Mammal', 'Invertebrate', 'Other'];

const SpeciesManagementTab = ({ API_BASE_URL, authToken }) => {
    const [species, setSpecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showDefaultOnly, setShowDefaultOnly] = useState(false);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form states
    const [newSpecies, setNewSpecies] = useState({ name: '', latinName: '', category: 'Rodent', isDefault: false });
    const [editForm, setEditForm] = useState({ name: '', latinName: '', category: '', isDefault: false });

    // Fetch species
    const fetchSpecies = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch species');
            
            const data = await response.json();
            setSpecies(data);
        } catch (err) {
            console.error('Error fetching species:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken) fetchSpecies();
    }, [authToken, API_BASE_URL]);

    // Add new species
    const handleAddSpecies = async () => {
        if (!newSpecies.name.trim()) {
            alert('Species name is required');
            return;
        }
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(newSpecies)
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add species');
            }
            
            await fetchSpecies();
            setShowAddModal(false);
            setNewSpecies({ name: '', latinName: '', category: 'Rodent', isDefault: false });
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Delete species
    const handleDeleteSpecies = async (speciesId, speciesName, animalCount) => {
        if (animalCount > 0) {
            alert(`Cannot delete: ${animalCount} animals are using this species`);
            return;
        }
        
        if (!window.confirm(`Delete "${speciesName}"? This cannot be undone.`)) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species/${speciesId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to delete');
            }
            
            await fetchSpecies();
        } catch (err) {
            alert(err.message);
        }
    };

    // Open edit modal
    const openEditModal = (speciesItem) => {
        setSelectedSpecies(speciesItem);
        setEditForm({
            name: speciesItem.name || '',
            latinName: speciesItem.latinName || '',
            category: speciesItem.category || 'Other',
            isDefault: speciesItem.isDefault || false
        });
        setShowEditModal(true);
    };

    // Save species edits
    const handleSaveSpecies = async () => {
        if (!selectedSpecies || !editForm.name.trim()) {
            alert('Species name is required');
            return;
        }
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species/${selectedSpecies._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: editForm.name.trim(),
                    latinName: editForm.latinName?.trim() || null,
                    category: editForm.category,
                    isDefault: editForm.isDefault
                })
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update species');
            }
            
            await fetchSpecies();
            setShowEditModal(false);
            setSelectedSpecies(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Filter species
    const filteredSpecies = species.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.latinName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
        const matchesDefault = !showDefaultOnly || s.isDefault;
        return matchesSearch && matchesCategory && matchesDefault;
    });

    // Stats
    const stats = {
        total: species.length,
        defaults: species.filter(s => s.isDefault).length,
        userCreated: species.filter(s => !s.isDefault).length
    };

    if (loading && species.length === 0) {
        return (
            <div className="species-loading">
                <Loader2 className="spin" size={32} />
                <p>Loading species...</p>
            </div>
        );
    }

    return (
        <div className="species-management-tab">
            <div className="species-header">
                <div className="species-title">
                    <PawPrint size={28} />
                    <div>
                        <h2>Species Management</h2>
                        <p>View and manage species available in the system</p>
                    </div>
                </div>
                <div className="species-header-actions">
                    <button className="species-btn species-btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Add Species
                    </button>
                    <button className="species-btn species-btn-secondary" onClick={fetchSpecies} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="species-stats-grid">
                <div className="species-stat-card">
                    <Database size={24} />
                    <div>
                        <div className="species-stat-value">{stats.total}</div>
                        <div className="species-stat-label">Total Species</div>
                    </div>
                </div>
                <div className="species-stat-card species-stat-blue">
                    <Tag size={24} />
                    <div>
                        <div className="species-stat-value">{stats.defaults}</div>
                        <div className="species-stat-label">Default Species</div>
                    </div>
                </div>
                <div className="species-stat-card species-stat-green">
                    <Plus size={24} />
                    <div>
                        <div className="species-stat-value">{stats.userCreated}</div>
                        <div className="species-stat-label">User Created</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="species-filters">
                <div className="species-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search species..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="species-select"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <label className="species-checkbox-label">
                    <input
                        type="checkbox"
                        checked={showDefaultOnly}
                        onChange={(e) => setShowDefaultOnly(e.target.checked)}
                    />
                    Default only
                </label>
            </div>

            {error && (
                <div className="species-error-banner">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Species List */}
            <div className="species-list">
                {filteredSpecies.length === 0 ? (
                    <div className="species-empty-state">
                        <PawPrint size={48} />
                        <h3>No species found</h3>
                        <p>{searchTerm ? 'Try adjusting your search' : 'Add your first species'}</p>
                    </div>
                ) : (
                    filteredSpecies.map(s => (
                        <div key={s._id} className="species-card">
                            <div className="species-card-main">
                                <div className="species-card-info">
                                    <div className="species-name-row">
                                        <h3>{s.name}</h3>
                                        {s.isDefault && <span className="species-badge species-badge-default">Default</span>}
                                        {!s.isDefault && <span className="species-badge species-badge-user">User Added</span>}
                                    </div>
                                    {s.latinName && <p className="species-latin">{s.latinName}</p>}
                                    <div className="species-meta">
                                        <span className="species-category">{s.category}</span>
                                        <span className="species-count">{s.animalCount} animals</span>
                                    </div>
                                </div>
                                <div className="species-card-actions">
                                    <button 
                                        className="species-action-btn"
                                        onClick={() => openEditModal(s)}
                                        title="Edit species"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        className="species-action-btn species-action-delete"
                                        onClick={() => handleDeleteSpecies(s._id, s.name, s.animalCount)}
                                        title="Delete species"
                                        disabled={s.animalCount > 0 || s.isDefault}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Species Modal */}
            {showAddModal && (
                <div className="species-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="species-modal" onClick={e => e.stopPropagation()}>
                        <div className="species-modal-header">
                            <h3>Add New Species</h3>
                            <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>
                        <div className="species-modal-body">
                            <div className="species-form-group">
                                <label>Species Name *</label>
                                <input
                                    type="text"
                                    value={newSpecies.name}
                                    onChange={(e) => setNewSpecies(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Guinea Pig"
                                />
                            </div>
                            <div className="species-form-group">
                                <label>Latin Name</label>
                                <input
                                    type="text"
                                    value={newSpecies.latinName}
                                    onChange={(e) => setNewSpecies(prev => ({ ...prev, latinName: e.target.value }))}
                                    placeholder="e.g., Cavia porcellus"
                                />
                            </div>
                            <div className="species-form-group">
                                <label>Category *</label>
                                <select
                                    value={newSpecies.category}
                                    onChange={(e) => setNewSpecies(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="species-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={newSpecies.isDefault}
                                    onChange={(e) => setNewSpecies(prev => ({ ...prev, isDefault: e.target.checked }))}
                                />
                                Mark as default species
                            </label>
                        </div>
                        <div className="species-modal-footer">
                            <button className="species-btn species-btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="species-btn species-btn-primary" onClick={handleAddSpecies} disabled={saving}>
                                {saving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                                Add Species
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedSpecies && (
                <div className="species-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="species-modal" onClick={e => e.stopPropagation()}>
                        <div className="species-modal-header">
                            <h3>Edit Species</h3>
                            <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <div className="species-modal-body">
                            <div className="species-form-group">
                                <label>Species Name *</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Guinea Pig"
                                />
                            </div>
                            <div className="species-form-group">
                                <label>Latin Name</label>
                                <input
                                    type="text"
                                    value={editForm.latinName}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, latinName: e.target.value }))}
                                    placeholder="e.g., Cavia porcellus"
                                />
                            </div>
                            <div className="species-form-group">
                                <label>Category *</label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <label className="species-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={editForm.isDefault}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                />
                                Mark as default species
                            </label>
                            <div className="species-info-row">
                                <span className="species-info-label">Animals using this species:</span>
                                <span className="species-info-value">{selectedSpecies.animalCount || 0}</span>
                            </div>
                            <div className="species-info-row">
                                <span className="species-info-label">Created:</span>
                                <span className="species-info-value">{selectedSpecies.createdAt ? new Date(selectedSpecies.createdAt).toLocaleDateString() : 'Unknown'}</span>
                            </div>
                        </div>
                        <div className="species-modal-footer">
                            <button className="species-btn species-btn-secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button className="species-btn species-btn-primary" onClick={handleSaveSpecies} disabled={saving}>
                                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeciesManagementTab;