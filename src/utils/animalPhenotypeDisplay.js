// Resolve a friendly phenotype/carrier summary for an animal's geneticCode, across all species.
// Used for read-only "view" displays (e.g. the Appearance tab) — never mutates or replaces the raw geneticCode.
import { calculatePhenotype, MOUSE_POSSIBLE_HET_LOCI } from '../components/GeneticsCalculator';
import { parseMouseGeneticCode, parseRatGeneticCode, parseHamsterGeneticCode, parseCampbellsGeneticCode, parseRussianDwarfGeneticCode } from '../components/GeneticCodeBuilder';
import { matchFancyRatPhenotype, RAT_POSSIBLE_HET_LOCI } from '../data/fancyRatPhenotypeRules';
import { matchSyrianHamsterPhenotype, SYRIAN_HAMSTER_POSSIBLE_HET_LOCI } from '../data/syrianHamsterPhenotypeRules';
import { matchCampbellsDwarfHamsterPhenotype, CAMPBELLS_DWARF_HAMSTER_POSSIBLE_HET_LOCI } from '../data/campbellsDwarfHamsterPhenotypeRules';
import { matchRussianDwarfHamsterPhenotype, RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI } from '../data/russianDwarfHamsterPhenotypeRules';
import { parseBallPythonGeneticCode, matchBallPythonPhenotype, getBallPythonDisplayPhenotype } from '../data/ballPythonPhenotypeRules';

const EMPTY = { phenotype: '', carriers: [], possibleCarriers: [] };

// Formats a rodent's "possible het" entries as plain trait names (no "Het" wording or percentage),
// kept separate from the computed phenotype string — e.g. "Fuzz" for a "Possible carrier of: Fuzz" note.
function possibleHetLabels(possibleHets, hetLociList) {
  return (possibleHets || [])
    .filter(h => h && h.locus && h.percent)
    .map(h => hetLociList.find(l => l.locus === h.locus)?.name || h.locus);
}

// Returns { phenotype, carriers } for the given animal, or EMPTY if the species/geneticCode isn't supported.
export function getAnimalPhenotypeDisplay(animal) {
  if (!animal || !animal.geneticCode) return EMPTY;

  try {
    switch (animal.species) {
      case 'Fancy Mouse': {
        const g = parseMouseGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = calculatePhenotype(g, g);
        return {
          phenotype: result?.phenotype || '',
          carriers: result?.carriers || [],
          possibleCarriers: possibleHetLabels(animal.possibleHets, MOUSE_POSSIBLE_HET_LOCI)
        };
      }
      case 'Fancy Rat': {
        const g = parseRatGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchFancyRatPhenotype(g);
        return {
          phenotype: result?.phenotype || '',
          carriers: result?.carriers || [],
          possibleCarriers: possibleHetLabels(animal.possibleHets, RAT_POSSIBLE_HET_LOCI)
        };
      }
      case 'Syrian Hamster': {
        const g = parseHamsterGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchSyrianHamsterPhenotype(g);
        return {
          phenotype: result?.phenotype || '',
          carriers: result?.carriers || [],
          possibleCarriers: possibleHetLabels(animal.possibleHets, SYRIAN_HAMSTER_POSSIBLE_HET_LOCI)
        };
      }
      case 'Campbells Dwarf Hamster': {
        const g = parseCampbellsGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchCampbellsDwarfHamsterPhenotype(g);
        return {
          phenotype: result?.phenotype || '',
          carriers: result?.carriers || [],
          possibleCarriers: possibleHetLabels(animal.possibleHets, CAMPBELLS_DWARF_HAMSTER_POSSIBLE_HET_LOCI)
        };
      }
      case 'Russian Dwarf Hamster': {
        const g = parseRussianDwarfGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchRussianDwarfHamsterPhenotype(g);
        return {
          phenotype: result?.phenotype || '',
          carriers: result?.carriers || [],
          possibleCarriers: possibleHetLabels(animal.possibleHets, RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI)
        };
      }
      case 'Ball Python': {
        const phenotype = getBallPythonDisplayPhenotype(animal.geneticCode, animal.possibleHets);
        const carriers = matchBallPythonPhenotype(parseBallPythonGeneticCode(animal.geneticCode))?.carriers || [];
        return { phenotype, carriers, possibleCarriers: [] };
      }
      default:
        return EMPTY;
    }
  } catch (e) {
    return EMPTY;
  }
}
