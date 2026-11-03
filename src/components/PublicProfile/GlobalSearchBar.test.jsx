import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GlobalSearchBar from './GlobalSearchBar';
import apiClient from '../../utils/apiClient';

jest.mock('../../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn() }
}));

const RECENTS_KEY = 'crittertrack:global-search:recent:user-1';

beforeEach(() => {
    window.localStorage.clear();
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue({ data: [] });
});

it('shows, removes, and clears account-scoped recent searches', () => {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(['Fancy Rat', 'CTC123']));
    render(<GlobalSearchBar userId="user-1" onSelectUser={jest.fn()} onSelectAnimal={jest.fn()} />);

    fireEvent.focus(screen.getByPlaceholderText('Search users, animals, IDs...'));
    expect(screen.getByText('Fancy Rat')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Fancy Rat from recent searches' }));
    expect(JSON.parse(window.localStorage.getItem(RECENTS_KEY))).toEqual(['CTC123']);

    fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
    expect(JSON.parse(window.localStorage.getItem(RECENTS_KEY))).toEqual([]);
});

it('records a search and lets the user rerun it from recents', async () => {
    render(<GlobalSearchBar userId="user-1" onSelectUser={jest.fn()} onSelectAnimal={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search users, animals, IDs...');

    fireEvent.change(input, { target: { value: 'Fancy Rat' } });
    await waitFor(() => {
        expect(window.localStorage.getItem(RECENTS_KEY)).toBe(JSON.stringify(['Fancy Rat']));
    });

    fireEvent.change(input, { target: { value: '' } });
    await screen.findByRole('button', { name: 'Fancy Rat' });
    const searchCallsBeforeReplay = apiClient.get.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Fancy Rat' }));

    await waitFor(() => {
        expect(apiClient.get.mock.calls.length).toBeGreaterThan(searchCallsBeforeReplay);
    });
});
