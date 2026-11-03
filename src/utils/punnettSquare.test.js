import { createCombinedPunnettSquare, getPunnettOutcomes } from './punnettSquare';

it('shows four gamete combinations and summarizes a monohybrid cross', () => {
    const result = getPunnettOutcomes('B/b', 'B/b', 'B');

    expect(result.cells).toEqual([
        ['B/B', 'B/b'],
        ['B/b', 'b/b'],
    ]);
    expect(result.outcomes).toEqual([
        { genotype: 'B/b', count: 2, percentage: 50 },
        { genotype: 'B/B', count: 1, percentage: 25 },
        { genotype: 'b/b', count: 1, percentage: 25 },
    ]);
});

it('uses the mouse A-locus dominance ordering for offspring genotypes', () => {
    const result = getPunnettOutcomes('a/Avy', 'Aw/a', 'A');

    expect(result.cells).toEqual([
        ['Aw/a', 'Avy/Aw'],
        ['a/a', 'Avy/a'],
    ]);
});

it('supports sex-linked genotype alleles and rejects incomplete genotypes', () => {
    expect(getPunnettOutcomes('Mobr/Y', 'Mobr/mobr', 'Mobr').cells).toEqual([
        ['Mobr/Mobr', 'Mobr/Y'],
        ['Mobr/mobr', 'Y/mobr'],
    ]);
    expect(getPunnettOutcomes('B/b', '', 'B')).toBeNull();
    expect(getPunnettOutcomes('B', 'B/b', 'B')).toBeNull();
});

it('creates a combined multi-locus grid with exact genotype cells', () => {
    const square = createCombinedPunnettSquare(
        { B: 'B/b', D: 'D/d' },
        { B: 'B/b', D: 'd/d' },
        ['B', 'D'],
        {
            B: { combinations: ['b/b', 'B/b', 'B/B'] },
            D: { combinations: ['d/d', 'D/d', 'D/D'] },
        }
    );

    expect(square.sireGametes).toHaveLength(4);
    expect(square.damGametes).toHaveLength(4);
    expect(square.cells).toHaveLength(4);
    expect(square.cells.every(row => row.length === 4)).toBe(true);
    expect(square.cells[0][0].genotype).toEqual({ B: 'B/B', D: 'D/d' });
    expect(square.cells[3][3].genotype).toEqual({ B: 'b/b', D: 'd/d' });
});

it('caps combined square size at four loci', () => {
    expect(createCombinedPunnettSquare(
        { A: 'A/a', B: 'B/b', C: 'C/c', D: 'D/d', E: 'E/e' },
        { A: 'A/a', B: 'B/b', C: 'C/c', D: 'D/d', E: 'E/e' },
        ['A', 'B', 'C', 'D', 'E'],
        {}
    )).toEqual({ reason: 'too_many_loci', locusCount: 5, maxLoci: 4 });
});

it('allows a maximum-size 16 by 16 square for four selected loci', () => {
    const loci = ['A', 'B', 'C', 'D'];
    const genotype = { A: 'A/a', B: 'B/b', C: 'C/c', D: 'D/d' };
    const square = createCombinedPunnettSquare(genotype, genotype, loci, {});

    expect(square.sireGametes).toHaveLength(16);
    expect(square.damGametes).toHaveLength(16);
    expect(square.cells).toHaveLength(16);
    expect(square.cells.every(row => row.length === 16)).toBe(true);
});
