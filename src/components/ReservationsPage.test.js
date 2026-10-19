import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import apiClient from '../utils/apiClient';
import ReservationsPage from './ReservationsPage';

jest.mock('../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });

const animals = [
    { id_public: 'CTC1', name: 'Peanut', species: 'Fancy Rat', gender: 'Female', status: 'Available', imageUrl: null },
    { id_public: 'CTC2', name: 'Butter', species: 'Fancy Rat', gender: 'Male', status: 'Booked', reservedBuyerName: 'Jane', reservedPrice: 40, reservedDepositStatus: 'done', reservedPaymentStatus: 'due' },
    { id_public: 'CTC3', name: 'Retired Doe', species: 'Fancy Rat', gender: 'Female', status: 'Retired' },
    { id_public: 'CTC4', name: 'Whiskers', species: 'Fancy Mouse', gender: 'Female', status: 'Available' },
];
const waitlist = [
    { _id: 'W1', name: 'Jane', contactInfo: 'jane@example.com', speciesRequests: [{ species: 'Fancy Rat', genders: ['Female'], amount: 2 }], isActive: true, assignedAnimals: [] },
    { _id: 'W2', name: 'Sam', contactInfo: 'sam@example.com', speciesRequests: [{ species: 'Fancy Mouse', genders: ['Any'], amount: 3 }], isActive: true, assignedAnimals: [] },
];

const setup = async (overrides = {}) => {
    apiClient.get.mockImplementation((url) => {
        if (url === '/animals') return Promise.resolve({ data: overrides.animals || animals });
        if (url === '/waitlist') return Promise.resolve({ data: overrides.waitlist || waitlist });
        if (url === '/species') return Promise.resolve({ data: [{ name: 'Fancy Rat' }, { name: 'Fancy Mouse' }, { name: 'Fancy Gerbil' }] });
        return Promise.resolve({ data: [] });
    });
    apiClient.put.mockImplementation((url, payload) => Promise.resolve({ data: { animal: payload } }));
    apiClient.post.mockImplementation((url, payload) => Promise.resolve({ data: { _id: 'NEW', ...payload } }));
    apiClient.patch.mockImplementation((url, payload) => Promise.resolve({ data: payload }));
    apiClient.delete.mockImplementation(() => Promise.resolve({ data: {} }));
    const showModalMessage = jest.fn();
    const utils = render(<ReservationsPage authToken="t" API_BASE_URL="/api" showModalMessage={showModalMessage} />);
    await screen.findByText('Reservations');
    // Await the async animal data load so assertions run after the cards render.
    await screen.findByText('Peanut');
    return { ...utils, showModalMessage };
};

beforeEach(() => jest.clearAllMocks());

test('animals tab lists only Available and Booked animals', async () => {
    await setup();
    // Available / Booked animals are each rendered once as a card (no reservation -> no banner)
    expect(screen.getAllByText('Peanut').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Whiskers').length).toBeGreaterThan(0);
    // Butter is rendered once as a card, plus once in the "Payments due" banner
    expect(screen.getAllByText('Butter').length).toBeGreaterThan(0);
    expect(screen.queryByText('Retired Doe')).toBeNull();
});

test('buyer picker only shows waitlist entries fitting the animal species/gender', async () => {
    await setup();
    const peanutCard = screen.getByTestId('animal-card-CTC1');
    fireEvent.click(within(peanutCard).getByText('Assign'));
    // The reservation editor's waitlist picker is below the "Buyer / Adoptee…" label
    const label = screen.getByText('Buyer / Adoptee (from waitlist or manual)');
    const select = label.closest('div').querySelector('select');
    fireEvent.click(select);
    // Peanut = Female Fancy Rat: only Jane (Fancy Rat / Female) fits; Sam (Fancy Mouse) does not
    await waitFor(() => {
        const optionTexts = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
        expect(optionTexts.some(t => t.includes('Jane'))).toBe(true);
        expect(optionTexts.some(t => t.includes('Sam'))).toBe(false);
    });
});

test('assigning a buyer saves the reservation via PUT', async () => {
    await setup();
    const peanutCard = screen.getByTestId('animal-card-CTC1');
    fireEvent.click(within(peanutCard).getByText('Assign'));
    fireEvent.change(screen.getByPlaceholderText('Buyer name'), { target: { value: 'Sam' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const [url, payload] = apiClient.put.mock.calls[0];
    expect(url).toBe('/animals/CTC1');
    expect(payload.reservedBuyerName).toBe('Sam');
    expect(payload.status).toBe('Booked');
});

test('rehomed button promotes the reservation to sale + rehomed status', async () => {
    await setup();
    const butterCard = screen.getByTestId('animal-card-CTC2');
    window.confirm = jest.fn(() => true);
    fireEvent.click(within(butterCard).getByText('Rehomed'));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const [url, payload] = apiClient.put.mock.calls[0];
    expect(url).toBe('/animals/CTC2');
    expect(payload.status).toBe('Rehomed');
    expect(payload.archived).toBe(true);
    expect(payload.salePrice).toBe(40);
    expect(payload.buyerName).toBe('Jane');
    expect(payload.saleDate).toBeTruthy();
});

test('waitlist tab shows active/history toggle and entry details', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    expect(await screen.findByText('Jane')).toBeTruthy();
    expect(screen.getByText('Fancy Rat')).toBeTruthy();
    fireEvent.click(screen.getByText(/History \(0\)/));
    expect(await screen.findByText('No history yet')).toBeTruthy();
});

test('adding a multi-species waitlist entry posts speciesRequests array', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    fireEvent.click(screen.getByText('Add to Waitlist'));
    await screen.findByText('New Waitlist Entry');
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), { target: { value: 'Test Buyer' } });
    // Species row 1: Fancy Mouse, 3 Male + 2 Female
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[0], { target: { value: 'Fancy Mouse' } });
    fireEvent.change(screen.getAllByLabelText('Male count')[0], { target: { value: '3' } });
    fireEvent.change(screen.getAllByLabelText('Female count')[0], { target: { value: '2' } });
    // Species row 2: Fancy Rat, 7 of any gender
    fireEvent.click(screen.getByText('+ Add species'));
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[1], { target: { value: 'Fancy Rat' } });
    fireEvent.change(screen.getAllByLabelText('Any count')[1], { target: { value: '7' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist', expect.objectContaining({
        name: 'Test Buyer',
        speciesRequests: [
            expect.objectContaining({
                species: 'Fancy Mouse',
                amount: 5,
                genderCounts: [{ gender: 'Male', count: 3 }, { gender: 'Female', count: 2 }],
            }),
            expect.objectContaining({
                species: 'Fancy Rat',
                amount: 7,
                genderCounts: [{ gender: 'Any', count: 7 }],
            }),
        ],
    })));
});

test('waitlist card shows the per-gender split and fulfillment respects it', async () => {
    const split = [{
        _id: 'W9', name: 'Pat', speciesRequests: [{ species: 'Fancy Mouse', genderCounts: [{ gender: 'Male', count: 3 }, { gender: 'Female', count: 2 }], amount: 5 }],
        isActive: true,
        // 2 males assigned -> only 2/5 filled; a third female must not count toward the male slots
        assignedAnimals: [
            { id_public: 'A1', species: 'Fancy Mouse', gender: 'Male' },
            { id_public: 'A2', species: 'Fancy Mouse', gender: 'Male' },
        ],
    }];
    await setup({ waitlist: split });
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Pat');
    expect(screen.getByText(/3 Male \/ 2 Female/)).toBeTruthy();
    expect(screen.getByText(/2\/5/)).toBeTruthy();
});

test('finalizing a waitlist entry calls the finalize endpoint', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Jane');
    window.confirm = jest.fn(() => true);
    // Scope the Finalize button to Jane's entry (rows for Jane + Sam both render a button)
    const janeCard = screen.getByText('Jane').closest('[class*="space-y-2.5"]');
    fireEvent.click(within(janeCard).getByText('Finalize'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist/W1/finalize'));
});
