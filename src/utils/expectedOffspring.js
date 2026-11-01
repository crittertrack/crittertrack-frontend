// Calculate expected phenotype probabilities and observed traits for a litter.

import {
  matchFancyRatPhenotype,
  RAT_GENE_LOCI,
} from '../data/fancyRatPhenotypeRules';
import {
  matchSyrianHamsterPhenotype,
  SYRIAN_HAMSTER_GENE_LOCI,
} from '../data/syrianHamsterPhenotypeRules';
import {
  matchCampbellsDwarfHamsterPhenotype,
  CAMPBELLS_DWARF_HAMSTER_GENE_LOCI,
} from '../data/campbellsDwarfHamsterPhenotypeRules';
import {
  matchRussianDwarfHamsterPhenotype,
  RUSSIAN_DWARF_HAMSTER_GENE_LOCI,
} from '../data/russianDwarfHamsterPhenotypeRules';
import {
  matchBallPythonPhenotype,
  parseBallPythonGeneticCode,
} from '../data/ballPythonPhenotypeRules';

const RULES_BY_SPECIES = {
  fancyrat: matchFancyRatPhenotype,
  syrianhamster: matchSyrianHamsterPhenotype,
  campbellsdwarfhamster: matchCampbellsDwarfHamsterPhenotype,
  russiandwarfhamster: matchRussianDwarfHamsterPhenotype,
  ballpython: matchBallPythonPhenotype,
};
const GENE_LOCI_BY_SPECIES = {
  fancyrat: RAT_GENE_LOCI,
  syrianhamster: SYRIAN_HAMSTER_GENE_LOCI,
  campbellsdwarfhamster: CAMPBELLS_DWARF_HAMSTER_GENE_LOCI,
  russiandwarfhamster: RUSSIAN_DWARF_HAMSTER_GENE_LOCI,
};

