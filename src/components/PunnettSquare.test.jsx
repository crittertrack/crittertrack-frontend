import React from 'react';
import { render, screen } from '@testing-library/react';
import PunnettSquare from './PunnettSquare';

const offspringResults = [
    { phenotype: 'Black', carriers: [], percentage: '25.00', genotypes: [{ B: 'B/B', D: 'D/D' }] },
    { phenotype: 'Blue', carriers: [], percentage: '25.00', genotypes: [{ B: 'B/B', D: 'd/d' }] },
    { phenotype: 'Chocolate', carriers: [], percentage: '25.00', genotypes: [{ B: 'B/b', D: 'D/d' }] },
    { phenotype: 'Albino', carriers: [], percentage: '25.00', genotypes: [{ B: 'b/b', D: 'd/d' }] },
];

it('renders combined cells using the same phenotype outcomes and percentages', () => {
    const square = {
        loci: ['B', 'D'],
        sireGametes: [{ label: 'B · D' }, { label: 'b · d' }],
        damGametes: [{ label: 'B · D' }, { label: 'b · d' }],
        cells: [
            [{ genotype: { B: 'B/B', D: 'D/D' } }, { genotype: { B: 'B/b', D: 'D/d' } }],
            [{ genotype: { B: 'B/b', D: 'D/d' } }, { genotype: { B: 'b/b', D: 'd/d' } }],
        ],
    };

    render(<PunnettSquare square={square} offspringResults={offspringResults} species="Fancy Mouse" />);

    expect(screen.getByRole('table', { name: 'Combined offspring Punnett square' })).toBeTruthy();
    expect(screen.getAllByText('Black').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chocolate').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Predicted phenotype ratios').textContent).toContain('Chocolate: 25.00%');
    expect(screen.queryByText('Unmatched outcome')).toBeNull();
});

it('explains why a square cannot be shown when selected loci exceed the cap', () => {
    render(
        <PunnettSquare
            square={{ reason: 'too_many_loci', maxLoci: 4, locusCount: 5 }}
            offspringResults={offspringResults}
            species="Fancy Mouse"
        />
    );

    expect(screen.getByRole('status').textContent).toContain('up to 4 selected loci (16 × 16 cells)');
});
