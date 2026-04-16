import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    X, PlusCircle, ArrowLeft, Save, Trash2, RotateCcw, Loader2, Edit,
    Heart, Check, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
    Plus, Search, FileText, Clock, AlertCircle, MapPin
} from 'lucide-react';

const AnimalForm = ({ 
    formTitle,             
    animalToEdit,          
    species,               
    onSave, 
    onCancel, 
    onDelete,              
    authToken,
    showModalMessage, 
    API_BASE_URL,          
    userProfile,           
    speciesConfigs,        
    X: XIcon, 
    Search: SearchIcon, 
    Loader2: Loader2Icon, 
    LoadingSpinner,
    PlusCircle: PlusCircleIcon,
    ArrowLeft: ArrowLeftIcon,
    Save: SaveIcon,
    Trash2: Trash2Icon,
    RotateCcw: RotateCcwIcon,
    GENDER_OPTIONS,
    STATUS_OPTIONS,
    AnimalImageUpload
}) => {
    const [fieldTemplate, setFieldTemplate] = useState(null);
    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [enclosureOptions, setEnclosureOptions] = useState([]);
    
    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            breederAssignedId: animalToEdit.breederAssignedId || animalToEdit.breederyId || animalToEdit.registryCode || '',
            prefix: animalToEdit.prefix || '',
            suffix: animalToEdit.suffix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || (GENDER_OPTIONS?.[0] || 'Unknown'),
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            deceasedDate: animalToEdit.deceasedDate ? new Date(animalToEdit.deceasedDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
            earset: animalToEdit.earset || '',
            remarks: animalToEdit.remarks || '',
            tags: animalToEdit.tags || [],
            fatherId_public: animalToEdit.fatherId_public || null,
            motherId_public: animalToEdit.motherId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            keeperName: animalToEdit.keeperName || animalToEdit.ownerName || '',
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
        } : {
            species: species, 
            breederAssignedId: '',
            prefix: '',
            suffix: '',
            name: '',
            gender: 'Unknown',
            birthDate: '',
            deceasedDate: '',
            status: 'Pet',
            color: '',
            coat: '',
            earset: '',
            remarks: '',
            tags: [],
            fatherId_public: null,
            motherId_public: null,
            breederId_public: null,
            keeperName: '',
            isOwned: true,
            isDisplay: true,
        }
    );

    useEffect(() => {
        if (!formData.species) return;
        const fetchFieldTemplate = async () => {
            try {
                setLoadingTemplate(true);
                const response = await axios.get(
                    `${API_BASE_URL}/species/with-template/${encodeURIComponent(formData.species)}`
                );
                if (response.data?.fieldTemplate) {
                    setFieldTemplate(response.data.fieldTemplate);
                } else {
                    setFieldTemplate(null);
                }
            } catch (error) {
                console.error('[AnimalForm] Error fetching field template:', error);
                setFieldTemplate(null);
            } finally {
                setLoadingTemplate(false);
            }
        };
        fetchFieldTemplate();
    }, [formData.species, API_BASE_URL]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            if (name === 'deceasedDate' && value) {
                updated.status = 'Deceased';
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSave) {
            await onSave('put', `${API_BASE_URL}/animals/${animalToEdit?.id_public}`, formData);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <span>
                    <PlusCircle size={24} className="inline mr-2 text-primary" /> 
                    {formTitle}
                </span>
                <button 
                    onClick={onCancel} 
                    className="text-gray-500 hover:text-gray-700 transition p-2 rounded-lg"
                >
                    <ArrowLeft size={24} />
                </button>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Identity</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name*</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender*</label>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            >
                                {GENDER_OPTIONS && GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status*</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            >
                                {STATUS_OPTIONS && STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        Save
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnimalForm;
