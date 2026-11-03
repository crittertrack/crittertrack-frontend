// Calculate expected phenotype probabilities and observed traits for a litter.

import {
  getFancyRatCarriers,
  matchFancyRatPhenotype,
  RAT_GENE_LOCI,
} from '../data/fancyRatPhenotypeRules';
import {
  getSyrianHamsterCarriers,
  matchSyrianHamsterPhenotype,
  SYRIAN_HAMSTER_GENE_LOCI,
} from '../data/syrianHamsterPhenotypeRules';
import {
  getCampbellsDwarfHamsterCarriers,
  matchCampbellsDwarfHamsterPhenotype,
  CAMPBELLS_DWARF_HAMSTER_GENE_LOCI,
} from '../data/campbellsDwarfHamsterPhenotypeRules';
import {
  getRussianDwarfHamsterCarriers,
  matchRussianDwarfHamsterPhenotype,
  RUSSIAN_DWARF_HAMSTER_GENE_LOCI,
} from '../data/russianDwarfHamsterPhenotypeRules';
import {
  matchBallPythonPhenotype,
  parseBallPythonGeneticCode,
} from '../data/ballPythonPhenotypeRules';
import { MOUSE_PHENOTYPE_EXAMPLES } from '../data/mousePhenotypeExamples';

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

const MOUSE_ALLELE_TRAITS = {
  A: { A: 'Agouti', a: 'Black', at: 'Tan', Ay: 'Dominant Red', Avy: 'Brindle', Aw: 'White-Bellied Agouti', ae: 'Extreme Black' },
  B: { b: 'Chocolate' },
  C: { c: 'Albino', ch: 'Siamese', ce: 'Beige', cch: 'Chinchilla' },
  D: { d: 'Blue' },
  E: { e: 'Recessive Red' },
  Ln: { ln: 'Leaden' },
  P: { p: 'Pink Eyed' },
  S: { s: 'Pied' },
  Bt: { bt: 'Belted' },
  U: { U: 'Umbrous' },
  W: { W: 'Dominant White Spot', Wsh: 'Variegated', Rw: 'Rumpwhite' },
  Spl: { Spl: 'Splashed' },
  Rn: { rn: 'Roan' },
  Si: { si: 'Silvered' },
  Mobr: { Mobr: 'Brindle' },
  Go: { Go: 'Shorthair', go: 'Longhair' },
  Re: { Re: 'Rex' },
  Sa: { sa: 'Satin' },
  Rst: { rst: 'Rosette' },
  Fz: { fz: 'Fuzz' },
  Nu: { Nu: 'Nude' },
};
const MOUSE_WILDTYPE_GENOTYPES = {
  A: 'A/A',
  B: 'B/B',
  C: 'C/C',
  D: 'D/D',
  E: 'E/E',
  Ln: 'Ln/Ln',
  P: 'P/P',
  S: 'S/S',
  Bt: 'Bt/Bt',
  U: 'u/u',
  W: 'w/w',
  Spl: 'spl/spl',
  Rn: 'Rn/Rn',
  Si: 'Si/Si',
  Mobr: 'mobr/mobr',
  Go: 'Go/Go',
  Re: 're/re',
  Sa: 'Sa/Sa',
  Rst: 'Rst/Rst',
  Fz: 'Fz/Fz',
  Nu: 'nu/nu',
};
const MOUSE_ALLELES_BY_LOCUS = {
  A: ['Ay', 'Avy', 'Aw', 'A', 'at', 'a', 'ae'],
  B: ['B', 'b'],
  C: ['C', 'c', 'ch', 'ce', 'cch'],
  D: ['D', 'd'],
  E: ['E', 'e'],
  Ln: ['Ln', 'ln'],
  P: ['P', 'p'],
  S: ['S', 's', 's+'],
  Bt: ['Bt', 'bt'],
  U: ['U', 'u'],
  W: ['W', 'w', 'Wsh', 'Rw'],
  Spl: ['Spl', 'spl'],
  Rn: ['Rn', 'rn'],
  Si: ['Si', 'si'],
  Mobr: ['Mobr', 'mobr', 'Y'],
  Go: ['Go', 'go'],
  Re: ['Re', 're'],
  Sa: ['Sa', 'sa'],
  Rst: ['Rst', 'rst'],
  Fz: ['Fz', 'fz'],
  Nu: ['Nu', 'nu'],
};
const MOUSE_ALLELE_ORDER = ['Ay', 'Avy', 'Aw', 'A', 'at', 'a', 'ae'];
const MOUSE_DOMINANT_TRAIT_ALLELES = new Set([
  'U', 'W', 'Wsh', 'Rw', 'Spl', 'Mobr', 'Re', 'Nu',
]);
const MOUSE_APPEARANCE_ALIASES = {
  'black eyed white': ['Albino'],
  'pink eyed white': ['Albino', 'Pink Eyed'],
  'blue agouti': ['Blue', 'Agouti'],
  'chocolate agouti': ['Chocolate', 'Agouti'],
  'recessive red': ['Recessive Red'],
  'dominant red': ['Dominant Red'],
  'white-bellied agouti': ['White-Bellied Agouti'],
  'white bellied agouti': ['White-Bellied Agouti'],
  champagne: ['Black', 'Chocolate', 'Pink Eyed'],
  cinnamon: ['Agouti', 'Chocolate'],
  argente: ['Agouti', 'Pink Eyed'],
  dove: ['Black', 'Pink Eyed'],
  lilac: ['Black', 'Chocolate', 'Blue'],
  silver: ['Black', 'Blue', 'Pink Eyed'],
  'blue': ['Blue'],
  'black': ['Black'],
  'agouti': ['Agouti'],
  'chocolate': ['Black', 'Chocolate'],
  'pink eyed': ['Pink Eyed'],
  'pink-eye': ['Pink Eyed'],
  pied: ['Pied'],
  belted: ['Belted'],
  brindle: ['Brindle'],
  tan: ['Tan'],
  'recessive fawn': ['Recessive Red'],
  'recessive amber': ['Recessive Red', 'Blue'],
};
Object.values(MOUSE_ALLELE_TRAITS)
  .flatMap((traits) => Object.values(traits))
  .forEach((trait) => {
    const alias = trait.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(MOUSE_APPEARANCE_ALIASES, alias)) {
      MOUSE_APPEARANCE_ALIASES[alias] = [trait];
    }
  });

