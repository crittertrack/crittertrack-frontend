import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpCenterPage from './HelpCenterPage';

// react-router-dom (v7) doesn't resolve under this jest setup, so like other suites we
// mock it virtually — just the two pieces HelpCenterPage uses: Link and useSearchParams.
const mockSetSearchParams = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('react-router-dom', () => ({
    __esModule: true,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}), { virtual: true });

// HelpCenterPage pulls in SpeciesValuesSuggestion, which imports apiClient — mock it so
// no network layer is loaded during these render tests.
jest.mock('../../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn(() => Promise.resolve({ data: [] })), post: jest.fn(() => Promise.resolve({ data: {} })) },
}));

const renderAt = (query) => {
    mockSearchParams = new URLSearchParams(query);
    return render(<HelpCenterPage speciesOptions={[]} showModalMessage={jest.fn()} />);
};

test('the Reservations info button link (lesson=reservations) opens the Reservations article', () => {
    // ReservationsPage's InfoButton navigates to /help?lesson=reservations.
    renderAt('lesson=reservations');
    expect(screen.getByRole('heading', { level: 2, name: 'Track reservations, payments, and the waitlist' })).toBeTruthy();
    // The guide covers the card actions, including the quick "Paid" button.
    expect(screen.getByRole('heading', { level: 4, name: 'Mark payments as paid' })).toBeTruthy();
});

test('searching for waitlist surfaces the Reservations article', () => {
    renderAt('');
    fireEvent.change(screen.getByPlaceholderText('Search help articles...'), { target: { value: 'waitlist' } });
    expect(screen.getByRole('button', { name: /Track reservations, payments, and the waitlist/ })).toBeTruthy();
});

test('the Reservations article next-steps link opens the transfers guide', async () => {
    renderAt('lesson=reservations');
    fireEvent.click(screen.getByRole('button', { name: 'Send a full ownership transfer' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Transferring Animal Ownership' })).toBeTruthy();
});
