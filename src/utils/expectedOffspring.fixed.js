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
    const bUpper = b[0] && b[0] === b[0].toUpperCase() && b[0] !== b[0].toLowerCase();
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
 *                           'russianDwarfHamster', 'ballPython'
 * @returns {Array<{trait: string, probability: number}>} Array of {trait, probability}
 *      where probability is a percentage (0-100). Returns [] for missing/invalid inputs
 *      or unsupported species.
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

