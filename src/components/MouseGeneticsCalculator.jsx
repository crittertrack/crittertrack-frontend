import React, { useState, useEffect } from 'react';
import { X, Book, User, Search } from 'lucide-react';

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
      'c/ch', 'ch/ch',
      'c/ce', 'ce/ch', 'ce/ce',
      'c/cch', 'ch/cch', 'ce/cch', 'cch/cch',
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
    name: 'Shorthair',
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

  // Helper function to apply dilutions to a color name
  const applyDilution = (colorName) => {
    if (genotype.D === 'd/d') {
      if (colorName.includes('Black') && !colorName.includes('Blue')) {
        colorName = colorName.replace('Black', 'Blue');
      } else if (colorName === 'Siamese') {
        colorName = 'Blue Siamese';
      } else if (colorName === 'Himalayan') {
        colorName = 'Blue Himalayan';
      } else if (colorName === 'Burmese') {
        colorName = 'Blue Burmese';
      } else if (colorName === 'Stone') {
        colorName = 'Blue Stone';
      } else if (colorName === 'Sepia') {
        colorName = 'Blue Sepia';
      } else if (colorName.includes('Chocolate')) {
        colorName = colorName.replace('Chocolate', 'Lilac');
      } else if (colorName.includes('Cinnamon') && !colorName.includes('Argente')) {
        colorName = colorName.replace('Cinnamon', 'Cinnamon Argente');
      }
    }
    return colorName;
  };

  // Helper function to check C-locus combinations in both directions
  const isCCombo = (combo1, combo2 = null) => {
    if (!combo2) {
      // Single check (e.g., 'c/c', 'ch/ch')
      return genotype.C === combo1;
    }
    // Check both orders (e.g., 'cch/ce' or 'ce/cch')
    return genotype.C === combo1 || genotype.C === combo2;
  };

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
  if (genotype.A === 'Ay/Ay (lethal)') return { phenotype: 'LETHAL: Homozygous Dominant Red', carriers: [], hidden: [], notes: [] };

  let color = '';
  let pattern = '';
  let texture = '';
  let markings = [];
  let carriers = [];
  let hidden = [];
  let notes = [];

  // Check if this is ae/ae, a/ae, or a/a (non-agouti self colors)
  const isExtremeBlack = genotype.A === 'ae/ae';
  const isBlackHetero = genotype.A === 'a/ae' || genotype.A === 'ae/a';
  const isBlack = genotype.A === 'a/a';
  const isSelfBlackVariant = isExtremeBlack || isBlackHetero || isBlack;

  // Check if this is at/ae, ae/at, at/a, or at/at (tan/fox variants)
  const isExtremeTan = genotype.A === 'at/ae' || genotype.A === 'ae/at';
  const isTanHetero = genotype.A === 'at/a' || genotype.A === 'a/at';
  const isTan = genotype.A === 'at/at';
  const isTanVariant = isExtremeTan || isTanHetero || isTan;

  // Check if this is A/ae, A/a, or A/A (agouti variants)
  const isAgoutiExtremeHetero = genotype.A === 'A/ae' || genotype.A === 'ae/A';
  const isAgoutiHetero = genotype.A === 'A/a' || genotype.A === 'a/A';
  const isAgouti = genotype.A === 'A/A';
  const isAgoutiVariant = isAgoutiExtremeHetero || isAgoutiHetero || isAgouti;

  // Check if this is A/at (agouti tan)
  const isAgoutiTan = genotype.A === 'A/at' || genotype.A === 'at/A';

  // Special handling for agouti tan (A/at) with C-locus combinations
  if (isAgoutiTan && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'c/C', 'C/ce', 'ce/C', 'C/ch', 'ch/C', 'C/cch', 'cch/C'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden, notes: [] };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Splashed Fox')), carriers, hidden, notes: [] };
    }
    
    if (isCCombo('ch/c', 'c/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Himalayan Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ch/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Siamese Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/c', 'c/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Bone Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ch', 'ch/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Colorpoint Beige Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Beige Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/c', 'c/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Stone Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ch', 'ch/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Burmese Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ce', 'ce/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Mock Chocolate Fox')), carriers, hidden, notes: [] };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Chinchilla')), carriers, hidden, notes: [] };
    }
  }

  // Special handling for agouti variants with C-locus combinations
  if (isAgoutiVariant && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'c/C', 'C/ce', 'ce/C', 'C/ch', 'ch/C', 'C/cch', 'cch/C'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden, notes: [] };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Splashed')), carriers, hidden, notes: [] };
    }
    
    if (isCCombo('ch/c', 'c/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Himalayan')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ch/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Siamese')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/c', 'c/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Bone')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ch', 'ch/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Colorpoint Beige')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Beige')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/c', 'c/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Stone')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ch', 'ch/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Burmese')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ce', 'ce/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Agouti Mock Chocolate')), carriers, hidden, notes: [] };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Silver Agouti')), carriers, hidden, notes: [] };
    }
  }

  // Special handling for tan/fox variants with C-locus combinations
  if (isTanVariant && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'c/C', 'C/ce', 'ce/C', 'C/ch', 'ch/C', 'C/cch', 'cch/C'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden, notes: [] };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Black Splashed Fox')), carriers, hidden, notes: [] };
    }
    
    if (isCCombo('ch/c', 'c/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Himalayan Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ch/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Siamese Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/c', 'c/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Bone Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ch', 'ch/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Colorpoint Beige Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Beige Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/c', 'c/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Stone Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ch', 'ch/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Burmese Fox')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ce', 'ce/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Mock Chocolate Fox')), carriers, hidden, notes: [] };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Sepia Fox')), carriers, hidden, notes: [] };
    }
  }

  // Special handling for self black variants with C-locus combinations
  if (isSelfBlackVariant && genotype.C !== 'C/C') {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    const excludedCForSpl = ['C/C', 'c/c', 'C/c', 'c/C', 'C/ce', 'ce/C', 'C/ch', 'ch/C', 'C/cch', 'cch/C'];
    
    if (genotype.C === 'c/c') {
      return { phenotype: 'Albino', carriers, hidden, notes: [] };
    }
    
    // If Spl is present with eligible C-dilutes, use Splashed
    if (hasSpl && !excludedCForSpl.includes(genotype.C)) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Black Splashed')), carriers, hidden, notes: [] };
    }
    
    if (isCCombo('ch/c', 'c/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Himalayan')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ch/ch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Siamese')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/c', 'c/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Bone')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ch', 'ch/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Colorpoint Beige')), carriers, hidden, notes: [] };
    }
    if (isCCombo('ce/ce')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Beige')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/c', 'c/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Stone')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ch', 'ch/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Burmese')), carriers, hidden, notes: [] };
    }
    if (isCCombo('cch/ce', 'ce/cch')) {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Mock Chocolate')), carriers, hidden, notes: [] };
    }
    if (genotype.C === 'cch/cch') {
      return { phenotype: addMarkingsIfNeeded(applyDilution('Sepia')), carriers, hidden, notes: [] };
    }
  }

  // Albino override for other genotypes
  if (genotype.C === 'c/c') {
    return { phenotype: 'Albino', carriers, hidden, notes: [] };
  }

  // Recessive red/yellow (old section - should be removed, using e/e section below)
  if (genotype.E === 'e/e') {
    if (genotype.P === 'p/p') {
      color = 'Recessive Fawn';
    } else {
      color = 'Recessive Red';
    }
    return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
  }

  // Dominant yellow/red (Ay)
  if (genotype.A && (genotype.A.startsWith('Ay/'))) {
    const hasSpl = genotype.Spl && genotype.Spl.includes('Spl/');
    
    // Check for C-locus dilutes (exclude C/C and c/c)
    const excludedCLocus = ['C/C', 'c/c', 'C/ch', 'ch/C', 'C/ce', 'ce/C', 'C/c', 'c/C', 'C/cch', 'cch/C'];
    if (genotype.C && !excludedCLocus.includes(genotype.C)) {
      const isTanVariant = genotype.A === 'Ay/at' || genotype.A === 'at/Ay';
      
      // If Spl is present, use Splashed instead of C-dilute names
      if (hasSpl) {
        return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Dominant Red Splashed Fox' : 'Dominant Red Splashed'), carriers, hidden, notes: [] };
      }
      
      const baseName = 'Dominant Red';
      const suffix = isTanVariant ? ' Fox' : '';
      
      if (isCCombo('ch/c', 'c/ch')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Himalayan${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('ch/ch')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Siamese${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('ce/c', 'c/ce')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Bone${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('ce/ch', 'ch/ce')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Colorpoint Beige${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('ce/ce')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Beige${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('cch/c', 'c/cch')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Stone${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('cch/ch', 'ch/cch')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Burmese${suffix}`), carriers, hidden, notes: [] };
      }
      if (isCCombo('cch/ce', 'ce/cch')) {
        return { phenotype: addMarkingsIfNeeded(`${baseName} Mock Chocolate${suffix}`), carriers, hidden, notes: [] };
      }
      if (genotype.C === 'cch/cch') {
        return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Cream Fox' : 'Cream'), carriers, hidden, notes: [] };
      }
    }
    
    // Track what Ay is paired with
    if (genotype.A === 'Ay/ae' || genotype.A === 'ae/Ay') carriers.push('Extreme Black');
    else if (genotype.A === 'Ay/a' || genotype.A === 'a/Ay') carriers.push('Black');
    else if (genotype.A === 'Ay/A' || genotype.A === 'A/Ay') carriers.push('Agouti');
    else if (genotype.A === 'Ay/Avy' || genotype.A === 'Avy/Ay') carriers.push('Brindle');
    
    // Determine if it's tan variant
    const isTanVariant = genotype.A === 'Ay/at' || genotype.A === 'at/Ay';
    const isBrown = genotype.B === 'b/b';
    const isDilute = genotype.D === 'd/d';
    const isPinkEye = genotype.P === 'p/p';
    
    // Handle brown + dilute + pink-eye combination
    if (isBrown && isDilute && isPinkEye) {
      color = isTanVariant ? 'Dominant Red Lavender Tan' : 'Dominant Red Lavender';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle dilute + pink-eye combination
    if (isDilute && isPinkEye) {
      color = 'Fawn Amber';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle brown + pink-eye combination
    if (isBrown && isPinkEye) {
      color = 'Fawn Chocolate';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle brown + dilute combination
    if (isBrown && isDilute) {
      color = isTanVariant ? 'Dominant Red Lilac Tan' : 'Dominant Red Lilac';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle brown modifier
    if (isBrown) {
      color = isTanVariant ? 'Dominant Red Chocolate Tan' : 'Dominant Red Chocolate';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle dilute modifier
    if (isDilute) {
      color = isTanVariant ? 'Amber Tan' : 'Amber';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle pink-eye modifier
    if (isPinkEye) {
      color = isTanVariant ? 'Fawn Tan' : 'Fawn';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    color = isTanVariant ? 'Dominant Red Tan' : 'Dominant Red';
    return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
  }

  // Recessive red (e/e)
  if (genotype.E === 'e/e') {
    if (genotype.A && genotype.A.includes('at')) {
      return { phenotype: addMarkingsIfNeeded('Recessive Red Tan'), carriers, hidden, notes: [] };
    }
    return { phenotype: addMarkingsIfNeeded('Recessive Red'), carriers, hidden, notes: [] };
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
      const isTanVariant = genotype.A === 'Avy/at' || genotype.A === 'at/Avy';
      
      // If Spl is present, use Splashed instead of Snowtiger
      if (hasSpl) {
        return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Brindle Splashed Fox' : 'Brindle Splashed'), carriers, hidden, notes: [] };
      }
      
      return { phenotype: addMarkingsIfNeeded(isTanVariant ? 'Snowtiger Fox' : 'Snowtiger'), carriers, hidden, notes: [] };
    }
    
    // Track what Avy is paired with
    if (genotype.A === 'Avy/ae' || genotype.A === 'ae/Avy') carriers.push('Extreme Black');
    else if (genotype.A === 'Avy/a' || genotype.A === 'a/Avy') carriers.push('Black');
    else if (genotype.A === 'Avy/A' || genotype.A === 'A/Avy') carriers.push('Agouti');
    
    // Determine if it's tan variant and modifiers
    const isTanVariant = genotype.A === 'Avy/at' || genotype.A === 'at/Avy';
    const isBrown = genotype.B === 'b/b';
    const isDilute = genotype.D === 'd/d';
    const isAgouti = genotype.A === 'Avy/A' || genotype.A === 'A/Avy';
    const isAvyAvy = genotype.A === 'Avy/Avy';
    const isPinkEye = genotype.P === 'p/p';
    
    // Handle brown + dilute + pink-eye combination
    if (isBrown && isDilute && isPinkEye) {
      color = isTanVariant ? 'Lavender Brindle Tan' : isAgouti ? 'Lavender Agouti Brindle' : 'Lavender Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle brown + dilute combination
    if (isBrown && isDilute) {
      color = isTanVariant ? 'Lilac Brindle Tan' : isAgouti ? 'Cinnamon Argente Brindle' : 'Lilac Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle brown modifier
    if (isBrown) {
      color = isTanVariant ? 'Chocolate Brindle Tan' : isAgouti ? 'Cinnamon Brindle' : 'Chocolate Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle dilute modifier
    if (isDilute) {
      color = isTanVariant ? 'Blue Brindle Tan' : isAgouti ? 'Blue Agouti Brindle' : 'Blue Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    // Handle pink-eyed dilution
    if (genotype.P === 'p/p') {
      color = isTanVariant ? 'Champagne Brindle Tan' : isAgouti ? 'Cinnamon Argente Brindle' : 'Champagne Brindle';
      return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
    }
    
    color = isTanVariant ? 'Brindle Tan' : 'Brindle';
    return { phenotype: addMarkingsIfNeeded(color), carriers, hidden, notes: [] };
  }

  // Base color determination
  const isAgoutiPattern = genotype.A && (genotype.A.includes('A/') || genotype.A.endsWith('/A'));
  const isTanPattern = isTanVariant && !isAgoutiPattern;
  const isBlackPattern = isSelfBlackVariant;
  const isExtremeBlackPattern = genotype.A === 'ae/ae';
  const isExtremeTanPattern = genotype.A === 'at/ae' || genotype.A === 'ae/at';

  // Check if any color/pattern genes were explicitly selected (not defaulted)
  const colorGenesSelected = originalGenotype && (
    (originalGenotype.A && originalGenotype.A !== '') ||
    (originalGenotype.B && originalGenotype.B !== '') ||
    (originalGenotype.C && originalGenotype.C !== '') ||
    (originalGenotype.D && originalGenotype.D !== '') ||
    (originalGenotype.E && originalGenotype.E !== '') ||
    (originalGenotype.P && originalGenotype.P !== '')
  );

  // Check if ONLY one color gene is selected (incomplete for phenotype calculation)
  const selectedColorGenes = [];
  if (originalGenotype) {
    if (originalGenotype.A && originalGenotype.A !== '') selectedColorGenes.push('A');
    if (originalGenotype.B && originalGenotype.B !== '') selectedColorGenes.push('B');
    if (originalGenotype.C && originalGenotype.C !== '') selectedColorGenes.push('C');
    if (originalGenotype.D && originalGenotype.D !== '') selectedColorGenes.push('D');
    if (originalGenotype.E && originalGenotype.E !== '') selectedColorGenes.push('E');
    if (originalGenotype.P && originalGenotype.P !== '') selectedColorGenes.push('P');
  }

  // If color genes selected without A-locus (excluding marking-only selections), show note
  const hasMarkingGenes = originalGenotype && (
    (originalGenotype.W && originalGenotype.W !== '') ||
    (originalGenotype.Wsh && originalGenotype.Wsh !== '') ||
    (originalGenotype.Rw && originalGenotype.Rw !== '') ||
    (originalGenotype.S && originalGenotype.S !== '') ||
    (originalGenotype.Mi && originalGenotype.Mi !== '') ||
    (originalGenotype.Rb && originalGenotype.Rb !== '')
  );
  
  if (selectedColorGenes.length >= 1 && !selectedColorGenes.includes('A') && !hasMarkingGenes) {
    const singleGene = selectedColorGenes[0];
    let title = '';
    let note = 'Select A-locus (use a/a for self) for full phenotype calculation';
    
    // For single gene selection, show descriptive title
    if (selectedColorGenes.length === 1) {
      if (singleGene === 'B') {
        title = genotype.B === 'b/b' ? 'Brown/Chocolate Base' : 'Black Base';
      } else if (singleGene === 'C') {
        if (genotype.C === 'C/C' || genotype.C === 'C/c' || genotype.C === 'C/ce' || genotype.C === 'C/ch' || genotype.C === 'C/cch') {
          title = 'Full Color';
        } else if (genotype.C === 'cch/cch' || isCCombo(genotype.C, 'cch/ce') || isCCombo(genotype.C, 'cch/ch') || isCCombo(genotype.C, 'cch/c')) {
          title = 'Chinchilla/Mock Dilution';
        } else if (genotype.C === 'ch/ch' || isCCombo(genotype.C, 'ch/ce') || isCCombo(genotype.C, 'ch/c')) {
          title = 'Himalayan/Sable';
        } else if (genotype.C === 'ce/ce' || isCCombo(genotype.C, 'ce/c')) {
          title = 'Extreme Dilution';
        } else if (genotype.C === 'c/c') {
          title = 'Albino';
        }
      } else if (singleGene === 'D') {
        title = genotype.D === 'd/d' ? 'Dilute' : 'Non-Dilute';
      } else if (singleGene === 'E') {
        if (genotype.E === 'E/E' || genotype.E === 'E/e') {
          title = 'Normal Extension';
        } else if (genotype.E === 'e/e') {
          title = 'Recessive Red/Yellow';
        }
      } else if (singleGene === 'P') {
        title = genotype.P === 'p/p' ? 'Pink-Eyed Dilution' : 'Normal Eye Color';
      }
    } else {
      // Multiple genes selected without A-locus
      title = 'Incomplete Color Selection';
    }
    
    return { phenotype: title || 'Unknown', carriers, hidden, notes: [note] };
  }

  // Check for solo marking/modifier genes that need special handling
  const onlyGeneSelected = originalGenotype && 
    Object.keys(originalGenotype).filter(key => originalGenotype[key] && originalGenotype[key] !== '').length === 1;

  if (onlyGeneSelected) {
    // S locus alone
    if (originalGenotype.S) {
      if (genotype.S === 'S/s') {
        // Add to carriers so it shows in "Carried genes" for parents
        carriers.push('Pied');
        return { phenotype: '', carriers, hidden, notes: [] };
      } else if (genotype.S === 'S/S') {
        return { phenotype: '', carriers, hidden, notes: ['This gene combination does not affect phenotype'] };
      }
    }

    // Rn locus alone
    if (originalGenotype.Rn) {
      if (genotype.Rn === 'Rn/rn') {
        carriers.push('Roan');
        return { phenotype: '', carriers, hidden, notes: [] };
      } else if (genotype.Rn === 'Rn/Rn') {
        return { phenotype: '', carriers, hidden, notes: ['This gene combination does not affect phenotype'] };
      }
    }

    // Si locus alone
    if (originalGenotype.Si) {
      if (genotype.Si === 'Si/si') {
        carriers.push('Silvered');
        return { phenotype: '', carriers, hidden, notes: [] };
      } else if (genotype.Si === 'Si/Si') {
        return { phenotype: '', carriers, hidden, notes: ['This gene combination does not affect phenotype'] };
      }
    }

    // Mobr locus alone
    if (originalGenotype.Mobr && genotype.Mobr === 'mobr/mobr') {
      return { phenotype: '', carriers, hidden, notes: ['This gene combination does not affect phenotype'] };
    }

    // w locus alone (non-white)
    if (originalGenotype.W && genotype.W === 'w/w') {
      return { phenotype: '', carriers, hidden, notes: ['This gene combination does not affect phenotype'] };
    }

    // u locus alone (non-umbrous)
    if (originalGenotype.U && genotype.U === 'u/u') {
      return { phenotype: '', carriers, hidden, notes: ['This gene combination does not affect phenotype'] };
    }
  }

  // Track carriers for A-locus
  if (genotype.A === 'A/a' || genotype.A === 'a/A') carriers.push('Black');
  else if (genotype.A === 'A/ae' || genotype.A === 'ae/A') carriers.push('Extreme Black');
  else if (genotype.A === 'A/at' || genotype.A === 'at/A') {
    // A/at is agouti tan (tan shows visually)
  }
  else if (genotype.A === 'a/ae' || genotype.A === 'ae/a') carriers.push('Extreme Black');
  else if (genotype.A === 'at/ae' || genotype.A === 'ae/at') carriers.push('Extreme Black');

  // Brown/Black base
  const isBrown = genotype.B === 'b/b';
  if (genotype.B === 'B/b' || genotype.B === 'b/B') carriers.push('Chocolate');
  
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
  } else if (genotype.D === 'D/d' || genotype.D === 'd/D') {
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
  } else if (genotype.P === 'P/p' || genotype.P === 'p/P') {
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
    if (genotype.C === 'cch/cch' || genotype.C?.includes('cch/') || genotype.C?.includes('/cch')) {
      if (!genotype.C.includes('C/cch') && !genotype.C.includes('cch/C')) {
        color = `Chinchilla ${color}`;
      }
    }
    if (genotype.C === 'ch/ch' || (genotype.C?.includes('ch/') || genotype.C?.includes('/ch')) && !genotype.C.includes('C/ch') && !genotype.C.includes('ch/C') && !genotype.C.includes('cch/ch') && !genotype.C.includes('ch/cch')) {
      color = `Himalayan ${color}`;
    }
    if (genotype.C === 'ce/ce' || (genotype.C?.includes('ce/') || genotype.C?.includes('/ce')) && !genotype.C.includes('C/ce') && !genotype.C.includes('ce/C')) {
      color = `Beige ${color}`;
    }
  }
  // C-locus carriers
  if (genotype.C && (genotype.C.includes('C/') || genotype.C.includes('/C'))) {
    const alleles = genotype.C.split('/');
    const recessive = alleles[0] === 'C' ? alleles[1] : (alleles[1] === 'C' ? alleles[0] : null);
    if (recessive === 'c') carriers.push('Albino');
    else if (recessive === 'ch') carriers.push('Himalayan');
    else if (recessive === 'ce') carriers.push('Beige');
    else if (recessive === 'cch') carriers.push('Chinchilla');
  }

  // E-locus carriers
  if (genotype.E === 'E/e' || genotype.E === 'e/E') carriers.push('Recessive Red');

  // Markings
  // Don't add Pied if it's already in the color name (for Ay/Avy)
  if (genotype.S === 's/s' && !color.includes('Pied')) {
    markings.push('Pied');
  } else if (genotype.S === 'S/s' || genotype.S === 's/S') {
    carriers.push('Pied');
  }

  // W-locus markings with all combinations
  if (genotype.W === 'W/w' || genotype.W === 'w/W') {
    markings.push('Variegated');
  } else if (genotype.W === 'W/W') {
    markings.push('Double Variegated');
    notes.push('Possibly lethal depending on line');
  } else if (genotype.W === 'Wsh/w' || genotype.W === 'w/Wsh') {
    markings.push('Banded');
  } else if (genotype.W === 'Wsh/Wsh') {
    markings.push('Double Banded');
    notes.push('Possibly lethal depending on line');
  } else if (genotype.W === 'Rw/w' || genotype.W === 'w/Rw') {
    markings.push('Rumpwhite');
  } else if (genotype.W === 'Rw/Rw') {
    markings.push('Double Rumpwhite');
    notes.push('Possibly lethal depending on line');
  } else if (genotype.W === 'W/Rw' || genotype.W === 'Rw/W') {
    markings.push('Variegated Rumpwhite');
    notes.push('Possibly lethal depending on line');
  } else if (genotype.W === 'W/Wsh' || genotype.W === 'Wsh/W') {
    markings.push('Variegated Banded');
    notes.push('Possibly lethal depending on line');
  } else if (genotype.W === 'Wsh/Rw' || genotype.W === 'Rw/Wsh') {
    markings.push('Rumpwhite Banded');
    notes.push('Possibly lethal depending on line');
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
  } else if (genotype.Rn === 'Rn/rn' || genotype.Rn === 'rn/Rn') {
    carriers.push('Roan');
  }

  // Silvered (Si) - recessive trait
  if (genotype.Si === 'si/si') {
    markings.push('Silvered');
  } else if (genotype.Si === 'Si/si' || genotype.Si === 'si/Si') {
    carriers.push('Silvered');
  }

  // Mobr - sex-linked to X chromosome, dominant (always shows if present)
  if (genotype.Mobr && genotype.Mobr.includes('Mobr/')) {
    markings.push('xbrindle');
  }

  // Texture - only show if coat genes were explicitly selected
  if (coatGenesSelected) {
    const hasLonghair = genotype.Go === 'go/go';
    const hasAstrex = genotype.Re === 'Re/re' || genotype.Re === 're/Re' || genotype.Re === 'Re/Re';
    
    // Check for Texel (longhair + astrex combination)
    const isTexel = hasLonghair && hasAstrex;
    
    if (isTexel) {
      texture = 'Texel';
    } else if (hasAstrex) {
      texture = 'Astrex';
    } else if (genotype.Re === 're/Re' || genotype.Re === 'Re/re') {
      carriers.push('Astrex');
    }

    // Only show hair length if coat genes were explicitly selected AND not Texel
    if (genotype.Go === 'Go/Go') {
      markings.push('Shorthair');
    } else if (genotype.Go === 'go/go' && !isTexel) {
      // Don't add Longhair if it's Texel (Longhair + Astrex)
      markings.push('Longhair');
    } else if (genotype.Go === 'Go/go' || genotype.Go === 'go/Go') {
      carriers.push('Longhair');
    }
    
    if (genotype.Sa === 'sa/sa') {
      texture = texture ? `${texture} Satin` : 'Satin';
    } else if (genotype.Sa === 'Sa/sa' || genotype.Sa === 'sa/Sa') {
      carriers.push('Satin');
    }
    
    if (genotype.Rst === 'rst/rst') {
      texture = texture ? `${texture} Rosette` : 'Rosette';
    } else if (genotype.Rst === 'Rst/rst' || genotype.Rst === 'rst/Rst') {
      carriers.push('Rosette');
    }
    
    if (genotype.Fz === 'fz/fz') {
      texture = texture ? `${texture} Fuzz` : 'Fuzz';
    } else if (genotype.Fz === 'Fz/fz' || genotype.Fz === 'fz/Fz') {
      carriers.push('Fuzz');
    }
    
    if (genotype.Nu === 'Nu/Nu' || genotype.Nu === 'Nu/nu') {
      texture = 'Dominant Hairless';
    }
  }

  // Combine results
  let result = '';
  
  // Only include color if color genes were selected
  if (colorGenesSelected && color) {
    result = color;
  }
  
  // Apply Umbrous after color but before markings
  if (genotype.U && genotype.U.includes('U/')) {
    result += (result ? ' ' : '') + 'Umbrous';
  }
  if (markings.length > 0) {
    result += (result ? ' ' : '') + markings.join(' ');
  }
  if (texture) {
    result += (result ? ' ' : '') + texture;
  }

  return { phenotype: result || 'Unknown', carriers, hidden, notes };
};

const MouseGeneticsCalculator = ({ API_BASE_URL, authToken, myAnimals = [] }) => {
  // Parse genetic code string to genotype object
  const parseGeneticCode = (codeString) => {
    if (!codeString) return {};
    
    const genotype = {};
    // Remove commas and split by whitespace
    const parts = codeString.replace(/,/g, ' ').trim().split(/\s+/);
    
    parts.forEach(part => {
      // Try to match format with slash: A/A, a/a, Go/go, etc.
      let match = part.match(/^([A-Za-z]+)\/([A-Za-z]+)$/);
      let allele1, allele2;
      
      if (match) {
        allele1 = match[1];
        allele2 = match[2];
      } else {
        // Try to match format without slash but only for single-character alleles: AA, Aa, aa
        // Don't try to parse multi-character alleles without slash (Go, Re, etc. should have /)
        match = part.match(/^([A-Za-z])([A-Za-z])$/);
        if (match) {
          allele1 = match[1];
          allele2 = match[2];
        }
      }
      
      if (allele1 && allele2) {
        let found = false;
        
        // First, try to find an exact match (preserving case)
        const exactMatch = `${allele1}/${allele2}`;
        
        for (const [locus, data] of Object.entries(GENE_LOCI)) {
          if (data.combinations.includes(exactMatch)) {
            genotype[locus] = exactMatch;
            found = true;
            break;
          }
        }
        
        // If no exact match, try the reverse order
        if (!found) {
          const reverseMatch = `${allele2}/${allele1}`;
          for (const [locus, data] of Object.entries(GENE_LOCI)) {
            if (data.combinations.includes(reverseMatch)) {
              genotype[locus] = reverseMatch;
              found = true;
              break;
            }
          }
        }
      }
    });
    
    return genotype;
  };

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
  
  // Animal selector states
  const [showAnimalSelector, setShowAnimalSelector] = useState(false);
  const [selectingForParent, setSelectingForParent] = useState(null); // 'parent1' or 'parent2'
  const [animalSearch, setAnimalSearch] = useState('');

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

  // Animal selection functions
  const openAnimalSelector = (parentNumber) => {
    setSelectingForParent(parentNumber);
    setAnimalSearch('');
    setShowAnimalSelector(true);
  };

  const closeAnimalSelector = () => {
    setShowAnimalSelector(false);
    setSelectingForParent(null);
    setAnimalSearch('');
  };

  const selectAnimal = (animal) => {
    if (!animal.geneticCode) {
      alert('This animal does not have a genetic code set.');
      return;
    }

    const parsedGenotype = parseGeneticCode(animal.geneticCode);
    
    if (Object.keys(parsedGenotype).length === 0) {
      alert('Could not parse genetic code for this animal.');
      return;
    }

    if (selectingForParent === 'parent1') {
      setParent1({ ...defaultGenotype, ...parsedGenotype });
    } else if (selectingForParent === 'parent2') {
      setParent2({ ...defaultGenotype, ...parsedGenotype });
    }

    closeAnimalSelector();
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

    // Check if only incomplete color genes are selected (without full color gene set)
    const colorGenes = ['A', 'B', 'C', 'D', 'E', 'P'];
    const markingGenes = ['W', 'Wsh', 'Rw', 'S', 'Mi', 'Rb'];
    const selectedColorGenes = selectedLoci.filter(locus => colorGenes.includes(locus));
    const selectedMarkingGenes = selectedLoci.filter(locus => markingGenes.includes(locus));
    
    // If only one color gene selected (excluding A-locus which can stand alone) and no marking genes, prevent calculation
    if (selectedColorGenes.length === 1 && !selectedColorGenes.includes('A') && selectedMarkingGenes.length === 0) {
      alert('Additional color loci are needed for full phenotype calculation. Please select A-locus along with other color genes (B, C, D, E, P) for complete results.');
      return;
    }
    
    // Check if any coat genes were selected by either parent
    const coatGenesSelected = ['Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'].some(gene => 
      (parent1[gene] && parent1[gene] !== '') || (parent2[gene] && parent2[gene] !== '')
    );
    
    // Create selectedGenotype that includes ALL genes selected by either parent
    const selectedGenotype = {};
    Object.keys(GENE_LOCI).forEach(locus => {
      if ((parent1[locus] && parent1[locus] !== '') || (parent2[locus] && parent2[locus] !== '')) {
        selectedGenotype[locus] = 'selected';
      }
    });
    
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
          carriers: result.carriers || [],
          notes: result.notes || [],
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
      carriers: data.carriers,
      notes: data.notes,
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
        { name: 'Extreme Black', image: '/images/phenotypes/ex-black.png', genotype: { A: 'ae/ae', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Black', image: '/images/phenotypes/black.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate', image: '/images/phenotypes/chocolate.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue', image: '/images/phenotypes/blue.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Lilac', image: '/images/phenotypes/lilac.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Champagne', image: '/images/phenotypes/champagne.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Dove', image: '/images/phenotypes/dove.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Lavender', image: '/images/phenotypes/lavender.png', genotype: { A: 'a/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Silver', image: '/images/phenotypes/silver.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Red', image: '/images/phenotypes/red.png', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'P/P' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' }
        ] },
        { name: 'Fawn', image: '/images/phenotypes/fawn.png', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'e/e', P: 'p/p' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' }
        ] },
        { name: 'Amber', image: '/images/phenotypes/amber.png', genotypes: [
          { A: 'a/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'e/e', P: 'P/P' },
          { A: 'Ay/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' }
        ] },
      ]
    },
    ticked: {
      name: 'Ticked',
      examples: [
        { name: 'Agouti', image: '/images/phenotypes/agouti.png', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Brindle', image: '/images/phenotypes/brindle.png', genotype: { A: 'Avy/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Argente', image: '/images/phenotypes/argente.png', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon', image: '/images/phenotypes/cinnamon.png', genotype: { A: 'A/-', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Agouti', image: '/images/phenotypes/blue-agouti.png', genotype: { A: 'A/-', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Cinnamon Argente', image: '/images/phenotypes/cinnamon-argente.png', genotype: { A: 'A/-', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
      ]
    },
    tan: {
      name: 'Tan',
      examples: [
        { name: 'Black Tan', image: '/images/phenotypes/blacktan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Tan', image: '/images/phenotypes/bluetan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Tan', image: '/images/phenotypes/chocolatetan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Lilac Tan', image: '/images/phenotypes/lilactan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Dove Tan', image: '/images/phenotypes/dovetan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Agouti Tan', image: '/images/phenotypes/agoutitan.png', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Argente Tan', image: '/images/phenotypes/argentetan.png', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Blue Agouti Tan', image: '/images/phenotypes/blueagoutitan.png', genotype: { A: 'A/at', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Champagne Tan', image: '/images/phenotypes/champagnetan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon Argente Tan', image: '/images/phenotypes/cinnamonargentetan.png', genotype: { A: 'A/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'p/p' } },
        { name: 'Cinnamon Tan', image: '/images/phenotypes/cinnamontan.png', genotype: { A: 'A/at', B: 'b/b', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Lavender Tan', image: '/images/phenotypes/lavendertan.png', genotype: { A: 'at/a', B: 'b/b', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Silver Tan', image: '/images/phenotypes/silvertan.png', genotype: { A: 'at/a', B: 'B/B', C: 'C/C', D: 'd/d', E: 'E/E', P: 'p/p' } },
        { name: 'Sable', image: '/images/phenotypes/sable.png', genotype: { A: 'Ay/at', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', U: 'U/u' } },
      ]
    },
    cdilute: {
      name: 'C-locus',
      examples: [
        { name: 'Albino', image: '/images/phenotypes/albino-pew.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/c', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Bone', image: '/images/phenotypes/bone.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Stone', image: '/images/phenotypes/bluestone.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Stone', image: '/images/phenotypes/stone.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Himalayan', image: '/images/phenotypes/himalayan.png', genotype: { A: 'a/a', B: 'B/B', C: 'c/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Siamese', image: '/images/phenotypes/siamese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Siamese', image: '/images/phenotypes/bluesiamese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/ch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Siamese', image: '/images/phenotypes/chocsiamese.png', genotype: { A: 'a/a', B: 'b/b', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Burmese', image: '/images/phenotypes/burmese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Burmese', image: '/images/phenotypes/blueburmese.png', genotype: { A: 'a/a', B: 'B/B', C: 'ch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Blue', image: '/images/phenotypes/colorpointblue.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Chocolate', image: '/images/phenotypes/colorpointchoc.png', genotype: { A: 'a/a', B: 'b/b', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Beige', image: '/images/phenotypes/beige.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Beige', image: '/images/phenotypes/colorpointbeige.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Beige', image: '/images/phenotypes/bluebeige.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/ce', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Mock Chocolate', image: '/images/phenotypes/mockchoc.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Mock Chocolate', image: '/images/phenotypes/bluemockchoc.png', genotype: { A: 'a/a', B: 'B/B', C: 'ce/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Sepia', image: '/images/phenotypes/black.png', genotype: { A: 'a/a', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Sepia', image: '/images/phenotypes/bluesepia.png', genotype: { A: 'a/a', B: 'B/B', C: 'cch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Sepia', image: '/images/phenotypes/chocsepia.png', genotype: { A: 'a/a', B: 'b/b', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Cream', image: '/images/phenotypes/cream.png', genotype: { A: 'Ay/-', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Silveragouti', image: '/images/phenotypes/silveragouti.png', genotype: { A: 'A/-', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
      ]
    },
    fox: {
      name: 'Fox',
      examples: [
        { name: 'Sepia Fox', image: '/images/phenotypes/sepiafox.png', genotype: { A: 'at/a', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Beige Fox', image: '/images/phenotypes/beigefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ce/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Bone Fox', image: '/images/phenotypes/bonefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Burmese Fox', image: '/images/phenotypes/burmesefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Chinchilla', image: '/images/phenotypes/chinchilla.png', genotype: { A: 'A/at', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Colorpoint Beige Fox', image: '/images/phenotypes/colorpointbeigefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ce/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Cream Fox', image: '/images/phenotypes/creamfox.png', genotype: { A: 'Ay/at', B: 'B/B', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Himalayan Fox', image: '/images/phenotypes/himalayanfox.png', genotype: { A: 'at/a', B: 'B/B', C: 'c/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Mock Chocolate Fox', image: '/images/phenotypes/mockchocfox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ce/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Siamese Fox', image: '/images/phenotypes/siamesefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'ch/ch', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Stone Fox', image: '/images/phenotypes/stonefox.png', genotype: { A: 'at/a', B: 'B/B', C: 'c/ce', D: 'D/D', E: 'E/E', P: 'P/P' } },
        { name: 'Blue Sepia Fox', image: '/images/phenotypes/bluesepiafox.png', genotype: { A: 'at/a', B: 'B/B', C: 'cch/cch', D: 'd/d', E: 'E/E', P: 'P/P' } },
        { name: 'Chocolate Sepia Fox', image: '/images/phenotypes/chocsepiafox.png', genotype: { A: 'at/a', B: 'b/b', C: 'cch/cch', D: 'D/D', E: 'E/E', P: 'P/P' } },
      ]
    },
    marked: {
      name: 'Marked',
      examples: [
        { name: 'Pink Eye White', image: '/images/phenotypes/albino-pew.png', note: 'Possible combinations:', genotypes: [
          { E: 'e/e', C: 'ch/ch' },
          { C: 'ch/ch', P: 'p/p' },
          { C: 'ch/ch', S: 's/s' },
          { C: 'ch/ch', W: 'W/-' },
          { P: 'p/p', S: 's/s', W: 'W/-' }
        ] },
        { name: 'Black Eye White', image: '/images/phenotypes/bew.png', note: 'Possible combinations:', genotypes: [
          { E: 'e/e', C: 'c/ce' },
          { C: 'c/ce', S: 's/s' },
          { C: 'c/ce', W: 'W/-' },
          { S: 's/s', W: 'W/-' }
        ] },
        { name: 'Pied', image: '/images/phenotypes/pied.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s' } },
        { name: 'Dutch', image: '/images/phenotypes/dutch.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s+' }, note: 'Kit selection markers necessary' },
        { name: 'Hereford', image: '/images/phenotypes/hereford.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', S: 's/s+' }, note: 'Kit selection markers necessary' },
        { name: 'Banded', image: '/images/phenotypes/banded.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'Wsh/w' } },
        { name: 'Variegated', image: '/images/phenotypes/variegated.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'W/w' } },
        { name: 'Rumpwhite', image: '/images/phenotypes/rumpwhite.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', W: 'Rw/w' } },
        { name: 'xbrindle', image: '/images/phenotypes/xbrindle.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Mobr: 'Mobr/mobr' } },
        { name: 'Roan', image: '/images/phenotypes/roan.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Rn: 'rn/rn' } },
        { name: 'Pearl/Silvered', image: '/images/phenotypes/pearl.png', genotype: { A: 'a/a', B: 'B/B', C: 'C/C', D: 'D/D', E: 'E/E', P: 'P/P', Si: 'si/si' } },
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
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
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
                    <div className="mt-3 flex justify-center">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tutorial-target="parent-selectors">
        {/* Sire/Father */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">Sire/Father</h2>
            {authToken && myAnimals.length > 0 && (
              <button
                onClick={() => openAnimalSelector('parent1')}
                data-tutorial-target="select-animal-btn"
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                title="Select from your animals"
              >
                <User size={14} />
                Select Animal
              </button>
            )}
          </div>
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
            {parent1Result.notes && parent1Result.notes.length > 0 && (
              <p className="text-sm text-orange-600 italic mb-2">
                Note: {parent1Result.notes.join('; ')}
              </p>
            )}
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-pink-800">Dam/Mother</h2>
            {authToken && myAnimals.length > 0 && (
              <button
                onClick={() => openAnimalSelector('parent2')}
                className="flex items-center gap-1 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-lg transition"
                title="Select from your animals"
              >
                <User size={14} />
                Select Animal
              </button>
            )}
          </div>
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
            {parent2Result.notes && parent2Result.notes.length > 0 && (
              <p className="text-sm text-orange-600 italic mb-2">
                Note: {parent2Result.notes.join('; ')}
              </p>
            )}
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
              data-tutorial-target="calculate-offspring-btn"
            >
              Calculate Offspring
            </button>
          </div>

          {/* Offspring Results */}
          {offspringResults && (
            <div className="mt-6 bg-purple-50 rounded-lg p-6 border-2 border-purple-300" data-tutorial-target="offspring-results">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Possible Offspring Outcomes</h2>
              <div className="space-y-3">
                {offspringResults.map((result, idx) => {
                  // For offspring display: if phenotype is empty but has carriers, show carrier status
                  const displayPhenotype = result.phenotype || 
                    (result.carriers && result.carriers.length > 0 
                      ? result.carriers.map(c => `${c} Carrier`).join(', ') 
                      : '');
                  
                  return (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-lg font-semibold ${displayPhenotype.includes('LETHAL') ? 'text-red-600' : 'text-gray-800'}`}>
                            <span className="text-sm font-medium text-gray-600">Phenotype: </span>
                            {displayPhenotype}
                          </p>
                          <span className="text-purple-700 font-semibold">
                            {result.percentage}%
                          </span>
                        </div>
                        {result.notes && result.notes.length > 0 && (
                          <p className="text-sm text-orange-600 italic mt-1">
                            Note: {result.notes.join('; ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => togglePhenotype(idx)}
                          className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition flex items-center gap-1"
                        >
                          {expandedPhenotypes[idx] ? '▲' : '▼'} {result.genotypes.length} genotype{result.genotypes.length !== 1 ? 's' : ''}
                        </button>
                        {authToken && (
                          <button
                            onClick={() => openFeedbackModal(result.phenotype, result.genotypes[0])}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition whitespace-nowrap"
                            title="Report incorrect or unknown phenotype"
                          >
                            Report Issue
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {expandedPhenotypes[idx] && (
                      <div className="mt-3 pt-3 border-t border-purple-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {result.genotypes.map((genotype, gIdx) => (
                            <div key={gIdx} className="text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded">
                              {Object.entries(genotype)
                                .map(([_, alleles]) => alleles)
                                .join(' ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
                })}
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

          {/* Animal Selector Modal */}
          {showAnimalSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Select Animal for {selectingForParent === 'parent1' ? 'Sire' : 'Dam'}
                  </h3>
                  <button
                    onClick={closeAnimalSelector}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search animals by name or ID..."
                      value={animalSearch}
                      onChange={(e) => setAnimalSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Animal List */}
                <div className="space-y-2">
                  {myAnimals
                    .filter(animal => {
                      // Filter by gender
                      if (selectingForParent === 'parent1' && animal.gender !== 'Male') return false;
                      if (selectingForParent === 'parent2' && animal.gender !== 'Female') return false;
                      
                      // Filter by species (Fancy Mouse only)
                      if (animal.species !== 'Fancy Mouse') return false;
                      
                      // Filter by search
                      if (animalSearch) {
                        const searchLower = animalSearch.toLowerCase();
                        const nameMatch = animal.name.toLowerCase().includes(searchLower);
                        const idMatch = animal.id_public.toString().includes(searchLower);
                        if (!nameMatch && !idMatch) return false;
                      }
                      
                      return true;
                    })
                    .map(animal => (
                      <div
                        key={animal.id_public}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition cursor-pointer ${
                          animal.geneticCode
                            ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        }`}
                        onClick={() => animal.geneticCode && selectAnimal(animal)}
                      >
                        {/* Animal Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                          {animal.imageUrl || animal.photoUrl ? (
                            <img 
                              src={animal.imageUrl || animal.photoUrl} 
                              alt={animal.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <User size={32} />
                            </div>
                          )}
                        </div>

                        {/* Animal Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {animal.prefix && `${animal.prefix} `}
                            {animal.name}
                            {animal.suffix && ` ${animal.suffix}`}
                          </p>
                          <p className="text-sm text-gray-600">{animal.id_public} • {animal.species}</p>
                          {animal.geneticCode ? (
                            <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                              {animal.geneticCode}
                            </p>
                          ) : (
                            <p className="text-xs text-red-600 italic mt-1">
                              No genetic code set
                            </p>
                          )}
                        </div>

                        {/* Select Button */}
                        {animal.geneticCode && (
                          <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex-shrink-0"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    ))}
                  
                  {myAnimals.filter(a => 
                    (selectingForParent === 'parent1' ? a.gender === 'Male' : a.gender === 'Female') &&
                    a.species === 'Fancy Mouse'
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No {selectingForParent === 'parent1' ? 'male' : 'female'} Fancy Mice found in your collection.</p>
                    </div>
                  )}
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

