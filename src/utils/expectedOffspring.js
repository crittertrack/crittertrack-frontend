// Utility for computing expected offspring phenotype probabilities from parental genetic codes.
// Uses Punnett square genetics combined with species-specific phenotype rule sets.

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

  // Try to compute traits from the last offspring's genetic code
  const lastOffspringCode = offspringCodes[offspringCodes.length - 1];

  if (!lastOffspringCode) return [];

  // Try to match phenotype from genetic code first
  const geneticTraits = computeExpectedOffspring(lastOffspringCode, lastOffspringCode, species);

  // If we got valid genetic traits, return them with 100% confidence
  if (geneticTraits && geneticTraits.length > 0) {
    return geneticTraits.map(t => ({
      trait: t.trait,
      percentage: 100
    })).sort((a, b) => b.percentage - a.percentage);
  }

  // Fall back to appearance fields if genetic code gives no traits or "Unknown"
  if (appearanceFields) {
    const { color, markings, coat, earset } = appearanceFields;
    const appearanceTraits = [];

    if (color) appearanceTraits.push({ trait: color, percentage: 100 });
    if (markings) appearanceTraits.push({ trait: markings, percentage: 100 });
    if (coat) appearanceTraits.push({ trait: coat, percentage: 100 });
    if (earset) appearanceTraits.push({ trait: earset, percentage: 100 });

    // Filter out any empty/undefined traits and sort by percentage descending
    const nonEmptyTraits = appearanceTraits.filter(t => t.trait);

    if (nonEmptyTraits.length > 0) {
      return nonEmptyTraits.sort((a, b) => b.percentage - a.percentage);
    }
  }

  // Final fallback: return empty array
  return [];
}