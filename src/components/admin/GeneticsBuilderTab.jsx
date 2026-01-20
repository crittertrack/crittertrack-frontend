import React, { useState, useEffect } from 'react';
import { 
    Dna, RefreshCw, Plus, Edit2, Trash2, Save, X, 
    AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp,
    Eye, EyeOff, Copy, Upload, Download, Play, Pause,
    GripVertical, AlertTriangle
} from 'lucide-react';
import { GENE_LOCI } from '../MouseGeneticsCalculator';
import './GeneticsBuilderTab.css';

const DOMINANCE_TYPES = [
    { value: 'dominant', label: 'Dominant' },
    { value: 'recessive', label: 'Recessive' },
    { value: 'codominant', label: 'Co-dominant' },
    { value: 'incomplete', label: 'Incomplete Dominance' }
];

const GeneticsBuilderTab = ({ API_BASE_URL, authToken }) => {
    const [species, setSpecies] = useState([]);
    const [geneticsData, setGeneticsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Selected data
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [currentData, setCurrentData] = useState(null);
    const [isDraft, setIsDraft] = useState(true);
    
    // Editor state
    const [editingGene, setEditingGene] = useState(null);
    const [expandedGenes, setExpandedGenes] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // New gene modal
    const [showNewGeneModal, setShowNewGeneModal] = useState(false);
    const [newGene, setNewGene] = useState({ symbol: '', name: '', description: '', geneType: 'color' });
    
    // New allele state
    const [newAllele, setNewAllele] = useState({ notation: '', phenotype: '', isLethal: false, dominance: 'recessive' });
    const [addingAlleleToGene, setAddingAlleleToGene] = useState(null);

    // Fetch species list
    const fetchSpecies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/species`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSpecies(data);
            }
        } catch (err) {
            console.error('Error fetching species:', err);
        }
    };

    // Fetch all genetics data
    const fetchGeneticsData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/genetics`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setGeneticsData(data);
            }
        } catch (err) {
            console.error('Error fetching genetics data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch genetics data for selected species
    const fetchSpeciesGenetics = async (speciesName, getDraft = true) => {
        if (!speciesName) {
            setCurrentData(null);
            return;
        }
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${encodeURIComponent(speciesName)}?draft=${getDraft}`,
                { headers: { 'Authorization': `Bearer ${authToken}` } }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setIsDraft(!data?.isPublished);
            } else {
                setCurrentData(null);
            }
        } catch (err) {
            console.error('Error fetching species genetics:', err);
            setCurrentData(null);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchSpecies();
            fetchGeneticsData();
        }
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        if (selectedSpecies) {
            fetchSpeciesGenetics(selectedSpecies, true);
            setExpandedGenes(new Set());
            setHasChanges(false);
        }
    }, [selectedSpecies]);

    // Create new genetics data for species
    const createNewGeneticsData = async () => {
        if (!selectedSpecies) return;
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/genetics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    speciesName: selectedSpecies,
                    genes: [],
                    markingGenes: [],
                    adminNotes: ''
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setIsDraft(true);
                await fetchGeneticsData();
            } else {
                const err = await response.json();
                if (err.existingId) {
                    // Draft exists, fetch it
                    await fetchSpeciesGenetics(selectedSpecies, true);
                } else {
                    throw new Error(err.error);
                }
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Save genetics data
    const saveGeneticsData = async () => {
        if (!currentData?._id) return;
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/genetics/${currentData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    genes: currentData.genes,
                    markingGenes: currentData.markingGenes,
                    coatGenes: currentData.coatGenes,
                    otherGenes: currentData.otherGenes,
                    phenotypeRules: currentData.phenotypeRules,
                    adminNotes: currentData.adminNotes
                })
            });
            
            if (response.ok) {
                setHasChanges(false);
                await fetchGeneticsData();
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            alert('Error saving: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Publish genetics data
    const publishGeneticsData = async () => {
        if (!currentData?._id) return;
        
        if (!window.confirm('Publish this genetics data? It will become active for users.')) return;
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/genetics/${currentData._id}/publish`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setIsDraft(false);
                setHasChanges(false);
                await fetchGeneticsData();
                alert('Published successfully!');
            } else {
                throw new Error('Failed to publish');
            }
        } catch (err) {
            alert('Error publishing: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Import from Fancy Mouse Calculator
    const importFromCalculator = async () => {
        if (selectedSpecies !== 'Fancy Mouse') {
            alert('This feature is only available for Fancy Mouse species');
            return;
        }
        
        if (!window.confirm('Import all genes and alleles from the Fancy Mouse Genetics Calculator? This will replace current data.')) {
            return;
        }
        
        setSaving(true);
        try {
            // Convert GENE_LOCI to database format
            const colorGenes = [];
            const markingGenes = [];
            const coatGenes = [];
            
            // Define which genes are marking genes vs color genes
            const markingGeneSymbols = ['S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U'];
            const coatGeneSymbols = ['Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'];
            
            let geneOrder = 0;
            Object.entries(GENE_LOCI).forEach(([symbol, data]) => {
                const alleles = data.combinations.map((notation, index) => ({
                    notation,
                    phenotype: null, // Could be enhanced later
                    isLethal: notation.includes('lethal'),
                    dominance: 'recessive', // Default
                    order: index
                }));
                
                const gene = {
                    symbol,
                    name: data.name,
                    description: null,
                    order: geneOrder++,
                    alleles
                };
                
                if (markingGeneSymbols.includes(symbol)) {
                    markingGenes.push({
                        symbol: gene.symbol,
                        name: gene.name,
                        alleles: gene.alleles.map(a => ({
                            notation: a.notation,
                            phenotype: a.phenotype,
                            order: a.order
                        }))
                    });
                } else if (coatGeneSymbols.includes(symbol)) {
                    // Coat/texture genes
                    coatGenes.push({
                        symbol: gene.symbol,
                        name: gene.name,
                        alleles: gene.alleles.map(a => ({
                            notation: a.notation,
                            phenotype: a.phenotype,
                            order: a.order
                        }))
                    });
                } else {
                    // Color/pattern genes (A, B, C, D, E, P)
                    colorGenes.push(gene);
                }
            });
            
            // Update current data
            const updatedData = {
                ...currentData,
                genes: colorGenes,
                markingGenes: markingGenes,
                coatGenes: coatGenes,
                adminNotes: (currentData.adminNotes || '') + '\n\nImported from MouseGeneticsCalculator on ' + new Date().toISOString()
            };
            
            setCurrentData(updatedData);
            setHasChanges(true);
            alert(`Successfully imported ${colorGenes.length} color genes, ${markingGenes.length} marking genes, and ${coatGenes.length} coat genes!`);
        } catch (err) {
            alert('Error importing: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Add new gene
    const handleAddGene = async () => {
        if (!newGene.symbol.trim() || !newGene.name.trim()) {
            alert('Symbol and name are required');
            return;
        }
        
        if (!currentData?._id) {
            alert('Please create or select genetics data first');
            return;
        }
        
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/genetics/${currentData._id}/genes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(newGene)
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setShowNewGeneModal(false);
                setNewGene({ symbol: '', name: '', description: '', geneType: 'color' });
                setHasChanges(true);
            } else {
                throw new Error('Failed to add gene');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Delete gene
    const handleDeleteGene = async (geneIndex, isMarking, isCoat, isOther) => {
        if (!window.confirm('Delete this gene and all its alleles?')) return;
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/genes/${geneIndex}?isMarking=${isMarking}&isCoat=${isCoat}&isOther=${isOther}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
            } else {
                throw new Error('Failed to delete gene');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Add allele to gene (local update)
    const handleAddAllele = (geneIndex, isMarking, isCoat, isOther) => {
        if (!newAllele.notation.trim()) {
            alert('Notation is required (e.g., A/A, A/a, a/a)');
            return;
        }
        
        const updatedData = { ...currentData };
        const geneArray = isOther ? updatedData.otherGenes : (isCoat ? updatedData.coatGenes : (isMarking ? updatedData.markingGenes : updatedData.genes));
        
        geneArray[geneIndex].alleles.push({
            notation: newAllele.notation.trim(),
            phenotype: newAllele.phenotype.trim() || null,
            isLethal: newAllele.isLethal,
            dominance: newAllele.dominance,
            order: geneArray[geneIndex].alleles.length
        });
        
        setCurrentData(updatedData);
        setHasChanges(true);
        setNewAllele({ notation: '', phenotype: '', isLethal: false, dominance: 'recessive' });
        setAddingAlleleToGene(null);
    };

    // Remove allele (local update)
    const handleRemoveAllele = (geneIndex, alleleIndex, isMarking, isCoat, isOther) => {
        const updatedData = { ...currentData };
        const geneArray = isOther ? updatedData.otherGenes : (isCoat ? updatedData.coatGenes : (isMarking ? updatedData.markingGenes : updatedData.genes));
        
        geneArray[geneIndex].alleles.splice(alleleIndex, 1);
        
        setCurrentData(updatedData);
        setHasChanges(true);
    };

    // Toggle gene expansion
    const toggleGeneExpanded = (geneKey) => {
        setExpandedGenes(prev => {
            const next = new Set(prev);
            if (next.has(geneKey)) {
                next.delete(geneKey);
            } else {
                next.add(geneKey);
            }
            return next;
        });
    };

    // Get species with existing genetics data
    const speciesWithData = new Set(geneticsData.map(g => g.speciesName));

    // Stats
    const stats = {
        totalSpecies: geneticsData.length,
        published: geneticsData.filter(g => g.isPublished).length,
        drafts: geneticsData.filter(g => !g.isPublished).length,
        totalGenes: geneticsData.reduce((acc, g) => acc + (g.genes?.length || 0) + (g.markingGenes?.length || 0) + (g.coatGenes?.length || 0) + (g.otherGenes?.length || 0), 0)
    };

    if (loading && geneticsData.length === 0) {
        return (
            <div className="genetics-loading">
                <Loader2 className="spin" size={32} />
                <p>Loading genetics data...</p>
            </div>
        );
    }

    return (
        <div className="genetics-builder-tab">
            <div className="genetics-header">
                <div className="genetics-title">
                    <Dna size={28} />
                    <div>
                        <h2>Genetics Calculator Builder</h2>
                        <p>Build and manage genetics data for species calculators</p>
                    </div>
                </div>
                <button 
                    className="genetics-btn genetics-btn-secondary"
                    onClick={() => { fetchSpecies(); fetchGeneticsData(); }}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="genetics-stats-grid">
                <div className="genetics-stat-card">
                    <div className="genetics-stat-value">{stats.totalSpecies}</div>
                    <div className="genetics-stat-label">Species with Data</div>
                </div>
                <div className="genetics-stat-card genetics-stat-green">
                    <div className="genetics-stat-value">{stats.published}</div>
                    <div className="genetics-stat-label">Published</div>
                </div>
                <div className="genetics-stat-card genetics-stat-yellow">
                    <div className="genetics-stat-value">{stats.drafts}</div>
                    <div className="genetics-stat-label">Drafts</div>
                </div>
                <div className="genetics-stat-card genetics-stat-purple">
                    <div className="genetics-stat-value">{stats.totalGenes}</div>
                    <div className="genetics-stat-label">Total Genes</div>
                </div>
            </div>

            {/* Species Selector */}
            <div className="genetics-species-selector">
                <label>Select Species to Edit:</label>
                <select 
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                >
                    <option value="">-- Select a species --</option>
                    <optgroup label="With Genetics Data">
                        {species.filter(s => speciesWithData.has(s.name)).map(s => (
                            <option key={s._id} value={s.name}>
                                {s.name} {geneticsData.find(g => g.speciesName === s.name && g.isPublished) ? '✓' : '(draft)'}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Without Genetics Data">
                        {species.filter(s => !speciesWithData.has(s.name)).map(s => (
                            <option key={s._id} value={s.name}>{s.name}</option>
                        ))}
                    </optgroup>
                </select>
            </div>

            {error && (
                <div className="genetics-error-banner">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Main Editor Area */}
            {selectedSpecies && (
                <div className="genetics-editor">
                    {!currentData ? (
                        <div className="genetics-no-data">
                            <Dna size={48} />
                            <h3>No genetics data for {selectedSpecies}</h3>
                            <p>Create a new draft to start building the calculator</p>
                            <button 
                                className="genetics-btn genetics-btn-primary"
                                onClick={createNewGeneticsData}
                                disabled={saving}
                            >
                                {saving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                                Create Draft
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Editor Header */}
                            <div className="genetics-editor-header">
                                <div className="genetics-editor-info">
                                    <h3>{selectedSpecies} Genetics</h3>
                                    <div className="genetics-editor-badges">
                                        {currentData.isPublished ? (
                                            <span className="genetics-badge genetics-badge-published">
                                                <CheckCircle size={14} /> Published v{currentData.version}
                                            </span>
                                        ) : (
                                            <span className="genetics-badge genetics-badge-draft">
                                                <Edit2 size={14} /> Draft
                                            </span>
                                        )}
                                        {hasChanges && (
                                            <span className="genetics-badge genetics-badge-unsaved">
                                                <AlertTriangle size={14} /> Unsaved changes
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="genetics-editor-actions">
                                    <button 
                                        className="genetics-btn genetics-btn-secondary"
                                        onClick={() => setShowNewGeneModal(true)}
                                        disabled={currentData.isPublished}
                                    >
                                        <Plus size={16} />
                                        Add Gene
                                    </button>
                                    {selectedSpecies === 'Fancy Mouse' && (
                                        <button 
                                            className="genetics-btn genetics-btn-accent"
                                            onClick={importFromCalculator}
                                            disabled={saving || currentData.isPublished}
                                            title="Import all genes from the Fancy Mouse Genetics Calculator"
                                        >
                                            <Download size={16} />
                                            Import from Calculator
                                        </button>
                                    )}
                                    <button 
                                        className="genetics-btn genetics-btn-primary"
                                        onClick={saveGeneticsData}
                                        disabled={saving || !hasChanges || currentData.isPublished}
                                    >
                                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                        Save Draft
                                    </button>
                                    {!currentData.isPublished && (
                                        <button 
                                            className="genetics-btn genetics-btn-success"
                                            onClick={publishGeneticsData}
                                            disabled={saving || hasChanges}
                                            title={hasChanges ? 'Save changes first' : 'Publish to make active'}
                                        >
                                            <Upload size={16} />
                                            Publish
                                        </button>
                                    )}
                                </div>
                            </div>

                            {currentData.isPublished && (
                                <div className="genetics-published-notice">
                                    <AlertCircle size={18} />
                                    <span>This data is published. To make changes, duplicate it as a new draft.</span>
                                </div>
                            )}

                            {/* Color/Pattern Genes */}
                            <div className="genetics-section">
                                <h4>Color Genes ({currentData.genes?.length || 0})</h4>
                                {currentData.genes?.length === 0 ? (
                                    <div className="genetics-empty-section">
                                        <p>No genes added yet. Click "Add Gene" to start.</p>
                                    </div>
                                ) : (
                                    <div className="genetics-genes-list">
                                        {currentData.genes.map((gene, geneIndex) => (
                                            <GeneCard 
                                                key={`gene-${geneIndex}`}
                                                gene={gene}
                                                geneIndex={geneIndex}
                                                isMarking={false}
                                                isExpanded={expandedGenes.has(`gene-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`gene-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, false)}
                                                onAddAllele={() => setAddingAlleleToGene({ index: geneIndex, isMarking: false })}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, false)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && !addingAlleleToGene?.isMarking}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onSaveAllele={() => handleAddAllele(geneIndex, false)}
                                                onCancelAllele={() => setAddingAlleleToGene(null)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Marking Genes */}
                            <div className="genetics-section">
                                <h4>Markings and Patterns ({currentData.markingGenes?.length || 0})</h4>
                                {!currentData.markingGenes || currentData.markingGenes?.length === 0 ? (
                                    <div className="genetics-empty-section">
                                        <p>No markings and patterns added yet.</p>
                                    </div>
                                ) : (
                                    <div className="genetics-genes-list">
                                        {currentData.markingGenes?.map((gene, geneIndex) => (
                                            <GeneCard 
                                                key={`marking-${geneIndex}`}
                                                gene={gene}
                                                geneIndex={geneIndex}
                                                isMarking={true}
                                                isExpanded={expandedGenes.has(`marking-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`marking-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, true)}
                                                onAddAllele={() => setAddingAlleleToGene({ index: geneIndex, isMarking: true })}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, true)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.isMarking}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onSaveAllele={() => handleAddAllele(geneIndex, true)}
                                                onCancelAllele={() => setAddingAlleleToGene(null)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Coat/Texture Genes */}
                            <div className="genetics-section">
                                <h4>Coat/Texture Genes ({currentData.coatGenes?.length || 0})</h4>
                                {!currentData.coatGenes || currentData.coatGenes?.length === 0 ? (
                                    <div className="genetics-empty-section">
                                        <p>No coat/texture genes added yet.</p>
                                    </div>
                                ) : (
                                    <div className="genetics-genes-list">
                                        {currentData.coatGenes?.map((gene, geneIndex) => (
                                            <GeneCard 
                                                key={`coat-${geneIndex}`}
                                                gene={gene}
                                                geneIndex={geneIndex}
                                                isMarking={true}
                                                isCoat={true}
                                                isExpanded={expandedGenes.has(`coat-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`coat-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, false, true)}
                                                onAddAllele={() => setAddingAlleleToGene({ index: geneIndex, isCoat: true })}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, false, true)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.isCoat}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onSaveAllele={() => handleAddAllele(geneIndex, false, true)}
                                                onCancelAllele={() => setAddingAlleleToGene(null)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Other Genes */}
                            <div className="genetics-section">
                                <h4>Other Genes ({currentData.otherGenes?.length || 0})</h4>
                                {!currentData.otherGenes || currentData.otherGenes?.length === 0 ? (
                                    <div className="genetics-empty-section">
                                        <p>No other genes added yet (e.g., ear type, tail type).</p>
                                    </div>
                                ) : (
                                    <div className="genetics-genes-list">
                                        {currentData.otherGenes?.map((gene, geneIndex) => (
                                            <GeneCard 
                                                key={`other-${geneIndex}`}
                                                gene={gene}
                                                geneIndex={geneIndex}
                                                isMarking={true}
                                                isCoat={false}
                                                isOther={true}
                                                isExpanded={expandedGenes.has(`other-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`other-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, false, false, true)}
                                                onAddAllele={() => setAddingAlleleToGene({ index: geneIndex, isOther: true })}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, false, false, true)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.isOther}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onSaveAllele={() => handleAddAllele(geneIndex, false, false, true)}
                                                onCancelAllele={() => setAddingAlleleToGene(null)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            <div className="genetics-section">
                                <h4>Admin Notes</h4>
                                <textarea
                                    value={currentData.adminNotes || ''}
                                    onChange={(e) => {
                                        setCurrentData(prev => ({ ...prev, adminNotes: e.target.value }));
                                        setHasChanges(true);
                                    }}
                                    placeholder="Internal notes about this genetics data..."
                                    rows={3}
                                    disabled={currentData.isPublished}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* New Gene Modal */}
            {showNewGeneModal && (
                <div className="genetics-modal-overlay" onClick={() => setShowNewGeneModal(false)}>
                    <div className="genetics-modal" onClick={e => e.stopPropagation()}>
                        <div className="genetics-modal-header">
                            <h3>Add New Gene</h3>
                            <button onClick={() => setShowNewGeneModal(false)}><X size={20} /></button>
                        </div>
                        <div className="genetics-modal-body">
                            <div className="genetics-form-group">
                                <label>Gene Symbol *</label>
                                <input
                                    type="text"
                                    value={newGene.symbol}
                                    onChange={(e) => setNewGene(prev => ({ ...prev, symbol: e.target.value }))}
                                    placeholder="e.g., A, B, C, D"
                                    maxLength={10}
                                />
                                <span className="form-help">Short identifier used in genetic notation</span>
                            </div>
                            <div className="genetics-form-group">
                                <label>Gene Name *</label>
                                <input
                                    type="text"
                                    value={newGene.name}
                                    onChange={(e) => setNewGene(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Agouti, Brown, Albino"
                                />
                            </div>
                            <div className="genetics-form-group">
                                <label>Description</label>
                                <textarea
                                    value={newGene.description}
                                    onChange={(e) => setNewGene(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="What does this gene affect?"
                                    rows={2}
                                />
                            </div>
                            <div className="genetics-form-group">
                                <label>Gene Type *</label>
                                <select
                                    value={newGene.geneType}
                                    onChange={(e) => setNewGene(prev => ({ ...prev, geneType: e.target.value }))}
                                >
                                    <option value="color">Color Gene</option>
                                    <option value="marking">Markings and Patterns</option>
                                    <option value="coat">Coat/Texture Gene</option>
                                    <option value="other">Other (ear type, tail type, etc.)</option>
                                </select>
                            </div>
                        </div>
                        <div className="genetics-modal-footer">
                            <button className="genetics-btn genetics-btn-secondary" onClick={() => setShowNewGeneModal(false)}>
                                Cancel
                            </button>
                            <button className="genetics-btn genetics-btn-primary" onClick={handleAddGene} disabled={saving}>
                                {saving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                                Add Gene
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Gene Card Component
const GeneCard = ({ 
    gene, geneIndex, isMarking, isExpanded, onToggleExpand, 
    onDelete, onAddAllele, onRemoveAllele, isEditable,
    addingAllele, newAllele, setNewAllele, onSaveAllele, onCancelAllele
}) => {
    return (
        <div className={`genetics-gene-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="genetics-gene-header" onClick={onToggleExpand}>
                <div className="genetics-gene-info">
                    <span className="genetics-gene-symbol">{gene.symbol}</span>
                    <span className="genetics-gene-name">{gene.name}</span>
                    <span className="genetics-gene-count">{gene.alleles?.length || 0} alleles</span>
                </div>
                <div className="genetics-gene-actions">
                    {isEditable && (
                        <button 
                            className="genetics-gene-action-btn delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete gene"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
            
            {isExpanded && (
                <div className="genetics-gene-body">
                    {gene.description && (
                        <p className="genetics-gene-description">{gene.description}</p>
                    )}
                    
                    <div className="genetics-alleles-section">
                        <div className="genetics-alleles-header">
                            <h5>Allele Combinations</h5>
                            {isEditable && (
                                <button 
                                    className="genetics-btn-small"
                                    onClick={onAddAllele}
                                >
                                    <Plus size={14} /> Add Allele
                                </button>
                            )}
                        </div>
                        
                        {addingAllele && (
                            <div className="genetics-allele-form">
                                <div className="genetics-allele-form-row">
                                    <input
                                        type="text"
                                        value={newAllele.notation}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, notation: e.target.value }))}
                                        placeholder="Notation (e.g., A/A)"
                                    />
                                    <input
                                        type="text"
                                        value={newAllele.phenotype}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, phenotype: e.target.value }))}
                                        placeholder="Phenotype"
                                    />
                                    <select
                                        value={newAllele.dominance}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, dominance: e.target.value }))}
                                    >
                                        {DOMINANCE_TYPES.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                    <label className="genetics-lethal-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={newAllele.isLethal}
                                            onChange={(e) => setNewAllele(prev => ({ ...prev, isLethal: e.target.checked }))}
                                        />
                                        Lethal
                                    </label>
                                </div>
                                <div className="genetics-allele-form-actions">
                                    <button className="genetics-btn-small" onClick={onCancelAllele}>Cancel</button>
                                    <button className="genetics-btn-small primary" onClick={onSaveAllele}>Add</button>
                                </div>
                            </div>
                        )}
                        
                        {gene.alleles?.length > 0 ? (
                            <div className="genetics-alleles-table">
                                <div className="genetics-alleles-table-header">
                                    <span>Notation</span>
                                    <span>Phenotype</span>
                                    <span>Dominance</span>
                                    <span>Lethal</span>
                                    {isEditable && <span></span>}
                                </div>
                                {gene.alleles.map((allele, alleleIndex) => (
                                    <div key={alleleIndex} className="genetics-allele-row">
                                        <span className="allele-notation">{allele.notation}</span>
                                        <span>{allele.phenotype || '-'}</span>
                                        <span className="allele-dominance">{allele.dominance}</span>
                                        <span>{allele.isLethal ? '⚠️ Yes' : 'No'}</span>
                                        {isEditable && (
                                            <button 
                                                className="allele-delete-btn"
                                                onClick={() => onRemoveAllele(alleleIndex)}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="genetics-no-alleles">No alleles defined yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneticsBuilderTab;
