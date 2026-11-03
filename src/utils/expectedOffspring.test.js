import {
  computeConfirmedOffspringTraits,
  computeExpectedOffspring,
  computeGeneticDiscoveries,
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
      { trait: 'Black (carrier)', probability: 50 },
    ]);
  });

  it('adds the gene behind each trait only when includeGenes is set', () => {
    const result = computeExpectedOffspring({ a: 'a/a' }, { a: 'A/a' }, 'syrianHamster', { includeGenes: true });

    expect(result).toEqual([
      { trait: '(Golden) Agouti', probability: 50, gene: 'A/a' },
      { trait: 'Black', probability: 50, gene: 'a/a' },
      { trait: 'Black (carrier)', probability: 50, gene: 'A/a' },
    ]);
  });

  it('shows Fancy Mouse genes in full on two-allele loci, e.g. a Pied carrier is S/s', () => {
    const pied = computeExpectedOffspring('S/s', 'S/s', 'Fancy Mouse', { includeGenes: true });
    expect(pied.find((entry) => entry.trait === 'Pied')).toMatchObject({ gene: 's/s' });
    expect(pied.find((entry) => entry.trait === 'Pied (carrier)')).toMatchObject({ gene: 'S/s' });

    const coat = computeExpectedOffspring('Go/go', 'Go/go', 'Fancy Mouse', { includeGenes: true });
    expect(coat.find((entry) => entry.trait === 'Longhair (carrier)')).toMatchObject({ gene: 'Go/go' });
  });

  it.each([
    ['W/w', 'w/w', 'Dominant White Spot', 'W/- (W/w)'],
    ['W/w', 'W/w', 'Dominant White Spot', 'W/- (W/w or W/W)'],
    ['Wsh/w', 'w/w', 'Variegated', 'Wsh/- (Wsh/w)'],
    ['Wsh/w', 'Wsh/w', 'Variegated', 'Wsh/- (Wsh/w or Wsh/Wsh)'],
    ['Rw/w', 'w/w', 'Rumpwhite', 'Rw/- (Rw/w)'],
    ['Rw/w', 'Rw/w', 'Rumpwhite', 'Rw/- (Rw/w or Rw/Rw)'],
  ])('shows the W-locus gene for %s x %s', (sire, dam, trait, gene) => {
    const result = computeExpectedOffspring(sire, dam, 'Fancy Mouse', { includeGenes: true });
    expect(result.find((entry) => entry.trait === trait)).toMatchObject({ gene });
  });

  it('never produces a mixed W-locus pair such as Wsh/Rw', () => {
    const result = computeExpectedOffspring('Wsh/w', 'Rw/w', 'Fancy Mouse', { includeGenes: true });
    const variegated = result.find((entry) => entry.trait === 'Variegated');
    const rumpwhite = result.find((entry) => entry.trait === 'Rumpwhite');
    expect(variegated).toMatchObject({ probability: 33, gene: 'Wsh/- (Wsh/w)' });
    expect(rumpwhite).toMatchObject({ probability: 33, gene: 'Rw/- (Rw/w)' });
  });

  it('shows Fancy Mouse W-locus traits as X/- with the possible genotypes in brackets', () => {
    const het = computeExpectedOffspring('W/w', 'w/w', 'Fancy Mouse', { includeGenes: true });
    expect(het.find((entry) => entry.trait === 'Dominant White Spot')).toMatchObject({ probability: 50, gene: 'W/- (W/w)' });

    const both = computeExpectedOffspring('W/w', 'W/w', 'Fancy Mouse', { includeGenes: true });
    expect(both.find((entry) => entry.trait === 'Dominant White Spot')).toMatchObject({ probability: 75, gene: 'W/- (W/w or W/W)' });

    const mixed = computeExpectedOffspring('Wsh/w', 'Rw/w', 'Fancy Mouse', { includeGenes: true });
    // Mixed pairs such as Rw/Wsh are never listed: only X/X or X/w.
    expect(mixed.find((entry) => entry.trait === 'Variegated')).toMatchObject({ gene: 'Wsh/- (Wsh/w)' });
    expect(mixed.find((entry) => entry.trait === 'Rumpwhite')).toMatchObject({ gene: 'Rw/- (Rw/w)' });

    const wsh = computeExpectedOffspring('Wsh/w', 'Wsh/w', 'Fancy Mouse', { includeGenes: true });
    expect(wsh.find((entry) => entry.trait === 'Variegated')).toMatchObject({ gene: 'Wsh/- (Wsh/w or Wsh/Wsh)' });

    const rw = computeExpectedOffspring('Rw/w', 'Rw/w', 'Fancy Mouse', { includeGenes: true });
    expect(rw.find((entry) => entry.trait === 'Rumpwhite')).toMatchObject({ gene: 'Rw/- (Rw/w or Rw/Rw)' });
  });

  it('treats Tan as semi-dominant: never a carrier, shown as at/at or -/at', () => {
    const cross = computeExpectedOffspring('A/at', 'at/a', 'Fancy Mouse', { includeGenes: true });
    expect(cross.find((entry) => entry.trait === 'Tan')).toMatchObject({ probability: 75, gene: 'at/at or -/at' });
    expect(cross.some((entry) => entry.trait === 'Tan (carrier)')).toBe(false);

    const homozygous = computeExpectedOffspring('at/at', 'a/a', 'Fancy Mouse', { includeGenes: true });
    expect(homozygous.find((entry) => entry.trait === 'Tan')).toMatchObject({ probability: 100, gene: '-/at' });
    expect(homozygous.some((entry) => entry.trait === 'Tan (carrier)')).toBe(false);

    const withRed = computeExpectedOffspring('Ay/at', 'at/at', 'Fancy Mouse', { includeGenes: true });
    expect(withRed.find((entry) => entry.trait === 'Tan')).toMatchObject({ probability: 100 });
    expect(withRed.some((entry) => entry.trait === 'Tan (carrier)')).toBe(false);
  });

  it('shows Shorthair as Go/- with the genotypes the cross can produce', () => {
    const het = computeExpectedOffspring('Go/go', 'Go/go', 'Fancy Mouse', { includeGenes: true });
    expect(het.find((entry) => entry.trait === 'Shorthair')).toMatchObject({ probability: 75, gene: 'Go/- (Go/Go or Go/go)' });

    const homozygous = computeExpectedOffspring('Go/Go', 'Go/Go', 'Fancy Mouse', { includeGenes: true });
    expect(homozygous.find((entry) => entry.trait === 'Shorthair')).toMatchObject({ probability: 100, gene: 'Go/- (Go/Go)' });

    const carrierOnly = computeExpectedOffspring('Go/Go', 'go/go', 'Fancy Mouse', { includeGenes: true });
    expect(carrierOnly.find((entry) => entry.trait === 'Shorthair')).toMatchObject({ probability: 100, gene: 'Go/- (Go/go)' });
  });

  it('treats White-Bellied Agouti like Agouti: dominant-visible Aw/-, carried when hidden', () => {
    const cross = computeExpectedOffspring('Aw/a', 'Aw/a', 'Fancy Mouse', { includeGenes: true });
    expect(cross.find((entry) => entry.trait === 'White-Bellied Agouti')).toMatchObject({ probability: 75, gene: 'Aw/Aw or Aw/-' });

    const het = computeExpectedOffspring('Aw/a', 'a/a', 'Fancy Mouse', { includeGenes: true });
    expect(het.find((entry) => entry.trait === 'White-Bellied Agouti')).toMatchObject({ probability: 50, gene: 'Aw/-' });

    const hidden = computeExpectedOffspring('Ay/Aw', 'Aw/a', 'Fancy Mouse', { includeGenes: true });
    expect(hidden.find((entry) => entry.trait === 'White-Bellied Agouti (carrier)')).toMatchObject({ probability: 25, gene: '-/Aw' });
  });

  it('shows Fancy Mouse C-locus carriers as C/<allele>', () => {
    const siamese = computeExpectedOffspring('C/ch', 'C/ch', 'Fancy Mouse', { includeGenes: true });
    expect(siamese.find((entry) => entry.trait === 'Siamese')).toMatchObject({ probability: 25, gene: 'ch/ch' });
    expect(siamese.find((entry) => entry.trait === 'Siamese (carrier)')).toMatchObject({ probability: 50, gene: 'C/ch' });

    const mixed = computeExpectedOffspring('C/cch', 'ch/ce', 'Fancy Mouse', { includeGenes: true });
    expect(mixed.find((entry) => entry.trait === 'Chinchilla (carrier)')).toMatchObject({ gene: 'C/cch' });
    expect(mixed.find((entry) => entry.trait === 'Beige (carrier)')).toMatchObject({ gene: 'C/ce' });
    expect(mixed.find((entry) => entry.trait === 'Siamese (carrier)')).toMatchObject({ gene: 'C/ch' });

    const albino = computeExpectedOffspring('C/c', 'C/c', 'Fancy Mouse', { includeGenes: true });
    expect(albino.find((entry) => entry.trait === 'Albino')).toMatchObject({ gene: 'c/c' });
    expect(albino.find((entry) => entry.trait === 'Albino (carrier)')).toMatchObject({ gene: 'C/c' });
  });

  it('shows Fancy Mouse dominant traits as X/- and carriers as -/x on multi-allele loci', () => {
    const result = computeExpectedOffspring('Ay/a', 'a/a', 'Fancy Mouse', { includeGenes: true });
    expect(result.find((entry) => entry.trait === 'Dominant Red')).toMatchObject({ probability: 50, gene: 'Ay/-' });
    expect(result.find((entry) => entry.trait === 'Black')).toMatchObject({ probability: 50, gene: 'a/a' });
    expect(result.find((entry) => entry.trait === 'Black (carrier)')).toMatchObject({ probability: 50, gene: '-/a' });
  });

  it('includes expected Syrian Hamster carrier traits', () => {
    expect(computeExpectedOffspring(
      'a/a B/B',
      'a/a B/b',
      'Syrian Hamster',
    )).toEqual(expect.arrayContaining([
      { trait: 'Rust (carrier)', probability: 50 },
    ]));
  });

  it('parses stored genetic-code strings before calculating', () => {
    expect(computeExpectedOffspring(
      'a/a',
      'A/a',
      'Syrian Hamster',
    )).toEqual([
      { trait: '(Golden) Agouti', probability: 50 },
      { trait: 'Black', probability: 50 },
      { trait: 'Black (carrier)', probability: 50 },
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
      { trait: 'Black (carrier)', probability: 50 },
    ]);
  });

  it('includes expected Campbell dwarf hamster carrier traits', () => {
    expect(computeExpectedOffspring(
      'a/a B/B',
      'a/a B/b',
      "Campbell's Dwarf Hamster",
    )).toEqual(expect.arrayContaining([
      { trait: 'Chocolate (carrier)', probability: 50 },
    ]));
  });

  it('calculates phenotypes for Russian dwarf hamsters', () => {
    expect(computeExpectedOffspring(
      { a: 'a/a' },
      { a: 'A/a' },
      'russianDwarfHamster',
    )).toEqual([
      { trait: 'Agouti', probability: 50 },
      { trait: 'Black', probability: 50 },
      { trait: 'Black (carrier)', probability: 50 },
    ]);
  });

  it('includes expected Russian Dwarf Hamster carrier traits', () => {
    expect(computeExpectedOffspring(
      'a/a D/D',
      'a/a D/d',
      'Russian Dwarf Hamster',
    )).toEqual(expect.arrayContaining([
      { trait: 'Sapphire (carrier)', probability: 50 },
    ]));
  });

  it('uses the species rules to predict rat phenotypes', () => {
    expect(computeExpectedOffspring(
      { C: 'c/c' },
      { C: 'c/c' },
      'fancyRat',
    )).toEqual([{ trait: 'Albino', probability: 100 }]);
  });

  it('includes expected Fancy Rat carrier traits', () => {
    expect(computeExpectedOffspring(
      'a/a B/B',
      'a/a B/b',
      'Fancy Rat',
    )).toEqual(expect.arrayContaining([
      { trait: 'Chocolate (carrier)', probability: 50 },
    ]));
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

  it('reports each independent Fancy Mouse base trait, including carriers', () => {
    expect(computeExpectedOffspring(
      'A/a B/B D/D E/E',
      'A/a B/b D/d E/e',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Agouti', probability: 75 },
      { trait: 'Black (carrier)', probability: 50 },
      { trait: 'Black', probability: 25 },
      { trait: 'Chocolate (carrier)', probability: 50 },
      { trait: 'Blue (carrier)', probability: 50 },
      { trait: 'Recessive Red (carrier)', probability: 50 },
    ]));
  });

  it('reports dominant red, brindle and pink-eyed traits independently', () => {
    expect(computeExpectedOffspring(
      'Ay/Avy P/P',
      'A/Avy P/p',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Dominant Red', probability: 50 },
      { trait: 'Brindle', probability: 50 },
      { trait: 'Brindle (carrier)', probability: 25 },
      { trait: 'Pink Eyed (carrier)', probability: 50 },
    ]));
  });

  it('defaults an unrecorded mouse parent locus to wildtype', () => {
    expect(computeExpectedOffspring(
      'B/B',
      'B/b',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Shorthair', probability: 100 },
      { trait: 'Chocolate (carrier)', probability: 50 },
    ]));

    expect(computeExpectedOffspring(
      'B/B D/d',
      'B/b',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Chocolate (carrier)', probability: 50 },
      { trait: 'Blue (carrier)', probability: 50 },
    ]));
  });

  it('only predicts Nude when the dominant Nu allele is inherited', () => {
    expect(computeExpectedOffspring(
      'Nu/nu',
      'nu/nu',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Nude', probability: 50 },
      { trait: 'Shorthair', probability: 100 },
    ]));

    expect(computeExpectedOffspring(
      'nu/nu',
      'nu/nu',
      'Fancy Mouse',
    )).toEqual([{ trait: 'Shorthair', probability: 100 }]);
  });

  it('defaults the expected coat locus to Shorthair unless longhair is inherited', () => {
    expect(computeExpectedOffspring(
      'A/a',
      'A/a',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Shorthair', probability: 100 },
    ]));

    expect(computeExpectedOffspring(
      'Go/go',
      'Go/Go',
      'Fancy Mouse',
    )).toEqual(expect.arrayContaining([
      { trait: 'Shorthair', probability: 100 },
      { trait: 'Longhair (carrier)', probability: 50 },
    ]));
  });

  it('does not infer alleles from a locus missing in either parent', () => {
    expect(computeExpectedOffspring(
      { a: 'a/a' },
      { b: 'B/b' },
      'syrianHamster',
    )).toEqual([]);
  });

  it('keeps phenotype probabilities totaling 100% alongside independent carrier probabilities', () => {
    const result = computeExpectedOffspring(
      { a: 'A/a', b: 'B/b' },
      { a: 'A/a', b: 'B/b' },
      'syrianHamster',
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result
      .filter((item) => !item.trait.endsWith('(carrier)'))
      .reduce((total, item) => total + item.probability, 0)).toBe(100);
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

  it('adds the gene behind each confirmed trait only when includeGenes is set', () => {
    const codes = [{ a: 'a/a' }, { a: 'A/a' }];
    const without = computeConfirmedOffspringTraits(codes, 'syrianHamster', [{}, {}]);
    expect(without.every((entry) => !('gene' in entry))).toBe(true);

    const result = computeConfirmedOffspringTraits(codes, 'syrianHamster', [{}, {}], { includeGenes: true });
    expect(result).toEqual(expect.arrayContaining([
      { trait: 'Black', percentage: 50, gene: 'a/a' },
      { trait: 'Black (carrier)', percentage: 50, gene: 'A/a' },
    ]));
  });

  it('adds the locus genotype behind confirmed Fancy Mouse traits', () => {
    const result = computeConfirmedOffspringTraits(['a/a', 'A/a'], 'Fancy Mouse', [{}, {}], { includeGenes: true });
    expect(result.find((entry) => entry.trait === 'Black')).toMatchObject({ percentage: 50, gene: 'a/a' });
  });

  it('derives mouse genes from the trait name when only variety text is recorded', () => {
    const result = computeConfirmedOffspringTraits(
      ['', ''],
      'Fancy Mouse',
      [{ color: 'Black Pied Longhair' }, { color: 'Dominant Red' }],
      { includeGenes: true },
    );
    expect(result).toEqual(expect.arrayContaining([
      { trait: 'Black', percentage: 50, gene: 'a/a' },
      { trait: 'Pied', percentage: 50, gene: 's/s' },
      { trait: 'Dominant Red', percentage: 50, gene: 'Ay/-' },
    ]));
    expect(result.find((entry) => entry.trait === 'Longhair')).toMatchObject({ gene: 'go/go' });
  });

  it('combines genes from recorded codes with ones implied by variety text', () => {
    const result = computeConfirmedOffspringTraits(
      ['S/s', ''],
      'Fancy Mouse',
      [{}, { color: 'Pied' }],
      { includeGenes: true },
    );
    expect(result.find((entry) => entry.trait === 'Pied (carrier)')).toMatchObject({ gene: 'S/s' });
    expect(result.find((entry) => entry.trait === 'Pied')).toMatchObject({ percentage: 50, gene: 's/s' });
  });

  it('keeps Pied as s/s and shows S/s only as Pied (carrier), even when variety text also says Pied', () => {
    const result = computeConfirmedOffspringTraits(
      ['S/s', 's/s', ''],
      'Fancy Mouse',
      [{}, {}, { color: 'Pied' }],
      { includeGenes: true },
    );
    expect(result.find((entry) => entry.trait === 'Pied')).toMatchObject({ percentage: 67, gene: 's/s' });
    expect(result.find((entry) => entry.trait === 'Pied (carrier)')).toMatchObject({ percentage: 33, gene: 'S/s' });
  });

  it('leaves appearance-only confirmed traits without a gene', () => {
    expect(computeConfirmedOffspringTraits(
      [{}, {}],
      'syrianHamster',
      [{ color: 'Black' }, { color: 'Black' }],
      { includeGenes: true },
    )).toEqual([{ trait: 'Color: Black', percentage: 100 }]);
  });

  it('includes a recorded variety in confirmed offspring traits', () => {
    expect(computeConfirmedOffspringTraits(
      [{}, {}, {}],
      'syrianHamster',
      [{ variety: 'Golden' }, { variety: 'Golden' }, {}],
    )).toEqual([{ trait: 'Variety: Golden', percentage: 67 }]);
  });

  it('uses mouse offspring genetic codes before appearance fallback', () => {
    expect(computeConfirmedOffspringTraits(
      ['A/a B/b D/d', 'a/a B/B D/D'],
      'Fancy Mouse',
      [{ color: 'Recessive Red Pied' }, { color: 'Blue' }],
    )).toEqual(expect.arrayContaining([
      { trait: 'Agouti', percentage: 50 },
      { trait: 'Black (carrier)', percentage: 50 },
      { trait: 'Black', percentage: 50 },
      { trait: 'Chocolate (carrier)', percentage: 50 },
      { trait: 'Blue (carrier)', percentage: 50 },
    ]));
  });

  it('splits fallback appearance values into base traits rather than compounds', () => {
    expect(computeConfirmedOffspringTraits(
      ['', ''],
      'Fancy Mouse',
      [{ color: 'Recessive Red Pied', coat: 'Shorthair' }, { color: 'Blue' }],
    )).toEqual(expect.arrayContaining([
      { trait: 'Recessive Red', percentage: 50 },
      { trait: 'Pied', percentage: 50 },
      { trait: 'Blue', percentage: 50 },
      { trait: 'Shorthair', percentage: 50 },
    ]));
  });

  it('decomposes mouse color names into their base genetic traits', () => {
    expect(computeConfirmedOffspringTraits(
      ['', '', ''],
      'Fancy Mouse',
      [
        { color: 'Dove' },
        { color: 'Chocolate Agouti' },
        { color: 'Blue Agouti' },
      ],
    )).toEqual(expect.arrayContaining([
      { trait: 'Black', percentage: 33 },
      { trait: 'Pink Eyed', percentage: 33 },
      { trait: 'Chocolate', percentage: 33 },
      { trait: 'Agouti', percentage: 67 },
      { trait: 'Blue', percentage: 33 },
    ]));
  });

  it('uses the GeneticBuilder catalogue and skips unrecognized mouse appearance values', () => {
    expect(computeConfirmedOffspringTraits(
      ['', ''],
      'Fancy Mouse',
      [{ color: 'Sealpoint Siamese' }, { color: 'Unrecognized shade' }],
    )).toEqual([
      { trait: 'Black', percentage: 50 },
      { trait: 'Siamese', percentage: 50 },
    ]);
  });

  it('uses a Fancy Rat offspring genotype before its appearance fields', () => {
    expect(computeConfirmedOffspringTraits(
      ['a/a B/b'],
      'Fancy Rat',
      [{ color: 'Black' }],
    )).toEqual(expect.arrayContaining([
      { trait: 'Black', percentage: 100 },
      { trait: 'Chocolate (carrier)', percentage: 100 },
    ]));
  });

  it('uses a Syrian Hamster offspring genotype before its appearance fields', () => {
    expect(computeConfirmedOffspringTraits(
      ['a/a e/e'],
      'Syrian Hamster',
      [{ color: 'Black' }],
    )).toEqual([{ trait: 'Black Eyed Cream', percentage: 100 }]);
  });

  it('uses a Campbell dwarf hamster offspring genotype before its appearance fields', () => {
    expect(computeConfirmedOffspringTraits(
      ['a/a b/b'],
      "Campbell's Dwarf Hamster",
      [{ color: 'Black' }],
    )).toEqual([{ trait: 'Chocolate', percentage: 100 }]);
  });

  it('uses a Russian Dwarf Hamster offspring genotype before its appearance fields', () => {
    expect(computeConfirmedOffspringTraits(
      ['a/a d/d'],
      'Russian Dwarf Hamster',
      [{ color: 'Agouti' }],
    )).toEqual([{ trait: 'Russian Blue', percentage: 100 }]);
  });

  it('does not replace recorded mouse genotypes with appearance fallback traits', () => {
    expect(computeConfirmedOffspringTraits(
      ['B/B D/D'],
      'Fancy Mouse',
      [{ color: 'Dove' }],
    )).toEqual([]);
  });

  it('does not report the normal nu/nu genotype as Nude', () => {
    expect(computeConfirmedOffspringTraits(
      ['nu/nu'],
      'Fancy Mouse',
      [{}],
    )).toEqual([]);

    expect(computeConfirmedOffspringTraits(
      ['Nu/nu'],
      'Fancy Mouse',
      [{}],
    )).toEqual([{ trait: 'Nude', percentage: 100 }]);
  });

  it('does not infer Nude from catalogue phenotypes with the normal nu/nu allele', () => {
    expect(computeConfirmedOffspringTraits(
      [''],
      'Fancy Mouse',
      [{ coat: 'Shorthair' }],
    )).toEqual([{ trait: 'Shorthair', percentage: 100 }]);
  });

  it('uses an offspring genotype when no appearance traits are recorded', () => {
    expect(computeConfirmedOffspringTraits(
      [{ a: 'a/a' }, { a: 'a/a' }],
      'syrianHamster',
      [{}, {}],
    )).toEqual([{ trait: 'Black', percentage: 100 }]);
  });

  it('returns [] when no offspring or species are provided', () => {
    expect(computeConfirmedOffspringTraits([], 'syrianHamster', [])).toEqual([]);
    expect(computeConfirmedOffspringTraits([{}], null, [{}])).toEqual([]);
  });
});

