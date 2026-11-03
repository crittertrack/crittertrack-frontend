import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BudgetUsageView from './BudgetUsageView';
import apiClient from '../utils/apiClient';

jest.mock('../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), delete: jest.fn() } }));

const payload = {
    entries: [
        { _id: 'u1', supplyName: 'Mash', quantity: 0.05, unit: 'kg', cost: 0.5, priced: true, date: '2026-03-01T00:00:00.000Z', source: 'feeding', animalId: 'CTC1' },
        { _id: 'u2', supplyName: 'Pellets', quantity: 20, unit: 'g', cost: 0, priced: false, date: '2026-03-02T00:00:00.000Z', source: 'litter', litterId: 'CTL1' },
    ],
    summary: { totalCost: 0.5, count: 2, unpricedCount: 1, unpricedSupplies: ['Pellets'], bySupply: [] },
};

beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.delete.mockReset();
    apiClient.get.mockResolvedValue({ data: payload });
    apiClient.delete.mockResolvedValue({ data: { message: 'Deleted', restored: true } });
});

describe('BudgetUsageView', () => {
    it('loads the current year and shows totals, entries and the unpriced warning', async () => {
        render(<BudgetUsageView showModalMessage={jest.fn()} />);
        await waitFor(() => expect(screen.getByTestId('usage-total')).toBeTruthy());

        expect(apiClient.get).toHaveBeenCalledWith(`/supplies/usage?year=${new Date().getFullYear()}`);
        expect(screen.getByTestId('usage-list').textContent).toContain('Mash');
        expect(screen.getByTestId('usage-list').textContent).toContain('no price');
        expect(screen.getByTestId('usage-unpriced').textContent).toMatch(/Pellets/);
    });

    it('requests all time when chosen', async () => {
        render(<BudgetUsageView showModalMessage={jest.fn()} />);
        await waitFor(() => expect(screen.getByTestId('usage-total')).toBeTruthy());
        fireEvent.change(screen.getByTestId('usage-year'), { target: { value: 'all' } });
        await waitFor(() => expect(apiClient.get).toHaveBeenLastCalledWith('/supplies/usage'));
    });

    it('removes an entry after confirmation and reloads', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        render(<BudgetUsageView showModalMessage={jest.fn()} />);
        await waitFor(() => expect(screen.getByTestId('usage-list')).toBeTruthy());

        fireEvent.click(screen.getAllByLabelText('Remove usage entry')[0]);
        await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith('/supplies/usage/u1'));
        await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
        window.confirm.mockRestore();
    });

    it('does not remove an entry when the confirmation is declined', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);
        render(<BudgetUsageView showModalMessage={jest.fn()} />);
        await waitFor(() => expect(screen.getByTestId('usage-list')).toBeTruthy());
        fireEvent.click(screen.getAllByLabelText('Remove usage entry')[0]);
        expect(apiClient.delete).not.toHaveBeenCalled();
        window.confirm.mockRestore();
    });

    it('shows an empty message and a retryable error', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { entries: [], summary: { totalCost: 0, count: 0, unpricedCount: 0, unpricedSupplies: [], bySupply: [] } } });
        const { unmount } = render(<BudgetUsageView showModalMessage={jest.fn()} />);
        await waitFor(() => expect(screen.getByTestId('usage-empty')).toBeTruthy());
        unmount();

        apiClient.get.mockRejectedValueOnce(new Error('boom'));
        apiClient.get.mockResolvedValueOnce({ data: payload });
        render(<BudgetUsageView showModalMessage={jest.fn()} />);
        fireEvent.click(await screen.findByText('Retry'));
        await waitFor(() => expect(screen.getByTestId('usage-total')).toBeTruthy());
    });
});
