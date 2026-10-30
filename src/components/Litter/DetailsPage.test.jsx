import React from 'react';
import { render, screen, within } from '@testing-library/react';
import LitterDetailsPage from './DetailsPage';
import apiClient from '../../utils/apiClient';

jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    useParams: () => ({ ctlId: 'CTL9' }),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
}), { virtual: true });
jest.mock('../../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), put: jest.fn() } }));

const litter = {
    _id: 'x', litter_id_public: 'CTL9', breedingPairCodeName: 'Dream Team', isDisplayLitter: true,
    sireId_public: 'CTC1', damId_public: 'CTC2',
    sire: { id_public: 'CTC1', name: 'Rex', gender: 'Male', color: 'Black', birthDate: '2025-01-01' },
    dam: { id_public: 'CTC2', name: 'Luna', gender: 'Female', birthDate: '2025-02-01' },
    matingDate: '2026-01-01', birthDate: '2026-01-22', litterSizeBorn: 6, maleCount: 4, femaleCount: 2, unknownCount: 0,
    inbreedingCoefficient: 1.5, notes: 'Lovely litter',
};

const mockLitter = (data) => apiClient.get.mockImplementation((url) => (
    String(url).endsWith('/offspring') ? Promise.resolve({ data: [] }) : Promise.resolve({ data })
));

const renderPage = () => render(<LitterDetailsPage showModalMessage={jest.fn()} />);

describe('Litter details page', () => {
    it('renders the white container, header, tabs and overview sections', async () => {
        mockLitter(litter);
        renderPage();
        const container = await screen.findByTestId('litter-details');
        expect(container.className).toMatch(/\bbg-white\b/);
        expect(screen.getByText('Back to Overview')).toBeTruthy();
        expect(screen.getByText('Edit litter')).toBeTruthy();
        expect(screen.getByText('Public')).toBeTruthy();
        ['Overview', 'Genetics & Compatibility', 'Offspring', 'Pedigrees', 'Gallery'].forEach(label =>
            expect(screen.getByRole('tab', { name: label })).toBeTruthy());
        expect(screen.getByTestId('litter-title').textContent).toContain('Dream Team');
        expect(screen.getByTestId('litter-title').textContent).toContain('CTL9');
        ['parent-sire', 'parent-dam', 'timeline-panel', 'stats-panel', 'objectives-panel', 'mating-panel', 'birth-panel', 'weaning-panel', 'notes-panel']
            .forEach(id => expect(screen.getByTestId(id)).toBeTruthy());
    });

    it('shows only the CTL id when there is no custom name', async () => {
        mockLitter({ ...litter, breedingPairCodeName: null });
        renderPage();
        const title = await screen.findByTestId('litter-title');
        expect(title.textContent).toBe('CTL9');
    });

    it('shows Not recorded for blank detail fields rather than empty values', async () => {
        mockLitter(litter);
        renderPage();
        const birth = await screen.findByTestId('birth-panel');
        expect(within(birth).getByText('Assistance required').parentElement.textContent).toContain('Not recorded');
        expect(within(screen.getByTestId('weaning-panel')).getByText('Actual weaning date').parentElement.textContent).toContain('Pending');
    });

    it('leaves the placeholder tabs without content', async () => {
        mockLitter(litter);
        renderPage();
        await screen.findByTestId('litter-details');
        expect(screen.queryByTestId('tab-genetics')).toBeNull(); // only rendered when selected
    });
});
