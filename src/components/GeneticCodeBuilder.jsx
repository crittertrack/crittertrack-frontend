import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { calculatePhenotype, GENE_LOCI } from './MouseGeneticsCalculator';

const GeneticCodeBuilder = ({ species, gender, value, onChange, onOpenCommunityForm }) => {
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [mode, setMode] = useState('visual'); // 'visual' or 'manual'
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Parse current value into genotype object
  const parseGeneticCode = (codeString) => {
    if (!codeString) return {};
    
    const genotype = {};
    const parts = codeString.replace(/,/g, ' ').trim().split(/\s+/);
    
    parts.forEach(part => {
      let match = part.match(/^([A-Za-z]+)\/([A-Za-z]+)$/);
      let allele1, allele2;
      
      if (match) {
        allele1 = match[1];
        allele2 = match[2];
      } else {
        match = part.match(/^([A-Za-z])([A-Za-z])$/);
        if (match) {
          allele1 = match[1];
          allele2 = match[2];
        }
      }
      
      if (allele1 && allele2) {
        // First, try to find an exact match (preserving case)
        const exactMatch = `${allele1}/${allele2}`;
        
        for (const [locus, data] of Object.entries(GENE_LOCI)) {
          const found = data.combinations.find(combo => combo === exactMatch);
          
          if (found) {
            genotype[locus] = found;
            return; // Exit early if exact match found
          }
        }
        
        // If no exact match, try case-insensitive matching
        const normalized = `${allele1.toLowerCase()}/${allele2.toLowerCase()}`;
        
        for (const [locus, data] of Object.entries(GENE_LOCI)) {
          const matchingCombo = data.combinations.find(combo => 
            combo.toLowerCase() === normalized
          );
          
          if (matchingCombo) {
            genotype[locus] = matchingCombo; // Use the properly formatted version from GENE_LOCI
            break;
          }
        }
      }
    });
    
    return genotype;
  };
  
  // Build genetic code string from genotype object
  const buildGeneticCode = (genotype) => {
    // Define the correct order of genes (matching GENE_LOCI keys)
    const geneOrder = ['A', 'B', 'C', 'D', 'E', 'P', 'S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U', 'Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'];
    
    return geneOrder
      .filter(locus => genotype[locus] && genotype[locus] !== '')
      .map(locus => genotype[locus])
      .join(' ');
  };
  
  const [genotype, setGenotype] = useState(() => parseGeneticCode(value));
  
  // Get valid combinations for a locus based on gender
  const getValidCombinations = (locus) => {
    const geneData = GENE_LOCI[locus];
    if (!geneData) return [];
    
    // For Mobr (xbrindle), males can only be mobr/mobr
    if (locus === 'Mobr' && gender === 'Male' && geneData.maleCombinations) {
      return geneData.maleCombinations;
    }
    
    return geneData.combinations;
  };
  
  // Handle dropdown change
  const handleGeneChange = (locus, combination) => {
    const newGenotype = { ...genotype, [locus]: combination };
    setGenotype(newGenotype);
  };
  
  // Handle save from modal
  const handleSave = () => {
    onChange(buildGeneticCode(genotype));
    setShowBuilderModal(false);
  };
  
  // Handle manual text change in modal
  const handleManualChange = (e) => {
    const newValue = e.target.value;
    if (mode === 'visual') {
      setGenotype(parseGeneticCode(newValue));
    }
  };
  
  // For Fancy Mouse: show button to open builder
  if (species === 'Fancy Mouse') {
    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Genetic Code
          </label>
          
          {/* Display current value + button */}
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 rounded bg-gray-50 font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400">Not set</span>}
            </div>
            <div data-tutorial-target="genetic-code-add-btn">
              <button
                type="button"
                onClick={() => setShowBuilderModal(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
              >
              {value ? 'Edit Genes' : 'Add'}
            </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Click the button to use the visual gene selector
          </p>
        </div>
        
        {/* Full-Screen Builder Modal */}
        {showBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center border-b p-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Genetic Code Builder - {species}
                </h2>
                <div className="flex gap-2">
                  <div data-tutorial-target="switch-manual-btn">
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'visual' ? 'manual' : 'visual')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
                    >
                    {mode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  </div>
                  <div data-tutorial-target="genetic-cancel-btn">
                    <button
                      type="button"
                      onClick={() => setShowBuilderModal(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">{mode === 'visual' ? (
                <div className="space-y-4">
                  {/* Preview of generated code */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                    {(() => {
                      const geneticCode = buildGeneticCode(genotype);
                      const result = geneticCode ? calculatePhenotype(genotype, genotype) : { phenotype: '', carriers: [], hidden: [], notes: [] };
                      return (
                        <>
                          {result.phenotype && (
                            <div>
                              <div className="text-sm font-medium text-blue-900">Phenotype:</div>
                              <div className="text-base font-semibold text-blue-800">
                                {result.phenotype}
                              </div>
                            </div>
                          )}
                          {result.carriers && result.carriers.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-blue-900">Carries:</div>
                              <div className="text-sm text-blue-700">
                                {result.carriers.join(', ')}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-blue-900">Genotype:</div>
                            <div className="font-mono text-base text-blue-800">
                              {geneticCode || 'Select genes below...'}
                            </div>
                          </div>
                          {result.notes && result.notes.length > 0 && (
                            <div className="text-xs text-orange-600 italic">
                              Note: {result.notes.join('; ')}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Basic Genes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Color Genes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {['A', 'B', 'C', 'D', 'E', 'P'].map(locus => (
                        <div key={locus} className="bg-white p-3 rounded border border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {GENE_LOCI[locus].name} ({locus})
                          </label>
                          <select
                            value={genotype[locus] || ''}
                            onChange={(e) => handleGeneChange(locus, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-</option>
                            {getValidCombinations(locus).map(combo => (
                              <option key={combo} value={combo}>{combo}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Advanced Genes */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-gray-600 mb-3"
                    >
                      {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      Advanced Genes (Markings, Patterns & Coat)
                    </button>
                    
                    {showAdvanced && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {['S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U', 'Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'].map(locus => (
                          <div key={locus} className="bg-white p-3 rounded border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {GENE_LOCI[locus].name} ({locus})
                            </label>
                            <select
                              value={genotype[locus] || ''}
                              onChange={(e) => handleGeneChange(locus, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent"
                            >
                              <option value="">-</option>
                              {getValidCombinations(locus).map(combo => (
                                <option key={combo} value={combo}>{combo}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Tip:</strong> Select the genotype for each gene that applies to your animal. 
                        Leave genes blank if unknown or not applicable. The genetic code will be generated automatically.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual Entry
                    </label>
                    <textarea
                      value={buildGeneticCode(genotype)}
                      onChange={handleManualChange}
                      placeholder="e.g., A/A B/b C/C D/D E/E P/P"
                      className="w-full p-3 border border-gray-300 rounded focus:ring-accent focus:border-accent font-mono text-sm"
                      rows="4"
                    />
                  </div>
                  <div className="bg-amber-50 p-4 rounded text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        Enter genetic code manually in format: <code className="bg-white px-1 rounded">A/A B/b C/C</code>
                        <br />Use the Visual mode for easier selection with dropdowns.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  // For other species: simple manual entry + community button
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Genetic Code
      </label>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., A/A B/b C/C or custom format for your species"
        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary font-mono text-sm"
      />
      
      <div className="bg-purple-50 p-3 rounded text-xs text-purple-800">
        <div className="flex items-start gap-2">
          <HelpCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium mb-1">
              Genetic data for {species} is not yet available
            </div>
            <div className="mb-2">
              For now, you can enter genetic information manually. If you know the genetics for this species, please help the community!
            </div>
            <button
              type="button"
              onClick={onOpenCommunityForm}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition"
            >
              Submit Genetics Info for {species}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneticCodeBuilder;
