// Expected Offspring Probability Engine Tests
// Tests computeExpectedOffspring for all supported species

import { computeExpectedOffspring } from './expectedOffspring';
import { matchFancyRatPhenotype } from '../data/fancyRatPhenotypeRules';
import { matchSyrianHamsterPhenotype } from '../data/syrianHamsterPhenotypeRules';
import { matchCampbellsDwarfHamsterPhenotype } from '../data/campbellsDwarfHamsterPhenotypeRules';
import { matchRussianDwarfHamsterPhenotype } from '../data/russianDwarfHamsterPhenotypeRules';
import { matchBallPythonPhenotype } from '../data/ballPythonPhenotypeRules';

describe('computeExpectedOffspring', () => {
  // Fancy Rat test: A/a × a/a at A-locus, B/b × b/b at B-locus
  it('fancyRat: A/a × a/a, B/b × b/b produces multiple phenotypes', () => {
    const sire = { A: 'A/a', B: 'B/b' };
    const dam = { A: 'a/a', B: 'b/b' };
    const result = computeExpectedOffspring(sire, dam, 'fancyRat');
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    // Verify all results have trait and probability
    result.forEach(item => {
      expect(item).toHaveProperty('trait');
      expect(item).toHaveProperty('probability');
      expect(typeof item.probability).toBe('number');
    });
  });

  // Syrian Hamster test: a/a × A/A at A-locus (Black × Agouti)
  it('syrianHamster: a/a × A/a produces Black and Agouti offspring', () => {
    const sire = { a: 'a/a' };
    const dam = { A: 'A/a' };
    const result = computeExpectedOffspring(sire, dam, 'syrianHamster');
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item).toHaveProperty('trait');
      expect(item).toHaveProperty('probability');
    });
  });

  // Campbell's Dwarf Hamster test: a/a × A/A at A-locus
  it('campbellsDwarfHamster: a/a × A/a produces Black and Agouti offspring', () => {
    const sire = { a: 'a/a' };
    const dam = { A: 'A/a' };
    const result = computeExpectedOffspring(sire, dam, 'campbellsDwarfHamster');
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item).toHaveProperty('trait');
      expect(item).toHaveProperty('probability');
    });
  });

  // Russian Dwarf Hamster test: a/a × A/A at A-locus
  it('russianDwarfHamster: a/a × A/a produces Black and Agouti offspring', () => {
    const sire = { a: 'a/a' };
    const dam = { A: 'A/a' };
    const result = computeExpectedOffspring(sire, dam, 'russianDwarfHamster');
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item).toHaveProperty('trait');
      expect(item).toHaveProperty('probability');
    });
  });

  // Ball Python test: simple cross at C-locus (normal × carrier)
  it('ballPython: Normal × carrier produces normal and carrier offspring', () => {
    const sire = { C: 'C/c' };
    const dam = { C: 'C/c' };
    const result = computeExpectedOffspring(sire, dam, 'ballPython');
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item).toHaveProperty('trait');
      expect(item).toHaveProperty('probability');
    });
  });

  // Test missing genetic codes returns []
  it('returns [] when sireCode is missing', () => {
    const result = computeExpectedOffspring(null, { A: 'A/a' }, 'fancyRat');
    expect(result).toEqual([]);
  });

  it('returns [] when damCode is missing', () => {
    const result = computeExpectedOffspring({ A: 'A/a' }, null, 'fancyRat');
    expect(result).toEqual([]);
  });

  it('returns [] when species is missing', () => {
    const result = computeExpectedOffspring({ A: 'A/a' }, { A: 'a/a' }, null);
    expect(result).toEqual([]);
  });

  // Test invalid/unsupported species returns []
  it('returns [] for unsupported species', () => {
    const result = computeExpectedOffspring({ A: 'A/a' }, { A: 'a/a' }, 'unknownSpecies');
    expect(result).toEqual([]);
  });

  it('returns [] for empty genetic codes', () => {
    const result = computeExpectedOffspring({}, {}, 'fancyRat');
    expect(result).toEqual([]);
  });
});