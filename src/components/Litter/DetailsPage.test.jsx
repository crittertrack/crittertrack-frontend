import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import LitterDetailsPage from './DetailsPage';
import apiClient from '../../utils/apiClient';

jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        useNavigate: () => jest.fn(),
        useParams: () => ({ ctlId: 'CTL9' }),
        useSearchParams: () => React.useState(new URLSearchParams()),
    };
}, { virtual: true });
jest.mock('../../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
jest.mock('../AnimalForm', () => ({ PedigreeChart: () => null }));
jest.mock('../FamilyTree/DirectParentTree', () => () => <div data-testid="mock-direct-parent-tree" />);

const litter = {
    _id: 'x', litter_id_public: 'CTL9', breedingPairCodeName: 'Dream Team', isDisplayLitter: true,
    sireId_public: 'CTC1', damId_public: 'CTC2',
    sire: { id_public: 'CTC1', name: 'Rex', species: 'Fancy Rat', gender: 'Male', color: 'Black', birthDate: '2025-01-01' },
    dam: { id_public: 'CTC2', name: 'Luna', species: 'Fancy Rat', gender: 'Female', birthDate: '2025-02-01' },
    matingDate: '2026-01-01', birthDate: '2026-01-22', litterSizeBorn: 6, maleCount: 4, femaleCount: 2, unknownCount: 0,
    inbreedingCoefficient: 1.5, notes: 'Lovely litter',
};

const mockLitter = (data) => apiClient.get.mockImplementation(url => {
    if (String(url).endsWith('/offspring')) return Promise.resolve({ data: [] });
    if (String(url).endsWith('/genetics-summary')) return Promise.resolve({ data: { commonAncestors: [], pedigreeGenerations: 0 } });
    if (String(url).endsWith('/gallery')) return Promise.resolve({ data: data.images || [] });
    return Promise.resolve({ data });
});

const renderPage = (showModalMessage = jest.fn()) => render(<LitterDetailsPage showModalMessage={showModalMessage} />);

describe('Litter details page', () => {
    beforeEach(() => {
        apiClient.get.mockReset();
        apiClient.post.mockReset();
        apiClient.put.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

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
        expect(within(birth).getAllByText('Not recorded').length).toBeGreaterThan(0);
        expect(within(screen.getByTestId('weaning-panel')).getByText('Pending')).toBeTruthy();
    });

    it('shows saved expected outcomes, genetic notes, and keeper plans in the overview', async () => {
        mockLitter({
            ...litter,
            expectedOutcomes: 'Agouti babies expected',
            geneticNotes: 'Both parents may carry dilute',
            keepersGrowouts: 'Maybe, depending on results',
            placementPlans: 'Some available for placement',
        });
        renderPage();
        const objectives = await screen.findByTestId('objectives-panel');
        expect(within(objectives).getByText('Agouti babies expected')).toBeTruthy();
        expect(within(objectives).getByText('Both parents may carry dilute')).toBeTruthy();
        expect(within(objectives).getByText('Maybe, depending on results · Some available for placement')).toBeTruthy();
    });

    it('loads the overview without requesting deferred tab data', async () => {
        mockLitter(litter);
        renderPage();
        await screen.findByTestId('litter-details');
        expect(apiClient.get).toHaveBeenCalledTimes(1);
        expect(apiClient.get).toHaveBeenCalledWith('/litters/CTL9?view=overview');
        expect(apiClient.get.mock.calls.some(([url]) => /\/(offspring|genetics-summary|gallery)$/.test(String(url)))).toBe(false);
    });

    it('loads deferred tab data only when the corresponding tab is opened', async () => {
        mockLitter(litter);
        renderPage();
        await screen.findByTestId('litter-details');

        fireEvent.click(screen.getByRole('tab', { name: 'Genetics & Compatibility' }));
        await screen.findByTestId('tab-genetics');
        expect(apiClient.get).toHaveBeenCalledWith('/litters/CTL9/genetics-summary');
        expect(apiClient.get).toHaveBeenCalledWith('/litters/CTL9/offspring');

        fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }));
        await screen.findByText('No photos have been added to this litter.');
        expect(apiClient.get).toHaveBeenCalledWith('/litters/CTL9/gallery');

        fireEvent.click(screen.getByRole('tab', { name: 'Pedigrees' }));
        await screen.findByTestId('tab-pedigrees');
        expect(screen.getByTestId('mock-direct-parent-tree')).toBeTruthy();

        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        await screen.findByText('No offspring match.');
        expect(apiClient.get.mock.calls.filter(([url]) => String(url).endsWith('/offspring'))).toHaveLength(1);
    });

    it('shows a retry state when deferred offspring data fails to load', async () => {
        apiClient.get.mockImplementation(url => (
            String(url).endsWith('/offspring')
                ? Promise.reject({ response: { data: { message: 'Offspring unavailable' } } })
                : Promise.resolve({ data: litter })
        ));
        renderPage();
        await screen.findByTestId('litter-details');
        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Offspring unavailable');

        apiClient.get.mockImplementation(url => (
            String(url).endsWith('/offspring') ? Promise.resolve({ data: [] }) : Promise.resolve({ data: litter })
        ));
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findByText('No offspring match.')).toBeTruthy();
    });

    it('quick-adds an offspring and links it to the current litter', async () => {
        mockLitter(litter);
        apiClient.post.mockResolvedValue({ data: { id_public: 'CTC3', name: 'Pip', species: 'Fancy Rat', gender: 'Male' } });
        renderPage();
        await screen.findByTestId('litter-details');
        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        fireEvent.click(await screen.findByText('+ Add offspring'));
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Pip' } });
        fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/animals', expect.objectContaining({
            name: 'Pip',
            species: 'Fancy Rat',
            gender: 'Male',
            birthDate: '2026-01-22',
            sireId_public: 'CTC1',
            damId_public: 'CTC2',
        })));
        await waitFor(() => expect(apiClient.put).toHaveBeenCalledWith('/litters/x', expect.objectContaining({
            offspringIds_public: ['CTC3'],
            maleCount: 1,
            femaleCount: 0,
            unknownCount: 0,
            litterSizeBorn: 6,
            numberBorn: 6,
        })));
    });

    it('uses reptile appearance labels and retains the existing animal payload field names', async () => {
        const reptileLitter = {
            ...litter,
            species: 'Leopard Gecko',
            sire: { ...litter.sire, species: 'Leopard Gecko' },
            dam: { ...litter.dam, species: 'Leopard Gecko' },
        };
        mockLitter(reptileLitter);
        apiClient.post.mockResolvedValue({ data: { id_public: 'CTC3', name: 'Pip', species: 'Leopard Gecko', gender: 'Male' } });
        renderPage();
        await screen.findByTestId('litter-details');
        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        fireEvent.click(await screen.findByText('+ Add offspring'));

        expect(screen.getByLabelText('Morph')).toBeTruthy();
        expect(screen.getByLabelText('Scalation')).toBeTruthy();
        expect(screen.queryByLabelText('Earset')).toBeNull();
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Pip' } });
        fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
        fireEvent.change(screen.getByLabelText('Morph'), { target: { value: 'Albino' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/animals', expect.objectContaining({
            name: 'Pip',
            species: 'Leopard Gecko',
            color: 'Albino',
            coat: null,
        })));
        const payload = apiClient.post.mock.calls[0][1];
        expect(payload).not.toHaveProperty('morph');
        expect(payload).not.toHaveProperty('scalation');
        expect(payload).not.toHaveProperty('earset');
    });

    it('quick-links an existing animal and assigns the litter parents', async () => {
        apiClient.get.mockImplementation(url => (
            String(url).endsWith('/offspring') ? Promise.resolve({ data: [] }) :
                url === '/animals' ? Promise.resolve({ data: [{ id_public: 'CTC3', name: 'Pip', species: 'Fancy Rat', gender: 'Female' }] }) :
                    Promise.resolve({ data: litter })
        ));
        renderPage();
        await screen.findByTestId('litter-details');
        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        fireEvent.click(await screen.findByText('+ Add offspring'));
        fireEvent.click(screen.getByRole('button', { name: 'Quick Link' }));
        fireEvent.click(await screen.findByText('Link'));

        await waitFor(() => expect(apiClient.put).toHaveBeenNthCalledWith(1, '/animals/CTC3', {
            sireId_public: 'CTC1',
            damId_public: 'CTC2',
        }));
        await waitFor(() => expect(apiClient.put).toHaveBeenNthCalledWith(2, '/litters/x', expect.objectContaining({
            offspringIds_public: ['CTC3'],
            maleCount: 0,
            femaleCount: 1,
            unknownCount: 0,
            litterSizeBorn: 6,
        })));
    });

    it('unlinks offspring from the litter, refreshes the views, and keeps the animal record', async () => {
        const child = { id_public: 'CTC3', name: 'Pip', species: 'Fancy Rat', gender: 'Male', status: 'Pet' };
        const showModalMessage = jest.fn();
        const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
        apiClient.get.mockImplementation(url => (
            String(url).endsWith('/offspring') ? Promise.resolve({ data: [child] }) : Promise.resolve({ data: { ...litter, offspringIds_public: ['CTC3'] } })
        ));
        apiClient.put.mockResolvedValue({ data: { message: 'Litter updated successfully!' } });
        renderPage(showModalMessage);
        await screen.findByTestId('litter-details');
        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        await screen.findByText('Pip');
        fireEvent.click(await screen.findByText('Unlink'));

        await waitFor(() => expect(apiClient.put).toHaveBeenCalledWith('/litters/x', { offspringIds_public: [] }));
        await waitFor(() => expect(apiClient.get.mock.calls.filter(([url]) => String(url).endsWith('/offspring'))).toHaveLength(2));
        expect(apiClient.put).toHaveBeenCalledTimes(1);
        expect(confirm).toHaveBeenCalledWith(expect.stringContaining('will not be deleted'));
        expect(showModalMessage).toHaveBeenCalledWith('Success', expect.stringContaining('animal record was not deleted'));
    });

    it('reports an unlink failure without deleting the animal or refreshing as successful', async () => {
        const child = { id_public: 'CTC3', name: 'Pip', species: 'Fancy Rat', gender: 'Male', status: 'Pet' };
        const showModalMessage = jest.fn();
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        apiClient.get.mockImplementation(url => (
            String(url).endsWith('/offspring') ? Promise.resolve({ data: [child] }) : Promise.resolve({ data: { ...litter, offspringIds_public: ['CTC3'] } })
        ));
        apiClient.put.mockRejectedValue({ response: { data: { message: 'Update denied' } } });
        renderPage(showModalMessage);
        await screen.findByTestId('litter-details');
        fireEvent.click(screen.getByRole('tab', { name: 'Offspring' }));
        await screen.findByText('Pip');
        fireEvent.click(await screen.findByText('Unlink'));

        await waitFor(() => expect(showModalMessage).toHaveBeenCalledWith('Error', 'Update denied'));
        expect(apiClient.put).toHaveBeenCalledTimes(1);
        expect(apiClient.get.mock.calls.filter(([url]) => String(url).endsWith('/offspring'))).toHaveLength(1);
    });
});
