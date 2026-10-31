// Utility for computing expected offspring phenotype probabilities from parental genetic codes.
// Uses Punnett square genetics combined with species-specific phenotype rule sets.

import { matchFancyRatPhenotype } from '../data/fancyRatPhenotypeRules';
import { matchSyrianHamsterPhenotype } from '../data/syrianHamsterPhenotypeRules';
import { matchCampbellsDwarfHamsterPhenotype } from '../data/campbellsDwarfHamsterPhenotypeRules';
import { matchRussianDwarfHamsterPhenotype } from '../data/russianDwarfHamsterPhenotypeRules';
import { matchBallPythonPhenotype } from '../data/ballPythonPhenotypeRules';

// Core Punnett square: given a parent's genotype allele pair, returns the gametes
// with their transmission probabilities.
function getGametes(genotype) {
  if (!genotype || !genotype.includes('/')) {
    return [genotype || '?'];
  }
  const [a, b] = genotype.split('/');
  if (!a || !b) return [genotype];
  return [a, b];
}

// Compute the probability distribution of offspring genotypes for a single locus.
function computeLocusOffspringDistribution(sireGenotype, damGenotype) {
  const sireGametes = getGametes(sireGenotype);
  const damGametes = getGametes(damGenotype);

  const distribution = {};

  for (const s of sireGametes) {
    for (const d of damGametes) {
      const allele1 = s <= d ? s : d;
      const allele2 = s <= d ? d : s;
      const genotypeKey = `${allele1}/${allele2}`;
      distribution[genotypeKey] = (distribution[genotypeKey] || 0) + 1 / (sireGametes.length * damGametes.length);
    }
  }

  return distribution;
}

// Normalize a genotype object for use with species phenotype rules.
function normalizeGenotype(genotype) {
  if (!genotype) return {};
  const normalized = {};
  for (const [locus, allelePair] of Object.entries(genotype)) {
    if (!allelePair || !allelePair.includes('/')) {
      normalized[locus] = allelePair;
      continue;
    }
    const [a, b] = allelePair.split('/');
    const aUpper = a[0] && a[0] === a[0].toUpperCase() && a[0] !== a[0].toLowerCase();
    const bUpper = b[0] && b[0] === b[0].toLowerCase() && b[0] !== b[0].toLowerCase();
    if (aUpper && !bUpper) {
      normalized[locus] = `${a}/${b}`;
    } else if (!aUpper && bUpper) {
      normalized[locus] = `${b}/${a}`;
    } else {
      normalized[locus] = a.localeCompare(b) <= 0 ? `${a}/${b}` : `${b}/${a}`;
    }
  }
  return normalized;
}

/** 
 * Compute expected offspring phenotype probabilities.
 * 
 * @param {Object} sireCode - Parental genetic code object, e.g. {A: 'A/a', B: 'b/b', ...}
 * @param {Object} damCode - Parental genetic code object, e.g. {A: 'A/a', B: 'b/b', ...}
 * @param {string} species - Species key: 'fancyRat', 'syrianHamster', 'campbellsDwarfHamster', 
 *   'russianDwarfHamster', 'ballPython'
 * @returns {Array<{trait: string, probability: number}>} Array of {trait, probability}
 *   where probability is a percentage (0-100). Returns [] for missing/invalid inputs
 *   or unsupported species.
 */
