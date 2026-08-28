// Resolve a friendly phenotype/carrier summary for an animal's geneticCode, across all species.
// Used for read-only "view" displays (e.g. the Appearance tab) — never mutates or replaces the raw geneticCode.
import { calculatePhenotype } from '../components/GeneticsCalculator';
import { parseMouseGeneticCode, parseRatGeneticCode, parseHamsterGeneticCode, parseCampbellsGeneticCode, parseRussianDwarfGeneticCode } from '../components/GeneticCodeBuilder';
import { matchFancyRatPhenotype } from '../data/fancyRatPhenotypeRules';
import { matchSyrianHamsterPhenotype } from '../data/syrianHamsterPhenotypeRules';
import { matchCampbellsDwarfHamsterPhenotype } from '../data/campbellsDwarfHamsterPhenotypeRules';
import { matchRussianDwarfHamsterPhenotype } from '../data/russianDwarfHamsterPhenotypeRules';
import { parseBallPythonGeneticCode, matchBallPythonPhenotype, getBallPythonDisplayPhenotype } from '../data/ballPythonPhenotypeRules';

const EMPTY = { phenotype: '', carriers: [] };

// Returns { phenotype, carriers } for the given animal, or EMPTY if the species/geneticCode isn't supported.
export function getAnimalPhenotypeDisplay(animal) {
  if (!animal || !animal.geneticCode) return EMPTY;

  try {
    switch (animal.species) {
      case 'Fancy Mouse': {
        const g = parseMouseGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = calculatePhenotype(g, g);
        return { phenotype: result?.phenotype || '', carriers: result?.carriers || [] };
      }
      case 'Fancy Rat': {
        const g = parseRatGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchFancyRatPhenotype(g);
        return { phenotype: result?.phenotype || '', carriers: result?.carriers || [] };
      }
      case 'Syrian Hamster': {
        const g = parseHamsterGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchSyrianHamsterPhenotype(g);
        return { phenotype: result?.phenotype || '', carriers: result?.carriers || [] };
      }
      case 'Campbells Dwarf Hamster': {
        const g = parseCampbellsGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchCampbellsDwarfHamsterPhenotype(g);
        return { phenotype: result?.phenotype || '', carriers: result?.carriers || [] };
      }
      case 'Russian Dwarf Hamster': {
        const g = parseRussianDwarfGeneticCode(animal.geneticCode);
        if (Object.keys(g).length === 0) return EMPTY;
        const result = matchRussianDwarfHamsterPhenotype(g);
        return { phenotype: result?.phenotype || '', carriers: result?.carriers || [] };
      }
      case 'Ball Python': {
        const phenotype = getBallPythonDisplayPhenotype(animal.geneticCode, animal.possibleHets);
        const carriers = matchBallPythonPhenotype(parseBallPythonGeneticCode(animal.geneticCode))?.carriers || [];
        return { phenotype, carriers };
      }
      default:
        return EMPTY;
    }
  } catch (e) {
    return EMPTY;
  }
}
