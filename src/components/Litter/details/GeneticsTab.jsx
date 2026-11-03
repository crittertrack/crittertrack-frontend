import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import {
    computeConfirmedOffspringTraits,
    computeExpectedOffspring,
    computeGeneticDiscoveries,
} from '../../../utils/expectedOffspring';

const Field = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
        <span className="text-sm text-gray-600 dark:text-dark-text-secondary">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{value ?? 'Not applicable'}</span>
    </div>
);

const PercentBar = ({ value }) => (
    <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
            <div className="h-full bg-primary dark:bg-dark-primary" style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} />
        </div>
        <span className="text-xs text-gray-500 dark:text-dark-text-muted w-10 text-right">{value != null ? `${value}%` : '—'}</span>
    </div>
);

const GeneticsTab = ({ litter, offspring = [], breedingLineDefs = [], animalBreedingLines = {} }) => {
    const [showAllAncestors, setShowAllAncestors] = useState(false);
    const [parentCodesError, setParentCodesError] = useState('');
    const [parentCodesRetry, setParentCodesRetry] = useState(0);
    const sire = litter?.sire || {};
    const dam = litter?.dam || {};
    const species = litter?.species || sire.species || dam.species;
    const sireId = sire.id_public || litter?.sireId_public;
    const damId = dam.id_public || litter?.damId_public;
    const resolveLines = (id) => {
        const assigned = (id && animalBreedingLines[id]) || [];
        return breedingLineDefs.filter(l => assigned.includes(l.id) && l.name && l.enabled !== false).map(l => l.name);
    };
    const sireLines = resolveLines(sireId);
    const damLines = resolveLines(damId);
    const shared = sireLines.filter(l => damLines.includes(l));
    let lineType = 'Undetermined';
    if (sireLines.length && damLines.length) {
        if (sireLines.length === damLines.length && sireLines.every(l => damLines.includes(l))) {
            lineType = 'Full Linebred';
        } else if (shared.length) {
            lineType = 'Partial Linebred';
        } else {
            lineType = 'Outcross';
        }
    }
    const ancestors = litter?.commonAncestors || [];
    const visibleAncestors = showAllAncestors ? ancestors : ancestors.slice(0, 5);
    const sireGeneticCodeFromLitter = sire.geneticCode || sire.genetic_code || null;
    const damGeneticCodeFromLitter = dam.geneticCode || dam.genetic_code || null;
    const [sireGeneticCode, setSireGeneticCode] = useState(sireGeneticCodeFromLitter);
    const [damGeneticCode, setDamGeneticCode] = useState(damGeneticCodeFromLitter);

    useEffect(() => {
        let cancelled = false;
        const hasGeneticCode = (code) => typeof code === 'string'
            ? code.trim().length > 0
            : code && typeof code === 'object' && Object.keys(code).length > 0;
        const fetchParentCode = async (id, code) => {
            if (hasGeneticCode(code) || !id) return code;
            const res = await apiClient.get(`/animals/any/${encodeURIComponent(id)}`);
            const animal = res.data;
            const fetchedCode = animal?.geneticCode || animal?.genetic_code;
            return hasGeneticCode(fetchedCode) ? fetchedCode : null;
        };

        setSireGeneticCode(sireGeneticCodeFromLitter);
        setDamGeneticCode(damGeneticCodeFromLitter);
        setParentCodesError('');
        Promise.all([
            fetchParentCode(sireId, sireGeneticCodeFromLitter),
            fetchParentCode(damId, damGeneticCodeFromLitter),
        ]).then(([sireCode, damCode]) => {
            if (cancelled) return;
            setSireGeneticCode(sireCode);
            setDamGeneticCode(damCode);
        }).catch((error) => {
            if (cancelled) return;
            console.error('Error fetching parent genetic codes:', error);
            setParentCodesError('Could not load one or both parent genetic codes.');
        });

        return () => {
            cancelled = true;
        };
    }, [
        sireId,
        damId,
        sireGeneticCodeFromLitter,
        damGeneticCodeFromLitter,
        parentCodesRetry,
    ]);

    const calculatedExpectedTraits = computeExpectedOffspring(
        sireGeneticCode,
        damGeneticCode,
        species,
        { includeGenes: true },
    );
    const expectedTraits = calculatedExpectedTraits.length
        ? calculatedExpectedTraits
        : (Array.isArray(litter?.expectedTraits) ? litter.expectedTraits : []);

    const confirmedTraits = computeConfirmedOffspringTraits(
        offspring.map((animal) => animal.geneticCode || animal.genetic_code || {}),
        species,
        offspring.map((animal) => ({
            color: animal.color,
            markings: animal.markings,
            coat: animal.coat,
            earset: animal.earset,
            eyeColor: animal.eyeColor,
            body: animal.body,
            carrierTraits: animal.carrierTraits,
        })),
    );
    const geneticDiscoveries = computeGeneticDiscoveries(
        sireGeneticCode,
        damGeneticCode,
        offspring.map((animal) => animal.geneticCode || animal.genetic_code || {}),
        species,
        expectedTraits,
        offspring.map((animal) => ({
            color: animal.color,
            markings: animal.markings,
            coat: animal.coat,
            earset: animal.earset,
            eyeColor: animal.eyeColor,
            body: animal.body,
        })),
    );
    const speciesKey = typeof species === 'string'
        ? species.toLowerCase().replace(/[^a-z0-9]/g, '')
        : '';
    const offspringCalculationsSupported = [
        'mouse',
        'fancymouse',
        'fancyrat',
        'syrianhamster',
        'campbellsdwarfhamster',
        'russiandwarfhamster',
        'ballpython',
    ].includes(speciesKey);
    const geneticDiscoveriesSupported = offspringCalculationsSupported;

    return (
        <div data-testid="tab-genetics" className="space-y-6">
            {parentCodesError && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                    <span>{parentCodesError}</span>
                    <button type="button" onClick={() => setParentCodesRetry(value => value + 1)} className="underline">Retry</button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">COI & AVK</h3>
                    <Field label="Sire COI" value={sire.inbreedingCoefficient != null ? `${sire.inbreedingCoefficient}%` : null} />
                    <Field label="Dam COI" value={dam.inbreedingCoefficient != null ? `${dam.inbreedingCoefficient}%` : null} />
                    <Field label="Expected offspring COI" value={litter?.inbreedingCoefficient != null ? `${Number(litter.inbreedingCoefficient).toFixed(2)}%` : null} />
                    <Field label="Sire AVK" value={sire.avgKinship != null ? `${Number(sire.avgKinship).toFixed(2)}%` : null} />
                    <Field label="Dam AVK" value={dam.avgKinship != null ? `${Number(dam.avgKinship).toFixed(2)}%` : null} />
                    <Field label="Calculation depth" value={litter?.pedigreeGenerations != null ? `${litter.pedigreeGenerations} generations` : null} />
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Breeding Lines</h3>
                    <Field label="Line Type" value={lineType} />
                    <Field label="Shared Lines" value={shared.length ? shared.join(', ') : null} />
                    <Field label="Sire Lines" value={sireLines.length ? sireLines.join(', ') : null} />
                    <Field label="Dam Lines" value={damLines.length ? damLines.join(', ') : null} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Common Ancestors</h3>
                    {ancestors.length === 0 ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">No common ancestors recorded.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 dark:text-dark-text-muted border-b border-gray-200 dark:border-dark-border pb-1 mb-1">
                                <span>Ancestor</span><span>Generations</span><span>Occurrences</span><span>Contribution</span>
                            </div>
                            {visibleAncestors.map((a, i) => (
                                <div key={a.id_public || i} className="grid grid-cols-4 text-sm py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                                    <span className="truncate">{a.name || a.ancestorName || a.id_public || '—'}</span>
                                    <span>{a.generations ?? '—'}</span>
                                    <span>{a.occurrences ?? a.count ?? '—'}</span>
                                    <span>{a.contribution != null ? `${(a.contribution * 100).toFixed(2)}%` : (a.contribution_pct != null ? `${a.contribution_pct}%` : '—')}</span>
                                </div>
                            ))}
                            {ancestors.length > 5 && (
                                <button type="button" onClick={() => setShowAllAncestors(v => !v)} className="mt-2 text-sm text-primary dark:text-dark-primary flex items-center gap-1">
                                    {showAllAncestors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {showAllAncestors ? 'Show less' : `Show all (${ancestors.length})`}
                                </button>
                            )}
                        </>
                    )}
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Genetic Discoveries</h3>
                    {geneticDiscoveries.length === 0 ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">
                            {geneticDiscoveriesSupported
                                ? 'No confirmed offspring traits differ from the expected traits.'
                                : 'Genetic discovery comparisons for this species are coming in a future release.'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                                These confirmed traits were not predicted. Review the suggested parent genetic-code updates.
                            </p>
                            {geneticDiscoveries.map((discovery) => (
                                <div key={discovery.trait} className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-3">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                                        {discovery.trait}
                                    </div>
                                    {discovery.recommendations.length ? (
                                        <ul className="mt-2 space-y-2">
                                            {discovery.recommendations.map((recommendation) => (
                                                <li
                                                    key={`${recommendation.parent}-${recommendation.locus}-${recommendation.genotype || ''}`}
                                                    className="flex flex-wrap items-center gap-2 rounded-md border border-white/80 dark:border-dark-border bg-white/80 dark:bg-dark-card-bg px-2.5 py-2 text-xs"
                                                >
                                                    <span className="font-medium text-gray-700 dark:text-dark-text-secondary">
                                                        Review {recommendation.parent} genetic code
                                                    </span>
                                                    {recommendation.genotype && (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <span className="text-gray-500 dark:text-dark-text-muted">
                                                                {recommendation.locus} locus
                                                            </span>
                                                            <code className="rounded bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 font-semibold text-indigo-800 dark:text-indigo-200">
                                                                {recommendation.genotype}
                                                            </code>
                                                        </span>
                                                    )}
                                                    {recommendation.note && (
                                                        <span className="basis-full text-gray-500 dark:text-dark-text-muted">
                                                            {recommendation.note}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 rounded-md border border-white/80 dark:border-dark-border bg-white/80 dark:bg-dark-card-bg px-2.5 py-2 text-xs text-gray-500 dark:text-dark-text-muted">
                                            Appearance-based discovery; offspring genetic code is needed to suggest parent updates.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Expected Offspring</h3>
                    {!offspringCalculationsSupported ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">
                            Genetic calculations for this species are coming in a future release.
                        </div>
                    ) : expectedTraits.length === 0 ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">No expected traits recorded.</div>
                    ) : expectedTraits.map((t, i) => (
                        <div key={i} className="py-2">
                            <div className="text-sm mb-1">
                                <span className="text-gray-700 dark:text-dark-text-secondary">{t.trait || t.name}</span>
                                {t.gene && <span className="ml-1 italic text-gray-500 dark:text-dark-text-muted">{t.gene}</span>}
                            </div>
                            <PercentBar value={t.probability} />
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Confirmed Offspring</h3>
                    <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2">
                        Observed traits from {offspring.length} linked offspring.
                    </p>
                    {!offspringCalculationsSupported ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">
                            Genetic calculations for this species are coming in a future release.
                        </div>
                    ) : confirmedTraits.length === 0 ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">
                            {offspring.length
                                ? 'No appearance traits or genetic codes are recorded for these offspring.'
                                : 'No linked offspring recorded.'}
                        </div>
                    ) : confirmedTraits.map((t, i) => (
                        <div key={i} className="py-2">
                            <div className="text-sm mb-1">
                                <span className="text-gray-700 dark:text-dark-text-secondary">{t.trait || t.name}</span>
                            </div>
                            <PercentBar value={t.percentage} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GeneticsTab;