export function computeExpectedOffspring(sireCode, damCode, species) {
    if (!sireCode || !damCode || !species) return [];

    const speciesKey = species.toLowerCase().trim();

    // Map a species key to its matching function
    const rulesMap = {
      fancyRat: { match: matchFancyRatPhenotype },
      syrianHamster: { match: matchSyrianHamsterPhenotype },
      campbellsDwarfHamster: { match: matchCampbellsDwarfHamsterPhenotype },
      russianDwarfHamster: { match: matchRussianDwarfHamsterPhenotype },
      ballPython: { match: matchBallPythonPhenotype },
    };

    const rules = rulesMap[speciesKey];
    if (!rules) return []; // unsupported species

    // Get the set of all loci present in either parent
    const allLoci = new Set([
      ...Object.keys(sireCode),
      ...Object.keys(damCode),
    ]);

    if (allLoci.size === 0) return [];

    // Compute per-locus offspring genotype distributions
    const locusDistributions = {};
    for (const locus of allLoci) {
      const sireGenotype = sireCode[locus];
      const damGenotype = damCode[locus];
      const dist = computeLocusOffspringDistribution(sireGenotype, damGenotype);
      locusDistributions[locus] = dist;
    }

    // Collect all possible offspring genotype combinations and their probabilities
    // Loci assort independently, so we compute the cartesian product
    let offspringCombos = { '': 1.0 };

    for (const locus of allLoci) {
      const dist = locusDistributions[locus];
      const newCombos = {};

      for (const [existingGenotype, existingProb] of Object.entries(offspringCombos)) {
        for (const [offspringGenotype, locusProb] of Object.entries(dist)) {
          const combined =
            existingGenotype === ''
              ? offspringGenotype
              : `${existingGenotype}|${offspringGenotype}`;

          newCombos[combined] = (newCombos[combined] || 0) + existingProb * locusProb;
        }
      }

      offspringCombos = newCombos;
    }

    // Map each genotype combination to a phenotype using the species rules
    const phenotypeProbs = {};

    for (const [genotypeCombo, prob] of Object.entries(offspringCombos)) {
      const lociParts = genotypeCombo.split('|');

      const genotypeObj = {};
      let idx = 0;
      for (const locus of allLoci) {
        genotypeObj[locus] = lociParts[idx] || '?';
        idx++;
      }

      let phenotype = 'Unknown';
      try {
        phenotype = rules.match(genotypeObj);
      } catch (e) {
        // keep Unknown
      }

      phenotypeProbs[phenotype] = (phenotypeProbs[phenotype] || 0) + prob;
    }

    // Convert to output format: [{trait, probability}] with percentage
    const result = Object.entries(phenotypeProbs).map(
      ([trait, probability]) => ({
        trait,
        probability: Math.round(probability * 100),
      })
    );

    // Sort by probability descending
    result.sort((a, b) => b.probability - a.probability);

    return result;
}

/**
 * Compute confirmed offspring traits from offspring genetic codes and appearance fields.
 * 
 * First tries to match against genetic code using species phenotype rules.
 * If result is "Unknown" or no traits found, falls back to appearance fields: 
 * color, markings, coat, earset.
 * Joins non-null appearance fields as trait description.
 * 
 * @param {Array<Object>} offspringCodes - Array of offspring genetic code objects, e.g. 
 *   [{A: 'A/a', B: 'b/b'}, {A: 'a/a', B: 'B/b'}, ...]
 * @param {string} species - Species key: 'fancyRat', 'syrianHamster', 'campbellsDwarfHamster', 
 *   'russianDwarfHamster', 'ballPython'
 * @param {Object} appearanceFields - Optional appearance fields object with keys: 
 *   color, markings, earset, coat, eyeColor, carrierTraits, body
 * @returns {Array<{trait: string, percentage: number}>} Array of {trait, percentage}
 *   where percentage is a confidence score (100 if determined from genetics, 
 *   or calculated from appearance field presence). Returns [] for missing/invalid inputs
 *   or unsupported species.
 */
