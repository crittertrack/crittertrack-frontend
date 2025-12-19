import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';

// Import GENE_LOCI from MouseGeneticsCalculator
// For now, duplicating it here - could be moved to a shared constants file later
const GENE_LOCI = {
  A: {
    name: 'Agouti',
    combinations: [
      'ae/ae',
      'a/ae', 'a/a',
      'at/ae', 'at/a', 'at/at',
      'A/ae', 'A/a', 'A/at', 'A/A',
      'Avy/ae', 'Avy/a', 'Avy/at', 'Avy/A', 'Avy/Avy',
      'Ay/ae', 'Ay/a', 'Ay/at', 'Ay/A', 'Ay/Avy'
    ]
  },
  B: {
    name: 'Brown',
    combinations: [
      'b/b',
      'B/b', 'B/B'
    ]
  },
  C: {
    name: 'Albino',
    combinations: [
      'c/c',
      'ch/c', 'ch/ch',
      'ce/c', 'ce/ch', 'ce/ce',
      'cch/c', 'cch/ch', 'cch/ce', 'cch/cch',
      'C/c', 'C/ch', 'C/ce', 'C/cch', 'C/C'
    ]
  },
  D: {
    name: 'Dilution',
    combinations: [
      'd/d',
      'D/d', 'D/D'
    ]
  },
  E: {
    name: 'Extension',
    combinations: [
      'e/e',
      'E/e', 'E/E'
    ]
  },
  P: {
    name: 'Pink-eye',
    combinations: [
      'p/p',
      'P/p', 'P/P'
    ]
  },
  S: {
    name: 'Pied',
    combinations: [
      's/s',
      'S/s', 'S/S'
    ]
  },
  W: {
    name: 'Dominant Spotting',
    combinations: [
      'w/w',
      'W/w', 'W/W',
      'W/Wsh',
      'W/Rw',
      'Wsh/w', 'Wsh/Wsh',
      'Wsh/Rw',
      'Rw/w', 'Rw/Rw'
    ]
  },
  Spl: {
    name: 'Splashed',
    combinations: [
      'spl/spl',
      'Spl/spl', 'Spl/Spl'
    ]
  },
  Rn: {
    name: 'Roan',
    combinations: [
      'rn/rn',
      'Rn/rn', 'Rn/Rn'
    ]
  },
  Si: {
    name: 'Silver',
    combinations: [
      'si/si',
      'Si/si', 'Si/Si'
    ]
  },
  Um: {
    name: 'Umbrous',
    combinations: [
      'um/um',
      'Um/um', 'Um/Um'
    ]
  },
  Mo: {
    name: 'Mottled/Merle',
    combinations: [
      'mo/mo',
      'Mo/mo', 'Mo/Mo'
    ]
  },
  Bl: {
    name: 'Belted',
    combinations: [
      'bl/bl',
      'Bl/bl', 'Bl/Bl'
    ]
  },
  Ln: {
    name: 'Long Hair',
    combinations: [
      'ln/ln',
      'Ln/ln', 'Ln/Ln'
    ]
  },
  Re: {
    name: 'Rex',
    combinations: [
      're/re',
      'Re/re', 'Re/Re'
    ]
  },
  Fz: {
    name: 'Fuzzy',
    combinations: [
      'fz/fz',
      'Fz/fz', 'Fz/Fz'
    ]
  },
  R: {
    name: 'Caracul/Waved',
    combinations: [
      'r/r',
      'R/r', 'R/R'
    ]
  },
  Hr: {
    name: 'Hairless',
    combinations: [
      'hr/hr',
      'Hr/hr', 'Hr/Hr'
    ]
  }
};

const GeneticCodeBuilder = ({ species, value, onChange, onOpenCommunityForm }) => {
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
        const normalized = `${allele1.toLowerCase()}/${allele2.toLowerCase()}`;
        
        for (const [locus, data] of Object.entries(GENE_LOCI)) {
          const matchingCombo = data.combinations.find(combo => 
            combo.toLowerCase() === normalized
          );
          
          if (matchingCombo) {
            genotype[locus] = matchingCombo;
            break;
          }
        }
      }
    });
    
    return genotype;
  };
  
  // Build genetic code string from genotype object
  const buildGeneticCode = (genotype) => {
    return Object.entries(genotype)
      .filter(([_, value]) => value && value !== '')
      .map(([_, value]) => value)
      .join(' ');
  };
  
  const [genotype, setGenotype] = useState(() => parseGeneticCode(value));
  
  // Handle dropdown change
  const handleGeneChange = (locus, combination) => {
    const newGenotype = { ...genotype, [locus]: combination };
    setGenotype(newGenotype);
    onChange(buildGeneticCode(newGenotype));
  };
  
  // Handle manual text change
  const handleManualChange = (e) => {
    onChange(e.target.value);
    if (mode === 'visual') {
      setGenotype(parseGeneticCode(e.target.value));
    }
  };
  
  // For Fancy Mouse: show full builder
  if (species === 'Fancy Mouse') {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Genetic Code
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'visual' ? 'manual' : 'visual')}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
            >
              {mode === 'visual' ? 'Switch to Manual' : 'Switch to Visual Builder'}
            </button>
          </div>
        </div>
        
        {mode === 'visual' ? (
          <div className="space-y-2">
            {/* Preview of generated code */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Generated Code:</div>
              <div className="font-mono text-sm text-gray-800">
                {buildGeneticCode(genotype) || 'Select genes below...'}
              </div>
            </div>
            
            {/* Basic Genes (always visible) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['A', 'B', 'C', 'D', 'E', 'P'].map(locus => (
                <div key={locus}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {GENE_LOCI[locus].name} ({locus})
                  </label>
                  <select
                    value={genotype[locus] || ''}
                    onChange={(e) => handleGeneChange(locus, e.target.value)}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="">-</option>
                    {GENE_LOCI[locus].combinations.map(combo => (
                      <option key={combo} value={combo}>{combo}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            {/* Advanced Genes (collapsible) */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAdvanced ? 'Hide' : 'Show'} Advanced Genes (Marking, Coat)
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {['S', 'W', 'Spl', 'Rn', 'Si', 'Um', 'Mo', 'Bl', 'Ln', 'Re', 'Fz', 'R', 'Hr'].map(locus => (
                  <div key={locus}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {GENE_LOCI[locus].name} ({locus})
                    </label>
                    <select
                      value={genotype[locus] || ''}
                      onChange={(e) => handleGeneChange(locus, e.target.value)}
                      className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="">-</option>
                      {GENE_LOCI[locus].combinations.map(combo => (
                        <option key={combo} value={combo}>{combo}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-xs text-blue-800">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                Select the genotype for each gene. Leave blank if unknown. The genetic code will be generated automatically.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={value}
              onChange={handleManualChange}
              placeholder="e.g., A/A B/b C/C D/D E/E P/P"
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary font-mono text-sm"
            />
            <div className="flex items-start gap-2 bg-amber-50 p-3 rounded text-xs text-amber-800">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                Enter genetic code manually in format: <code className="bg-white px-1 rounded">A/A B/b C/C</code>
                <br />Use the Visual Builder for easier selection.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For other species: simple manual entry + community button
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Genetic Code
      </label>
      
      <input
        type="text"
        value={value}
        onChange={handleManualChange}
        placeholder="e.g., A/A B/b C/C or custom format for your species"
        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary font-mono text-sm"
      />
      
      <div className="flex items-start gap-2 bg-purple-50 p-3 rounded text-xs text-purple-800">
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
  );
};

export default GeneticCodeBuilder;
