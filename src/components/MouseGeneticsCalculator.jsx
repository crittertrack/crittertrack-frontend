import React, { useState } from 'react';
import { X, Book } from 'lucide-react';

// Define all gene loci with their possible allele combinations
const GENE_LOCI = {
  A: {
    name: 'A-locus',
    combinations: [
      'ae/ae',
      'a/ae', 'a/a',
      'at/ae', 'at/a', 'at/at',
      'A/ae', 'A/a', 'A/at', 'A/A',
      'Avy/ae', 'Avy/a', 'Avy/at', 'Avy/A', 'Avy/Avy',
      'Ay/ae', 'Ay/a', 'Ay/at', 'Ay/A', 'Ay/Avy', 'Ay/Ay (lethal)'
    ]
  },
  B: {
    name: 'B-locus',
    combinations: [
      'b/b',
      'B/b', 'B/B'
    ]
  },
  C: {
    name: 'C-locus',
    combinations: [
      'c/c',
      'ch/c', 'ch/ch',
      'ce/c', 'ce/ch', 'ce/ce',
      'cch/c', 'cch/ch', 'cch/ce', 'cch/cch',
      'C/c', 'C/ch', 'C/ce', 'C/cch', 'C/C'
    ]
  },
  D: {
    name: 'D-locus',
    combinations: [
      'd/d',
      'D/d', 'D/D'
    ]
  },
  E: {
    name: 'E-locus',
    combinations: [
      'e/e',
      'E/e', 'E/E'
    ]
  },
  P: {
    name: 'P-locus',
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
      'Rw/w', 'Rw/W (lethal)', 'Rw/Wsh (lethal)', 'Rw/Rw (lethal)',
      'Wsh/w', 'Wsh/Wsh (lethal)',
      'W/w', 'W/Wsh (lethal)', 'W/W (lethal)'
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
  Mobr: {
    name: 'xbrindle',
    combinations: [
      'mobr/mobr',
      'Mobr/mobr', 'Mobr/Mobr'
    ]
  },
  Go: {
    name: 'Shorthair/Longhair',
    combinations: [
      'go/go',
      'Go/go', 'Go/Go'
    ]
  },
  Re: {
    name: 'Astrex',
    combinations: [
      're/re',
      'Re/re', 'Re/Re'
    ]
  },
  Sa: {
    name: 'Satin',
    combinations: [
      'sa/sa',
      'Sa/sa', 'Sa/Sa'
    ]
  },
  Rst: {
    name: 'Rosette',
    combinations: [
      'rst/rst',
      'Rst/rst', 'Rst/Rst'
    ]
  },
  Fz: {
    name: 'Fuzz',
    combinations: [
      'fz/fz',
      'Fz/fz', 'Fz/Fz'
    ]
  },
  Nu: {
    name: 'Nude/Hairless',
    combinations: [
      'nu/nu',
      'Nu/nu', 'Nu/Nu'
    ]
  }
};

// Calculate phenotype from genotype
const calculatePhenotype = (genotype) => {
  // Parse allele combinations
  const parsed = {};
  Object.keys(GENE_LOCI).forEach(locus => {
    const combo = genotype[locus];
    if (combo && combo.includes('(lethal)')) {
      return 'LETHAL COMBINATION';
    }
    if (combo) {
      const alleles = combo.replace(' (lethal)', '').split('/');
      parsed[locus] = alleles;
    }
  });

  // Check for lethal combinations
  if (genotype.A === 'Ay/Ay (lethal)') return 'LETHAL: Dominant Yellow Homozygous';
  if (genotype.W && genotype.W.includes('lethal')) return 'LETHAL: Dominant Spotting Homozygous';
  if (genotype.W && genotype.W.includes('Wsh/Wsh')) return 'LETHAL: Wsh Homozygous';
  if (genotype.W && genotype.W.includes('Rw/')) return 'LETHAL: Rw Combination';

  let color = '';
  let pattern = '';
  let texture = '';
  let markings = [];

  // Albino override
  if (genotype.C === 'c/c') {
    return genotype.P === 'p/p' ? 'Pink-Eyed White (Albino)' : 'Pink-Eyed White (Albino)';
  }

  // Recessive red/yellow
  if (genotype.E === 'e/e') {
    if (genotype.P === 'p/p') {
      color = 'Recessive Fawn';
    } else {
      color = 'Recessive Red';
    }
    return color;
  }

  // Dominant yellow
  if (genotype.A && (genotype.A.startsWith('Ay/'))) {
    if (genotype.P === 'p/p') {
      color = 'Dominant Fawn';
    } else {
      color = 'Dominant Red';
    }
    return color;
  }

  // Viable yellow (brindle)
  if (genotype.A && genotype.A.startsWith('Avy/')) {
    color = 'Brindle';
    return color;
  }

  // Base color determination
  const isAgouti = genotype.A && (genotype.A.includes('A/') || genotype.A.endsWith('/A'));
  const isTan = genotype.A && genotype.A.includes('at/') && !genotype.A.includes('A/');
  const isBlack = genotype.A && (genotype.A.includes('a/a') || genotype.A.includes('a/ae') || genotype.A.includes('ae/ae'));

  // Brown/Black base
  const isBrown = genotype.B === 'b/b';
  
  if (isAgouti) {
    pattern = 'Agouti';
    color = isBrown ? 'Cinnamon' : 'Agouti';
  } else if (isTan) {
    pattern = 'Tan';
    color = isBrown ? 'Chocolate Tan' : 'Black Tan';
  } else if (isBlack) {
    pattern = 'Self';
    color = isBrown ? 'Chocolate' : 'Black';
  }

  // Dilutions
  if (genotype.D === 'd/d') {
    if (color === 'Black') color = 'Blue';
    else if (color === 'Chocolate') color = 'Lilac';
    else if (color === 'Agouti') color = 'Silver Agouti';
    else if (color === 'Cinnamon') color = 'Argente';
    else if (color === 'Black Tan') color = 'Blue Tan';
    else if (color === 'Chocolate Tan') color = 'Lilac Tan';
  }

  if (genotype.P === 'p/p') {
    if (!color.includes('Fawn') && !color.includes('Red')) {
      color = `Pink-Eyed ${color}`;
    }
  }

  // C-locus modifications
  if (genotype.C === 'cch/cch' || genotype.C?.includes('cch/')) {
    if (!genotype.C.includes('C/cch')) {
      color = `Chinchilla ${color}`;
    }
  }
  if (genotype.C === 'ch/ch' || (genotype.C?.includes('ch/') && !genotype.C.includes('C/ch') && !genotype.C.includes('cch/ch'))) {
    color = `Himalayan ${color}`;
  }
  if (genotype.C === 'ce/ce' || (genotype.C?.includes('ce/') && !genotype.C.includes('C/ce'))) {
    color = `Beige ${color}`;
  }

  // Markings
  if (genotype.S === 's/s') {
    markings.push('Pied');
  }

  if (genotype.W === 'W/w') {
    markings.push('Variegated');
  } else if (genotype.W === 'Wsh/w') {
    markings.push('Banded');
  } else if (genotype.W === 'Rw/w') {
    markings.push('Rumpwhite');
  } else if (genotype.W && genotype.W.includes('W/') && genotype.W !== 'W/w') {
    markings.push('Dominant White Spotting');
  }

  if (genotype.Spl && genotype.Spl.includes('Spl/')) {
    markings.push('Splashed');
  }

  if (genotype.Rn && genotype.Rn.includes('Rn/')) {
    markings.push('Roan');
  }

  if (genotype.Si && genotype.Si.includes('Si/')) {
    markings.push('Silvered');
  }

  if (genotype.Mobr && genotype.Mobr.includes('Mobr/')) {
    markings.push('xbrindle');
  }

  if (genotype.Go && genotype.Go.includes('Go/')) {
    markings.push('Longhair');
  }

  // Texture
  if (genotype.Re === 're/re') {
    texture = 'Astrex';
  }
  if (genotype.Sa === 'sa/sa') {
    texture = texture ? `${texture} Satin` : 'Satin';
  }
  if (genotype.Rst && genotype.Rst.includes('Rst/')) {
    texture = texture ? `${texture} Rosette` : 'Rosette';
  }
  if (genotype.Fz === 'fz/fz') {
    texture = texture ? `${texture} Fuzz` : 'Fuzz';
  }
  if (genotype.Nu === 'nu/nu') {
    texture = 'Nude/Hairless';
  }

  // Combine results
  let result = color;
  if (markings.length > 0) {
    result += ' ' + markings.join(', ');
  }
  if (texture) {
    result += ` (${texture})`;
  }

  return result || 'Unknown';
};

const MouseGeneticsCalculator = ({ API_BASE_URL, authToken }) => {
  // Initialize with default genotypes
  const defaultGenotype = {
    A: 'A/A',
    B: 'B/B',
    C: 'C/C',
    D: 'D/D',
    E: 'E/E',
    P: 'P/P',
    S: 'S/S',
    W: 'w/w',
    Spl: 'spl/spl',
    Rn: 'rn/rn',
    Si: 'si/si',
    Mobr: 'mobr/mobr',
    Go: 'go/go',
    Re: 'Re/Re',
    Sa: 'Sa/Sa',
    Rst: 'rst/rst',
    Fz: 'Fz/Fz',
    Nu: 'Nu/Nu'
  };

  const [parent1, setParent1] = useState(defaultGenotype);
  const [parent2, setParent2] = useState(defaultGenotype);
  const [showExamples, setShowExamples] = useState(false);
  const [activeTab, setActiveTab] = useState('self');

  const updateParent1 = (locus, value) => {
    setParent1({ ...parent1, [locus]: value });
  };

  const updateParent2 = (locus, value) => {
    setParent2({ ...parent2, [locus]: value });
  };

  const parent1Phenotype = calculatePhenotype(parent1);
  const parent2Phenotype = calculatePhenotype(parent2);

  // Example varieties
  const EXAMPLE_TABS = {
    self: {
      name: 'Self Colors',
      examples: [
        { name: 'Black', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Solid black mouse' },
        { name: 'Chocolate', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Rich brown color' },
        { name: 'Blue', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }, description: 'Blue-gray dilute' },
        { name: 'Lilac', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }, description: 'Pinkish-gray dilute' },
      ]
    },
    agouti: {
      name: 'Agouti Varieties',
      examples: [
        { name: 'Agouti', genotype: { A: 'A/A', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Wild-type coloring' },
        { name: 'Cinnamon', genotype: { A: 'A/A', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Brown agouti' },
        { name: 'Silver Agouti', genotype: { A: 'A/A', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }, description: 'Dilute agouti' },
      ]
    },
    tan: {
      name: 'Tan Varieties',
      examples: [
        { name: 'Black Tan', genotype: { A: 'at/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Black with tan belly' },
        { name: 'Chocolate Tan', genotype: { A: 'at/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Chocolate with tan belly' },
        { name: 'Blue Tan', genotype: { A: 'at/at', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }, description: 'Blue with tan belly' },
      ]
    },
    cdilute: {
      name: 'C-Locus Dilutes',
      examples: [
        { name: 'Chinchilla', genotype: { A: 'A/A', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Gray agouti' },
        { name: 'Himalayan', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'White with dark points' },
        { name: 'PEW', genotype: { A: 'a/a', B: 'B/B', C: 'c/c', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Pink-eyed white albino' },
      ]
    },
    marked: {
      name: 'Marked Varieties',
      examples: [
        { name: 'Piebald', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s' }, description: 'White spotting' },
        { name: 'Banded', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 'S/s' }, description: 'White band' },
      ]
    },
    yellow: {
      name: 'Yellow Varieties',
      examples: [
        { name: 'Dominant Yellow', genotype: { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Yellow/orange' },
        { name: 'Recessive Yellow', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'P/P' }, description: 'Red/yellow' },
        { name: 'Brindle', genotype: { A: 'Avy/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }, description: 'Mottled yellow/black' },
      ]
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mouse Genetics Calculator</h1>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Book size={18} />
          {showExamples ? 'Hide' : 'Show'} Examples
        </button>
      </div>

      {showExamples && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {Object.keys(EXAMPLE_TABS).map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === tabKey
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-100'
                }`}
              >
                {EXAMPLE_TABS[tabKey].name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAMPLE_TABS[activeTab].examples.map((example, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-1">{example.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{example.description}</p>
                <div className="text-xs text-gray-500 font-mono">
                  {Object.entries(example.genotype).map(([locus, combo]) => (
                    <span key={locus} className="mr-2">{locus}: {combo}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent 1 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Parent 1</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(GENE_LOCI).map(([locus, data]) => (
              <div key={locus}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {locus} - {data.name}
                </label>
                <select
                  value={parent1[locus]}
                  onChange={(e) => updateParent1(locus, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {data.combinations.map((combo) => (
                    <option key={combo} value={combo}>
                      {combo}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border-2 border-blue-500">
            <p className="text-sm font-medium text-gray-700 mb-1">Phenotype:</p>
            <p className={`text-lg font-semibold ${parent1Phenotype.includes('LETHAL') ? 'text-red-600' : 'text-blue-800'}`}>
              {parent1Phenotype}
            </p>
          </div>
        </div>

        {/* Parent 2 */}
        <div className="bg-pink-50 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-pink-800 mb-4">Parent 2</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(GENE_LOCI).map(([locus, data]) => (
              <div key={locus}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {locus} - {data.name}
                </label>
                <select
                  value={parent2[locus]}
                  onChange={(e) => updateParent2(locus, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {data.combinations.map((combo) => (
                    <option key={combo} value={combo}>
                      {combo}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border-2 border-pink-500">
            <p className="text-sm font-medium text-gray-700 mb-1">Phenotype:</p>
            <p className={`text-lg font-semibold ${parent2Phenotype.includes('LETHAL') ? 'text-red-600' : 'text-pink-800'}`}>
              {parent2Phenotype}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MouseGeneticsCalculator;
