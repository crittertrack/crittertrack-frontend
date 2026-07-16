import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft, ClipboardList, Dna, FileText, Home, Hospital, Images,
    Lock, Palette, PlusCircle, Save, Tag, Trash2, TreeDeciduous, Egg, Brain, Trophy, FileCheck, Scale, X, User, Heart, Eye, EyeOff, Edit,
    Hash, Sparkles, Ruler, Sprout, Key, FolderOpen, Globe, Leaf, Microscope, Stethoscope, UtensilsCrossed, Droplets,
    Thermometer, Feather, Medal, Target, Ban, Package, ScrollText, Link, Unlink, Baby, Bell, Plus, RotateCcw, Camera, Upload, Search, Star, ArrowRight,
    Loader2, ChevronDown, ChevronRight,
} from 'lucide-react';
import DatePicker from '../DatePicker';
import AnimalImageUpload from '../AnimalImageUpload';
import GeneticCodeBuilder from '../GeneticCodeBuilder';
import { FamilyTabContent } from '../AnimalDetail/FamilyTabContent';

const getContactDisplayName = (contact) => {
    const personalName = contact?.personalName?.trim();
    const breederName = contact?.breederName?.trim();
    const prefix = contact?.prefix?.trim();
    const suffix = contact?.suffix?.trim();

    if (personalName && breederName) {
        return `${personalName} (${breederName})`;
    }
    if (personalName) {
        return [prefix, personalName, suffix].filter(Boolean).join(' ');
    }
    if (breederName) {
        return [prefix, breederName, suffix].filter(Boolean).join(' ');
    }
    return [prefix, personalName, suffix].filter(Boolean).join(' ') || 'Unnamed Contact';
};

