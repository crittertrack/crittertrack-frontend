import React, { useState } from 'react';
import { X, Book } from 'lucide-react';

// Define all gene loci with their possible allele combinations
const GENE_LOCI = {
  A: {
    name: 'Agouti',

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
      'Mobr/mobr'
    ],
    maleCombinations: [
      'mobr/mobr'
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
  },
  U: {
    name: 'Umbrous',
    combinations: [
      'u/u',
      'U/u', 'U/U'
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
  if (genotype.A === 'Ay/Ay (lethal)') return { phenotype: 'LETHAL: Homozygous Dominant Red', carriers: [], hidden: [] };
  if (genotype.W && genotype.W.includes('lethal')) return { phenotype: 'LETHAL: Dominant Spotting Homozygous', carriers: [], hidden: [] };
  if (genotype.W && genotype.W.includes('Wsh/Wsh')) return { phenotype: 'LETHAL: Wsh Homozygous', carriers: [], hidden: [] };
  if (genotype.W && genotype.W.includes('Rw/')) return { phenotype: 'LETHAL: Rw Combination', carriers: [], hidden: [] };

  let color = '';
  let pattern = '';
  let texture = '';
  let markings = [];
  let carriers = [];
  let hidden = [];

  // Albino override
  if (genotype.C === 'c/c') {
    return { phenotype: genotype.P === 'p/p' ? 'Pink-Eyed White (Albino)' : 'Pink-Eyed White (Albino)', carriers, hidden };
  }

  // Recessive red/yellow
  if (genotype.E === 'e/e') {
    if (genotype.P === 'p/p') {
      color = 'Recessive Fawn';
    } else {
      color = 'Recessive Red';
    }
    return { phenotype: color, carriers, hidden };
  }

  // Dominant yellow/red (Ay)
  if (genotype.A && (genotype.A.startsWith('Ay/'))) {
    // Track what Ay is paired with
    if (genotype.A === 'Ay/ae') carriers.push('Extreme Black');
    else if (genotype.A === 'Ay/a') carriers.push('Black');
    else if (genotype.A === 'Ay/A') carriers.push('Agouti');
    else if (genotype.A === 'Ay/Avy') carriers.push('Brindle');
    
    // Determine if it's tan variant
    const isTanVariant = genotype.A === 'Ay/at';
    
    if (genotype.P === 'p/p') {
      color = isTanVariant ? 'Dominant Fawn Tan' : 'Dominant Fawn';
    } else {
      color = isTanVariant ? 'Dominant Red Tan' : 'Dominant Red';
    }
    return { phenotype: color, carriers, hidden };
  }

  // Viable yellow (brindle - Avy)
  if (genotype.A && genotype.A.startsWith('Avy/')) {
    // Track what Avy is paired with
    if (genotype.A === 'Avy/ae') carriers.push('Extreme Black');
    else if (genotype.A === 'Avy/a') carriers.push('Black');
    else if (genotype.A === 'Avy/A') carriers.push('Agouti');
    
    // Determine if it's tan variant
    const isTanVariant = genotype.A === 'Avy/at';
    color = isTanVariant ? 'Brindle Tan' : 'Brindle';
    return { phenotype: color, carriers, hidden };
  }

  // Base color determination
  const isAgouti = genotype.A && (genotype.A.includes('A/') || genotype.A.endsWith('/A'));
  const isTan = genotype.A && genotype.A.includes('at/') && !genotype.A.includes('A/');
  const isBlack = genotype.A && (genotype.A.includes('a/a') || genotype.A.includes('a/ae') || genotype.A.includes('ae/ae'));
  const isExtremeBlack = genotype.A === 'ae/ae';
  const isExtremeTan = genotype.A === 'at/ae';

  // Track carriers for A-locus
  if (genotype.A === 'A/a') carriers.push('Black');
  else if (genotype.A === 'A/ae') carriers.push('Extreme Black');
  else if (genotype.A === 'A/at') {
    // A/at is agouti tan (tan shows visually)
  }
  else if (genotype.A === 'a/ae') carriers.push('Extreme Black');

  // Brown/Black base
  const isBrown = genotype.B === 'b/b';
  if (genotype.B === 'B/b') carriers.push('Chocolate');
  
  if (isAgouti) {
    pattern = 'Agouti';
    // Check for A/at (agouti tan)
    if (genotype.A === 'A/at') {
      color = isBrown ? 'Cinnamon Tan' : 'Agouti Tan';
    } else {
      color = isBrown ? 'Cinnamon' : 'Agouti';
    }
  } else if (isTan) {
    pattern = 'Tan';
    if (isExtremeTan) {
      color = isBrown ? 'Extreme Chocolate Tan' : 'Extreme Black Tan';
    } else {
      color = isBrown ? 'Chocolate Tan' : 'Black Tan';
    }
  } else if (isBlack) {
    pattern = 'Self';
    if (isExtremeBlack) {
      color = isBrown ? 'Chocolate' : 'Extreme Black';
    } else {
      color = isBrown ? 'Chocolate' : 'Black';
    }
  }

  // Dilutions
  if (genotype.D === 'd/d') {
    if (color === 'Black') color = 'Blue';
    else if (color === 'Chocolate') color = 'Lilac';
    else if (color === 'Agouti') color = 'Silver Agouti';
    else if (color === 'Cinnamon') color = 'Argente';
    else if (color === 'Black Tan') color = 'Blue Tan';
    else if (color === 'Chocolate Tan') color = 'Lilac Tan';
  } else if (genotype.D === 'D/d') {
    carriers.push('Blue');
  }

  if (genotype.P === 'p/p') {
    if (!color.includes('Fawn') && !color.includes('Red')) {
      color = `Pink-Eyed ${color}`;
    }
  } else if (genotype.P === 'P/p') {
    carriers.push('Pink-eye');
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
  // C-locus carriers
  if (genotype.C && genotype.C.includes('C/')) {
    const recessive = genotype.C.split('/')[1];
    if (recessive === 'c') carriers.push('Albino');
    else if (recessive === 'ch') carriers.push('Himalayan');
    else if (recessive === 'ce') carriers.push('Beige');
    else if (recessive === 'cch') carriers.push('Chinchilla');
  }

  // E-locus carriers
  if (genotype.E === 'E/e') carriers.push('Recessive Red');

  // Markings
  if (genotype.S === 's/s') {
    markings.push('Pied');
  } else if (genotype.S === 'S/s') {
    carriers.push('Pied');
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

  // Splashed - dominant but only shows when C-dilutes are active (not C/C or C/-)
  const hasCDilute = genotype.C && !genotype.C.startsWith('C/');
  if (genotype.Spl && genotype.Spl.includes('Spl/')) {
    if (hasCDilute) {
      markings.push('Splashed');
    } else {
      hidden.push('Splashed');
    }
  }

  if (genotype.Rn && genotype.Rn.includes('Rn/')) {
    markings.push('Roan');
  } else if (genotype.Rn === 'Rn/rn') {
    carriers.push('Roan');
  }

  if (genotype.Si && genotype.Si.includes('Si/')) {
    markings.push('Silvered');
  } else if (genotype.Si === 'Si/si') {
    carriers.push('Silvered');
  }

  // Mobr - sex-linked to X chromosome, dominant (always shows if present)
  if (genotype.Mobr && genotype.Mobr.includes('Mobr/')) {
    markings.push('xbrindle');
  }

  if (genotype.Go === 'Go/Go') {
    markings.push('Shorthair');
  } else if (genotype.Go === 'go/go') {
    markings.push('Longhair');
  } else if (genotype.Go === 'Go/go') {
    carriers.push('Longhair');
  }

  // Texture
  if (genotype.Re === 'Re/re' || genotype.Re === 'Re/Re') {
    texture = 'Astrex';
  } else if (genotype.Re === 're/Re') {
    carriers.push('Astrex');
  }
  
  if (genotype.Sa === 'sa/sa') {
    texture = texture ? `${texture} Satin` : 'Satin';
  } else if (genotype.Sa === 'Sa/sa') {
    carriers.push('Satin');
  }
  
  if (genotype.Rst === 'rst/rst') {
    texture = texture ? `${texture} Rosette` : 'Rosette';
  } else if (genotype.Rst === 'Rst/rst') {
    carriers.push('Rosette');
  }
  
  if (genotype.Fz === 'fz/fz') {
    texture = texture ? `${texture} Fuzz` : 'Fuzz';
  } else if (genotype.Fz === 'Fz/fz') {
    carriers.push('Fuzz');
  }
  
  if (genotype.Nu === 'Nu/Nu' || genotype.Nu === 'Nu/nu') {
    texture = 'Dominant Hairless';
  }

  // Combine results
  let result = color;
  if (markings.length > 0) {
    result += ' ' + markings.join(', ');
  }
  if (texture) {
    result += ` (${texture})`;
  }

  return { phenotype: result || 'Unknown', carriers, hidden };
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
    Go: 'Go/Go',
    Re: 're/re',
    Sa: 'Sa/Sa',
    Rst: 'Rst/Rst',
    Fz: 'Fz/Fz',
    Nu: 'nu/nu'
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

  const parent1Result = calculatePhenotype(parent1);
  const parent2Result = calculatePhenotype(parent2);

  // Mapping of phenotype names to their defining loci (can be array for multiple)
  // For genotypes array phenotypes, use genotype index as key: "PhenotypeName:0", "PhenotypeName:1"
  const PHENOTYPE_LOCUS_MAP = {
    'Extreme Black': ['A'],
    'Black': ['A'],
    'Chocolate': ['A', 'B'],
    'Blue': ['A', 'D'],
    'Lilac': ['A', 'B', 'D'],
    'Champagne': ['A', 'B', 'P'],
    'Dove': ['A', 'P'],
    'Lavender': ['A', 'B', 'D', 'P'],
    'Silver': ['A', 'D', 'P'],
    'Red:0': ['E'], // a/a e/e variant
    'Red:1': ['A'], // Ay/a variant
    'Fawn:0': ['E', 'P'], // a/a e/e p/p variant
    'Fawn:1': ['A', 'P'], // Ay/a p/p variant
    'Amber:0': ['E', 'D'], // a/a e/e d/d variant
    'Amber:1': ['A', 'D'], // Ay/a d/d variant
    'Agouti': ['A'],
    'Brindle': ['A'],
    'Argente': ['A', 'P'],
    'Cinnamon': ['A', 'B'],
    'Blue Agouti': ['A', 'D'],
    'Cinnamon Argente': ['A', 'B', 'P'],
    'Black Tan': ['A'],
    'Blue Tan': ['A', 'D'],
    'Chocolate Tan': ['A', 'B'],
    'Lilac Tan': ['A', 'B', 'D'],
    'Dove Tan': ['A', 'P'],
    'Agouti Tan': ['A'],
    'Argente Tan': ['A', 'P'],
    'Blue Agouti Tan': ['A', 'D'],
    'Champagne Tan': ['A', 'B', 'P'],
    'Cinnamon Argente Tan': ['A', 'B', 'P'],
    'Cinnamon Tan': ['A', 'B'],
    'Lavender Tan': ['A', 'B', 'D', 'P'],
    'Silver Tan': ['A', 'D', 'P'],
    'Sable': ['A', 'U'],
    'Albino': ['C'],
    'Bone': ['C'],
    'Blue Stone': ['C', 'D'],
    'Stone': ['C'],
    'Himalayan': ['C'],
    'Siamese': ['C'],
    'Blue Siamese': ['C', 'D'],
    'Chocolate Siamese': ['C', 'B'],
    'Burmese': ['C'],
    'Blue Burmese': ['C', 'D'],
    'Colorpoint Blue': ['C', 'D'],
    'Colorpoint Chocolate': ['C', 'B'],
    'Beige': ['C'],
    'Colorpoint Beige': ['C'],
    'Blue Beige': ['C', 'D'],
    'Mock Chocolate': ['C'],
    'Blue Mock Chocolate': ['C', 'D'],
    'Chinchilla': ['C'],
    'Chinchilla Beige': ['C'],
    'Blue Chinchilla': ['C'],
    'Platinum': ['C'],
    'Sepia': ['A', 'C'],
    'Blue Sepia': ['A', 'C', 'D'],
    'Chocolate Sepia': ['A', 'C', 'B'],
    'Cream': ['A', 'C'],
    'Silveragouti': ['A', 'C'],
    'Siam Fox': ['A'],
    'Blue Fox': ['A', 'D'],
    'Chocolate Fox': ['A', 'B'],
    'Lilac Fox': ['A', 'D'],
    'Dove Fox': ['A', 'P'],
    'Lavender Fox': ['A', 'P'],
    'Silver Fox': ['A', 'P'],
    'Champagne Fox': ['A', 'P'],
    'Chinchilla Fox': ['A', 'C'],
    'Cream Fox': ['A', 'C'],
    'Sepia Fox': ['A', 'C'],
    'Beige Fox': ['A', 'C'],
    'Bone Fox': ['A', 'C'],
    'Burmese Fox': ['A', 'C'],
    'Colorpoint Beige Fox': ['A', 'C'],
    'Himalayan Fox': ['A', 'C'],
    'Mock Chocolate Fox': ['A', 'C'],
    'Siamese Fox': ['A', 'C'],
    'Stone Fox': ['A', 'C'],
    'Blue Sepia Fox': ['A', 'C', 'D'],
    'Chocolate Sepia Fox': ['A', 'C', 'B'],
    'Lilac Sepia Fox': ['A', 'D'],
    'Dove Sepia Fox': ['A', 'P'],
    'Lavender Sepia Fox': ['A', 'P'],
    'Silver Sepia Fox': ['A', 'P'],
    'Champagne Sepia Fox': ['A', 'P'],
    'Pink Eye White': ['P'],
    'Black Eye White': ['S'],
    'Pearl/Silvered': ['Si'],
    'Shorthair': ['Go'],
    'Longhair': ['Go'],
    'Satin': ['Sa'],
    'Astrex': ['Re'],
    'Texel': ['Re'],
    'Rosette': ['Rst'],
    'Fuzz': ['Fz'],
    'Dominant Hairless': ['Nu'],
  };

  // Example varieties
  const EXAMPLE_TABS = {
    self: {
      name: 'Self',
      examples: [
        { name: 'Extreme Black', genotype: { A: 'ae/ae', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Black', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Lilac', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Champagne', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Dove', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Lavender', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Silver', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Red', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'P/P' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }
        ] },
        { name: 'Fawn', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'p/p' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' }
        ] },
        { name: 'Amber', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'e/e', P: 'P/P' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }
        ] },
      ]
    },
    ticked: {
      name: 'Ticked',
      examples: [
        { name: 'Agouti', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Brindle', genotype: { A: 'Avy/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Argente', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon', genotype: { A: 'A/-', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Agouti', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Cinnamon Argente', genotype: { A: 'A/-', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
      ]
    },
    tan: {
      name: 'Tan',
      examples: [
        { name: 'Black Tan', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Tan', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Tan', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Lilac Tan', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Dove Tan', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Agouti Tan', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Argente Tan', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Blue Agouti Tan', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Champagne Tan', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon Argente Tan', genotype: { A: 'A/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon Tan', genotype: { A: 'A/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Lavender Tan', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Silver Tan', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Sable', genotype: { A: 'Ay/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', U: 'U/u' } },
      ]
    },
    cdilute: {
      name: 'C-locus',
      examples: [
        { name: 'Albino', genotype: { A: 'a/a', B: 'B/B', C: 'c/c', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Bone', genotype: { A: 'a/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Stone', genotype: { A: 'a/a', B: 'B/B', C: 'c/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Stone', genotype: { A: 'a/a', B: 'B/B', C: 'c/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Himalayan', genotype: { A: 'a/a', B: 'B/B', C: 'c/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Siamese', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Siamese', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Siamese', genotype: { A: 'a/a', B: 'b/b', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Burmese', genotype: { A: 'a/a', B: 'B/B', C: 'ch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Burmese', genotype: { A: 'a/a', B: 'B/B', C: 'ch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Blue', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Chocolate', genotype: { A: 'a/a', B: 'b/b', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Beige', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Beige', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Beige', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ce', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Mock Chocolate', genotype: { A: 'a/a', B: 'B/B', C: 'ce/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Mock Chocolate', genotype: { A: 'a/a', B: 'B/B', C: 'ce/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Sepia', genotype: { A: 'a/a', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Sepia', genotype: { A: 'a/a', B: 'B/B', C: 'cch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Sepia', genotype: { A: 'a/a', B: 'b/b', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Cream', genotype: { A: 'Ay/-', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Silveragouti', genotype: { A: 'A/-', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
      ]
    },
    fox: {
      name: 'Fox',
      examples: [
        { name: 'Sepia Fox', genotype: { A: 'at/a', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Beige Fox', genotype: { A: 'at/a', B: 'B/B', C: 'ce/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Bone Fox', genotype: { A: 'at/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Burmese Fox', genotype: { A: 'at/a', B: 'B/B', C: 'ch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Chinchilla', genotype: { A: 'A/at', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Beige Fox', genotype: { A: 'at/a', B: 'B/B', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Cream Fox', genotype: { A: 'Ay/at', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Himalayan Fox', genotype: { A: 'at/a', B: 'B/B', C: 'c/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Mock Chocolate Fox', genotype: { A: 'at/a', B: 'B/B', C: 'ce/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Siamese Fox', genotype: { A: 'at/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Stone Fox', genotype: { A: 'at/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Sepia Fox', genotype: { A: 'at/a', B: 'B/B', C: 'cch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Sepia Fox', genotype: { A: 'at/a', B: 'b/b', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
      ]
    },
    marked: {
      name: 'Marked',
      examples: [
        { name: 'Pink Eye White', note: 'Possible combinations:', genotypes: [
          { E: 'e/e', C: 'ch/ch' },
          { C: 'ch/ch', P: 'p/p' },
          { C: 'ch/ch', S: 's/s' },
          { C: 'ch/ch', W: 'W/-' },
          { P: 'p/p', S: 's/s', W: 'W/-' }
        ] },
        { name: 'Black Eye White', note: 'Possible combinations:', genotypes: [
          { E: 'e/e', C: 'c/ce' },
          { C: 'c/ce', S: 's/s' },
          { C: 'c/ce', W: 'W/-' },
          { S: 's/s', W: 'W/-' }
        ] },
        { name: 'Pied', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s' } },
        { name: 'Dutch', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s+' }, note: 'Kit selection markers necessary' },
        { name: 'Hereford', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s+' }, note: 'Kit selection markers necessary' },
        { name: 'Banded', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'Wsh/w' } },
        { name: 'Variegated', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'W/w' } },
        { name: 'Rumpwhite', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'Rw/w' } },
        { name: 'xbrindle', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Mobr: 'Mobr/mobr' } },
        { name: 'Roan', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Rn: 'rn/rn' } },
        { name: 'Pearl/Silvered', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Si: 'si/si' } },
      ]
    },
    coats: {
      name: 'Coats',
      examples: [
        { name: 'Shorthair', genotype: { Go: 'Go/Go', Sa: 'Sa/Sa', Re: 're/re', Rst: 'Rst/Rst', Fz: 'Fz/Fz', Nu: 'nu/nu' } },
        { name: 'Longhair', genotype: { Go: 'go/go', Sa: 'Sa/Sa', Re: 're/re', Rst: 'Rst/Rst', Fz: 'Fz/Fz', Nu: 'nu/nu' } },
        { name: 'Satin', genotype: { Go: 'Go/Go', Sa: 'sa/sa', Re: 're/re', Rst: 'Rst/Rst', Fz: 'Fz/Fz', Nu: 'nu/nu' } },
        { name: 'Astrex', genotype: { Go: 'Go/Go', Sa: 'Sa/Sa', Re: 'Re/re', Rst: 'Rst/Rst', Fz: 'Fz/Fz', Nu: 'nu/nu' } },
        { name: 'Texel', genotype: { Go: 'go/go', Sa: 'Sa/Sa', Re: 'Re/re', Rst: 'Rst/Rst', Fz: 'Fz/Fz', Nu: 'nu/nu' } },
        { name: 'Rosette', genotype: { Go: 'Go/Go', Sa: 'Sa/Sa', Re: 're/re', Rst: 'rst/rst', Fz: 'Fz/Fz', Nu: 'nu/nu' } },
        { name: 'Fuzz', genotype: { Go: 'Go/Go', Sa: 'Sa/Sa', Re: 're/re', Rst: 'Rst/Rst', Fz: 'fz/fz', Nu: 'nu/nu' } },
        { name: 'Dominant Hairless', genotype: { Go: 'Go/Go', Sa: 'Sa/Sa', Re: 're/re', Rst: 'Rst/Rst', Fz: 'Fz/Fz', Nu: 'Nu/nu' } },
      ]
    }
  };

  return (
    <>
      {showExamples ? (
        <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Mouse Genetics Examples</h1>
            <button
              onClick={() => setShowExamples(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              <X size={18} />
              Back to Calculator
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {Object.keys(EXAMPLE_TABS).map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    activeTab === tabKey
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {EXAMPLE_TABS[tabKey].name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXAMPLE_TABS[activeTab].examples.map((example, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">{example.name}</h3>
                  {example.note && (
                    <p className="text-xs text-gray-500 italic mb-2">{example.note}</p>
                  )}
                  {example.description ? (
                    <p className="text-xs text-gray-600">{example.description}</p>
                  ) : example.genotypes ? (
                    <div className="space-y-2">
                      {example.genotypes.map((genotype, gIdx) => (
                        <div key={gIdx} className="text-xs text-gray-500 font-mono">
                          {Object.entries(genotype).map(([locus, combo]) => {
                            const lookupKey = `${example.name}:${gIdx}`;
                            const definingLoci = PHENOTYPE_LOCUS_MAP[lookupKey] || PHENOTYPE_LOCUS_MAP[example.name] || [];
                            const shouldBold = definingLoci.includes(locus);
                            return (
                              <span key={locus} className={`mr-2 ${shouldBold ? 'font-bold text-black' : ''}`}>
                                {combo}
                              </span>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 font-mono">
                      {Object.entries(example.genotype).map(([locus, combo]) => {
                        const definingLoci = PHENOTYPE_LOCUS_MAP[example.name] || [];
                        const shouldBold = definingLoci.includes(locus);
                        return (
                          <span key={locus} className={`mr-2 ${shouldBold ? 'font-bold text-black' : ''}`}>
                            {combo}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Mouse Genetics Calculator</h1>
            <button
              onClick={() => setShowExamples(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black border-2 border-black rounded-lg hover:bg-primary-dark transition"
            >
              <Book size={18} />
              View Examples
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sire/Father */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Sire/Father</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(GENE_LOCI).map(([locus, data]) => {
              // For Sire/Father, filter out Mobr combinations (males can't carry Mobr)
              const validCombinations = data.maleCombinations || data.combinations;
              return (
              <div key={locus}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {locus} - {data.name}
                </label>
                <select
                  value={parent1[locus]}
                  onChange={(e) => updateParent1(locus, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {validCombinations.map((combo) => (
                    <option key={combo} value={combo}>
                      {combo}
                    </option>
                  ))}
                </select>
              </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border-2 border-blue-500">
            <p className="text-sm font-medium text-gray-700 mb-1">Phenotype:</p>
            <p className={`text-lg font-semibold ${parent1Result.phenotype.includes('LETHAL') ? 'text-red-600' : 'text-blue-800'}`}>
              {parent1Result.phenotype}
            </p>
            {parent1Result.carriers && parent1Result.carriers.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium">Carried genes:</span> {parent1Result.carriers.join(', ')}
              </p>
            )}
            {parent1Result.hidden && parent1Result.hidden.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Hidden:</span> {parent1Result.hidden.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Dam/Mother */}
        <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-300">
          <h2 className="text-xl font-semibold text-pink-800 mb-4">Dam/Mother</h2>
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
            <p className={`text-lg font-semibold ${parent2Result.phenotype.includes('LETHAL') ? 'text-red-600' : 'text-pink-800'}`}>
              {parent2Result.phenotype}
            </p>
            {parent2Result.carriers && parent2Result.carriers.length > 0 && (
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium">Carried genes:</span> {parent2Result.carriers.join(', ')}
              </p>
            )}
            {parent2Result.hidden && parent2Result.hidden.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Hidden:</span> {parent2Result.hidden.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  );
};

export default MouseGeneticsCalculator;
