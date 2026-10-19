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
];
const waitlist = [
    { _id: 'W1', name: 'Jane', contactInfo: 'jane@example.com', species: 'Fancy Rat', genders: ['Female'], amount: 2, notes: '', isActive: true, assignedAnimals: [] },
];

const setup = async (overrides = {}) => {
    apiClient.get.mockImplementation((url) => {
        if (url === '/animals') return Promise.resolve({ data: overrides.animals || animals });
        if (url === '/waitlist') return Promise.resolve({ data: overrides.waitlist || waitlist });
        return Promise.resolve({ data: [] });
    });
    apiClient.put.mockImplementation((url, payload) => Promise.resolve({ data: { animal: payload } }));
    apiClient.post.mockImplementation((url, payload) => Promise.resolve({ data: { _id: 'NEW', ...payload } }));
    apiClient.patch.mockImplementation((url, payload) => Promise.resolve({ data: payload }));
    const showModalMessage = jest.fn();
    const utils = render(<ReservationsPage authToken="t" API_BASE_URL="/api" showModalMessage={showModalMessage} />);
    await screen.findByText('Reservations');
    return { ...utils, showModalMessage };
};

beforeEach(() => jest.clearAllMocks());

test('animals tab lists only Available and Booked animals', async () => {
    await setup();
    expect(await screen.findByTestId('animal-card-CTC1')).toBeTruthy();
    expect(screen.getByTestId('animal-card-CTC2')).toBeTruthy();
    expect(screen.queryByTestId('animal-card-CTC3')).toBeNull();
});

test('assigning a buyer saves the reservation via PUT', async () => {
    await setup();
    const card = await screen.findByTestId('animal-card-CTC1');
    fireEvent.click(within(card).getByText('Assign'));
    fireEvent.change(within(card).getByPlaceholderText('Buyer name'), { target: { value: 'Sam' } });
    fireEvent.click(within(card).getByText('Save'));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const [url, payload] = apiClient.put.mock.calls[0];
    expect(url).toBe('/animals/CTC1');
    expect(payload.reservedBuyerName).toBe('Sam');
    expect(payload.status).toBe('Booked');
});

test('rehomed button promotes the reservation to sale + rehomed status', async () => {
    await setup();
    const card = await screen.findByTestId('animal-card-CTC2');
    window.confirm = jest.fn(() => true);
    fireEvent.click(within(card).getByText('Rehomed'));
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
    expect(screen.getByText('Female')).toBeTruthy();
    fireEvent.click(screen.getByText(/History \(0\)/));
    expect(await screen.findByText('No history yet')).toBeTruthy();
});

test('finalizing a waitlist entry calls the finalize endpoint', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Jane');
    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByText('Finalize'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist/W1/finalize'));
});