const ContactDisplayField = ({ label, value, onEdit }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</label>
        <div
            onClick={onEdit}
            className="mt-1 flex justify-between items-center p-2.5 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer hover:border-primary"
        >
            <span className={`text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>{value || `Click to assign ${label}`}</span>
            <Edit size={16} className="text-gray-400" />
        </div>
    </div>
);

const AssignContactModal = ({ isOpen, onClose, onSelect, target, API_BASE_URL, authToken }) => {
    if (!isOpen) return null;

    const [mode, setMode] = useState('user'); // 'user', 'contact', 'manual'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [manualName, setManualName] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    useEffect(() => {
        if (mode === 'contact' && contacts.length === 0) {
            setLoadingContacts(true);
            axios.get(`${API_BASE_URL}/contacts`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => setContacts(res.data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingContacts(false));
        }
    }, [mode, authToken, API_BASE_URL, contacts.length]);

    const handleUserSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(searchTerm.trim())}&limit=20`);
            setSearchResults(res.data || []);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Assign {target}</h3>
                </div>
                <div className="p-4 border-b flex gap-2">
                    <button onClick={() => setMode('user')} className={`px-3 py-1 text-sm rounded-full ${mode === 'user' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Search User</button>
                    <button onClick={() => setMode('contact')} className={`px-3 py-1 text-sm rounded-full ${mode === 'contact' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Select Contact</button>
                    <button onClick={() => setMode('manual')} className={`px-3 py-1 text-sm rounded-full ${mode === 'manual' ? 'bg-primary text-black' : 'bg-gray-200'}`}>Manual Entry</button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {mode === 'user' && (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or CTU ID" className="w-full p-2 border rounded-md" onKeyPress={e => e.key === 'Enter' && handleUserSearch()} />
                                <button onClick={handleUserSearch} disabled={loading} className="p-2 bg-primary rounded-md disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : <Search />}</button>
                            </div>
                            <div className="space-y-1">
                                {searchResults.map(user => (
                                    <div key={user.id_public} onClick={() => onSelect({ name: user.breederName || user.personalName, userId: user.id_public })} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                        <p className="font-semibold">{user.breederName || user.personalName}</p>
                                        <p className="text-xs text-gray-500">{user.id_public}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === 'contact' && (
                        <div className="space-y-1">
                            {loadingContacts ? <Loader2 className="animate-spin" /> : contacts.map(contact => (
                                <div key={contact._id} onClick={() => onSelect({ name: getContactDisplayName(contact), userId: contact.linkedCTUID })} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                    <p className="font-semibold">{getContactDisplayName(contact)}</p>
                                    {contact.linkedCTUID && <p className="text-xs text-gray-500">{contact.linkedCTUID}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                    {mode === 'manual' && (
                        <div className="space-y-2">
                            <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder={`Enter ${target} name`} className="w-full p-2 border rounded-md" />
                            <button onClick={() => onSelect({ name: manualName })} className="w-full p-2 bg-primary rounded-md">Assign Name</button>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t">
                    <button onClick={onClose} className="w-full p-2 bg-gray-200 rounded-md">Cancel</button>
                </div>
            </div>
        </div>
    );
};

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
    const [activeTab, setActiveTab] = useState(1);
    const [loading, setLoading] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignModalTarget, setAssignModalTarget] = useState(null); // 'breeder' or 'keeper'
    const [breederInfo, setBreederInfo] = useState(null);
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [sectionsCollapsed, setSectionsCollapsed] = useState({
        identity: false,
        breederOwner: true,
        availability: true,
    });

    const toggleSection = (section) => {
        setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [tagInput, setTagInput] = useState('');


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
            ownerId_public: animalToEdit.ownerId_public || animalToEdit.ownerId || null,
            manualownerName: animalToEdit.manualownerName || animalToEdit.manualownerName || '',
            isDisplay: animalToEdit.isDisplay ?? false,
            coOwnership: animalToEdit.coOwnership || '',
            isForSale: animalToEdit.isForSale || false,
            salePriceCurrency: animalToEdit.salePriceCurrency || 'USD',
            salePriceAmount: animalToEdit.salePriceAmount || '',
            availableForBreeding: animalToEdit.availableForBreeding || false,
            studFeeCurrency: animalToEdit.studFeeCurrency || 'USD',
            studFeeAmount: animalToEdit.studFeeAmount || '',
            // Add all other fields from the original form
            ...animalToEdit,
            microchipNumber: animalToEdit.microchipNumber || '',
            pedigreeRegistrationId: animalToEdit.pedigreeRegistrationId || '',
            colonyId: animalToEdit.colonyId || '',
            tattooId: animalToEdit.tattooId || '',
            ringId: animalToEdit.ringId || '',
            eartagNumber: animalToEdit.eartagNumber || '',
            breed: animalToEdit.breed || '',
            strain: animalToEdit.strain || '',
            origin: animalToEdit.origin || 'Captive-bred'
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
            ownerId_public: null, // This is the new field for linked user owner
            manualownerName: '', // This is for manual entry, matching the old form
            isOwned: true, // Default for new animals, not editable in this form
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
            microchipNumber: '',
            pedigreeRegistrationId: '',
            colonyId: '',
            tattooId: '',
            ringId: '',
            eartagNumber: '',
            breed: '',
            strain: '',
            origin: 'Captive-bred',
        }
    );

    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        const initialImages = [];
        if (animalToEdit) {
            const primaryUrl = animalToEdit.imageUrl || animalToEdit.photoUrl;
            if (primaryUrl) {
                initialImages.push({ id: `existing-${primaryUrl}`, url: primaryUrl, file: null });
            }
            const extraUrls = (animalToEdit.extraImages || []).filter(url => url !== primaryUrl);
            extraUrls.forEach((url, index) => {
                initialImages.push({ id: `existing-${url}-${index}`, url: url, file: null });
            });
        }
        setGalleryImages(initialImages);
    }, [animalToEdit]);

    useEffect(() => {
        if (formData.breederId_public) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.breederId_public}&limit=1`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setBreederInfo(res.data[0]);
                    }
                })
                .catch(err => console.error('Failed to fetch breeder info', err));
        } else {
            setBreederInfo(null);
        }
    }, [formData.breederId_public, API_BASE_URL]);

    useEffect(() => {
        if (formData.ownerId_public) {
            axios.get(`${API_BASE_URL}/public/profiles/search?query=${formData.ownerId_public}&limit=1`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setOwnerInfo(res.data[0]);
                    }
                })
                .catch(err => console.error('Failed to fetch owner info', err));
        } else {
            setOwnerInfo(null);
        }
    }, [formData.ownerId_public, API_BASE_URL]);



    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: `new-${file.name}-${Date.now()}-${Math.random()}`,
                url: URL.createObjectURL(file),
                file: file,
            }));
            setGalleryImages(prevImages => [...prevImages, ...newFiles]);
        }
    };

    const setAsPrimaryImage = (id) => {
        setGalleryImages(prevImages => {
            const imageToMove = prevImages.find(img => img.id === id);
            if (!imageToMove) return prevImages;
            const otherImages = prevImages.filter(img => img.id !== id);
            return [imageToMove, ...otherImages];
        });
    };
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

    const handleSelectContact = (selection) => {
        if (assignModalTarget === 'breeder') {
            setFormData(prev => ({
                ...prev,
                breederId_public: selection.userId || null,
                manualBreederName: selection.name || '',
            }));
        } else if (assignModalTarget === 'owner') {
            setFormData(prev => ({
                ...prev,
                ownerId_public: selection.userId || null, // The new linked user ID
                manualownerName: selection.name || '', // The manual name, falls back for display
            }));
        }
        setAssignModalOpen(false);
        setAssignModalTarget(null);
    };

    const clearContactSelection = (target) => {
        if (target === 'breeder') {
            setFormData(prev => ({
                ...prev,
                breederId_public: null,
                manualBreederName: '',
            }));
            setBreederInfo(null);
        } else if (target === 'owner') {
            setFormData(prev => ({
                ...prev,
                ownerId_public: null,
                manualownerName: '',
            }));
            setOwnerInfo(null);
        }
    };


    const deleteImage = (id) => {
        setGalleryImages(prevImages => prevImages.filter(img => img.id !== id));
    };

    const moveImage = (index, direction) => {
        setGalleryImages(prevImages => {
            const newImages = [...prevImages];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= newImages.length) {
                return newImages; // Out of bounds
            }

            // Swap elements
            [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

            return newImages;
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
            const newImagesToUpload = galleryImages.filter(img => img.file);
            const existingImageUrls = galleryImages.filter(img => !img.file).map(img => img.url);

            const uploadPromises = newImagesToUpload.map(img => {
                const fd = new FormData();
                fd.append('file', img.file);
                fd.append('type', 'animal');
                return axios.post(`${API_BASE_URL}/upload`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authToken}` }
                }).then(res => ({
                    id: img.id,
                    url: res.data.url
                }));
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const uploadedUrlMap = new Map(uploadedImages.map(img => [img.id, img.url]));

            const finalImageUrls = galleryImages.map(img => {
                return img.file ? uploadedUrlMap.get(img.id) : img.url;
            }).filter(Boolean);

            const primaryImageUrl = finalImageUrls[0] || null;
            const extraImages = finalImageUrls.slice(1);

            const payloadToSave = { ...formData };
            payloadToSave.imageUrl = primaryImageUrl;
            payloadToSave.photoUrl = primaryImageUrl;
            payloadToSave.extraImages = extraImages;

            if (galleryImages.length === 0) {
                payloadToSave.imageUrl = null;
                payloadToSave.photoUrl = null;
                payloadToSave.extraImages = [];
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
        { id: 1, label: 'Dashboard', icon: ClipboardList, color: 'text-blue-500' }, { id: 2, label: 'Identification', icon: Tag, color: 'text-amber-500' }, { id: 3, label: 'Appearance', icon: Palette, color: 'text-pink-500' }, { id: 4, label: 'Pedigree', icon: Dna, color: 'text-orange-500' }, { id: 5, label: 'Family', icon: TreeDeciduous, color: 'text-green-600' }, { id: 6, label: 'Fertility', icon: Egg, color: 'text-yellow-500' }, { id: 7, label: 'Health', icon: Hospital, color: 'text-red-500' }, { id: 8, label: 'Care', icon: Home, color: 'text-teal-500' }, { id: 9, label: 'Behavior', icon: Brain, color: 'text-purple-500' }, { id: 10, label: 'Notes & Milestones', icon: FileText, color: 'text-indigo-500' }, { id: 11, label: 'Show', icon: Trophy, color: 'text-yellow-600' }, { id: 12, label: 'Legal', icon: FileCheck, color: 'text-blue-600' }, { id: 13, label: 'End of Life', icon: Scale, color: 'text-gray-500' }, { id: 14, label: 'Gallery', icon: Images, color: 'text-rose-500' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80] backdrop-blur-sm">
            <AssignContactModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onSelect={handleSelectContact}
                target={assignModalTarget}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                userProfile={userProfile}
            />
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

                {/* Tabs */}
                <div className="bg-[#e1f2f5] z-10 border-b border-gray-300 px-6 py-2">
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
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 1 && ( // DASHBOARD
                            <div className="flex gap-4">
                                {/* Left Column: Image Upload */}
                                <div className="w-1/4 flex-shrink-0 flex flex-col gap-2">
                                    {(() => {
                                        const mainImage = galleryImages[0];
                                        const thumbnailImages = galleryImages.slice(1, 4);
                                        return (
                                            <>
                                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 relative group">
                                                    {mainImage ? (
                                                        <img src={mainImage.url} alt="Main animal" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-gray-400 flex flex-col items-center gap-2">
                                                            <Camera size={48} />
                                                            <span className="text-sm">No Image</span>
                                                        </div>
                                                    )}
                                                    {mainImage && (
                                                        <button type="button" onClick={() => deleteImage(mainImage.id)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {thumbnailImages.map(img => (
                                                        <button key={img.id} type="button" onClick={() => setAsPrimaryImage(img.id)} className="aspect-square rounded-md overflow-hidden border-2 border-gray-300 relative group focus:outline-none focus:ring-2 focus:ring-primary">
                                                            <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Set as primary">
                                                                <Star size={20} className="text-white" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {Array.from({ length: Math.max(0, 3 - thumbnailImages.length) }).map((_, i) => (
                                                        <div key={`placeholder-${i}`} className="aspect-square bg-gray-100 rounded-md border-2 border-gray-300" />
                                                    ))}
                                                    <label className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition">
                                                        <PlusCircle size={24} />
                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Right Column: Identity Fields */}
                                <div className="w-3/4 flex-1 flex flex-col gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Identity</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Prefix</label>
                                                <input type="text" name="prefix" value={formData.prefix} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Name*</label>
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Suffix</label>
                                                <input type="text" name="suffix" value={formData.suffix} onChange={handleChange}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Gender*</label>
                                                <select name="gender" value={formData.gender} onChange={handleChange} required
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                                                <DatePicker name="birthDate" value={formData.birthDate} onChange={handleChange} maxDate={new Date()}
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700">Status*</label>
                                                <select name="status" value={formData.status} onChange={handleChange} required
                                                    className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breeder & Keeper */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('breederOwner')} className="w-full flex justify-between items-center text-left">
                                            <h3 className="text-base font-semibold text-gray-700 flex items-center gap-1.5"><User size={16} />Breeder & Owner</h3>
                                            {sectionsCollapsed.breederOwner ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {!sectionsCollapsed.breederOwner && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <ContactDisplayField
                                                                label="Breeder"
                                                                value={breederInfo ? (breederInfo.breederName || breederInfo.personalName) : formData.manualBreederName}
                                                                onEdit={() => { setAssignModalTarget('breeder'); setAssignModalOpen(true); }}
                                                            />
                                                        </div>
                                                        {(breederInfo || formData.manualBreederName) && (
                                                            <button type="button" onClick={() => clearContactSelection('breeder')} className="text-gray-500 hover:text-red-500 transition p-1 mb-1" title="Clear Breeder">
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <ContactDisplayField
                                                                label="Owner"
                                                                value={ownerInfo ? (ownerInfo.breederName || ownerInfo.personalName) : formData.manualownerName}
                                                                onEdit={() => { setAssignModalTarget('owner'); setAssignModalOpen(true); }}
                                                            />
                                                        </div>
                                                        {(ownerInfo || formData.manualownerName) && (
                                                            <button type="button" onClick={() => clearContactSelection('owner')} className="text-gray-500 hover:text-red-500 transition p-1 mb-1" title="Clear Owner">
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700">Co-Ownership Details</label>
                                                        <textarea name="coOwnership" value={formData.coOwnership} onChange={handleChange} rows="2"
                                                            className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                            placeholder="Co-owner name, terms, breeding rights, etc." />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Availability */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <button type="button" onClick={() => toggleSection('availability')} className="w-full flex justify-between items-center text-left">
                                            <h3 className="text-base font-semibold text-gray-700">Availability</h3>
                                            {sectionsCollapsed.availability ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {!sectionsCollapsed.availability && (
                                            <div className="mt-3 pt-3 border-t space-y-3">
                                                {/* For Sale */}
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="isForSale" checked={formData.isForSale} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary rounded" />
                                                        <span className="text-xs font-medium text-gray-700">Available for Sale</span>
                                                    </label>
                                                    {formData.isForSale && (
                                                        <div className="flex gap-2 pl-6">
                                                            <select name="salePriceCurrency" value={formData.salePriceCurrency} onChange={handleChange} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs">
                                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                            </select>
                                                            <input type="number" name="salePriceAmount" value={formData.salePriceAmount} onChange={handleChange} disabled={formData.salePriceCurrency === 'Negotiable'} placeholder="Price" className="flex-1 py-1.5 px-2 border border-gray-300 rounded-md text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* For Stud */}
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 space-y-2">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="availableForBreeding" checked={formData.availableForBreeding} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary rounded" />
                                                        <span className="text-xs font-medium text-gray-700">Available for Stud/Breeding</span>
                                                    </label>
                                                    {formData.availableForBreeding && (
                                                        <div className="flex gap-2 pl-6">
                                                            <select name="studFeeCurrency" value={formData.studFeeCurrency} onChange={handleChange} className="py-1.5 px-2 border border-gray-300 rounded-md text-xs">
                                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CAD">CAD</option><option value="AUD">AUD</option><option value="Negotiable">Negotiable</option>
                                                            </select>
                                                            <input type="number" name="studFeeAmount" value={formData.studFeeAmount} onChange={handleChange} disabled={formData.studFeeCurrency === 'Negotiable'} placeholder="Fee" className="flex-1 py-1.5 px-2 border border-gray-300 rounded-md text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 2 && (
                            <div className="space-y-4">
                                {/* Identification Numbers */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Breeder Assigned ID</label>
                                            <input type="text" name="breederAssignedId" value={formData.breederAssignedId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Microchip Number</label>
                                            <input type="text" name="microchipNumber" value={formData.microchipNumber || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Pedigree Registration ID</label>
                                            <input type="text" name="pedigreeRegistrationId" value={formData.pedigreeRegistrationId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Colony ID</label>
                                            <input type="text" name="colonyId" value={formData.colonyId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Tattoo ID</label>
                                            <input type="text" name="tattooId" value={formData.tattooId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Ring ID</label>
                                            <input type="text" name="ringId" value={formData.ringId || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Ear Tag</label>
                                            <input type="text" name="eartagNumber" value={formData.eartagNumber || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                    </div>
                                </div>

                                {/* Classification */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Species</label>
                                            <input type="text" value={formData.species} disabled
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600" />
                                            <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Breed</label>
                                            <input type="text" name="breed" value={formData.breed || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Strain</label>
                                            <input type="text" name="strain" value={formData.strain || ''} onChange={handleChange}
                                                className="mt-1 block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                                placeholder="e.g., C57BL/6, Wistar, Syrian" />
                                        </div>
                                    </div>
                                </div>

                                {/* Origin */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2 mb-2"><Globe size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Origin</h3>
                                    <label className="block text-xs font-medium text-gray-700">Origin</label>
                                    <select name="origin" value={formData.origin || ''} onChange={handleChange}
                                        className="block w-full py-1.5 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                        <option value="">Select Origin</option>
                                        <option value="Captive-bred">Captive-bred</option>
                                        <option value="Wild-caught">Wild-caught</option>
                                        <option value="Rescue">Rescue</option>
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-700 border-b pb-2 mb-2"><Tag size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Tags</h3>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tags (Lines, Enclosures, etc)</label>
                                    <input type="text" placeholder="Type and press Enter or comma to add tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); const trimmed = tagInput.trim(); if (trimmed && !formData.tags.includes(trimmed)) { setFormData({ ...formData, tags: [...formData.tags, trimmed] }); setTagInput(''); } } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) { setFormData({ ...formData, tags: formData.tags.slice(0, -1) }); } }} onBlur={() => { const trimmed = tagInput.trim(); if (trimmed && !formData.tags.includes(trimmed)) { setFormData({ ...formData, tags: [...formData.tags, trimmed] }); setTagInput(''); } }} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                                    {formData.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.tags.map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center bg-primary text-black text-xs font-semibold px-3 py-1 rounded-full">
                                                    {tag}
                                                    <button type="button" onClick={() => { const newTags = formData.tags.filter((_, i) => i !== idx); setFormData({ ...formData, tags: newTags }); }} className="ml-2 text-black hover:text-gray-600"><Trash2 size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 14 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Gallery Management</h3>
                                <p className="text-sm text-gray-500">
                                    Use the arrows to reorder images. The first image is the primary one. Click the star to move an image to the first position.
                                </p>
                                {galleryImages.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Camera size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium">No images yet</p>
                                        <p className="text-xs mt-1">Add images using the uploader in the main section.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {galleryImages.map((img, index) => (
                                            <div key={img.id} className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-gray-100
                                                ${index === 0 ? 'border-primary' : 'border-gray-200'}`}>
                                                <img src={img.url} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAsPrimaryImage(img.id)}
                                                        className={`p-2 rounded-full transition-colors ${index === 0 ? 'bg-primary text-black' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                                        title="Set as primary image"
                                                    >
                                                        <Star size={18} fill={index === 0 ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'left')}
                                                            disabled={index === 0}
                                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                                                            title="Move left"
                                                        >
                                                            <ArrowLeft size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'right')}
                                                            disabled={index === galleryImages.length - 1}
                                                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30"
                                                            title="Move right"
                                                        >
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                    <button type="button" onClick={() => deleteImage(img.id)} className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600" title="Delete image">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] rounded px-1.5 py-0.5 font-bold">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
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