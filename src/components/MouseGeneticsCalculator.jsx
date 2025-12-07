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
      'Rw/w',
      'Wsh/w',
      'W/w'
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
  U: {
    name: 'Umbrous',
    combinations: [
      'u/u',
      'U/u', 'U/U'
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
const calculatePhenotype = (genotype, originalGenotype = null) => {
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

  // Track if coat genes were explicitly selected (not defaulted)
  const coatGenesSelected = originalGenotype && 
    ['Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'].some(gene => originalGenotype[gene] && originalGenotype[gene] !== '');

  // Helper function to add markings to phenotype
  const addMarkingsIfNeeded = (phenotype) => {
    if (phenotype === 'Albino') return phenotype;
    
    let result = phenotype;
    
    // Check if Splashed is in phenotype and Pied should be added -> convert to Tricolor
    const hasSplashed = result.includes('Splashed');
    const shouldAddPied = genotype.S === 's/s' && !result.includes('Pied') && !result.includes('Tricolor');
    
    if (hasSplashed && shouldAddPied) {
      // Replace "Splashed" with "Tricolor"
      result = result.replace('Splashed', 'Tricolor');
    } else if (shouldAddPied) {
      // Add Pied if no Splashed
      result += ' Pied';
    }
    
    // Add W-locus markings
    if (genotype.W === 'W/w' && !result.includes('Variegated')) {
      result += ' Variegated';
    } else if (genotype.W === 'Wsh/w' && !result.includes('Banded')) {
      result += ' Banded';
    } else if (genotype.W === 'Rw/w' && !result.includes('Rumpwhite')) {
      result += ' Rumpwhite';
    }
    
    return result;
  };

  // Check for lethal combinations
  if (genotype.A === 'Ay/Ay (lethal)') return { phenotype: 'LETHAL: Homozygous Dominant Red', carriers: [], hidden: [] };
  if (genotype.W && genotype.W.includes('lethal')) return { phenotype: 'LETHAL: Dominant Spotting Homozygous', carriers: [], hidden: [] };
  if (genotype.W && genotype.W.includes('Wsh/Wsh')) return { phenotype: 'LETHAL: Wsh Homozygous', carriers: [], hidden: [] };

  let color = '';
  let pattern = '';
  let texture = '';
  let markings = [];
  let carriers = [];
  let hidden = [];

  // Check if this is ae/ae, a/ae, or a/a (non-agouti self colors)
  const isExtremeBlack = genotype.A === 'ae/ae';
  const isBlackHetero = genotype.A === 'a/ae';
  const isBlack = genotype.A === 'a/a';
  const isSelfBlackVariant = isExtremeBlack || isBlackHetero || isBlack;

  // Check if this is at/ae, ae/at, at/a, or at/at (tan/fox variants)
  const isExtremeTan = genotype.A === 'at/ae' || genotype.A === 'ae/at';
  const isTanHetero = genotype.A === 'at/a' || genotype.A === 'a/at';
  const isTan = genotype.A === 'at/at';
  const isTanVariant = isExtremeTan || isTanHetero || isTan;

  // Check if this is A/ae, A/a, or A/A (agouti variants)
  const isAgoutiExtremeHetero = genotype.A === 'A/ae';
  const isAgoutiHetero = genotype.A === 'A/a';
  const isAgouti = genotype.A === 'A/A';
  const isAgoutiVariant = isAgoutiExtremeHetero || isAgoutiHetero || isAgouti;

  // Check if this is A/at (agouti tan)
  const isAgoutiTan = genotype.A === 'A/at';

  // Special handling for agouti tan (A/at) with C-locus combinations
  if (isAgoutiTan && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'C/ce', 'C/ch', 'C/cch'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded('Agouti Splashed Fox'), carriers, hidden };
    }
    
    if (genotype.C === 'ch/c') {
      return { phenotype: addMarkingsIfNeeded('Agouti Himalayan Fox'), carriers, hidden };
    }
    if (genotype.C === 'ch/ch') {
      return { phenotype: addMarkingsIfNeeded('Agouti Siamese Fox'), carriers, hidden };
    }
    if (genotype.C === 'ce/c') {
      return { phenotype: addMarkingsIfNeeded('Agouti Bone Fox'), carriers, hidden };
    }
    if (genotype.C === 'ce/ch') {
      return { phenotype: addMarkingsIfNeeded('Agouti Colorpoint Beige Fox'), carriers, hidden };
    }
    if (genotype.C === 'ce/ce') {
      return { phenotype: addMarkingsIfNeeded('Agouti Beige Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/c') {
      return { phenotype: addMarkingsIfNeeded('Agouti Stone Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/ch') {
      return { phenotype: addMarkingsIfNeeded('Agouti Burmese Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/ce') {
      return { phenotype: addMarkingsIfNeeded('Agouti Mock Chocolate Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded('Chinchilla'), carriers, hidden };
    }
  }

  // Special handling for agouti variants with C-locus combinations
  if (isAgoutiVariant && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'C/ce', 'C/ch', 'C/cch'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded('Agouti Splashed'), carriers, hidden };
    }
    
    if (genotype.C === 'ch/c') {
      return { phenotype: addMarkingsIfNeeded('Agouti Himalayan'), carriers, hidden };
    }
    if (genotype.C === 'ch/ch') {
      return { phenotype: addMarkingsIfNeeded('Agouti Siamese'), carriers, hidden };
    }
    if (genotype.C === 'ce/c') {
      return { phenotype: addMarkingsIfNeeded('Agouti Bone'), carriers, hidden };
    }
    if (genotype.C === 'ce/ch') {
      return { phenotype: addMarkingsIfNeeded('Agouti Colorpoint Beige'), carriers, hidden };
    }
    if (genotype.C === 'ce/ce') {
      return { phenotype: addMarkingsIfNeeded('Agouti Beige'), carriers, hidden };
    }
    if (genotype.C === 'cch/c') {
      return { phenotype: addMarkingsIfNeeded('Agouti Stone'), carriers, hidden };
    }
    if (genotype.C === 'cch/ch') {
      return { phenotype: addMarkingsIfNeeded('Agouti Burmese'), carriers, hidden };
    }
    if (genotype.C === 'cch/ce') {
      return { phenotype: addMarkingsIfNeeded('Agouti Mock Chocolate'), carriers, hidden };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded('Silver Agouti'), carriers, hidden };
    }
  }

  // Special handling for tan/fox variants with C-locus combinations
  if (isTanVariant && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'C/ce', 'C/ch', 'C/cch'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded('Black Splashed Fox'), carriers, hidden };
    }
    
    if (genotype.C === 'ch/c') {
      return { phenotype: addMarkingsIfNeeded('Himalayan Fox'), carriers, hidden };
    }
    if (genotype.C === 'ch/ch') {
      return { phenotype: addMarkingsIfNeeded('Siamese Fox'), carriers, hidden };
    }
    if (genotype.C === 'ce/c') {
      return { phenotype: addMarkingsIfNeeded('Bone Fox'), carriers, hidden };
    }
    if (genotype.C === 'ce/ch') {
      return { phenotype: addMarkingsIfNeeded('Colorpoint Beige Fox'), carriers, hidden };
    }
    if (genotype.C === 'ce/ce') {
      return { phenotype: addMarkingsIfNeeded('Beige Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/c') {
      return { phenotype: addMarkingsIfNeeded('Stone Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/ch') {
      return { phenotype: addMarkingsIfNeeded('Burmese Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/ce') {
      return { phenotype: addMarkingsIfNeeded('Mock Chocolate Fox'), carriers, hidden };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded('Sepia Fox'), carriers, hidden };
    }
  }

  // Special handling for self black variants with C-locus combinations
  if (isSelfBlackVariant && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'C/ce', 'C/ch', 'C/cch'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded('Black Splashed'), carriers, hidden };
    }
    
    if (genotype.C === 'ch/c') {
      return { phenotype: addMarkingsIfNeeded('Himalayan'), carriers, hidden };
    }
    if (genotype.C === 'ch/ch') {
      return { phenotype: addMarkingsIfNeeded('Siamese'), carriers, hidden };
    }
    if (genotype.C === 'ce/c') {
      return { phenotype: addMarkingsIfNeeded('Bone'), carriers, hidden };
    }
    if (genotype.C === 'ce/ch') {
      return { phenotype: addMarkingsIfNeeded('Colorpoint Beige'), carriers, hidden };
    }
    if (genotype.C === 'ce/ce') {
      return { phenotype: addMarkingsIfNeeded('Beige'), carriers, hidden };
    }
    if (genotype.C === 'cch/c') {
      return { phenotype: addMarkingsIfNeeded('Stone'), carriers, hidden };
    }
    if (genotype.C === 'cch/ch') {
      return { phenotype: addMarkingsIfNeeded('Burmese'), carriers, hidden };
    }
    if (genotype.C === 'cch/ce') {
      return { phenotype: addMarkingsIfNeeded('Mock Chocolate'), carriers, hidden };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded('Sepia'), carriers, hidden };
    }
  }

  // Albino override for other genotypes
  if (genotype.C === 'c/c') {
    return { phenotype: 'Albino', carriers, hidden };
  }

  // Recessive red/yellow (old section - should be removed, using e/e section below)
  if (genotype.E === 'e/e') {
    if (genotype.P === 'p/p') {
      color = 'Recessive Fawn';
    } else {
      color = 'Recessive Red';
    }
    return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
  }

  // Dominant yellow/red (Ay)
  if (genotype.A && (genotype.A.startsWith('Ay/'))) {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    
    // Check for C-locus dilutes (exclude C/C and c/c)
    const excludedCLocus = ['C/C', 'c/c', 'C/ch', 'C/ce', 'C/c', 'C/cch'];
    if (genotype.C && !excludedCLocus.includes(genotype.C)) {
      const isTanVariant = genotype.A === 'Ay/at';
      
      // If Spl is present, use Splashed instead of C-dilute names
      if (hasSpl) {
        return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Dominant Red Splashed Fox' : 'Dominant Red Splashed'), carriers, hidden };
      }
      
      const baseName = 'Dominant Red';
      const suffix = isTanVariant ? ' Fox' : '';
      
      if (genotype.C === 'ch/c') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Himalayan${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'ch/ch') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Siamese${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'ce/c') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Bone${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'ce/ch') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Colorpoint Beige${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'ce/ce') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Beige${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'cch/c') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Stone${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'cch/ch') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Burmese${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'cch/ce') {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Mock Chocolate${suffix}`), carriers, hidden };
      }
      if (genotype.C === 'cch/cch') {
        return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Cream Fox' : 'Cream'), carriers, hidden };
      }
    }
    
    // Track what Ay is paired with
    if (genotype.A === 'Ay/ae') carriers.push('Extreme Black');
    else if (genotype.A === 'Ay/a') carriers.push('Black');
    else if (genotype.A === 'Ay/A') carriers.push('Agouti');
    else if (genotype.A === 'Ay/Avy') carriers.push('Brindle');
    
    // Determine if it's tan variant
    const isTanVariant = genotype.A === 'Ay/at';
    const isBrown = genotype.B === 'b/b';
    const isDilute = genotype.D === 'd/d';
    const isPinkEye = genotype.P === 'p/p';
    
    // Handle brown + dilute + pink-eye combination
    if (isBrown && isDilute && isPinkEye) {
      color = isTanVariant ? 'Dominant Red Lavender Tan' : 'Dominant Red Lavender';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle dilute + pink-eye combination
    if (isDilute && isPinkEye) {
      color = 'Fawn Amber';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle brown + pink-eye combination
    if (isBrown && isPinkEye) {
      color = 'Fawn Chocolate';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle brown + dilute combination
    if (isBrown && isDilute) {
      color = isTanVariant ? 'Dominant Red Lilac Tan' : 'Dominant Red Lilac';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle brown modifier
    if (isBrown) {
      color = isTanVariant ? 'Dominant Red Chocolate Tan' : 'Dominant Red Chocolate';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle dilute modifier
    if (isDilute) {
      color = isTanVariant ? 'Amber Tan' : 'Amber';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle pink-eye modifier
    if (isPinkEye) {
      color = isTanVariant ? 'Fawn Tan' : 'Fawn';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    color = isTanVariant ? 'Dominant Red Tan' : 'Dominant Red';
    return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
  }

  // Recessive red (e/e)
  if (genotype.E === 'e/e') {
    if (genotype.A && genotype.A.includes('at')) {
      return { phenotype: addMarkingsIfNeeded('Recessive Red Tan'), carriers, hidden };
    }
    return { phenotype: addMarkingsIfNeeded('Recessive Red'), carriers, hidden };
  }

  // Viable yellow (brindle - Avy)
  if (genotype.A && genotype.A.startsWith('Avy/')) {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    
    // Handle C/- carriers separately
    if (genotype.C === 'C/c') {
      carriers.push('Albino');
    } else if (genotype.C === 'C/ch') {
      carriers.push('Himalayan');
    } else if (genotype.C === 'C/ce') {
      carriers.push('Beige');
    } else if (genotype.C === 'C/cch') {
      carriers.push('Chinchilla');
    }
    
    // Check for C-locus dilutes (exclude C/C, c/c, and C/- carriers)
    const excludedCLocus = ['C/C', 'c/c', 'C/ch', 'C/ce', 'C/c', 'C/cch'];
    if (genotype.C && !excludedCLocus.includes(genotype.C)) {
      const isTanVariant = genotype.A === 'Avy/at';
      
      // If Spl is present, use Splashed instead of Snowtiger
      if (hasSpl) {
        return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Brindle Splashed Fox' : 'Brindle Splashed'), carriers, hidden };
      }
      
      return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Snowtiger Fox' : 'Snowtiger'), carriers, hidden };
    }
    
    // Track what Avy is paired with
    if (genotype.A === 'Avy/ae') carriers.push('Extreme Black');
    else if (genotype.A === 'Avy/a') carriers.push('Black');
    else if (genotype.A === 'Avy/A') carriers.push('Agouti');
    
    // Determine if it's tan variant and modifiers
    const isTanVariant = genotype.A === 'Avy/at';
    const isBrown = genotype.B === 'b/b';
    const isDilute = genotype.D === 'd/d';
    const isAgouti = genotype.A === 'Avy/A';
    const isAvyAvy = genotype.A === 'Avy/Avy';
    const isPinkEye = genotype.P === 'p/p';
    
    // Handle brown + dilute + pink-eye combination
    if (isBrown && isDilute && isPinkEye) {
      color = isTanVariant ? 'Lavender Brindle Tan' : isAgouti ? 'Lavender Agouti Brindle' : 'Lavender Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle brown + dilute combination
    if (isBrown && isDilute) {
      color = isTanVariant ? 'Lilac Brindle Tan' : isAgouti ? 'Cinnamon Argente Brindle' : 'Lilac Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle brown modifier
    if (isBrown) {
      color = isTanVariant ? 'Chocolate Brindle Tan' : isAgouti ? 'Cinnamon Brindle' : 'Chocolate Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle dilute modifier
    if (isDilute) {
      color = isTanVariant ? 'Blue Brindle Tan' : isAgouti ? 'Blue Agouti Brindle' : 'Blue Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    // Handle pink-eyed dilution
    if (genotype.P === 'p/p') {
      color = isTanVariant ? 'Champagne Brindle Tan' : isAgouti ? 'Cinnamon Argente Brindle' : 'Champagne Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
    }
    
    color = isTanVariant ? 'Brindle Tan' : 'Brindle';
    return { phenotype: addMarkingsIfNeeded(color), carriers, hidden };
  }

  // Base color determination
  const isAgoutiPattern = genotype.A && (genotype.A.includes('A/') || genotype.A.endsWith('/A'));
  const isTanPattern = isTanVariant && !isAgoutiPattern;
  const isBlackPattern = isSelfBlackVariant;
  const isExtremeBlackPattern = genotype.A === 'ae/ae';
  const isExtremeTanPattern = genotype.A === 'at/ae' || genotype.A === 'ae/at';

  // Track carriers for A-locus
  if (genotype.A === 'A/a') carriers.push('Black');
  else if (genotype.A === 'A/ae') carriers.push('Extreme Black');
  else if (genotype.A === 'A/at') {
    // A/at is agouti tan (tan shows visually)
  }
  else if (genotype.A === 'a/ae') carriers.push('Extreme Black');
  else if (genotype.A === 'at/ae') carriers.push('Extreme Black');

  // Brown/Black base
  const isBrown = genotype.B === 'b/b';
  if (genotype.B === 'B/b') carriers.push('Chocolate');
  
  if (isAgoutiPattern) {
    pattern = 'Agouti';
    // Check for A/at (agouti tan)
    if (genotype.A === 'A/at') {
      if (genotype.P === 'p/p') {
        color = 'Argente Tan';
      } else {
        color = isBrown ? 'Cinnamon Tan' : 'Agouti Tan';
      }
    } else {
      if (genotype.P === 'p/p') {
        color = isBrown ? 'Cinnamon Argente' : 'Argente';
      } else {
        color = isBrown ? 'Cinnamon' : 'Agouti';
      }
    }
  } else if (isTanPattern) {
    pattern = 'Tan';
    if (genotype.P === 'p/p') {
      color = isBrown ? 'Champagne Tan' : 'Dove Tan';
    } else {
      color = isBrown ? 'Chocolate Tan' : 'Black Tan';
    }
  } else if (isBlackPattern) {
    pattern = 'Self';
    if (genotype.P === 'p/p') {
      color = isBrown ? 'Champagne' : 'Dove';
    } else if (isExtremeBlackPattern) {
      color = isBrown ? 'Chocolate' : 'Extreme Black';
    } else {
      color = isBrown ? 'Chocolate' : 'Black';
    }
  }

  // Dilutions
  if (genotype.D === 'd/d') {
    if (color === 'Black') color = 'Blue';
    else if (color === 'Extreme Black') color = 'Blue';
    else if (color === 'Chocolate') color = 'Lilac';
    else if (color === 'Agouti') color = 'Blue Agouti';
    else if (color === 'Agouti Tan') color = 'Blue Agouti Tan';
    else if (color === 'Cinnamon') color = 'Cinnamon Argente';
    else if (color === 'Cinnamon Tan') color = 'Cinnamon Argente Tan';
    else if (color === 'Black Tan') color = 'Blue Tan';
    else if (color === 'Chocolate Tan') color = 'Lilac Tan';
  } else if (genotype.D === 'D/d') {
    carriers.push('Blue');
  }

  // Lavender (b/b + d/d + p/p combination)
  if (genotype.B === 'b/b' && genotype.D === 'd/d' && genotype.P === 'p/p') {
    if (color === 'Lilac') color = 'Lavender';
    else if (color === 'Lilac Tan') color = 'Lavender Tan';
    else if (color === 'Cinnamon Argente') color = 'Lavender Agouti';
    else if (color === 'Cinnamon Argente Tan') color = 'Lavender Agouti Tan';
  }

  if (genotype.P === 'p/p') {
    if (!color.includes('Fawn') && !color.includes('Red') && !color.includes('Dove') && !color.includes('Argente') && !color.includes('Champagne')) {
      color = `Pink-Eyed ${color}`;
    }
  } else if (genotype.P === 'P/p') {
    carriers.push('Pink-eye');
  }

  // C-locus modifications
  // Check if Spl is present to replace C-dilute names with 'Splashed'
  const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
  const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'C/ce', 'C/ch', 'C/cch'];
  const shouldUseSplashed = hasSpl && genotype.C && !excludedCForSpl.includes(genotype.C);
  
  if (shouldUseSplashed) {
    // Extract the base pattern (Agouti, Tan, Self, etc.) from color
    let baseName = '';
    if (color.includes('Agouti')) baseName = 'Agouti ';
    else if (color.includes('Tan')) baseName = color.includes('Cinnamon Tan') ? 'Cinnamon ' : color.includes('Chocolate Tan') ? 'Chocolate ' : color.includes('Black Tan') ? 'Black ' : '';
    color = `${baseName}Splashed`;
  } else if (genotype.C !== 'c/c') {
    // Normal C-locus modifications (skip if albino)
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
  // Don't add Pied if it's already in the color name (for Ay/Avy)
  if (genotype.S === 's/s' && !color.includes('Pied')) {
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

  // Splashed - now incorporated into color name when C-dilutes are present
  // Only add to hidden if Spl is present but no C-dilutes
  if (genotype.Spl && genotype.Spl.includes('Spl/')) {
    if (!shouldUseSplashed && genotype.C !== 'c/c') {
      hidden.push('Splashed');
    }
  }

  // Roan (Rn) - recessive trait
  if (genotype.Rn === 'rn/rn') {
    markings.push('Roan');
  } else if (genotype.Rn === 'Rn/rn') {
    carriers.push('Roan');
  }

  // Silvered (Si) - recessive trait
  if (genotype.Si === 'si/si') {
    markings.push('Silvered');
  } else if (genotype.Si === 'Si/si') {
    carriers.push('Silvered');
  }

  // Mobr - sex-linked to X chromosome, dominant (always shows if present)
  if (genotype.Mobr && genotype.Mobr.includes('Mobr/')) {
    markings.push('xbrindle');
  }

  // Only show hair length if coat genes were explicitly selected
  if (coatGenesSelected) {
    if (genotype.Go === 'Go/Go') {
      markings.push('Shorthair');
    } else if (genotype.Go === 'go/go') {
      markings.push('Longhair');
    } else if (genotype.Go === 'Go/go') {
      carriers.push('Longhair');
    }
  }

  // Texture - only show if coat genes were explicitly selected
  if (coatGenesSelected) {
    const hasLonghair = genotype.Go === 'go/go';
    const hasAstrex = genotype.Re === 'Re/re' || genotype.Re === 'Re/Re';
    
    // Check for Texel (longhair + astrex combination)
    if (hasLonghair && hasAstrex) {
      texture = 'Texel';
    } else if (hasAstrex) {
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
  }

  // Combine results
  let result = color;
  // Apply Umbrous after color but before markings
  if (genotype.U && genotype.U.includes('U/')) {
    result += ' Umbrous';
  }
  if (markings.length > 0) {
    result += ' ' + markings.join(' ');
  }
  if (texture) {
    result += ' ' + texture;
  }

  return { phenotype: result || 'Unknown', carriers, hidden };
};

const MouseGeneticsCalculator = ({ API_BASE_URL, authToken }) => {
  // Initialize with empty/default genotypes
  const defaultGenotype = {
    A: '',
    B: '',
    C: '',
    D: '',
    E: '',
    P: '',
    S: '',
    W: '',
    Spl: '',
    Rn: '',
    Si: '',
    Mobr: '',
    Go: '',
    Re: '',
    Sa: '',
    Rst: '',
    Fz: '',
    Nu: '',
    U: ''
  };

  const [parent1, setParent1] = useState(defaultGenotype);
  const [parent2, setParent2] = useState(defaultGenotype);
  const [showExamples, setShowExamples] = useState(false);
  const [activeTab, setActiveTab] = useState('self');
  const [offspringResults, setOffspringResults] = useState(null);
  const [expandedPhenotypes, setExpandedPhenotypes] = useState({});
  const [feedbackGenotype, setFeedbackGenotype] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const updateParent1 = (locus, value) => {
    setParent1({ ...parent1, [locus]: value });
  };

  const updateParent2 = (locus, value) => {
    setParent2({ ...parent2, [locus]: value });
  };

  const togglePhenotype = (index) => {
    setExpandedPhenotypes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const openFeedbackModal = (phenotype, genotype) => {
    setFeedbackGenotype({ phenotype, genotype });
    setFeedbackMessage('');
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackGenotype(null);
    setFeedbackMessage('');
  };

  const submitFeedback = async () => {
    if (!feedbackGenotype || !feedbackMessage.trim()) {
      alert('Please enter your feedback');
      return;
    }

    try {
      const genotypeString = Object.entries(feedbackGenotype.genotype)
        .map(([locus, alleles]) => `${locus}: ${alleles}`)
        .join(', ');

      const response = await fetch(`${API_BASE_URL}/genetics-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          phenotype: feedbackGenotype.phenotype,
          genotype: genotypeString,
          feedback: feedbackMessage
        })
      });

      if (response.ok) {
        alert('Thank you for your feedback! We will review it.');
        closeFeedbackModal();
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Function to get possible alleles from a genotype combination
  const getAlleles = (combination) => {
    const cleaned = combination.replace(' (lethal)', '');
    return cleaned.split('/');
  };

  // Function to apply defaults to genotype
  const applyDefaults = (genotype) => {
    // Color/pattern genes - only apply defaults if NONE are selected
    const colorGenes = ['A', 'B', 'C', 'D', 'E', 'P', 'S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U'];
    const hasAnyColorGene = colorGenes.some(gene => genotype[gene] && genotype[gene] !== '');
    
    // Coat/texture genes - only apply defaults if NONE are selected
    const coatGenes = ['Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'];
    const hasAnyCoatGene = coatGenes.some(gene => genotype[gene] && genotype[gene] !== '');
    
    const defaults = {
      A: 'A/A',      // Agouti (wild type)
      B: 'B/B',      // Black (wild type)
      C: 'C/C',      // Full color (wild type)
      D: 'D/D',      // Non-dilute (wild type)
      E: 'E/E',      // Extension (wild type)
      P: 'P/P',      // Black eye (wild type)
      S: 'S/S',      // Non-pied (wild type)
      W: 'w/w',      // No white spotting
      Spl: 'spl/spl', // No splashed
      Rn: 'Rn/Rn',   // No roan
      Si: 'Si/Si',   // No silver
      Mobr: 'mobr/mobr', // No xbrindle
      Go: 'Go/Go',   // Shorthair (default)
      Re: 're/re',   // No astrex
      Sa: 'Sa/Sa',   // Non-satin
      Rst: 'Rst/Rst', // No rosette
      Fz: 'Fz/Fz',   // No fuzz
      Nu: 'nu/nu',   // No nude
      U: 'u/u'       // No umbrous
    };
    
    const filled = {};
    for (const locus in defaults) {
      // If this is a color gene and any color gene is selected, only use selected values
      if (colorGenes.includes(locus) && hasAnyColorGene) {
        filled[locus] = genotype[locus] || defaults[locus];
      }
      // If this is a coat gene and any coat gene is selected, skip defaults entirely
      else if (coatGenes.includes(locus) && hasAnyCoatGene) {
        filled[locus] = genotype[locus] || defaults[locus];
      }
      // Otherwise use normal defaulting
      else {
        filled[locus] = genotype[locus] || defaults[locus];
      }
    }
    return filled;
  };

  // Function to calculate offspring outcomes
  const calculateOffspring = () => {
    // Apply defaults to both parents before calculating
    const p1 = applyDefaults(parent1);
    const p2 = applyDefaults(parent2);
    
    // Only calculate for loci where at least one parent has a selection
    const selectedLoci = Object.keys(GENE_LOCI).filter(locus => 
      (parent1[locus] && parent1[locus] !== '') || (parent2[locus] && parent2[locus] !== '')
    );
    
    // If no loci selected, don't calculate
    if (selectedLoci.length === 0) {
      return;
    }
    
    // Check if any coat genes were selected by either parent
    const coatGenesSelected = ['Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'].some(gene => 
      (parent1[gene] && parent1[gene] !== '') || (parent2[gene] && parent2[gene] !== '')
    );
    
    // Create a dummy "selected" genotype to pass to calculatePhenotype
    const selectedGenotype = {};
    if (coatGenesSelected) {
      selectedGenotype.Go = 'selected'; // Mark as selected
    }
    
    const outcomes = {};
    
    // Generate all possible offspring genotypes
    const generateOffspring = (locusIndex, currentGenotype) => {
      if (locusIndex >= selectedLoci.length) {
        // Fill in defaults for unselected loci
        const completeGenotype = applyDefaults(currentGenotype);
        
        // Calculate phenotype for this genotype, passing selected info
        const result = calculatePhenotype(completeGenotype, selectedGenotype);
        const phenotype = result.phenotype;
        
        if (!outcomes[phenotype]) {
          outcomes[phenotype] = { count: 0, genotypes: [] };
        }
        outcomes[phenotype].count++;
        outcomes[phenotype].genotypes.push(completeGenotype);
        return;
      }
      
      const locus = selectedLoci[locusIndex];
      const parent1Alleles = getAlleles(p1[locus]);
      const parent2Alleles = getAlleles(p2[locus]);
      
      // Create all possible combinations for this locus
      for (const p1Allele of parent1Alleles) {
        for (const p2Allele of parent2Alleles) {
          // Sort alleles to create consistent genotype notation
          const alleles = [p1Allele, p2Allele].sort((a, b) => {
            // Dominant alleles (uppercase) come first
            if (a[0] === a[0].toUpperCase() && b[0] === b[0].toLowerCase()) return -1;
            if (a[0] === a[0].toLowerCase() && b[0] === b[0].toUpperCase()) return 1;
            return a.localeCompare(b);
          });
          
          const offspringCombo = `${alleles[0]}/${alleles[1]}`;
          generateOffspring(locusIndex + 1, {
            ...currentGenotype,
            [locus]: offspringCombo
          });
        }
      }
    };
    
    generateOffspring(0, {});
    
    // Create results array with each unique genotype
    const allGenotypes = [];
    Object.values(outcomes).forEach(data => {
      data.genotypes.forEach(fullGenotype => {
        allGenotypes.push(fullGenotype);
      });
    });
    
    const totalCount = allGenotypes.length;
    
    // Group by phenotype and collect all genotypes for each
    const phenotypeMap = {};
    allGenotypes.forEach(fullGenotype => {
      const result = calculatePhenotype(fullGenotype, selectedGenotype);
      const phenotype = result.phenotype;
      
      if (!phenotypeMap[phenotype]) {
        phenotypeMap[phenotype] = {
          phenotype: phenotype,
          genotypes: [],
          genotypeKeys: new Set(),
          count: 0
        };
      }
      
      // Only show selected loci in the genotype display
      const displayGenotype = {};
      selectedLoci.forEach(locus => {
        displayGenotype[locus] = fullGenotype[locus];
      });
      
      // Create a unique key for this genotype to avoid duplicates
      const genotypeKey = selectedLoci.map(locus => fullGenotype[locus]).join('|');
      
      // Only add if we haven't seen this exact genotype before for this phenotype
      if (!phenotypeMap[phenotype].genotypeKeys.has(genotypeKey)) {
        phenotypeMap[phenotype].genotypes.push(displayGenotype);
        phenotypeMap[phenotype].genotypeKeys.add(genotypeKey);
      }
      
      phenotypeMap[phenotype].count++;
    });
    
    const resultsArray = Object.values(phenotypeMap).map(data => ({
      phenotype: data.phenotype,
      genotypes: data.genotypes,
      percentage: ((data.count / totalCount) * 100).toFixed(2)
    })).sort((a, b) => b.percentage - a.percentage);
    
    setOffspringResults(resultsArray);
  };

  // Check if parent has any selections
  const hasAnySelection = (parent) => {
    return Object.values(parent).some(value => value !== '');
  };

  const parent1Result = hasAnySelection(parent1) ? calculatePhenotype(applyDefaults(parent1), parent1) : { phenotype: '', carriers: [], hidden: [] };
  const parent2Result = hasAnySelection(parent2) ? calculatePhenotype(applyDefaults(parent2), parent2) : { phenotype: '', carriers: [], hidden: [] };

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
    'Pink Eye White': [],
    'Black Eye White': [],
    'Pied': ['S'],
    'Dutch': ['S'],
    'Hereford': ['S'],
    'Banded': ['W'],
    'Variegated': ['W'],
    'Rumpwhite': ['W'],
    'xbrindle': ['Mobr'],
    'Roan': ['Rn'],
    'Pearl/Silvered': ['Si'],
    'Shorthair': ['Go'],
    'Longhair': ['Go'],
    'Satin': ['Sa'],
    'Astrex': ['Re'],
    'Texel': ['Go', 'Re'],
    'Rosette': ['Rst'],
    'Fuzz': ['Fz'],
    'Dominant Hairless': ['Nu'],
  };

  // Example varieties
  const EXAMPLE_TABS = {
    self: {
      name: 'Self',
      examples: [
        { name: 'Extreme Black', image: '/crittertrack-images/ex-black.png', genotype: { A: 'ae/ae', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Black', image: '/crittertrack-images/black.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate', image: '/crittertrack-images/chocolate.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue', image: '/crittertrack-images/blue.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Lilac', image: '/crittertrack-images/lilac.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Champagne', image: '/crittertrack-images/champagne.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Dove', image: '/crittertrack-images/dove.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Lavender', image: '/crittertrack-images/lavender.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Silver', image: '/crittertrack-images/silver.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Red', image: '/crittertrack-images/red.png', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'P/P' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }
        ] },
        { name: 'Fawn', image: '/crittertrack-images/fawn.png', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'p/p' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' }
        ] },
        { name: 'Amber', image: '/crittertrack-images/amber.png', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'e/e', P: 'P/P' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }
        ] },
      ]
    },
    ticked: {
      name: 'Ticked',
      examples: [
        { name: 'Agouti', image: '/crittertrack-images/agouti.png', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Brindle', image: '/crittertrack-images/brindle.png', genotype: { A: 'Avy/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Argente', image: '/crittertrack-images/argente.png', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon', image: '/crittertrack-images/cinnamon.png', genotype: { A: 'A/-', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Agouti', image: '/crittertrack-images/blue-agouti.png', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Cinnamon Argente', image: '/crittertrack-images/cinnamon-argente.png', genotype: { A: 'A/-', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
      ]
    },
    tan: {
      name: 'Tan',
      examples: [
        { name: 'Black Tan', image: '/crittertrack-images/blacktan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Tan', image: '/crittertrack-images/bluetan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Tan', image: '/crittertrack-images/chocolatetan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Lilac Tan', image: '/crittertrack-images/lilactan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Dove Tan', image: '/crittertrack-images/dovetan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Agouti Tan', image: '/crittertrack-images/agoutitan.png', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Argente Tan', image: '/crittertrack-images/argentetan.png', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Blue Agouti Tan', image: '/crittertrack-images/blueagoutitan.png', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Champagne Tan', image: '/crittertrack-images/champagnetan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon Argente Tan', image: '/crittertrack-images/cinnamonargentetan.png', genotype: { A: 'A/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon Tan', image: '/crittertrack-images/cinnamontan.png', genotype: { A: 'A/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Lavender Tan', image: '/crittertrack-images/lavendertan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Silver Tan', image: '/crittertrack-images/silvertan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Sable', image: '/crittertrack-images/sable.png', genotype: { A: 'Ay/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', U: 'U/u' } },
      ]
    },
    cdilute: {
      name: 'C-locus',
      examples: [
        { name: 'Albino', image: '/crittertrack-images/albino-pew.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/c', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Bone', image: '/crittertrack-images/bone.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Stone', image: '/crittertrack-images/bluestone.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Stone', image: '/crittertrack-images/stone.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Himalayan', image: '/crittertrack-images/himalayan.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Siamese', image: '/crittertrack-images/siamese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Siamese', image: '/crittertrack-images/bluesiamese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Siamese', image: '/crittertrack-images/chocsiamese.png', genotype: { A: 'a/a', B: 'b/b', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Burmese', image: '/crittertrack-images/burmese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Burmese', image: '/crittertrack-images/blueburmese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Blue', image: '/crittertrack-images/colorpointblue.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Chocolate', image: '/crittertrack-images/colorpointchoc.png', genotype: { A: 'a/a', B: 'b/b', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Beige', image: '/crittertrack-images/beige.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Beige', image: '/crittertrack-images/colorpointbeige.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Beige', image: '/crittertrack-images/bluebeige.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ce', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Mock Chocolate', image: '/crittertrack-images/mockchoc.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Mock Chocolate', image: '/crittertrack-images/bluemockchoc.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Sepia', image: '/crittertrack-images/black.png', genotype: { A: 'a/a', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Sepia', image: '/crittertrack-images/bluesepia.png', genotype: { A: 'a/a', B: 'B/B', C: 'cch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Sepia', image: '/crittertrack-images/chocsepia.png', genotype: { A: 'a/a', B: 'b/b', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Cream', image: '/crittertrack-images/cream.png', genotype: { A: 'Ay/-', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Silveragouti', image: '/crittertrack-images/silveragouti.png', genotype: { A: 'A/-', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
      ]
    },
    fox: {
      name: 'Fox',
      examples: [
        { name: 'Sepia Fox', image: '/crittertrack-images/sepiafox.png', genotype: { A: 'at/a', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Beige Fox', image: '/crittertrack-images/beigefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ce/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Bone Fox', image: '/crittertrack-images/bonefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Burmese Fox', image: '/crittertrack-images/burmesefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Chinchilla', image: '/crittertrack-images/chinchilla.png', genotype: { A: 'A/at', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Beige Fox', image: '/crittertrack-images/colorpointbeigefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Cream Fox', image: '/crittertrack-images/creamfox.png', genotype: { A: 'Ay/at', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Himalayan Fox', image: '/crittertrack-images/himalayanfox.png', genotype: { A: 'at/a', B: 'B/B', C: 'c/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Mock Chocolate Fox', image: '/crittertrack-images/mockchocfox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ce/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Siamese Fox', image: '/crittertrack-images/siamesefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Stone Fox', image: '/crittertrack-images/stonefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Sepia Fox', image: '/crittertrack-images/bluesepiafox.png', genotype: { A: 'at/a', B: 'B/B', C: 'cch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Sepia Fox', image: '/crittertrack-images/chocsepiafox.png', genotype: { A: 'at/a', B: 'b/b', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
      ]
    },
    marked: {
      name: 'Marked',
      examples: [
        { name: 'Pink Eye White', image: '/crittertrack-images/albino-pew.png', note: 'Possible combinations:', genotypes: [
          { E: 'e/e', C: 'ch/ch' },
          { C: 'ch/ch', P: 'p/p' },
          { C: 'ch/ch', S: 's/s' },
          { C: 'ch/ch', W: 'W/-' },
          { P: 'p/p', S: 's/s', W: 'W/-' }
        ] },
        { name: 'Black Eye White', image: '/crittertrack-images/bew.png', note: 'Possible combinations:', genotypes: [
          { E: 'e/e', C: 'c/ce' },
          { C: 'c/ce', S: 's/s' },
          { C: 'c/ce', W: 'W/-' },
          { S: 's/s', W: 'W/-' }
        ] },
        { name: 'Pied', image: '/crittertrack-images/pied.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s' } },
        { name: 'Dutch', image: '/crittertrack-images/dutch.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s+' }, note: 'Kit selection markers necessary' },
        { name: 'Hereford', image: '/crittertrack-images/hereford.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s+' }, note: 'Kit selection markers necessary' },
        { name: 'Banded', image: '/crittertrack-images/banded.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'Wsh/w' } },
        { name: 'Variegated', image: '/crittertrack-images/variegated.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'W/w' } },
        { name: 'Rumpwhite', image: '/crittertrack-images/rumpwhite.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'Rw/w' } },
        { name: 'xbrindle', image: '/crittertrack-images/xbrindle.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Mobr: 'Mobr/mobr' } },
        { name: 'Roan', image: '/crittertrack-images/roan.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Rn: 'rn/rn' } },
        { name: 'Pearl/Silvered', image: '/crittertrack-images/pearl.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Si: 'si/si' } },
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
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 flex gap-3">
                  <div className="flex-1">
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
                  {example.image && (
                    <div className="flex-shrink-0 -mr-2">
                      <img 
                        src={example.image} 
                        alt={example.name}
                        className="w-24 h-24 object-contain rounded"
                      />
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
                <select
                  value={parent1[locus]}
                  onChange={(e) => updateParent1(locus, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{locus} - {data.name}</option>
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
            <p className={`text-lg font-semibold ${parent1Result.phenotype.includes('LETHAL') ? 'text-red-600' : 'text-blue-800'} mb-2`}>
              <span className="text-sm font-medium text-gray-700">Phenotype: </span>
              {parent1Result.phenotype}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Genotype: </span>
              {Object.entries(parent1)
                .filter(([_, value]) => value && value !== '')
                .map(([_, alleles]) => alleles)
                .join(', ') || ''}
            </p>
            {parent1Result.carriers && parent1Result.carriers.length > 0 && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Carried genes: </span>
                {parent1Result.carriers.join(', ')}
              </p>
            )}
            {parent1Result.hidden && parent1Result.hidden.length > 0 && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Hidden: </span>
                {parent1Result.hidden.join(', ')}
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
                <select
                  value={parent2[locus]}
                  onChange={(e) => updateParent2(locus, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">{locus} - {data.name}</option>
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
            <p className={`text-lg font-semibold ${parent2Result.phenotype.includes('LETHAL') ? 'text-red-600' : 'text-pink-800'} mb-2`}>
              <span className="text-sm font-medium text-gray-700">Phenotype: </span>
              {parent2Result.phenotype}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Genotype: </span>
              {Object.entries(parent2)
                .filter(([_, value]) => value && value !== '')
                .map(([_, alleles]) => alleles)
                .join(', ') || ''}
            </p>
            {parent2Result.carriers && parent2Result.carriers.length > 0 && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Carried genes: </span>
                {parent2Result.carriers.join(', ')}
              </p>
            )}
            {parent2Result.hidden && parent2Result.hidden.length > 0 && (
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Hidden: </span>
                {parent2Result.hidden.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

          {/* Calculate Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={calculateOffspring}
              disabled={!hasAnySelection(parent1) || !hasAnySelection(parent2)}
              className={`px-8 py-3 text-white text-lg font-semibold rounded-lg transition shadow-lg ${
                hasAnySelection(parent1) && hasAnySelection(parent2)
                  ? 'bg-pink-600 hover:bg-pink-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              Calculate Offspring
            </button>
          </div>

          {/* Offspring Results */}
          {offspringResults && (
            <div className="mt-6 bg-purple-50 rounded-lg p-6 border-2 border-purple-300">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Possible Offspring Outcomes</h2>
              <div className="space-y-3">
                {offspringResults.map((result, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-lg font-semibold ${result.phenotype.includes('LETHAL') ? 'text-red-600' : 'text-gray-800'}`}>
                            <span className="text-sm font-medium text-gray-600">Phenotype: </span>
                            {result.phenotype}
                          </p>
                          <span className="text-purple-700 font-semibold">
                            {result.percentage}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePhenotype(idx)}
                        className="ml-4 px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition flex items-center gap-1"
                      >
                        {expandedPhenotypes[idx] ? '▲' : '▼'} {result.genotypes.length} genotype{result.genotypes.length !== 1 ? 's' : ''}
                      </button>
                      {authToken && (
                        <button
                          onClick={() => openFeedbackModal(result.phenotype, result.genotypes[0])}
                          className={`ml-2 px-3 py-1 text-sm rounded-lg transition ${
                            result.phenotype.includes('Unknown')
                              ? 'bg-red-100 hover:bg-red-200 text-red-800'
                              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                          }`}
                          title={result.phenotype.includes('Unknown') ? 'Report unknown phenotype' : 'Report incorrect phenotype'}
                        >
                          {result.phenotype.includes('Unknown') ? '⚠ Report Unknown' : '📝 Feedback'}
                        </button>
                      )}
                    </div>
                    
                    {expandedPhenotypes[idx] && (
                      <div className="mt-3 pt-3 border-t border-purple-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {result.genotypes.map((genotype, gIdx) => (
                            <div key={gIdx} className="text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded">
                              {Object.entries(genotype)
                                .map(([_, alleles]) => alleles)
                                .join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {showFeedbackModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {feedbackGenotype?.phenotype.includes('Unknown') 
                      ? '⚠ Report Unknown Phenotype' 
                      : '📝 Report Phenotype Feedback'}
                  </h3>
                  <button
                    onClick={closeFeedbackModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Phenotype Result:</span> 
                    <span className={feedbackGenotype?.phenotype.includes('Unknown') ? 'text-red-600 font-semibold ml-1' : 'ml-1'}>
                      {feedbackGenotype?.phenotype}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Genotype:</span>{' '}
                    <span className="font-mono text-xs">
                      {feedbackGenotype && Object.entries(feedbackGenotype.genotype)
                        .map(([_, alleles]) => alleles)
                        .join(', ')}
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {feedbackGenotype?.phenotype.includes('Unknown')
                      ? 'What should this phenotype be called?'
                      : 'What is incorrect about this phenotype?'}
                  </label>
                  <p className="text-xs text-gray-500 mb-2 italic">
                    {feedbackGenotype?.phenotype.includes('Unknown')
                      ? 'Example: "This should be Black Self" or "This genotype produces Agouti"'
                      : 'Example: "Should be Champagne not Beige" or "Missing carrier notation"'}
                  </p>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="4"
                    placeholder="Please provide details about the correct phenotype or what is wrong..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={submitFeedback}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={closeFeedbackModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MouseGeneticsCalculator;