describe('computeGeneticDiscoveries', () => {
  it('recommends both parents be reviewed for a confirmed recessive chocolate genotype', () => {
    const sireCode = 'B/B';
    const damCode = 'B/B';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, 'Fancy Mouse');

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['b/b'],
      'Fancy Mouse',
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Chocolate',
      recommendations: [
        { parent: 'Sire', locus: 'B', genotype: 'B/b' },
        { parent: 'Dam', locus: 'B', genotype: 'B/b' },
      ],
    }]);
  });

  it('identifies the unrecorded parent locus when a Siamese offspring reveals it', () => {
    const sireCode = 'C/ch';
    const damCode = 'C/C';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, 'Fancy Mouse');

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['ch/ch'],
      'Fancy Mouse',
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Siamese',
      recommendations: [{ parent: 'Dam', locus: 'C', genotype: 'C/ch' }],
    }]);
  });

  it('reports appearance discoveries without inferring parent genotypes', () => {
    const expectedTraits = [{ trait: 'Black', probability: 100 }];

    expect(computeGeneticDiscoveries(
      'A/a',
      'A/a',
      [''],
      'Fancy Mouse',
      expectedTraits,
      [{ color: 'Chocolate' }],
    )).toEqual([{
      trait: 'Chocolate',
      recommendations: [],
    }]);
  });

  it('finds Fancy Rat discoveries and recommends parent locus updates', () => {
    const sireCode = 'a/a B/B';
    const damCode = 'a/a B/B';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, 'Fancy Rat');

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['a/a b/b'],
      'Fancy Rat',
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Chocolate',
      recommendations: [
        { parent: 'Sire', locus: 'B', genotype: 'B/b' },
        { parent: 'Dam', locus: 'B', genotype: 'B/b' },
      ],
    }]);
  });

  it('identifies the unrecorded Fancy Rat parent locus for a Siamese discovery', () => {
    const sireCode = 'a/a C/ch';
    const damCode = 'a/a C/C';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, 'Fancy Rat');

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['a/a ch/ch'],
      'Fancy Rat',
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Seal Point Siamese',
      recommendations: [{ parent: 'Dam', locus: 'C', genotype: 'C/ch' }],
    }]);
  });

  it('finds Syrian Hamster discoveries and recommends parent locus updates', () => {
    const sireCode = 'a/a E/E';
    const damCode = 'a/a E/E';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, 'Syrian Hamster');

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['a/a e/e'],
      'Syrian Hamster',
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Black Eyed Cream',
      recommendations: [
        { parent: 'Sire', locus: 'e', genotype: 'E/e' },
        { parent: 'Dam', locus: 'e', genotype: 'E/e' },
      ],
    }]);
  });

  it('finds Campbell dwarf hamster discoveries and recommends parent locus updates', () => {
    const sireCode = 'a/a B/B';
    const damCode = 'a/a B/B';
    const species = "Campbell's Dwarf Hamster";
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, species);

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['a/a b/b'],
      species,
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Chocolate',
      recommendations: [
        { parent: 'Sire', locus: 'b', genotype: 'B/b' },
        { parent: 'Dam', locus: 'b', genotype: 'B/b' },
      ],
    }]);
  });

  it('finds Russian Dwarf Hamster discoveries and recommends parent locus updates', () => {
    const sireCode = 'a/a D/D';
    const damCode = 'a/a D/D';
    const species = 'Russian Dwarf Hamster';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, species);

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['a/a d/d'],
      species,
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Russian Blue',
      recommendations: [
        { parent: 'Sire', locus: 'd', genotype: 'D/d' },
        { parent: 'Dam', locus: 'd', genotype: 'D/d' },
      ],
    }]);
  });

  it('finds Ball Python discoveries and recommends parent locus updates', () => {
    const sireCode = 'Cl/Cl';
    const damCode = 'Cl/Cl';
    const species = 'Ball Python';
    const expectedTraits = computeExpectedOffspring(sireCode, damCode, species);

    expect(computeGeneticDiscoveries(
      sireCode,
      damCode,
      ['cl/cl'],
      species,
      expectedTraits,
      [{}],
    )).toEqual([{
      trait: 'Clown',
      recommendations: [
        { parent: 'Sire', locus: 'cl', genotype: 'Cl/cl' },
        { parent: 'Dam', locus: 'cl', genotype: 'Cl/cl' },
      ],
    }]);
  });
});
