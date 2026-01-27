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
    { value: 'codominant', label: 'Co-dominant' }
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
    const [expandedGenes, setExpandedGenes] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // New locus modal
    const [showNewGeneModal, setShowNewGeneModal] = useState(false);
    const [newGene, setNewGene] = useState({ symbol: '', name: '', description: '', geneType: 'color' });

    // Allele management
    const [addingAlleleToGene, setAddingAlleleToGene] = useState(null);
    const [editingAllele, setEditingAllele] = useState(null);
    const [newAllele, setNewAllele] = useState({ 
        symbol: '', 
        name: '', 
        phenotype: '', 
        dominance: 'recessive' 
    });
    
    // Allele reordering (using up/down buttons)
    
    // Combination management
    const [addingCombinationToGene, setAddingCombinationToGene] = useState(null);
    const [editingCombination, setEditingCombination] = useState(null);
    const [newCombination, setNewCombination] = useState({ 
        allele1: '', 
        allele2: '', 
        phenotype: '', 
        carrier: '', 
        isLethal: false 
    });

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
        
        if (!window.confirm('Import all loci and alleles from the Fancy Mouse Genetics Calculator? This will replace current data.')) {
            return;
        }
        
        setSaving(true);
        try {
            // Convert GENE_LOCI to database format with proper allele/combination separation
            const colorGenes = [];
            const markingGenes = [];
            const coatGenes = [];
            
            // Define which loci are marking vs coat
            const markingGeneSymbols = ['S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U'];
            const coatGeneSymbols = ['Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'];
            
            let geneOrder = 0;
            Object.entries(GENE_LOCI).forEach(([symbol, data]) => {
                // Extract unique allele symbols from combinations
                const alleleSymbols = new Set();
                data.combinations.forEach(notation => {
                    const [first, second] = notation.split('/');
                    if (first) alleleSymbols.add(first);
                    if (second) alleleSymbols.add(second);
                });
                
                // Create alleles array
                const alleles = Array.from(alleleSymbols).map((alleleSymbol, index) => ({
                    symbol: alleleSymbol,
                    name: null, // To be filled in by admin
                    phenotype: null,
                    carrier: null,
                    dominance: 'recessive', // Default - admin can adjust
                    order: index
                }));
                
                // Create combinations array
                const combinations = data.combinations.map((notation, index) => ({
                    notation,
                    phenotype: null, // To be filled in by admin
                    carrier: null, // To be filled in by admin
                    isLethal: notation.toLowerCase().includes('lethal'),
                    order: index
                }));
                
                const locus = {
                    symbol,
                    name: data.name,
                    description: null,
                    order: geneOrder++,
                    alleles,
                    combinations
                };
                
                // Categorize the locus
                if (markingGeneSymbols.includes(symbol)) {
                    markingGenes.push(locus);
                } else if (coatGeneSymbols.includes(symbol)) {
                    coatGenes.push(locus);
                } else {
                    // Color genes (A, B, C, D, E, P)
                    colorGenes.push(locus);
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
            alert(`Successfully imported ${colorGenes.length} color loci, ${markingGenes.length} marking loci, and ${coatGenes.length} coat loci!\n\nNext: Fill in allele names, dominance, and phenotypes.`);
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
        if (!window.confirm('Delete this locus and all its alleles/combinations?')) return;
        
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
                throw new Error('Failed to delete locus');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Move gene up in its category
    const handleMoveGeneUp = async (geneIndex, geneType) => {
        if (geneIndex === 0) return; // Already at top
        
        console.log('handleMoveGeneUp called:', { geneIndex, geneType, geneticsId: currentData._id });
        
        setSaving(true);
        try {
            const url = `${API_BASE_URL}/admin/genetics/${currentData._id}/genes/reorder`;
            console.log('Fetching URL:', url);
            const response = await fetch(
                url,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        fromIndex: geneIndex,
                        toIndex: geneIndex - 1,
                        geneType
                    })
                }
            );
            
            console.log('Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Reorder successful, updated data:', data);
                setCurrentData(data);
                setHasChanges(true);
            } else {
                const errorData = await response.json();
                console.error('Reorder failed:', response.status, errorData);
                throw new Error(errorData.error || 'Failed to reorder genes');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Move gene down in its category
    const handleMoveGeneDown = async (geneIndex, geneType, totalGenes) => {
        if (geneIndex === totalGenes - 1) return; // Already at bottom
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/genes/reorder`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        fromIndex: geneIndex,
                        toIndex: geneIndex + 1,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reorder genes');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Add allele to locus
    const handleAddAllele = async (geneIndex, geneType) => {
        if (!newAllele.symbol.trim()) {
            alert('Allele symbol is required (e.g., A, a, at)');
            return;
        }
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/alleles`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        symbol: newAllele.symbol.trim(),
                        name: newAllele.name.trim() || null,
                        phenotype: newAllele.phenotype.trim() || null,
                        dominance: newAllele.dominance,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                setNewAllele({ symbol: '', name: '', phenotype: '', dominance: 'recessive' });
                setAddingAlleleToGene(null);
            } else {
                throw new Error('Failed to add allele');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Remove allele from locus
    const handleRemoveAllele = async (geneIndex, alleleIndex, geneType) => {
        if (!window.confirm('Delete this allele? Combinations using it will still exist.')) return;
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/alleles/${alleleIndex}?geneType=${geneType}`,
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
                throw new Error('Failed to remove allele');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Edit allele
    const handleEditAllele = async (geneIndex, alleleIndex, geneType, alleleData) => {
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/alleles/${alleleIndex}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        symbol: alleleData.symbol.trim(),
                        name: alleleData.name.trim() || null,
                        phenotype: alleleData.phenotype.trim() || null,
                        dominance: alleleData.dominance,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                setEditingAllele(null);
            } else {
                throw new Error('Failed to edit allele');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Move allele up in dominance hierarchy (toward position 0 = most dominant)
    const handleMoveAlleleUp = async (geneIndex, alleleIndex, geneType) => {
        if (alleleIndex === 0) return; // Already at top
        
        setSaving(true);
        try {
            console.log('Attempting to reorder alleles:', { geneIndex, alleleIndex, geneType, fromIndex: alleleIndex, toIndex: alleleIndex - 1 });
            
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/alleles/reorder`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        fromIndex: alleleIndex,
                        toIndex: alleleIndex - 1,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                console.log('Reorder successful');
            } else {
                const errorData = await response.json();
                console.error('Reorder failed:', response.status, errorData);
                throw new Error(errorData.error || 'Failed to reorder alleles');
            }
        } catch (err) {
            console.error('Reorder error:', err);
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Move allele down in dominance hierarchy (toward last position = most recessive)
    const handleMoveAlleleDown = async (geneIndex, alleleIndex, geneType, totalAlleles) => {
        if (alleleIndex === totalAlleles - 1) return; // Already at bottom
        
        setSaving(true);
        try {
            console.log('Attempting to reorder alleles:', { geneIndex, alleleIndex, geneType, fromIndex: alleleIndex, toIndex: alleleIndex + 1 });
            
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/alleles/reorder`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        fromIndex: alleleIndex,
                        toIndex: alleleIndex + 1,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                console.log('Reorder successful');
            } else {
                const errorData = await response.json();
                console.error('Reorder failed:', response.status, errorData);
                throw new Error(errorData.error || 'Failed to reorder alleles');
            }
        } catch (err) {
            console.error('Reorder error:', err);
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Generate combination notation from selected alleles based on dominance hierarchy
    const generateCombinationNotation = (gene, allele1Symbol, allele2Symbol) => {
        if (!allele1Symbol || !allele2Symbol) return '';
        
        const allele1Index = gene.alleles?.findIndex(a => a.symbol === allele1Symbol) ?? -1;
        const allele2Index = gene.alleles?.findIndex(a => a.symbol === allele2Symbol) ?? -1;
        
        if (allele1Index === -1 || allele2Index === -1) return '';
        
        // Lower index = more dominant (earlier in list)
        // Convention: write dominant allele first in heterozygotes
        if (allele1Index < allele2Index) {
            // allele1 is more dominant
            return `${allele1Symbol}/${allele2Symbol}`;
        } else if (allele2Index < allele1Index) {
            // allele2 is more dominant  
            return `${allele2Symbol}/${allele1Symbol}`;
        } else {
            // Same allele (homozygote)
            return `${allele1Symbol}/${allele2Symbol}`;
        }
    };

    // Suggest phenotype and carrier based on allele dominance
    const suggestPhenotypeAndCarrier = (gene, allele1Symbol, allele2Symbol) => {
        if (!allele1Symbol || !allele2Symbol) return { phenotype: '', carrier: '' };
        
        const allele1Index = gene.alleles?.findIndex(a => a.symbol === allele1Symbol) ?? -1;
        const allele2Index = gene.alleles?.findIndex(a => a.symbol === allele2Symbol) ?? -1;
        const allele1 = gene.alleles?.[allele1Index];
        const allele2 = gene.alleles?.[allele2Index];
        
        if (!allele1 || !allele2) return { phenotype: '', carrier: '' };
        
        // If same allele (homozygote)
        if (allele1Symbol === allele2Symbol) {
            return {
                phenotype: allele1.phenotype || allele1.name || allele1Symbol,
                carrier: '' // No carrier in homozygotes
            };
        }
        
        // Heterozygote - determine which is dominant
        const dominantAllele = allele1Index < allele2Index ? allele1 : allele2;
        const recessiveAllele = allele1Index < allele2Index ? allele2 : allele1;
        
        return {
            phenotype: dominantAllele.phenotype || dominantAllele.name || dominantAllele.symbol,
            carrier: recessiveAllele.name || recessiveAllele.symbol
        };
    };

    // Add combination to locus
    const handleAddCombination = async (geneIndex, geneType) => {
        if (!newCombination.allele1 || !newCombination.allele2) {
            alert('Please select both alleles for the combination');
            return;
        }
        
        // Auto-generate notation and suggestions
        const gene = currentData[geneType][geneIndex];
        const notation = generateCombinationNotation(gene, newCombination.allele1, newCombination.allele2);
        const suggestions = suggestPhenotypeAndCarrier(gene, newCombination.allele1, newCombination.allele2);
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/combinations`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        notation: notation,
                        phenotype: newCombination.phenotype.trim() || suggestions.phenotype || null,
                        carrier: newCombination.carrier.trim() || suggestions.carrier || null,
                        isLethal: newCombination.isLethal,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                setNewCombination({ allele1: '', allele2: '', phenotype: '', carrier: '', isLethal: false });
                setAddingCombinationToGene(null);
            } else {
                throw new Error('Failed to add combination');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Remove combination from locus
    const handleRemoveCombination = async (geneIndex, combinationIndex, geneType) => {
        if (!window.confirm('Delete this combination?')) return;
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/combinations/${combinationIndex}?geneType=${geneType}`,
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
                throw new Error('Failed to remove combination');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Edit combination
    const handleEditCombination = async (geneIndex, combinationIndex, geneType, combinationData) => {
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/combinations/${combinationIndex}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        notation: combinationData.notation.trim(),
                        phenotype: combinationData.phenotype.trim() || null,
                        carrier: combinationData.carrier.trim() || null,
                        isLethal: combinationData.isLethal,
                        geneType
                    })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                setEditingCombination(null);
            } else {
                throw new Error('Failed to edit combination');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Auto-generate all combinations for a locus
    const handleGenerateCombinations = async (geneIndex, geneType) => {
        if (!window.confirm('Auto-generate all possible combinations from existing alleles? This will replace current combinations.')) return;
        
        setSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/genetics/${currentData._id}/loci/${geneIndex}/generate-combinations`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ geneType })
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setCurrentData(data);
                setHasChanges(true);
                alert('Combinations generated! You can now edit phenotypes and carrier info.');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate combinations');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
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
                                                geneType="color"
                                                isExpanded={expandedGenes.has(`gene-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`gene-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, false, false, false)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.type === 'color'}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onAddAllele={(action) => {
                                                    if (action === 'open') setAddingAlleleToGene({ index: geneIndex, type: 'color' });
                                                    else if (action === 'save') handleAddAllele(geneIndex, 'color');
                                                }}
                                                onCancelAddAllele={() => setAddingAlleleToGene(null)}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, 'color')}
                                                onEditAllele={handleEditAllele}
                                                editingAllele={editingAllele}
                                                setEditingAllele={setEditingAllele}
                                                addingCombination={addingCombinationToGene?.index === geneIndex && addingCombinationToGene?.type === 'color'}
                                                newCombination={newCombination}
                                                setNewCombination={setNewCombination}
                                                onAddCombination={(action) => {
                                                    if (action === 'open') setAddingCombinationToGene({ index: geneIndex, type: 'color' });
                                                    else if (action === 'save') handleAddCombination(geneIndex, 'color');
                                                }}
                                                onCancelAddCombination={() => setAddingCombinationToGene(null)}
                                                onRemoveCombination={(combinationIndex) => handleRemoveCombination(geneIndex, combinationIndex, 'color')}
                                                onEditCombination={handleEditCombination}
                                                editingCombination={editingCombination}
                                                setEditingCombination={setEditingCombination}
                                                onGenerateCombinations={() => handleGenerateCombinations(geneIndex, 'color')}
                                                // Allele reordering
                                                handleMoveAlleleUp={handleMoveAlleleUp}
                                                handleMoveAlleleDown={handleMoveAlleleDown}
                                                // Gene reordering
                                                handleMoveGeneUp={handleMoveGeneUp}
                                                handleMoveGeneDown={handleMoveGeneDown}
                                                totalGenes={currentData.genes?.length || 0}
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
                                                geneType="marking"
                                                isExpanded={expandedGenes.has(`marking-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`marking-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, true, false, false)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.type === 'marking'}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onAddAllele={(action) => {
                                                    if (action === 'open') setAddingAlleleToGene({ index: geneIndex, type: 'marking' });
                                                    else if (action === 'save') handleAddAllele(geneIndex, 'marking');
                                                }}
                                                onCancelAddAllele={() => setAddingAlleleToGene(null)}
                                                onEditAllele={handleEditAllele}
                                                editingAllele={editingAllele}
                                                setEditingAllele={setEditingAllele}
                                                addingCombination={addingCombinationToGene?.index === geneIndex && addingCombinationToGene?.type === 'marking'}
                                                newCombination={newCombination}
                                                setNewCombination={setNewCombination}
                                                onAddCombination={(action) => {
                                                    if (action === 'open') setAddingCombinationToGene({ index: geneIndex, type: 'marking' });
                                                    else if (action === 'save') handleAddCombination(geneIndex, 'marking');
                                                }}
                                                onCancelAddCombination={() => setAddingCombinationToGene(null)}
                                                onRemoveCombination={(combinationIndex) => handleRemoveCombination(geneIndex, combinationIndex, 'marking')}
                                                onEditCombination={handleEditCombination}
                                                editingCombination={editingCombination}
                                                setEditingCombination={setEditingCombination}
                                                onGenerateCombinations={() => handleGenerateCombinations(geneIndex, 'marking')}
                                                // Allele reordering
                                                handleMoveAlleleUp={handleMoveAlleleUp}
                                                handleMoveAlleleDown={handleMoveAlleleDown}
                                                // Gene reordering
                                                handleMoveGeneUp={handleMoveGeneUp}
                                                handleMoveGeneDown={handleMoveGeneDown}
                                                totalGenes={currentData.markingGenes?.length || 0}
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
                                                geneType="coat"
                                                isExpanded={expandedGenes.has(`coat-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`coat-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, false, true, false)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.type === 'coat'}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onAddAllele={(action) => {
                                                    if (action === 'open') setAddingAlleleToGene({ index: geneIndex, type: 'coat' });
                                                    else if (action === 'save') handleAddAllele(geneIndex, 'coat');
                                                }}
                                                onCancelAddAllele={() => setAddingAlleleToGene(null)}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, 'coat')}
                                                onEditAllele={handleEditAllele}
                                                editingAllele={editingAllele}
                                                setEditingAllele={setEditingAllele}
                                                addingCombination={addingCombinationToGene?.index === geneIndex && addingCombinationToGene?.type === 'coat'}
                                                newCombination={newCombination}
                                                setNewCombination={setNewCombination}
                                                onAddCombination={(action) => {
                                                    if (action === 'open') setAddingCombinationToGene({ index: geneIndex, type: 'coat' });
                                                    else if (action === 'save') handleAddCombination(geneIndex, 'coat');
                                                }}
                                                onCancelAddCombination={() => setAddingCombinationToGene(null)}
                                                onRemoveCombination={(combinationIndex) => handleRemoveCombination(geneIndex, combinationIndex, 'coat')}
                                                onEditCombination={handleEditCombination}
                                                editingCombination={editingCombination}
                                                setEditingCombination={setEditingCombination}
                                                onGenerateCombinations={() => handleGenerateCombinations(geneIndex, 'coat')}
                                                // Allele reordering
                                                handleMoveAlleleUp={handleMoveAlleleUp}
                                                handleMoveAlleleDown={handleMoveAlleleDown}
                                                // Gene reordering
                                                handleMoveGeneUp={handleMoveGeneUp}
                                                handleMoveGeneDown={handleMoveGeneDown}
                                                totalGenes={currentData.coatGenes?.length || 0}
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
                                                geneType="other"
                                                isExpanded={expandedGenes.has(`other-${geneIndex}`)}
                                                onToggleExpand={() => toggleGeneExpanded(`other-${geneIndex}`)}
                                                onDelete={() => handleDeleteGene(geneIndex, false, false, true)}
                                                isEditable={!currentData.isPublished}
                                                addingAllele={addingAlleleToGene?.index === geneIndex && addingAlleleToGene?.type === 'other'}
                                                newAllele={newAllele}
                                                setNewAllele={setNewAllele}
                                                onAddAllele={(action) => {
                                                    if (action === 'open') setAddingAlleleToGene({ index: geneIndex, type: 'other' });
                                                    else if (action === 'save') handleAddAllele(geneIndex, 'other');
                                                }}
                                                onCancelAddAllele={() => setAddingAlleleToGene(null)}
                                                onRemoveAllele={(alleleIndex) => handleRemoveAllele(geneIndex, alleleIndex, 'other')}
                                                onEditAllele={handleEditAllele}
                                                editingAllele={editingAllele}
                                                setEditingAllele={setEditingAllele}
                                                addingCombination={addingCombinationToGene?.index === geneIndex && addingCombinationToGene?.type === 'other'}
                                                newCombination={newCombination}
                                                setNewCombination={setNewCombination}
                                                onAddCombination={(action) => {
                                                    if (action === 'open') setAddingCombinationToGene({ index: geneIndex, type: 'other' });
                                                    else if (action === 'save') handleAddCombination(geneIndex, 'other');
                                                }}
                                                onCancelAddCombination={() => setAddingCombinationToGene(null)}
                                                onRemoveCombination={(combinationIndex) => handleRemoveCombination(geneIndex, combinationIndex, 'other')}
                                                onEditCombination={handleEditCombination}
                                                editingCombination={editingCombination}
                                                setEditingCombination={setEditingCombination}
                                                onGenerateCombinations={() => handleGenerateCombinations(geneIndex, 'other')}
                                                // Allele reordering
                                                handleMoveAlleleUp={handleMoveAlleleUp}
                                                handleMoveAlleleDown={handleMoveAlleleDown}
                                                // Gene reordering
                                                handleMoveGeneUp={handleMoveGeneUp}
                                                handleMoveGeneDown={handleMoveGeneDown}
                                                totalGenes={currentData.otherGenes?.length || 0}
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
    gene, geneIndex, geneType, isExpanded, onToggleExpand, 
    onDelete, isEditable,
    // Allele management
    addingAllele, newAllele, setNewAllele, onAddAllele, onCancelAddAllele, onRemoveAllele, onEditAllele,
    editingAllele, setEditingAllele,
    // Combination management
    addingCombination, newCombination, setNewCombination, onAddCombination, onCancelAddCombination, onRemoveCombination, onEditCombination,
    editingCombination, setEditingCombination,
    onGenerateCombinations,
    // Allele reordering
    handleMoveAlleleUp, handleMoveAlleleDown,
    // Gene reordering
    handleMoveGeneUp, handleMoveGeneDown, totalGenes
}) => {
    return (
        <div className={`genetics-gene-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="genetics-gene-header" onClick={onToggleExpand}>
                <div className="genetics-gene-info">
                    <span className="genetics-gene-symbol">{gene.symbol}</span>
                    <span className="genetics-gene-name">{gene.name}</span>
                    <span className="genetics-gene-count">
                        {gene.alleles?.length || 0} alleles, {gene.combinations?.length || 0} combinations
                    </span>
                </div>
                <div className="genetics-gene-actions">
                    {isEditable && (
                        <>
                            <button 
                                className="genetics-gene-action-btn reorder"
                                onClick={(e) => { 
                                    console.log('Up button clicked!', { geneIndex, geneType });
                                    e.stopPropagation(); 
                                    handleMoveGeneUp(geneIndex, geneType); 
                                }}
                                disabled={geneIndex === 0}
                                title="Move up"
                            >
                                <ChevronUp size={16} />
                            </button>
                            <button 
                                className="genetics-gene-action-btn reorder"
                                onClick={(e) => { 
                                    console.log('Down button clicked!', { geneIndex, geneType, totalGenes });
                                    e.stopPropagation(); 
                                    handleMoveGeneDown(geneIndex, geneType, totalGenes); 
                                }}
                                disabled={geneIndex === totalGenes - 1}
                                title="Move down"
                            >
                                <ChevronDown size={16} />
                            </button>
                        </>
                    )}
                    {isEditable && (
                        <button 
                            className="genetics-gene-action-btn delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete locus"
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
                    
                    {/* ALLELES SECTION */}
                    <div className="genetics-alleles-section">
                        <div className="genetics-alleles-header">
                            <h5>Alleles ({gene.alleles?.length || 0})</h5>
                            {isEditable && (
                                <button 
                                    className="genetics-btn-small"
                                    onClick={() => onAddAllele('open')}
                                >
                                    <Plus size={14} /> Add Allele
                                </button>
                            )}
                        </div>
                        
                        {addingAllele && (
                            <div className="genetics-allele-form">
                                <div className="genetics-form-grid">
                                    <input
                                        type="text"
                                        value={newAllele.symbol}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, symbol: e.target.value }))}
                                        placeholder="Symbol (A, a, at)"
                                    />
                                    <input
                                        type="text"
                                        value={newAllele.name}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Name (optional)"
                                    />
                                    <input
                                        type="text"
                                        value={newAllele.phenotype}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, phenotype: e.target.value }))}
                                        placeholder="Phenotype (optional)"
                                    />
                                    <select
                                        value={newAllele.dominance}
                                        onChange={(e) => setNewAllele(prev => ({ ...prev, dominance: e.target.value }))}
                                    >
                                        {DOMINANCE_TYPES.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                    <div className="genetics-form-actions">
                                        <button className="genetics-btn-small" onClick={onCancelAddAllele}>Cancel</button>
                                        <button className="genetics-btn-small primary" onClick={() => onAddAllele('save')}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {gene.alleles?.length > 0 ? (
                            <div className="genetics-responsive-table">
                                {gene.alleles.map((allele, alleleIndex) => {
                                    const isEditing = editingAllele?.geneIndex === geneIndex && editingAllele?.alleleIndex === alleleIndex;
                                    
                                    return (
                                        <div 
                                            key={alleleIndex} 
                                            className="genetics-table-row"
                                        >
                                            {isEditing ? (
                                                <div className="genetics-edit-form">
                                                    <div className="genetics-form-grid">
                                                        <input
                                                            type="text"
                                                            defaultValue={allele.symbol}
                                                            onBlur={(e) => setEditingAllele(prev => ({ ...prev, symbol: e.target.value }))}
                                                            placeholder="Symbol"
                                                        />
                                                        <input
                                                            type="text"
                                                            defaultValue={allele.name || ''}
                                                            onBlur={(e) => setEditingAllele(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder="Name"
                                                        />
                                                        <input
                                                            type="text"
                                                            defaultValue={allele.phenotype || ''}
                                                            onBlur={(e) => setEditingAllele(prev => ({ ...prev, phenotype: e.target.value }))}
                                                            placeholder="Phenotype"
                                                        />
                                                        <select
                                                            defaultValue={allele.dominance}
                                                            onChange={(e) => setEditingAllele(prev => ({ ...prev, dominance: e.target.value }))}
                                                        >
                                                            {DOMINANCE_TYPES.map(d => (
                                                                <option key={d.value} value={d.value}>{d.label}</option>
                                                            ))}
                                                        </select>
                                                        <div className="genetics-form-actions">
                                                            <button 
                                                                className="genetics-btn-small" 
                                                                onClick={() => setEditingAllele(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                className="genetics-btn-small primary" 
                                                                onClick={() => onEditAllele(geneIndex, alleleIndex, geneType, editingAllele)}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="genetics-table-cell">
                                                        <label>Rank:</label>
                                                        <div className="rank-with-controls">
                                                            {isEditable && (
                                                                <div className="genetics-reorder-buttons">
                                                                    <button 
                                                                        className="genetics-reorder-btn"
                                                                        onClick={() => handleMoveAlleleUp(geneIndex, alleleIndex, geneType)}
                                                                        disabled={alleleIndex === 0}
                                                                        title="Move up (more dominant)"
                                                                    >
                                                                        <ChevronUp size={14} />
                                                                    </button>
                                                                    <button 
                                                                        className="genetics-reorder-btn"
                                                                        onClick={() => handleMoveAlleleDown(geneIndex, alleleIndex, geneType, gene.alleles?.length)}
                                                                        disabled={alleleIndex === (gene.alleles?.length - 1)}
                                                                        title="Move down (more recessive)"
                                                                    >
                                                                        <ChevronDown size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <span className="allele-rank">
                                                                #{alleleIndex + 1} {alleleIndex === 0 ? '(Most Dominant)' : alleleIndex === (gene.alleles?.length - 1) ? '(Most Recessive)' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Symbol:</label>
                                                        <span className="allele-symbol">{allele.symbol}</span>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Name:</label>
                                                        <span>{allele.name || '-'}</span>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Phenotype:</label>
                                                        <span>{allele.phenotype || '-'}</span>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Dominance:</label>
                                                        <span className="allele-dominance">{allele.dominance}</span>
                                                    </div>
                                                    {isEditable && (
                                                        <div className="genetics-table-actions">
                                                            <button 
                                                                className="genetics-edit-btn"
                                                                onClick={() => setEditingAllele({ 
                                                                    geneIndex, 
                                                                    alleleIndex, 
                                                                    symbol: allele.symbol,
                                                                    name: allele.name || '',
                                                                    phenotype: allele.phenotype || '',
                                                                    dominance: allele.dominance
                                                                })}
                                                                title="Edit allele"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button 
                                                                className="genetics-delete-btn"
                                                                onClick={() => onRemoveAllele(alleleIndex)}
                                                                title="Delete allele"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="genetics-no-data">No alleles defined yet. Add alleles first, then generate combinations.</p>
                        )}
                    </div>
                    
                    {/* COMBINATIONS SECTION */}
                    <div className="genetics-combinations-section">
                        <div className="genetics-combinations-header">
                            <h5>Gene Combinations ({gene.combinations?.length || 0})</h5>
                            {isEditable && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {gene.alleles?.length > 0 && (
                                        <button 
                                            className="genetics-btn-small accent"
                                            onClick={onGenerateCombinations}
                                            title="Auto-generate all possible combinations from alleles"
                                        >
                                            <RefreshCw size={14} /> Generate
                                        </button>
                                    )}
                                    <button 
                                        className="genetics-btn-small"
                                        onClick={() => onAddCombination('open')}
                                    >
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {addingCombination && (
                            <div className="genetics-combination-form">
                                <div className="genetics-form-grid">
                                    <div className="allele-selector">
                                        <label>First Allele:</label>
                                        <select
                                            value={newCombination.allele1}
                                            onChange={(e) => setNewCombination(prev => ({ ...prev, allele1: e.target.value }))}
                                        >
                                            <option value="">Select allele...</option>
                                            {gene.alleles?.map((allele, index) => (
                                                <option key={index} value={allele.symbol}>
                                                    {allele.symbol} - {allele.name || 'Unnamed'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="allele-selector">
                                        <label>Second Allele:</label>
                                        <select
                                            value={newCombination.allele2}
                                            onChange={(e) => setNewCombination(prev => ({ ...prev, allele2: e.target.value }))}
                                        >
                                            <option value="">Select allele...</option>
                                            {gene.alleles?.map((allele, index) => (
                                                <option key={index} value={allele.symbol}>
                                                    {allele.symbol} - {allele.name || 'Unnamed'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={newCombination.phenotype}
                                        onChange={(e) => setNewCombination(prev => ({ ...prev, phenotype: e.target.value }))}
                                        placeholder="Phenotype"
                                    />
                                    <input
                                        type="text"
                                        value={newCombination.carrier}
                                        onChange={(e) => setNewCombination(prev => ({ ...prev, carrier: e.target.value }))}
                                        placeholder="Carrier (optional)"
                                    />
                                    <label className="genetics-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={newCombination.isLethal}
                                            onChange={(e) => setNewCombination(prev => ({ ...prev, isLethal: e.target.checked }))}
                                        />
                                        Lethal
                                    </label>
                                    <div className="genetics-form-actions">
                                        <button className="genetics-btn-small" onClick={onCancelAddCombination}>Cancel</button>
                                        <button className="genetics-btn-small primary" onClick={() => onAddCombination('save')}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {gene.combinations?.length > 0 ? (
                            <div className="genetics-responsive-table">
                                {gene.combinations.map((combination, combinationIndex) => {
                                    const isEditing = editingCombination?.geneIndex === geneIndex && editingCombination?.combinationIndex === combinationIndex;
                                    
                                    return (
                                        <div key={combinationIndex} className="genetics-table-row">
                                            {isEditing ? (
                                                <div className="genetics-edit-form">
                                                    <div className="genetics-form-grid">
                                                        <input
                                                            type="text"
                                                            defaultValue={combination.notation}
                                                            onBlur={(e) => setEditingCombination(prev => ({ ...prev, notation: e.target.value }))}
                                                            placeholder="Notation"
                                                        />
                                                        <input
                                                            type="text"
                                                            defaultValue={combination.phenotype || ''}
                                                            onBlur={(e) => setEditingCombination(prev => ({ ...prev, phenotype: e.target.value }))}
                                                            placeholder="Phenotype"
                                                        />
                                                        <input
                                                            type="text"
                                                            defaultValue={combination.carrier || ''}
                                                            onBlur={(e) => setEditingCombination(prev => ({ ...prev, carrier: e.target.value }))}
                                                            placeholder="Carrier"
                                                        />
                                                        <label className="genetics-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                defaultChecked={combination.isLethal}
                                                                onChange={(e) => setEditingCombination(prev => ({ ...prev, isLethal: e.target.checked }))}
                                                            />
                                                            Lethal
                                                        </label>
                                                        <div className="genetics-form-actions">
                                                            <button 
                                                                className="genetics-btn-small" 
                                                                onClick={() => setEditingCombination(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                className="genetics-btn-small primary" 
                                                                onClick={() => onEditCombination(geneIndex, combinationIndex, geneType, editingCombination)}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="genetics-table-cell">
                                                        <label>Notation:</label>
                                                        <span className="combination-notation">{combination.notation}</span>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Phenotype:</label>
                                                        <span>{combination.phenotype || '-'}</span>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Carrier:</label>
                                                        <span>{combination.carrier || '-'}</span>
                                                    </div>
                                                    <div className="genetics-table-cell">
                                                        <label>Lethal:</label>
                                                        <span>{combination.isLethal ? '⚠️ Yes' : 'No'}</span>
                                                    </div>
                                                    {isEditable && (
                                                        <div className="genetics-table-actions">
                                                            <button 
                                                                className="genetics-edit-btn"
                                                                onClick={() => setEditingCombination({ 
                                                                    geneIndex, 
                                                                    combinationIndex, 
                                                                    notation: combination.notation,
                                                                    phenotype: combination.phenotype || '',
                                                                    carrier: combination.carrier || '',
                                                                    isLethal: combination.isLethal
                                                                })}
                                                                title="Edit combination"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button 
                                                                className="genetics-delete-btn"
                                                                onClick={() => onRemoveCombination(combinationIndex)}
                                                                title="Delete combination"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="genetics-no-data">
                                No combinations defined. {gene.alleles?.length > 0 ? 'Click "Generate" to auto-create them.' : 'Add alleles first.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneticsBuilderTab;