function getMouseVisibleTraits(genotype) {
  const traits = new Set();
  for (const [locus, notation] of Object.entries(genotype || {})) {
    const alleles = getGametes(notation);
    const locusTraits = MOUSE_ALLELE_TRAITS[locus];
    if (!locusTraits || !alleles.length) continue;

    if (locus === 'A') {
      const visibleAllele = alleles
        .filter((allele) => Object.prototype.hasOwnProperty.call(locusTraits, allele))
        .sort((a, b) => MOUSE_ALLELE_ORDER.indexOf(a) - MOUSE_ALLELE_ORDER.indexOf(b))[0];
      if (visibleAllele) traits.add(locusTraits[visibleAllele]);
      continue;
    }

    Object.entries(locusTraits).forEach(([allele, trait]) => {
      const copies = alleles.filter((inheritedAllele) => inheritedAllele === allele).length;
      if (copies === 2 || (copies > 0 && MOUSE_DOMINANT_TRAIT_ALLELES.has(allele))) {
        traits.add(trait);
      }
    });
  }
  return traits;
}

Object.values(MOUSE_PHENOTYPE_EXAMPLES).forEach(({ examples = [] }) => {
  examples.forEach(({ name, genotype, genotypes }) => {
    const candidates = genotypes || (genotype ? [genotype] : []);
    if (!name || !candidates.length) return;

    const candidateTraits = candidates.map((candidate) =>
      Array.from(getMouseVisibleTraits(candidate)).sort()
    );
    const firstCandidate = candidateTraits[0];
    if (
      !firstCandidate.length
      || candidateTraits.some((candidate) => candidate.join('|') !== firstCandidate.join('|'))
    ) {
      return;
    }

    const alias = name.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    MOUSE_APPEARANCE_ALIASES[alias] = firstCandidate;
  });
});

