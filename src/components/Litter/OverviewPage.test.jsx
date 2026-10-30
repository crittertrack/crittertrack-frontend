import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LittersOverviewPage from './OverviewPage';
import apiClient from '../../utils/apiClient';

// Jest (CRA) can't resolve react-router-dom v7's package exports, and the page only needs navigate().
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), put: jest.fn() } }));

const litters = [
    { _id: 'a', litter_id_public: 'CTL1', sireId_public: 'CTC1', damId_public: 'CTC2', birthDate: '2026-01-01', maleCount: 3, femaleCount: 2, unknownCount: 1, inbreedingCoefficient: 0 },
    { _id: 'b', litter_id_public: 'CTL2', sireId_public: 'CTC1', damId_public: 'CTC2', birthDate: '2026-02-01', maleCount: 1, femaleCount: 1, unknownCount: 0, inbreedingCoefficient: 0 },
];

beforeEach(() => {
    apiClient.get.mockImplementation((url) => {
        if (url === '/litters') return Promise.resolve({ data: litters });
        if (url === '/animals') return Promise.resolve({ data: [
            { id_public: 'CTC1', name: 'Sire', species: 'Fancy Rat', gender: 'Male' },
            { id_public: 'CTC2', name: 'Dam', species: 'Fancy Rat', gender: 'Female' },
        ] });
        return Promise.resolve({ data: [] });
    });
});

const renderPage = () => render(<LittersOverviewPage showModalMessage={jest.fn()} />);
const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();

describe('Litters overview layout', () => {
    it('puts the title, search and cards inside one white parent container', async () => {
        renderPage();
        const cards = await screen.findAllByTestId('litter-card');
        const container = screen.getByTestId('litters-container');
        expect(container.className).toMatch(/\bbg-white\b/);
        expect(container.contains(screen.getByText('Litters', { selector: 'h1' }))).toBe(true);
        expect(container.contains(screen.getByPlaceholderText(/search by id/i))).toBe(true);
        cards.forEach(card => expect(container.contains(card)).toBe(true));
    });

    it('renders every card with a white background, whatever its status', async () => {
        renderPage();
        const cards = await screen.findAllByTestId('litter-card');
        expect(cards).toHaveLength(2);
        cards.forEach(card => {
            expect(card.className).toMatch(/\bbg-white\b/);
            expect(card.className).not.toMatch(/bg-(indigo|sky|pink)-/);
        });
    });

    it('shows the stats row with the coloured lucide gender icons and summed counts', async () => {
        renderPage();
        const stats = await screen.findByTestId('litter-stats');
        expect(text(stats)).toContain('2 litters');
        expect(text(stats.querySelector('[title="Males"]'))).toBe('4');
        expect(text(stats.querySelector('[title="Females"]'))).toBe('3');
        expect(text(stats.querySelector('[title="Unknown sex"]'))).toBe('1');

        // lucide renders <svg class="lucide lucide-mars text-primary ...">, same colours as the animal cards
        expect(stats.querySelector('[title="Males"] svg.lucide-mars.text-primary')).not.toBeNull();
        expect(stats.querySelector('[title="Females"] svg.lucide-venus.text-accent')).not.toBeNull();
        expect(stats.querySelector('[title="Unknown sex"] svg.lucide-circle')).not.toBeNull();

        // No text glyphs standing in for the icons.
        expect(stats.textContent).not.toMatch(/[\u2642\u2640]/);
    });

    it('uses the same icons, and no text glyphs, on the cards', async () => {
        renderPage();
        const [card] = await screen.findAllByTestId('litter-card');
        await waitFor(() => expect(card.querySelector('svg.lucide-mars.text-primary')).not.toBeNull());
        expect(card.querySelector('svg.lucide-venus.text-accent')).not.toBeNull();
        expect(card.textContent).not.toMatch(/[\u2642\u2640]/);
    });
});
