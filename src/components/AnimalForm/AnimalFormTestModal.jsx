import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft, ClipboardList, Dna, FileText, Home, Hospital, Images,
    Lock, Palette, PlusCircle, Save, Tag, Trash2, TreeDeciduous, Egg, Brain, Trophy, FileCheck, Scale, X, User, Heart, Eye, EyeOff,
    Hash, Sparkles, Ruler, Sprout, Key, FolderOpen, Globe, Leaf, Microscope, Stethoscope, UtensilsCrossed, Droplets,
    Thermometer, Feather, Medal, Target, Ban, Package, ScrollText, Link, Unlink, Baby, Bell, Plus, RotateCcw, Camera, Upload, Search,
    Loader2, ChevronDown, ChevronRight
} from 'lucide-react';
import DatePicker from '../DatePicker';
import AnimalImageUpload from '../AnimalImageUpload';
import GeneticCodeBuilder from '../GeneticCodeBuilder';
import { FamilyTabContent } from '../AnimalDetail/FamilyTabContent';

const AnimalFormTestModal = ({
    formTitle = "Create New Animal",
    animalToEdit,
    species,
    initialValues,
    onSave,
    onCancel,
    onDelete,
    authToken,
    API_BASE_URL,
    showModalMessage,
    userProfile,
    speciesConfigs,
    GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Unknown'],
    STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Retired', 'Deceased', 'Rehomed', 'Unknown']
}) => {
    const [activeTab, setActiveTab] = useState(2);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState(
        animalToEdit ? {
            species: animalToEdit.species,
            breederAssignedId: animalToEdit.breederAssignedId || '',
            prefix: animalToEdit.prefix || '',
            suffix: animalToEdit.suffix || '',
            name: animalToEdit.name || '',
            gender: animalToEdit.gender || 'Unknown',
            birthDate: animalToEdit.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
            deceasedDate: animalToEdit.deceasedDate ? new Date(animalToEdit.deceasedDate).toISOString().substring(0, 10) : '',
            status: animalToEdit.status || 'Pet',
            color: animalToEdit.color || '',
            coat: animalToEdit.coat || '',
            earset: animalToEdit.earset || '',
            remarks: animalToEdit.remarks || '',
            tags: animalToEdit.tags || [],
            geneticCode: animalToEdit.geneticCode || '',
            fatherId_public: animalToEdit.fatherId_public || animalToEdit.sireId_public || null,
            motherId_public: animalToEdit.motherId_public || animalToEdit.damId_public || null,
            breederId_public: animalToEdit.breederId_public || null,
            manualBreederName: animalToEdit.manualBreederName || '',
            ownerName: animalToEdit.ownerName || '',
            isOwned: animalToEdit.isOwned ?? true,
            isDisplay: animalToEdit.isDisplay ?? false,
            coOwnership: animalToEdit.coOwnership || '',
            isForSale: animalToEdit.isForSale || false,
            salePriceCurrency: animalToEdit.salePriceCurrency || 'USD',
            salePriceAmount: animalToEdit.salePriceAmount || '',
            availableForBreeding: animalToEdit.availableForBreeding || false,
            studFeeCurrency: animalToEdit.studFeeCurrency || 'USD',
            studFeeAmount: animalToEdit.studFeeAmount || '',
            // Add all other fields from the original form
            ...animalToEdit
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
            geneticCode: '',
            fatherId_public: null,
            motherId_public: null,
            breederId_public: null,
            manualBreederName: '',
            ownerName: '',
            isOwned: true,
            isDisplay: true,
            coOwnership: '',
            isForSale: false,
            salePriceCurrency: 'USD',
            salePriceAmount: '',
            availableForBreeding: false,
            studFeeCurrency: 'USD',
            studFeeAmount: '',
            // Add all other fields with default values
            ...(initialValues || {}),
        }
    );

    const [animalImageFile, setAnimalImageFile] = useState(null);
    const [animalImagePreview, setAnimalImagePreview] = useState(animalToEdit?.imageUrl || animalToEdit?.photoUrl || null);
    const [deleteImage, setDeleteImage] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'deceasedDate' && value) {
                updated.status = 'Deceased';
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const missingFields = [];
        if (!formData.name?.trim()) missingFields.push('Name (Overview tab)');
        if (!formData.species?.trim()) missingFields.push('Species (Overview tab)');
        if (!formData.gender?.trim()) missingFields.push('Gender (Overview tab)');
        if (!formData.status?.trim()) missingFields.push('Status (Overview tab)');

        if (missingFields.length > 0) {
            showModalMessage('Required Fields Missing', `Please fill in the following required fields:\n\n· ${missingFields.join('\n· ')}`);
            setLoading(false);
            return;
        }

        const method = animalToEdit ? 'put' : 'post';
        const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit.id_public}` : `${API_BASE_URL}/animals`;

        try {
            let uploadedFilename = null;
            if (animalImageFile) {
                const fd = new FormData();
                fd.append('file', animalImageFile);
                fd.append('type', 'animal');
                const uploadResp = await axios.post(`${API_BASE_URL}/upload`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` }
                });
                if (uploadResp?.data?.url) {
                    formData.imageUrl = uploadResp.data.url;
                }
                if (uploadResp?.data?.filename) {
                    uploadedFilename = uploadResp.data.filename;
                }
            }

            const payloadToSave = { ...formData };
            if (deleteImage && animalToEdit) {
                payloadToSave.imageUrl = null;
                payloadToSave.photoUrl = null;
            }

            await onSave(method, url, payloadToSave);

            if (!animalToEdit) {
                window.dispatchEvent(new Event('animals-changed'));
                showModalMessage('Success', `Animal ${formData.name} successfully added!`);
            }
            onCancel();
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };

    const TABS = [
        { id: 2, label: 'Ownership', icon: Lock, color: 'text-slate-500' },
        { id: 3, label: 'Identification', icon: Tag, color: 'text-amber-500' },
        { id: 4, label: 'Appearance', icon: Palette, color: 'text-pink-500' },
        { id: 5, label: 'Pedigree', icon: Dna, color: 'text-orange-500' },
        { id: 6, label: 'Family', icon: TreeDeciduous, color: 'text-green-600' },
        { id: 7, label: 'Fertility', icon: Egg, color: 'text-yellow-500' },
        { id: 8, label: 'Health', icon: Hospital, color: 'text-red-500' },
        { id: 9, label: 'Care', icon: Home, color: 'text-teal-500' },
        { id: 10, label: 'Behavior', icon: Brain, color: 'text-purple-500' },
        { id: 11, label: 'Notes & Milestones', icon: FileText, color: 'text-indigo-500' },
        { id: 12, label: 'Show', icon: Trophy, color: 'text-yellow-600' },
        { id: 13, label: 'Legal', icon: FileCheck, color: 'text-blue-600' },
        { id: 14, label: 'End of Life', icon: Scale, color: 'text-gray-500' },
        { id: 15, label: 'Gallery', icon: Images, color: 'text-rose-500' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-[#e1f2f5] rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-300 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-between">
                        <span>
                            <PlusCircle size={24} className="inline mr-2 text-primary" />
                            {formTitle}
                        </span>
                        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition duration-150 p-2 rounded-lg" title="Cancel">
                            <X size={24} />
                        </button>
                    </h2>
                </div>

                {/* NEW: Two-column section for Image and Identity */}
                <div className="flex gap-6 px-6 pt-4 pb-6 border-b border-gray-300 bg-white/30">
                    {/* Left Column: Image Upload */}
                    <div className="w-1/3 flex-shrink-0">
                        <AnimalImageUpload
                            imageUrl={animalImagePreview}
                            onFileChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setAnimalImageFile(e.target.files[0]);
                                    setAnimalImagePreview(URL.createObjectURL(e.target.files[0]));
                                }
                            }}
                            onDeleteImage={() => { setAnimalImageFile(null); setAnimalImagePreview(null); setDeleteImage(true); }}
                            disabled={loading}
                            Trash2={Trash2}
                        />
                    </div>

                    {/* Right Column: Identity Fields */}
                    <div className="w-2/3 flex-1">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 h-full">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prefix</label>
                                    <input type="text" name="prefix" value={formData.prefix} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name*</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                    <input type="text" name="suffix" value={formData.suffix} onChange={handleChange}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender*</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <DatePicker name="birthDate" value={formData.birthDate} onChange={handleChange} maxDate={new Date()}
                                        className="mt-1 p-2" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Status*</label>
                                    <select name="status" value={formData.status} onChange={handleChange} required
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Tabs */}
                    <div className="sticky top-0 bg-[#e1f2f5] z-10 border-b border-gray-300 px-6 py-2">
                        <div className="flex flex-wrap gap-2">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded border-2 transition-colors ${activeTab === tab.id ? 'bg-[#F2E4E9] text-black border-gray-300' : 'bg-white text-gray-600 hover:text-gray-800 border-gray-300'}`}
                                    title={tab.label}
                                >
                                    {React.createElement(tab.icon, { size: 15, className: `inline-block align-middle flex-shrink-0 mr-1 ${tab.color || ''}` })}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <AnimalImageUpload
                                        imageUrl={animalImagePreview}
                                        onFileChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setAnimalImageFile(e.target.files[0]);
                                                setAnimalImagePreview(URL.createObjectURL(e.target.files[0]));
                                            }
                                        }}
                                        onDeleteImage={() => { setAnimalImageFile(null); setAnimalImagePreview(null); setDeleteImage(true); }}
                                        disabled={loading}
                                        Trash2={Trash2}
                                    />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Identity</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Prefix</label>
                                            <input type="text" name="prefix" value={formData.prefix} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name*</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                            <input type="text" name="suffix" value={formData.suffix} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender*</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                            <DatePicker name="birthDate" value={formData.birthDate} onChange={handleChange} maxDate={new Date()}
                                                className="mt-1 p-2" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Status*</label>
                                            <select name="status" value={formData.status} onChange={handleChange} required
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 2 && (
                            <div className="space-y-6">
                                {/* Ownership & Visibility */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ownership & Visibility</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="flex items-center space-x-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isOwned"
                                                checked={formData.isOwned}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Heart size={18} className={formData.isOwned ? 'text-red-500' : 'text-gray-400'} />
                                                <span className="text-sm font-medium text-gray-700">I own this animal</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center space-x-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isDisplay"
                                                checked={formData.isDisplay}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-2">
                                                {formData.isDisplay ? <Eye size={18} className="text-green-500" /> : <EyeOff size={18} className="text-gray-400" />}
                                                <span className="text-sm font-medium text-gray-700">Show on Public Profile</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Breeder & Keeper */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-1.5"><User size={16} /> Breeder & Keeper</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Breeder (Manual)</label>
                                            <input type="text" name="manualBreederName" value={formData.manualBreederName} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Breeder name if not on CritterTrack" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Keeper</label>
                                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Current keeper/owner name" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Co-Ownership Details</label>
                                            <textarea name="coOwnership" value={formData.coOwnership} onChange={handleChange} rows="2"
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="Co-owner name, terms, breeding rights, etc." />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Availability</h3>
                                    {/* For Sale */}
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" name="isForSale" checked={formData.isForSale} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary rounded" />
                                            <span className="text-sm font-medium text-gray-700">Available for Sale</span>
                                        </label>
                                        {formData.isForSale && (
                                            <div className="flex gap-2 pl-7">
                                                <select name="salePriceCurrency" value={formData.salePriceCurrency} onChange={handleChange} className="p-2 border border-gray-300 rounded-md text-sm">
                                                    <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                </select>
                                                <input type="number" name="salePriceAmount" value={formData.salePriceAmount} onChange={handleChange} disabled={formData.salePriceCurrency === 'Negotiable'} placeholder="Price" className="flex-1 p-2 border border-gray-300 rounded-md text-sm" />
                                            </div>
                                        )}
                                    </div>
                                    {/* For Stud */}
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" name="availableForBreeding" checked={formData.availableForBreeding} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary rounded" />
                                            <span className="text-sm font-medium text-gray-700">Available for Stud/Breeding</span>
                                        </label>
                                        {formData.availableForBreeding && (
                                            <div className="flex gap-2 pl-7">
                                                <select name="studFeeCurrency" value={formData.studFeeCurrency} onChange={handleChange} className="p-2 border border-gray-300 rounded-md text-sm">
                                                    <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                </select>
                                                <input type="number" name="studFeeAmount" value={formData.studFeeAmount} onChange={handleChange} disabled={formData.studFeeCurrency === 'Negotiable'} placeholder="Fee" className="flex-1 p-2 border border-gray-300 rounded-md text-sm" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-300 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                                <ArrowLeft size={18} />
                                <span>Cancel</span>
                            </button>
                            {animalToEdit && onDelete && (
                                <button type="button" onClick={() => onDelete(animalToEdit.id_public)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2">
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-2 disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>{loading ? 'Saving...' : 'Save Animal'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AnimalFormTestModal;