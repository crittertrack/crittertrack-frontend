import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import apiClient from '../../utils/apiClient';
import LitterManagement from './index';

jest.mock('../../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../AnimalForm', () => ({ PedigreeChart: () => null }));
jest.mock('../GeneticsCalculator', () => ({ calculatePhenotype: jest.fn() }));
jest.mock('../Modals/SpeciesModals', () => ({ SpeciesPickerModal: () => null }));
jest.mock('../../utils/nativeDownload', () => ({ downloadBlob: jest.fn() }));

const sire = { id_public: 'CTC1', name: 'Sire', species: 'Fancy Mouse', gender: 'Male' };
const dam = { id_public: 'CTC2', name: 'Dam', species: 'Fancy Mouse', gender: 'Female' };
const baseLitter = {
    _id: 'L1', litter_id_public: 'CTL1', sireId_public: 'CTC1', damId_public: 'CTC2', sire, dam,
    isPlanned: false, matingDate: '2026-09-01T00:00:00.000Z', birthDate: null, offspringIds_public: [],
};

const setup = async (litter, props = {}) => {
    apiClient.get.mockImplementation((url) => {
        if (url === '/litters') return Promise.resolve({ data: litter ? [litter] : [] });
        if (url === '/animals') return Promise.resolve({ data: [sire, dam] });
        if (String(url).includes('/inbreeding')) return Promise.resolve({ data: { inbreedingCoefficient: 0 } });
        return Promise.resolve({ data: [] });
    });
    apiClient.put.mockResolvedValue({ data: {} });
    apiClient.post.mockResolvedValue({ data: { litterId_backend: 'NEW' } });
    const showModalMessage = jest.fn();
    const utils = render(<LitterManagement authToken="t" API_BASE_URL="/api" userProfile={{ id_public: 'CTU9', autoCalcAvailable: false, uiPreferences: {} }} showModalMessage={showModalMessage} speciesOptions={[]} {...props} />);
    return { ...utils, showModalMessage };
};

// Each card renders twice (mobile + desktop layouts), so take the first match.
const openEdit = async () => {
    fireEvent.click((await screen.findAllByText('CTL1'))[0]);
    fireEvent.click((await screen.findAllByRole('button', { name: /edit/i }))[0]);
    await screen.findByText(/Edit Entry/);
};
const box = (re) => screen.getByLabelText(re);
const lastPut = () => apiClient.put.mock.calls.filter(([u]) => u === '/litters/L1').pop()[1];

beforeEach(() => jest.clearAllMocks());

test('single + Add button opens one form (no separate Mating / Litter buttons)', async () => {
    await setup(null);
    expect(screen.queryByText('Mating', { selector: 'span' })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: /add/i }));
    const title = (await screen.findByText(/Add Entry/)).closest('h3');
    expect(within(title).getByText('Planned')).toBeTruthy(); // status badge with no dates
});

test('sections appear in the requested order', async () => {
    await setup(null);
    fireEvent.click(await screen.findByRole('button', { name: /add/i }));
    await screen.findByText(/Add Entry/);
    const text = document.body.textContent;
    const order = ['Litter Name/ID', 'Species', 'Sire (Father)', 'Dates', 'Mating Date', 'Expected Due Date', 'Birth Date', 'Weaning Date', 'Notes', 'Mating information', 'Birth information', 'Offspring', 'Litter Photos'];
    let at = -1;
    order.forEach((label) => { const i = text.indexOf(label, at + 1); expect(i).toBeGreaterThan(at); at = i; });
});

test('EDIT keeps "Born, birth date unknown" ticked and the birth date empty/disabled', async () => {
    await setup({ ...baseLitter, isPlanned: false, birthDateUnknown: true, birthDate: null });
    await openEdit();
    expect(box(/don't know the birth date/i).checked).toBe(true);
    expect(screen.getByText(/Saved as born today/)).toBeTruthy();
});

test('EDIT keeps confirm-weaning and both "extract" checkboxes ticked', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', weaningDate: '2026-10-15T00:00:00.000Z', weaningConfirmed: true, extractStillbornFromTotal: true, extractLossesFromTotal: true });
    await openEdit();
    expect(box(/Confirm weaning/i).checked).toBe(true);
    expect(screen.getByText(/Extract stillborn from total/i).previousSibling.checked).toBe(true);
    expect(screen.getByText(/Extract losses from total/i).previousSibling.checked).toBe(true);
});

test('EDIT restores the cull checkbox + amount and saves them back', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', lossesCount: 5, hasCulls: true, cullsCount: 2 });
    await openEdit();
    expect(screen.getByText(/Some losses were culls/i).previousSibling.checked).toBe(true);
    expect(screen.getByDisplayValue('2')).toBeTruthy();
    // Save without touching anything and confirm both fields are sent back
    fireEvent.click(screen.getByRole('button', { name: /update entry/i }));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const payload = lastPut();
    expect(payload.hasCulls).toBe(true);
    expect(payload.cullsCount).toBe(2);
});

