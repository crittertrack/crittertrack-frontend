import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BudgetYearEndView from './BudgetYearEndView';
import apiClient from '../utils/apiClient';

jest.mock('../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn() } }));

const report = (year, over = {}) => ({
    year, totalCost: 30, totalRevenue: 100, net: 70, costCount: 1, saleCount: 2,
    byMonth: { 3: { cost: 30, revenue: 100, net: 70 } },
    costByCategory: { food: 30 },
    ...over,
});

const mockApi = (years, reports) => apiClient.get.mockImplementation((url) => {
    if (url === '/budget/report/year/all') return Promise.resolve({ data: { years } });
    const y = Number(String(url).split('/').pop());
    return Promise.resolve({ data: reports[y] || report(y) });
});

beforeEach(() => apiClient.get.mockReset());

describe('BudgetYearEndView', () => {
    it('loads the newest year first and shows totals, months and categories', async () => {
        mockApi([2026, 2025], {});
        render(<BudgetYearEndView />);
        await waitFor(() => expect(screen.getByTestId('year-end-earned')).toBeTruthy());

        expect(apiClient.get).toHaveBeenCalledWith('/budget/report/year/2026');
        expect(screen.getByTestId('year-end-earned').textContent).toContain('100');
        expect(screen.getByTestId('year-end-spent').textContent).toContain('30');
        expect(screen.getByTestId('year-end-net').textContent).toContain('Profit');
        expect(screen.getByTestId('year-end-average').textContent).toContain('50');
        expect(screen.getByTestId('year-end-months').textContent).toContain('Mar');
        expect(screen.getByTestId('year-end-categories').textContent).toContain('Food & supplies');
    });

    it('switches year', async () => {
        mockApi([2026, 2025], { 2025: report(2025, { totalRevenue: 500, net: 470 }) });
        render(<BudgetYearEndView />);
        await waitFor(() => expect(screen.getByTestId('year-end-year')).toBeTruthy());
        fireEvent.change(screen.getByTestId('year-end-year'), { target: { value: '2025' } });
        await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/budget/report/year/2025'));
        await waitFor(() => expect(screen.getByTestId('year-end-earned').textContent).toContain('500'));
    });

    it('shows a loss label and no average when nothing was sold', async () => {
        mockApi([2026], { 2026: report(2026, { totalRevenue: 0, saleCount: 0, net: -30 }) });
        render(<BudgetYearEndView />);
        await waitFor(() => expect(screen.getByTestId('year-end-net')).toBeTruthy());
        expect(screen.getByTestId('year-end-net').textContent).toContain('Loss');
        expect(screen.getByTestId('year-end-average').textContent).toContain('-');
    });

    it('says there is nothing to report when there are no transactions', async () => {
        mockApi([], {});
        render(<BudgetYearEndView />);
        await waitFor(() => expect(screen.getByTestId('year-end-empty')).toBeTruthy());
        expect(screen.queryByTestId('year-end-year')).toBeNull();
    });

    it('offers a retry when loading fails', async () => {
        apiClient.get.mockRejectedValue({ response: { status: 500 } });
        render(<BudgetYearEndView />);
        const retry = await screen.findByText('Retry');
        apiClient.get.mockImplementation((url) => Promise.resolve({ data: url === '/budget/report/year/all' ? { years: [2026] } : report(2026) }));
        fireEvent.click(retry);
        await waitFor(() => expect(screen.getByTestId('year-end-earned')).toBeTruthy());
    });
});
