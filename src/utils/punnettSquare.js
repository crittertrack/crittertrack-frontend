const A_LOCUS_DOMINANCE_ORDER = ['Ay', 'Avy', 'Aw', 'A', 'at', 'a', 'ae'];

const sortAlleles = (first, second, locus) => {
    if (locus === 'A') {
        const firstRank = A_LOCUS_DOMINANCE_ORDER.indexOf(first);
        const secondRank = A_LOCUS_DOMINANCE_ORDER.indexOf(second);
        if (firstRank !== -1 && secondRank !== -1) return firstRank - secondRank;
    }
    if (first[0] === first[0].toUpperCase() && second[0] === second[0].toLowerCase()) return -1;
    if (first[0] === first[0].toLowerCase() && second[0] === second[0].toUpperCase()) return 1;
    return first.localeCompare(second);
};

export const combineAlleles = (first, second, locus) => [first, second]
    .sort((left, right) => sortAlleles(left, right, locus))
    .join('/');

const getAlleles = (genotype) => String(genotype || '')
    .replace(/\s*\(lethal\)\s*/gi, '')
    .split('/')
    .map(allele => allele.trim());

const getGametes = (genotype, loci) => loci.reduce((gametes, locus) => {
    const alleles = getAlleles(genotype[locus]);
    if (alleles.length !== 2 || alleles.some(allele => !allele)) return [];
    return gametes.flatMap(gamete => alleles.map(allele => ({
        ...gamete,
        [locus]: allele,
    })));
}, [{}]);

export const createCombinedPunnettSquare = (sire, dam, loci, geneLoci, maxLoci = 4) => {
    if (!Array.isArray(loci) || loci.length === 0) return { reason: 'no_loci' };
    if (loci.length > maxLoci) return { reason: 'too_many_loci', locusCount: loci.length, maxLoci };

    const resolveParent = (parent) => loci.reduce((resolved, locus) => {
        if (parent[locus]) {
            resolved[locus] = parent[locus];
            return resolved;
        }
        const wildtype = (geneLoci[locus]?.combinations || []).find(combo => {
            const alleles = getAlleles(combo);
            return alleles.length === 2 && alleles[0] === alleles[1] && alleles[0][0] === alleles[0][0].toUpperCase();
        });
        resolved[locus] = wildtype || geneLoci[locus]?.combinations?.[0] || '';
        return resolved;
    }, {});

    const sireGenotype = resolveParent(sire);
    const damGenotype = resolveParent(dam);
    const sireGametes = getGametes(sireGenotype, loci);
    const damGametes = getGametes(damGenotype, loci);
    if (!sireGametes.length || !damGametes.length) return { reason: 'incomplete_genotype' };

    const formatGamete = (gamete) => loci.map(locus => gamete[locus]).join(' · ');
    const cells = damGametes.map(damGamete => sireGametes.map(sireGamete => {
        const genotype = {};
        loci.forEach(locus => {
            genotype[locus] = combineAlleles(sireGamete[locus], damGamete[locus], locus);
        });
        return { genotype };
    }));

    return {
        loci,
        sireGametes: sireGametes.map(gamete => ({ alleles: gamete, label: formatGamete(gamete) })),
        damGametes: damGametes.map(gamete => ({ alleles: gamete, label: formatGamete(gamete) })),
        cells,
    };
};

export const getPunnettOutcomes = (sireGenotype, damGenotype, locus) => {
    const sireAlleles = String(sireGenotype || '').replace(/\s*\(lethal\)\s*/gi, '').split('/');
    const damAlleles = String(damGenotype || '').replace(/\s*\(lethal\)\s*/gi, '').split('/');
    if (sireAlleles.length !== 2 || damAlleles.length !== 2 || [...sireAlleles, ...damAlleles].some(allele => !allele)) {
        return null;
    }

    const cells = damAlleles.map(damAllele => sireAlleles.map(sireAllele => {
        return combineAlleles(sireAllele, damAllele, locus);
    }));
    const counts = new Map();
    cells.flat().forEach(genotype => counts.set(genotype, (counts.get(genotype) || 0) + 1));
    const outcomes = Array.from(counts, ([genotype, count]) => ({
        genotype,
        count,
        percentage: count * 25,
    })).sort((first, second) => second.count - first.count);

    return { sireAlleles, damAlleles, cells, outcomes };
};
