import React, { useState, useEffect } from 'react';
import { 
    Layers, Plus, Edit2, Copy, Trash2, Save, X, 
    AlertCircle, Loader2, CheckCircle, FileText
} from 'lucide-react';
import './FieldTemplateManagement.css';

const FieldTemplateManagement = ({ API_BASE_URL, authToken }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create', 'clone'
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fields: getDefaultFields()
    });

    // Default field configuration
    function getDefaultFields() {
        return {
            name: true,
            sex: true,
            birthDate: true,
            deathDate: true,
            status: true,
            strain: { enabled: false, label: 'Strain', required: false },
            geneticCode: { enabled: true, label: 'Genetic Code', required: false },
            phenotype: { enabled: true, label: 'Phenotype', required: false },
            morph: { enabled: false, label: 'Morph', required: false },
            color: { enabled: true, label: 'Color', required: false },
            markings: { enabled: true, label: 'Markings', required: false },
            weight: { enabled: true, label: 'Weight', required: false },
            length: { enabled: false, label: 'Length', required: false },
            breedingStatus: { enabled: true, label: 'Breeding Status', required: false },
            registrationNumber: { enabled: true, label: 'Registration #', required: false },
            microchipNumber: { enabled: false, label: 'Microchip #', required: false },
            temperament: { enabled: true, label: 'Temperament', required: false },
            notes: { enabled: true, label: 'Notes', required: false }
        };
    }

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/field-templates`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch templates');
            
            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, template = null) => {
        setModalMode(mode);
        setSelectedTemplate(template);
        
        if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                fields: getDefaultFields()
            });
        } else if (mode === 'edit' && template) {
            setFormData({
                name: template.name,
                description: template.description || '',
                fields: { ...getDefaultFields(), ...template.fields }
            });
        } else if (mode === 'clone' && template) {
            setFormData({
                name: `${template.name} (Copy)`,
                description: template.description || '',
                fields: { ...template.fields }
            });
        } else if (mode === 'view' && template) {
            setFormData({
                name: template.name,
                description: template.description || '',
                fields: template.fields
            });
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTemplate(null);
        setSaving(false);
    };

    const handleFieldToggle = (fieldName) => {
        setFormData(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldName]: typeof prev.fields[fieldName] === 'boolean' 
                    ? !prev.fields[fieldName]
                    : { ...prev.fields[fieldName], enabled: !prev.fields[fieldName].enabled }
            }
        }));
    };

    const handleFieldLabelChange = (fieldName, label) => {
        setFormData(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldName]: { ...prev.fields[fieldName], label }
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let url = `${API_BASE_URL}/field-templates`;
            let method = 'POST';
            
            if (modalMode === 'edit') {
                url = `${API_BASE_URL}/field-templates/${selectedTemplate._id}`;
                method = 'PUT';
            } else if (modalMode === 'clone') {
                url = `${API_BASE_URL}/field-templates/${selectedTemplate._id}/clone`;
                method = 'POST';
            }
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save template');
            }
            
            await fetchTemplates();
            closeModal();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (templateId) => {
        if (!window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/field-templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to delete template');
            }
            
            await fetchTemplates();
        } catch (err) {
            alert(err.message);
        }
    };

    const renderFieldEditor = (fieldName, fieldConfig) => {
        const isBasicField = typeof fieldConfig === 'boolean';
        const isEnabled = isBasicField ? fieldConfig : fieldConfig.enabled;
        const label = isBasicField ? fieldName : fieldConfig.label;
        const isReadOnly = modalMode === 'view' || ['name', 'sex', 'birthDate', 'deathDate', 'status'].includes(fieldName);
        
        return (
            <div key={fieldName} className={`field-editor-row ${isReadOnly ? 'read-only' : ''}`}>
                <div className="field-checkbox">
                    <input 
                        type="checkbox" 
                        id={`field-${fieldName}`}
                        checked={isEnabled}
                        onChange={() => handleFieldToggle(fieldName)}
                        disabled={isReadOnly || modalMode === 'view'}
                    />
                    <label htmlFor={`field-${fieldName}`} className="field-name">
                        {fieldName}
                        {isReadOnly && <span className="required-badge">Required</span>}
                    </label>
                </div>
                {!isBasicField && (
                    <input 
                        type="text"
                        value={label}
                        onChange={(e) => handleFieldLabelChange(fieldName, e.target.value)}
                        placeholder="Field label"
                        className="field-label-input"
                        disabled={modalMode === 'view' || !isEnabled}
                    />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={32} />
                <p>Loading field templates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <AlertCircle size={32} color="red" />
                <p>Error: {error}</p>
                <button onClick={fetchTemplates} className="btn-retry">Retry</button>
            </div>
        );
    }

    return (
        <div className="field-template-management">
            <div className="header">
                <div className="header-left">
                    <Layers size={24} />
                    <h2>Field Template Management</h2>
                </div>
                <button onClick={() => openModal('create')} className="btn-primary">
                    <Plus size={18} />
                    Create New Template
                </button>
            </div>

            <div className="templates-grid">
                {templates.map(template => (
                    <div key={template._id} className={`template-card ${template.isDefault ? 'default-template' : ''}`}>
                        <div className="template-header">
                            <h3>{template.name}</h3>
                            {template.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        
                        {template.description && (
                            <p className="template-description">{template.description}</p>
                        )}
                        
                        <div className="template-stats">
                            <span className="stat">
                                <FileText size={14} />
                                {Object.values(template.fields).filter(f => 
                                    typeof f === 'boolean' ? f : f.enabled
                                ).length} fields enabled
                            </span>
                            <span className="stat">v{template.version}</span>
                        </div>
                        
                        <div className="template-actions">
                            <button 
                                onClick={() => openModal('view', template)} 
                                className="btn-secondary"
                                title="View details"
                            >
                                <FileText size={16} />
                                View
                            </button>
                            {!template.isDefault && (
                                <button 
                                    onClick={() => openModal('edit', template)} 
                                    className="btn-secondary"
                                    title="Edit template"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                            )}
                            <button 
                                onClick={() => openModal('clone', template)} 
                                className="btn-secondary"
                                title="Clone template"
                            >
                                <Copy size={16} />
                                Clone
                            </button>
                            {!template.isDefault && (
                                <button 
                                    onClick={() => handleDelete(template._id)} 
                                    className="btn-danger"
                                    title="Delete template"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalMode === 'create' && 'Create New Template'}
                                {modalMode === 'edit' && 'Edit Template'}
                                {modalMode === 'clone' && 'Clone Template'}
                                {modalMode === 'view' && 'View Template'}
                            </h3>
                            <button onClick={closeModal} className="btn-close">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Template Name</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Custom Mammal Template"
                                    disabled={modalMode === 'view'}
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what this template is used for..."
                                    disabled={modalMode === 'view'}
                                    className="form-textarea"
                                    rows="2"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Field Configuration</label>
                                <p className="help-text">
                                    Select which fields should be available for this template. 
                                    Some fields (name, sex, dates) are always required.
                                </p>
                                <div className="fields-editor">
                                    {Object.entries(formData.fields).map(([fieldName, fieldConfig]) => 
                                        renderFieldEditor(fieldName, fieldConfig)
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button onClick={closeModal} className="btn-secondary" disabled={saving}>
                                Cancel
                            </button>
                            {modalMode !== 'view' && (
                                <button onClick={handleSave} className="btn-primary" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Template
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldTemplateManagement;
