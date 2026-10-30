import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Field = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
        <span className="text-sm text-gray-600 dark:text-dark-text-secondary">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{value ?? 'Not recorded'}</span>
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

const GeneticsTab = ({ litter, breedingLineDefs = [], animalBreedingLines = {} }) => {
    const [showAllAncestors, setShowAllAncestors] = useState(false);
    const sire = litter?.sire || {};
    const dam = litter?.dam || {};
    const sireId = sire.id_public || litter?.sireId_public;
    const damId = dam.id_public || litter?.damId_public;
    const resolveLines = (id) => {
        const assigned = (id && animalBreedingLines[id]) || [];
        return breedingLineDefs.filter(l => assigned.includes(l.id) && l.name && l.enabled !== false).map(l => l.name);
    };
    const sireLines = resolveLines(sireId);
    const damLines = resolveLines(damId);
    const shared = sireLines.filter(l => damLines.includes(l));
    let lineType = 'Unassigned / Undetermined';
    if (sireLines.length && damLines.length) {
        lineType = shared.length ? 'Within-Line Pairing' : 'Cross-Line Pairing';
    } else if (sireLines.length || damLines.length) {
        lineType = 'Partially Assigned';
    }
    const ancestors = litter?.commonAncestors || [];
    const visibleAncestors = showAllAncestors ? ancestors : ancestors.slice(0, 5);
    const expectedTraits = litter?.expectedTraits || [];
    const confirmedTraits = litter?.confirmedTraits || [];

    return (
        <div data-testid="tab-genetics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">COI & AVK</h3>
                    <Field label="Sire COI" value={sire.inbreedingCoefficient != null ? `${sire.inbreedingCoefficient}%` : null} />
                    <Field label="Dam COI" value={dam.inbreedingCoefficient != null ? `${dam.inbreedingCoefficient}%` : null} />
                    <Field label="Expected offspring COI" value={litter?.inbreedingCoefficient != null ? `${Number(litter.inbreedingCoefficient).toFixed(2)}%` : null} />
                    <Field label="Sire AVK" value={sire.avgKinship != null ? `${sire.avgKinship}%` : null} />
                    <Field label="Dam AVK" value={dam.avgKinship != null ? `${dam.avgKinship}%` : null} />
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
                    <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">No genetic discoveries recorded.</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Expected Offspring</h3>
                    {expectedTraits.length === 0 ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">No expected traits recorded.</div>
                    ) : expectedTraits.map((t, i) => (
                        <div key={i} className="py-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-dark-text-secondary">{t.trait || t.name}</span>
                                <span className="text-gray-500 dark:text-dark-text-muted">{t.probability}%</span>
                            </div>
                            <PercentBar value={t.probability} />
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2">Confirmed Offspring</h3>
                    {confirmedTraits.length === 0 ? (
                        <div className="py-4 text-sm text-gray-500 dark:text-dark-text-muted">No confirmed offspring traits recorded.</div>
                    ) : confirmedTraits.map((t, i) => (
                        <div key={i} className="py-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-dark-text-secondary">{t.trait || t.name}</span>
                                <span className="text-gray-500 dark:text-dark-text-muted">{t.percentage}%</span>
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
