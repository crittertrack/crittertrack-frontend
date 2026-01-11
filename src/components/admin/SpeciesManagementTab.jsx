import React, { useState, useEffect } from 'react';
import { 
    PawPrint, RefreshCw, Search, Plus, Edit2, Trash2, Save, X, 
    AlertCircle, CheckCircle, Loader2, Settings, ChevronDown, ChevronUp,
    Tag, Hash, FileText, Eye, EyeOff, Database
} from 'lucide-react';
import './SpeciesManagementTab.css';

const CATEGORIES = ['Rodent', 'Reptile', 'Bird', 'Fish', 'Amphibian', 'Mammal', 'Invertebrate', 'Other'];

const DEFAULT_FIELDS = [
    'Coat Color', 'Eye Color', 'Ear Type', 'Markings', 'Pattern',
    'Scale Type', 'Feather Color', 'Fin Type', 'Size', 'Weight',
    'Date of Birth', 'Breeder', 'Notes', 'Genetic Code'
];

const SpeciesManagementTab = ({ API_BASE_URL, authToken }) => {
    const [species, setSpecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showDefaultOnly, setShowDefaultOnly] = useState(false);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form states
    const [newSpecies, setNewSpecies] = useState({ name: '', latinName: '', category: 'Rodent', isDefault: false });
    const [speciesConfig, setSpeciesConfig] = useState({
        fieldReplacements: {},
        customFields: [],
        hiddenFields: [],
        adminNotes: ''
    });

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

    // Open config modal
    const openConfigModal = async (speciesItem) => {
        setSelectedSpecies(speciesItem);
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species-config/${encodeURIComponent(speciesItem.name)}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.ok) {
                const config = await response.json();
                setSpeciesConfig({
                    fieldReplacements: config.fieldReplacements || {},
                    customFields: config.customFields || [],
                    hiddenFields: config.hiddenFields || [],
                    adminNotes: config.adminNotes || ''
                });
            }
        } catch (err) {
            console.error('Error fetching config:', err);
        }
        
        setShowConfigModal(true);
    };

    // Save species config
    const handleSaveConfig = async () => {
        if (!selectedSpecies) return;
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species-config/${encodeURIComponent(selectedSpecies.name)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(speciesConfig)
            });
            
            if (!response.ok) throw new Error('Failed to save config');
            
            await fetchSpecies();
            setShowConfigModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Update field replacement
    const updateFieldReplacement = (originalField, newLabel) => {
        setSpeciesConfig(prev => {
            const updated = { ...prev.fieldReplacements };
            if (newLabel.trim()) {
                updated[originalField] = newLabel.trim();
            } else {
                delete updated[originalField];
            }
            return { ...prev, fieldReplacements: updated };
        });
    };

    // Toggle hidden field
    const toggleHiddenField = (field) => {
        setSpeciesConfig(prev => {
            const hidden = prev.hiddenFields.includes(field)
                ? prev.hiddenFields.filter(f => f !== field)
                : [...prev.hiddenFields, field];
            return { ...prev, hiddenFields: hidden };
        });
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
        userCreated: species.filter(s => !s.isDefault).length,
        withConfig: species.filter(s => s.hasConfig).length
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
                        <p>Manage species, field labels, and custom configurations</p>
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
                <div className="species-stat-card species-stat-purple">
                    <Settings size={24} />
                    <div>
                        <div className="species-stat-value">{stats.withConfig}</div>
                        <div className="species-stat-label">With Custom Config</div>
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
                                        {s.hasConfig && <span className="species-badge species-badge-config">Configured</span>}
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
                                        onClick={() => openConfigModal(s)}
                                        title="Configure fields"
                                    >
                                        <Settings size={18} />
                                    </button>
                                    <button 
                                        className="species-action-btn species-action-delete"
                                        onClick={() => handleDeleteSpecies(s._id, s.name, s.animalCount)}
                                        title="Delete species"
                                        disabled={s.animalCount > 0}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            {s.config && Object.keys(s.config.fieldReplacements || {}).length > 0 && (
                                <div className="species-config-preview">
                                    <span className="config-preview-label">Field replacements:</span>
                                    {Object.entries(s.config.fieldReplacements).slice(0, 3).map(([orig, repl]) => (
                                        <span key={orig} className="config-preview-item">
                                            {orig} → {repl}
                                        </span>
                                    ))}
                                    {Object.keys(s.config.fieldReplacements).length > 3 && (
                                        <span className="config-preview-more">
                                            +{Object.keys(s.config.fieldReplacements).length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
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

            {/* Config Modal */}
            {showConfigModal && selectedSpecies && (
                <div className="species-modal-overlay" onClick={() => setShowConfigModal(false)}>
                    <div className="species-modal species-modal-large" onClick={e => e.stopPropagation()}>
                        <div className="species-modal-header">
                            <h3>Configure: {selectedSpecies.name}</h3>
                            <button onClick={() => setShowConfigModal(false)}><X size={20} /></button>
                        </div>
                        <div className="species-modal-body">
                            <div className="config-section">
                                <h4>Field Label Replacements</h4>
                                <p className="config-help">Customize field labels for this species. Leave empty to use default.</p>
                                <div className="config-fields-grid">
                                    {DEFAULT_FIELDS.map(field => (
                                        <div key={field} className="config-field-row">
                                            <div className="config-field-original">
                                                <span>{field}</span>
                                                <button
                                                    className={`config-visibility-btn ${speciesConfig.hiddenFields.includes(field) ? 'hidden' : ''}`}
                                                    onClick={() => toggleHiddenField(field)}
                                                    title={speciesConfig.hiddenFields.includes(field) ? 'Show field' : 'Hide field'}
                                                >
                                                    {speciesConfig.hiddenFields.includes(field) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            <span className="config-arrow">→</span>
                                            <input
                                                type="text"
                                                placeholder={field}
                                                value={speciesConfig.fieldReplacements[field] || ''}
                                                onChange={(e) => updateFieldReplacement(field, e.target.value)}
                                                disabled={speciesConfig.hiddenFields.includes(field)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="config-section">
                                <h4>Admin Notes</h4>
                                <textarea
                                    value={speciesConfig.adminNotes}
                                    onChange={(e) => setSpeciesConfig(prev => ({ ...prev, adminNotes: e.target.value }))}
                                    placeholder="Internal notes about this species configuration..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="species-modal-footer">
                            <button className="species-btn species-btn-secondary" onClick={() => setShowConfigModal(false)}>
                                Cancel
                            </button>
                            <button className="species-btn species-btn-primary" onClick={handleSaveConfig} disabled={saving}>
                                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeciesManagementTab;
