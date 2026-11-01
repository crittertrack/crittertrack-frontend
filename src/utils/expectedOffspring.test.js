import {
  computeConfirmedOffspringTraits,
  computeExpectedOffspring,
} from './expectedOffspring';

describe('computeExpectedOffspring', () => {
  it('calculates the expected split for Syrian hamster alleles', () => {
    const result = computeExpectedOffspring(
      { a: 'a/a' },
      { a: 'A/a' },
      'syrianHamster',
    );

    expect(result).toEqual([
      { trait: '(Golden) Agouti', probability: 50 },
      { trait: 'Black', probability: 50 },
    ]);
  });

  it('parses stored genetic-code strings before calculating', () => {
    expect(computeExpectedOffspring(
      'a/a',
      'A/a',
      'Syrian Hamster',
    )).toEqual([
      { trait: '(Golden) Agouti', probability: 50 },
      { trait: 'Black', probability: 50 },
    ]);
  });

  it('accepts display names with punctuation and predicts Campbell dwarf hamsters', () => {
    const result = computeExpectedOffspring(
      { a: 'a/a' },
      { a: 'A/a' },
      "Campbell's Dwarf Hamster",
    );

    expect(result).toEqual([
      { trait: 'Agouti', probability: 50 },
      { trait: 'Black', probability: 50 },
    ]);
  });

  it('calculates phenotypes for Russian dwarf hamsters', () => {
    expect(computeExpectedOffspring(
      { a: 'a/a' },
      { a: 'A/a' },
      'russianDwarfHamster',
    )).toEqual([
      { trait: 'Agouti', probability: 50 },
      { trait: 'Black', probability: 50 },
    ]);
  });

  it('uses the species rules to predict rat phenotypes', () => {
    expect(computeExpectedOffspring(
      { C: 'c/c' },
      { C: 'c/c' },
      'fancyRat',
    )).toEqual([{ trait: 'Albino', probability: 100 }]);
  });

  it('predicts a dominant ball python trait and normal offspring', () => {
    expect(computeExpectedOffspring(
      { sp: 'Sp/sp' },
      { sp: 'sp/sp' },
      'ballPython',
    )).toEqual([
      { trait: 'Normal', probability: 50 },
      { trait: 'Spider', probability: 50 },
    ]);
  });

  it('parses ball python genetic-code strings before calculating', () => {
    expect(computeExpectedOffspring(
      'Sp/sp',
      'sp/sp',
      'Ball Python',
    )).toEqual([
      { trait: 'Normal', probability: 50 },
      { trait: 'Spider', probability: 50 },
    ]);
  });

  it('does not infer alleles from a locus missing in either parent', () => {
    expect(computeExpectedOffspring(
      { a: 'a/a' },
      { b: 'B/b' },
      'syrianHamster',
    )).toEqual([]);
  });

  it('rounds multi-locus probabilities so the total is exactly 100%', () => {
    const result = computeExpectedOffspring(
      { a: 'A/a', b: 'B/b' },
      { a: 'A/a', b: 'B/b' },
      'syrianHamster',
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.reduce((total, item) => total + item.probability, 0)).toBe(100);
  });

  it('returns [] when either parent code or the species is missing or unsupported', () => {
    expect(computeExpectedOffspring(null, { a: 'A/a' }, 'syrianHamster')).toEqual([]);
    expect(computeExpectedOffspring({ a: 'A/a' }, null, 'syrianHamster')).toEqual([]);
    expect(computeExpectedOffspring({ a: 'A/a' }, { a: 'a/a' }, null)).toEqual([]);
    expect(computeExpectedOffspring({ a: 'A/a' }, { a: 'a/a' }, 'unknown species')).toEqual([]);
    expect(computeExpectedOffspring({}, {}, 'syrianHamster')).toEqual([]);
  });
});

describe('computeConfirmedOffspringTraits', () => {
  it('reports the frequency of each observed trait across all offspring', () => {
    const result = computeConfirmedOffspringTraits(
      [{}, {}, {}],
      'syrianHamster',
      [
        { color: 'Black', markings: 'Banded' },
        { color: 'Black' },
        { color: 'Agouti', markings: 'Banded' },
      ],
    );

    expect(result).toEqual([
      { trait: 'Color: Black', percentage: 67 },
      { trait: 'Markings: Banded', percentage: 67 },
      { trait: 'Color: Agouti', percentage: 33 },
    ]);
  });

  it('includes a recorded variety in confirmed offspring traits', () => {
    expect(computeConfirmedOffspringTraits(
      [{}, {}, {}],
      'syrianHamster',
      [{ variety: 'Golden' }, { variety: 'Golden' }, {}],
    )).toEqual([{ trait: 'Variety: Golden', percentage: 67 }]);
  });

  it('uses an offspring genotype when no appearance traits are recorded', () => {
    expect(computeConfirmedOffspringTraits(
      [{ a: 'a/a' }, { a: 'a/a' }],
      'syrianHamster',
      [{}, {}],
    )).toEqual([{ trait: 'Phenotype: Black', percentage: 100 }]);
  });

  it('returns [] when no offspring or species are provided', () => {
    expect(computeConfirmedOffspringTraits([], 'syrianHamster', [])).toEqual([]);
    expect(computeConfirmedOffspringTraits([{}], null, [{}])).toEqual([]);
  });
});