function getSpeciesKey(species) {
  if (typeof species !== 'string') return null;
  return species.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSpeciesRules(species) {
  const speciesKey = getSpeciesKey(species);
  return speciesKey && Object.prototype.hasOwnProperty.call(RULES_BY_SPECIES, speciesKey)
    ? RULES_BY_SPECIES[speciesKey]
    : null;
}

function parseGeneticCode(code, species) {
  if (code && typeof code === 'object' && !Array.isArray(code)) return code;
  if (typeof code !== 'string' || !code.trim()) return {};

  const speciesKey = getSpeciesKey(species);
  if (speciesKey === 'ballpython') return parseBallPythonGeneticCode(code);

  const geneLoci = GENE_LOCI_BY_SPECIES[speciesKey];
  if (!geneLoci) return {};

  const genotype = {};
  for (const token of code.trim().split(/[\s,]+/)) {
    const alleles = token.split('/');
    if (alleles.length !== 2 || !alleles.every(Boolean)) continue;
    const reversed = `${alleles[1]}/${alleles[0]}`;

    for (const [locus, data] of Object.entries(geneLoci)) {
      const combinations = data.maleCombinations
        ? [...data.combinations, ...data.maleCombinations]
        : data.combinations;
      if (combinations.includes(token)) {
        genotype[locus] = token;
        break;
      }
      if (combinations.includes(reversed)) {
        genotype[locus] = reversed;
        break;
      }
    }
  }
  return genotype;
}

function getGametes(genotype) {
  if (typeof genotype !== 'string') return [];
  const alleles = genotype.split('/').map((allele) => allele.trim());
  return alleles.length === 2 && alleles.every(Boolean) ? alleles : [];
}

function normalizeGenotype(genotype) {
  const normalized = {};
  for (const [locus, value] of Object.entries(genotype || {})) {
    if (typeof value !== 'string') continue;
    const alleles = value.split('/').map((allele) => allele.trim());
    if (alleles.length !== 2 || !alleles.every(Boolean)) continue;
    const [a, b] = alleles;

    if (a === 'Y' || b === 'Y') {
      normalized[locus] = `${a === 'Y' ? b : a}/Y`;
      continue;
    }

    const aUpper = a[0] === a[0].toUpperCase() && a[0] !== a[0].toLowerCase();
    const bUpper = b[0] === b[0].toUpperCase() && b[0] !== b[0].toLowerCase();
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

function computeLocusOffspringDistribution(sireGenotype, damGenotype) {
  const sireGametes = getGametes(sireGenotype);
  const damGametes = getGametes(damGenotype);
  if (!sireGametes.length || !damGametes.length) return null;

  const distribution = {};
  for (const sireAllele of sireGametes) {
    for (const damAllele of damGametes) {
      const genotype = normalizeGenotype({
        locus: `${sireAllele}/${damAllele}`,
      }).locus;
      distribution[genotype] =
        (distribution[genotype] || 0) + 1 / (sireGametes.length * damGametes.length);
    }
  }
  return distribution;
}

function matchGenotypePhenotype(genotype, species) {
  const matchPhenotype = getSpeciesRules(species);
  const parsedGenotype = parseGeneticCode(genotype, species);
  if (!matchPhenotype || !Object.keys(parsedGenotype).length) return null;

  const result = matchPhenotype(normalizeGenotype(parsedGenotype));
  if (typeof result === 'string') return result;
  return typeof result?.phenotype === 'string' ? result.phenotype : null;
}

function toPercentages(probabilities) {
  const rounded = Object.entries(probabilities).map(([trait, probability]) => {
    const exactPercentage = probability * 100;
    return {
      trait,
      probability: Math.floor(exactPercentage),
      remainder: exactPercentage - Math.floor(exactPercentage),
    };
  });
  const remainingPercentage =
    100 - rounded.reduce((sum, item) => sum + item.probability, 0);

  rounded
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, remainingPercentage)
    .forEach((item) => {
      rounded.find((entry) => entry.trait === item.trait).probability += 1;
    });

  return rounded
    .map(({ trait, probability }) => ({ trait, probability }))
    .sort((a, b) => b.probability - a.probability || a.trait.localeCompare(b.trait));
}

/**
 * Predict offspring phenotypes from the loci recorded for both parents.
 * Loci missing from either parent are excluded because their inheritance cannot
 * be calculated from the available data.
 */
export function computeExpectedOffspring(sireCode, damCode, species) {
  if (!sireCode || !damCode || !getSpeciesRules(species)) {
    return [];
  }

  const sireGenotype = parseGeneticCode(sireCode, species);
  const damGenotype = parseGeneticCode(damCode, species);
  const commonLoci = Object.keys(sireGenotype)
    .filter((locus) => Object.prototype.hasOwnProperty.call(damGenotype, locus))
    .filter((locus) =>
      getGametes(sireGenotype[locus]).length > 0
      && getGametes(damGenotype[locus]).length > 0
    )
    .sort();
  if (commonLoci.length === 0) return [];

  const locusDistributions = commonLoci.map((locus) =>
    computeLocusOffspringDistribution(sireGenotype[locus], damGenotype[locus])
  );
  let offspringCombos = [{ genotype: {}, probability: 1 }];

  for (let index = 0; index < commonLoci.length; index += 1) {
    const locus = commonLoci[index];
    const distribution = locusDistributions[index];
    const nextCombos = [];

    for (const combo of offspringCombos) {
      for (const [genotype, probability] of Object.entries(distribution)) {
        nextCombos.push({
          genotype: { ...combo.genotype, [locus]: genotype },
          probability: combo.probability * probability,
        });
      }
    }
    offspringCombos = nextCombos;
  }

  const phenotypeProbabilities = {};
  for (const combo of offspringCombos) {
    const phenotype = matchGenotypePhenotype(combo.genotype, species) || 'Unknown';
    phenotypeProbabilities[phenotype] =
      (phenotypeProbabilities[phenotype] || 0) + combo.probability;
  }

  return toPercentages(phenotypeProbabilities);
}

/**
 * Summarize the share of recorded offspring exhibiting each observed trait.
 * Appearance fields take precedence; genetic phenotype is used only when an
 * offspring has no appearance traits recorded.
 */
export function computeConfirmedOffspringTraits(offspringCodes, species, appearanceFields) {
  if (!Array.isArray(offspringCodes) || !offspringCodes.length || !species) return [];

  const appearanceKeys = [
    ['color', 'Color'],
    ['markings', 'Markings'],
    ['coat', 'Coat'],
    ['earset', 'Earset'],
    ['eyeColor', 'Eye color'],
    ['body', 'Body'],
  ];
  const traitCounts = new Map();

  offspringCodes.forEach((offspringCode, index) => {
    const appearance = appearanceFields?.[index] || {};
    const traits = appearanceKeys.flatMap(([key, label]) => {
      const value = appearance[key];
      return typeof value === 'string' && value.trim()
        ? [`${label}: ${value.trim()}`]
        : [];
    });

    if (Array.isArray(appearance.carrierTraits)) {
      traits.push(
        ...appearance.carrierTraits
          .filter((trait) => typeof trait === 'string' && trait.trim())
          .map((trait) => `Carrier: ${trait.trim()}`),
      );
    }

    if (traits.length === 0) {
      const phenotype = matchGenotypePhenotype(offspringCode, species);
      if (phenotype) traits.push(`Phenotype: ${phenotype}`);
    }

    for (const trait of new Set(traits)) {
      const key = trait.toLowerCase();
      const existing = traitCounts.get(key);
      traitCounts.set(key, {
        trait: existing?.trait || trait,
        count: (existing?.count || 0) + 1,
      });
    }
  });

  return Array.from(traitCounts.values())
    .map(({ trait, count }) => ({
      trait,
      percentage: Math.round((count / offspringCodes.length) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage || a.trait.localeCompare(b.trait));
}
