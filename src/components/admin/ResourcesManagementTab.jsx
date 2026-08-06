import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2, Edit2, X, Loader2, Search, RefreshCw } from 'lucide-react';

const ResourcesManagementTab = ({ API_BASE_URL, authToken }) => {
    const [resources, setResources] = useState([]);
    const [speciesOptions, setSpeciesOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const emptyForm = { title: '', url: '', description: '', species: [], tags: '' };
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [speciesQuery, setSpeciesQuery] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchResources = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/resources`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setResources(res.data);
        } catch (err) {
            console.error('Error fetching resources:', err);
            setError(err.response?.data?.error || 'Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authToken) return;
        fetchResources();
        axios.get(`${API_BASE_URL}/admin/species`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setSpeciesOptions((res.data || []).map(s => s.name)))
            .catch(err => console.error('Error fetching species for resources form:', err));
    }, [authToken, API_BASE_URL]);

    const openAddModal = () => {
        setForm(emptyForm);
        setSpeciesQuery('');
        setShowAddModal(true);
    };

    const openEditModal = (resource) => {
        setSelectedResource(resource);
        setForm({
            title: resource.title || '',
            url: resource.url || '',
            description: resource.description || '',
            species: resource.species || [],
            tags: (resource.tags || []).join(', ')
        });
        setSpeciesQuery('');
        setShowEditModal(true);
    };

    const addSpeciesToForm = (name) => {
        setForm(prev => ({ ...prev, species: [...prev.species, name] }));
        setSpeciesQuery('');
    };

    const removeSpeciesFromForm = (name) => {
        setForm(prev => ({ ...prev, species: prev.species.filter(s => s !== name) }));
    };

    const buildPayload = () => ({
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim(),
        species: form.species,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    });

    const handleAdd = async () => {
        if (!form.title.trim() || !form.url.trim()) {
            alert('Title and URL are required');
            return;
        }
        setSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/admin/resources`, buildPayload(), {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            await fetchResources();
            setShowAddModal(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add resource');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!selectedResource || !form.title.trim() || !form.url.trim()) {
            alert('Title and URL are required');
            return;
        }
        setSaving(true);
        try {
            await axios.patch(`${API_BASE_URL}/admin/resources/${selectedResource._id}`, buildPayload(), {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            await fetchResources();
            setShowEditModal(false);
            setSelectedResource(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update resource');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (resource) => {
        if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_BASE_URL}/admin/resources/${resource._id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            await fetchResources();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete resource');
        }
    };

    const filteredResources = resources.filter(r =>
        !searchTerm || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const speciesSuggestions = speciesQuery.trim()
        ? speciesOptions.filter(s => !form.species.includes(s) && s.toLowerCase().includes(speciesQuery.toLowerCase())).slice(0, 8)
        : [];

    const renderSpeciesPicker = () => (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Species (leave empty for "applies to all")</label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
                {form.species.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/20 rounded-full">
                        {s}
                        <button type="button" onClick={() => removeSpeciesFromForm(s)}><X size={11} /></button>
                    </span>
                ))}
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={speciesQuery}
                    onChange={e => setSpeciesQuery(e.target.value)}
                    placeholder="Type to search species..."
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                {speciesSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {speciesSuggestions.map(s => (
                            <button key={s} type="button" onClick={() => addSpeciesToForm(s)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (loading && resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading resources...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BookOpen size={28} className="text-gray-700" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Resources Management</h2>
                        <p className="text-sm text-gray-500">Manage the external links shown on the public Resources page</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={openAddModal} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">
                        <Plus size={16} /> Add Resource
                    </button>
                    <button onClick={fetchResources} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="relative mb-4 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

            {filteredResources.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <BookOpen size={40} className="mx-auto mb-2" />
                    <p>{resources.length === 0 ? 'No resources yet. Add your first one.' : 'No resources match your search.'}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredResources.map(r => (
                        <div key={r._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-800 truncate">
                                    {r.title}
                                    {r.subject && <span className="ml-2 text-xs font-normal text-gray-500">({r.subject})</span>}
                                </div>
                                <div className="text-xs text-gray-500 truncate">{r.url}</div>
                                {(r.species?.length > 0 || r.tags?.length > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(r.species || []).map(s => <span key={s} className="text-xs px-1.5 py-0.5 bg-primary/10 rounded-full">{s}</span>)}
                                        {(r.tags || []).map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t}</span>)}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0 ml-3">
                                <button onClick={() => openEditModal(r)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(r)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-bold text-gray-800">{showAddModal ? 'Add Resource' : 'Edit Resource'}</h3>
                            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }}><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">URL *</label>
                                <input type="text" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Subject (optional, e.g. "Genetics", "Nutrition")</label>
                                <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            {renderSpeciesPicker()}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated, e.g. health, genetics, vendor)</label>
                                <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>
                        <div className="border-t p-4 flex justify-end gap-2">
                            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold">Cancel</button>
                            <button onClick={showAddModal ? handleAdd : handleSave} disabled={saving} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                                {showAddModal ? 'Add Resource' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesManagementTab;
