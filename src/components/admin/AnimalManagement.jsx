import React, { useState, useEffect } from 'react';
import { Download, Upload, Search, Loader2, Plus, Trash2, Edit, Merge2, AlertTriangle } from 'lucide-react';

const AnimalManagement = ({ authToken, API_BASE_URL }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); // 'list', 'import', 'merge'
    const [selectedAnimals, setSelectedAnimals] = useState([]);
    const [importFile, setImportFile] = useState(null);

    useEffect(() => {
        fetchAnimals();
    }, []);

    const fetchAnimals = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/animals`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAnimals(data);
            }
        } catch (error) {
            console.error('Error fetching animals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/animals/export/csv`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animals_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (selectedAnimals.length === 0) {
            alert('Please select animals first');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/animals/bulk-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    animalIds: selectedAnimals,
                    updates: { status: newStatus }
                })
            });
            if (response.ok) {
                fetchAnimals();
                setSelectedAnimals([]);
            }
        } catch (error) {
            console.error('Error updating animals:', error);
        }
    };

    const handleImportFile = async () => {
        if (!importFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/animals/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });
            if (response.ok) {
                const result = await response.json();
                alert(`Imported ${result.success} animals successfully`);
                fetchAnimals();
                setImportFile(null);
            }
        } catch (error) {
            console.error('Error importing animals:', error);
        }
    };

    const filteredAnimals = animals.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.id_public.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Animal Records Management</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView(view === 'list' ? 'import' : 'list')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Upload size={20} />
                        Import
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Download size={20} />
                        Export
                    </button>
                </div>
            </div>

            {view === 'list' ? (
                <>
                    {/* Search & Bulk Actions */}
                    <div className="mb-6 flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search animals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                        </div>
                        {selectedAnimals.length > 0 && (
                            <>
                                <select
                                    onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                                >
                                    <option value="">Change Status...</option>
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                    <option value="retired">Retired</option>
                                    <option value="deceased">Deceased</option>
                                </select>
                                <span className="text-sm font-medium text-gray-600">{selectedAnimals.length} selected</span>
                            </>
                        )}
                    </div>

                    {/* Animals Table */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAnimals(filteredAnimals.map(a => a.id));
                                                    } else {
                                                        setSelectedAnimals([]);
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Species</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAnimals.map((animal, index) => (
                                        <tr key={animal.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAnimals.includes(animal.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAnimals([...selectedAnimals, animal.id]);
                                                        } else {
                                                            setSelectedAnimals(selectedAnimals.filter(id => id !== animal.id));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-3 text-sm font-medium text-gray-800">{animal.name}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600">{animal.id_public}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600">{animal.species}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600">{animal.ownerUsername}</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    animal.status === 'available' ? 'bg-green-100 text-green-800' :
                                                    animal.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {animal.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <h4 className="font-bold text-gray-800 mb-4">Import Animals</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                            type="file"
                            accept=".csv,.xlsx,.json"
                            onChange={(e) => setImportFile(e.target.files?.[0])}
                            className="block mx-auto mb-4"
                        />
                        <p className="text-sm text-gray-600 mb-4">Supports CSV, XLSX, JSON formats</p>
                        <button
                            onClick={handleImportFile}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Import File
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimalManagement;
