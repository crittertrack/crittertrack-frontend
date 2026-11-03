import React from 'react';

const PunnettSquare = ({ square, offspringResults, species }) => {
    if (square?.reason) {
        const message = square.reason === 'too_many_loci'
            ? `The Punnett square view supports up to ${square.maxLoci} selected loci (${2 ** square.maxLoci} × ${2 ** square.maxLoci} cells). This cross has ${square.locusCount} selected loci.`
            : square.reason === 'possible_hets'
                ? 'The square view is unavailable while uncertain possible-carrier genes are included. The phenotype summary still includes those probabilities.'
                : 'A Punnett square cannot be displayed for the selected genotypes.';
        return <p role="status" className="rounded-lg bg-white p-4 text-sm text-gray-700 dark:bg-dark-card-bg dark:text-dark-text-secondary">{message}</p>;
    }

    const genotypeOutcomes = new Map();
    offspringResults.forEach(outcome => {
        outcome.genotypes.forEach(genotype => {
            genotypeOutcomes.set(
                square.loci.map(locus => genotype[locus] || '').join('|'),
                outcome
            );
        });
    });

    const getDisplayPhenotype = (outcome) => species === 'Ball Python'
        ? [outcome.phenotype, ...(outcome.carriers || []).map(carrier => `Het. ${carrier}`)].filter(Boolean).join(' ')
        : outcome.phenotype || (outcome.carriers || []).map(carrier => `${carrier} Carrier`).join(', ');

    return (
        <div>
            <p className="mb-3 text-sm text-gray-700 dark:text-dark-text-secondary">
                Each cell shows the same predicted phenotype and genotype as the summary view. The ratios below match its outcome percentages.
            </p>
            <div className="overflow-auto rounded-lg bg-white dark:bg-dark-card-bg">
                <table className="w-full border-collapse text-center" aria-label="Combined offspring Punnett square">
                    <caption className="sr-only">Combined Punnett square for {square.loci.join(', ')} loci</caption>
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 border border-indigo-200 bg-indigo-100 p-2 text-xs dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-dark-text-secondary">
                                Dam ↓ / Sire →
                            </th>
                            {square.sireGametes.map((gamete, index) => (
                                <th key={`${gamete.label}-${index}`} scope="col" className="min-w-32 border border-indigo-200 bg-indigo-100 p-2 text-xs font-mono dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-dark-text">
                                    {gamete.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {square.damGametes.map((damGamete, row) => (
                            <tr key={`${damGamete.label}-${row}`}>
                                <th scope="row" className="sticky left-0 z-10 min-w-32 border border-indigo-200 bg-indigo-100 p-2 text-xs font-mono dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-dark-text">
                                    {damGamete.label}
                                </th>
                                {square.cells[row].map((cell, column) => {
                                    const outcome = genotypeOutcomes.get(square.loci.map(locus => cell.genotype[locus]).join('|'));
                                    const phenotype = outcome ? getDisplayPhenotype(outcome) : 'Unmatched outcome';
                                    return (
                                        <td key={`${row}-${column}`} className="min-w-32 border border-indigo-200 p-2 align-top dark:border-indigo-700">
                                            <div className="font-semibold text-gray-900 dark:text-dark-text">{phenotype}</div>
                                            <div className="mt-1 break-words font-mono text-xs text-gray-600 dark:text-dark-text-muted">
                                                {square.loci.map(locus => cell.genotype[locus]).join(' · ')}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Predicted phenotype ratios">
                {offspringResults.map(outcome => (
                    <span key={`${outcome.phenotype}-${(outcome.carriers || []).join(',')}`} className="rounded-full bg-white px-3 py-1 text-sm text-gray-800 dark:bg-dark-card-bg dark:text-dark-text">
                        <span className="font-semibold">{getDisplayPhenotype(outcome)}</span>: {outcome.percentage}%
                    </span>
                ))}
            </div>
        </div>
    );
};

export default PunnettSquare;