function getMouseAppearanceTraits(value) {
  if (typeof value !== 'string' || !value.trim()) return [];
  const normalized = value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const matches = [];
  const aliases = Object.keys(MOUSE_APPEARANCE_ALIASES)
    .sort((a, b) => b.length - a.length);
  const occupiedRanges = [];

  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'g');
    let match;
    while ((match = pattern.exec(normalized)) !== null) {
      const start = match.index + match[1].length;
      const end = start + alias.length;
      if (occupiedRanges.some(([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart)) {
        continue;
      }
      occupiedRanges.push([start, end]);
      matches.push(...MOUSE_APPEARANCE_ALIASES[alias]);
    }
  }

  return [...new Set(matches)];
}

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

  if (speciesKey === 'fancymouse' || speciesKey === 'mouse') {
    const genotype = {};
    for (const token of code.trim().replace(/,/g, ' ').split(/\s+/)) {
      const alleles = token.split('/');
      if (alleles.length !== 2 || !alleles.every(Boolean)) continue;
      for (const [locus, knownAlleles] of Object.entries(MOUSE_ALLELES_BY_LOCUS)) {
        if (alleles.every((allele) => knownAlleles.includes(allele))) {
          genotype[locus] = token;
          break;
        }
      }
    }
    return genotype;
  }

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

    if (locus === 'A') {
      const sorted = [a, b].sort((first, second) => {
        const firstRank = MOUSE_ALLELE_ORDER.indexOf(first);
        const secondRank = MOUSE_ALLELE_ORDER.indexOf(second);
        if (firstRank >= 0 && secondRank >= 0) return firstRank - secondRank;
        return first.localeCompare(second);
      });
      normalized[locus] = `${sorted[0]}/${sorted[1]}`;
    } else if (a === 'Y' || b === 'Y') {
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

function getMouseTraits(genotype) {
  const traits = new Set();
  for (const [locus, notation] of Object.entries(genotype || {})) {
    const alleles = getGametes(notation);
    const locusTraits = MOUSE_ALLELE_TRAITS[locus];
    if (!locusTraits || !alleles.length) continue;

    if (locus === 'A') {
      const primaryAllele = alleles.slice().sort((a, b) => {
        const aRank = MOUSE_ALLELE_ORDER.indexOf(a);
        const bRank = MOUSE_ALLELE_ORDER.indexOf(b);
        if (aRank !== -1 && bRank !== -1) return aRank - bRank;
        return a.localeCompare(b);
      })[0];
      if (locusTraits[primaryAllele]) traits.add(locusTraits[primaryAllele]);
      const hiddenAllele = alleles.find((allele) => allele !== primaryAllele);
      if (hiddenAllele && locusTraits[hiddenAllele]) {
        traits.add(`${locusTraits[hiddenAllele]} (carrier)`);
      }
      continue;
    }

    if (locus === 'Go') {
      if (alleles.includes('Go')) traits.add('Shorthair');
      if (alleles.every((allele) => allele === 'go')) traits.add('Longhair');
      if (alleles.includes('Go') && alleles.includes('go')) {
        traits.add('Longhair (carrier)');
      }
      continue;
    }

    Object.entries(locusTraits).forEach(([allele, trait]) => {
      const copies = alleles.filter((inheritedAllele) => inheritedAllele === allele).length;
      if (!copies) return;
      if (MOUSE_DOMINANT_TRAIT_ALLELES.has(allele)) {
        traits.add(trait);
      } else {
        traits.add(copies === 2 ? trait : `${trait} (carrier)`);
      }
    });
  }
  return traits;
}

function computeMouseExpectedOffspring(sireCode, damCode) {
  const parsedSireGenotype = normalizeGenotype(parseGeneticCode(sireCode, 'Fancy Mouse'));
  const parsedDamGenotype = normalizeGenotype(parseGeneticCode(damCode, 'Fancy Mouse'));
  const allLoci = new Set([
    ...Object.keys(parsedSireGenotype),
    ...Object.keys(parsedDamGenotype),
    'Go',
  ]);
  const sireGenotype = { ...parsedSireGenotype };
  const damGenotype = { ...parsedDamGenotype };
  allLoci.forEach((locus) => {
    const wildtype = MOUSE_WILDTYPE_GENOTYPES[locus];
    if (!wildtype) return;
    if (!sireGenotype[locus]) sireGenotype[locus] = wildtype;
    if (!damGenotype[locus]) damGenotype[locus] = wildtype;
  });
  const sharedLoci = Array.from(allLoci)
    .filter((locus) => sireGenotype[locus] && damGenotype[locus]);
  const traitProbabilities = new Map();

  sharedLoci.forEach((locus) => {
    const distribution = computeLocusOffspringDistribution(
      sireGenotype[locus],
      damGenotype[locus],
    );
    if (!distribution) return;
    Object.entries(distribution).forEach(([offspringGenotype, probability]) => {
      getMouseTraits({ [locus]: offspringGenotype }).forEach((trait) => {
        traitProbabilities.set(trait, (traitProbabilities.get(trait) || 0) + probability);
      });
    });
  });

  return Array.from(traitProbabilities.entries())
    .map(([trait, probability]) => ({
      trait,
      probability: Math.round(probability * 100),
    }))
    .sort((a, b) => b.probability - a.probability || a.trait.localeCompare(b.trait));
}

function getParentLocusUpdates(sireNotation, damNotation, locus, offspringGenotype) {
  const sireAlleles = getGametes(sireNotation);
  const damAlleles = getGametes(damNotation);
  const offspringAlleles = getGametes(offspringGenotype);
  if (!sireAlleles.length || !damAlleles.length || !offspringAlleles.length) return [];

  const assignments = [
    [offspringAlleles[0], offspringAlleles[1]],
    [offspringAlleles[1], offspringAlleles[0]],
  ];
  const possibleUpdates = assignments.map(([sireAllele, damAllele]) => {
    const updates = [];
    if (!sireAlleles.includes(sireAllele)) {
      const retainedAllele = sireAlleles.find((allele) => allele !== sireAllele) || sireAlleles[0];
      updates.push({
        parent: 'Sire',
        locus,
        genotype: normalizeGenotype({ [locus]: `${retainedAllele}/${sireAllele}` })[locus],
      });
    }
    if (!damAlleles.includes(damAllele)) {
      const retainedAllele = damAlleles.find((allele) => allele !== damAllele) || damAlleles[0];
      updates.push({
        parent: 'Dam',
        locus,
        genotype: normalizeGenotype({ [locus]: `${retainedAllele}/${damAllele}` })[locus],
      });
    }
    return updates;
  });
  const uniqueUpdates = Array.from(new Map(
    possibleUpdates.map((updates) => [JSON.stringify(updates), updates]),
  ).values());
  const minimumUpdateCount = Math.min(...uniqueUpdates.map((updates) => updates.length));
  const minimalUpdates = uniqueUpdates.filter((updates) => updates.length === minimumUpdateCount);
  if (minimumUpdateCount === 0) return [];
  if (minimalUpdates.length === 1) return minimalUpdates[0];

  const alternatives = minimalUpdates.flat();
  const sharedLocusUpdate = alternatives.every((update) =>
    update.locus === alternatives[0].locus && update.genotype === alternatives[0].genotype
  );
  if (sharedLocusUpdate) {
    return [{
      parent: 'Sire or Dam',
      locus: alternatives[0].locus,
      genotype: alternatives[0].genotype,
      note: 'Offspring genotype cannot identify which parent.',
    }];
  }
  return [{
    parent: 'Sire or Dam',
    locus,
    note: 'Offspring genotype cannot identify which parent.',
  }];
}

function getMouseLocusUpdates(sireGenotype, damGenotype, locus, offspringGenotype) {
  const wildtype = MOUSE_WILDTYPE_GENOTYPES[locus];
  if (!wildtype) return [];
  return getParentLocusUpdates(
    sireGenotype[locus] || wildtype,
    damGenotype[locus] || wildtype,
    locus,
    offspringGenotype,
  );
}

/**
 * Find mouse traits or supported rodent phenotypes observed in linked
 * offspring that were absent from the expected-trait list. Genotype-backed
 * discoveries include possible parent locus updates; appearance-only discoveries
 * are informational.
 */
export function computeGeneticDiscoveries(
  sireCode,
  damCode,
  offspringCodes,
  species,
  expectedTraits,
  appearanceFields,
) {
  const speciesKey = getSpeciesKey(species);
  const isMouse = speciesKey === 'fancymouse' || speciesKey === 'mouse';
  const isRat = speciesKey === 'fancyrat';
  const isSyrianHamster = speciesKey === 'syrianhamster';
  const isCampbellsHamster = speciesKey === 'campbellsdwarfhamster';
  const isRussianHamster = speciesKey === 'russiandwarfhamster';
  const isBallPython = speciesKey === 'ballpython';
  if (
    (!isMouse && !isRat && !isSyrianHamster && !isCampbellsHamster && !isRussianHamster && !isBallPython)
    || !Array.isArray(offspringCodes)
    || !offspringCodes.length
  ) {
    return [];
  }

  const expectedTraitNames = new Set(
    (Array.isArray(expectedTraits) ? expectedTraits : [])
      .map((item) => (item?.trait || item?.name || '').trim().toLowerCase())
      .filter(Boolean),
  );
  const parsedSireGenotype = normalizeGenotype(parseGeneticCode(sireCode, species));
  const parsedDamGenotype = normalizeGenotype(parseGeneticCode(damCode, species));
  const discoveries = new Map();

  const recordDiscovery = (trait, recommendations = []) => {
    if (!trait || expectedTraitNames.has(trait.toLowerCase())) return;
    const key = trait.toLowerCase();
    const existing = discoveries.get(key) || {
      trait,
      recommendations: new Map(),
    };
    recommendations.forEach((recommendation) =>
      existing.recommendations.set(JSON.stringify(recommendation), recommendation)
    );
    discoveries.set(key, existing);
  };

  offspringCodes.forEach((offspringCode, index) => {
    const offspringGenotype = normalizeGenotype(parseGeneticCode(offspringCode, species));
    if (Object.keys(offspringGenotype).length) {
      if (isRat || isSyrianHamster || isCampbellsHamster || isRussianHamster || isBallPython) {
        const phenotypeMatch = isRat
          ? matchFancyRatPhenotype(offspringGenotype)
          : isSyrianHamster
            ? matchSyrianHamsterPhenotype(offspringGenotype)
            : isCampbellsHamster
              ? matchCampbellsDwarfHamsterPhenotype(offspringGenotype)
              : isRussianHamster
                ? matchRussianDwarfHamsterPhenotype(offspringGenotype)
                : matchBallPythonPhenotype(offspringGenotype);
        const phenotype = phenotypeMatch?.phenotype;
        if (phenotype && !expectedTraitNames.has(phenotype.toLowerCase())) {
          const recommendations = [];
          Object.entries(offspringGenotype).forEach(([locus, notation]) => {
            if (!parsedSireGenotype[locus] || !parsedDamGenotype[locus]) return;
            recommendations.push(
              ...getParentLocusUpdates(
                parsedSireGenotype[locus],
                parsedDamGenotype[locus],
                locus,
                notation,
              ),
            );
          });
          recordDiscovery(phenotype, recommendations);
        }

        (isBallPython ? [] : phenotypeMatch?.carriers || []).forEach((carrier) => {
          const carrierTrait = `${carrier} (carrier)`;
          if (expectedTraitNames.has(carrierTrait.toLowerCase())) return;
          const recommendations = [];
          Object.entries(offspringGenotype).forEach(([locus, notation]) => {
            const locusCarriers = isRat
              ? getFancyRatCarriers({ [locus]: notation })
              : isSyrianHamster
                ? getSyrianHamsterCarriers({ [locus]: notation })
                : isCampbellsHamster
                  ? getCampbellsDwarfHamsterCarriers({ [locus]: notation })
                  : isRussianHamster
                    ? getRussianDwarfHamsterCarriers({ [locus]: notation })
                    : [];
            if (!locusCarriers.includes(carrier)) return;
            if (!parsedSireGenotype[locus] || !parsedDamGenotype[locus]) return;
            recommendations.push(
              ...getParentLocusUpdates(
                parsedSireGenotype[locus],
                parsedDamGenotype[locus],
                locus,
                notation,
              ),
            );
          });
          recordDiscovery(carrierTrait, recommendations);
        });
        return;
      }

      const offspringDiscoveries = new Map();
      Object.entries(offspringGenotype).forEach(([locus, notation]) => {
        getMouseTraits({ [locus]: notation }).forEach((trait) => {
          if (expectedTraitNames.has(trait.toLowerCase())) return;
          const recommendations = offspringDiscoveries.get(trait) || new Set();
          getMouseLocusUpdates(parsedSireGenotype, parsedDamGenotype, locus, notation)
            .forEach((recommendation) => recommendations.add(recommendation));
          offspringDiscoveries.set(trait, recommendations);
        });
      });
      offspringDiscoveries.forEach((recommendations, trait) =>
        recordDiscovery(trait, Array.from(recommendations))
      );
      return;
    }

    const appearance = appearanceFields?.[index] || {};
    const appearanceValues = [
      appearance.variety,
      appearance.color,
      appearance.markings,
      appearance.coat,
      appearance.earset,
      appearance.eyeColor,
      appearance.body,
    ];
    if (isMouse) {
      new Set(appearanceValues.flatMap((value) => getMouseAppearanceTraits(value)))
        .forEach((trait) => recordDiscovery(trait));
    } else {
      const observedNames = appearanceValues
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean);
      observedNames.forEach((observedName) => {
        const normalizedObservedName = observedName.toLowerCase();
        const wasExpected = expectedTraitNames.has(normalizedObservedName)
          || Array.from(expectedTraitNames).some((expectedName) =>
            expectedName.includes(normalizedObservedName)
          );
        if (!wasExpected) recordDiscovery(observedName);
      });
    }
  });

  return Array.from(discoveries.values())
    .map(({ trait, recommendations }) => ({
      trait,
      recommendations: Array.from(recommendations.values()),
    }))
    .sort((a, b) => a.trait.localeCompare(b.trait));
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
  if (!species) return [];
  const speciesKey = getSpeciesKey(species);
  if (speciesKey === 'fancymouse' || speciesKey === 'mouse') {
    if (!sireCode && !damCode) return [];
    return computeMouseExpectedOffspring(sireCode, damCode);
  }
  if (!sireCode || !damCode) return [];
  if (!getSpeciesRules(species)) return [];

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
  const carrierProbabilities = {};
  for (const combo of offspringCombos) {
    const ratMatch = speciesKey === 'fancyrat'
      ? matchFancyRatPhenotype(normalizeGenotype(combo.genotype))
      : null;
    const syrianMatch = speciesKey === 'syrianhamster'
      ? matchSyrianHamsterPhenotype(normalizeGenotype(combo.genotype))
      : null;
    const campbellsMatch = speciesKey === 'campbellsdwarfhamster'
      ? matchCampbellsDwarfHamsterPhenotype(normalizeGenotype(combo.genotype))
      : null;
    const russianMatch = speciesKey === 'russiandwarfhamster'
      ? matchRussianDwarfHamsterPhenotype(normalizeGenotype(combo.genotype))
      : null;
    const phenotype = ratMatch?.phenotype
      || syrianMatch?.phenotype
      || campbellsMatch?.phenotype
      || russianMatch?.phenotype
      || matchGenotypePhenotype(combo.genotype, species)
      || 'Unknown';
    phenotypeProbabilities[phenotype] =
      (phenotypeProbabilities[phenotype] || 0) + combo.probability;
    [
      ...(ratMatch?.carriers || []),
      ...(syrianMatch?.carriers || []),
      ...(campbellsMatch?.carriers || []),
      ...(russianMatch?.carriers || []),
    ].forEach((carrier) => {
      const trait = `${carrier} (carrier)`;
      carrierProbabilities[trait] =
        (carrierProbabilities[trait] || 0) + combo.probability;
    });
  }

  const expectedPhenotypes = toPercentages(phenotypeProbabilities);
  const expectedCarriers = Object.entries(carrierProbabilities)
    .map(([trait, probability]) => ({ trait, probability: Math.round(probability * 100) }))
    .filter(({ probability }) => probability > 0)
    .sort((a, b) => b.probability - a.probability || a.trait.localeCompare(b.trait));
  return [...expectedPhenotypes, ...expectedCarriers];
}