export function computeConfirmedOffspringTraits(offspringCodes, species, appearanceFields) {
  if (!Array.isArray(offspringCodes) || !offspringCodes.length || !species) return [];

  // Build a set of unique traits from ALL offspring
  const traitMap = new Map();

  // Compute traits for EACH offspring and merge them
  for (let i = 0; i < offspringCodes.length; i++) {
    const offspringCode = offspringCodes[i];
    const appearance = appearanceFields && appearanceFields[i] ? appearanceFields[i] : null;

    // Try to match phenotype from genetic code first
    const geneticTraits = computeExpectedOffspring(offspringCode, offspringCode, species);

    // If we got valid genetic traits, add them with 100% confidence
    if (geneticTraits && geneticTraits.length > 0) {
      for (const trait of geneticTraits) {
        // Split combined trait names into separate traits
        // e.g. "Chocolate Pied" -> "chocolate", "pied"
        const individualTraits = splitCombinedTrait(trait.trait);
        for (const individualTrait of individualTraits) {
          const traitKey = individualTrait.toLowerCase();
          if (!traitMap.has(traitKey)) {
            traitMap.set(traitKey, { trait: individualTrait, percentage: trait.percentage, sources: [] });
          }
          // Take the maximum percentage
          traitMap.get(traitKey).percentage = Math.max(traitMap.get(traitKey).percentage, trait.percentage);
        }
      }
    } else if (appearance) {
      // Fall back to appearance fields if genetic code gives no traits
      const { color, markings, coat, earset } = appearance;
      const appearanceTraits = [];

      if (color) appearanceTraits.push({ trait: color, percentage: 100 });
      if (markings) appearanceTraits.push({ trait: markings, percentage: 100 });
      if (coat) appearanceTraits.push({ trait: coat, percentage: 100 });
      if (earset) appearanceTraits.push({ trait: earset, percentage: 100 });

      // Add appearance traits to map
      for (const trait of appearanceTraits) {
        const traitKey = trait.trait.toLowerCase();
        if (!traitMap.has(traitKey)) {
          traitMap.set(traitKey, { trait: trait.trait, percentage: trait.percentage, sources: [] });
        }
        traitMap.get(traitKey).percentage = Math.max(traitMap.get(traitKey).percentage, trait.percentage);
      }
    }
  }

  // Return merged traits from all offspring
  const result = Array.from(traitMap.values());
  result.sort((a, b) => b.percentage - a.percentage);
  return result;
}

/**
 * Split a combined trait name into individual traits.
 * For example:
 *   "Chocolate Pied" -> ["chocolate", "pied"]
 *   "Black Pied" -> ["black", "pied"]
 *   "Champagne Brindle" -> ["champagne", "brindle"]
 *
 * @param {string} trait - Combined trait name
 * @returns {string[]} Array of individual trait names
 */
function splitCombinedTrait(trait) {
  // Common compound trait patterns - split on known combining words
  // Each entry has a space prefix so it matches as a complete word
  const COMBINED_WORDS = [
    ' pied', ' pied', ' pied', ' pied', ' pied',  // pied (multiple derivatives)
    ' brindle', ' brindle', ' brindle', ' brindle', ' brindle',  // brindle (multiple derivatives)
    ' tan', ' tan', ' tan', ' tan', ' tan',  // tan (multiple derivatives)
    ' snow', ' snow', ' snow', ' snow',
    ' cream', ' cream', ' cream',
    ' white', ' white', ' white', ' white',
    ' black', ' black', ' black',
    ' blue', ' blue',
    ' lilac', ' lilac',
    ' chocolate', ' chocolate',
    ' fawn', ' fawn',
    ' agouti', ' agouti',
    ' normal', ' normal',
    ' albino', ' albino',
    ' smoke', ' smoke',
    ' dilute', ' dilute',
    ' grey', ' grey',
    ' champagne', ' champagne',
  ];

  // Split the trait into words
  const words = trait.trim().split(/\s+/);
  const result = [];

  // Find the first combined word and split by it
  for (const combinedWord of COMBINED_WORDS) {
    if (combinedWord.startsWith(' ')) {
      // Word has a space prefix
      const parts = trait.split(new RegExp(`\\s+${combinedWord.trim()}\\s*`, 'i'));
      if (parts.length > 1) {
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed) {
            result.push(trimmed.toLowerCase());
          }
        }
        return result;
      }
    }
  }

  // If no split happened, return the original trait
  // (this handles single traits like "Albino", "Black", "Normal")
  return [trait];
}