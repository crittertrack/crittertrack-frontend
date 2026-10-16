import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
const base = { _id: 'L1', litter_id_public: 'CTL1', sireId_public: 'CTC1', damId_public: 'CTC2', sire, dam, isPlanned: false, matingDate: '2026-09-01T00:00:00.000Z', birthDate: null, offspringIds_public: [] };

const mount = (litter, props = {}) => {
    apiClient.get.mockImplementation((url) => {
        if (url === '/litters') return Promise.resolve({ data: litter ? [litter] : [] });
        if (url === '/animals') return Promise.resolve({ data: [sire, dam] });
        if (String(url).includes('/inbreeding')) return Promise.resolve({ data: { inbreedingCoefficient: 0 } });
        return Promise.resolve({ data: [] });
    });
    apiClient.put.mockResolvedValue({ data: {} });
    const showModalMessage = jest.fn();
    render(<LitterManagement authToken="t" API_BASE_URL="/api" userProfile={{ id_public: 'CTU9', uiPreferences: {} }} showModalMessage={showModalMessage} speciesOptions={[]} {...props} />);
    return { showModalMessage };
};
// Each card renders twice (mobile + desktop layouts), so take the first match.
const openEdit = async () => {
    fireEvent.click((await screen.findAllByText('CTL1'))[0]);
    fireEvent.click((await screen.findAllByRole('button', { name: /edit/i }))[0]);
    await screen.findByText(/Edit Entry/);
};
const save = async () => { fireEvent.click(screen.getByRole('button', { name: /update entry/i })); await waitFor(() => expect(apiClient.put).toHaveBeenCalled()); };
const putBody = () => apiClient.put.mock.calls.filter(([u]) => u === '/litters/L1').pop()[1];

beforeEach(() => jest.clearAllMocks());

test('saving an unchanged Mated entry never changes its status (no isPlanned sent)', async () => {
    mount({ ...base });
    await openEdit(); await save();
    expect('isPlanned' in putBody()).toBe(false);
});

test('saving a Planned entry whose mating date has passed keeps it Planned', async () => {
    mount({ ...base, isPlanned: true });
    await openEdit(); await save();
    expect('isPlanned' in putBody()).toBe(false);
});

test('ticking "Born" sends birthDateUnknown, NO birth date, and clears isPlanned', async () => {
    mount({ ...base });
    await openEdit();
    fireEvent.click(screen.getByLabelText(/don't know the birth date/i));
    await save();
    const b = putBody();
    expect(b.birthDateUnknown).toBe(true);
    expect(b.birthDate).toBeNull();
    expect(b.isPlanned).toBe(false);
});

test('a born-unknown entry re-saved unchanged keeps the flag and sends no date', async () => {
    mount({ ...base, birthDateUnknown: true });
    await openEdit(); await save();
    const b = putBody();
    expect(b.birthDateUnknown).toBe(true);
    expect(b.birthDate).toBeNull();
    expect('isPlanned' in b).toBe(false);
});

test('the dam is NOT set nursing when saved as born with an unknown date', async () => {
    mount({ ...base });
    await openEdit();
    fireEvent.click(screen.getByLabelText(/don't know the birth date/i));
    await save();
    expect(apiClient.put.mock.calls.some(([u]) => u === '/animals/CTC2')).toBe(false);
});

test('new birth/outcome fields and pregnancy-lost are sent on save', async () => {
    mount({ ...base, birthComplications: 'x', birthOutcome: 'Healthy litter', pregnancyLost: true, pregnancyLostReason: 'Reabsorbed' });
    await openEdit(); await save();
    const b = putBody();
    expect(b.birthComplications).toBe('x');
    expect(b.birthOutcome).toBe('Healthy litter');
    expect(b.pregnancyLost).toBe(true);
    expect(b.pregnancyLostReason).toBe('Reabsorbed');
});

test('formOnly mode (Reproduction tab): shows only the form, opens at once, reports closing', async () => {
    const onFormClosed = jest.fn();
    mount(null, { formOnly: true, onFormClosed });
    expect(await screen.findByText(/Add Entry/)).toBeTruthy();
    expect(screen.queryByText(/Litter Management|Recalculate/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(onFormClosed).toHaveBeenCalled());
    expect(apiClient.get).not.toHaveBeenCalledWith('/litters', expect.anything());
});

test('saving without a sire and dam is refused with a message', async () => {
    const { showModalMessage } = mount(null, { formOnly: true });
    await screen.findByText(/Add Entry/);
    fireEvent.click(screen.getByRole('button', { name: /save entry/i }));
    await waitFor(() => expect(showModalMessage).toHaveBeenCalledWith('Error', 'Please select both a Sire and a Dam'));
    expect(apiClient.post).not.toHaveBeenCalled();
});
