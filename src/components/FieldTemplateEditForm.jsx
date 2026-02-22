import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Field group mappings from UI_IMPLEMENTATION_PLAN.md
const FIELD_GROUPS = {
    CORE_UNIVERSAL: ['name', 'gender', 'status', 'birthDate', 'species', 'prefix', 'suffix', 'color', 'remarks'],
    VARIETY: {
        'Small Mammal Template': ['color', 'coatPattern', 'coat', 'earset'],
        'Full Mammal Template': ['color', 'coatPattern', 'coat', 'earset'],
        'Reptile Template': ['color', 'pattern', 'scaleType', 'scaleShed'],
        'Bird Template': ['color', 'coatPattern', 'featherType', 'crestType'],
        'Fish Template': ['color', 'pattern', 'finType', 'bodyShape'],
        'Amphibian Template': ['color', 'pattern', 'skinTexture', 'skinMoisture'],
        'Invertebrate Template': ['color', 'pattern', 'exoskeletonType', 'bodySegmentation'],
        'Other Template': ['color', 'coatPattern', 'coat', 'morph']
    },
    MARKINGS: {
        'Small Mammal Template': ['markings', 'eyeColor', 'nailColor'],
        'Full Mammal Template': ['markings', 'eyeColor', 'nailColor'],
        'Reptile Template': ['markings', 'eyeColor', 'scaleDamage'],
        'Bird Template': ['markings', 'eyeColor', 'beakColor', 'legColor'],
        'Fish Template': ['markings', 'eyeColor', 'finDamage'],
        'Amphibian Template': ['markings', 'eyeColor', 'skinDamage'],
        'Invertebrate Template': ['markings', 'eyeColor', 'limbDamage'],
        'Other Template': ['markings', 'eyeColor']
    }
};

const TAB_NAMES = [
    'Overview',
    'Status & Privacy',
    'Physical',
    'Identification',
    'Lineage',
    'Breeding',
    'Health',
    'Husbandry',
    'Behavior',
    'Records',
    'End of Life',
    'Legal & Documentation'
];

/**
 * Field Template Edit Form Component
 * Renders a tabbed edit form based on field templates with species-specific fields
 */
const FieldTemplateEditForm = ({ animal, onSave, onCancel, API_BASE_URL, authToken }) => {
    const [currentTab, setCurrentTab] = useState('Overview');
    const [formData, setFormData] = useState({ ...animal });
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    // Load field template on mount
    useEffect(() => {
        loadFieldTemplate();
    }, [animal.species]);

    const loadFieldTemplate = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/field-templates/species/${encodeURIComponent(animal.species)}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            const templateData = response.data;
            
            // Check if UI is enabled for this template
            if (!templateData.uiEnabled || templateData.fallbackToLegacy) {
                // Fall back to legacy UI
                setError('Field template UI not enabled for this species yet');
                setTemplate(null);
            } else {
                setTemplate(templateData);
            }
        } catch (err) {
            console.error('Failed to load field template:', err);
            setError('Failed to load field template');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (onSave) {
            await onSave(formData);
        }
    };

    const handleCancel = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return;
        }
        if (onCancel) {
            onCancel();
        }
    };

    // Get fields for current tab
    const getFieldsForTab = (tabName) => {
        if (!template) return [];
        return template.fields.filter(field => field.enabled && field.tab === tabName);
    };

    // Render individual field
    const renderField = (field) => {
        const value = formData[field.fieldName] || '';
        
        return (
            <div key={field.fieldName} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                />
            </div>
        );
    };

    // Render variety group (special grouped display)
    const renderVarietyGroup = () => {
        const templateName = template?.name;
        const varietyFields = FIELD_GROUPS.VARIETY[templateName] || [];
        const fields = template.fields.filter(f => 
            varietyFields.includes(f.fieldName) && f.enabled
        );

        if (fields.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">
                    Variety
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {fields.map(field => (
                        <div key={field.fieldName}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                value={formData[field.fieldName] || ''}
                                onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render tab content
    const renderTabContent = () => {
        if (!template) return null;

        const fields = getFieldsForTab(currentTab);
        const varietyFields = FIELD_GROUPS.VARIETY[template.name] || [];
        const nonVarietyFields = fields.filter(f => !varietyFields.includes(f.fieldName));

        if (currentTab === 'Overview') {
            return (
                <div className="space-y-4">
                    {renderVarietyGroup()}
                    {nonVarietyFields.map(renderField)}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {fields.map(renderField)}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Loading field template...</div>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                    {error || 'Field template not available. Please use the standard edit form.'}
                </p>
            </div>
        );
    }

    return (
        <div className="field-template-edit-form">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
                <div className="flex overflow-x-auto">
                    {TAB_NAMES.map(tabName => {
                        const fieldCount = getFieldsForTab(tabName).length;
                        if (fieldCount === 0) return null; // Hide tabs with no fields
                        
                        return (
                            <button
                                key={tabName}
                                onClick={() => setCurrentTab(tabName)}
                                className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                                    currentTab === tabName
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                                }`}
                            >
                                {tabName}
                                <span className="ml-1 text-xs text-gray-500">({fieldCount})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content max-h-96 overflow-y-auto p-4">
                {renderTabContent()}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default FieldTemplateEditForm;