/**
 * Summarize mouse traits and supported rodent phenotypes from genotype when
 * known, using appearance fields as fallback. Other supported species retain
 * their existing appearance-first summaries and use genotype phenotypes when needed.
 */
export function computeConfirmedOffspringTraits(offspringCodes, species, appearanceFields) {
  if (!Array.isArray(offspringCodes) || !offspringCodes.length) return [];

  const appearanceKeys = [
    ['variety', 'Variety'],
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
    const speciesKey = getSpeciesKey(species);
    const isMouse = speciesKey === 'fancymouse' || speciesKey === 'mouse';
    const isRat = speciesKey === 'fancyrat';
    const isSyrianHamster = speciesKey === 'syrianhamster';
    const isCampbellsHamster = speciesKey === 'campbellsdwarfhamster';
    const isRussianHamster = speciesKey === 'russiandwarfhamster';
    const parsedCode = species ? parseGeneticCode(offspringCode, species) : {};
    let traits;
    const appearanceTraits = appearanceKeys.flatMap(([key, label]) => {
      const value = appearance[key];
      if (typeof value !== 'string' || !value.trim()) return [];
      const normalizedValue = value.trim();
      const matchedTraits = isMouse ? getMouseAppearanceTraits(normalizedValue) : [];
      if (matchedTraits.length) return matchedTraits;
      return isMouse ? [] : [`${label}: ${normalizedValue}`];
    });

    if (isMouse) {
      traits = Array.from(getMouseTraits(parsedCode));
      if (!Object.keys(parsedCode).length) traits = appearanceTraits;
    } else if ((isRat || isSyrianHamster || isCampbellsHamster || isRussianHamster) && Object.keys(parsedCode).length) {
      const phenotypeMatch = isRat
        ? matchFancyRatPhenotype(normalizeGenotype(parsedCode))
        : isSyrianHamster
          ? matchSyrianHamsterPhenotype(normalizeGenotype(parsedCode))
          : isCampbellsHamster
            ? matchCampbellsDwarfHamsterPhenotype(normalizeGenotype(parsedCode))
            : matchRussianDwarfHamsterPhenotype(normalizeGenotype(parsedCode));
      traits = phenotypeMatch?.phenotype ? [phenotypeMatch.phenotype] : [];
      if (phenotypeMatch?.carriers?.length) {
        traits.push(...phenotypeMatch.carriers.map((carrier) => `${carrier} (carrier)`));
      }
    } else {
      traits = appearanceTraits;
      if (!traits.length) {
        const phenotype = matchGenotypePhenotype(parsedCode, species);
        if (phenotype) traits.push(`Phenotype: ${phenotype}`);
      }
    }

    if (!isMouse && Array.isArray(appearance.carrierTraits)) {
      traits.push(
        ...appearance.carrierTraits
          .filter((trait) => typeof trait === 'string' && trait.trim())
          .map((trait) => `Carrier: ${trait.trim()}`),
      );
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