test('unticking the cull checkbox clears the amount so the overview no longer splits', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', lossesCount: 5, hasCulls: true, cullsCount: 2 });
    await openEdit();
    fireEvent.click(screen.getByText(/Some losses were culls/i).previousSibling);
    expect(screen.getByText(/Some losses were culls/i).previousSibling.checked).toBe(false);
    expect(screen.queryByDisplayValue('2')).toBeNull(); // Total Culls input is hidden again
    fireEvent.click(screen.getByRole('button', { name: /update entry/i }));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const payload = lastPut();
    expect(payload.hasCulls).toBe(false);
    expect(payload.cullsCount).toBeNull();
});

// The overview stats bar shows culls as their own stat, extracted from total losses.
// Cards render twice (mobile + desktop), so assert via getAll*.
const openCard = async () => {
    fireEvent.click((await screen.findAllByText('CTL1'))[0]);
};

test('overview extracts culls out of losses: 5 losses / 5 culls shows Culls 5 and hides Losses', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', lossesCount: 5, hasCulls: true, cullsCount: 5 });
    await openCard();
    const cullsLabels = await screen.findAllByText('Culls');
    cullsLabels.forEach(label => expect(label.parentElement.textContent).toContain('5'));
    // Non-cull losses = 0, so the Losses stat is hidden entirely
    expect(screen.queryByText('Losses')).toBeNull();
    // Born / Stillborn / Weaned stay always visible
    expect(screen.getAllByText('Born').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Stillborn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Weaned').length).toBeGreaterThan(0);
});

test('overview shows both stats when only some losses are culls (Losses 3, Culls 2)', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', lossesCount: 5, hasCulls: true, cullsCount: 2 });
    await openCard();
    (await screen.findAllByText('Losses')).forEach(label => expect(label.parentElement.textContent).toContain('3'));
    (await screen.findAllByText('Culls')).forEach(label => expect(label.parentElement.textContent).toContain('2'));
});

test('overview hides both Losses and Culls stats when there are no culls recorded', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', lossesCount: 5 });
    await openCard();
    (await screen.findAllByText('Losses')).forEach(label => expect(label.parentElement.textContent).toContain('5'));
    expect(screen.queryByText('Culls')).toBeNull();
});

test('overview hides Losses and Culls entirely when losses are 0 (default)', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', lossesCount: 0 });
    await openCard();
    expect(screen.queryByText('Losses')).toBeNull();
    expect(screen.queryByText('Culls')).toBeNull();
    // Born / Stillborn / Weaned remain
    expect(screen.getAllByText('Born').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Stillborn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Weaned').length).toBeGreaterThan(0);
});

test('EDIT keeps pregnancy-lost ticked, with its reason, and opens the Mating information section', async () => {
    await setup({ ...baseLitter, pregnancyLost: true, pregnancyLostReason: 'Reabsorbed', breedingMethod: 'AI' });
    await openEdit();
    expect(screen.getByText(/Pregnancy confirmed but no litter/i).previousSibling.checked).toBe(true);
    expect(screen.getByDisplayValue('Reabsorbed')).toBeTruthy();
    expect(screen.getByDisplayValue('Artificial Insemination')).toBeTruthy();
});

test('EDIT keeps new birth fields and opens the Birth information section', async () => {
    await setup({ ...baseLitter, birthDate: '2026-09-20T00:00:00.000Z', birthMethod: 'C-Section', birthComplications: 'Vet assist', birthOutcome: 'Some losses' });
    await openEdit();
    expect(screen.getByDisplayValue('Vet assist')).toBeTruthy();
    expect(screen.getByDisplayValue('Some losses')).toBeTruthy();
    expect(screen.getByDisplayValue('C-Section')).toBeTruthy();
});
